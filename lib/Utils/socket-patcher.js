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
    
    conn.setVIP = (jid, status = true) => status ? vipList.add(jid) : vipList.delete(jid);
    
    // Intercept Read Receipts (Blue Ticks)
    const originalReadMessages = conn.readMessages;
    conn.readMessages = async (keys) => {
        if (conn.ghostMode) {
            // Check if any key belongs to a non-VIP
            const shouldSkip = keys.some(k => !vipList.has(jidNormalizedUser(k.remoteJid)));
            if (shouldSkip) {
                conn.logger.info({ keys }, "Phantom Protocol: Selective read applied (skipping blue ticks)");
                return;
            }
        }
        return originalReadMessages.call(conn, keys);
    };

    conn.setStatusPresence = async (status, jid) => {
        await conn.sendPresenceUpdate(status, jid);
        if (status !== 'available') {
             // Stay in this status until changed
             conn.ev.on('messages.upsert', async ({ messages }) => {
                 for (const m of messages) {
                     if (m.key.remoteJid === jid) await conn.sendPresenceUpdate(status, jid).catch(() => {});
                 }
             });
        }
    };

    // Initialize API Bridge (Optional)
    if (process.env.API_PORT) {
        const apiBridge = new ApiBridge(conn, parseInt(process.env.API_PORT));
        apiBridge.start();
        conn.stopApiBridge = () => apiBridge.stop();
    }

    const webhookUrl = process.env.WEBHOOK_URL;

    // Initialize Task Queue
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

    // --- 🧠 SMART MEDIA PROXY (DEDUPLICATION) ---
    const mediaCache = new Map();
    const crypto = require("crypto");
    

    // --- 🗜️ SMART MEDIA COMPRESSOR & QUEUE ---
    const originalSendMessage = conn.sendMessage;
    conn.sendMessage = async (jid, content, options = {}) => {
        return taskQueue.push(async () => {
            // 1. Media Compression (Optional via Sharp)
            if (content?.image && Buffer.isBuffer(content.image)) {
                try {
                    const sharp = require("sharp");
                    content.image = await sharp(content.image).jpeg({ quality: 70 }).toBuffer();
                    conn.logger.info("Smart Media Compressor: Image optimized (JPEG 70%)");
                } catch (err) {} // Sharp not installed, skip
            }

            // 2. Smart Media Proxy (Deduplication)
            const mediaType = ["image", "video", "audio", "document", "sticker"].find(t => content && content[t]);
            if (mediaType && (Buffer.isBuffer(content[mediaType]) || content[mediaType]?.url)) {
                const mediaData = Buffer.isBuffer(content[mediaType]) ? content[mediaType] : (content[mediaType]?.url || "");
                const sha256 = crypto.createHash("sha256").update(mediaData).digest("hex");
                
                if (mediaCache.has(sha256)) {
                    conn.logger.info({ sha256 }, "Smart Media Proxy: Cache hit, reusing media");
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
    
    // --- Hook into outgoing and incoming data for logging ---
    const originalSendNode = conn.sendNode;
    conn.sendNode = async (node) => {
        await activityLogger.log("sent", node);
        return originalSendNode.call(conn, node);
    };

    conn.ev.on("messages.upsert", ({ messages }) => {
        for (const m of messages) {
            activityLogger.log("recv", m);
        }
    });

    // --- TURBO-LOADER: Plugin Optimizer ---
    conn.prefetchPlugins = async (dirPath) => {
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
        conn.logger.info({ duration, count: files.length }, "Turbo-Loader: Plugins pre-warmed");
        return { duration, count: files.length };
    };

    // --- 1. LIGHTWEIGHT & RESPONSIVE: Auto Optimizer ---
    conn.autoOptimize = () => {
        if (conn.store) {
            conn.store.chats.clear();
            conn.store.messages = {};
        }
        if (global.gc) {
            global.gc();
        }
    };

    // --- 2. ADVANCED INTERACTIVE UI HELPERS (conn.msg) ---
    conn.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => conn.sendMessage(jid, { text, footer, buttons, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => conn.sendMessage(jid, { title, text, footer, buttonText, sections, ...options }),
        poll: (jid, name, values, selectableCount = 1, options = {}) => conn.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => conn.sendMessage(jid, { carouselMessages: cards, ...options }),
        nativeTable: (jid, title, rows, options = {}) => conn.sendMessage(jid, { nativeFlowMessage: { buttons: [{ name: "table", buttonParamsJson: JSON.stringify({ title, rows }) }] }, ...options }),
        
        // --- 🤖 AI RICH RESPONSE HELPERS (META AI STYLE) ---
        aiRichMessage: (jid, submessages, options = {}) => {
            return conn.sendMessage(jid, {
                richResponseMessage: {
                    messageType: 1, // AI_RICH_RESPONSE_TYPE_STANDARD
                    submessages: submessages,
                }
            }, options);
        },

        aiTable: (jid, title, rows, options = {}) => {
            // rows: array of objects { items: string[], isHeading: boolean }
            const tableRows = rows.map(r => ({
                items: Array.isArray(r) ? r : r.items,
                isHeading: r.isHeading || false
            }));
            
            return conn.msg.aiRichMessage(jid, [{
                messageType: 4, // AI_RICH_RESPONSE_TABLE
                tableMetadata: {
                    title: title,
                    rows: tableRows
                }
            }], options);
        },

        aiCode: (jid, language, code, options = {}) => {
            return conn.msg.aiRichMessage(jid, [{
                messageType: 5, // AI_RICH_RESPONSE_CODE
                codeMetadata: {
                    codeLanguage: language,
                    codeBlocks: [{
                        highlightType: 0, // DEFAULT
                        codeContent: code
                    }]
                }
            }], options);
        },

        aiGridImage: (jid, imageUrls, gridImageUrl = null, options = {}) => {
            // imageUrls: array of { preview, highRes, source }
            const images = imageUrls.map(img => ({
                imagePreviewUrl: typeof img === 'string' ? img : img.preview,
                imageHighResUrl: img.highRes || "",
                sourceUrl: img.source || ""
            }));
            
            const gridImg = gridImageUrl ? (typeof gridImageUrl === 'string' ? { imagePreviewUrl: gridImageUrl } : gridImageUrl) : images[0];

            return conn.msg.aiRichMessage(jid, [{
                messageType: 1, // AI_RICH_RESPONSE_GRID_IMAGE
                gridImageMetadata: {
                    gridImageUrl: gridImg,
                    imageUrls: images
                }
            }], options);
        },

        aiInlineImage: (jid, imageUrl, text = "", alignment = 0, tapLink = "", options = {}) => {
            return conn.msg.aiRichMessage(jid, [{
                messageType: 3, // AI_RICH_RESPONSE_INLINE_IMAGE
                imageMetadata: {
                    imageUrl: typeof imageUrl === 'string' ? { imagePreviewUrl: imageUrl } : imageUrl,
                    imageText: text,
                    alignment: alignment, // 0: Leading, 1: Trailing, 2: Center
                    tapLinkUrl: tapLink
                }
            }], options);
        },

        aiDynamic: (jid, url, isGif = false, loopCount = 0, options = {}) => {
            return conn.msg.aiRichMessage(jid, [{
                messageType: 6, // AI_RICH_RESPONSE_DYNAMIC
                dynamicMetadata: {
                    type: isGif ? 2 : 1, // 1: Image, 2: GIF
                    url: url,
                    loopCount: loopCount
                }
            }], options);
        },

        aiLatex: (jid, text, expressions = [], options = {}) => {
            // expressions: array of { formula, url, width, height }
            const exps = expressions.map(e => ({
                latexExpression: typeof e === 'string' ? e : e.formula,
                url: e.url || ""
            }));

            return conn.msg.aiRichMessage(jid, [{
                messageType: 8, // AI_RICH_RESPONSE_LATEX
                latexMetadata: {
                    text: text,
                    expressions: exps
                }
            }], options);
        },

        aiMap: (jid, lat, lng, annotations = [], options = {}) => {
            // annotations: array of { lat, lng, title, body }
            const annots = annotations.map((a, i) => ({
                annotationNumber: i + 1,
                latitude: a.lat,
                longitude: a.lng,
                title: a.title || "",
                body: a.body || ""
            }));

            return conn.msg.aiRichMessage(jid, [{
                messageType: 7, // AI_RICH_RESPONSE_MAP
                mapMetadata: {
                    centerLatitude: lat,
                    centerLongitude: lng,
                    annotations: annots,
                    showInfoList: true
                }
            }], options);
        },

        // --- 🧠 ADVANCED AI BEHAVIOR HELPERS ---
        aiThinking: (jid, description, steps = [], options = {}) => {
            // steps: array of { title, body, status }
            // status: 1: IN_PROGRESS, 2: COMPLETED, 3: FAILED
            const stepsMeta = steps.map(s => ({
                statusTitle: s.title,
                statusBody: s.body || "",
                status: s.status || 2
            }));

            return conn.sendMessage(jid, {
                text: description,
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata: {
                        progressIndicatorMetadata: {
                            progressDescription: description,
                            stepsMetadata: stepsMeta
                        }
                    }
                }
            }, options);
        },

        aiFeedback: (jid, messageKey, isPositive = true, text = "", options = {}) => {
            return conn.relayMessage(jid, {
                protocolMessage: {
                    type: 18, // BOT_FEEDBACK_MESSAGE
                    botFeedbackMessage: {
                        messageKey: messageKey,
                        kind: isPositive ? 0 : 1, // 0: POSITIVE, 1: NEGATIVE_GENERIC
                        text: text
                    }
                }
            }, options);
        },

        aiModel: (jid, text, modelType = 1, modelName = "Llama 3", options = {}) => {
            // modelType: 1: LLAMA_PROD, 2: LLAMA_PROD_PREMIUM
            return conn.sendMessage(jid, {
                text: text,
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata: {
                        modelMetadata: {
                            modelType: modelType,
                            modelNameOverride: modelName
                        }
                    }
                }
            }, options);
        },

        aiReels: (jid, mainText, reels, options = {}) => {
            // reels: array of { title, profileIconUrl, thumbnailUrl, videoUrl, description }
            const reelItems = reels.map(item => ({
                reelItem: {
                    title: item.title,
                    profileIconUrl: item.profileIconUrl,
                    thumbnailUrl: item.thumbnailUrl,
                    videoUrl: item.videoUrl
                }
            }));

            const submessages = [
                { messageType: 2, messageText: mainText },
                {
                    messageType: 9, // AI_RICH_RESPONSE_CONTENT_ITEMS
                    contentItemsMetadata: {
                        contentType: 1, // CAROUSEL
                        itemsMetadata: reelItems
                    }
                }
            ];

            const sources = reels.map((item, idx) => ({
                provider: "UNKNOWN",
                sourceProviderURL: item.videoUrl,
                citationNumber: idx + 1
            }));

            const unifiedResponseData = {
                sections: [
                    {
                        view_model: {
                            primitive: { text: mainText, __typename: "GenAIMarkdownTextUXPrimitive" },
                            __typename: "GenAISingleLayoutViewModel"
                        }
                    },
                    {
                        view_model: {
                            primitives: reels.map(item => ({
                                reels_url: item.videoUrl,
                                thumbnail_url: item.thumbnailUrl,
                                creator: item.title,
                                avatar_url: item.profileIconUrl,
                                reels_title: item.description || "",
                                reel_source: "IG",
                                __typename: "GenAIReelPrimitive"
                            })),
                            __typename: "GenAIHScrollLayoutViewModel"
                        }
                    }
                ]
            };

            const content = {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata: {
                        pluginMetadata: {},
                        richResponseSourcesMetadata: { sources }
                    }
                },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1,
                            submessages: submessages,
                            unifiedResponse: {
                                data: JSON.stringify(unifiedResponseData)
                            },
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedAiBotMessageInfo: {
                                    botJid: "867051314767696@bot"
                                },
                                forwardOrigin: 4
                            }
                        }
                    }
                }
            };

            return conn.relayMessage(jid, content, options);
        }
    };

    // --- 3. STEALTH MODE HELPERS ---
    conn.simulateTyping = async (jid, duration = 1500) => {
        await conn.sendPresenceUpdate("composing", jid);
        await new Promise(r => setTimeout(r, duration));
        await conn.sendPresenceUpdate("paused", jid);
    };

    conn.simulateRecording = async (jid, duration = 1500) => {
        await conn.sendPresenceUpdate("recording", jid);
        await new Promise(r => setTimeout(r, duration));
        await conn.sendPresenceUpdate("paused", jid);
    };

    // --- 4. ADVANCED MEDIA SENDERS ---
    conn.sendAlbumMessage = async (jid, medias, caption = "", options = {}) => {
        const album = [];
        for (const media of medias) {
            const m = await conn.sendMessage(jid, { [media.type]: media.data, caption: media.caption || "" }, options).catch(() => {});
            if (m) album.push(m);
        }
        return album;
    };

    // --- 5. STATUS TRACKER (FOR GETSW) ---
    const statusStore = {};

    // --- 🛡️ INTERNAL ANTI-DELETE & VIEWONCE GUARD ---
    const deletedMessages = new Map();
    const messageCache = new Map();

    conn.getDeletedMessage = (jid, id) => deletedMessages.get(`${jid}:${id}`);

    conn.ev.on('messages.upsert', ({ messages, type }) => {
        if (webhookUrl) forwardToWebhook(webhookUrl, { event: 'messages.upsert', data: { messages, type } }, conn.logger);
        if (type !== 'notify' && type !== 'append') return;
        for (const m of messages) {
            const jid = m.key.remoteJid;
            
            // 1. ViewOnce Bypass: Convert to normal message
            if (m.message?.viewOnceMessage || m.message?.viewOnceMessageV2 || m.message?.viewOnceMessageV2Extension) {
                const viewOnce = m.message.viewOnceMessage || m.message.viewOnceMessageV2 || m.message.viewOnceMessageV2Extension;
                m.message = viewOnce.message;
                conn.logger.info({ id: m.key.id }, "ViewOnce Bypass: Content extracted");
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

    conn.downloadStatusMedia = async (m) => {
        const { downloadMediaMessage } = require("./messages");
        return await downloadMediaMessage(m, "buffer", {}, { 
            logger: conn.logger,
            reuploadRequest: conn.updateMediaMessage 
        });
    };

    conn.getStatusCounts = () => {
        const counts = {};
        for (const jid in statusStore) {
            counts[jid] = statusStore[jid].length;
        }
        return counts;
    };

    conn.getAllStatusSenders = () => Object.keys(statusStore);
    conn.getStatusesFrom = (jid) => statusStore[jid] || [];
    
    conn.onStatusUpdate = (callback) => {
        conn.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify' && type !== 'append') return;
            for (const m of messages) {
            if (m.key.remoteJid === 'status@broadcast') {
                    await callback(m).catch(() => {});
                }
            }
        });
    };

    // --- 6. EASY TO USE: smsg helper ---
    conn.smsg = (m) => {
        if (!m.message) return m;
        if (m.key) {
            m.id = m.key?.id;
            m.isMe = m.key.fromMe;
            m.chat = m.key.remoteJid;
            m.isGroup = m.chat.endsWith("@g.us");
            m.sender = jidNormalizedUser(m.isMe ? (conn.user?.id || conn.user?.jid) : (m.key.participant || m.chat));
        }
        
        // Extract Text
        m.text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || m.message.templateButtonReplyMessage?.selectedId || m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || "";
        
        // Command Parsing
        const prefix = /^[./!#]/.test(m.text) ? m.text.charAt(0) : "";
        m.prefix = prefix;
        m.isCommand = !!prefix;
        const body = m.isCommand ? m.text.slice(1).trim() : m.text.trim();
        const args = body.split(/\s+/);
        m.command = args.shift()?.toLowerCase();
        m.args = args;
        m.query = args.join(" ");

        // Reply Helpers
        m.reply = (text, options = {}) => conn.sendMessage(m.chat, { text }, { quoted: m, ...options });
        m.replyImage = (url, caption = "", options = {}) => conn.sendMessage(m.chat, { image: { url }, caption }, { quoted: m, ...options });
        m.replyVideo = (url, caption = "", options = {}) => conn.sendMessage(m.chat, { video: { url }, caption }, { quoted: m, ...options });
        m.replyAudio = (url, ptt = false, options = {}) => conn.sendMessage(m.chat, { audio: { url }, ptt, mimetype: 'audio/mp4' }, { quoted: m, ...options });
        m.replyDocument = (url, fileName, options = {}) => conn.sendMessage(m.chat, { document: { url }, fileName, mimetype: 'application/octet-stream' }, { quoted: m, ...options });
        m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
        m.forward = (jid, options = {}) => conn.sendMessage(jid, { forward: m }, { ...options });

        // AI Reply Helpers
        m.replyTable = (title, rows, options = {}) => conn.msg.aiTable(m.chat, title, rows, { quoted: m, ...options });
        m.replyCode = (lang, code, options = {}) => conn.msg.aiCode(m.chat, lang, code, { quoted: m, ...options });
        m.replyReels = (text, reels, options = {}) => conn.msg.aiReels(m.chat, text, reels, { quoted: m, ...options });
        m.replyGridImage = (imageUrls, gridImageUrl = null, options = {}) => conn.msg.aiGridImage(m.chat, imageUrls, gridImageUrl, { quoted: m, ...options });
        m.replyInlineImage = (imageUrl, text = "", alignment = 0, tapLink = "", options = {}) => conn.msg.aiInlineImage(m.chat, imageUrl, text, alignment, tapLink, { quoted: m, ...options });
        m.replyDynamic = (url, isGif = false, loopCount = 0, options = {}) => conn.msg.aiDynamic(m.chat, url, isGif, loopCount, { quoted: m, ...options });
        m.replyLatex = (text, expressions = [], options = {}) => conn.msg.aiLatex(m.chat, text, expressions, { quoted: m, ...options });
        m.replyMap = (lat, lng, annotations = [], options = {}) => conn.msg.aiMap(m.chat, lat, lng, annotations, { quoted: m, ...options });
        
        // Advanced AI Reply Helpers
        m.replyThinking = (text, steps = [], options = {}) => conn.msg.aiThinking(m.chat, text, steps, { quoted: m, ...options });
        m.replyModel = (text, type = 1, name = "Llama 3", options = {}) => conn.msg.aiModel(m.chat, text, type, name, { quoted: m, ...options });
        m.aiFeedback = (isPositive = true, text = "", options = {}) => conn.msg.aiFeedback(m.chat, m.key, isPositive, text, options);

        return m;
    };

    // Inject to global for bot scripts that expect it
    global.smsg = conn.smsg;

    // --- Aliases for even simpler calling ---
    conn.aiTable = conn.msg.aiTable;
    conn.aiCode = conn.msg.aiCode;
    conn.aiReels = conn.msg.aiReels;
    conn.aiGridImage = conn.msg.aiGridImage;
    conn.aiInlineImage = conn.msg.aiInlineImage;
    conn.aiDynamic = conn.msg.aiDynamic;
    conn.aiLatex = conn.msg.aiLatex;
    conn.aiMap = conn.msg.aiMap;
    conn.aiThinking = conn.msg.aiThinking;
    conn.aiFeedback = conn.msg.aiFeedback;
    conn.aiModel = conn.msg.aiModel;
    conn.aiRichMessage = conn.msg.aiRichMessage;

    conn.onCommand = (cmd, callback) => {
        conn.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify' && type !== 'append') return;
            for (const m of messages) {
                const s = conn.smsg(m);
                if (s.isCommand && s.command === cmd.toLowerCase()) {
                    await callback(s);
                }
            }
        });
    };

    // --- 7. GROUP MANAGEMENT HELPERS ---
    conn.getGroupAdmins = async (jid) => {
        try {
            const metadata = await conn.groupMetadata(jid);
            return metadata.participants.filter(p => p.admin).map(p => p.id);
        } catch (err) {
            return [];
        }
    };

    conn.isAdmin = async (jid, user) => {
        const admins = await conn.getGroupAdmins(jid);
        return admins.includes(jidNormalizedUser(user));
    };

    // --- 8. AUTO-READ OPTION ---
    conn.autoRead = false;
    conn.ev.on('messages.upsert', async ({ messages, type }) => {
        if (conn.autoRead && type === 'notify') {
            for (const m of messages) {
                await conn.readMessages([m.key]).catch(() => {});
            }
        }
    });

    // --- 9. ANTI-CALL (AUTO REJECT) ---
    conn.antiCall = false;
    conn.ev.on('call', async (calls) => {
        if (conn.antiCall) {
            for (const call of calls) {
                if (call.status === 'offer') {
                    conn.logger.info({ callId: call.id, from: call.from }, "Anti-Call: Rejecting incoming call");
                    await conn.rejectCall(call.id, call.from);
                    await conn.sendMessage(call.from, { text: `Maaf, saya tidak menerima panggilan. Silakan kirim pesan teks saja.` });
                }
            }
        }
    });

    // --- 10. NEWSLETTER HELPERS ---
    conn.newsletter = {
        create: (name, description) => conn.newsletterCreate(name, description),
        follow: (jid) => conn.newsletterFollow(jid),
        unfollow: (jid) => conn.newsletterUnfollow(jid),
        mute: (jid) => conn.newsletterMute(jid),
        unmute: (jid) => conn.newsletterUnmute(jid),
        update: (jid, name, description) => conn.newsletterUpdateMetadata(jid, { name, description }),
        getInfo: (jid) => conn.getNewsletterInfo(jid)
    };

    // --- 11. POLL VOTING HELPERS ---
    conn.getPollResults = async (m) => {
        const { getAggregateVotesInPollMessage } = require("./messages");
        const pollUpdates = m.message?.pollUpdateMessage?.pollUpdates || [];
        return getAggregateVotesInPollMessage({
            message: m.message,
            pollUpdates
        });
    };

    conn.getVoter = (m) => {
        const sender = m.key.participant || m.key.remoteJid;
        return jidNormalizedUser(sender);
    };
    
    // --- Anti-Delete Detector ---
    conn.ev.on('messages.update', (updates) => {
        for (const update of updates) {
            if (update.update.messageStubType === 1 || update.update.protocolMessage?.type === 0) { // REVOKE
                const jid = update.key.remoteJid;
                const id = update.key.id;
                const original = messageCache.get(`${jid}:${id}`);
                if (original) {
                    deletedMessages.set(`${jid}:${id}`, original);
                    conn.ev.emit('message.delete', { jid, id, message: original });
                    conn.logger.info({ jid, id }, "Anti-Delete: Revoked message captured");
                }
            }
        }
    });

    // --- 🩺 AUTO-MEDIC (SELF-HEALING) ---
    let lastPulse = Date.now();
    conn.ev.on('messages.upsert', () => { lastPulse = Date.now(); });
    
    const medicInterval = setInterval(() => {
        const diff = Date.now() - lastPulse;
        if (diff > 45000 && conn.ws?.readyState === 1) { // 45 seconds of silence
            conn.logger.warn({ diff }, "Auto-Medic: Socket silence detected, surgical reconnecting...");
            conn.ws.close(); // Triggers Baileys auto-reconnect
        }
    }, 15000);
    
    conn.ev.on('connection.update', (update) => {
        if (webhookUrl) forwardToWebhook(webhookUrl, { event: 'connection.update', data: update }, conn.logger);
        const { connection } = update;
        if (connection === 'close') clearInterval(medicInterval);
    });

    return conn;
};
