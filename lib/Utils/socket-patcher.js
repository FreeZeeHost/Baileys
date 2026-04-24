"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const generics_1 = require("./generics")

const patchSocket = (sock) => {
    // --- 1. INTERACTIVE MESSAGE HELPERS (sock.msg) ---
    sock.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => sock.sendMessage(jid, { text, footer, buttons, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => sock.sendMessage(jid, { title, text, footer, buttonText, sections, ...options }),
        poll: (jid, name, values, selectableCount = 1, options = {}) => sock.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => sock.sendMessage(jid, { carouselMessages: cards, ...options }),
        nativeTable: (jid, title, rows, options = {}) => sock.sendMessage(jid, { nativeFlowMessage: { buttons: [{ name: "table", buttonParamsJson: JSON.stringify({ title, rows }) }] }, ...options })
    }

    // --- 2. MANUAL STEALTH FUNCTION ---
    // Dipanggil hanya jika Anda mau, misal: await sock.simulateTyping(jid, 2000)
    sock.simulateTyping = async (jid, duration = 1500) => {
        await sock.sendPresenceUpdate("composing", jid)
        await (0, generics_1.delay)(duration)
        await sock.sendPresenceUpdate("paused", jid)
    }

    sock.simulateRecording = async (jid, duration = 1500) => {
        await sock.sendPresenceUpdate("recording", jid)
        await (0, generics_1.delay)(duration)
        await sock.sendPresenceUpdate("paused", jid)
    }

    // --- 3. STATUS STORE (GETSW) ---
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

    // --- 4. EXCLUSIVE HELPERS (MANUAL CALL) ---
    sock.getAllStatusSenders = () => Object.keys(statusStore)
    sock.getStatusesFrom = (jid) => statusStore[jid] || []
    
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

    // CATATAN: sendMessage sekarang 100% ASLI bawaan Baileys tanpa modifikasi apa pun.
        // STABILIZATION: Wait for WA server before pairing
    const originalRPC = sock.requestPairingCode.bind(sock);
    sock.requestPairingCode = async (phoneNumber) => {
        await new Promise(r => setTimeout(r, 5000));
        return originalRPC(phoneNumber);
    };

    return sock
}
exports.patchSocket = patchSocket
