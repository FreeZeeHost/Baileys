"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const WAProto_1 = require("../../WAProto")
const generics_1 = require("./generics")

const patchSocket = (sock) => {
    // --- 1. SMART QUEUE ENGINE (ANTI-SPAM) ---
    const msgQueue = []
    let isProcessing = false

    const processQueue = async () => {
        if (isProcessing || msgQueue.length === 0) return
        isProcessing = true
        while (msgQueue.length > 0) {
            const { jid, content, options, resolve, reject } = msgQueue.shift()
            try {
                // Random delay between 1.5s to 3.5s for human-like behavior
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
        // Automatically apply presence (typing/recording)
        if (!options.noStealth) {
            const isAudio = content.audio || (content.mimetype && content.mimetype.includes("audio"))
            await sock.sendPresenceUpdate(isAudio ? "recording" : "composing", jid)
        }

        // If 'urgent' option is provided, bypass queue
        if (options.urgent) {
            return sock.originalSendMessage(jid, content, options)
        }

        // Push to Smart Queue
        return new Promise((resolve, reject) => {
            msgQueue.push({ jid, content, options, resolve, reject })
            processQueue()
        })
    }

    // --- 4. EXCLUSIVE HELPERS ---
    
    // sendRichMessage: Shortcut for generating and relaying complex messages
    sock.sendRichMessage = async (jid, content, options = {}) => {
        const { generateWAMessage } = require('./messages')
        const msg = await generateWAMessage(jid, content, { logger: sock.logger, ...options })
        return sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
    }

    // sendAlbumMessage: Send multiple media at once
    sock.sendAlbumMessage = async (jid, medias, caption = "", options = {}) => {
        const album = []
        for (const media of medias) {
            const m = await sock.sendMessage(jid, { [media.type]: media.data, caption: media.caption || "" }, options)
            album.push(m)
        }
        return album
    }

    // autoClearMemory: Memory optimization helper
    sock.autoOptimize = () => {
        if (sock.store) {
            console.log("[FREEZEE] Optimizing Memory: Clearing expired status and chats...")
            sock.store.chats.clear()
            sock.store.messages = {}
        }
    }

    return sock
}
exports.patchSocket = patchSocket
