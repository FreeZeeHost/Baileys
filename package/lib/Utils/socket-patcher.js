"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { jidNormalizedUser, jidDecode } = require("../WABinary");
const { generateMessageID } = require("./generics");

exports.patchSocket = (sock) => {
    // --- 1. LIGHTWEIGHT & RESPONSIVE: Auto Optimizer ---
    sock.autoOptimize = () => {
        if (sock.store) {
            sock.store.chats.clear();
            sock.store.messages = {};
        }
        if (global.gc) {
            global.gc();
        }
    };

    // --- 2. ADVANCED INTERACTIVE UI HELPERS (sock.msg) ---
    sock.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => sock.sendMessage(jid, { text, footer, buttons, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => sock.sendMessage(jid, { title, text, footer, buttonText, sections, ...options }),
        poll: (jid, name, values, selectableCount = 1, options = {}) => sock.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => sock.sendMessage(jid, { carouselMessages: cards, ...options }),
        nativeTable: (jid, title, rows, options = {}) => sock.sendMessage(jid, { nativeFlowMessage: { buttons: [{ name: "table", buttonParamsJson: JSON.stringify({ title, rows }) }] }, ...options })
    };

    // --- 3. STEALTH MODE HELPERS ---
    sock.simulateTyping = async (jid, duration = 1500) => {
        await sock.sendPresenceUpdate("composing", jid);
        await new Promise(r => setTimeout(r, duration));
        await sock.sendPresenceUpdate("paused", jid);
    };

    sock.simulateRecording = async (jid, duration = 1500) => {
        await sock.sendPresenceUpdate("recording", jid);
        await new Promise(r => setTimeout(r, duration));
        await sock.sendPresenceUpdate("paused", jid);
    };

    // --- 4. ADVANCED MEDIA SENDERS ---
    sock.sendAlbumMessage = async (jid, medias, caption = "", options = {}) => {
        const album = [];
        for (const media of medias) {
            const m = await sock.sendMessage(jid, { [media.type]: media.data, caption: media.caption || "" }, options).catch(() => {});
            if (m) album.push(m);
        }
        return album;
    };

    // --- 5. STATUS TRACKER (FOR GETSW) ---
    const statusStore = {};
    sock.ev.on('messages.upsert', ({ messages, type }) => {
        if (type !== 'notify' && type !== 'append') return;
        for (const m of messages) {
            if (m.key.remoteJid === 'status@broadcast') {
                const sender = jidNormalizedUser(m.key.participant || m.key.remoteJid);
                if (!statusStore[sender]) statusStore[sender] = [];
                m.statusData = {
                    type: Object.keys(m.message || {})[0],
                    caption: m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || m.message?.extendedTextMessage?.text || "",
                    sender
                };
                statusStore[sender].push(m);
                if (statusStore[sender].length > 20) statusStore[sender].shift();
            }
        }
    });

        sock.downloadStatusMedia = async (m) => {
        const { downloadMediaMessage } = require("./messages");
        return await downloadMediaMessage(m, "buffer", {}, { 
            logger: sock.logger,
            reuploadRequest: sock.updateMediaMessage 
        });
    };

        sock.getStatusCounts = () => {
        const counts = {};
        for (const jid in statusStore) {
            counts[jid] = statusStore[jid].length;
        }
        return counts;
    };

    sock.getAllStatusSenders = () => Object.keys(statusStore);
    sock.getStatusesFrom = (jid) => statusStore[jid] || [];
    
    sock.onStatusUpdate = (callback) => {
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify' && type !== 'append') return;
            for (const m of messages) {
            if (m.key.remoteJid === 'status@broadcast') {
                    await callback(m).catch(() => {});
                }
            }
        });
    };

    // --- 6. EASY TO USE: smsg helper ---
    sock.smsg = (m) => {
        if (!m.message) return m;
        if (m.key) {
            m.id = m.key.id;
            m.isMe = m.key.fromMe;
            m.chat = m.key.remoteJid;
            m.isGroup = m.chat.endsWith("@g.us");
            m.sender = jidNormalizedUser(m.isMe ? (sock.user.id || sock.user.jid) : (m.key.participant || m.chat));
        }
        m.text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "";
        return m;
    };

    // Inject to global for bot scripts that expect it
    global.smsg = sock.smsg;

    return sock;
};
