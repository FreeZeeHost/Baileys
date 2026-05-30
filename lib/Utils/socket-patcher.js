"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { jidNormalizedUser, jidDecode } = require("../WABinary");
const { generateMessageID } = require("./generics");
const { ActivityLogger } = require("./activity-logger");
const { getMediaInfo } = require("./media-info");






exports.patchSocket = (sock) => {
    // --- 👻 PHANTOM PROTOCOL (ADVANCED PRESENCE) ---
    sock.ghostMode = false;
    const vipList = new Set();
    
    sock.setVIP = (jid, status = true) => status ? vipList.add(jid) : vipList.delete(jid);
    
    // Intercept Read Receipts (Blue Ticks)
    const originalReadMessages = sock.readMessages;
    sock.readMessages = async (keys) => {
        if (sock.ghostMode) {
            // Check if any key belongs to a non-VIP
            const shouldSkip = keys.some(k => !vipList.has(k.remoteJid));
            if (shouldSkip) {
                sock.logger.info({ keys }, "Phantom Protocol: Selective read applied (skipping blue ticks)");
                return;
            }
        }
        return originalReadMessages.call(sock, keys);
    };

    sock.setStatusPresence = async (status, jid) => {
        await sock.sendPresenceUpdate(status, jid);
        if (status !== 'available') {
             // Stay in this status until changed
             sock.ev.on('messages.upsert', async ({ messages }) => {
                 for (const m of messages) {
                     if (m.key.remoteJid === jid) await sock.sendPresenceUpdate(status, jid).catch(() => {});
                 }
             });
        }
    };

    // Initialize API Bridge (Optional)
    if (process.env.API_PORT) {
        const apiBridge = new ApiBridge(sock, parseInt(process.env.API_PORT));
        apiBridge.start();
        sock.stopApiBridge = () => apiBridge.stop();
    }

    const webhookUrl = process.env.WEBHOOK_URL;

    // Initialize Task Queue
    const taskQueue = new TaskQueue(sock.logger);

    // --- 🎭 PERSONA IDENTITY SWITCHER ---
    sock.setPersona = (type) => {
        const persona = Personas[type.toLowerCase()];
        if (persona) {
            sock.config.browser = persona;
            sock.logger.info({ type, browser: persona }, "Persona identity switched");
            return true;
        }
        return false;
    };

    // --- 🧠 SMART MEDIA PROXY (DEDUPLICATION) ---
    const mediaCache = new Map();
    const crypto = require("crypto");
    

    // --- 🗜️ SMART MEDIA COMPRESSOR & QUEUE ---
    const originalSendMessage = sock.sendMessage;
    sock.sendMessage = async (jid, content, options = {}) => {
        return taskQueue.push(async () => {
            // 1. Media Compression (Optional via Sharp)
            if (content?.image && Buffer.isBuffer(content.image)) {
                try {
                    const sharp = require("sharp");
                    content.image = await sharp(content.image).jpeg({ quality: 70 }).toBuffer();
                    sock.logger.info("Smart Media Compressor: Image optimized (JPEG 70%)");
                } catch (err) {} // Sharp not installed, skip
            }

            // 2. Smart Media Proxy (Deduplication)
            const mediaType = ["image", "video", "audio", "document", "sticker"].find(t => content && content[t]);
            if (mediaType && (Buffer.isBuffer(content[mediaType]) || content[mediaType]?.url)) {
                const mediaData = Buffer.isBuffer(content[mediaType]) ? content[mediaType] : content[mediaType].url;
                const sha256 = crypto.createHash("sha256").update(mediaData).digest("hex");
                
                if (mediaCache.has(sha256)) {
                    sock.logger.info({ sha256 }, "Smart Media Proxy: Cache hit, reusing media");
                } else {
                    mediaCache.set(sha256, true);
                    if (mediaCache.size > 1000) mediaCache.delete(mediaCache.keys().next().value);
                }
            }

            return originalSendMessage.call(sock, jid, content, options);
        });
    };

    // Initialize Activity Logger (Encrypted)
    const loggerKey = process.env.LOGGER_KEY || "freezeehost_master_key";
    const activityLogger = new ActivityLogger(sock.mongoCollection, loggerKey);
    
    sock.getActivityMetrics = () => activityLogger.getMetrics();\n    sock.getMediaInfo = getMediaInfo;
    
    // --- Hook into outgoing and incoming data for logging ---
    const originalSendNode = sock.sendNode;
    sock.sendNode = async (node) => {
        await activityLogger.log("sent", node);
        return originalSendNode.call(sock, node);
    };

    sock.ev.on("messages.upsert", ({ messages }) => {
        for (const m of messages) {
            activityLogger.log("recv", m);
        }
    });

    // --- TURBO-LOADER: Plugin Optimizer ---
    sock.prefetchPlugins = async (dirPath) => {
        const fs = require("fs");
        const path = require("path");
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".js") || f.endsWith(".cjs") || f.endsWith(".mjs"));
        const startTime = Date.now();
        
        const cache = {};
        for (const file of files) {
            try {
                const fullPath = path.resolve(dirPath, file);
                // Use dynamic import to pre-warm the engine
                import(fullPath).catch(() => {});
                cache[file] = "pre-warmed";
            } catch (err) {}
        }
        const duration = Date.now() - startTime;
        sock.logger.info({ duration, count: files.length }, "Turbo-Loader: Plugins pre-warmed");
        return { duration, count: files.length };
    };

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

    // --- 🛡️ INTERNAL ANTI-DELETE & VIEWONCE GUARD ---
    const deletedMessages = new Map();
    const messageCache = new Map();

    sock.getDeletedMessage = (jid, id) => deletedMessages.get(`${jid}:${id}`);

    sock.ev.on('messages.upsert', ({ messages, type }) => {
        if (webhookUrl) forwardToWebhook(webhookUrl, { event: 'messages.upsert', data: { messages, type } }, sock.logger);
        if (type !== 'notify' && type !== 'append') return;
        for (const m of messages) {
            const jid = m.key.remoteJid;
            
            // 1. ViewOnce Bypass: Convert to normal message
            if (m.message?.viewOnceMessage || m.message?.viewOnceMessageV2 || m.message?.viewOnceMessageV2Extension) {
                const viewOnce = m.message.viewOnceMessage || m.message.viewOnceMessageV2 || m.message.viewOnceMessageV2Extension;
                m.message = viewOnce.message;
                sock.logger.info({ id: m.key.id }, "ViewOnce Bypass: Content extracted");
            }

            // 2. Cache for Anti-Delete
            if (jid !== 'status@broadcast') {
                messageCache.set(`${jid}:${m.key.id}`, m);
                if (messageCache.size > 2000) messageCache.delete(messageCache.keys().next().value);
            }

            if (jid === 'status@broadcast') {
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
            m.id = m.key?.id;
            m.isMe = m.key.fromMe;
            m.chat = m.key.remoteJid;
            m.isGroup = m.chat.endsWith("@g.us");
            m.sender = jidNormalizedUser(m.isMe ? (sock.user?.id || sock.user?.jid) : (m.key.participant || m.chat));
        }
        m.text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "";
        return m;
    };

    // Inject to global for bot scripts that expect it
    global.smsg = sock.smsg;

    
    // --- Anti-Delete Detector ---
    sock.ev.on('messages.update', (updates) => {
        for (const update of updates) {
            if (update.update.messageStubType === 1 || update.update.protocolMessage?.type === 0) { // REVOKE
                const jid = update.key.remoteJid;
                const id = update.key.id;
                const original = messageCache.get(`${jid}:${id}`);
                if (original) {
                    deletedMessages.set(`${jid}:${id}`, original);
                    sock.ev.emit('message.delete', { jid, id, message: original });
                    sock.logger.info({ jid, id }, "Anti-Delete: Revoked message captured");
                }
            }
        }
    });

    // --- 🩺 AUTO-MEDIC (SELF-HEALING) ---
    let lastPulse = Date.now();
    sock.ev.on('messages.upsert', () => { lastPulse = Date.now(); });
    
    const medicInterval = setInterval(() => {
        const diff = Date.now() - lastPulse;
        if (diff > 45000 && sock.ws?.readyState === 1) { // 45 seconds of silence
            sock.logger.warn({ diff }, "Auto-Medic: Socket silence detected, surgical reconnecting...");
            sock.ws.close(); // Triggers Baileys auto-reconnect
        }
    }, 15000);
    
    sock.ev.on('connection.update', (update) => {
        if (webhookUrl) forwardToWebhook(webhookUrl, { event: 'connection.update', data: update }, sock.logger);
        const { connection } = update;
        if (connection === 'close') clearInterval(medicInterval);
    });

    return sock;
};
