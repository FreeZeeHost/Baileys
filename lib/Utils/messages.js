"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const boom_1 = require("@hapi/boom")
const crypto_1 = require("crypto")
const fs_1 = require("fs")
const WAProto_1 = require("../../WAProto")
const Defaults_1 = require("../Defaults")
const Types_1 = require("../Types")
const WABinary_1 = require("../WABinary")
const crypto_2 = require("./crypto")
const generics_1 = require("./generics")
const messages_media_1 = require("./messages-media")

const MIMETYPE_MAP = {
    image: 'image/jpeg',
    video: 'video/mp4',
    document: 'application/pdf',
    audio: 'audio/ogg; codecs=opus',
    sticker: 'image/webp',
    'product-catalog-image': 'image/jpeg'
}

const MessageTypeProto = {
    image: WAProto_1.proto.Message.ImageMessage,
    video: WAProto_1.proto.Message.VideoMessage,
    audio: WAProto_1.proto.Message.AudioMessage,
    sticker: WAProto_1.proto.Message.StickerMessage,
    document: WAProto_1.proto.Message.DocumentMessage
}

exports.extractUrlFromText = (text) => text.match(Defaults_1.URL_REGEX)?.[0]

exports.generateLinkPreviewIfRequired = async (text, getUrlInfo, logger) => {
    const url = exports.extractUrlFromText(text)
    if (!!getUrlInfo && url) {
        try {
            const urlInfo = await getUrlInfo(url)
            return urlInfo
        } catch (error) {
            logger?.warn({ trace: error.stack }, 'url generation failed')
        }
    }
}

const assertColor = async (color) => {
    let assertedColor
    if (typeof color === 'number') {
        assertedColor = color > 0 ? color : 0xffffffff + Number(color) + 1
    } else {
        let hex = color.trim().replace('#', '')
        if (hex.length <= 6) {
            hex = 'FF' + hex.padStart(6, '0')
        }
        assertedColor = parseInt(hex, 16)
        return assertedColor
    }
}

