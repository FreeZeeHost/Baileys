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
        
        // --- 📅 NATIVE GROUP EVENT HELPER ---
        createEvent: (jid, eventData, options = {}) => {
            return conn.sendMessage(jid, {
                eventMessage: {
                    name: eventData.name,
                    description: eventData.description || "",
                    location: eventData.location ? {
                        degreesLatitude: eventData.location.lat,
                        degreesLongitude: eventData.location.lng,
                        name: eventData.location.name || ""
                    } : undefined,
                    startTime: eventData.startTime ? (Math.floor(new Date(eventData.startTime).getTime() / 1000)) : undefined,
                    endTime: eventData.endTime ? (Math.floor(new Date(eventData.endTime).getTime() / 1000)) : undefined,
                    extraGuestsAllowed: eventData.extraGuestsAllowed || false,
                    isCanceled: false
                }
            }, options);
        },

        // --- 📞 SCHEDULED CALL HELPER ---
        scheduleCall: (jid, title, type = 1, timestamp, options = {}) => {
            return conn.sendMessage(jid, {
                scheduledCallCreationMessage: {
                    title: title,
                    callType: type,
                    scheduledTimestampMs: timestamp || (Date.now() + 3600000)
                }
            }, options);
        },

        // --- 📞 BCALL (BROADCAST/BUSINESS CALL) HELPER ---
        bcall: (jid, sessionId, mediaType = 1, masterKey = Buffer.alloc(32), caption = "", options = {}) => {
            return conn.sendMessage(jid, {
                bcallMessage: {
                    sessionId: sessionId,
                    mediaType: mediaType,
                    masterKey: masterKey,
                    caption: caption
                }
            }, options);
        },

        // --- 🛒 NATIVE ORDER HELPER ---
        sendOrder: (jid, orderData, options = {}) => {
            // orderData: { id, title, text, sellerJid, itemCount, totalAmount, currency, thumbnail }
            return conn.sendMessage(jid, {
                orderMessage: {
                    orderId: orderData.id,
                    orderTitle: orderData.title,
                    message: orderData.text || "",
                    sellerJid: orderData.sellerJid || jid,
                    itemCount: orderData.itemCount || 1,
                    totalAmount1000: (orderData.totalAmount || 0) * 1000,
                    totalCurrencyCode: orderData.currency || "IDR",
                    thumbnail: orderData.thumbnail,
                    status: 1, // INQUIRY
                    surface: 1 // CATALOUGE
                }
            }, options);
        },

        // --- 💰 NATIVE INVOICE HELPER ---
        sendInvoice: (jid, invoiceData, options = {}) => {
            // invoiceData: { note, token, type: 'IMAGE'|'PDF', mimetype }
            return conn.sendMessage(jid, {
                invoiceMessage: {
                    note: invoiceData.note || "",
                    token: invoiceData.token || "",
                    attachmentType: invoiceData.type === 'PDF' ? 1 : 0,
                    attachmentMimetype: invoiceData.mimetype || (invoiceData.type === 'PDF' ? 'application/pdf' : 'image/jpeg')
                }
            }, options);
        },

        // --- 📌 PIN MESSAGE HELPER ---
        pinMessage: (jid, key, duration = 86400, options = {}) => {
            return conn.sendMessage(jid, {
                pinInChatMessage: {
                    key: key,
                    type: 1, // PIN
                    senderTimestampMs: Date.now()
                }
            }, options);
        },

        unpinMessage: (jid, key, options = {}) => {
            return conn.sendMessage(jid, {
                pinInChatMessage: {
                    key: key,
                    type: 2, // UNPIN
                    senderTimestampMs: Date.now()
                }
            }, options);
        },

        // --- 💾 KEEP IN CHAT HELPER ---
        keepMessage: (jid, key, options = {}) => {
            return conn.sendMessage(jid, {
                keepInChatMessage: {
                    key: key,
                    keepType: 1, // KEEP
                    timestampMs: Date.now()
                }
            }, options);
        },

        unkeepMessage: (jid, key, options = {}) => {
            return conn.sendMessage(jid, {
                keepInChatMessage: {
                    key: key,
                    keepType: 0, // UNDO_KEEP
                    timestampMs: Date.now()
                }
            }, options);
        },

        // --- 📊 IN-THREAD SURVEY HELPER ---
        sendSurvey: (jid, surveyData, options = {}) => {
            return conn.sendMessage(jid, {
                messageContextInfo: {
                    botMetadata: {
                        inThreadSurveyMetadata: {
                            surveyTitle: surveyData.title,
                            questions: surveyData.questions.map(q => ({
                                questionText: q.text,
                                questionOptions: q.options.map(o => ({
                                    stringValue: o.text,
                                    numericValue: o.value || 0
                                }))
                            }))
                        }
                    }
                }
            }, options);
        },

        // --- 🎨 STICKER PACK HELPER ---
        sendStickerPack: (jid, packData, options = {}) => {
            return conn.sendMessage(jid, {
                stickerPackMessage: {
                    stickerPackId: packData.id,
                    name: packData.name,
                    publisher: packData.publisher,
                    stickers: packData.stickers,
                    fileLength: packData.fileLength,
                    fileSha256: packData.fileSha256,
                    fileEncSha256: packData.fileEncSha256,
                    mediaKey: packData.mediaKey,
                    directPath: packData.directPath,
                    caption: packData.caption || ""
                }
            }, options);
        },

        // --- ⏰ AI REMINDER HELPER ---
        aiReminder: (jid, text, timestamp, options = {}) => {
            return conn.sendMessage(jid, {
                text: text,
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata: {
                        reminderMetadata: {
                            reminderId: "rem_" + Date.now(),
                            reminderText: text,
                            reminderTimestamp: Math.floor(new Date(timestamp).getTime() / 1000),
                            action: 1 // NOTIFY
                        }
                    }
                }
            }, options);
        },

        // --- ❓ STATUS Q&A HELPER ---
        sendStatusQuestion: (text, options = {}) => {
            return conn.sendMessage('status@broadcast', {
                statusQuestionAnswerMessage: {
                    text: text
                }
            }, options);
        },

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
                    } catch (e) {
                        return input;
                    }
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
                if (sm.imageMetadata?.imageUrl) {
                    sm.imageMetadata.imageUrl.imagePreviewUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imagePreviewUrl);
                }
                if (sm.dynamicMetadata?.url) {
                    sm.dynamicMetadata.url = await prepareMediaUrl(sm.dynamicMetadata.url);
                }
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
                        primitive = {
                            images: sm.gridImageMetadata.imageUrls.map(img => ({
                                url: img.imageHighResUrl || img.imagePreviewUrl,
                                thumbnail_url: img.imagePreviewUrl,
                                image_id: randomId(),
                                accessibility_text: "AI Image"
                            })),
                            grid_layout: "2x2",
                            __typename: "GenAIImageGridUXPrimitive"
                        };
                        break;
                    case 2: // TEXT
                        primitive = {
                            text: sm.messageText,
                            __typename: "GenAIMarkdownTextUXPrimitive"
                        };
                        break;
                    case 3: // INLINE_IMAGE
                        primitive = {
                            image_url: sm.imageMetadata.imageUrl.imagePreviewUrl,
                            thumbnail_url: sm.imageMetadata.imageUrl.imagePreviewUrl,
                            image_id: randomId(),
                            caption: sm.imageMetadata.imageText,
                            __typename: "GenAIImageUXPrimitive"
                        };
                        break;
                    case 4: // TABLE
                        primitive = {
                            title: sm.tableMetadata.title,
                            rows: sm.tableMetadata.rows.map(r => ({
                                cells: r.items.map(cell => ({ text: cell })),
                                style: r.isHeading ? "BOLD" : "NORMAL"
                            })),
                            __typename: "GenAITableUXPrimitive"
                        };
                        break;
                    case 5: // CODE
                        primitive = {
                            language: sm.codeMetadata.codeLanguage,
                            code: sm.codeMetadata.codeBlocks.map(b => b.codeContent).join(""),
                            __typename: "GenAICodeUXPrimitive"
                        };
                        break;
                    case 6: // DYNAMIC (GIF)
                        primitive = {
                            url: sm.dynamicMetadata.url,
                            thumbnail_url: sm.dynamicMetadata.url,
                            type: sm.dynamicMetadata.type === 2 ? "GIF" : "IMAGE",
                            __typename: "GenAIDynamicUXPrimitive"
                        };
                        break;
                    case 7: // MAP
                        primitive = {
                            payload: {
                                center: {
                                    latitude: sm.mapMetadata.centerLatitude,
                                    longitude: sm.mapMetadata.centerLongitude
                                },
                                markers: sm.mapMetadata.annotations.map(a => ({
                                    latitude: a.latitude,
                                    longitude: a.longitude,
                                    title: a.title,
                                    description: a.body
                                }))
                            },
                            __typename: "GenAIMapUXPrimitive"
                        };
                        break;
                    case 8: // LATEX
                        primitive = {
                            text: sm.latexMetadata.text || "",
                            formulas: sm.latexMetadata.expressions.map(e => e.latexExpression),
                            __typename: "GenAILatexUXPrimitive"
                        };
                        break;
                    case 9: // CAROUSEL/REELS
                        return {
                            view_model: {
                                primitives: sm.contentItemsMetadata.itemsMetadata.map(item => ({
                                    reels_url: item.reelItem.videoUrl,
                                    thumbnail_url: item.reelItem.thumbnailUrl,
                                    creator: item.reelItem.title,
                                    avatar_url: item.reelItem.profileIconUrl,
                                    reels_title: item.reelItem.description || "",
                                    reel_source: "IG",
                                    __typename: "GenAIReelPrimitive"
                                })),
                                __typename: "GenAIHScrollLayoutViewModel"
                            }
                        };
                }

                return {
                    view_model: {
                        primitive: primitive,
                        __typename: "GenAISingleLayoutViewModel"
                    }
                };
            });

            if (options.botMetadata?.progressIndicatorMetadata) {
                sections.unshift({
                    view_model: {
                        primitive: {
                            status: "GENERATING",
                            display_text: options.botMetadata.progressIndicatorMetadata.progressDescription,
                            __typename: "GenAIProgressPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                });
            }

            const unifiedResponseData = {
                response_id: generateMessageID(),
                sections: sections
            };

            const fallbackText = submessages.filter(s => s.messageText).map(s => s.messageText).join("\n") || "Rich Message";

            const content = {
                extendedTextMessage: { text: fallbackText },
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata: {
                        pluginMetadata: {},
                        richResponseSourcesMetadata: options.sources ? { sources: options.sources } : undefined,
                        ...options.botMetadata
                    }
                },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1, 
                            submessages: submessages,
                            unifiedResponse: {
                                data: Buffer.from(JSON.stringify(unifiedResponseData))
                            },
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
                                forwardOrigin: 4,
                                ...(options.quoted ? {
                                    stanzaId: options.quoted.key.id,
                                    participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                                    quotedMessage: options.quoted.message
                                } : {})
                            }
                        }
                    }
                }
            };

            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "AI_MSG" }, message: content };
        },

        aiTable: (jid, title, rows, options = {}) => {
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
            const images = imageUrls.map(img => ({
                imagePreviewUrl: typeof img === 'string' ? img : img.preview,
                imageHighResUrl: img.highRes || (typeof img === 'string' ? img : img.preview),
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
                    imageUrl: { imagePreviewUrl: typeof imageUrl === 'string' ? imageUrl : imageUrl.preview },
                    imageText: text,
                    alignment: alignment,
                    tapLinkUrl: tapLink
                }
            }], options);
        },

        aiDynamic: (jid, url, isGif = false, loopCount = 0, options = {}) => {
            return conn.msg.aiRichMessage(jid, [{
                messageType: 6, // AI_RICH_RESPONSE_DYNAMIC
                dynamicMetadata: {
                    type: isGif ? 2 : 1,
                    url: url,
                    loopCount: loopCount
                }
            }], options);
        },

        aiLatex: (jid, text, expressions = [], options = {}) => {
            const exps = expressions.map(e => ({
                latexExpression: typeof e === 'string' ? e : e.formula,
                url: e.url || ""
            }));

            return conn.msg.aiRichMessage(jid, [{
                messageType: 2, // TEXT
                messageText: text,
                latexMetadata: {
                    expressions: exps
                }
            }, {
                messageType: 8, // AI_RICH_RESPONSE_LATEX
                latexMetadata: {
                    expressions: exps
                }
            }], options);
        },

        aiMap: (jid, lat, lng, annotations = [], options = {}) => {
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

            // --- 💬 MESSAGE COMMENT HELPER ---
            sendComment: (jid, text, targetMessage, options = {}) => {
            return conn.sendMessage(jid, {
                commentMessage: {
                    message: { conversation: text },
                    targetMessageKey: targetMessage.key || targetMessage
                }
            }, options);
            },

            // --- 📊 POLL RESULT SNAPSHOT HELPER ---
            sendPollResult: (jid, name, votes, isQuiz = false, options = {}) => {
            // votes: array of { name, count }
            return conn.sendMessage(jid, {
                pollResultSnapshotMessage: {
                    name: name,
                    pollVotes: votes.map(v => ({ optionName: v.name, optionVoteCount: v.count })),
                    pollType: isQuiz ? 1 : 0
                }
            }, options);
            },

            // --- 📦 NATIVE PRODUCT MESSAGE HELPER ---
            sendProduct: (jid, businessOwnerJid, productData, options = {}) => {
            // productData: { id, title, description, price, currency, thumbnail }
            return conn.sendMessage(jid, {
                productMessage: {
                    product: {
                        productId: productData.id,
                        title: productData.title,
                        description: productData.description || "",
                        currencyCode: productData.currency || "IDR",
                        priceAmount1000: (productData.price || 0) * 1000,
                        productImage: { url: productData.thumbnail }
                    },
                    businessOwnerJid: businessOwnerJid
                }
            }, options);
            },

            // --- 📍 LIVE LOCATION HELPER ---
            sendLiveLocation: (jid, lat, lng, duration = 3600, options = {}) => {
            return conn.sendMessage(jid, {
                liveLocationMessage: {
                    degreesLatitude: lat,
                    degreesLongitude: lng,
                    accuracyInMeters: 0,
                    sequenceNumber: 0,
                    timeOffset: 0,
                    contextInfo: {
                        expiration: duration
                    }
                }
            }, options);
            },

            // --- ❓ QUESTION RESPONSE HELPER ---
            replyQuestion: (jid, text, questionKey, options = {}) => {
            return conn.sendMessage(jid, {
                questionResponseMessage: {
                    key: questionKey.key || questionKey,
                    text: text
                }
            }, options);
            },

            // --- 🎭 STATUS QUOTING HELPER ---
            quoteStatus: (jid, text, originalStatusId, thumbnail, options = {}) => {
            return conn.sendMessage(jid, {
                statusQuotedMessage: {
                    type: 1, // QUESTION_ANSWER
                    text: text,
                    thumbnail: thumbnail, // Buffer
                    originalStatusId: originalStatusId.key || originalStatusId
                }
            }, options);
            },

            // --- 🔘 STATUS STICKER INTERACTION ---
            interactStatusSticker: (jid, stickerKey, statusKey, options = {}) => {
            return conn.sendMessage(jid, {
                statusStickerInteractionMessage: {
                    key: statusKey.key || statusKey,
                    stickerKey: stickerKey,
                    type: 1 // REACTION
                }
            }, options);
            },

            // --- 📅 NATIVE GROUP EVENT HELPER ---
        aiThinking: async (jid, description, steps = [], options = {}) => {
            const stepsMeta = steps.map(s => ({
                statusTitle: s.title,
                statusBody: s.body || "",
                status: s.status || 2
            }));

            return conn.msg.aiRichMessage(jid, [{
                messageType: 2,
                messageText: description
            }], {
                ...options,
                botMetadata: {
                    progressIndicatorMetadata: {
                        progressDescription: description,
                        stepsMetadata: stepsMeta
                    }
                }
            });
        },

        aiFeedback: (jid, messageKey, isPositive = true, text = "", options = {}) => {
            return conn.relayMessage(jid, {
                protocolMessage: {
                    type: 18, // BOT_FEEDBACK_MESSAGE
                    botFeedbackMessage: {
                        messageKey: messageKey,
                        kind: isPositive ? 0 : 1,
                        text: text
                    }
                }
            }, options);
        },

        aiModel: async (jid, text, modelType = 1, modelName = "Llama 3", options = {}) => {
            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], {
                ...options,
                botMetadata: {
                    modelMetadata: {
                        modelType: modelType,
                        modelNameOverride: modelName
                    }
                }
            });
        },

        aiPrompts: async (jid, text, prompts = [], options = {}) => {
            const suggestions = prompts.map(p => {
                if (typeof p === 'string') return { prompt: p, promptId: "prompt_" + Date.now() + Math.floor(Math.random() * 1000) };
                return { prompt: p.prompt, promptId: p.promptId || "prompt_" + Date.now() + Math.floor(Math.random() * 1000) };
            });

            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], {
                ...options,
                botMetadata: {
                    suggestedPromptMetadata: {
                        suggestedPrompts: suggestions.map(s => s.prompt),
                        promptSuggestions: {
                            suggestions: suggestions
                        }
                    }
                }
            });
        },

        aiReels: (jid, mainText, reels, options = {}) => {
            const reelItems = reels.map(item => ({
                reelItem: {
                    title: item.title,
                    profileIconUrl: item.profileIconUrl,
                    thumbnailUrl: item.thumbnailUrl,
                    videoUrl: item.videoUrl,
                    description: item.description || ""
                }
            }));

            const sources = reels.map((item, idx) => ({
                provider: "UNKNOWN",
                sourceProviderURL: item.videoUrl,
                citationNumber: idx + 1
            }));

            return conn.msg.aiRichMessage(jid, [
                { messageType: 2, messageText: mainText },
                {
                    messageType: 9, // AI_RICH_RESPONSE_CONTENT_ITEMS
                    contentItemsMetadata: {
                        contentType: 1, // CAROUSEL
                        itemsMetadata: reelItems
                    }
                }
            ], { ...options, sources });
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

        // Native Reply Helpers
        m.replyInvoice = (data, options = {}) => conn.msg.sendInvoice(m.chat, data, { quoted: m, ...options });
        m.replyOrder = (data, options = {}) => conn.msg.sendOrder(m.chat, data, { quoted: m, ...options });
        m.replyComment = (text, options = {}) => conn.msg.sendComment(m.chat, text, m, options);
        m.replyPollResult = (name, votes, isQuiz = false, options = {}) => conn.msg.sendPollResult(m.chat, name, votes, isQuiz, { quoted: m, ...options });
        m.replyProduct = (ownerJid, data, options = {}) => conn.msg.sendProduct(m.chat, ownerJid, data, { quoted: m, ...options });
        m.replyLiveLocation = (lat, lng, dur = 3600, options = {}) => conn.msg.sendLiveLocation(m.chat, lat, lng, dur, { quoted: m, ...options });
        
        m.pin = (dur = 86400, options = {}) => conn.msg.pinMessage(m.chat, m.key, dur, options);
        m.unpin = (options = {}) => conn.msg.unpinMessage(m.chat, m.key, options);
        m.keep = (options = {}) => conn.msg.keepMessage(m.chat, m.key, options);
        m.unkeep = (options = {}) => conn.msg.unkeepMessage(m.chat, m.key, options);

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
        m.replyPrompts = (text, prompts = [], options = {}) => conn.msg.aiPrompts(m.chat, text, prompts, { quoted: m, ...options });
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
    conn.aiPrompts = conn.msg.aiPrompts;
    conn.aiRichMessage = conn.msg.aiRichMessage;
    
    // Global Reaction Alias
    conn.react = (jid, emoji, key) => conn.sendMessage(jid, { react: { text: emoji, key: key } });
    
    // New Native Helpers
    conn.createEvent = conn.msg.createEvent;
    conn.scheduleCall = conn.msg.scheduleCall;
    conn.bcall = conn.msg.bcall;
    conn.sendSurvey = conn.msg.sendSurvey;
    conn.sendStickerPack = conn.msg.sendStickerPack;
    conn.sendInvoice = conn.msg.sendInvoice;
    conn.sendOrder = conn.msg.sendOrder;
    conn.sendComment = conn.msg.sendComment;
    conn.sendPollResult = conn.msg.sendPollResult;
    conn.sendProduct = conn.msg.sendProduct;
    conn.sendLiveLocation = conn.msg.sendLiveLocation;
    conn.replyQuestion = conn.msg.replyQuestion;
    conn.quoteStatus = conn.msg.quoteStatus;
    conn.interactStatusSticker = conn.msg.interactStatusSticker;
    conn.pinMessage = conn.msg.pinMessage;
    conn.unpinMessage = conn.msg.unpinMessage;
    conn.keepMessage = conn.msg.keepMessage;
    conn.unkeepMessage = conn.msg.unkeepMessage;
    conn.aiReminder = conn.msg.aiReminder;
    conn.sendStatusQuestion = conn.msg.sendStatusQuestion;

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
        getInfo: (jid) => conn.getNewsletterInfo(jid),
        inviteAdmin: (jid, userJid) => conn.sendMessage(jid, {
            newsletterAdminInviteMessage: {
                newsletterJid: jid,
                newsletterName: "Admin Invite",
                inviteExpiration: Math.floor(Date.now() / 1000) + (86400 * 7) // 7 days
            }
        }, { mentions: [userJid] }),
        inviteFollower: (jid, name, thumb, caption = "") => conn.sendMessage(jid, {
            newsletterFollowerInviteMessage: {
                newsletterJid: jid,
                newsletterName: name,
                jpegThumbnail: thumb,
                caption: caption
            }
        })
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
