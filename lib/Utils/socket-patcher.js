"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { jidNormalizedUser, jidDecode } = require("../WABinary");
const { generateMessageID, Personas } = require("./generics");
const { ActivityLogger } = require("./activity-logger");
const { getMediaInfo } = require("./media-info");
const { TaskQueue } = require("./task-queue");
const { ApiBridge, forwardToWebhook } = require("./api-bridge");

// In-memory cache for anti-delete & optimization
const messageCache = new Map();
const deletedMessages = new Map();
const CACHE_LIMIT = 2000;

let sharp;
try {
    sharp = require("sharp");
} catch (e) {}

// Prototype-based high-performance helpers to avoid closure overhead
const MessageHelpers = {
    reply(text, options = {}) { return this._conn.sendMessage(this.chat, { text }, { quoted: this, ...options }); },
    react(emoji) { return this._conn.sendMessage(this.chat, { react: { text: emoji, key: this.key } }); },
    forward(jid, options = {}) { return this._conn.sendMessage(jid, { forward: this }, { ...options }); },
    replyImage(urlOrBuffer, caption = "", options = {}) { return this._conn.sendMessage(this.chat, { image: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, caption }, { quoted: this, ...options }); },
    replyVideo(urlOrBuffer, caption = "", options = {}) { return this._conn.sendMessage(this.chat, { video: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, caption }, { quoted: this, ...options }); },
    replyAudio(urlOrBuffer, ptt = false, options = {}) { return this._conn.sendMessage(this.chat, { audio: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, ptt }, { quoted: this, ...options }); },
    replyDocument(urlOrBuffer, fileName, options = {}) { return this._conn.sendMessage(this.chat, { document: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, fileName }, { quoted: this, ...options }); },
    replyWithTyping(text, options = {}, duration = 1000) { return this._conn.sendMessage(this.chat, { text }, { simulateTyping: duration, quoted: this, ...options }); },
    replyWithVN(urlOrBuffer, options = {}, duration = 1500) { return this._conn.sendMessage(this.chat, { audio: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, ptt: true }, { simulateRecording: duration, quoted: this, ...options }); },
    
    replyInvoice(data, options = {}) { return this._conn.msg.sendInvoice(this.chat, data, { quoted: this, ...options }); },
    replyOrder(data, options = {}) { return this._conn.msg.sendOrder(this.chat, data, { quoted: this, ...options }); },
    replyComment(text, options = {}) { return this._conn.msg.sendComment(this.chat, text, this.key, { quoted: this, ...options }); },
    replyPollResult(votes, options = {}) { return this._conn.msg.sendPollResult(this.chat, votes, { quoted: this, ...options }); },
    replyQuizPoll(name, values, correctAnswerIndex = 0, options = {}) { return this._conn.msg.sendQuizPoll(this.chat, name, values, correctAnswerIndex, { quoted: this, ...options }); },
    replyPollResultSnapshot(name, votes, pollType = 0, options = {}) { return this._conn.msg.sendPollResultSnapshot(this.chat, name, votes, pollType, { quoted: this, ...options }); },
    replyNewsletterAdminInvite(invite, options = {}) { return this._conn.msg.sendNewsletterAdminInvite(this.chat, invite, { quoted: this, ...options }); },
    replyStatusMusic(text, music, options = {}) { return this._conn.msg.sendStatusMusic(text, music, { quoted: this, ...options }); },
    replyStatusWearable(text, glassesType = "RAY_BAN_META_GLASSES", options = {}) { return this._conn.msg.sendStatusWearable(text, glassesType, { quoted: this, ...options }); },
    replyStatusCloseFriends(content, options = {}) { return this._conn.msg.sendStatusCloseFriends(content, { quoted: this, ...options }); },
    replyStatusNotification(originalKey, notificationType = 2, options = {}) { return this._conn.msg.sendStatusNotification(this.chat, this.key, originalKey, notificationType, { quoted: this, ...options }); },
    replyStatusMention(quotedStatus, options = {}) { return this._conn.msg.sendStatusMention(this.chat, quotedStatus, { quoted: this, ...options }); },
    replyStatusStickerInteraction(stickerKey = "", type = 1, options = {}) { return this._conn.msg.sendStatusStickerInteraction(this.chat, this.key, stickerKey, type, { quoted: this, ...options }); },
    replyStatusQuestionAnswer(answerText, options = {}) { return this._conn.msg.sendStatusQuestionAnswer(this.chat, this.key, answerText, { quoted: this, ...options }); },
    replyStatusQuotedMessage(text, type = 1, thumbnail = null, options = {}) { return this._conn.msg.sendStatusQuotedMessage(this.chat, text, this.key, type, thumbnail, { quoted: this, ...options }); },
    replyPaymentRequest(amount, currency = "IDR", expirationSeconds = 86400, options = {}) { return this._conn.msg.sendPaymentRequest(this.chat, amount, currency, expirationSeconds, { quoted: this, ...options }); },
    replyDeclinePaymentRequest(requestKey, options = {}) { return this._conn.msg.declinePaymentRequest(this.chat, requestKey || this.key, options); },
    replyCancelPaymentRequest(requestKey, options = {}) { return this._conn.msg.cancelPaymentRequest(this.chat, requestKey || this.key, options); },
    replyGroupInvite(inviteCode, groupJid, groupName, caption = "", expirationInSeconds = 259200, thumbnail = null, options = {}) { return this._conn.msg.sendGroupInvite(this.chat, inviteCode, groupJid, groupName, caption, expirationInSeconds, thumbnail, { quoted: this, ...options }); },
    replyRequestPhoneNumber(options = {}) { return this._conn.msg.requestPhoneNumber(this.chat, { quoted: this, ...options }); },
    replyPlaceholder(type = 0, options = {}) { return this._conn.msg.sendPlaceholder(this.chat, type, { quoted: this, ...options }); },
    replyProduct(owner, data, options = {}) { return this._conn.msg.sendProduct(this.chat, owner, data, { quoted: this, ...options }); },
    replyLiveLocation(lat, lng, options = {}) { return this._conn.msg.sendLiveLocation(this.chat, { degreesLatitude: lat, degreesLongitude: lng }, { quoted: this, ...options }); },
    replyCallLog(data, options = {}) { return this._conn.msg.sendCallLog(this.chat, data, { quoted: this, ...options }); },
    replyStickerPack(pack, options = {}) { return this._conn.msg.sendStickerPack(this.chat, pack, { quoted: this, ...options }); },
    pin(duration = 86400, options = {}) { return this._conn.msg.pinMessage(this.chat, this.key, duration, { quoted: this, ...options }); },
    unpin(options = {}) { return this._conn.msg.unpinMessage(this.chat, this.key, { quoted: this, ...options }); },
    keep(options = {}) { return this._conn.msg.keepMessage(this.chat, this.key, 1, { quoted: this, ...options }); },
    undoKeep(options = {}) { return this._conn.msg.keepMessage(this.chat, this.key, 2, { quoted: this, ...options }); },
    replyQuestion(text, key, options = {}) { return this._conn.msg.replyQuestion(this.chat, text, key || this.key, { quoted: this, ...options }); },
    replySurvey(survey, options = {}) { return this._conn.msg.sendSurvey(this.chat, survey, { quoted: this, ...options }); },
    replyStatusQuestion(text, options = {}) { return this._conn.msg.sendStatusQuestion(text, { quoted: this, ...options }); },
    replyVideoNote(urlOrBuffer, options = {}) { return this._conn.msg.sendVideoNote(this.chat, urlOrBuffer, { quoted: this, ...options }); },
    replyImagePoll(name, optionsArray, options = {}) { return this._conn.msg.sendImagePoll(this.chat, name, optionsArray, { quoted: this, ...options }); },
    replyAIReminder(text, timestampMs, frequency = 1, options = {}) { return this._conn.msg.sendAIReminder(this.chat, text, timestampMs, frequency, { quoted: this, ...options }); },
    replyLottieSticker(urlOrBuffer, options = {}) { return this._conn.msg.sendLottieSticker(this.chat, urlOrBuffer, { quoted: this, ...options }); },
    replyAiSticker(urlOrBuffer, options = {}) { return this._conn.msg.sendAiSticker(this.chat, urlOrBuffer, { quoted: this, ...options }); },
    sendAiSticker(urlOrBuffer, options = {}) { return this.replyAiSticker(urlOrBuffer, options); },
    replyGroupEvent(event, options = {}) { return this._conn.msg.sendGroupEvent(this.chat, event, { quoted: this, ...options }); },
    replyAlbum(medias, options = {}) { return this._conn.msg.sendAlbum(this.chat, medias, { quoted: this, ...options }); },

    sendQuizPoll(name, values, correctAnswerIndex = 0, options = {}) { return this.replyQuizPoll(name, values, correctAnswerIndex, options); },
    sendPollResultSnapshot(name, votes, pollType = 0, options = {}) { return this.replyPollResultSnapshot(name, votes, pollType, options); },
    sendNewsletterAdminInvite(invite, options = {}) { return this.replyNewsletterAdminInvite(invite, options); },
    sendStatusMusic(text, music, options = {}) { return this.replyStatusMusic(text, music, options); },
    sendStatusWearable(text, glassesType = "RAY_BAN_META_GLASSES", options = {}) { return this.replyStatusWearable(text, glassesType, options); },
    sendStatusCloseFriends(content, options = {}) { return this.replyStatusCloseFriends(content, options); },
    sendStatusNotification(originalKey, notificationType = 2, options = {}) { return this.replyStatusNotification(originalKey, notificationType, options); },
    sendStatusMention(quotedStatus, options = {}) { return this.replyStatusMention(quotedStatus, options); },
    sendStatusStickerInteraction(stickerKey = "", type = 1, options = {}) { return this.replyStatusStickerInteraction(stickerKey, type, options); },
    sendStatusQuestionAnswer(answerText, options = {}) { return this.replyStatusQuestionAnswer(answerText, options); },
    sendStatusQuotedMessage(text, type = 1, thumbnail = null, options = {}) { return this.replyStatusQuotedMessage(text, type, thumbnail, options); },
    sendPaymentRequest(amount, currency = "IDR", expirationSeconds = 86400, options = {}) { return this.replyPaymentRequest(amount, currency, expirationSeconds, options); },
    declinePaymentRequest(requestKey, options = {}) { return this.replyDeclinePaymentRequest(requestKey, options); },
    cancelPaymentRequest(requestKey, options = {}) { return this.replyCancelPaymentRequest(requestKey, options); },
    sendGroupInvite(inviteCode, groupJid, groupName, caption = "", expirationInSeconds = 259200, thumbnail = null, options = {}) { return this.replyGroupInvite(inviteCode, groupJid, groupName, caption, expirationInSeconds, thumbnail, options); },
    requestPhoneNumber(options = {}) { return this.replyRequestPhoneNumber(options); },
    sendPlaceholder(type = 0, options = {}) { return this.replyPlaceholder(type, options); },
    sendGroupEvent(event, options = {}) { return this.replyGroupEvent(event, options); },
    sendAlbum(medias, options = {}) { return this.replyAlbum(medias, options); },
    pinMessage(duration = 86400, options = {}) { return this.pin(duration, options); },
    keepMessage(type = 1, options = {}) { return type === 1 ? this.keep(options) : this.undoKeep(options); },

    replyNewsletterFollowerInvite(invite, options = {}) { return this._conn.msg.sendNewsletterFollowerInvite(this.chat, invite, { quoted: this, ...options }); },
    sendNewsletterFollowerInvite(invite, options = {}) { return this.replyNewsletterFollowerInvite(invite, options); },
    replyContact(contact, options = {}) { return this._conn.msg.sendContact(this.chat, contact, { quoted: this, ...options }); },
    sendContact(contact, options = {}) { return this.replyContact(contact, options); },
    replyContactsArray(contacts, displayName = "", options = {}) { return this._conn.msg.sendContactsArray(this.chat, contacts, displayName, { quoted: this, ...options }); },
    sendContactsArray(contacts, displayName = "", options = {}) { return this.replyContactsArray(contacts, displayName, options); },
    replyLocation(location, options = {}) { return this._conn.msg.sendLocation(this.chat, location, { quoted: this, ...options }); },
    sendLocation(location, options = {}) { return this.replyLocation(location, options); },
    replyPaymentInvite(type = 1, options = {}) { return this._conn.msg.sendPaymentInvite(this.chat, type, { quoted: this, ...options }); },
    sendPaymentInvite(type = 1, options = {}) { return this.replyPaymentInvite(type, options); },
    replyBCall(bcall, options = {}) { return this._conn.msg.bcall(this.chat, bcall, { quoted: this, ...options }); },
    sendBCall(bcall, options = {}) { return this.replyBCall(bcall, options); },
    replyList(title, text, footer, buttonText, sections, options = {}) { return this._conn.msg.list(this.chat, title, text, footer, buttonText, sections, { quoted: this, ...options }); },
    sendList(title, text, footer, buttonText, sections, options = {}) { return this.replyList(title, text, footer, buttonText, sections, options); },
    replyCarousel(cards, options = {}) { return this._conn.msg.carousel(this.chat, cards, { quoted: this, ...options }); },
    sendCarousel(cards, options = {}) { return this.replyCarousel(cards, options); },
    
    replyEncEventResponse(eventKey, options = {}) { return this._conn.msg.sendEncEventResponse(this.chat, eventKey, { quoted: this, ...options }); },
    sendEncEventResponse(eventKey, options = {}) { return this.replyEncEventResponse(eventKey, options); },
    replyEncComment(targetKey, options = {}) { return this._conn.msg.sendEncComment(this.chat, targetKey, { quoted: this, ...options }); },
    sendEncComment(targetKey, options = {}) { return this.replyEncComment(targetKey, options); },
    replySecretEncrypted(targetKey, secretEncType = 1, options = {}) { return this._conn.msg.sendSecretEncrypted(this.chat, targetKey, secretEncType, { quoted: this, ...options }); },
    sendSecretEncrypted(targetKey, secretEncType = 1, options = {}) { return this.replySecretEncrypted(targetKey, secretEncType, options); },
    replyPollV4(poll, options = {}) { return this._conn.msg.sendPollV4(this.chat, poll, { quoted: this, ...options }); },
    sendPollV4(poll, options = {}) { return this.replyPollV4(poll, options); },
    replyPollResultSnapshotV3(name, votes, pollType = 0, options = {}) { return this._conn.msg.sendPollResultSnapshotV3(this.chat, name, votes, pollType, { quoted: this, ...options }); },
    sendPollResultSnapshotV3(name, votes, pollType = 0, options = {}) { return this.replyPollResultSnapshotV3(name, votes, pollType, options); },
    replyStatusAddYours(content, options = {}) { return this._conn.msg.sendStatusAddYours(content, { quoted: this, ...options }); },
    sendStatusAddYours(content, options = {}) { return this.replyStatusAddYours(content, options); },
    replyStatusGroupStatus(content, options = {}) { return this._conn.msg.sendStatusGroupStatus(content, { quoted: this, ...options }); },
    sendStatusGroupStatus(content, options = {}) { return this.replyStatusGroupStatus(content, options); },
    replyStatusGroupStatusV2(content, options = {}) { return this._conn.msg.sendStatusGroupStatusV2(content, { quoted: this, ...options }); },
    sendStatusGroupStatusV2(content, options = {}) { return this.replyStatusGroupStatusV2(content, options); },
    replyStatusGroupMention(content, options = {}) { return this._conn.msg.sendStatusGroupMention(content, { quoted: this, ...options }); },
    sendStatusGroupMention(content, options = {}) { return this.replyStatusGroupMention(content, options); },
    replyAssociatedChild(content, options = {}) { return this._conn.msg.sendAssociatedChild(this.chat, content, { quoted: this, ...options }); },
    sendAssociatedChild(content, options = {}) { return this.replyAssociatedChild(content, options); },

    replyTable(title, rows, opt = {}) { return this.aiTable(title, rows, opt); },
    replyCode(language, code, opt = {}) { return this.aiCode(language, code, opt); },
    replyReels(mainText, reels, opt = {}) { return this.aiReels(mainText, reels, opt); },
    replyGridImage(imgs, grid, opt) { return this._conn.msg.aiGridImage(this.chat, imgs, grid, { quoted: this, ...opt }); },
    replyInlineImage(url, txt, align, link, opt) { return this._conn.msg.aiInlineImage(this.chat, url, txt, align, link, { quoted: this, ...opt }); },
    replyDynamic(url, isGif = false, loopCount = 0, opt = {}) { return this.aiDynamic(url, isGif, loopCount, opt); },
    replyLatex(text, formulas, opt = {}) { return this.aiLatex(text, formulas, opt); },
    replyMap(lat, lng, annots, opt) { return this._conn.msg.aiMap(this.chat, lat, lng, annots, { quoted: this, ...opt }); },
    replyThinking(description, steps, opt = {}) { return this.aiThinking(description, steps, opt); },
    replyModel(text, modelType = 1, modelName = "Llama 3", opt = {}) { return this.aiModel(text, modelType, modelName, opt); },
    replyPrompts(text, prompts, opt = {}) { return this.aiPrompts(text, prompts, opt); },
    replyMemory(addedFacts = [], removedFacts = [], disclaimer = "", opt = {}) { return this.aiMemory("", addedFacts, removedFacts, disclaimer, opt); },
    replyQuota(remainingQuota, expirationSecs = 86400, opt = {}) { return this.aiQuota("", remainingQuota, expirationSecs, opt); },
    replyImagineMetadata(imagineType = 1, opt = {}) { return this.aiImagineMetadata("", imagineType, opt); },
    replyProgress(description, steps = [], opt = {}) { return this.aiProgress(description, steps, opt); },
    replyMessageOrigin(text = "", opt = {}) { return this.aiMessageOrigin(text, opt); },
    replySources(text = "", sources = [], opt = {}) {
        if (Array.isArray(text)) {
            sources = text;
            text = "";
        }
        return this.aiSources(text, sources, opt);
    },
    replyProductCarousel(products, opt = {}) { return this.productCarousel(products, opt); },
    
    aiIncognito(text, options = {}) { return this._conn.aiIncognito(this.chat, text, { quoted: this, ...options }); },
    replyIncognito(text, options = {}) { return this.aiIncognito(text, options); },
    aiRegenerate(targetKey, timestampMs = Date.now(), options = {}) { return this._conn.aiRegenerate(this.chat, targetKey, timestampMs, { quoted: this, ...options }); },
    replyRegenerate(targetKey, timestampMs = Date.now(), options = {}) { return this.aiRegenerate(targetKey, timestampMs, options); },
    aiTransparency(text, disclaimerText, hcaId = "", type = 1, options = {}) { return this._conn.aiTransparency(this.chat, text, disclaimerText, hcaId, type, { quoted: this, ...options }); },
    replyTransparency(text, disclaimerText, hcaId = "", type = 1, options = {}) { return this.aiTransparency(text, disclaimerText, hcaId, type, options); },
    aiAgeCollection(text, eligible = true, shouldTrigger = false, type = 0, options = {}) { return this._conn.aiAgeCollection(this.chat, text, eligible, shouldTrigger, type, { quoted: this, ...options }); },
    replyAgeCollection(text, eligible = true, shouldTrigger = false, type = 0, options = {}) { return this.aiAgeCollection(text, eligible, shouldTrigger, type, options); },
    aiVerification(text, proofs = [], options = {}) { return this._conn.aiVerification(this.chat, text, proofs, { quoted: this, ...options }); },
    replyVerification(text, proofs = [], options = {}) { return this.aiVerification(text, proofs, options); },
    aiUnifiedResponse(text, primaryResponseId, surveyCtaHasRendered = false, mediaDetails = [], options = {}) { return this._conn.aiUnifiedResponse(this.chat, text, primaryResponseId, surveyCtaHasRendered, mediaDetails, { quoted: this, ...options }); },
    replyUnifiedResponse(text, primaryResponseId, surveyCtaHasRendered = false, mediaDetails = [], options = {}) { return this.aiUnifiedResponse(text, primaryResponseId, surveyCtaHasRendered, mediaDetails, options); },
    aiAvatar(text, sentiment, behaviorGraph, action, intensity, wordCount, options = {}) { return this._conn.aiAvatar(this.chat, text, sentiment, behaviorGraph, action, intensity, wordCount, { quoted: this, ...options }); },
    replyAvatar(text, sentiment, behaviorGraph, action, intensity, wordCount, options = {}) { return this.aiAvatar(text, sentiment, behaviorGraph, action, intensity, wordCount, options); },
    aiLinkedAccounts(text, accounts = [], acAuthTokens = null, acErrorCode = 0, options = {}) { return this._conn.aiLinkedAccounts(this.chat, text, accounts, acAuthTokens, acErrorCode, { quoted: this, ...options }); },
    replyLinkedAccounts(text, accounts = [], acAuthTokens = null, acErrorCode = 0, options = {}) { return this.aiLinkedAccounts(text, accounts, acAuthTokens, acErrorCode, options); },
    aiMemu(text, faceImages = [], options = {}) { return this._conn.aiMemu(this.chat, text, faceImages, { quoted: this, ...options }); },
    replyMemu(text, faceImages = [], options = {}) { return this.aiMemu(text, faceImages, options); },
    aiPromotion(text, promotionType = 0, buttonTitle = "", options = {}) { return this._conn.aiPromotion(this.chat, text, promotionType, buttonTitle, { quoted: this, ...options }); },
    replyPromotion(text, promotionType = 0, buttonTitle = "", options = {}) { return this.aiPromotion(text, promotionType, buttonTitle, options); },
    aiModeSelection(text, modes = [], options = {}) { return this._conn.aiModeSelection(this.chat, text, modes, { quoted: this, ...options }); },
    replyModeSelection(text, modes = [], options = {}) { return this.aiModeSelection(text, modes, options); },
    aiSession(text, sessionId, sessionSource = 0, options = {}) { return this._conn.aiSession(this.chat, text, sessionId, sessionSource, { quoted: this, ...options }); },
    replySession(text, sessionId, sessionSource = 0, options = {}) { return this.aiSession(text, sessionId, sessionSource, options); },
    aiCapabilities(text, capabilities = [], options = {}) { return this._conn.aiCapabilities(this.chat, text, capabilities, { quoted: this, ...options }); },
    replyCapabilities(text, capabilities = [], options = {}) { return this.aiCapabilities(text, capabilities, options); },
    aiRendering(text, keywords = [], options = {}) { return this._conn.aiRendering(this.chat, text, keywords, { quoted: this, ...options }); },
    replyRendering(text, keywords = [], options = {}) { return this.aiRendering(text, keywords, options); },
    aiMetrics(text, destinationId = "", destinationEntryPoint = 0, threadOrigin = 1, options = {}) { return this._conn.aiMetrics(this.chat, text, destinationId, destinationEntryPoint, threadOrigin, { quoted: this, ...options }); },
    replyMetrics(text, destinationId = "", destinationEntryPoint = 0, threadOrigin = 1, options = {}) { return this.aiMetrics(text, destinationId, destinationEntryPoint, threadOrigin, options); },
    aiConversationContext(text, contextBytes, options = {}) { return this._conn.aiConversationContext(this.chat, text, contextBytes, { quoted: this, ...options }); },
    replyConversationContext(text, contextBytes, options = {}) { return this.aiConversationContext(text, contextBytes, options); },
    aiBotResponseId(text, botResponseId, options = {}) { return this._conn.aiBotResponseId(this.chat, text, botResponseId, { quoted: this, ...options }); },
    replyBotResponseId(text, botResponseId, options = {}) { return this.aiBotResponseId(text, botResponseId, options); },
    aiPersona(text, personaId, invokerJid = "", options = {}) { return this._conn.aiPersona(this.chat, text, personaId, invokerJid, { quoted: this, ...options }); },
    replyPersona(text, personaId, invokerJid = "", options = {}) { return this.aiPersona(text, personaId, invokerJid, options); },
    aiDisclaimer(text, disclaimerText, timezone = "", options = {}) { return this._conn.aiDisclaimer(this.chat, text, disclaimerText, timezone, { quoted: this, ...options }); },
    replyDisclaimer(text, disclaimerText, timezone = "", options = {}) { return this.aiDisclaimer(text, disclaimerText, timezone, options); },
    sendStatusExternalShare(text, share, options = {}) { return this._conn.msg.sendStatusExternalShare(text, share, { quoted: this, ...options }); },
    replyStatusExternalShare(text, share, options = {}) { return this.sendStatusExternalShare(text, share, options); },
    sendStatusAiCreated(text, source = 1, options = {}) { return this._conn.msg.sendStatusAiCreated(text, source, { quoted: this, ...options }); },
    replyStatusAiCreated(text, source = 1, options = {}) { return this.sendStatusAiCreated(text, source, options); },
    sendStatusReshare(text, reshare, options = {}) { return this._conn.msg.sendStatusReshare(text, reshare, { quoted: this, ...options }); },
    replyStatusReshare(text, reshare, options = {}) { return this.sendStatusReshare(text, reshare, options); },

    aiTable(title, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiTable(this.chat, title, ...args, options);
    },
    aiCode(language, code, opt = {}) {
        return this._conn.aiCode(this.chat, language, code, { quoted: this, ...opt });
    },
    aiReels(mainText, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiReels(this.chat, mainText, ...args, options);
    },
    aiGridImage(...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiGridImage(this.chat, ...args, options);
    },
    aiInlineImage(imageUrl, text = "", alignment = 0, tapLink = "", opt = {}) {
        return this._conn.aiInlineImage(this.chat, imageUrl, text, alignment, tapLink, { quoted: this, ...opt });
    },
    aiDynamic(url, isGif = false, loopCount = 0, opt = {}) {
        return this._conn.aiDynamic(this.chat, url, isGif, loopCount, { quoted: this, ...opt });
    },
    aiLatex(text, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiLatex(this.chat, text, ...args, options);
    },
    aiMap(lat, lng, annotations = [], opt = {}) {
        return this._conn.aiMap(this.chat, lat, lng, annotations, { quoted: this, ...opt });
    },
    aiThinking(description, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiThinking(this.chat, description, ...args, options);
    },
    aiFeedback(key, positive, text = "", opt = {}) {
        return this._conn.aiFeedback(this.chat, key, positive, text, { quoted: this, ...opt });
    },
    aiModel(text, modelType = 1, modelName = "Llama 3", opt = {}) {
        return this._conn.aiModel(this.chat, text, modelType, modelName, { quoted: this, ...opt });
    },
    aiPrompts(text, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiPrompts(this.chat, text, ...args, options);
    },
    aiMemory(text, addedFacts = [], removedFacts = [], disclaimer = "", opt = {}) {
        return this._conn.aiMemory(this.chat, text, addedFacts, removedFacts, disclaimer, { quoted: this, ...opt });
    },
    aiQuota(text, remainingQuota, expirationSecs = 86400, opt = {}) {
        return this._conn.aiQuota(this.chat, text, remainingQuota, expirationSecs, { quoted: this, ...opt });
    },
    aiImagineMetadata(text, imagineType = 1, opt = {}) {
        return this._conn.aiImagineMetadata(this.chat, text, imagineType, { quoted: this, ...opt });
    },
    aiProgress(description, steps = [], opt = {}) {
        return this._conn.aiProgress(this.chat, description, steps, { quoted: this, ...opt });
    },
    aiMessageOrigin(text, opt = {}) {
        return this._conn.aiMessageOrigin(this.chat, text, { quoted: this, ...opt });
    },
    aiSources(text, sources = [], opt = {}) {
        return this._conn.aiSources(this.chat, text, sources, { quoted: this, ...opt });
    },
    productCarousel(products, opt = {}) {
        return this._conn.productCarousel(this.chat, products, { quoted: this, ...opt });
    }
};
Object.setPrototypeOf(MessageHelpers, Object.prototype);