exports.prepareWAMessageMedia = async (message, options) => {
    const logger = options.logger
    let mediaType
    for (const key of Defaults_1.MEDIA_KEYS) {
        if (key in message) {
            mediaType = key
        }
    }
    if (!mediaType) {
        throw new boom_1.Boom('Invalid media type', { statusCode: 400 })
    }
    const uploadData = {
        ...message,
        media: message[mediaType]
    }
    delete uploadData[mediaType]
    const cacheableKey = typeof uploadData.media === 'object' &&
        'url' in uploadData.media &&
        !!uploadData.media.url &&
        !!options.mediaCache &&
        mediaType + ':' + uploadData.media.url.toString()
    if (mediaType === 'document' && !uploadData.fileName) {
        uploadData.fileName = 'file'
    }
    if (!uploadData.mimetype) {
        uploadData.mimetype = MIMETYPE_MAP[mediaType]
    }
    if (cacheableKey) {
        const mediaBuff = await options.mediaCache.get(cacheableKey)
        if (mediaBuff) {
            logger?.debug({ cacheableKey }, 'got media cache hit')
            const obj = WAProto_1.proto.Message.decode(mediaBuff)
            const key = `${mediaType}Message`
            Object.assign(obj[key], { ...uploadData, media: undefined })
            return obj
        }
    }
    const isNewsletter = !!options.jid && (0, WABinary_1.isJidNewsletter)(options.jid)
    if (isNewsletter) {
        logger?.info({ key: cacheableKey }, 'Preparing raw media for newsletter')
        const { filePath, fileSha256, fileLength } = await (0, messages_media_1.getRawMediaUploadData)(uploadData.media, options.mediaTypeOverride || mediaType, logger)
        const fileSha256B64 = fileSha256.toString('base64')
        const { mediaUrl, directPath } = await options.upload(filePath, {
            fileEncSha256B64: fileSha256B64,
            mediaType: mediaType,
            timeoutMs: options.mediaUploadTimeoutMs
        })
        await fs_1.promises.unlink(filePath)
        const obj = WAProto_1.proto.Message.fromObject({
            [`${mediaType}Message`]: MessageTypeProto[mediaType].fromObject({
                url: mediaUrl,
                directPath,
                fileSha256,
                fileLength,
                ...uploadData,
                media: undefined
            })
        })
        if (uploadData.ptv) {
            obj.ptvMessage = obj.videoMessage
            delete obj.videoMessage
        }
        if (obj.stickerMessage) {
            obj.stickerMessage.stickerSentTs = Date.now()
        }
        if (cacheableKey) {
            logger?.debug({ cacheableKey }, 'set cache')
            await options.mediaCache.set(cacheableKey, WAProto_1.proto.Message.encode(obj).finish())
        }
        return obj
    }
    const requiresDurationComputation = mediaType === 'audio' && typeof uploadData.seconds === 'undefined'
    const requiresThumbnailComputation = (mediaType === 'image' || mediaType === 'video') && typeof uploadData['jpegThumbnail'] === 'undefined'
    const requiresWaveformProcessing = mediaType === 'audio' && uploadData.ptt === true
    const requiresAudioBackground = options.backgroundColor && mediaType === 'audio' && uploadData.ptt === true
    const requiresOriginalForSomeProcessing = requiresDurationComputation || requiresThumbnailComputation
    const { mediaKey, encFilePath, originalFilePath, fileEncSha256, fileSha256, fileLength } = await (0, messages_media_1.encryptedStream)(uploadData.media, options.mediaTypeOverride || mediaType, {
        logger,
        saveOriginalFileIfRequired: requiresOriginalForSomeProcessing,
        opts: options.options
    })
    const fileEncSha256B64 = fileEncSha256.toString('base64')
    const [{ mediaUrl, directPath }] = await Promise.all([
        (async () => {
            const result = await options.upload(encFilePath, {
                fileEncSha256B64,
                mediaType,
                timeoutMs: options.mediaUploadTimeoutMs
            })
            logger?.debug({ mediaType, cacheableKey }, 'uploaded media')
            return result
        })(),
        (async () => {
            try {
                if (requiresThumbnailComputation) {
                    const { thumbnail, originalImageDimensions } = await (0, messages_media_1.generateThumbnail)(originalFilePath, mediaType, options)
                    uploadData.jpegThumbnail = thumbnail
                    if (!uploadData.width && originalImageDimensions) {
                        uploadData.width = originalImageDimensions.width
                        uploadData.height = originalImageDimensions.height
                        logger?.debug('set dimensions')
                    }
                    logger?.debug('generated thumbnail')
                }
                if (requiresDurationComputation) {
                    uploadData.seconds = await (0, messages_media_1.getAudioDuration)(originalFilePath)
                    logger?.debug('computed audio duration')
                }
                if (requiresWaveformProcessing) {
                    uploadData.waveform = await (0, messages_media_1.getAudioWaveform)(originalFilePath, logger)
                    logger?.debug('processed waveform')
                }
                if (requiresAudioBackground) {
                    uploadData.backgroundArgb = await assertColor(options.backgroundColor)
                    logger?.debug('computed backgroundColor audio status')
                }
            } catch (error) {
                logger?.warn({ trace: error.stack }, 'failed to obtain extra info')
            }
        })()
    ]).finally(async () => {
        try {
            await fs_1.promises.unlink(encFilePath)
            if (originalFilePath) {
                await fs_1.promises.unlink(originalFilePath)
            }
            logger?.debug('removed tmp files')
        } catch (error) {
            logger?.warn('failed to remove tmp file')
        }
    })
    const obj = WAProto_1.proto.Message.fromObject({
        [`${mediaType}Message`]: MessageTypeProto[mediaType].fromObject({
            url: mediaUrl,
            directPath,
            mediaKey,
            fileEncSha256,
            fileSha256,
            fileLength,
            mediaKeyTimestamp: (0, generics_1.unixTimestampSeconds)(),
            ...uploadData,
            media: undefined
        })
    })
    if (uploadData.ptv) {
        obj.ptvMessage = obj.videoMessage
        delete obj.videoMessage
    }
    if (cacheableKey) {
        logger?.debug({ cacheableKey }, 'set cache')
        await options.mediaCache.set(cacheableKey, WAProto_1.proto.Message.encode(obj).finish())
    }
    return obj
}

exports.prepareDisappearingMessageSettingContent = (ephemeralExpiration) => {
    ephemeralExpiration = ephemeralExpiration || 0
    const content = {
        ephemeralMessage: {
            message: {
                protocolMessage: {
                    type: WAProto_1.proto.Message.ProtocolMessage.Type.EPHEMERAL_SETTING,
                    ephemeralExpiration
                }
            }
        }
    }
    return WAProto_1.proto.Message.fromObject(content)
}

