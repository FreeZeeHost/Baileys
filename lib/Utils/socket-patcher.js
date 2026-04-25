"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const patchSocket = (sock) => {
    // --- 1. INTERACTIVE MESSAGE HELPERS (sock.msg) ---
    sock.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => sock.sendMessage(jid, { text, footer, buttons, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => sock.sendMessage(jid, { title, text, footer, buttonText, sections, ...options }),
        poll: (jid, name, values, selectableCount = 1, options = {}) => sock.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => sock.sendMessage(jid, { carouselMessages: cards, ...options }),
        nativeTable: (jid, title, rows, options = {}) => sock.sendMessage(jid, { nativeFlowMessage: { buttons: [{ name: "table", buttonParamsJson: JSON.stringify({ title, rows }) }] }, ...options })
    }

    // --- 2. MANUAL STEALTH FUNCTIONS ---
    sock.simulateTyping = async (jid, duration = 1500) => {
        await sock.sendPresenceUpdate("composing", jid)
        await new Promise(r => setTimeout(r, duration))
        await sock.sendPresenceUpdate("paused", jid)
    }

    sock.simulateRecording = async (jid, duration = 1500) => {
        await sock.sendPresenceUpdate("recording", jid)
        await new Promise(r => setTimeout(r, duration))
        await sock.sendPresenceUpdate("paused", jid)
    }

    // --- 3. STATUS TRACKER (FOR GETSW) ---
    const statusStore = {}
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

    sock.getAllStatusSenders = () => Object.keys(statusStore)
    sock.getStatusesFrom = (jid) => statusStore[jid] || []
    
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

    // --- 4. ADVANCED MEDIA SENDERS ---
    
    // Kirim Album Massal
    sock.sendAlbumMessage = async (jid, medias, caption = "", options = {}) => {
        const album = []
        for (const media of medias) {
            const m = await sock.sendMessage(jid, { [media.type]: media.data, caption: media.caption || "" }, options).catch(() => {})
            if (m) album.push(m)
        }
        return album
    }

    // Kirim Paket Stiker Massal
    sock.sendStickerPack = async (jid, stickerPaths, packOptions = {}) => {
        const { Sticker, StickerTypes } = require('wa-sticker-formatter')
        const results = []
        for (const path of stickerPaths) {
            const sticker = new Sticker(path, {
                pack: packOptions.packname || 'FreeZeeHost Pack',
                author: packOptions.author || 'Bot',
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 70,
                ...packOptions
            })
            const buffer = await sticker.toBuffer()
            const m = await sock.sendMessage(jid, { sticker: buffer }, { ...packOptions.options })
            results.push(m)
        }
        return results
    }

    // --- 5. UTILITY HELPERS ---
    sock.autoOptimize = () => {
        if (sock.store) {
            sock.store.chats.clear()
            sock.store.messages = {}
        }
    }

    return sock
}
exports.patchSocket = patchSocket
