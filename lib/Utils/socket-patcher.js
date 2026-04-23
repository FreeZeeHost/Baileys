"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const WAProto_1 = require("../../WAProto")
const generics_1 = require("./generics")

const patchSocket = (sock) => {
    // --- 0. INTERNAL STORES ---
    let stealthModeActive = true
    const statusStore = {} // Stores status by sender JID: [status1, status2, ...]

    // --- 1. SMART QUEUE ENGINE ---
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

    // --- 3. REPLACEMENT FOR SEND MESSAGE ---
    sock.originalSendMessage = sock.sendMessage.bind(sock)
    sock.sendMessage = async (jid, content, options = {}) => {
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

    // --- 4. STATUS MANAGER (AUTO-TRACKING) ---
    sock.ev.on('messages.upsert', ({ messages, type }) => {
        if (type !== 'notify') return
        for (const m of messages) {
            if (m.key.remoteJid === 'status@broadcast') {
                const sender = m.key.participant || m.key.remoteJid
                if (!statusStore[sender]) statusStore[sender] = []
                
                // Add useful metadata
                m.statusData = {
                    type: Object.keys(m.message || {})[0],
                    caption: m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || m.message?.extendedTextMessage?.text || "",
                    timestamp: m.messageTimestamp,
                    sender
                }
                
                // Keep only last 20 statuses per person to save memory
                statusStore[sender].push(m)
                if (statusStore[sender].length > 20) statusStore[sender].shift()
            }
        }
    })

    // Get all recorded status senders
    sock.getAllStatusSenders = () => Object.keys(statusStore)

    // Get statuses from a specific sender
    sock.getStatusesFrom = (jid) => statusStore[jid] || []

    // Helper for Real-time Callback
    sock.onStatusUpdate = (callback) => {
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return
            for (const m of messages) {
                if (m.key.remoteJid === 'status@broadcast' && m.statusData) {
                    await callback(m)
                }
            }
        })
    }

    // --- 5. EXCLUSIVE HELPERS ---
    
    sock.setStealthMode = (active) => {
        stealthModeActive = !!active
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
        // Also clear old statuses (older than 24h)
        const now = Math.floor(Date.now() / 1000)
        for (const jid in statusStore) {
            statusStore[jid] = statusStore[jid].filter(s => (now - s.messageTimestamp) < 86400)
            if (statusStore[jid].length === 0) delete statusStore[jid]
        }
    }

    return sock
}
exports.patchSocket = patchSocket
