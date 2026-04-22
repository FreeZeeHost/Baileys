"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const crypto_1 = require("crypto")
const WAProto_1 = require("../../WAProto")
const WABinary_1 = require("../WABinary")

const generateParticipantHashV2 = (participants) => {
    const sortedParticipants = participants.sort((a, b) => a.id.localeCompare(b.id))
    const hash = (0, crypto_1.createHash)('sha256')
    for (const { id } of sortedParticipants) {
        hash.update(id)
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

const extractMessageContent = (content) => {
    if (content?.viewOnceMessage) return content.viewOnceMessage.message
    if (content?.viewOnceMessageV2) return content.viewOnceMessageV2.message
    if (content?.viewOnceMessageV2Extension) return content.viewOnceMessageV2Extension.message
    if (content?.ephemeralMessage) return content.ephemeralMessage.message
    if (content?.templateMessage) return content.templateMessage.hydratedTemplate || content.templateMessage.hydratedFourRowTemplate
    if (content?.hydratedTemplateMessage) return content.hydratedTemplateMessage.hydratedTemplate
    return content
}

module.exports = {
    generateParticipantHashV2,
    getContentType,
    extractMessageContent,
    // Add other common message utils here if needed
    downloadMediaMessage: require('./messages-media').downloadMediaMessage,
    prepareWAMessageMedia: require('./messages-media').prepareWAMessageMedia,
    generateWAMessageFromContent: (jid, content, options) => {
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
}