exports.generateForwardMessageContent = (message, forceForward) => {
    let content = message.message
    if (!content) {
        throw new boom_1.Boom('no content in message', { statusCode: 400 })
    }
    content = exports.normalizeMessageContent(content)
    content = WAProto_1.proto.Message.decode(WAProto_1.proto.Message.encode(content).finish())
    let key = Object.keys(content)[0]
    let score = content?.[key]?.contextInfo?.forwardingScore || 0
    score += message.key.fromMe && !forceForward ? 0 : 1
    if (key === 'conversation') {
        content.extendedTextMessage = { text: content[key] }
        delete content.conversation
        key = 'extendedTextMessage'
    }
    const key_ = content?.[key]
    if (score > 0) {
        key_.contextInfo = { forwardingScore: score, isForwarded: true }
    } else {
        key_.contextInfo = {}
    }
    return content
}

exports.generateWAMessageContent = async (message, options) => {
    let m = {}
    if ('text' in message) {
        const extContent = { text: message.text }
        let urlInfo = message.linkPreview
        if (typeof urlInfo === 'undefined') {
            urlInfo = await exports.generateLinkPreviewIfRequired(message.text, options.getUrlInfo, options.logger)
        }
        if (urlInfo) {
            extContent.matchedText = urlInfo['matched-text']
            extContent.jpegThumbnail = urlInfo.jpegThumbnail
            extContent.description = urlInfo.description
            extContent.title = urlInfo.title
            extContent.previewType = 0
            const img = urlInfo.highQualityThumbnail
            if (img) {
                extContent.thumbnailDirectPath = img.directPath
                extContent.mediaKey = img.mediaKey
                extContent.mediaKeyTimestamp = img.mediaKeyTimestamp
                extContent.thumbnailWidth = img.width
                extContent.thumbnailHeight = img.height
                extContent.thumbnailSha256 = img.fileSha256
                extContent.thumbnailEncSha256 = img.fileEncSha256
            }
        }
        if (options.backgroundColor) {
            extContent.backgroundArgb = await assertColor(options.backgroundColor)
        }
        if (options.font) {
            extContent.font = options.font
        }
        m.extendedTextMessage = extContent
    } else if ('contacts' in message) {
        const contactLen = message.contacts.contacts.length
        if (!contactLen) {
            throw new boom_1.Boom('require atleast 1 contact', { statusCode: 400 })
        }
        if (contactLen === 1) {
            m.contactMessage = WAProto_1.proto.Message.ContactMessage.create(message.contacts.contacts[0])
        } else {
            m.contactsArrayMessage = WAProto_1.proto.Message.ContactsArrayMessage.create(message.contacts)
        }
    } else if ('location' in message) {
        m.locationMessage = WAProto_1.proto.Message.LocationMessage.create(message.location)
    } else if ('react' in message) {
        if (!message.react.senderTimestampMs) {
            message.react.senderTimestampMs = Date.now()
        }
        m.reactionMessage = WAProto_1.proto.Message.ReactionMessage.create(message.react)
    } else if ('delete' in message) {
        m.protocolMessage = {
            key: message.delete,
            type: WAProto_1.proto.Message.ProtocolMessage.Type.REVOKE
        }
    } else if ('forward' in message) {
        m = exports.generateForwardMessageContent(message.forward, message.force)
    } else if ('disappearingMessagesInChat' in message) {
        const exp = typeof message.disappearingMessagesInChat === 'boolean'
            ? message.disappearingMessagesInChat
                ? Defaults_1.WA_DEFAULT_EPHEMERAL
                : 0
            : message.disappearingMessagesInChat
        m = exports.prepareDisappearingMessageSettingContent(exp)
    } else if ('groupInvite' in message) {
        m.groupInviteMessage = {}
        m.groupInviteMessage.inviteCode = message.groupInvite.inviteCode
        m.groupInviteMessage.inviteExpiration = message.groupInvite.inviteExpiration
        m.groupInviteMessage.caption = message.groupInvite.text
        m.groupInviteMessage.groupJid = message.groupInvite.jid
        m.groupInviteMessage.groupName = message.groupInvite.subject
        if (options.getProfilePicUrl) {
            const pfpUrl = await options.getProfilePicUrl(message.groupInvite.jid, 'preview')
            if (pfpUrl) {
                const resp = await fetch(pfpUrl, { method: 'GET', dispatcher: options?.options?.dispatcher })
                if (resp.ok) {
                    const buf = Buffer.from(await resp.arrayBuffer())
                    m.groupInviteMessage.jpegThumbnail = buf
                }
            }
        }
    } else if ('pin' in message) {
        m.pinInChatMessage = {}
        m.messageContextInfo = {}
        m.pinInChatMessage.key = message.pin
        m.pinInChatMessage.type = message.type
        m.pinInChatMessage.senderTimestampMs = Date.now()
        m.messageContextInfo.messageAddOnDurationInSecs = message.type === 1 ? message.time || 86400 : 0
    } else if ('buttonReply' in message) {
        switch (message.type) {
            case 'template':
                m.templateButtonReplyMessage = {
                    selectedDisplayText: message.buttonReply.displayText,
                    selectedId: message.buttonReply.id,
                    selectedIndex: message.buttonReply.index
                }
                break
            case 'plain':
                m.buttonsResponseMessage = {
                    selectedButtonId: message.buttonReply.id,
                    selectedDisplayText: message.buttonReply.displayText,
                    type: WAProto_1.proto.Message.ButtonsResponseMessage.Type.DISPLAY_TEXT
                }
                break
        }
    } else if ('ptv' in message && message.ptv) {
        const { videoMessage } = await exports.prepareWAMessageMedia({ video: message.video }, options)
        m.ptvMessage = videoMessage
    } else if ('product' in message) {
        const { imageMessage } = await exports.prepareWAMessageMedia({ image: message.product.productImage }, options)
        m.productMessage = WAProto_1.proto.Message.ProductMessage.create({
            ...message,
            product: {
                ...message.product,
                productImage: imageMessage
            }
        })
    } else if ('listReply' in message) {
        m.listResponseMessage = { ...message.listReply }
    } else if ('event' in message) {
        m.eventMessage = {}
        const startTime = Math.floor(message.event.startDate.getTime() / 1000)
        if (message.event.call && options.getCallLink) {
            const token = await options.getCallLink(message.event.call, { startTime })
            m.eventMessage.joinLink = (message.event.call === 'audio' ? Defaults_1.CALL_AUDIO_PREFIX : Defaults_1.CALL_VIDEO_PREFIX) + token
        }
        m.messageContextInfo = {
            messageSecret: message.event.messageSecret || (0, crypto_1.randomBytes)(32)
        }
        m.eventMessage.name = message.event.name
        m.eventMessage.description = message.event.description
        m.eventMessage.startTime = startTime
        m.eventMessage.endTime = message.event.endDate ? message.event.endDate.getTime() / 1000 : undefined
        m.eventMessage.isCanceled = message.event.isCancelled ?? false
        m.eventMessage.extraGuestsAllowed = message.event.extraGuestsAllowed
        m.eventMessage.isScheduleCall = message.event.isScheduleCall ?? false
        m.eventMessage.location = message.event.location
    } else if ('poll' in message) {
        message.poll.selectableCount ||= 0
        message.poll.toAnnouncementGroup ||= false
        if (!Array.isArray(message.poll.values)) {
            throw new boom_1.Boom('Invalid poll values', { statusCode: 400 })
        }
        if (message.poll.selectableCount < 0 || message.poll.selectableCount > message.poll.values.length) {
            throw new boom_1.Boom(`poll.selectableCount in poll should be >= 0 and <= ${message.poll.values.length}`, {
                statusCode: 400
            })
        }
        m.messageContextInfo = {
            messageSecret: message.poll.messageSecret || (0, crypto_1.randomBytes)(32)
        }
        const pollCreationMessage = {
            name: message.poll.name,
            selectableOptionsCount: message.poll.selectableCount,
            options: message.poll.values.map(optionName => ({ optionName }))
        }
        if (message.poll.toAnnouncementGroup) {
            m.pollCreationMessageV2 = pollCreationMessage
        } else {
            if (message.poll.selectableCount === 1) {
                m.pollCreationMessageV3 = pollCreationMessage
            } else {
                m.pollCreationMessage = pollCreationMessage
            }
        }
    } else if ('sharePhoneNumber' in message) {
        m.protocolMessage = {
            type: WAProto_1.proto.Message.ProtocolMessage.Type.SHARE_PHONE_NUMBER
        }
    } else if ('requestPhoneNumber' in message) {
        m.requestPhoneNumberMessage = {}
    } else if ('limitSharing' in message) {
        m.protocolMessage = {
            type: WAProto_1.proto.Message.ProtocolMessage.Type.LIMIT_SHARING,
            limitSharing: {
                sharingLimited: message.limitSharing === true,
                trigger: 1,
                limitSharingSettingTimestamp: Date.now(),
                initiatedByMe: true
            }
        }
    } else {
        m = await exports.prepareWAMessageMedia(message, options)
    }
    if ('viewOnce' in message && !!message.viewOnce) {
        m = { viewOnceMessage: { message: m } }
    }
    if ('mentions' in message && message.mentions?.length) {
        const messageType = Object.keys(m)[0]
        const key = m[messageType]
        if ('contextInfo' in key && !!key.contextInfo) {
            key.contextInfo.mentionedJid = message.mentions
        } else if (key) {
            key.contextInfo = {
                mentionedJid: message.mentions
            }
        }
    }
    if ('edit' in message) {
        m = {
            protocolMessage: {
                key: message.edit,
                editedMessage: m,
                timestampMs: Date.now(),
                type: WAProto_1.proto.Message.ProtocolMessage.Type.MESSAGE_EDIT
            }
        }
    }
    if ('contextInfo' in message && !!message.contextInfo) {
        const messageType = Object.keys(m)[0]
        const key = m[messageType]
        if ('contextInfo' in key && !!key.contextInfo) {
            key.contextInfo = { ...key.contextInfo, ...message.contextInfo }
        } else if (key) {
            key.contextInfo = message.contextInfo
        }
    }
    return WAProto_1.proto.Message.create(m)
}

