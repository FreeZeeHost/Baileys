import { proto } from '../../WAProto'
import { BinaryNode } from '../WABinary'

export interface FreeZeeSocket {
    // --- 🎭 IDENTITY ---
    setPersona(type: 'ios' | 'android' | 'windows' | 'macos' | 'portal' | 'wearos'): boolean
    
    // --- 🩺 HEALTH & OPTIMIZATION ---
    autoOptimize(): void
    getActivityMetrics(): {
        sent: number
        recv: number
        uptime: number
        memory: number
    }
    
    // --- 🔍 MEDIA ---
    getMediaInfo(buffer: Buffer): Promise<any>
    
    // --- 👻 PRIVACY ---
    ghostMode: boolean
    setVIP(jid: string, status?: boolean): void
    
    // --- 🛡️ ANTI-DELETE ---
    getDeletedMessage(jid: string, id: string): proto.IWebMessageInfo | undefined
    
    // --- 📞 CALLS ---
    antiCall: boolean
    rejectCall(callId: string, callFrom: string): Promise<void>
    
    // --- 🚀 UI HELPERS (conn.msg) ---
    msg: {
        buttons(jid: string, text: string, footer: string, buttons: any[], options?: any): Promise<any>
        list(jid: string, title: string, text: string, footer: string, buttonText: string, sections: any[], options?: any): Promise<any>
        poll(jid: string, name: string, values: string[], selectableCount?: number, options?: any): Promise<any>
        carousel(jid: string, cards: any[], options?: any): Promise<any>
        nativeTable(jid: string, title: string, rows: any[], options?: any): Promise<any>
        
        // Meta AI
        aiRichMessage(jid: string, submessages: any[], options?: any): Promise<any>
        aiTable(jid: string, title: string, rows: any[], options?: any): Promise<any>
        aiCode(jid: string, language: string, code: string, options?: any): Promise<any>
        aiGridImage(jid: string, imageUrls: string[] | any[], gridImageUrl?: string | null, options?: any): Promise<any>
        aiInlineImage(jid: string, imageUrl: string | any, text?: string, alignment?: number, tapLink?: string, options?: any): Promise<any>
        aiDynamic(jid: string, url: string, isGif?: boolean, loopCount?: number, options?: any): Promise<any>
        aiLatex(jid: string, text: string, expressions?: any[], options?: any): Promise<any>
        aiMap(jid: string, lat: number, lng: number, annotations?: any[], options?: any): Promise<any>
        aiThinking(jid: string, description: string, steps?: any[], options?: any): Promise<any>
        aiModel(jid: string, text: string, modelType?: number, modelName?: string, options?: any): Promise<any>
        aiPrompts(jid: string, text: string, prompts: (string | any)[], options?: any): Promise<any>
        aiReels(jid: string, mainText: string, reels: any[], options?: any): Promise<any>
        aiFeedback(jid: string, messageKey: any, isPositive?: boolean, text?: string, options?: any): Promise<any>
        
        // Native
        createEvent(jid: string, event: any, options?: any): Promise<any>
        scheduleCall(jid: string, call: any, options?: any): Promise<any>
        bcall(jid: string, bcall: any, options?: any): Promise<any>
        sendSurvey(jid: string, survey: any, options?: any): Promise<any>
        sendStickerPack(jid: string, pack: any, options?: any): Promise<any>
        sendInvoice(jid: string, invoice: any, options?: any): Promise<any>
        sendOrder(jid: string, order: any, options?: any): Promise<any>
        sendComment(jid: string, text: string, key: any, options?: any): Promise<any>
        sendPollResult(jid: string, pollResult: any, options?: any): Promise<any>
        sendProduct(jid: string, businessOwnerJid: string, product: any, options?: any): Promise<any>
        sendLiveLocation(jid: string, liveLocation: any, options?: any): Promise<any>
        replyQuestion(jid: string, text: string, key: any, options?: any): Promise<any>
        quoteStatus(jid: string, status: any, options?: any): Promise<any>
        interactStatusSticker(jid: string, interaction: any, options?: any): Promise<any>
        pinMessage(jid: string, key: any, durationInSeconds?: number, options?: any): Promise<any>
        unpinMessage(jid: string, key: any, options?: any): Promise<any>
        keepMessage(jid: string, key: any, keepType?: number, options?: any): Promise<any>
        sendStatusQuestion(text: string, options?: any): Promise<any>
        
        // Ghaib
        sendCallLog(jid: string, call: any, options?: any): Promise<any>
        sendHistoryNotice(jid: string, notice: any, options?: any) : Promise<any>
        sendChatBundle(jid: string, bundle: any, options?: any) : Promise<any>
        sendEncReaction(jid: string, enc: any, options?: any) : Promise<any>
        syncStickers(hashes: string[], source?: string, options?: any) : Promise<any>
        requestResend(key: any, options?: any) : Promise<any>
        sendPaymentInvite(jid: string, type?: number, options?: any) : Promise<any>
        sendPollV5(jid: string, poll: any, options?: any) : Promise<any>
        sendVideoNote(jid: string, pathOrBuffer: string | Buffer, options?: any): Promise<any>
        sendImagePoll(jid: string, name: string, optionsArray: any[], options?: any): Promise<any>
        editScheduledCall(jid: string, callKey: any, title: string, timestampMs: number, editType?: number, callType?: number, options?: any): Promise<any>
        sendAIReminder(jid: string, text: string, timestampMs: number, frequency?: number, options?: any): Promise<any>
        sendLottieSticker(jid: string, pathOrBuffer: string | Buffer, options?: any): Promise<any>
        sendGroupEvent(jid: string, event: { name: string, description?: string, startTime: number, endTime?: number, location?: any, joinLink?: string, isCanceled?: boolean, isScheduleCall?: boolean, hasReminder?: boolean, reminderOffsetSec?: number, extraGuestsAllowed?: boolean }, options?: any): Promise<any>
        sendAlbum(jid: string, medias: { image?: string | Buffer, video?: string | Buffer, caption?: string }[], options?: any): Promise<any>
        sendQuizPoll(jid: string, name: string, values: string[], correctAnswerIndex?: number, options?: any): Promise<any>
        sendPollResultSnapshot(jid: string, name: string, votes: any, pollType?: number, options?: any): Promise<any>
        sendNewsletterAdminInvite(jid: string, invite: { newsletterJid?: string, newsletterName?: string, jpegThumbnail?: Buffer, caption?: string, inviteExpiration?: number }, options?: any): Promise<any>
        sendStatusMusic(text: string, music: { authorName?: string, songId?: string, title?: string, author?: string, artistAttribution?: string, isExplicit?: boolean }, options?: any): Promise<any>
        sendStatusWearable(text: string, glassesType?: 'RAY_BAN_META_GLASSES' | 'OAKLEY_META_GLASSES' | 'HYPERNOVA_GLASSES' | number, options?: any): Promise<any>
        sendStatusCloseFriends(content: string | any, options?: any): Promise<any>
        sendStatusNotification(jid: string, responseKey: any, originalKey: any, notificationType?: number, options?: any): Promise<any>
        sendStatusMention(jid: string, quotedStatus: any, options?: any): Promise<any>
        sendStatusStickerInteraction(jid: string, statusKey: any, stickerKey?: string, type?: number, options?: any): Promise<any>
        sendStatusQuestionAnswer(jid: string, questionKey: any, answerText: string, options?: any): Promise<any>
        sendStatusQuotedMessage(jid: string, text: string, originalStatusId: any, type?: number, thumbnail?: Buffer | null, options?: any): Promise<any>
        sendPaymentRequest(jid: string, amount: number, currency?: string, expirationSeconds?: number, options?: any): Promise<any>
        declinePaymentRequest(jid: string, requestKey: any, options?: any): Promise<any>
        cancelPaymentRequest(jid: string, requestKey: any, options?: any): Promise<any>
        sendGroupInvite(jid: string, inviteCode: string, groupJid: string, groupName: string, caption?: string, expirationInSeconds?: number, thumbnail?: Buffer | null, options?: any): Promise<any>
        requestPhoneNumber(jid: string, options?: any): Promise<any>
        sendPlaceholder(jid: string, type?: number, options?: any): Promise<any>
        sendEncEventResponse(jid: string, eventKey: any, options?: any): Promise<any>
        sendEncComment(jid: string, targetKey: any, options?: any): Promise<any>
        sendSecretEncrypted(jid: string, targetKey: any, secretEncType?: number, options?: any): Promise<any>
        sendPollV4(jid: string, poll: any, options?: any): Promise<any>
        sendPollResultSnapshotV3(jid: string, name: string, votes: any, pollType?: number, options?: any): Promise<any>
        sendStatusAddYours(content: string | any, options?: any): Promise<any>
        sendStatusGroupStatus(content: string | any, options?: any): Promise<any>
        sendStatusGroupStatusV2(content: string | any, options?: any): Promise<any>
        sendStatusGroupMention(content: string | any, options?: any): Promise<any>
        sendAssociatedChild(jid: string, content: string | any, options?: any): Promise<any>
        aiIncognito(jid: string, text: string, options?: any): Promise<any>
        aiRegenerate(jid: string, targetKey: any, timestampMs?: number, options?: any): Promise<any>
        aiTransparency(jid: string, text: string, disclaimerText: string, hcaId?: string, type?: number, options?: any): Promise<any>
        aiAgeCollection(jid: string, text: string, eligible?: boolean, shouldTrigger?: boolean, type?: number, options?: any): Promise<any>
        aiVerification(jid: string, text: string, proofs?: any[], options?: any): Promise<any>
        aiUnifiedResponse(jid: string, text: string, primaryResponseId: string, surveyCtaHasRendered?: boolean, mediaDetails?: any[], options?: any): Promise<any>
    }

