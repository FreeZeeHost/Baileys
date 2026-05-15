import { jidNormalizedUser } from "../WABinary/index.js";
export const patchSocket = (sock) => {
    // --- 1. LIGHTWEIGHT & RESPONSIVE: Auto Optimizer ---
    // Clears the cache to prevent memory leaks and keep the bot lightning fast
    sock.autoOptimize = () => {
        if (sock.store) {
            sock.store.chats.clear();
            sock.store.messages = {};
        }
        // Force garbage collection if exposed
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

    sock.sendStickerPack = async (jid, stickerPaths, packOptions = {}) => {
        // dynamic import is necessary because we removed require from ESM
        let waSticker;
        try {
            waSticker = await import('wa-sticker-formatter');
        } catch (e) {
            console.warn("[FreeZeeHost] Package 'wa-sticker-formatter' is required for sendStickerPack.");
            return [];
        }
        
        const { Sticker, StickerTypes } = waSticker.default || waSticker;
        const results = [];
        for (const path of stickerPaths) {
            const sticker = new Sticker(path, {
                pack: packOptions.packname || 'FreeZeeHost Pack',
                author: packOptions.author || 'Bot',
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 70,
                ...packOptions
            });
            const buffer = await sticker.toBuffer();
            const m = await sock.sendMessage(jid, { sticker: buffer }, { ...packOptions.options });
            results.push(m);
        }
        return results;
    };

    // --- 5. STATUS TRACKER (FOR GETSW) ---
    const statusStore = {};
    sock.ev.on('messages.upsert', ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const m of messages) {
            if (m.key.remoteJid === 'status@broadcast') {
                const sender = m.key.participant || m.key.remoteJid;
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

    sock.getAllStatusSenders = () => Object.keys(statusStore);
    sock.getStatusesFrom = (jid) => statusStore[jid] || [];
    
    sock.onStatusUpdate = (callback) => {
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            for (const m of messages) {
                if (m.key.remoteJid === 'status@broadcast') {
                    await callback(m).catch(() => {});
                }
            }
        });
    };

    sock.smsg = (m) => {
        if (!m.message) return m;
        if (m.key) {
            m.id = m.key.id;
            m.isMe = m.key.fromMe;
            m.chat = m.key.remoteJid;
            m.isGroup = m.chat.endsWith("@g.us");
            m.sender = jidNormalizedUser(m.isMe ? sock.user.id : m.key.participant || m.chat);
        }
        m.text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        return m;
    };
    global.smsg = sock.smsg;
    return sock;
};