exports.generateWAMessageFromContent = (jid, message, options) => {
    if (!options.timestamp) {
        options.timestamp = new Date()
    }
    const innerMessage = exports.normalizeMessageContent(message)
    const key = exports.getContentType(innerMessage)
    const timestamp = (0, generics_1.unixTimestampSeconds)(options.timestamp)
    const { quoted, userJid } = options
    if (quoted && !(0, WABinary_1.isJidNewsletter)(jid)) {
        const participant = quoted.key.fromMe
            ? userJid
            : quoted.participant || quoted.key.participant || quoted.key.remoteJid
        let quotedMsg = exports.normalizeMessageContent(quoted.message)
        const msgType = exports.getContentType(quotedMsg)
        quotedMsg = WAProto_1.proto.Message.create({ [msgType]: quotedMsg[msgType] })
        const quotedContent = quotedMsg[msgType]
        if (typeof quotedContent === 'object' && quotedContent && 'contextInfo' in quotedContent) {
            delete quotedContent.contextInfo
        }
        const contextInfo = ('contextInfo' in innerMessage[key] && innerMessage[key]?.contextInfo) || {}
        contextInfo.participant = (0, WABinary_1.jidNormalizedUser)(participant)
        contextInfo.stanzaId = quoted.key.id
        contextInfo.quotedMessage = quotedMsg
        if (jid !== quoted.key.remoteJid) {
            contextInfo.remoteJid = quoted.key.remoteJid
        }
        if (contextInfo && innerMessage[key]) {
            innerMessage[key].contextInfo = contextInfo
        }
    }
    if (!!options?.ephemeralExpiration &&
        key !== 'protocolMessage' &&
        key !== 'ephemeralMessage' &&
        !(0, WABinary_1.isJidNewsletter)(jid)) {
        innerMessage[key].contextInfo = {
            ...(innerMessage[key].contextInfo || {}),
            expiration: options.ephemeralExpiration || Defaults_1.WA_DEFAULT_EPHEMERAL
        }
    }
    message = WAProto_1.proto.Message.create(message)
    const messageJSON = {
        key: {
            remoteJid: jid,
            fromMe: true,
            id: options?.messageId || (0, generics_1.generateMessageIDV2)()
        },
        message: message,
        messageTimestamp: timestamp,
        messageStubParameters: [],
        participant: (0, WABinary_1.isJidGroup)(jid) || (0, WABinary_1.isJidStatusBroadcast)(jid) ? userJid : undefined,
        status: Types_1.WAMessageStatus.PENDING
    }
    return WAProto_1.proto.WebMessageInfo.fromObject(messageJSON)
}