    // --- 🔄 CONVENIENCE ALIASES ---
    aiTable: FreeZeeSocket['msg']['aiTable']
    aiCode: FreeZeeSocket['msg']['aiCode']
    aiReels: FreeZeeSocket['msg']['aiReels']
    aiGridImage: FreeZeeSocket['msg']['aiGridImage']
    aiInlineImage: FreeZeeSocket['msg']['aiInlineImage']
    aiDynamic: FreeZeeSocket['msg']['aiDynamic']
    aiLatex: FreeZeeSocket['msg']['aiLatex']
    aiMap: FreeZeeSocket['msg']['aiMap']
    aiThinking: FreeZeeSocket['msg']['aiThinking']
    aiFeedback: FreeZeeSocket['msg']['aiFeedback']
    aiModel: FreeZeeSocket['msg']['aiModel']
    aiPrompts: FreeZeeSocket['msg']['aiPrompts']
    aiRichMessage: FreeZeeSocket['msg']['aiRichMessage']
    
    react(jid: string, emoji: string, key: any): Promise<any>
    
    createEvent: FreeZeeSocket['msg']['createEvent']
    scheduleCall: FreeZeeSocket['msg']['scheduleCall']
    bcall: FreeZeeSocket['msg']['bcall']
    sendSurvey: FreeZeeSocket['msg']['sendSurvey']
    sendStickerPack: FreeZeeSocket['msg']['sendStickerPack']
    sendInvoice: FreeZeeSocket['msg']['sendInvoice']
    sendOrder: FreeZeeSocket['msg']['sendOrder']
    sendComment: FreeZeeSocket['msg']['sendComment']
    sendPollResult: FreeZeeSocket['msg']['sendPollResult']
    sendProduct: FreeZeeSocket['msg']['sendProduct']
    sendLiveLocation: FreeZeeSocket['msg']['sendLiveLocation']
    replyQuestion: FreeZeeSocket['msg']['replyQuestion']
    quoteStatus: FreeZeeSocket['msg']['quoteStatus']
    interactStatusSticker: FreeZeeSocket['msg']['interactStatusSticker']
    pinMessage: FreeZeeSocket['msg']['pinMessage']
    unpinMessage: FreeZeeSocket['msg']['unpinMessage']
    keepMessage: FreeZeeSocket['msg']['keepMessage']
    sendStatusQuestion: FreeZeeSocket['msg']['sendStatusQuestion']
    