exports.patchSocket = (conn) => {
    // --- 👻 PHANTOM PROTOCOL ---
    conn.ghostMode = false;
    const vipList = new Set();
    conn.setVIP = (jid, status = true) => status ? vipList.add(jidNormalizedUser(jid)) : vipList.delete(jidNormalizedUser(jid));
    
    const originalReadMessages = conn.readMessages;
    conn.readMessages = async (keys) => {
        if (conn.ghostMode) {
            const shouldSkip = keys.some(k => !vipList.has(jidNormalizedUser(k.remoteJid)));
            if (shouldSkip) return;
        }
        return originalReadMessages.call(conn, keys);
    };

    // --- 🎭 PERSONA IDENTITY ---
    conn.setPersona = (type) => {
        const persona = Personas[type.toLowerCase()];
        if (persona) { conn.config.browser = persona; return true; }
        return false;
    };

    const cloneContent = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Buffer.isBuffer(obj)) return obj;
        if (obj.constructor && obj.constructor !== Object && obj.constructor !== Array) return obj;
        if (typeof obj.pipe === 'function') return obj;
        const clone = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clone[key] = typeof obj[key] === 'object' ? cloneContent(obj[key]) : obj[key];
            }
        }
        return clone;
    };

    const mediaCache = new Map();
    const crypto = require("crypto");
    const originalSendMessage = conn.sendMessage;
    const taskQueue = new TaskQueue(conn.logger);
    
    conn.sendMessage = async (jid, content, options = {}) => {
        return taskQueue.push(async () => {
            const currentContent = cloneContent(content);
            let typingDuration = 0;
            if (options.simulateTyping) {
                typingDuration = typeof options.simulateTyping === 'number' ? options.simulateTyping : 1000;
            } else if (conn.autoTyping && (currentContent?.text || currentContent?.conversation || currentContent?.extendedTextMessage || currentContent?.interactiveMessage)) {
                typingDuration = 1000;
            }

            let recordingDuration = 0;
            if (options.simulateRecording) {
                recordingDuration = typeof options.simulateRecording === 'number' ? options.simulateRecording : 1500;
            } else if (conn.autoRecord && currentContent?.audio) {
                recordingDuration = 1500;
            }

            if (typingDuration > 0) {
                if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('composing', jid).catch(() => {});
                await new Promise(r => setTimeout(r, typingDuration));
                if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('paused', jid).catch(() => {});
            } else if (recordingDuration > 0) {
                if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('recording', jid).catch(() => {});
                await new Promise(r => setTimeout(r, recordingDuration));
                if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('paused', jid).catch(() => {});
            }
            if (currentContent?.image && Buffer.isBuffer(currentContent.image) && sharp) {
                try {
                    currentContent.image = await sharp(currentContent.image).jpeg({ quality: 70 }).toBuffer();
                } catch (err) {}
            }
            const mediaType = ["image", "video", "audio", "document", "sticker"].find(t => currentContent && currentContent[t]);
            if (mediaType && (Buffer.isBuffer(currentContent[mediaType]) || currentContent[mediaType]?.url)) {
                const mediaData = Buffer.isBuffer(currentContent[mediaType]) ? currentContent[mediaType] : (currentContent[mediaType]?.url || "");
                const sha256 = crypto.createHash("sha256").update(mediaData).digest("hex");
                if (!mediaCache.has(sha256)) {
                    mediaCache.set(sha256, true);
                    if (mediaCache.size > 1000) mediaCache.delete(mediaCache.keys().next().value);
                }
            }
            return originalSendMessage.call(conn, jid, currentContent, options);
        });
    };

    const axios = require("axios");
    const fs = require("fs");

    const uploadToCatbox = async (buffer) => {
        const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
        const header = `--${boundary}\r\nContent-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n--${boundary}\r\nContent-Disposition: form-data; name="fileToUpload"; filename="image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
        const footer = `\r\n--${boundary}--\r\n`;
        const payload = Buffer.concat([
            Buffer.from(header, "utf-8"),
            buffer,
            Buffer.from(footer, "utf-8")
        ]);
        console.log("[DEBUG] Catbox upload started, size:", payload.length);
        const response = await axios.post("https://catbox.moe/user/api.php", payload, {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
                "Content-Length": payload.length
            },
            timeout: 10000
        });
        console.log("[DEBUG] Catbox upload completed:", response.data);
        return response.data.trim();
    };

    const uploadToUguu = async (buffer) => {
        const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
        const header = `--${boundary}\r\nContent-Disposition: form-data; name="files[]"; filename="file.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
        const footer = `\r\n--${boundary}--\r\n`;
        const payload = Buffer.concat([
            Buffer.from(header, "utf-8"),
            buffer,
            Buffer.from(footer, "utf-8")
        ]);
        console.log("[DEBUG] Uguu upload started, size:", payload.length);
        const response = await axios.post("https://uguu.se/upload", payload, {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
                "Content-Length": payload.length
            },
            timeout: 10000
        });
        console.log("[DEBUG] Uguu upload completed");
        if (response.data && response.data.success && response.data.files && response.data.files[0]) {
            return response.data.files[0].url.trim();
        }
        throw new Error("Uguu upload failed");
    };

    const uploadToPixeldrain = async (buffer) => {
        console.log("[DEBUG] Pixeldrain upload started, size:", buffer.length);
        const response = await axios.put("https://pixeldrain.com/api/file/file.jpg", buffer, {
            headers: {
                "Content-Type": "image/jpeg"
            },
            timeout: 10000
        });
        console.log("[DEBUG] Pixeldrain upload completed:", response.data);
        if (response.data && response.data.success && response.data.id) {
            return `https://pixeldrain.com/api/file/${response.data.id}`;
        }
        throw new Error("Pixeldrain upload failed");
    };

    const uploadAnywhere = async (buffer, mimeType) => {
        let ext = ".jpg";
        let mediaType = "image";
        if (mimeType) {
            if (mimeType.startsWith("video/")) {
                ext = ".mp4";
                mediaType = "video";
            } else if (mimeType.startsWith("audio/")) {
                ext = ".mp3";
                mediaType = "audio";
            }
        } else {
            const header = buffer.toString('ascii', 0, 16);
            if (header.includes("ftyp") || (buffer.length >= 4 && buffer.readUInt32BE(0) === 0x1A45DFA3)) {
                ext = ".mp4";
                mediaType = "video";
            }
        }
        const tempFilePath = "./temp-upload-" + Date.now() + "-" + Math.random().toString(36).substring(7) + ext;
        try {
            if (typeof conn.waUploadToServer === 'function') {
                const crypto = require('crypto');
                const fileEncSha256 = crypto.createHash('sha256').update(buffer).digest('base64');
                fs.writeFileSync(tempFilePath, buffer);
                console.log("[DEBUG] waUploadToServer started with temp file:", tempFilePath);
                const upload = await conn.waUploadToServer(tempFilePath, { mediaType, fileEncSha256B64: fileEncSha256, newsletter: true, timeoutMs: 10000 });
                console.log("[DEBUG] waUploadToServer completed with result:", upload);
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (err) {}
                if (upload) {
                    if (upload.directPath) return `https://mmg.whatsapp.net${upload.directPath}`;
                    if (upload.mediaUrl || upload.url) return upload.mediaUrl || upload.url;
                }
            } else {
                console.log("[DEBUG] conn.waUploadToServer is not a function!");
            }
        } catch (e) {
            console.log("[DEBUG] waUploadToServer failed:", e.message);
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (err) {}
        }
        console.log("[DEBUG] Falling back to public uploaders...");
        try {
            return await uploadToCatbox(buffer);
        } catch (e) {
            console.log("[DEBUG] Catbox fallback failed:", e.message);
            try {
                return await uploadToUguu(buffer);
            } catch (e2) {
                console.log("[DEBUG] Uguu fallback failed:", e2.message);
                try {
                    return await uploadToPixeldrain(buffer);
                } catch (e3) {
                    console.log("[DEBUG] Pixeldrain fallback failed:", e3.message);
                    throw new Error("All uploaders failed");
                }
            }
        }
    };

    const urlCache = new Map();
    const prepareMediaUrl = async (input, options = {}) => {
        const customUploader = options.uploader;
        if (!input) return "";
        console.log("[DEBUG] prepareMediaUrl started for:", typeof input === 'string' ? input.substring(0, 100) : "Buffer");
        if (typeof input === 'string') {
            if (input.startsWith('http://') || input.startsWith('https://')) {
                if (input.includes('.whatsapp.net') || input.includes('.fbcdn.net') || input.includes('.whatsapp.com')) {
                    console.log("[DEBUG] URL is already a WhatsApp/FB CDN URL, returning directly:", input);
                    return input;
                }
                
                const cacheKey = input + (customUploader ? '-custom' : '');
                if (urlCache.has(cacheKey)) {
                    console.log("[DEBUG] URL found in cache:", urlCache.get(cacheKey));
                    return urlCache.get(cacheKey);
                }

                try {
                    console.log("[DEBUG] Downloading external URL:", input);
                    const response = await axios.get(input, { responseType: 'arraybuffer', timeout: 5000 });
                    if (response.data) {
                        const fileBuffer = Buffer.from(response.data);
                        console.log("[DEBUG] Download completed. Uploading...");
                        const mime = response.headers['content-type'] || "";
                        const result = customUploader ? await customUploader(fileBuffer) : await uploadAnywhere(fileBuffer, mime);
                        if (result && result !== input) {
                            urlCache.set(cacheKey, result);
                        }
                        console.log("[DEBUG] Upload finished, result:", result);
                        return result;
                    }
                } catch (err) {
                    console.log("[DEBUG] Failed to download or upload external URL:", err.message);
                }
                return input;
            }
            try {
                if (fs.existsSync(input)) {
                    console.log("[DEBUG] Local file exists, uploading:", input);
                    const fileBuffer = fs.readFileSync(input);
                    const extname = input.split('.').pop().toLowerCase();
                    let mime = "";
                    if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(extname)) {
                        mime = "video/mp4";
                    } else if (['mp3', 'ogg', 'wav', 'm4a'].includes(extname)) {
                        mime = "audio/mp3";
                    }
                    return customUploader ? await customUploader(fileBuffer) : await uploadAnywhere(fileBuffer, mime);
                }
            } catch (err) {
                console.log("[DEBUG] Failed to upload local file:", err.message);
            }
            return input;
        }
        if (Buffer.isBuffer(input)) {
            try {
                console.log("[DEBUG] Buffer input, uploading...");
                return customUploader ? await customUploader(input) : await uploadAnywhere(input);
            } catch (err) {
                console.log("[DEBUG] Failed to upload Buffer:", err.message);
                return "";
            }
        }
        return input;
    };

    const originalRelayMessage = conn.relayMessage;
    conn.relayMessage = async (jid, content, options = {}) => {
        let richMsg = content?.botForwardedMessage?.message?.richResponseMessage;
        if (richMsg) {
            const mediaPromises = [];

            if (Array.isArray(richMsg.submessages)) {
                for (const sm of richMsg.submessages) {
                    if (sm.gridImageMetadata) {
                        if (sm.gridImageMetadata.gridImageUrl) {
                            mediaPromises.push((async () => sm.gridImageMetadata.gridImageUrl.imagePreviewUrl = await prepareMediaUrl(sm.gridImageMetadata.gridImageUrl.imagePreviewUrl, options))());
                            mediaPromises.push((async () => sm.gridImageMetadata.gridImageUrl.imageHighResUrl = await prepareMediaUrl(sm.gridImageMetadata.gridImageUrl.imageHighResUrl, options))());
                        }
                        if (Array.isArray(sm.gridImageMetadata.imageUrls)) {
                            for (const img of sm.gridImageMetadata.imageUrls) {
                                mediaPromises.push((async () => img.imagePreviewUrl = await prepareMediaUrl(img.imagePreviewUrl, options))());
                                mediaPromises.push((async () => img.imageHighResUrl = await prepareMediaUrl(img.imageHighResUrl, options))());
                            }
                        }
                    }
                    if (sm.imageMetadata?.imageUrl) {
                        mediaPromises.push((async () => sm.imageMetadata.imageUrl.imagePreviewUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imagePreviewUrl, options))());
                        mediaPromises.push((async () => sm.imageMetadata.imageUrl.imageHighResUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imageHighResUrl, options))());
                    }
                    if (sm.dynamicMetadata?.url) {
                        mediaPromises.push((async () => sm.dynamicMetadata.url = await prepareMediaUrl(sm.dynamicMetadata.url, options))());
                    }
                    if (sm.contentItemsMetadata?.itemsMetadata) {
                        for (const item of sm.contentItemsMetadata.itemsMetadata) {
                            if (item.reelItem) {
                                mediaPromises.push((async () => item.reelItem.thumbnailUrl = await prepareMediaUrl(item.reelItem.thumbnailUrl, options))());
                                mediaPromises.push((async () => item.reelItem.profileIconUrl = await prepareMediaUrl(item.reelItem.profileIconUrl, options))());
                            }
                        }
                    }
                }
            }

            let parsedUnifiedData = null;
            if (richMsg.unifiedResponse?.data) {
                try {
                    let data = richMsg.unifiedResponse.data;
                    parsedUnifiedData = typeof data === 'string' ? JSON.parse(data) : data;
                    if (parsedUnifiedData && Array.isArray(parsedUnifiedData.sections)) {
                        for (const sec of parsedUnifiedData.sections) {
                            const vm = sec.view_model;
                            if (!vm) continue;
                            if (vm.primitive) {
                                const prim = vm.primitive;
                                if (prim.media?.url) {
                                    mediaPromises.push((async () => prim.media.url = await prepareMediaUrl(prim.media.url, options))());
                                }
                                if (prim.url) {
                                    mediaPromises.push((async () => prim.url = await prepareMediaUrl(prim.url, options))());
                                }
                                if (prim.thumbnail_url) {
                                    mediaPromises.push((async () => prim.thumbnail_url = await prepareMediaUrl(prim.thumbnail_url, options))());
                                }
                            }
                            if (Array.isArray(vm.primitives)) {
                                for (const prim of vm.primitives) {
                                    if (prim.thumbnail_url) {
                                        mediaPromises.push((async () => prim.thumbnail_url = await prepareMediaUrl(prim.thumbnail_url, options))());
                                    }
                                    if (prim.avatar_url) {
                                        mediaPromises.push((async () => prim.avatar_url = await prepareMediaUrl(prim.avatar_url, options))());
                                    }
                                    if (prim.reels_url) {
                                        mediaPromises.push((async () => prim.reels_url = await prepareMediaUrl(prim.reels_url, options))());
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    conn.logger.error({ err }, "Error parsing unifiedResponse.data in relayMessage");
                }
            }

            await Promise.all(mediaPromises);

            if (parsedUnifiedData) {
                if (typeof richMsg.unifiedResponse.data === 'string') {
                    richMsg.unifiedResponse.data = JSON.stringify(parsedUnifiedData);
                } else {
                    richMsg.unifiedResponse.data = parsedUnifiedData;
                }
            }
        }
        return originalRelayMessage.call(conn, jid, content, options);
    };

    // --- ⚡ TURBO-LOADER: Plugin Optimizer ---
    conn.prefetchPlugins = async (dirPath) => {
        const fs = require("fs");
        const path = require("path");
        if (!fs.existsSync(dirPath)) return { error: "Directory not found" };
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".js") || f.endsWith(".cjs") || f.endsWith(".mjs"));
        const startTime = Date.now();
        for (const file of files) {
            try {
                const fullPath = path.resolve(dirPath, file);
                require(fullPath); // Pre-warm the cache
            } catch (err) {}
        }
        const duration = Date.now() - startTime;
        conn.logger.info({ duration, count: files.length }, "Turbo-Loader: Plugins pre-warmed");
        return { duration, count: files.length };
    };

    // --- 🚀 ADVANCED UI HELPERS (conn.msg) ---
    conn.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => conn.sendMessage(jid, { text, footer, buttons, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => {
            const mappedSections = (sections || []).map(sec => ({
                title: sec.title || "",
                highlight_label: sec.highlight_label,
                rows: (sec.rows || []).map(row => ({
                    header: row.header || "",
                    title: row.title || "",
                    id: row.id || row.rowId || "",
                    description: row.description || ""
                }))
            }));
            return conn.sendMessage(jid, {
                interactiveMessage: {
                    body: { text: text || "" },
                    footer: { text: footer || "" },
                    header: title ? { title: title, hasMediaAttachment: false } : undefined,
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: buttonText || "",
                                    sections: mappedSections
                                })
                            }
                        ]
                    }
                }
            }, options);
        },
        poll: (jid, name, values, selectableCount = 1, options = {}) => conn.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => conn.sendMessage(jid, { cards, text: options.text || "", footer: options.footer || "", contextInfo: options.contextInfo }, options),
        nativeTable: (jid, title, rows, options = {}) => conn.sendMessage(jid, {
            interactiveMessage: {
                body: { text: title },
                nativeFlowMessage: {
                    buttons: [{
                        name: "table",
                        buttonParamsJson: JSON.stringify({ title, rows })
                    }],
                    messageVersion: 1
                }
            }
        }, options),
        
        // --- 🤖 META AI RICH ENGINE ---
        aiRichMessage: async (jid, submessages, options = {}) => {
            const randomId = () => crypto.randomBytes(8).toString('hex');

            const mediaPromises = [];

            for (const sm of submessages) {
                if (sm.gridImageMetadata) {
                    if (sm.gridImageMetadata.gridImageUrl) {
                        mediaPromises.push((async () => sm.gridImageMetadata.gridImageUrl.imagePreviewUrl = await prepareMediaUrl(sm.gridImageMetadata.gridImageUrl.imagePreviewUrl, options))());
                        mediaPromises.push((async () => sm.gridImageMetadata.gridImageUrl.imageHighResUrl = await prepareMediaUrl(sm.gridImageMetadata.gridImageUrl.imageHighResUrl, options))());
                    }
                    if (Array.isArray(sm.gridImageMetadata.imageUrls)) {
                        for (const img of sm.gridImageMetadata.imageUrls) {
                            mediaPromises.push((async () => img.imagePreviewUrl = await prepareMediaUrl(img.imagePreviewUrl, options))());
                            mediaPromises.push((async () => img.imageHighResUrl = await prepareMediaUrl(img.imageHighResUrl, options))());
                        }
                    }
                }
                if (sm.imageMetadata?.imageUrl) {
                    mediaPromises.push((async () => sm.imageMetadata.imageUrl.imagePreviewUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imagePreviewUrl, options))());
                    mediaPromises.push((async () => sm.imageMetadata.imageUrl.imageHighResUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imageHighResUrl, options))());
                }
                if (sm.dynamicMetadata?.url) {
                    mediaPromises.push((async () => sm.dynamicMetadata.url = await prepareMediaUrl(sm.dynamicMetadata.url, options))());
                }
                if (sm.contentItemsMetadata?.itemsMetadata) {
                    for (const item of sm.contentItemsMetadata.itemsMetadata) {
                        if (item.reelItem) {
                            mediaPromises.push((async () => item.reelItem.thumbnailUrl = await prepareMediaUrl(item.reelItem.thumbnailUrl, options))());
                            mediaPromises.push((async () => item.reelItem.profileIconUrl = await prepareMediaUrl(item.reelItem.profileIconUrl, options))());
                        }
                    }
                }
            }

            await Promise.all(mediaPromises);

            const sections = [];
            for (const sm of submessages) {
                let primitive = {};
                switch(sm.messageType) {
                    case 1:
                        sm.gridImageMetadata.imageUrls.forEach(img => {
                            const url = img.imageHighResUrl || img.imagePreviewUrl;
                            const isVideo = img.mimeType?.startsWith('video/') || (typeof url === 'string' && url.split('?')[0].match(/\.(mp4|mkv|avi|mov|webm)$/i));
                            sections.push({ view_model: { primitive: { media: { url: url, mime_type: isVideo ? 'video/mp4' : 'image/jpeg' }, imagine_type: 3, status: { status: 'READY' }, __typename: "GenAIImaginePrimitive" }, __typename: "GenAISingleLayoutViewModel" } });
                        });
                        continue;
                    case 2: primitive = { text: sm.messageText, __typename: "GenAIMarkdownTextUXPrimitive" }; break;
                    case 3:
                        const inlineUrl = sm.imageMetadata.imageUrl.imagePreviewUrl;
                        const isVideoInline = sm.imageMetadata.mimeType?.startsWith('video/') || (typeof inlineUrl === 'string' && inlineUrl.split('?')[0].match(/\.(mp4|mkv|avi|mov|webm)$/i));
                        primitive = { media: { url: inlineUrl, mime_type: isVideoInline ? 'video/mp4' : 'image/jpeg' }, caption: sm.imageMetadata.imageText, imagine_type: 3, status: { status: 'READY' }, __typename: "GenAIImaginePrimitive" };
                        break;
                    case 4:
                        primitive = {
                            title: sm.tableMetadata.title,
                            rows: sm.tableMetadata.rows.map(r => ({
                                cells: r.items.map(cell => ({ text: String(cell) })),
                                style: r.isHeading ? "BOLD" : "NORMAL"
                            })),
                            __typename: "GenAITableUXPrimitive"
                        };
                        break;
                    case 5:
                        primitive = {
                            language: sm.codeMetadata.codeLanguage,
                            code: sm.codeMetadata.codeBlocks.map(b => b.codeContent).join(""),
                            __typename: "GenAICodeUXPrimitive"
                        };
                        break;
                    case 6: primitive = { url: sm.dynamicMetadata.url, thumbnail_url: sm.dynamicMetadata.url, type: sm.dynamicMetadata.type === 2 ? "GIF" : "IMAGE", __typename: "GenAIDynamicUXPrimitive" }; break;
                    case 7:
                        primitive = {
                            payload: {
                                center: {
                                    latitude: sm.mapMetadata.centerLatitude,
                                    longitude: sm.mapMetadata.centerLongitude
                                },
                                latitude_delta: sm.mapMetadata.latitudeDelta || 0.0122,
                                longitude_delta: sm.mapMetadata.longitudeDelta || 0.0122,
                                zoom: 15,
                                markers: sm.mapMetadata.annotations.map(a => ({
                                    latitude: a.latitude,
                                    longitude: a.longitude,
                                    title: a.title,
                                    description: a.body
                                }))
                            },
                            __typename: "GenAIMapUXPrimitive"
                        };
                        break;
                    case 8:
                        primitive = {
                            text: sm.latexMetadata.text || "",
                            formulas: sm.latexMetadata.expressions.map(e => e.latexExpression),
                            __typename: "GenAILatexUXPrimitive"
                        };
                        break;
                    case 9:
                        sections.push({
                            view_model: {
                                primitives: sm.contentItemsMetadata.itemsMetadata.map(item => ({
                                    reels_url: item.reelItem.videoUrl,
                                    thumbnail_url: item.reelItem.thumbnailUrl,
                                    creator: item.reelItem.title,
                                    avatar_url: item.reelItem.profileIconUrl,
                                    reels_title: item.reelItem.description || "Deskripsi video...",
                                    likes_count: 0,
                                    shares_count: 0,
                                    view_count: 0,
                                    reel_source: "IG",
                                    is_verified: false,
                                    __typename: "GenAIReelPrimitive"
                                })),
                                __typename: "GenAIHScrollLayoutViewModel"
                            }
                        });
                        continue;
                    default:
                        continue;
                }
                sections.push({ view_model: { primitive, __typename: "GenAISingleLayoutViewModel" } });
            }

            if (options.botMetadata?.progressIndicatorMetadata) { sections.unshift({ view_model: { primitive: { status: "GENERATING", display_text: options.botMetadata.progressIndicatorMetadata.progressDescription, __typename: "GenAIProgressPrimitive" }, __typename: "GenAISingleLayoutViewModel" } }); }

            const unifiedResponseData = { response_id: generateMessageID(), sections };

            const content = {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { pluginMetadata: {}, richResponseSourcesMetadata: options.sources ? { sources: options.sources } : undefined, ...options.botMetadata } },
                extendedTextMessage: {
                    text: options.fallbackText || "Sent via Meta AI",
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
                        forwardOrigin: 4,
                        ...(options.quoted ? { stanzaId: options.quoted.key.id, participant: options.quoted.key.participant || options.quoted.key.remoteJid, quotedMessage: options.quoted.message } : {}),
                        ...(options.contextInfo || {})
                    }
                },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1,
                            submessages,
                            unifiedResponse: { data: JSON.stringify(unifiedResponseData) },
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
                                forwardOrigin: 4,
                                ...(options.quoted ? { stanzaId: options.quoted.key.id, participant: options.quoted.key.participant || options.quoted.key.remoteJid, quotedMessage: options.quoted.message } : {}),
                                ...(options.contextInfo || {})
                            }
                        }
                    }
                }
            };

            await conn.relayMessage(jid, content, { messageId: options.messageId || generateMessageID(), ...options });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "AI_MSG" }, message: content };
        },

        aiTable: (jid, title, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            
            let realTitle = "Table";
            let rows = [];
            
            if (Array.isArray(title)) {
                if (args.length > 0) {
                    rows = [title, ...args];
                } else {
                    rows = [title];
                }
            } else {
                realTitle = title || "Table";
                if (args.length === 1 && Array.isArray(args[0]) && Array.isArray(args[0][0])) {
                    rows = args[0];
                } else if (args.length === 1 && Array.isArray(args[0])) {
                    rows = args[0];
                } else {
                    rows = args;
                }
            }

            const formattedRows = rows.map((r, idx) => {
                const items = Array.isArray(r) ? r : (r.cells || r.items || [r]);
                const isHeading = r.isHeading !== undefined ? r.isHeading : (idx === 0);
                return { items, isHeading };
            });
            
            let maxLens = [];
            formattedRows.forEach(row => {
                row.items.forEach((item, idx) => {
                    maxLens[idx] = Math.max(maxLens[idx] || 0, String(item).length);
                });
            });
            
            let tableText = `*${realTitle}*\n\`\`\`\n`;
            formattedRows.forEach((row, rowIdx) => {
                let rowCells = row.items.map((item, idx) => String(item).padEnd(maxLens[idx]));
                tableText += `| ${rowCells.join(" | ")} |\n`;
                if (row.isHeading || rowIdx === 0) {
                    let separators = maxLens.map(len => "-".repeat(len));
                    tableText += `| ${separators.join(" | ")} |\n`;
                }
            });
            tableText += `\`\`\``;

            return conn.msg.aiRichMessage(jid, [
                { messageType: 2, messageText: `*${realTitle}*` },
                { messageType: 4, tableMetadata: { title: realTitle, rows: formattedRows.map(r => ({ items: r.items, isHeading: r.isHeading })) } }
            ], { ...options, fallbackText: tableText.trim() });
        },
        aiCode: (jid, language, code, options = {}) => {
            if (code === undefined || (code && typeof code === 'object' && !Buffer.isBuffer(code) && Object.keys(options).length === 0)) {
                const actualOptions = (code && typeof code === 'object') ? code : options;
                code = language;
                language = "javascript";
                options = actualOptions;
            }
            const fallbackText = `\`\`\`\n${code}\n\`\`\``;
            return conn.msg.aiRichMessage(jid, [
                { messageType: 2, messageText: `*Code (${language}):*` },
                { messageType: 5, codeMetadata: { codeLanguage: language, codeBlocks: [{ highlightType: 0, codeContent: code }] } }
            ], { ...options, fallbackText });
        },
        aiGridImage: (jid, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let imageUrls = [];
            let gridImageUrl = null;
            if (args.length === 1 && Array.isArray(args[0])) {
                imageUrls = args[0];
            } else if (args.length === 2 && Array.isArray(args[0])) {
                imageUrls = args[0];
                gridImageUrl = args[1];
            } else {
                imageUrls = args.filter(x => typeof x === 'string');
            }
            const gridUrlObj = typeof gridImageUrl === 'string' ? { imagePreviewUrl: gridImageUrl, imageHighResUrl: gridImageUrl } : (gridImageUrl || { imagePreviewUrl: imageUrls[0], imageHighResUrl: imageUrls[0] });
            const formattedUrls = imageUrls.map(img => typeof img === 'string' ? { imagePreviewUrl: img, imageHighResUrl: img } : img);
            const fallbackText = `🖼️ *Grid Images:*\n` + formattedUrls.map((img, idx) => `- Image #${idx + 1}: ${img.imageHighResUrl || img.imagePreviewUrl}`).join("\n");
            return conn.msg.aiRichMessage(jid, [{
                messageType: 1,
                gridImageMetadata: {
                    gridImageUrl: gridUrlObj,
                    imageUrls: formattedUrls
                }
            }], { ...options, fallbackText });
        },
        aiInlineImage: (jid, imageUrl, text = "", alignment = 0, tapLink = "", options = {}) => {
            const imgUrlObj = typeof imageUrl === 'string' ? { imagePreviewUrl: imageUrl, imageHighResUrl: imageUrl } : (imageUrl || {});
            const fallbackText = `🖼️ *Image:*\n${text ? `${text}\n` : ""}Link: ${imgUrlObj.imageHighResUrl || imgUrlObj.imagePreviewUrl || ""}`;
            return conn.msg.aiRichMessage(jid, [{
                messageType: 3,
                imageMetadata: {
                    imageUrl: imgUrlObj,
                    imageText: text,
                    alignment: alignment,
                    tapLinkUrl: tapLink
                }
            }], { ...options, fallbackText });
        },
        aiDynamic: (jid, url, isGif = false, loopCount = 0, options = {}) => {
            const fallbackText = `🖼️ *Dynamic Media (${isGif ? "GIF" : "IMAGE"}):*\nLink: ${url}`;
            return conn.msg.aiRichMessage(jid, [{ messageType: 6, dynamicMetadata: { type: isGif ? 2 : 1, url: url, loopCount: loopCount, version: 1 } }], { ...options, fallbackText });
        },
        aiLatex: (jid, text, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let expressions = [];
            if (args.length === 1 && Array.isArray(args[0])) {
                expressions = args[0];
            } else {
                expressions = args;
            }
            const submessages = [];
            const headerText = text || "*Latex Formula:*";
            submessages.push({ messageType: 2, messageText: headerText });
            submessages.push({
                messageType: 8,
                latexMetadata: {
                    expressions: expressions.map(e => ({
                        latexExpression: typeof e === 'string' ? e : e.formula,
                        url: e.url || ""
                    }))
                }
            });
            const fallbackText = `${headerText}\n\n*Formulas:*\n` + expressions.map(e => {
                const expr = typeof e === 'string' ? e : e.formula || "";
                return `$$ ${expr} $$`;
            }).join("\n");
            return conn.msg.aiRichMessage(jid, submessages, { ...options, fallbackText });
        },
        aiMap: (jid, lat, lng, annotations = [], options = {}) => {
            const mappedAnnotations = annotations.map((a, idx) => ({
                annotationNumber: a.annotationNumber || (idx + 1),
                latitude: a.latitude || lat,
                longitude: a.longitude || lng,
                title: a.title || "",
                body: a.body || ""
            }));
            const headerText = annotations[0] ? `*${annotations[0].title || "Map Location"}*` : "*Map Location*";
            const fallbackText = annotations[0] ? `*${annotations[0].title}*\n${annotations[0].body}\nhttps://maps.google.com/?q=${lat},${lng}` : `https://maps.google.com/?q=${lat},${lng}`;
            return conn.msg.aiRichMessage(jid, [
                { messageType: 2, messageText: headerText },
                {
                    messageType: 7,
                    mapMetadata: {
                        centerLatitude: lat,
                        centerLongitude: lng,
                        latitudeDelta: options.latitudeDelta || 0.0122,
                        longitudeDelta: options.longitudeDelta || 0.0122,
                        annotations: mappedAnnotations
                    }
                }
            ], { ...options, fallbackText });
        },
        aiThinking: async (jid, description, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let steps = [];
            if (args.length === 1 && Array.isArray(args[0])) {
                steps = args[0];
            } else {
                steps = args;
            }
            const mappedSteps = steps.map((s, idx) => {
                if (typeof s === 'string') {
                    const status = idx === steps.length - 1 ? 2 : 3;
                    return { statusTitle: s, statusBody: "", status };
                }
                return {
                    statusTitle: s.title || s.statusTitle || "",
                    statusBody: s.body || s.statusBody || "",
                    status: s.status || 2
                };
            });
            const fallbackText = `🧠 *[ THINKING ]*\n_${description}_\n\n` + mappedSteps.map(s => {
                const icon = s.status === 1 ? "✅" : s.status === 2 ? "⏳" : "❌";
                return `${icon} *${s.statusTitle}*${s.statusBody ? `\n   ${s.statusBody}` : ""}`;
            }).join("\n");
            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: description }], { ...options, fallbackText, botMetadata: { progressIndicatorMetadata: { progressDescription: description, stepsMetadata: mappedSteps } } });
        },
        aiModel: async (jid, text, modelType = 1, modelName = "Llama 3", options = {}) => {
            const fallbackText = `🤖 *[ MODEL: ${modelName} ]*\n${text}`;
            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], { ...options, fallbackText, botMetadata: { modelMetadata: { modelType: modelType, modelNameOverride: modelName } } });
        },
        aiPrompts: async (jid, text, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let prompts = [];
            if (args.length === 1 && Array.isArray(args[0])) {
                prompts = args[0];
            } else {
                prompts = args;
            }
            const suggestions = prompts.map(p => ({ prompt: typeof p === 'string' ? p : p.prompt, promptId: p.promptId || "prompt_" + Date.now() + Math.floor(Math.random() * 1000) }));
            const fallbackText = `${text}\n\n*Suggestions:*\n` + suggestions.map((s, idx) => `${idx + 1}. ${s.prompt}`).join("\n");
            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], { ...options, fallbackText, botMetadata: { suggestedPromptMetadata: { suggestedPrompts: suggestions.map(s => s.prompt), promptSuggestions: { suggestions: suggestions } } } });
        },
        aiReels: (jid, mainText, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let reels = [];
            if (args.length === 1 && Array.isArray(args[0])) {
                reels = args[0];
            } else {
                reels = args;
            }
            const defaultThumb = "https://files.catbox.moe/gw41eq.png";
            const reelItems = reels.map(item => {
                const videoUrl = typeof item === 'string' ? item : item.videoUrl;
                const title = item.title || "Video Reels";
                const description = item.description || "";
                const thumbnailUrl = item.thumbnailUrl || defaultThumb;
                const profileIconUrl = item.profileIconUrl || defaultThumb;
                return {
                    reelItem: { title, profileIconUrl, thumbnailUrl, videoUrl, description }
                };
            });
            const sources = reels.map((item, idx) => {
                const videoUrl = typeof item === 'string' ? item : item.videoUrl;
                return {
                    provider: "UNKNOWN",
                    thumbnailCDNURL: "",
                    sourceProviderURL: videoUrl,
                    sourceQuery: "",
                    faviconCDNURL: "",
                    citationNumber: idx + 1,
                    sourceTitle: ""
                };
            });
            const fallbackText = `${mainText}\n\n` + reelItems.map((r, idx) => `🎥 *Reel #${idx + 1}: ${r.reelItem.title}*\n${r.reelItem.description}\nLink: ${r.reelItem.videoUrl}`).join("\n\n");
            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: mainText }, { messageType: 9, contentItemsMetadata: { contentType: 1, itemsMetadata: reelItems } }], { ...options, fallbackText, sources });
        },
        aiMemory: (jid, text, addedFacts = [], removedFacts = [], disclaimer = "", options = {}) => conn.sendMessage(jid, { text, contextInfo: options.contextInfo, messageContextInfo: { botMetadata: { memoryMetadata: { addedFacts: addedFacts.map((f, i) => ({ fact: f, factId: "fact_" + Date.now() + "_" + i })), removedFacts: removedFacts.map((f, i) => ({ fact: f, factId: "fact_" + Date.now() + "_" + i })), disclaimer } } } }, options),
        aiQuota: (jid, text, remainingQuota, expirationSecs = 86400, options = {}) => conn.sendMessage(jid, { text, contextInfo: options.contextInfo, messageContextInfo: { botMetadata: { botQuotaMetadata: { botFeatureQuotaMetadata: [{ featureType: 1, remainingQuota, expirationTimestamp: Math.floor(Date.now() / 1000) + expirationSecs }] } } } }, options),
        aiImagineMetadata: (jid, text, imagineType = 1, options = {}) => conn.sendMessage(jid, { text, contextInfo: options.contextInfo, messageContextInfo: { botMetadata: { imagineMetadata: { imagineType } } } }, options),
        aiProgress: (jid, description, steps = [], options = {}) => conn.sendMessage(jid, { text: description, contextInfo: options.contextInfo, messageContextInfo: { botMetadata: { progressIndicatorMetadata: { progressDescription: description, stepsMetadata: steps.map(s => ({ statusTitle: s.title, statusBody: s.body || "", status: s.status || 2, isReasoning: s.isReasoning || false, isEnhancedSearch: s.isEnhancedSearch || false })) } } } }, options),
        aiMessageOrigin: (jid, text, options = {}) => conn.sendMessage(jid, { text, contextInfo: options.contextInfo, messageContextInfo: { botMetadata: { botMessageOriginMetadata: { origins: [{ type: 0 }] } } } }, options),
        aiSources: (jid, text, sources = [], options = {}) => conn.sendMessage(jid, { text, contextInfo: options.contextInfo, messageContextInfo: { botMetadata: { richResponseSourcesMetadata: { sources: sources.map((s, idx) => ({ provider: s.provider || 1, thumbnailCdnUrl: s.thumbnail || "", sourceProviderUrl: s.url, sourceQuery: s.query || "", faviconCdnUrl: s.favicon || "", citationNumber: s.citationNumber || (idx + 1), sourceTitle: s.title })) } } } }, options),
        aiFeedback: (jid, key, positive, text = "", options = {}) => conn.sendMessage(jid, { botFeedbackMessage: { messageKey: key, kind: positive ? 0 : 14, text } }, options),
        productCarousel: (jid, products, options = {}) => {
            const cards = products.map(p => ({
                product: {
                    productId: p.productId,
                    title: p.title || "",
                    description: p.description || "",
                    currencyCode: p.currencyCode || "IDR",
                    priceAmount1000: p.price ? p.price * 1000 : 0,
                    salePriceAmount1000: p.salePrice ? p.salePrice * 1000 : undefined,
                    url: p.url || "",
                    productImage: p.image
                },
                businessOwnerJid: p.businessOwnerJid || conn.user?.id || conn.user?.jid,
                title: p.title || "",
                body: p.body || "",
                footer: p.footer || "",
                buttons: p.buttons ? p.buttons.map(b => ({ name: b.name || "quick_reply", buttonParamsJson: JSON.stringify(b.params || {}) })) : undefined
            }));
            return conn.sendMessage(jid, { cards, text: options.text || "", footer: options.footer || "", contextInfo: options.contextInfo }, options);
        },

        // --- 🚀 CONVENIENCE NATIVE ALIASES ---
        createEvent: (jid, event, options) => conn.sendMessage(jid, { eventMessage: event }, options),
        scheduleCall: (jid, call, options) => conn.sendMessage(jid, { scheduledCallCreationMessage: call }, options),
        bcall: (jid, bcall, options) => conn.sendMessage(jid, { bcallMessage: { ...bcall, masterKey: bcall.masterKey || Buffer.alloc(32) } }, options),
        sendSurvey: (jid, survey, options = {}) => {
            const buildSurveyMetadata = (s = {}) => {
                const randomId = () => Math.random().toString(36).substring(2, 15);
                const simonSessionId = s.simonSessionId || s.simonSessionFbid || randomId();
                const tessaSessionId = s.tessaSessionId || s.simonSessionFbid || randomId();
                const simonSurveyId = s.simonSurveyId || String(s.surveyId || "12345");
                const requestId = s.requestId || s.responseOtid || randomId();

                const invitationHeaderText = s.invitationHeaderText || "Bantu Kami Meningkatkan Layanan";
                const invitationBodyText = s.invitationBodyText || "Silakan berikan masukan Anda melalui survei singkat ini.";
                const invitationCtaText = s.invitationCtaText || "Mulai Survei";
                
                const surveyTitle = s.surveyTitle || "Survei Kepuasan";
                const surveyContinueButtonText = s.surveyContinueButtonText || "Lanjut";
                const surveySubmitButtonText = s.surveySubmitButtonText || "Kirim";

                let questions = [];
                if (s.questions && Array.isArray(s.questions) && s.questions.length > 0) {
                    questions = s.questions.map((q, idx) => {
                        const qOptions = (q.questionOptions || []).map((o, oIdx) => ({
                            stringValue: o.stringValue || String(oIdx + 1),
                            numericValue: typeof o.numericValue === 'number' ? o.numericValue : (oIdx + 1),
                            textTranslated: o.textTranslated || o.stringValue || String(oIdx + 1)
                        }));
                        return {
                            questionText: q.questionText || "Pertanyaan?",
                            questionId: q.questionId || `q${idx + 1}`,
                            questionOptions: qOptions
                        };
                    });
                } else {
                    questions = [
                        {
                            questionId: "q1",
                            questionText: "Bagaimana kualitas pelayanan kami?",
                            questionOptions: [
                                { stringValue: "1", numericValue: 1, textTranslated: "Sangat Buruk" },
                                { stringValue: "2", numericValue: 2, textTranslated: "Buruk" },
                                { stringValue: "3", numericValue: 3, textTranslated: "Cukup" },
                                { stringValue: "4", numericValue: 4, textTranslated: "Baik" },
                                { stringValue: "5", numericValue: 5, textTranslated: "Sangat Baik" }
                            ]
                        },
                        {
                            questionId: "q2",
                            questionText: "Apakah Anda bersedia merekomendasikan kami kepada teman Anda?",
                            questionOptions: [
                                { stringValue: "1", numericValue: 1, textTranslated: "Ya, pasti" },
                                { stringValue: "2", numericValue: 2, textTranslated: "Mungkin" },
                                { stringValue: "3", numericValue: 3, textTranslated: "Tidak" }
                            ]
                        }
                    ];
                }

                return {
                    tessaSessionId,
                    simonSessionId,
                    simonSurveyId,
                    requestId,
                    invitationHeaderText,
                    invitationBodyText,
                    invitationCtaText,
                    surveyTitle,
                    questions,
                    surveyContinueButtonText,
                    surveySubmitButtonText,
                    tessaRootId: s.tessaRootId || randomId(),
                    tessaEvent: s.tessaEvent || "survey_invitation",
                    feedbackToastText: s.feedbackToastText || "Terima kasih atas masukan Anda!",
                    privacyStatementFull: s.privacyStatementFull || "Tanggapan Anda aman dan rahasia.",
                    privacyStatementParts: s.privacyStatementParts || []
                };
            };
            const metadata = buildSurveyMetadata(survey);
            const text = metadata.invitationBodyText || "Silakan berikan masukan Anda melalui survei singkat ini.";
            return conn.sendMessage(jid, {
                text,
                messageContextInfo: {
                    botMetadata: {
                        inThreadSurveyMetadata: metadata
                    }
                }
            }, options);
        },
        sendStickerPack: (jid, pack, options = {}) => {
            const stickers = (pack.stickers || []).map(s => ({
                fileName: s.fileName || "",
                isAnimated: !!s.isAnimated,
                emojis: Array.isArray(s.emojis) ? s.emojis : (s.emojis ? [s.emojis] : []),
                accessibilityLabel: s.accessibilityLabel || "",
                isLottie: !!s.isLottie,
                mimetype: s.mimetype || "image/webp"
            }));
            const content = {
                stickerPackMessage: {
                    stickerPackId: pack.id || pack.stickerPackId || "",
                    name: pack.name || "",
                    publisher: pack.publisher || "",
                    stickers,
                    caption: pack.caption || "",
                    packDescription: pack.description || pack.packDescription || "",
                    stickerPackOrigin: pack.origin !== undefined ? pack.origin : 0
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendQuizPoll: (jid, name, values, correctAnswerIndex = 0, options = {}) => {
            const pollOptions = values.map(val => ({ optionName: val }));
            const correctAnswer = pollOptions[correctAnswerIndex] || pollOptions[0];
            const content = {
                pollCreationMessage: {
                    name,
                    options: pollOptions,
                    selectableOptionsCount: 1,
                    pollType: 1, // QUIZ
                    correctAnswer,
                    contextInfo: options.contextInfo
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendPollResultSnapshot: (jid, name, votes, pollType = 0, options = {}) => {
            let pollVotes = [];
            if (Array.isArray(votes)) {
                pollVotes = votes.map(v => {
                    if (typeof v === 'string') {
                        return { optionName: v, optionVoteCount: 0 };
                    }
                    return {
                        optionName: v.optionName || v.name || "",
                        optionVoteCount: v.optionVoteCount !== undefined ? v.optionVoteCount : (v.count || 0)
                    };
                });
            } else if (typeof votes === 'object' && votes !== null) {
                pollVotes = Object.entries(votes).map(([optionName, optionVoteCount]) => ({
                    optionName,
                    optionVoteCount: Number(optionVoteCount)
                }));
            }
            const content = {
                pollResultSnapshotMessage: {
                    name,
                    pollVotes,
                    pollType,
                    contextInfo: options.contextInfo
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendNewsletterAdminInvite: (jid, invite, options = {}) => {
            const content = {
                newsletterAdminInviteMessage: {
                    newsletterJid: invite.newsletterJid || jid,
                    newsletterName: invite.newsletterName || "Admin Invite",
                    jpegThumbnail: invite.jpegThumbnail || invite.thumbnail || null,
                    caption: invite.caption || "",
                    inviteExpiration: invite.inviteExpiration || Math.floor(Date.now() / 1000) + (86400 * 7),
                    contextInfo: options.contextInfo
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusMusic: (text, music, options = {}) => {
            const attribution = {
                type: 2, // MUSIC
                attributionData: {
                    music: {
                        authorName: music.authorName || "",
                        songId: music.songId || "",
                        title: music.title || "",
                        author: music.author || music.authorName || "",
                        artistAttribution: music.artistAttribution || music.authorName || "",
                        isExplicit: !!music.isExplicit
                    }
                }
            };
            const content = {
                extendedTextMessage: {
                    text,
                    contextInfo: {
                        statusAttributionType: 0,
                        statusAttributions: [attribution]
                    }
                }
            };
            return conn.relayMessage('status@broadcast', content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusWearable: (text, glassesType = "RAY_BAN_META_GLASSES", options = {}) => {
            let source = 1; // RAY_BAN_META_GLASSES
            if (glassesType === "OAKLEY_META_GLASSES" || glassesType === 2) source = 2;
            if (glassesType === "HYPERNOVA_GLASSES" || glassesType === 3) source = 3;
            
            const attribution = {
                type: 4, // WEARABLE
                attributionData: {
                    rlAttribution: {
                        source
                    }
                }
            };
            const content = {
                extendedTextMessage: {
                    text,
                    contextInfo: {
                        statusAttributionType: 0,
                        statusAttributions: [attribution]
                    }
                }
            };
            return conn.relayMessage('status@broadcast', content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusExternalShare: (text, share, options = {}) => {
            const attribution = {
                type: 2, // EXTERNAL_SHARE
                attributionData: {
                    externalShare: {
                        actionUrl: share.actionUrl || "",
                        source: Number(share.source) || 0,
                        duration: Number(share.duration) || 0,
                        actionFallbackUrl: share.actionFallbackUrl || ""
                    }
                }
            };
            const content = {
                extendedTextMessage: {
                    text,
                    contextInfo: {
                        statusAttributionType: 0,
                        statusAttributions: [attribution]
                    }
                }
            };
            return conn.relayMessage('status@broadcast', content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusAiCreated: (text, source = 1, options = {}) => {
            const attribution = {
                type: 7, // AI_CREATED
                attributionData: {
                    aiCreatedAttribution: {
                        source: Number(source) || 1
                    }
                }
            };
            const content = {
                extendedTextMessage: {
                    text,
                    contextInfo: {
                        statusAttributionType: 0,
                        statusAttributions: [attribution]
                    }
                }
            };
            return conn.relayMessage('status@broadcast', content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusReshare: (text, reshare, options = {}) => {
            const attribution = {
                type: 1, // RESHARE
                attributionData: {
                    statusReshare: {
                        source: Number(reshare.source) || 0,
                        metadata: reshare.metadata ? {
                            duration: Number(reshare.metadata.duration) || 0,
                            channelJid: reshare.metadata.channelJid || "",
                            channelMessageId: Number(reshare.metadata.channelMessageId) || 0,
                            hasMultipleReshares: !!reshare.metadata.hasMultipleReshares
                        } : undefined
                    }
                }
            };
            const content = {
                extendedTextMessage: {
                    text,
                    contextInfo: {
                        statusAttributionType: 0,
                        statusAttributions: [attribution]
                    }
                }
            };
            return conn.relayMessage('status@broadcast', content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusCloseFriends: (content, options = {}) => {
            let baseMessage = typeof content === 'string' ? { extendedTextMessage: { text: content } } : content;
            const messageKey = Object.keys(baseMessage)[0];
            if (messageKey && baseMessage[messageKey]) {
                baseMessage[messageKey].contextInfo = {
                    ...baseMessage[messageKey].contextInfo,
                    statusAudienceMetadata: {
                        audienceType: 1 // CLOSE_FRIENDS
                    }
                };
            }
            return conn.relayMessage('status@broadcast', baseMessage, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendInvoice: (jid, invoice, options) => conn.sendMessage(jid, { invoiceMessage: invoice }, options),
        sendOrder: (jid, order, options) => conn.sendMessage(jid, { orderMessage: order }, options),
        sendComment: (jid, text, key, options) => conn.sendMessage(jid, { commentMessage: { message: { conversation: text }, targetMessageKey: key } }, options),
        sendPollResult: (jid, pollResult, options) => conn.sendMessage(jid, { pollResultSnapshotMessage: pollResult }, options),
        sendStatusNotification: (jid, responseKey, originalKey, notificationType = 2, options = {}) => {
            const content = {
                statusNotificationMessage: {
                    responseMessageKey: responseKey,
                    originalMessageKey: originalKey,
                    type: notificationType
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusMention: (jid, quotedStatus, options = {}) => {
            const content = {
                statusMentionMessage: {
                    quotedStatus: quotedStatus.message || quotedStatus
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusStickerInteraction: (jid, statusKey, stickerKey = "", type = 1, options = {}) => {
            const content = {
                statusStickerInteractionMessage: {
                    key: statusKey,
                    stickerKey,
                    type
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusQuestionAnswer: (jid, questionKey, answerText, options = {}) => {
            const content = {
                statusQuestionAnswerMessage: {
                    key: questionKey,
                    text: answerText
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusQuotedMessage: (jid, text, originalStatusId, type = 1, thumbnail = null, options = {}) => {
            const content = {
                statusQuotedMessage: {
                    type,
                    text,
                    thumbnail,
                    originalStatusId
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendPaymentRequest: (jid, amount, currency = "IDR", expirationSeconds = 86400, options = {}) => {
            const content = {
                requestPaymentMessage: {
                    currencyCodeIso4217: currency,
                    amount1000: amount * 1000,
                    requestFrom: jid,
                    expiryTimestamp: Math.floor(Date.now() / 1000) + expirationSeconds,
                    amount: {
                        value: amount * 1000,
                        offset: 1000,
                        currencyCode: currency
                    }
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        declinePaymentRequest: (jid, requestKey, options = {}) => {
            const content = {
                declinePaymentRequestMessage: {
                    key: requestKey
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        cancelPaymentRequest: (jid, requestKey, options = {}) => {
            const content = {
                cancelPaymentRequestMessage: {
                    key: requestKey
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendGroupInvite: (jid, inviteCode, groupJid, groupName, caption = "", expirationInSeconds = 259200, thumbnail = null, options = {}) => {
            const content = {
                groupInviteMessage: {
                    inviteCode,
                    groupJid,
                    groupName,
                    caption,
                    inviteExpiration: Math.floor(Date.now() / 1000) + expirationInSeconds,
                    jpegThumbnail: thumbnail,
                    contextInfo: options.contextInfo
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        requestPhoneNumber: (jid, options = {}) => {
            const content = {
                requestPhoneNumberMessage: {
                    contextInfo: options.contextInfo
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendPlaceholder: (jid, type = 0, options = {}) => {
            const content = {
                placeholderMessage: {
                    type
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendProduct: (jid, businessOwnerJid, product, options) => conn.sendMessage(jid, { productMessage: { product, businessOwnerJid } }, options),
        sendLiveLocation: (jid, liveLocation, options) => conn.sendMessage(jid, { liveLocationMessage: liveLocation }, options),
        replyQuestion: (jid, text, key, options) => conn.sendMessage(jid, { questionResponseMessage: { key, text } }, options),
        quoteStatus: (jid, status, options) => conn.sendMessage(jid, { statusQuotedMessage: status }, options),
        interactStatusSticker: (jid, interaction, options) => conn.sendMessage(jid, { statusStickerInteractionMessage: interaction }, options),
        pinMessage: async (jid, key, durationInSeconds = 86400, options = {}) => {
            const content = {
                pinInChatMessage: {
                    key,
                    type: 1, // PIN_FOR_ALL
                    senderTimestampMs: Date.now()
                },
                messageContextInfo: {
                    messageAddOnDurationInSecs: durationInSeconds
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "PIN_MSG" }, message: content };
        },
        unpinMessage: async (jid, key, options = {}) => {
            const content = {
                pinInChatMessage: {
                    key,
                    type: 2, // UNPIN_FOR_ALL
                    senderTimestampMs: Date.now()
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "UNPIN_MSG" }, message: content };
        },
        keepMessage: async (jid, key, keepType = 1, options = {}) => {
            const content = {
                keepInChatMessage: {
                    key,
                    keepType,
                    timestampMs: Date.now()
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "KEEP_MSG" }, message: content };
        },
        sendStatusQuestion: (text, options) => conn.sendMessage('status@broadcast', { statusQuestionAnswerMessage: { text } }, options),
        sendCallLog: (jid, call, options) => conn.sendMessage(jid, { callLogMesssage: call }, options),
        sendHistoryNotice: (jid, notice, options) => conn.sendMessage(jid, { messageHistoryNotice: notice }, options),
        sendChatBundle: (jid, bundle, options) => conn.sendMessage(jid, { messageHistoryBundle: { ...bundle, mimetype: 'application/octet-stream', mediaKeyTimestamp: Math.floor(Date.now() / 1000) } }, options),
        sendEncReaction: (jid, enc, options) => conn.sendMessage(jid, { encReactionMessage: enc }, options),
        syncStickers: (hashes, source = "manual", options) => conn.sendMessage(conn.user.id, { stickerSyncRmrMessage: { filehash: hashes, rmrSource: source, requestTimestamp: Math.floor(Date.now() / 1000) } }, options),
        requestResend: (key, options) => conn.sendMessage(key.remoteJid, { protocolMessage: { key: key, type: 5, placeholderMessageResendRequest: [{ messageKey: key }] } }, options),
        sendPaymentInvite: (jid, type = 1, options) => conn.sendMessage(jid, { paymentInviteMessage: { serviceType: type, expiryTimestamp: Math.floor(Date.now() / 1000) + 86400 } }, options),
        sendPollV5: (jid, poll, options) => conn.sendMessage(jid, { pollCreationMessageV5: poll }, options),
        sendVideoNote: async (jid, pathOrBuffer, options = {}) => {
            const { prepareWAMessageMedia } = require("./messages");
            const media = await prepareWAMessageMedia({ video: pathOrBuffer }, {
                upload: conn.waUploadToServer,
                mediaType: 'video',
                ...options
            });
            if (!media.videoMessage) throw new Error("Failed to prepare video message");
            const ptvMessage = {
                ...media.videoMessage,
                gifPlayback: false
            };
            await conn.relayMessage(jid, { ptvMessage }, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "PTV_MSG" }, message: { ptvMessage } };
        },
        sendImagePoll: async (jid, name, optionsArray, options = {}) => {
            const formattedOptions = [];
            for (const opt of optionsArray) {
                let imgUrl = null;
                if (opt.image) {
                    imgUrl = await prepareMediaUrl(opt.image, options);
                }
                formattedOptions.push({
                    optionName: opt.text,
                    optionImage: imgUrl ? { imagePreviewUrl: imgUrl, imageHighResUrl: imgUrl } : null
                });
            }
            const content = {
                pollCreationOptionImageMessage: {
                    name,
                    options: formattedOptions,
                    selectableOptionsCount: options.selectableCount || 1
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "POLL_IMG" }, message: content };
        },
        editScheduledCall: async (jid, callKey, title, timestampMs, editType = 2, callType = 1, options = {}) => {
            const content = {
                scheduledCallEditMessage: {
                    key: callKey,
                    editMessage: {
                        callType,
                        title,
                        scheduledTimestampMs: timestampMs
                    },
                    editType
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "CALL_EDIT" }, message: content };
        },
        sendAIReminder: async (jid, text, timestampMs, frequency = 1, options = {}) => {
            const content = {
                extendedTextMessage: { text: `⏰ *AI Reminder:* "${text}"` }
            };
            const botMetadata = {
                reminderMetadata: {
                    action: 2, // CREATE
                    name: text,
                    nextTriggerTimestamp: Math.floor(timestampMs / 1000),
                    frequency
                }
            };
            const fullContent = {
                ...content,
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata
                }
            };
            await conn.relayMessage(jid, fullContent, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "AI_REMIND" }, message: fullContent };
        },
        sendLottieSticker: async (jid, pathOrBuffer, options = {}) => {
            const { prepareWAMessageMedia } = require("./messages");
            const media = await prepareWAMessageMedia({ sticker: pathOrBuffer }, {
                upload: conn.waUploadToServer,
                mediaType: 'sticker',
                ...options
            });
            if (!media.stickerMessage) throw new Error("Failed to prepare sticker message");
            const content = {
                lottieStickerMessage: {
                    ...media.stickerMessage
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "LOTTIE_STICKER" }, message: content };
        },
        sendAiSticker: async (jid, pathOrBuffer, options = {}) => {
            const { prepareWAMessageMedia } = require("./messages");
            const media = await prepareWAMessageMedia({ sticker: pathOrBuffer }, {
                upload: conn.waUploadToServer,
                mediaType: 'sticker',
                ...options
            });
            if (!media.stickerMessage) throw new Error("Failed to prepare sticker message");
            const content = {
                stickerMessage: {
                    ...media.stickerMessage,
                    isAiSticker: true
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "AI_STICKER" }, message: content };
        },
        sendGroupEvent: async (jid, event, options = {}) => {
            const content = {
                eventMessage: {
                    name: event.name || "",
                    description: event.description || "",
                    startTime: event.startTime,
                    endTime: event.endTime,
                    location: event.location, // LocationMessage structure
                    joinLink: event.joinLink || "",
                    isCanceled: event.isCanceled || false,
                    isScheduleCall: event.isScheduleCall || false,
                    hasReminder: event.hasReminder || false,
                    reminderOffsetSec: event.reminderOffsetSec || 0,
                    extraGuestsAllowed: event.extraGuestsAllowed || false,
                    contextInfo: options.contextInfo
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "EVENT_MSG" }, message: content };
        },
        sendAlbum: async (jid, medias, options = {}) => {
            const imageCount = medias.filter(m => m.image).length;
            const videoCount = medias.filter(m => m.video).length;
            const albumMessageId = options.messageId || generateMessageID();
            const albumKey = { remoteJid: jid, fromMe: true, id: albumMessageId };
            
            const albumPlaceholder = {
                albumMessage: {
                    expectedImageCount: imageCount,
                    expectedVideoCount: videoCount,
                    contextInfo: options.contextInfo
                }
            };
            await conn.relayMessage(jid, albumPlaceholder, { messageId: albumMessageId });
            
            let index = 0;
            const results = [];
            for (const media of medias) {
                const mediaId = generateMessageID();
                const type = media.image ? 'image' : 'video';
                const { prepareWAMessageMedia } = require("./messages");
                const upload = conn.waUploadToServer;
                const mediaObject = media.image ? { image: media.image } : { video: media.video };
                const prepared = await prepareWAMessageMedia(mediaObject, {
                    upload,
                    mediaType: type,
                    ...options
                });
                
                const key = type === 'image' ? 'imageMessage' : 'videoMessage';
                if (!prepared[key]) throw new Error(`Failed to prepare ${type} message for album`);
                if (media.caption) prepared[key].caption = media.caption;
                
                const content = {
                    [key]: prepared[key],
                    messageContextInfo: {
                        messageAssociation: {
                            associationType: 1, // MEDIA_ALBUM
                            parentMessageKey: albumKey,
                            messageIndex: index
                        }
                    }
                };
                await conn.relayMessage(jid, content, {
                    messageId: mediaId,
                    ...options
                });
                results.push({ key: { remoteJid: jid, fromMe: true, id: mediaId }, message: content });
                index++;
            }
            return { albumKey, medias: results };
        },
        sendNewsletterFollowerInvite: (jid, invite, options = {}) => {
            const content = {
                newsletterFollowerInviteMessageV2: {
                    newsletterJid: invite.newsletterJid || jid,
                    newsletterName: invite.newsletterName || "Follow Invite",
                    jpegThumbnail: invite.jpegThumbnail || invite.thumbnail || null,
                    caption: invite.caption || "",
                    contextInfo: options.contextInfo
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendContact: (jid, contact, options = {}) => {
            const content = {
                contactMessage: {
                    displayName: contact.displayName || contact.name || "",
                    vcard: contact.vcard || ""
                }
            };
            return conn.sendMessage(jid, content, options);
        },
        sendContactsArray: (jid, contacts, displayName = "", options = {}) => {
            const formattedContacts = contacts.map(c => ({
                displayName: c.displayName || c.name || "",
                vcard: c.vcard || ""
            }));
            const content = {
                contactsArrayMessage: {
                    displayName: displayName || (formattedContacts[0]?.displayName ? `${formattedContacts[0].displayName} & others` : "Contacts"),
                    contacts: formattedContacts
                }
            };
            return conn.sendMessage(jid, content, options);
        },
        sendLocation: (jid, location, options = {}) => {
            const content = {
                locationMessage: {
                    degreesLatitude: location.degreesLatitude || location.latitude || 0,
                    degreesLongitude: location.degreesLongitude || location.longitude || 0,
                    name: location.name || "",
                    address: location.address || "",
                    url: location.url || "",
                    comment: location.comment || "",
                    jpegThumbnail: location.jpegThumbnail || location.thumbnail || null
                }
            };
            return conn.sendMessage(jid, content, options);
        },
        sendEncEventResponse: (jid, eventKey, options = {}) => {
            const content = {
                encEventResponseMessage: {
                    eventCreationMessageKey: eventKey,
                    encPayload: options.encPayload || Buffer.alloc(0),
                    encIv: options.encIv || Buffer.alloc(0)
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendEncComment: (jid, targetKey, options = {}) => {
            const content = {
                encCommentMessage: {
                    targetMessageKey: targetKey,
                    encPayload: options.encPayload || Buffer.alloc(0),
                    encIv: options.encIv || Buffer.alloc(0)
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendSecretEncrypted: (jid, targetKey, secretEncType = 1, options = {}) => {
            const content = {
                secretEncryptedMessage: {
                    targetMessageKey: targetKey,
                    encPayload: options.encPayload || Buffer.alloc(0),
                    encIv: options.encIv || Buffer.alloc(0),
                    secretEncType
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendPollV4: (jid, poll, options = {}) => {
            const content = {
                pollCreationMessageV4: poll
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendPollResultSnapshotV3: (jid, name, votes, pollType = 0, options = {}) => {
            let pollVotes = [];
            if (Array.isArray(votes)) {
                pollVotes = votes.map(v => {
                    if (typeof v === 'string') {
                        return { optionName: v, optionVoteCount: 0 };
                    }
                    return {
                        optionName: v.optionName || v.name || "",
                        optionVoteCount: v.optionVoteCount !== undefined ? v.optionVoteCount : (v.count || 0)
                    };
                });
            } else if (typeof votes === 'object' && votes !== null) {
                pollVotes = Object.entries(votes).map(([optionName, optionVoteCount]) => ({
                    optionName,
                    optionVoteCount: Number(optionVoteCount)
                }));
            }
            const content = {
                pollResultSnapshotMessageV3: {
                    name,
                    pollVotes,
                    pollType,
                    contextInfo: options.contextInfo
                }
            };
            return conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusAddYours: (content, options = {}) => {
            let baseMessage = typeof content === 'string' ? { extendedTextMessage: { text: content } } : content;
            const contentMsg = {
                statusAddYours: {
                    message: baseMessage
                }
            };
            return conn.relayMessage('status@broadcast', contentMsg, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusGroupStatus: (content, options = {}) => {
            let baseMessage = typeof content === 'string' ? { extendedTextMessage: { text: content } } : content;
            const contentMsg = {
                groupStatusMessage: {
                    message: baseMessage
                }
            };
            return conn.relayMessage('status@broadcast', contentMsg, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusGroupStatusV2: (content, options = {}) => {
            let baseMessage = typeof content === 'string' ? { extendedTextMessage: { text: content } } : content;
            const contentMsg = {
                groupStatusMessageV2: {
                    message: baseMessage
                }
            };
            return conn.relayMessage('status@broadcast', contentMsg, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendStatusGroupMention: (content, options = {}) => {
            let baseMessage = typeof content === 'string' ? { extendedTextMessage: { text: content } } : content;
            const contentMsg = {
                groupStatusMentionMessage: {
                    message: baseMessage
                }
            };
            return conn.relayMessage('status@broadcast', contentMsg, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        sendAssociatedChild: (jid, content, options = {}) => {
            let baseMessage = typeof content === 'string' ? { extendedTextMessage: { text: content } } : content;
            const contentMsg = {
                associatedChildMessage: {
                    message: baseMessage
                }
            };
            return conn.relayMessage(jid, contentMsg, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
        },
        aiIncognito: (jid, text, options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        botThreadInfo: {
                            clientInfo: {
                                type: 2 // INCOGNITO
                            }
                        }
                    }
                }
            }, options);
        },
        aiRegenerate: (jid, targetKey, timestampMs = Date.now(), options = {}) => {
            return conn.sendMessage(jid, {
                text: "",
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        regenerateMetadata: {
                            messageKey: targetKey,
                            responseTimestampMs: timestampMs
                        }
                    }
                }
            }, options);
        },
        aiTransparency: (jid, text, disclaimerText, hcaId = "", type = 1, options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        sessionTransparencyMetadata: {
                            disclaimerText,
                            hcaId,
                            sessionTransparencyType: type
                        }
                    }
                }
            }, options);
        },
        aiAgeCollection: (jid, text, eligible = true, shouldTrigger = false, type = 0, options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        botAgeCollectionMetadata: {
                            ageCollectionEligible: eligible,
                            shouldTriggerAgeCollectionOnClient: shouldTrigger,
                            ageCollectionType: type
                        }
                    }
                }
            }, options);
        },
        aiVerification: (jid, text, proofs = [], options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        verificationMetadata: {
                            proofs
                        }
                    }
                }
            }, options);
        },
        aiUnifiedResponse: (jid, text, primaryResponseId, surveyCtaHasRendered = false, mediaDetails = [], options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        unifiedResponseMutation: {
                            sbsMetadata: {
                                primaryResponseId,
                                surveyCtaHasRendered
                            },
                            mediaDetailsMetadataList: mediaDetails
                        }
                    }
                }
            }, options);
        },
        aiAvatar: (jid, text, sentiment, behaviorGraph, action, intensity, wordCount, options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        avatarMetadata: {
                            sentiment: Number(sentiment) || 0,
                            behaviorGraph: behaviorGraph || "",
                            action: Number(action) || 0,
                            intensity: Number(intensity) || 0,
                            wordCount: Number(wordCount) || 0
                        }
                    }
                }
            }, options);
        },
        aiLinkedAccounts: (jid, text, accounts = [], acAuthTokens = null, acErrorCode = 0, options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        botLinkedAccountsMetadata: {
                            accounts: accounts.map(a => ({ type: Number(a.type) || 0 })),
                            acAuthTokens: typeof acAuthTokens === 'string' ? Buffer.from(acAuthTokens) : (acAuthTokens || Buffer.alloc(0)),
                            acErrorCode: Number(acErrorCode) || 0
                        }
                    }
                }
            }, options);
        },
        aiMemu: (jid, text, faceImages = [], options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        memuMetadata: {
                            faceImages: faceImages.map(img => ({
                                fileSha256: img.fileSha256 || "",
                                mediaKey: img.mediaKey || "",
                                fileEncSha256: img.fileEncSha256 || "",
                                directPath: img.directPath || "",
                                mediaKeyTimestamp: Number(img.mediaKeyTimestamp) || 0,
                                mimetype: img.mimetype || "",
                                orientationType: Number(img.orientationType) || 1
                            }))
                        }
                    }
                }
            }, options);
        },
        aiPromotion: (jid, text, promotionType = 0, buttonTitle = "", options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        botPromotionMessageMetadata: {
                            promotionType: Number(promotionType) || 0,
                            buttonTitle: buttonTitle || ""
                        }
                    }
                }
            }, options);
        },
        aiModeSelection: (jid, text, modes = [], options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        botModeSelectionMetadata: {
                            mode: modes.map(m => Number(m) || 0)
                        }
                    }
                }
            }, options);
        },
        aiSession: (jid, text, sessionId, sessionSource = 0, options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        sessionMetadata: {
                            sessionId: sessionId || "",
                            sessionSource: Number(sessionSource) || 0
                        }
                    }
                }
            }, options);
        },
        aiCapabilities: (jid, text, capabilities = [], options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        capabilityMetadata: {
                            capabilities: capabilities.map(c => Number(c) || 0)
                        }
                    }
                }
            }, options);
        },
        aiRendering: (jid, text, keywords = [], options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        renderingMetadata: {
                            keywords: keywords.map(kw => ({
                                value: kw.value || "",
                                associatedPrompts: kw.associatedPrompts || []
                            }))
                        }
                    }
                }
            }, options);
        },
        aiMetrics: (jid, text, destinationId = "", destinationEntryPoint = 0, threadOrigin = 1, options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        botMetricsMetadata: {
                            destinationId: destinationId || "",
                            destinationEntryPoint: Number(destinationEntryPoint) || 0,
                            threadOrigin: Number(threadOrigin) || 1
                        }
                    }
                }
            }, options);
        },
        aiConversationContext: (jid, text, contextBytes, options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        aiConversationContext: typeof contextBytes === 'string' ? Buffer.from(contextBytes) : contextBytes
                    }
                }
            }, options);
        },
        aiBotResponseId: (jid, text, botResponseId, options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        botResponseId: botResponseId || ""
                    }
                }
            }, options);
        },
        aiPersona: (jid, text, personaId, invokerJid = "", options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        personaId: personaId || "",
                        invokerJid: invokerJid || undefined
                    }
                }
            }, options);
        },
        aiDisclaimer: (jid, text, disclaimerText, timezone = "", options = {}) => {
            return conn.sendMessage(jid, {
                text,
                contextInfo: options.contextInfo,
                messageContextInfo: {
                    botMetadata: {
                        messageDisclaimerText: disclaimerText || "",
                        timezone: timezone || undefined
                    }
                }
            }, options);
        }
    };

    // --- 1. LIGHTWEIGHT & RESPONSIVE: Auto Optimizer ---
    conn.autoOptimize = () => { if (conn.store) { conn.store.chats.clear(); conn.store.messages = {}; } if (global.gc) global.gc(); };

    // --- 6. EASY TO USE: smsg helper ---
    conn.smsg = (m) => {
        if (!m) return m;
        Object.assign(m, MessageHelpers);
        if (m.key) { 
            m.id = m.key?.id; 
            m.isMe = m.key.fromMe; 
            m.chat = m.key.remoteJid; 
            m.isGroup = m.chat?.endsWith("@g.us"); 
            m.sender = jidNormalizedUser(m.isMe ? (conn.user?.id || conn.user?.jid) : (m.key.participant || m.chat)); 
        }
        m.text = m.message ? (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || m.message.templateButtonReplyMessage?.selectedId || m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || "") : "";
        const prefix = /^[./!#]/.test(m.text) ? m.text.charAt(0) : ""; m.prefix = prefix; m.isCommand = !!prefix;
        const body = m.isCommand ? m.text.slice(1).trim() : m.text.trim();
        const args = body.split(/\s+/); m.command = args.shift()?.toLowerCase(); m.args = args; m.query = args.join(" ");
        
        Object.defineProperty(m, '_conn', {
            value: conn,
            enumerable: false,
            writable: true,
            configurable: true
        });
        return m;
    };

    global.smsg = conn.smsg;
    conn.aiTable = conn.msg.aiTable; conn.aiCode = conn.msg.aiCode; conn.aiReels = conn.msg.aiReels; conn.aiGridImage = conn.msg.aiGridImage; conn.aiInlineImage = conn.msg.aiInlineImage; conn.aiDynamic = conn.msg.aiDynamic; conn.aiLatex = conn.msg.aiLatex; conn.aiMap = conn.msg.aiMap; conn.aiThinking = conn.msg.aiThinking; conn.aiFeedback = conn.msg.aiFeedback; conn.aiModel = conn.msg.aiModel; conn.aiPrompts = conn.msg.aiPrompts; conn.aiRichMessage = conn.msg.aiRichMessage;
    conn.aiMemory = conn.msg.aiMemory; conn.aiQuota = conn.msg.aiQuota; conn.aiImagineMetadata = conn.msg.aiImagineMetadata; conn.aiProgress = conn.msg.aiProgress; conn.aiMessageOrigin = conn.msg.aiMessageOrigin; conn.aiSources = conn.msg.aiSources; conn.productCarousel = conn.msg.productCarousel;
    conn.aiIncognito = conn.msg.aiIncognito; conn.aiRegenerate = conn.msg.aiRegenerate; conn.aiTransparency = conn.msg.aiTransparency; conn.aiAgeCollection = conn.msg.aiAgeCollection; conn.aiVerification = conn.msg.aiVerification; conn.aiUnifiedResponse = conn.msg.aiUnifiedResponse;
    conn.aiAvatar = conn.msg.aiAvatar; conn.aiLinkedAccounts = conn.msg.aiLinkedAccounts; conn.aiMemu = conn.msg.aiMemu; conn.aiPromotion = conn.msg.aiPromotion; conn.aiModeSelection = conn.msg.aiModeSelection;
    conn.aiSession = conn.msg.aiSession; conn.aiCapabilities = conn.msg.aiCapabilities; conn.aiRendering = conn.msg.aiRendering; conn.aiMetrics = conn.msg.aiMetrics;
    conn.aiConversationContext = conn.msg.aiConversationContext; conn.aiBotResponseId = conn.msg.aiBotResponseId; conn.aiPersona = conn.msg.aiPersona; conn.aiDisclaimer = conn.msg.aiDisclaimer;
    conn.sendStatusExternalShare = conn.msg.sendStatusExternalShare; conn.sendStatusAiCreated = conn.msg.sendStatusAiCreated; conn.sendStatusReshare = conn.msg.sendStatusReshare;
    conn.react = (jid, emoji, key) => conn.sendMessage(jid, { react: { text: emoji, key: key } });
    conn.simulateTyping = async (jid, durationMs = 1000) => {
        if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('composing', jid).catch(() => {});
        await new Promise(r => setTimeout(r, durationMs));
        if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('paused', jid).catch(() => {});
    };
    conn.simulateRecording = async (jid, durationMs = 1500) => {
        if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('recording', jid).catch(() => {});
        await new Promise(r => setTimeout(r, durationMs));
        if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('paused', jid).catch(() => {});
    };
    conn.createEvent = conn.msg.createEvent; conn.scheduleCall = conn.msg.scheduleCall; conn.bcall = conn.msg.bcall; conn.sendSurvey = conn.msg.sendSurvey; conn.sendStickerPack = conn.msg.sendStickerPack; conn.sendInvoice = conn.msg.sendInvoice; conn.sendOrder = conn.msg.sendOrder; conn.sendComment = conn.msg.sendComment; conn.sendPollResult = conn.msg.sendPollResult; conn.sendProduct = conn.msg.sendProduct; conn.sendLiveLocation = conn.msg.sendLiveLocation; conn.replyQuestion = conn.msg.replyQuestion; conn.quoteStatus = conn.msg.quoteStatus; conn.interactStatusSticker = conn.msg.interactStatusSticker; conn.pinMessage = conn.msg.pinMessage; conn.keepMessage = conn.msg.keepMessage; conn.sendStatusQuestion = conn.msg.sendStatusQuestion;
    conn.sendCallLog = conn.msg.sendCallLog; conn.sendHistoryNotice = conn.msg.sendHistoryNotice; conn.sendChatBundle = conn.msg.sendChatBundle; conn.sendEncReaction = conn.msg.sendEncReaction; conn.syncStickers = conn.msg.syncStickers; conn.requestResend = conn.msg.requestResend; conn.sendPaymentInvite = conn.msg.sendPaymentInvite; conn.sendPollV5 = conn.msg.sendPollV5; conn.productCarousel = conn.msg.productCarousel;
    conn.sendVideoNote = conn.msg.sendVideoNote; conn.sendImagePoll = conn.msg.sendImagePoll; conn.editScheduledCall = conn.msg.editScheduledCall; conn.sendAIReminder = conn.msg.sendAIReminder; conn.sendLottieSticker = conn.msg.sendLottieSticker; conn.sendAiSticker = conn.msg.sendAiSticker;
    conn.sendGroupEvent = conn.msg.sendGroupEvent; conn.sendAlbum = conn.msg.sendAlbum;
    conn.sendQuizPoll = conn.msg.sendQuizPoll; conn.sendPollResultSnapshot = conn.msg.sendPollResultSnapshot; conn.sendNewsletterAdminInvite = conn.msg.sendNewsletterAdminInvite; conn.sendStatusMusic = conn.msg.sendStatusMusic; conn.sendStatusWearable = conn.msg.sendStatusWearable; conn.sendStatusCloseFriends = conn.msg.sendStatusCloseFriends;
    conn.sendStatusNotification = conn.msg.sendStatusNotification; conn.sendStatusMention = conn.msg.sendStatusMention; conn.sendStatusStickerInteraction = conn.msg.sendStatusStickerInteraction; conn.sendStatusQuestionAnswer = conn.msg.sendStatusQuestionAnswer; conn.sendStatusQuotedMessage = conn.msg.sendStatusQuotedMessage;
    conn.unpinMessage = conn.msg.unpinMessage;
    conn.sendNewsletterFollowerInvite = conn.msg.sendNewsletterFollowerInvite;
    conn.sendContact = conn.msg.sendContact;
    conn.sendContactsArray = conn.msg.sendContactsArray;
    conn.sendLocation = conn.msg.sendLocation;
    
    // Payment & Group invite aliases (restored)
    conn.sendPaymentRequest = conn.msg.sendPaymentRequest;
    conn.declinePaymentRequest = conn.msg.declinePaymentRequest;
    conn.cancelPaymentRequest = conn.msg.cancelPaymentRequest;
    conn.sendGroupInvite = conn.msg.sendGroupInvite;
    conn.requestPhoneNumber = conn.msg.requestPhoneNumber;
    conn.sendPlaceholder = conn.msg.sendPlaceholder;

    // New aliases
    conn.sendEncEventResponse = conn.msg.sendEncEventResponse;
    conn.sendEncComment = conn.msg.sendEncComment;
    conn.sendSecretEncrypted = conn.msg.sendSecretEncrypted;
    conn.sendPollV4 = conn.msg.sendPollV4;
    conn.sendPollResultSnapshotV3 = conn.msg.sendPollResultSnapshotV3;
    conn.sendStatusAddYours = conn.msg.sendStatusAddYours;
    conn.sendStatusGroupStatus = conn.msg.sendStatusGroupStatus;
    conn.sendStatusGroupStatusV2 = conn.msg.sendStatusGroupStatusV2;
    conn.sendStatusGroupMention = conn.msg.sendStatusGroupMention;
    conn.sendAssociatedChild = conn.msg.sendAssociatedChild;

    const commands = new Map();
    conn.onCommand = (cmd, callback) => {
        commands.set(cmd.toLowerCase(), callback);
    };
    conn.getGroupAdmins = async (jid) => { try { const metadata = await conn.groupMetadata(jid); return metadata.participants.filter(p => p.admin).map(p => p.id); } catch (err) { return []; } };
    conn.isAdmin = async (jid, user) => { const admins = await conn.getGroupAdmins(jid); return admins.includes(jidNormalizedUser(user)); };
    conn.autoRead = false;
    conn.antiCall = false;
    conn.autoTyping = false;
    conn.autoRecord = false;
    
    conn.ev.on('messages.upsert', async ({ messages, type }) => {
        lastPulse = Date.now();
        if (type !== 'notify' && type !== 'append') return;
        for (const m of messages) {
            // Cache messages for anti-delete
            if (m.message) {
                const key = `${m.key.remoteJid}:${m.key.id}`;
                messageCache.set(key, m);
                if (messageCache.size > CACHE_LIMIT) {
                    const firstKey = messageCache.keys().next().value;
                    messageCache.delete(firstKey);
                }
            }
            // Auto read if enabled
            if (conn.autoRead) {
                await conn.readMessages([m.key]).catch(() => {});
            }
            // Centralized command dispatcher
            const s = conn.smsg(m);
            if (s.isCommand && commands.has(s.command)) {
                try {
                    await commands.get(s.command)(s);
                } catch (err) {
                    conn.logger.error({ err, command: s.command }, "Error executing command");
                }
            }
        }
    });

    conn.ev.on('call', async (calls) => {
        if (conn.antiCall) {
            for (const call of calls) {
                if (call.status === 'offer') {
                    await conn.rejectCall(call.id, call.from);
                    await conn.sendMessage(call.from, { text: `Maaf, saya tidak menerima panggilan.` });
                }
            }
        }
    });

    conn.newsletter = {
        create: (name, description) => conn.newsletterCreate(name, description), follow: (jid) => conn.newsletterFollow(jid), unfollow: (jid) => conn.newsletterUnfollow(jid), mute: (jid) => conn.newsletterMute(jid), unmute: (jid) => conn.newsletterUnmute(jid), update: (jid, name, description) => conn.newsletterUpdateMetadata(jid, { name, description }), getInfo: (jid) => conn.getNewsletterInfo(jid),
        inviteAdmin: (jid, userJid) => conn.sendMessage(jid, { newsletterAdminInviteMessage: { newsletterJid: jid, newsletterName: "Admin Invite", inviteExpiration: Math.floor(Date.now() / 1000) + (86400 * 7) } }, { mentions: [userJid] }),
        inviteFollower: (jid, name, thumb, caption = "") => conn.sendMessage(jid, { newsletterFollowerInviteMessageV2: { newsletterJid: jid, newsletterName: name, jpegThumbnail: thumb, caption: caption } })
    };

    conn.ev.on('messages.update', (updates) => {
        for (const update of updates) {
            if (update.update.messageStubType === 1 || update.update.protocolMessage?.type === 0) {
                const jid = update.key.remoteJid;
                const id = update.key.id;
                const original = messageCache.get(`${jid}:${id}`);
                if (original) {
                    deletedMessages.set(`${jid}:${id}`, original);
                    if (deletedMessages.size > CACHE_LIMIT) {
                        const firstKey = deletedMessages.keys().next().value;
                        deletedMessages.delete(firstKey);
                    }
                    conn.ev.emit('message.delete', { jid, id, message: original });
                }
            }
        }
    });

    let lastPulse = Date.now();
    const medicInterval = setInterval(() => { const diff = Date.now() - lastPulse; if (diff > 45000 && conn.ws?.readyState === 1) conn.ws.close(); }, 15000);
    const webhookUrl = process.env.WEBHOOK_URL || conn.webhookUrl || conn.config.webhookUrl;
    conn.ev.on('connection.update', (update) => { if (webhookUrl) forwardToWebhook(webhookUrl, { event: 'connection.update', data: update }, conn.logger); const { connection } = update; if (connection === 'close') clearInterval(medicInterval); });

    return conn;
};