exports.generateWAMessage = async (jid, content, options) => {
    options.logger = options?.logger?.child({ msgId: options.messageId })
    return exports.generateWAMessageFromContent(jid, await exports.generateWAMessageContent(content, { ...options, jid }), options)
}

exports.getContentType = (content) => {
    if (content) {
        const keys = Object.keys(content)
        const key = keys.find(k => (k === 'conversation' || k.includes('Message')) && k !== 'senderKeyDistributionMessage')
        return key
    }
}

exports.normalizeMessageContent = (content) => {
    if (!content) {
        return undefined
    }
    for (let i = 0; i < 5; i++) {
        const inner = (content?.ephemeralMessage ||
            content?.viewOnceMessage ||
            content?.documentWithCaptionMessage ||
            content?.viewOnceMessageV2 ||
            content?.viewOnceMessageV2Extension ||
            content?.editedMessage)
        if (!inner) {
            break
        }
        content = inner.message
    }
    return content
}

exports.extractMessageContent = (content) => {
    const extractFromTemplateMessage = (msg) => {
        if (msg.imageMessage) {
            return { imageMessage: msg.imageMessage }
        } else if (msg.documentMessage) {
            return { documentMessage: msg.documentMessage }
        } else if (msg.videoMessage) {
            return { videoMessage: msg.videoMessage }
        } else if (msg.locationMessage) {
            return { locationMessage: msg.locationMessage }
        } else {
            return {
                conversation: 'contentText' in msg ? msg.contentText : 'hydratedContentText' in msg ? msg.hydratedContentText : ''
            }
        }
    }
    content = exports.normalizeMessageContent(content)
    if (content?.buttonsMessage) {
        return extractFromTemplateMessage(content.buttonsMessage)
    }
    if (content?.templateMessage?.hydratedFourRowTemplate) {
        return extractFromTemplateMessage(content?.templateMessage?.hydratedFourRowTemplate)
    }
    if (content?.templateMessage?.hydratedTemplate) {
        return extractFromTemplateMessage(content?.templateMessage?.hydratedTemplate)
    }
    if (content?.templateMessage?.fourRowTemplate) {
        return extractFromTemplateMessage(content?.templateMessage?.fourRowTemplate)
    }
    return content
}