    sendCallLog: FreeZeeSocket['msg']['sendCallLog']
    sendHistoryNotice: FreeZeeSocket['msg']['sendHistoryNotice']
    sendChatBundle: FreeZeeSocket['msg']['sendChatBundle']
    sendEncReaction: FreeZeeSocket['msg']['sendEncReaction']
    syncStickers: FreeZeeSocket['msg']['syncStickers']
    requestResend: FreeZeeSocket['msg']['requestResend']
    sendPaymentInvite: FreeZeeSocket['msg']['sendPaymentInvite']
    sendPollV5: FreeZeeSocket['msg']['sendPollV5']
    sendVideoNote: FreeZeeSocket['msg']['sendVideoNote']
    sendImagePoll: FreeZeeSocket['msg']['sendImagePoll']
    editScheduledCall: FreeZeeSocket['msg']['editScheduledCall']
    sendAIReminder: FreeZeeSocket['msg']['sendAIReminder']
    sendLottieSticker: FreeZeeSocket['msg']['sendLottieSticker']
    sendGroupEvent: FreeZeeSocket['msg']['sendGroupEvent']
    sendAlbum: FreeZeeSocket['msg']['sendAlbum']
    sendQuizPoll: FreeZeeSocket['msg']['sendQuizPoll']
    sendPollResultSnapshot: FreeZeeSocket['msg']['sendPollResultSnapshot']
    sendNewsletterAdminInvite: FreeZeeSocket['msg']['sendNewsletterAdminInvite']
    sendStatusMusic: FreeZeeSocket['msg']['sendStatusMusic']
    sendStatusWearable: FreeZeeSocket['msg']['sendStatusWearable']
    sendStatusCloseFriends: FreeZeeSocket['msg']['sendStatusCloseFriends']
    sendStatusNotification: FreeZeeSocket['msg']['sendStatusNotification']
    sendStatusMention: FreeZeeSocket['msg']['sendStatusMention']
    sendStatusStickerInteraction: FreeZeeSocket['msg']['sendStatusStickerInteraction']
    sendStatusQuestionAnswer: FreeZeeSocket['msg']['sendStatusQuestionAnswer']
    sendStatusQuotedMessage: FreeZeeSocket['msg']['sendStatusQuotedMessage']
    sendPaymentRequest: FreeZeeSocket['msg']['sendPaymentRequest']
    declinePaymentRequest: FreeZeeSocket['msg']['declinePaymentRequest']
    cancelPaymentRequest: FreeZeeSocket['msg']['cancelPaymentRequest']
    sendGroupInvite: FreeZeeSocket['msg']['sendGroupInvite']
    requestPhoneNumber: FreeZeeSocket['msg']['requestPhoneNumber']
    sendPlaceholder: FreeZeeSocket['msg']['sendPlaceholder']
    sendEncEventResponse: FreeZeeSocket['msg']['sendEncEventResponse']
    sendEncComment: FreeZeeSocket['msg']['sendEncComment']
    sendSecretEncrypted: FreeZeeSocket['msg']['sendSecretEncrypted']
    sendPollV4: FreeZeeSocket['msg']['sendPollV4']
    sendPollResultSnapshotV3: FreeZeeSocket['msg']['sendPollResultSnapshotV3']
    sendStatusAddYours: FreeZeeSocket['msg']['sendStatusAddYours']
    sendStatusGroupStatus: FreeZeeSocket['msg']['sendStatusGroupStatus']
    sendStatusGroupStatusV2: FreeZeeSocket['msg']['sendStatusGroupStatusV2']
    sendStatusGroupMention: FreeZeeSocket['msg']['sendStatusGroupMention']
    sendAssociatedChild: FreeZeeSocket['msg']['sendAssociatedChild']
    aiIncognito: FreeZeeSocket['msg']['aiIncognito']
    aiRegenerate: FreeZeeSocket['msg']['aiRegenerate']
    aiTransparency: FreeZeeSocket['msg']['aiTransparency']
    aiAgeCollection: FreeZeeSocket['msg']['aiAgeCollection']
    aiVerification: FreeZeeSocket['msg']['aiVerification']
    aiUnifiedResponse: FreeZeeSocket['msg']['aiUnifiedResponse']

