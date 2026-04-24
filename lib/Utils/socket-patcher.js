"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const generics_1 = require("./generics")

const patchSocket = (sock) => {
    // --- 0. INTERNAL STORES ---
    let stealthActive = true
    const statusStore = {}

    // --- 1. INTERACTIVE MESSAGE HELPERS (sock.msg) ---
    sock.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => sock.sendMessage(jid, { text, footer, buttons, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => sock.sendMessage(jid, { title, text, footer, buttonText, sections, ...options }),
        poll: (jid, name, values, selectableCount = 1, options = {}) => sock.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => sock.sendMessage(jid, { carouselMessages: cards, ...options }),
        nativeTable: (jid, title, rows, options = {}) => sock.sendMessage(jid, { nativeFlowMessage: { buttons: [{ name: "table", buttonParamsJson: JSON.stringify({ title, rows }) }] }, ...options })
    }

    // --- 2. LIGHTWEIGHT OVERRIDES ---
    if (sock.sendMessage && !sock.originalSendMessage) {
        sock.originalSendMessage = sock.sendMessage.bind(sock)
        sock.sendMessage = async (jid, content, options = {}) => {
            if (stealthActive && !options.noStealth) {
                const isAudio = content.audio || (content.mimetype && content.mimetype.includes("audio"))
                sock.sendPresenceUpdate(isAudio ? "recording" : "composing", jid).catch(() => {})
            }
            // Kirim langsung, tanpa queue yang bikin macet
            return sock.originalSendMessage(jid, content, options)
        }
    }

    // --- 3. STATUS MANAGER (FOR GETSW) ---
    sock.ev.on('messages.upsert', ({ messages, type }) => {
        if (type !== 'notify') return
        for (const m of messages) {
            if (m.key.remoteJid === 'status@broadcast') {
                const sender = m.key.participant || m.key.remoteJid
                if (!statusStore[sender]) statusStore[sender] = []
                m.statusData = {
                    type: Object.keys(m.message || {})[0],
                    caption: m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || m.message?.extendedTextMessage?.text || "",
                    sender
                }
                statusStore[sender].push(m)
                if (statusStore[sender].length > 20) statusStore[sender].shift()
            }
        }
    })

    sock.onStatusUpdate = (callback) => {
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return
            for (const m of messages) {
                if (m.key.remoteJid === 'status@broadcast') {
                    await callback(m).catch(() => {})
                }
            }
        })
    }

    // --- 4. EXCLUSIVE HELPERS ---
    sock.getAllStatusSenders = () => Object.keys(statusStore)
    sock.getStatusesFrom = (jid) => statusStore[jid] || []
    sock.setStealthMode = (active) => { stealthActive = !!active }

    sock.onCommand = (cmd, handler) => {
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return
            const m = messages[0]
            if (!m.message) return
            const body = m.message.conversation || m.message.extendedTextMessage?.text || ""
            const isCmd = typeof cmd === 'string' ? body.startsWith(cmd) : cmd.test(body)
            if (isCmd) {
                const args = body.trim().split(/ +/).slice(1)
                await handler(m, args).catch(() => {})
            }
        })
    }

    sock.sendRichMessage = async (jid, content, options = {}) => {
        const { generateWAMessage } = require('./messages')
        const msg = await generateWAMessage(jid, content, { logger: sock.logger, ...options })
        return sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
    }

    sock.sendAlbumMessage = async (jid, medias, caption = "", options = {}) => {
        const album = []
        for (const media of medias) {
            const m = await sock.sendMessage(jid, { [media.type]: media.data, caption: media.caption || "" }, options).catch(() => {})
            if (m) album.push(m)
        }
        return album
    }

    sock.autoOptimize = () => {
        if (sock.store) { sock.store.chats.clear(); sock.store.messages = {} }
    }

    return sock
}
exports.patchSocket = patchSocket