exports.getDevice = (id) => /^3A.{18}$/.test(id)
    ? 'ios'
    : /^3E.{20}$/.test(id)
        ? 'web'
        : /^(.{21}|.{32})$/.test(id)
            ? 'android'
            : /^(3F|.{18}$)/.test(id)
                ? 'desktop'
                : 'unknown'

exports.updateMessageWithReceipt = (msg, receipt) => {
    msg.userReceipt = msg.userReceipt || []
    const recp = msg.userReceipt.find(m => m.userJid === receipt.userJid)
    if (recp) {
        Object.assign(recp, receipt)
    } else {
        msg.userReceipt.push(receipt)
    }
}

exports.updateMessageWithReaction = (msg, reaction) => {
    const authorID = (0, generics_1.getKeyAuthor)(reaction.key)
    const reactions = (msg.reactions || []).filter(r => (0, generics_1.getKeyAuthor)(r.key) !== authorID)
    reaction.text = reaction.text || ''
    reactions.push(reaction)
    msg.reactions = reactions
}

exports.updateMessageWithPollUpdate = (msg, update) => {
    const authorID = (0, generics_1.getKeyAuthor)(update.pollUpdateMessageKey)
    const reactions = (msg.pollUpdates || []).filter(r => (0, generics_1.getKeyAuthor)(r.pollUpdateMessageKey) !== authorID)
    if (update.vote?.selectedOptions?.length) {
        reactions.push(update)
    }
    msg.pollUpdates = reactions
}

exports.updateMessageWithEventResponse = (msg, update) => {
    const authorID = (0, generics_1.getKeyAuthor)(update.eventResponseMessageKey)
    const responses = (msg.eventResponses || []).filter(r => (0, generics_1.getKeyAuthor)(r.eventResponseMessageKey) !== authorID)
    responses.push(update)
    msg.eventResponses = responses
}