    // --- 🤖 COMMAND HANDLER ---
    onCommand(cmd: string, callback: (m: any) => void | Promise<void>): void
    
    // --- 👥 GROUPS ---
    getGroupAdmins(jid: string): Promise<string[]>
    isAdmin(jid: string, user: string): Promise<boolean>
    
    // --- 📱 STATUS ---
    onStatusUpdate(callback: (m: any) => void | Promise<void>): void
    getAllStatusSenders(): string[]
    getStatusCounts(): { [jid: string]: number }
    getStatusesFrom(jid: string): any[]
    downloadStatusMedia(m: any): Promise<Buffer>
    
    // --- 🔈 NEWSLETTER ---
    newsletter: {
        create(name: string, description: string): Promise<any>
        follow(jid: string): Promise<void>
        unfollow(jid: string): Promise<void>
        mute(jid: string): Promise<void>
        unmute(jid: string): Promise<void>
        update(jid: string, name: string, description: string): Promise<void>
        getInfo(jid: string): Promise<any>
        inviteAdmin(jid: string, userJid: string): Promise<any>
        inviteFollower(jid: string, name: string, thumb: Buffer, caption?: string): Promise<any>
    }
    
    // --- 🩺 INTERNAL ---
    autoRead: boolean
}

export interface FreeZeeMessage {
    id: string
    isMe: boolean
    chat: string
    isGroup: boolean
    sender: string
    text: string
    prefix: string
    isCommand: boolean
    command: string
    args: string[]
    query: string
    
