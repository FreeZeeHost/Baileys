"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const crypto_1 = require("crypto")
const WAProto_1 = require("../../WAProto")
const WABinary_1 = require("../WABinary")

const generateParticipantHashV2 = (participants) => {
    const sortedParticipants = [...(participants || [])].sort((a, b) => (a?.id || '').localeCompare(b?.id || ''))
    const hash = (0, crypto_1.createHash)('sha256')
    for (const { id } of sortedParticipants) {
        if (id) hash.update(id)
    }
    return hash.digest('base64')
}

const getContentType = (message) => {
    if (message) {
        const keys = Object.keys(message)
        const type = keys.filter(k => k !== 'messageContextInfo' && k !== 'senderKeyDistributionMessage')[0]
        return type
    }
}

const normalizeMessageContent = (content) => {
    if (!content) return undefined
    if (content.viewOnceMessageV2) content = content.viewOnceMessageV2.message
    if (content.viewOnceMessageV2Extension) content = content.viewOnceMessageV2Extension.message
    if (content.ephemeralMessage) content = content.ephemeralMessage.message
    if (content.viewOnceMessage) content = content.viewOnceMessage.message
    if (content.documentWithCaptionMessage) content = content.documentWithCaptionMessage.message
    if (content.editMessage) content = content.editMessage.message
    return content
}

const extractMessageContent = (content) => {
    const normalized = normalizeMessageContent(content)
    if (normalized?.templateMessage) return normalized.templateMessage.hydratedTemplate || normalized.templateMessage.hydratedFourRowTemplate
    if (normalized?.hydratedTemplateMessage) return normalized.hydratedTemplateMessage.hydratedTemplate
    return normalized
}

const aggregateMessageKeysNotFromMe = (messages) => {
    const keys = []
    for (const msg of (messages || [])) {
        if (msg?.key && !msg.key.fromMe) {
            keys.push(msg.key)
        }
    }
    return keys
}

const aggregateMessageContent = (messages) => {
    const content = []
    for (const msg of (messages || [])) {
        if (msg?.message) {
            const c = extractMessageContent(msg.message)
            if (c) content.push(c)
        }
    }
    return content
}

const generateWAMessageFromContent = (jid, content, options) => {
    const { generateMessageID } = require('./generics')
    return WAProto_1.proto.WebMessageInfo.fromObject({
        key: {
            remoteJid: jid,
            fromMe: true,
            id: options.messageId || generateMessageID(),
        },
        message: content,
        messageTimestamp: Math.floor(Date.now() / 1000),
        status: 1,
        ...options
    })
}

const generateWAMessage = async (jid, content, options) => {
    const { prepareWAMessageMedia } = require('./messages-media')
    // Handle media if present in content
    if (typeof content === 'object' && content !== null && ('image' in content || 'video' in content || 'audio' in content || 'document' in content)) {
        const media = await prepareWAMessageMedia(content, options)
        content = { ...content, ...media }
    }
    return generateWAMessageFromContent(jid, content, options)
}

module.exports = {
    generateParticipantHashV2,
    getContentType,
    normalizeMessageContent,
    extractMessageContent,
    aggregateMessageKeysNotFromMe,
    aggregateMessageContent,
    generateWAMessageFromContent,
    generateWAMessage,
    downloadMediaMessage: require('./messages-media').downloadMediaMessage,
    prepareWAMessageMedia: require('./messages-media').prepareWAMessageMedia
}
