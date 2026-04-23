"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const WAProto_1 = require("../../WAProto")
const generics_1 = require("./generics")

const patchSocket = (sock) => {
    // --- 0. INTERNAL STORES ---
    let stealthModeActive = true
    const statusStore = {} 

    // --- 1. SMART QUEUE ENGINE ---
    const msgQueue = []
    let isProcessing = false

    const processQueue = async () => {
        if (isProcessing || msgQueue.length === 0) return
        isProcessing = true
        
        try {
            while (msgQueue.length > 0) {
                const { jid, content, options, resolve, reject } = msgQueue.shift()
                try {
                    // Jeda aman 1-2 detik agar terlihat manusiawi
                    const delayTime = Math.floor(Math.random() * 1000) + 1000
                    await (0, generics_1.delay)(delayTime)
                    
                    const result = await sock.originalSendMessage(jid, content, options)
                    resolve(result)
                } catch (err) {
                    console.error("[QUEUE ERROR]", err)
                    reject(err)
                }
            }
        } finally {
            isProcessing = false
            // Cek lagi jika ada pesan baru masuk saat processing
            if (msgQueue.length > 0) processQueue()
        }
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
    if (sock.sendMessage && !sock.originalSendMessage) {
        sock.originalSendMessage = sock.sendMessage.bind(sock)
        sock.sendMessage = async (jid, content, options = {}) => {
            // Presence Update (Typing)
            if (stealthModeActive && !options.noStealth) {
                try {
                    const isAudio = content.audio || (content.mimetype && content.mimetype.includes("audio"))
                    await sock.sendPresenceUpdate(isAudio ? "recording" : "composing", jid)
                } catch {}
            }

            // Urgent/Urgent Response
            if (options.urgent) return sock.originalSendMessage(jid, content, options)
            
            // Push to Queue
            return new Promise((resolve, reject) => {
                msgQueue.push({ jid, content, options, resolve, reject })
                processQueue()
            })
        }
    }

    // --- 4. STATUS MANAGER ---
    sock.ev.on('messages.upsert', ({ messages, type }) => {
        if (type !== 'notify') return
        for (const m of messages) {
            if (m.key.remoteJid === 'status@broadcast') {
                const sender = m.key.participant || m.key.remoteJid
                if (!statusStore[sender]) statusStore[sender] = []
                
                m.statusData = {
                    type: Object.keys(m.message || {})[0],
                    caption: m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || m.message?.extendedTextMessage?.text || "",
                    timestamp: m.messageTimestamp,
                    sender
                }
                
                statusStore[sender].push(m)
                if (statusStore[sender].length > 20) statusStore[sender].shift()
            }
        }
    })

    sock.getAllStatusSenders = () => Object.keys(statusStore)
    sock.getStatusesFrom = (jid) => statusStore[jid] || []
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
    sock.setStealthMode = (active) => { stealthModeActive = !!active }

    sock.sendRichMessage = async (jid, content, options = {}) => {
        const { generateWAMessage } = require('./messages')
        const msg = await generateWAMessage(jid, content, { logger: sock.logger, ...options })
        return sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
    }

    sock.sendAlbumMessage = async (jid, medias, caption = "", options = {}) => {
        const album = []
        for (const media of medias) {
            try {
                const m = await sock.sendMessage(jid, { [media.type]: media.data, caption: media.caption || "" }, options)
                album.push(m)
            } catch {}
        }
        return album
    }

    sock.autoOptimize = () => {
        if (sock.store) {
            sock.store.chats.clear()
            sock.store.messages = {}
        }
        const now = Math.floor(Date.now() / 1000)
        for (const jid in statusStore) {
            statusStore[jid] = statusStore[jid].filter(s => (now - s.messageTimestamp) < 86400)
            if (statusStore[jid].length === 0) delete statusStore[jid]
        }
    }

    return sock
}
exports.patchSocket = patchSocket