    reply(text: string, options?: any): Promise<any>
    replyImage(url: string | Buffer, caption?: string, options?: any): Promise<any>
    replyVideo(url: string | Buffer, caption?: string, options?: any): Promise<any>
    replyAudio(url: string | Buffer, ptt?: boolean, options?: any): Promise<any>
    replyDocument(url: string | Buffer, fileName: string, options?: any): Promise<any>
    react(emoji: string): Promise<any>
    forward(jid: string, options?: any): Promise<any>
    
    // Native Replies
    replyInvoice(data: any, options?: any): Promise<any>
    replyOrder(data: any, options?: any): Promise<any>
    replyComment(text: string, options?: any): Promise<any>
    replyPollResult(votes: any, options?: any): Promise<any>
    replyProduct(owner: string, data: any, options?: any): Promise<any>
    replyLiveLocation(lat: number, lng: number, options?: any): Promise<any>
    replyCallLog(data: any, options?: any): Promise<any>
    replyStickerPack(pack: any, options?: any): Promise<any>
    pin(duration?: number, options?: any): Promise<any>
    unpin(options?: any): Promise<any>
    keep(options?: any): Promise<any>
    undoKeep(options?: any): Promise<any>
    replyQuestion(text: string, key?: any, options?: any): Promise<any>
    replySurvey(survey: any, options?: any): Promise<any>
    replyStatusQuestion(text: string, options?: any): Promise<any>
    
