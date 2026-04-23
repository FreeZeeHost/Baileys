"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const patchSocket = (sock) => {
    // --- 0. INTERNAL STORES ---
    const statusStore = {} 

    // --- 1. INTERACTIVE MESSAGE HELPERS (sock.msg) ---
    // Tetap dipertahankan karena tidak menghambat koneksi
    sock.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => sock.sendMessage(jid, { text, footer, buttons, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => sock.sendMessage(jid, { title, text, footer, buttonText, sections, ...options }),
        poll: (jid, name, values, selectableCount = 1, options = {}) => sock.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => sock.sendMessage(jid, { carouselMessages: cards, ...options }),
        nativeTable: (jid, title, rows, options = {}) => sock.sendMessage(jid, { nativeFlowMessage: { buttons: [{ name: "table", buttonParamsJson: JSON.stringify({ title, rows }) }] }, ...options })
    }

    // --- 2. STATUS MANAGER (AUTO-TRACKING) ---
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
                if (m.key.remoteJid === 'status@broadcast') {
                    const data = m.statusData || {
                        type: Object.keys(m.message || {})[0],
                        caption: m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || m.message?.extendedTextMessage?.text || "",
                        sender: m.key.participant || m.key.remoteJid
                    }
                    await callback({ ...m, statusData: data })
                }
            }
        })
    }

    // --- 3. EXCLUSIVE HELPERS ---
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

    // HAPUS TOTAL: sock.sendMessage override yang menyebabkan no-respon
    return sock
}
exports.patchSocket = patchSocket