exports.getAggregateVotesInPollMessage = ({ message, pollUpdates }, meId) => {
    const opts = message?.pollCreationMessage?.options ||
        message?.pollCreationMessageV2?.options ||
        message?.pollCreationMessageV3?.options ||
        []
    const voteHashMap = opts.reduce((acc, opt) => {
        const hash = (0, crypto_2.sha256)(Buffer.from(opt.optionName || '')).toString()
        acc[hash] = {
            name: opt.optionName || '',
            voters: []
        }
        return acc
    }, {})
    for (const update of pollUpdates || []) {
        const { vote } = update
        if (!vote) {
            continue
        }
        for (const option of vote.selectedOptions || []) {
            const hash = option.toString()
            let data = voteHashMap[hash]
            if (!data) {
                voteHashMap[hash] = {
                    name: 'Unknown',
                    voters: []
                }
                data = voteHashMap[hash]
            }
            voteHashMap[hash].voters.push((0, generics_1.getKeyAuthor)(update.pollUpdateMessageKey, meId))
        }
    }
    return Object.values(voteHashMap)
}

exports.getAggregateResponsesInEventMessage = ({ eventResponses }, meId) => {
    const responseTypes = ['GOING', 'NOT_GOING', 'MAYBE']
    const responseMap = {}
    for (const type of responseTypes) {
        responseMap[type] = {
            response: type,
            responders: []
        }
    }
    for (const update of eventResponses || []) {
        const responseType = update.eventResponse || 'UNKNOWN'
        if (responseType !== 'UNKNOWN' && responseMap[responseType]) {
            responseMap[responseType].responders.push((0, generics_1.getKeyAuthor)(update.eventResponseMessageKey, meId))
        }
    }
    return Object.values(responseMap)
}

exports.aggregateMessageKeysNotFromMe = (keys) => {
    const keyMap = {}
    for (const { remoteJid, id, participant, fromMe } of (keys || [])) {
        if (!fromMe) {
            const uqKey = `${remoteJid}:${participant || ''}`
            if (!keyMap[uqKey]) {
                keyMap[uqKey] = {
                    jid: remoteJid,
                    participant: participant,
                    messageIds: []
                }
            }
            keyMap[uqKey].messageIds.push(id)
        }
    }
    return Object.values(keyMap)
}

const REUPLOAD_REQUIRED_STATUS = [410, 404]

exports.downloadMediaMessage = async (message, type, options, ctx) => {
    const downloadMsg = async () => {
        const mContent = exports.extractMessageContent(message.message)
        if (!mContent) {
            throw new boom_1.Boom('No message present', { statusCode: 400, data: message })
        }
        const contentType = exports.getContentType(mContent)
        let mediaType = contentType?.replace('Message', '')
        const media = mContent[contentType]
        if (!media || typeof media !== 'object' || (!('url' in media) && !('thumbnailDirectPath' in media))) {
            throw new boom_1.Boom(`"${contentType}" message is not a media message`)
        }
        let download
        if ('thumbnailDirectPath' in media && !('url' in media)) {
            download = {
                directPath: media.thumbnailDirectPath,
                mediaKey: media.mediaKey
            }
            mediaType = 'thumbnail-link'
        } else {
            download = media
        }
        const stream = await (0, messages_media_1.downloadContentFromMessage)(download, mediaType, options)
        if (type === 'buffer') {
            const bufferArray = []
            for await (const chunk of stream) {
                bufferArray.push(chunk)
            }
            return Buffer.concat(bufferArray)
        }
        return stream
    }

    const result = await downloadMsg().catch(async (error) => {
        if (ctx &&
            typeof error?.status === 'number' &&
            REUPLOAD_REQUIRED_STATUS.includes(error.status)) {
            ctx.logger.info({ key: message.key }, 'sending reupload media request...')
            message = await ctx.reuploadRequest(message)
            const result = await downloadMsg()
            return result
        }
        throw error
    })
    return result
}

exports.assertMediaContent = (content) => {
    content = exports.extractMessageContent(content)
    const mediaContent = content?.documentMessage ||
        content?.imageMessage ||
        content?.videoMessage ||
        content?.audioMessage ||
        content?.stickerMessage
    if (!mediaContent) {
        throw new boom_1.Boom('given message is not a media message', { statusCode: 400, data: content })
    }
    return mediaContent
}