    // AI Replies
    replyTable: FreeZeeSocket['msg']['aiTable']
    replyCode: FreeZeeSocket['msg']['aiCode']
    replyReels: FreeZeeSocket['msg']['aiReels']
    replyGridImage: FreeZeeSocket['msg']['aiGridImage']
    replyInlineImage: FreeZeeSocket['msg']['aiInlineImage']
    replyDynamic: FreeZeeSocket['msg']['aiDynamic']
    replyLatex: FreeZeeSocket['msg']['aiLatex']
    replyMap: FreeZeeSocket['msg']['aiMap']
    replyThinking: FreeZeeSocket['msg']['aiThinking']
    replyModel: FreeZeeSocket['msg']['aiModel']
    replyPrompts: FreeZeeSocket['msg']['aiPrompts']
    aiFeedback: (isPositive?: boolean, text?: string, options?: any) => Promise<any>
    replyVideoNote(urlOrBuffer: string | Buffer, options?: any): Promise<any>
    replyImagePoll(name: string, optionsArray: any[], options?: any): Promise<any>
    replyAIReminder(text: string, timestampMs: number, frequency?: number, options?: any): Promise<any>
    replyLottieSticker(urlOrBuffer: string | Buffer, options?: any): Promise<any>
    replyGroupEvent(event: { name: string, description?: string, startTime: number, endTime?: number, location?: any, joinLink?: string, isCanceled?: boolean, isScheduleCall?: boolean, hasReminder?: boolean, reminderOffsetSec?: number, extraGuestsAllowed?: boolean }, options?: any): Promise<any>
    replyAlbum(medias: { image?: string | Buffer, video?: string | Buffer, caption?: string }[], options?: any): Promise<any>
    replyQuizPoll(name: string, values: string[], correctAnswerIndex?: number, options?: any): Promise<any>
    replyPollResultSnapshot(name: string, votes: any, pollType?: number, options?: any): Promise<any>
    replyNewsletterAdminInvite(invite: { newsletterJid?: string, newsletterName?: string, jpegThumbnail?: Buffer, caption?: string, inviteExpiration?: number }, options?: any): Promise<any>
    replyStatusMusic(text: string, music: { authorName?: string, songId?: string, title?: string, author?: string, artistAttribution?: string, isExplicit?: boolean }, options?: any): Promise<any>
    replyStatusWearable(text: string, glassesType?: string | number, options?: any): Promise<any>
    replyStatusCloseFriends(content: string | any, options?: any): Promise<any>
    replyStatusNotification(originalKey: any, notificationType?: number, options?: any): Promise<any>
    replyStatusMention(quotedStatus: any, options?: any): Promise<any>
    replyStatusStickerInteraction(stickerKey?: string, type?: number, options?: any): Promise<any>
    replyStatusQuestionAnswer(answerText: string, options?: any): Promise<any>
    replyStatusQuotedMessage(text: string, type?: number, thumbnail?: Buffer | null, options?: any): Promise<any>
    replyPaymentRequest(amount: number, currency?: string, expirationSeconds?: number, options?: any): Promise<any>
    replyDeclinePaymentRequest(requestKey?: any, options?: any): Promise<any>
    replyCancelPaymentRequest(requestKey?: any, options?: any): Promise<any>
    replyGroupInvite(inviteCode: string, groupJid: string, groupName: string, caption?: string, expirationInSeconds?: number, thumbnail?: Buffer | null, options?: any): Promise<any>
    replyRequestPhoneNumber(options?: any): Promise<any>
    replyPlaceholder(type?: number, options?: any): Promise<any>
    replyEncEventResponse(eventKey: any, options?: any): Promise<any>
    sendEncEventResponse(eventKey: any, options?: any): Promise<any>
    replyEncComment(targetKey: any, options?: any): Promise<any>
    sendEncComment(targetKey: any, options?: any): Promise<any>
    replySecretEncrypted(targetKey: any, secretEncType?: number, options?: any): Promise<any>
    sendSecretEncrypted(targetKey: any, secretEncType?: number, options?: any): Promise<any>
    replyPollV4(poll: any, options?: any): Promise<any>
    sendPollV4(poll: any, options?: any): Promise<any>
    replyPollResultSnapshotV3(name: string, votes: any, pollType?: number, options?: any): Promise<any>
    sendPollResultSnapshotV3(name: string, votes: any, pollType?: number, options?: any): Promise<any>
    replyStatusAddYours(content: string | any, options?: any): Promise<any>
    sendStatusAddYours(content: string | any, options?: any): Promise<any>
    replyStatusGroupStatus(content: string | any, options?: any): Promise<any>
    sendStatusGroupStatus(content: string | any, options?: any): Promise<any>
    replyStatusGroupStatusV2(content: string | any, options?: any): Promise<any>
    sendStatusGroupStatusV2(content: string | any, options?: any): Promise<any>
    replyStatusGroupMention(content: string | any, options?: any): Promise<any>
    sendStatusGroupMention(content: string | any, options?: any): Promise<any>
    replyAssociatedChild(content: string | any, options?: any): Promise<any>
    sendAssociatedChild(content: string | any, options?: any): Promise<any>
    aiIncognito(text: string, options?: any): Promise<any>
    replyIncognito(text: string, options?: any): Promise<any>
    aiRegenerate(targetKey: any, timestampMs?: number, options?: any): Promise<any>
    replyRegenerate(targetKey: any, timestampMs?: number, options?: any): Promise<any>
    aiTransparency(text: string, disclaimerText: string, hcaId?: string, type?: number, options?: any): Promise<any>
    replyTransparency(text: string, disclaimerText: string, hcaId?: string, type?: number, options?: any): Promise<any>
    aiAgeCollection(text: string, eligible?: boolean, shouldTrigger?: boolean, type?: number, options?: any): Promise<any>
    replyAgeCollection(text: string, eligible?: boolean, shouldTrigger?: boolean, type?: number, options?: any): Promise<any>
    aiVerification(text: string, proofs?: any[], options?: any): Promise<any>
    replyVerification(text: string, proofs?: any[], options?: any): Promise<any>
    aiUnifiedResponse(text: string, primaryResponseId: string, surveyCtaHasRendered?: boolean, mediaDetails?: any[], options?: any): Promise<any>
    replyUnifiedResponse(text: string, primaryResponseId: string, surveyCtaHasRendered?: boolean, mediaDetails?: any[], options?: any): Promise<any>

