"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const WAProto_1 = require("../../WAProto")
const generics_1 = require("./generics")

const patchSocket = (sock) => {
    // 1. Interactive Message Helper (Carousel, Buttons, etc)
    sock.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => sock.sendMessage(jid, { text, footer, buttons, headerType: 1, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => sock.sendMessage(jid, { title, text, footer, buttonText, sections, ...options }),
        poll: (jid, name, values, selectableCount = 1, options = {}) => sock.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => sock.sendMessage(jid, { carouselMessages: cards, ...options }),
        nativeTable: (jid, title, rows, options = {}) => sock.sendMessage(jid, { nativeFlowMessage: { buttons: [{ name: "table", buttonParamsJson: JSON.stringify({ title, rows }) }] }, ...options })
    }

    // 2. Direct Rich Helper
    sock.sendRichMessage = async (jid, content, options = {}) => {
        const { generateWAMessage, prepareWAMessageMedia } = require('./messages')
        const msg = await generateWAMessage(jid, content, { logger: sock.logger, ...options })
        return sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
    }

    // 3. Album Sender
    sock.sendAlbumMessage = async (jid, medias, caption = "", options = {}) => {
        const album = []
        for (const media of medias) {
            const m = await sock.sendMessage(jid, { [media.type]: media.data, caption: media.caption || "" }, options)
            album.push(m)
        }
        return album
    }

    // 4. Group Aliases
    sock.groupInvite = (jid, code, expiration, text) => sock.sendMessage(jid, { groupInvite: { inviteCode: code, inviteExpiration: expiration, text, jid, subject: "Group Invite" } })
    
    // 5. Automatic Stealth Mode (Type & Record)
    const originalSendMessage = sock.sendMessage.bind(sock)
    sock.sendMessage = async (jid, content, options = {}) => {
        if (!options.noStealth) {
            const isAudio = content.audio || (content.mimetype && content.mimetype.includes("audio"))
            await sock.sendPresenceUpdate(isAudio ? "recording" : "composing", jid)
            await (0, generics_1.delay)(options.stealthDelay || 1500)
            await sock.sendPresenceUpdate("paused", jid)
        }
        return originalSendMessage(jid, content, options)
    }

    return sock
}
exports.patchSocket = patchSocket
