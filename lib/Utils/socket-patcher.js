"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { jidNormalizedUser, jidDecode } = require("../WABinary");
const { generateMessageID, Personas } = require("./generics");
const { ActivityLogger } = require("./activity-logger");
const { getMediaInfo } = require("./media-info");
const { TaskQueue } = require("./task-queue");
const { ApiBridge, forwardToWebhook } = require("./api-bridge");

exports.patchSocket = (conn) => {
    // --- 👻 PHANTOM PROTOCOL (ADVANCED PRESENCE) ---
    conn.ghostMode = false;
    const vipList = new Set();
    
    conn.setVIP = (jid, status = true) => status ? vipList.add(jidNormalizedUser(jid)) : vipList.delete(jidNormalizedUser(jid));
    
    // Intercept Read Receipts (Blue Ticks)
    const originalReadMessages = conn.readMessages;
    conn.readMessages = async (keys) => {
        if (conn.ghostMode) {
            const shouldSkip = keys.some(k => !vipList.has(jidNormalizedUser(k.remoteJid)));
            if (shouldSkip) {
                conn.logger.info({ keys }, "Phantom Protocol: Selective read applied");
                return;
            }
        }
        return originalReadMessages.call(conn, keys);
    };

    // Initialize API Bridge
    if (process.env.API_PORT) {
        const apiBridge = new ApiBridge(conn, parseInt(process.env.API_PORT));
        apiBridge.start();
        conn.stopApiBridge = () => apiBridge.stop();
    }

    const webhookUrl = process.env.WEBHOOK_URL;
    const taskQueue = new TaskQueue(conn.logger);

    // --- 🎭 PERSONA IDENTITY SWITCHER ---
    conn.setPersona = (type) => {
        const persona = Personas[type.toLowerCase()];
        if (persona) {
            conn.config.browser = persona;
            conn.logger.info({ type, browser: persona }, "Persona identity switched");
            return true;
        }
        return false;
    };

    // --- 🧠 SMART MEDIA PROXY (DEDUPLICATION) & COMPRESSOR ---
    const mediaCache = new Map();
    const crypto = require("crypto");
    const originalSendMessage = conn.sendMessage;
    
    conn.sendMessage = async (jid, content, options = {}) => {
        return taskQueue.push(async () => {
            // 1. Media Compression (Optional via Sharp)
            if (content?.image && Buffer.isBuffer(content.image)) {
                try {
                    const sharp = require("sharp");
                    content.image = await sharp(content.image).jpeg({ quality: 70 }).toBuffer();
                } catch (err) {}
            }

            // 2. Smart Media Proxy (Deduplication)
            const mediaType = ["image", "video", "audio", "document", "sticker"].find(t => content && content[t]);
            if (mediaType && (Buffer.isBuffer(content[mediaType]) || content[mediaType]?.url)) {
                const mediaData = Buffer.isBuffer(content[mediaType]) ? content[mediaType] : (content[mediaType]?.url || "");
                const sha256 = crypto.createHash("sha256").update(mediaData).digest("hex");
                if (mediaCache.has(sha256)) {
                    conn.logger.info({ sha256 }, "Smart Media Proxy: Cache hit");
                } else {
                    mediaCache.set(sha256, true);
                    if (mediaCache.size > 1000) mediaCache.delete(mediaCache.keys().next().value);
                }
            }

            return originalSendMessage.call(conn, jid, content, options);
        });
    };

    // Initialize Activity Logger (Encrypted)
    const loggerKey = process.env.LOGGER_KEY || "freezeehost_master_key";
    const activityLogger = new ActivityLogger(conn.mongoCollection, loggerKey);
    
    conn.getActivityMetrics = () => activityLogger.getMetrics();
    conn.getMediaInfo = getMediaInfo;
    
    const originalSendNode = conn.sendNode;
    conn.sendNode = async (node) => {
        await activityLogger.log("sent", node);
        return originalSendNode.call(conn, node);
    };

    conn.ev.on("messages.upsert", ({ messages }) => {
        for (const m of messages) activityLogger.log("recv", m);
    });

    // --- 1. LIGHTWEIGHT & RESPONSIVE: Auto Optimizer ---
    conn.autoOptimize = () => {
        if (conn.store) {
            conn.store.chats.clear();
            conn.store.messages = {};
        }
        if (global.gc) global.gc();
    };

    // --- 2. ADVANCED INTERACTIVE UI HELPERS (conn.msg) ---
    conn.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => conn.sendMessage(jid, { text, footer, buttons, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => conn.sendMessage(jid, { title, text, footer, buttonText, sections, ...options }),
        poll: (jid, name, values, selectableCount = 1, options = {}) => conn.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => conn.sendMessage(jid, { carouselMessages: cards, ...options }),
        nativeTable: (jid, title, rows, options = {}) => conn.sendMessage(jid, { nativeFlowMessage: { buttons: [{ name: "table", buttonParamsJson: JSON.stringify({ title, rows }) }] }, ...options }),
        
        // --- 🤖 AI RICH RESPONSE HELPERS (META AI STYLE) ---
        aiRichMessage: async (jid, submessages, options = {}) => {
            const { generateMessageID, getBuffer } = require("./generics");
            const crypto = require("crypto");
            const randomId = () => crypto.randomBytes(8).toString('hex');

            const prepareMediaUrl = async (input) => {
                if (!input) return "";
                if (typeof input === 'string' && input.startsWith('http')) {
                    try {
                        const buffer = await getBuffer(input);
                        const upload = await conn.waUploadToServer(buffer, { mediaType: 'image', newsletter: true });
                        return upload.url;
                    } catch (e) { return input; }
                }
                if (Buffer.isBuffer(input)) {
                    const upload = await conn.waUploadToServer(input, { mediaType: 'image', newsletter: true });
                    return upload.url;
                }
                return input;
            };

            for (const sm of submessages) {
                if (sm.gridImageMetadata) {
                    for (const img of sm.gridImageMetadata.imageUrls) {
                        img.imagePreviewUrl = await prepareMediaUrl(img.imagePreviewUrl);
                        img.imageHighResUrl = await prepareMediaUrl(img.imageHighResUrl);
                    }
                }
                if (sm.imageMetadata?.imageUrl) sm.imageMetadata.imageUrl.imagePreviewUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imagePreviewUrl);
                if (sm.dynamicMetadata?.url) sm.dynamicMetadata.url = await prepareMediaUrl(sm.dynamicMetadata.url);
                if (sm.contentItemsMetadata?.itemsMetadata) {
                    for (const item of sm.contentItemsMetadata.itemsMetadata) {
                        if (item.reelItem) {
                            item.reelItem.thumbnailUrl = await prepareMediaUrl(item.reelItem.thumbnailUrl);
                            item.reelItem.profileIconUrl = await prepareMediaUrl(item.reelItem.profileIconUrl);
                        }
                    }
                }
            }

            const sections = submessages.map(sm => {
                let primitive = {};
                switch(sm.messageType) {
                    case 1: // GRID_IMAGE
                        primitive = { images: sm.gridImageMetadata.imageUrls.map(img => ({ url: img.imageHighResUrl || img.imagePreviewUrl, thumbnail_url: img.imagePreviewUrl, image_id: randomId(), accessibility_text: "AI Image" })), grid_layout: "2x2", __typename: "GenAIImageGridUXPrimitive" };
                        break;
                    case 2: // TEXT
                        primitive = { text: sm.messageText, __typename: "GenAIMarkdownTextUXPrimitive" };
                        break;
                    case 3: // INLINE_IMAGE
                        primitive = { image_url: sm.imageMetadata.imageUrl.imagePreviewUrl, thumbnail_url: sm.imageMetadata.imageUrl.imagePreviewUrl, image_id: randomId(), caption: sm.imageMetadata.imageText, __typename: "GenAIImageUXPrimitive" };
                        break;
                    case 4: // TABLE
                        primitive = { title: sm.tableMetadata.title, rows: sm.tableMetadata.rows.map(r => ({ cells: r.items.map(cell => ({ text: cell })), style: r.isHeading ? "BOLD" : "NORMAL" })), __typename: "GenAITableUXPrimitive" };
                        break;
                    case 5: // CODE
                        primitive = { language: sm.codeMetadata.codeLanguage, code: sm.codeMetadata.codeBlocks.map(b => b.codeContent).join(""), __typename: "GenAICodeUXPrimitive" };
                        break;
                    case 6: // DYNAMIC (GIF)
                        primitive = { url: sm.dynamicMetadata.url, thumbnail_url: sm.dynamicMetadata.url, type: sm.dynamicMetadata.type === 2 ? "GIF" : "IMAGE", __typename: "GenAIDynamicUXPrimitive" };
                        break;
                    case 7: // MAP
                        primitive = { payload: { center: { latitude: sm.mapMetadata.centerLatitude, longitude: sm.mapMetadata.centerLongitude }, markers: sm.mapMetadata.annotations.map(a => ({ latitude: a.latitude, longitude: a.longitude, title: a.title, description: a.body })) }, __typename: "GenAIMapUXPrimitive" };
                        break;
                    case 8: // LATEX
                        primitive = { text: sm.latexMetadata.text || "", formulas: sm.latexMetadata.expressions.map(e => e.latexExpression), __typename: "GenAILatexUXPrimitive" };
                        break;
                    case 9: // CAROUSEL/REELS
                        return { view_model: { primitives: sm.contentItemsMetadata.itemsMetadata.map(item => ({ reels_url: item.reelItem.videoUrl, thumbnail_url: item.reelItem.thumbnailUrl, creator: item.reelItem.title, avatar_url: item.reelItem.profileIconUrl, reels_title: item.reelItem.description || "", reel_source: "IG", __typename: "GenAIReelPrimitive" })), __typename: "GenAIHScrollLayoutViewModel" } };
                }
                return { view_model: { primitive: primitive, __typename: "GenAISingleLayoutViewModel" } };
            });

            if (options.botMetadata?.progressIndicatorMetadata) {
                sections.unshift({ view_model: { primitive: { status: "GENERATING", display_text: options.botMetadata.progressIndicatorMetadata.progressDescription, __typename: "GenAIProgressPrimitive" }, __typename: "GenAISingleLayoutViewModel" } });
            }

            const unifiedResponseData = { response_id: generateMessageID(), sections: sections };
            const fallbackText = submessages.filter(s => s.messageText).map(s => s.messageText).join("\n") || "Rich Message";

            const content = {
                extendedTextMessage: { text: fallbackText },
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { pluginMetadata: {}, richResponseSourcesMetadata: options.sources ? { sources: options.sources } : undefined, ...options.botMetadata } },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1, submessages: submessages,
                            unifiedResponse: { data: Buffer.from(JSON.stringify(unifiedResponseData)) },
                            contextInfo: {
                                forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" }, forwardOrigin: 4,
                                ...(options.quoted ? { stanzaId: options.quoted.key.id, participant: options.quoted.key.participant || options.quoted.key.remoteJid, quotedMessage: options.quoted.message } : {})
                            }
                        }
                    }
                }
            };

            await conn.relayMessage(jid, content, { messageId: options.messageId || generateMessageID(), ...options });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "AI_MSG" }, message: content };
        },

        aiTable: (jid, title, rows, options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 4, tableMetadata: { title: title, rows: rows.map(r => ({ items: Array.isArray(r) ? r : r.items, isHeading: r.isHeading || false })) } }], options),
        aiCode: (jid, language, code, options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 5, codeMetadata: { codeLanguage: language, codeBlocks: [{ highlightType: 0, codeContent: code }] } }], options),
        aiGridImage: (jid, imageUrls, gridImageUrl = null, options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 1, gridImageMetadata: { gridImageUrl: gridImageUrl || imageUrls[0], imageUrls: imageUrls.map(img => ({ imagePreviewUrl: typeof img === 'string' ? img : img.preview, imageHighResUrl: img.highRes || (typeof img === 'string' ? img : img.preview), sourceUrl: img.source || "" })) } }], options),
        aiInlineImage: (jid, imageUrl, text = "", alignment = 0, tapLink = "", options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 3, imageMetadata: { imageUrl: { imagePreviewUrl: typeof imageUrl === 'string' ? imageUrl : imageUrl.preview }, imageText: text, alignment: alignment, tapLinkUrl: tapLink } }], options),
        aiDynamic: (jid, url, isGif = false, loopCount = 0, options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 6, dynamicMetadata: { type: isGif ? 2 : 1, url: url, loopCount: loopCount } }], options),
        aiLatex: (jid, text, expressions = [], options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text, latexMetadata: { expressions: expressions.map(e => ({ latexExpression: typeof e === 'string' ? e : e.formula, url: e.url || "" })) } }, { messageType: 8, latexMetadata: { expressions: expressions.map(e => ({ latexExpression: typeof e === 'string' ? e : e.formula, url: e.url || "" })) } }], options),
        aiMap: (jid, lat, lng, annotations = [], options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 7, mapMetadata: { centerLatitude: lat, centerLongitude: lng, annotations: annotations.map((a, i) => ({ annotationNumber: i + 1, latitude: a.lat, longitude: a.lng, title: a.title || "", body: a.body || "" })), showInfoList: true } }], options),
        aiThinking: async (jid, description, steps = [], options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: description }], { ...options, botMetadata: { progressIndicatorMetadata: { progressDescription: description, stepsMetadata: steps.map(s => ({ statusTitle: s.title, statusBody: s.body || "", status: s.status || 2 })) } } }),
        aiModel: async (jid, text, modelType = 1, modelName = "Llama 3", options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], { ...options, botMetadata: { modelMetadata: { modelType: modelType, modelNameOverride: modelName } } }),
        aiPrompts: async (jid, text, prompts = [], options = {}) => { const suggestions = prompts.map(p => ({ prompt: typeof p === 'string' ? p : p.prompt, promptId: p.promptId || "prompt_" + Date.now() + Math.floor(Math.random() * 1000) })); return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], { ...options, botMetadata: { suggestedPromptMetadata: { suggestedPrompts: suggestions.map(s => s.prompt), promptSuggestions: { suggestions: suggestions } } } }); },
        aiReels: (jid, mainText, reels, options = {}) => { const reelItems = reels.map(item => ({ reelItem: { title: item.title, profileIconUrl: item.profileIconUrl, thumbnailUrl: item.thumbnailUrl, videoUrl: item.videoUrl, description: item.description || "" } })); const sources = reels.map((item, idx) => ({ provider: "UNKNOWN", sourceProviderURL: item.videoUrl, citationNumber: idx + 1 })); return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: mainText }, { messageType: 9, contentItemsMetadata: { contentType: 1, itemsMetadata: reelItems } }], { ...options, sources }); }
    };

    // --- 3. STEALTH MODE HELPERS ---
    conn.simulateTyping = async (jid, duration = 1500) => { await conn.sendPresenceUpdate("composing", jid); await new Promise(r => setTimeout(r, duration)); await conn.sendPresenceUpdate("paused", jid); };
    conn.simulateRecording = async (jid, duration = 1500) => { await conn.sendPresenceUpdate("recording", jid); await new Promise(r => setTimeout(r, duration)); await conn.sendPresenceUpdate("paused", jid); };

    // --- 5. STATUS TRACKER (FOR GETSW) ---
    const statusStore = {};
    const deletedMessages = new Map();
    const messageCache = new Map();

    conn.getDeletedMessage = (jid, id) => deletedMessages.get(`${jid}:${id}`);

    conn.ev.on('messages.upsert', ({ messages, type }) => {
        if (webhookUrl) forwardToWebhook(webhookUrl, { event: 'messages.upsert', data: { messages, type } }, conn.logger);
        if (type !== 'notify' && type !== 'append') return;
        for (const m of messages) {
            const jid = m.key.remoteJid;
            if (m.message?.viewOnceMessage || m.message?.viewOnceMessageV2 || m.message?.viewOnceMessageV2Extension) {
                const viewOnce = m.message.viewOnceMessage || m.message.viewOnceMessageV2 || m.message.viewOnceMessageV2Extension;
                m.message = viewOnce.message;
            }
            if (jid !== 'status@broadcast') {
                messageCache.set(`${jid}:${m.key.id}`, m);
                if (messageCache.size > 2000) messageCache.delete(messageCache.keys().next().value);
            } else {
                const sender = jidNormalizedUser(m.key.participant || m.key.remoteJid);
                if (!statusStore[sender]) statusStore[sender] = [];
                m.statusData = { type: Object.keys(m.message || {})[0], caption: m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || m.message?.extendedTextMessage?.text || "", sender };
                statusStore[sender].push(m);
                if (statusStore[sender].length > 20) statusStore[sender].shift();
            }
        }
    });

    conn.downloadStatusMedia = async (m) => { const { downloadMediaMessage } = require("./messages"); return await downloadMediaMessage(m, "buffer", {}, { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }); };
    conn.getStatusCounts = () => { const counts = {}; for (const jid in statusStore) counts[jid] = statusStore[jid].length; return counts; };
    conn.getAllStatusSenders = () => Object.keys(statusStore);
    conn.getStatusesFrom = (jid) => statusStore[jid] || [];
    conn.onStatusUpdate = (callback) => { conn.ev.on('messages.upsert', async ({ messages, type }) => { if (type !== 'notify' && type !== 'append') return; for (const m of messages) if (m.key.remoteJid === 'status@broadcast') await callback(m).catch(() => {}); }); };

    // --- 6. EASY TO USE: smsg helper ---
    conn.smsg = (m) => {
        if (!m.message) return m;
        if (m.key) {
            m.id = m.key?.id; m.isMe = m.key.fromMe; m.chat = m.key.remoteJid; m.isGroup = m.chat.endsWith("@g.us");
            m.sender = jidNormalizedUser(m.isMe ? (conn.user?.id || conn.user?.jid) : (m.key.participant || m.chat));
        }
        m.text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || m.message.templateButtonReplyMessage?.selectedId || m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || "";
        const prefix = /^[./!#]/.test(m.text) ? m.text.charAt(0) : ""; m.prefix = prefix; m.isCommand = !!prefix;
        const body = m.isCommand ? m.text.slice(1).trim() : m.text.trim();
        const args = body.split(/\s+/); m.command = args.shift()?.toLowerCase(); m.args = args; m.query = args.join(" ");
        m.reply = (text, options = {}) => conn.sendMessage(m.chat, { text }, { quoted: m, ...options });
        m.replyImage = (url, caption = "", options = {}) => conn.sendMessage(m.chat, { image: { url }, caption }, { quoted: m, ...options });
        m.replyVideo = (url, caption = "", options = {}) => conn.sendMessage(m.chat, { video: { url }, caption }, { quoted: m, ...options });
        m.replyAudio = (url, ptt = false, options = {}) => conn.sendMessage(m.chat, { audio: { url }, ptt, mimetype: 'audio/mp4' }, { quoted: m, ...options });
        m.replyDocument = (url, fileName, options = {}) => conn.sendMessage(m.chat, { document: { url }, fileName, mimetype: 'application/octet-stream' }, { quoted: m, ...options });
        m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
        m.forward = (jid, options = {}) => conn.sendMessage(jid, { forward: m }, { ...options });
        m.replyTable = (title, rows, options = {}) => conn.msg.aiTable(m.chat, title, rows, { quoted: m, ...options });
        m.replyCode = (lang, code, options = {}) => conn.msg.aiCode(m.chat, lang, code, { quoted: m, ...options });
        m.replyReels = (text, reels, options = {}) => conn.msg.aiReels(m.chat, text, reels, { quoted: m, ...options });
        m.replyGridImage = (imageUrls, gridImageUrl = null, options = {}) => conn.msg.aiGridImage(m.chat, imageUrls, gridImageUrl, { quoted: m, ...options });
        m.replyInlineImage = (imageUrl, text = "", alignment = 0, tapLink = "", options = {}) => conn.msg.aiInlineImage(m.chat, imageUrl, text, alignment, tapLink, { quoted: m, ...options });
        m.replyDynamic = (url, isGif = false, loopCount = 0, options = {}) => conn.msg.aiDynamic(m.chat, url, isGif, loopCount, { quoted: m, ...options });
        m.replyLatex = (text, expressions = [], options = {}) => conn.msg.aiLatex(m.chat, text, expressions, { quoted: m, ...options });
        m.replyMap = (lat, lng, annotations = [], options = {}) => conn.msg.aiMap(m.chat, lat, lng, annotations, { quoted: m, ...options });
        m.replyThinking = (text, steps = [], options = {}) => conn.msg.aiThinking(m.chat, text, steps, { quoted: m, ...options });
        m.replyModel = (text, type = 1, name = "Llama 3", options = {}) => conn.msg.aiModel(m.chat, text, type, name, { quoted: m, ...options });
        m.replyPrompts = (text, prompts = [], options = {}) => conn.msg.aiPrompts(m.chat, text, prompts, { quoted: m, ...options });
        m.aiFeedback = (isPositive = true, text = "", options = {}) => conn.msg.aiFeedback(m.chat, m.key, isPositive, text, options);
        return m;
    };

    global.smsg = conn.smsg;
    conn.aiTable = conn.msg.aiTable; conn.aiCode = conn.msg.aiCode; conn.aiReels = conn.msg.aiReels; conn.aiGridImage = conn.msg.aiGridImage; conn.aiInlineImage = conn.msg.aiInlineImage; conn.aiDynamic = conn.msg.aiDynamic; conn.aiLatex = conn.msg.aiLatex; conn.aiMap = conn.msg.aiMap; conn.aiThinking = conn.msg.aiThinking; conn.aiFeedback = conn.msg.aiFeedback; conn.aiModel = conn.msg.aiModel; conn.aiPrompts = conn.msg.aiPrompts; conn.aiRichMessage = conn.msg.aiRichMessage;
    conn.react = (jid, emoji, key) => conn.sendMessage(jid, { react: { text: emoji, key: key } });

    conn.onCommand = (cmd, callback) => { conn.ev.on('messages.upsert', async ({ messages, type }) => { if (type !== 'notify' && type !== 'append') return; for (const m of messages) { const s = conn.smsg(m); if (s.isCommand && s.command === cmd.toLowerCase()) await callback(s); } }); };
    conn.getGroupAdmins = async (jid) => { try { const metadata = await conn.groupMetadata(jid); return metadata.participants.filter(p => p.admin).map(p => p.id); } catch (err) { return []; } };
    conn.isAdmin = async (jid, user) => { const admins = await conn.getGroupAdmins(jid); return admins.includes(jidNormalizedUser(user)); };
    conn.autoRead = false; conn.ev.on('messages.upsert', async ({ messages, type }) => { if (conn.autoRead && type === 'notify') for (const m of messages) await conn.readMessages([m.key]).catch(() => {}); });
    conn.antiCall = false; conn.ev.on('call', async (calls) => { if (conn.antiCall) for (const call of calls) if (call.status === 'offer') { await conn.rejectCall(call.id, call.from); await conn.sendMessage(call.from, { text: `Maaf, saya tidak menerima panggilan.` }); } });

    conn.newsletter = {
        create: (name, description) => conn.newsletterCreate(name, description), follow: (jid) => conn.newsletterFollow(jid), unfollow: (jid) => conn.newsletterUnfollow(jid), mute: (jid) => conn.newsletterMute(jid), unmute: (jid) => conn.newsletterUnmute(jid), update: (jid, name, description) => conn.newsletterUpdateMetadata(jid, { name, description }), getInfo: (jid) => conn.getNewsletterInfo(jid),
        inviteAdmin: (jid, userJid) => conn.sendMessage(jid, { newsletterAdminInviteMessage: { newsletterJid: jid, newsletterName: "Admin Invite", inviteExpiration: Math.floor(Date.now() / 1000) + (86400 * 7) } }, { mentions: [userJid] }),
        inviteFollower: (jid, name, thumb, caption = "") => conn.sendMessage(jid, { newsletterFollowerInviteMessage: { newsletterJid: jid, newsletterName: name, jpegThumbnail: thumb, caption: caption } })
    };

    conn.ev.on('messages.update', (updates) => { for (const update of updates) if (update.update.messageStubType === 1 || update.update.protocolMessage?.type === 0) { const jid = update.key.remoteJid; const id = update.key.id; const original = messageCache.get(`${jid}:${id}`); if (original) { deletedMessages.set(`${jid}:${id}`, original); conn.ev.emit('message.delete', { jid, id, message: original }); } } });
    let lastPulse = Date.now(); conn.ev.on('messages.upsert', () => { lastPulse = Date.now(); });
    const medicInterval = setInterval(() => { const diff = Date.now() - lastPulse; if (diff > 45000 && conn.ws?.readyState === 1) conn.ws.close(); }, 15000);
    conn.ev.on('connection.update', (update) => { if (webhookUrl) forwardToWebhook(webhookUrl, { event: 'connection.update', data: update }, conn.logger); const { connection } = update; if (connection === 'close') clearInterval(medicInterval); });

    return conn;
};
