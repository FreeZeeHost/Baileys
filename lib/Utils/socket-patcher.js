"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const WAProto_1 = require("../../WAProto")
const generics_1 = require("./generics")

const patchSocket = (sock) => {
    // --- 0. SETTINGS STATE ---
    let stealthModeActive = true

    // --- 1. SMART QUEUE ENGINE (ANTI-SPAM) ---
    const msgQueue = []
    let isProcessing = false

    const processQueue = async () => {
        if (isProcessing || msgQueue.length === 0) return
        isProcessing = true
        while (msgQueue.length > 0) {
            const { jid, content, options, resolve, reject } = msgQueue.shift()
            try {
                const delayTime = Math.floor(Math.random() * 2000) + 1500
                await (0, generics_1.delay)(delayTime)
                const result = await sock.originalSendMessage(jid, content, options)
                resolve(result)
            } catch (err) {
                reject(err)
            }
        }
        isProcessing = false
    }

    // --- 2. INTERACTIVE MESSAGE HELPERS ---
    sock.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => sock.sendMessage(jid, { text, footer, buttons, headerType: 1, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => sock.sendMessage(jid, { title, text, footer, buttonText, sections, ...options }),
        poll: (jid, name, values, selectableCount = 1, options = {}) => sock.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => sock.sendMessage(jid, { carouselMessages: cards, ...options }),
        nativeTable: (jid, title, rows, options = {}) => sock.sendMessage(jid, { nativeFlowMessage: { buttons: [{ name: "table", buttonParamsJson: JSON.stringify({ title, rows }) }] }, ...options })
    }

    // --- 3. REPLACEMENT FOR SEND MESSAGE (STEALTH + QUEUE) ---
    sock.originalSendMessage = sock.sendMessage.bind(sock)
    sock.sendMessage = async (jid, content, options = {}) => {
        // Apply presence (typing/recording) ONLY if stealthMode is active and not explicitly disabled in options
        if (stealthModeActive && !options.noStealth) {
            const isAudio = content.audio || (content.mimetype && content.mimetype.includes("audio"))
            await sock.sendPresenceUpdate(isAudio ? "recording" : "composing", jid)
        }

        if (options.urgent) return sock.originalSendMessage(jid, content, options)
        
        return new Promise((resolve, reject) => {
            msgQueue.push({ jid, content, options, resolve, reject })
            processQueue()
        })
    }

    // --- 4. EXCLUSIVE STATUS DETECTOR (REAL-TIME) ---
    sock.onStatusUpdate = (callback) => {
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return
            for (const m of messages) {
                if (m.key.remoteJid === 'status@broadcast') {
                    m.statusData = {
                        type: Object.keys(m.message || {})[0],
                        caption: m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || m.message?.extendedTextMessage?.text || "",
                        sender: m.key.participant || m.key.remoteJid
                    }
                    await callback(m)
                }
            }
        })
    }

    // --- 5. EXCLUSIVE HELPERS ---
    
    // Toggle Stealth Mode on/off
    sock.setStealthMode = (active) => {
        stealthModeActive = !!active
        console.log(`[FREEZEE] Stealth Mode (Auto-Typing) is now: ${stealthModeActive ? 'ON ✅' : 'OFF ❌'}`)
    }

    sock.sendRichMessage = async (jid, content, options = {}) => {
        const { generateWAMessage } = require('./messages')
        const msg = await generateWAMessage(jid, content, { logger: sock.logger, ...options })
        return sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
    }

    sock.sendAlbumMessage = async (jid, medias, caption = "", options = {}) => {
        const album = []
        for (const media of medias) {
            const m = await sock.sendMessage(jid, { [media.type]: media.data, caption: media.caption || "" }, options)
            album.push(m)
        }
        return album
    }

    sock.autoOptimize = () => {
        if (sock.store) {
            sock.store.chats.clear()
            sock.store.messages = {}
        }
    }

    return sock
}
exports.patchSocket = patchSocket
