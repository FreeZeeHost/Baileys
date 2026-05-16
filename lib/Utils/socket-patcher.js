const { jidNormalizedUser } = require("../WABinary");

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

    // --- 2. EASY TO USE: smsg helper ---
    sock.smsg = (m) => {
        if (!m.message) return m;
        if (m.key) {
            m.id = m.key.id;
            m.isMe = m.key.fromMe;
            m.chat = m.key.remoteJid;
            m.isGroup = m.chat.endsWith("@g.us");
            m.sender = jidNormalizedUser(m.isMe ? sock.user.id : m.key.participant || m.chat);
        }
        m.text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "";
        return m;
    };

    // Inject to global for bot scripts that expect it
    global.smsg = sock.smsg;

    // --- 3. STATUS AUTO-READ ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages) {
            if (m.key.remoteJid === 'status@broadcast') {
                await sock.readMessages([m.key]).catch(() => {});
            }
        }
    });

    return sock;
};