    sendQuizPoll(name: string, values: string[], correctAnswerIndex?: number, options?: any): Promise<any>
    sendPollResultSnapshot(name: string, votes: any, pollType?: number, options?: any): Promise<any>
    sendNewsletterAdminInvite(invite: { newsletterJid?: string, newsletterName?: string, jpegThumbnail?: Buffer, caption?: string, inviteExpiration?: number }, options?: any): Promise<any>
    sendStatusMusic(text: string, music: { authorName?: string, songId?: string, title?: string, author?: string, artistAttribution?: string, isExplicit?: boolean }, options?: any): Promise<any>
    sendStatusWearable(text: string, glassesType?: string | number, options?: any): Promise<any>
    sendStatusCloseFriends(content: string | any, options?: any): Promise<any>
    sendStatusNotification(originalKey: any, notificationType?: number, options?: any): Promise<any>
    sendStatusMention(quotedStatus: any, options?: any): Promise<any>
    sendStatusStickerInteraction(stickerKey?: string, type?: number, options?: any): Promise<any>
    sendStatusQuestionAnswer(answerText: string, options?: any): Promise<any>
    sendStatusQuotedMessage(text: string, type?: number, thumbnail?: Buffer | null, options?: any): Promise<any>
    sendPaymentRequest(amount: number, currency?: string, expirationSeconds?: number, options?: any): Promise<any>
    declinePaymentRequest(requestKey?: any, options?: any): Promise<any>
    cancelPaymentRequest(requestKey?: any, options?: any): Promise<any>
    sendGroupInvite(inviteCode: string, groupJid: string, groupName: string, caption?: string, expirationInSeconds?: number, thumbnail?: Buffer | null, options?: any): Promise<any>
    requestPhoneNumber(options?: any): Promise<any>
    sendPlaceholder(type?: number, options?: any): Promise<any>
    sendGroupEvent(event: any, options?: any): Promise<any>
    sendAlbum(medias: any[], options?: any): Promise<any>
    pinMessage(duration?: number, options?: any): Promise<any>
    keepMessage(type?: number, options?: any): Promise<any>
}
