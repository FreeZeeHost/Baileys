"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { jidNormalizedUser, jidDecode } = require("../WABinary");
const { generateMessageID, Personas } = require("./generics");
const { ActivityLogger } = require("./activity-logger");
const { getMediaInfo } = require("./media-info");
const { TaskQueue } = require("./task-queue");
const { ApiBridge, forwardToWebhook } = require("./api-bridge");

// In-memory cache for anti-delete & optimization
const messageCache = new Map();
const deletedMessages = new Map();
const CACHE_LIMIT = 2000;

let sharp;
try {
    sharp = require("sharp");
} catch (e) {}

// Prototype-based high-performance helpers to avoid closure overhead
const MessageHelpers = {
    reply(text, options = {}) { return this._conn.sendMessage(this.chat, { text }, { quoted: this, ...options }); },
    replyWithTyping(text, options = {}, durationMs = 1000) { return this._conn.sendMessage(this.chat, { text }, { quoted: this, simulateTyping: durationMs, ...options }); },
    replyWithVN(url, options = {}, durationMs = 1500) { return this._conn.sendMessage(this.chat, { audio: { url }, ptt: true, mimetype: 'audio/mp4' }, { quoted: this, simulateRecording: durationMs, ...options }); },
    replyImage(url, caption = "", options = {}) { return this._conn.sendMessage(this.chat, { image: { url }, caption }, { quoted: this, ...options }); },
    replyVideo(url, caption = "", options = {}) { return this._conn.sendMessage(this.chat, { video: { url }, caption }, { quoted: this, ...options }); },
    replyAudio(url, ptt = false, options = {}) { return this._conn.sendMessage(this.chat, { audio: { url }, ptt, mimetype: 'audio/mp4' }, { quoted: this, ...options }); },
    replyDocument(url, fileName, options = {}) { return this._conn.sendMessage(this.chat, { document: { url }, fileName, mimetype: 'application/octet-stream' }, { quoted: this, ...options }); },
    react(emoji) { return this._conn.sendMessage(this.chat, { react: { text: emoji, key: this.key } }); },
    forward(jid, options = {}) { return this._conn.sendMessage(jid, { forward: this }, { ...options }); },
    replyInvoice(data, opt) { return this._conn.msg.sendInvoice(this.chat, data, { quoted: this, ...opt }); },
    replyOrder(data, opt) { return this._conn.msg.sendOrder(this.chat, data, { quoted: this, ...opt }); },
    replyComment(text, opt) { return this._conn.msg.sendComment(this.chat, text, this.key, { quoted: this, ...opt }); },
    replyPollResult(votes, opt) { return this._conn.msg.sendPollResult(this.chat, votes, { quoted: this, ...opt }); },
    replyProduct(owner, data, opt) { return this._conn.msg.sendProduct(this.chat, owner, data, { quoted: this, ...opt }); },
    replyLiveLocation(lat, lng, opt) { return this._conn.msg.sendLiveLocation(this.chat, { degreesLatitude: lat, degreesLongitude: lng }, { quoted: this, ...opt }); },
    replyCallLog(data, opt) { return this._conn.msg.sendCallLog(this.chat, data, { quoted: this, ...opt }); },
    pin(dur = 86400, opt) { return this._conn.msg.pinMessage(this.chat, { key: this.key, type: 1, senderTimestampMs: Date.now() }, opt); },
    keep(opt) { return this._conn.msg.keepMessage(this.chat, { key: this.key, keepType: 1, timestampMs: Date.now() }, opt); },
    replyTable(title, rows, opt) { return this._conn.msg.aiTable(this.chat, title, rows, { quoted: this, ...opt }); },
    replyCode(lang, code, opt) { return this._conn.msg.aiCode(this.chat, lang, code, { quoted: this, ...opt }); },
    replyReels(text, reels, opt) { return this._conn.msg.aiReels(this.chat, text, reels, { quoted: this, ...opt }); },
    replyGridImage(imgs, grid, opt) { return this._conn.msg.aiGridImage(this.chat, imgs, grid, { quoted: this, ...opt }); },
    replyInlineImage(url, txt, align, link, opt) { return this._conn.msg.aiInlineImage(this.chat, url, txt, align, link, { quoted: this, ...opt }); },
    replyDynamic(url, gif, loop, opt) { return this._conn.msg.aiDynamic(this.chat, url, gif, loop, { quoted: this, ...opt }); },
    replyLatex(txt, exps, opt) { return this._conn.msg.aiLatex(this.chat, txt, exps, { quoted: this, ...opt }); },
    replyMap(lat, lng, annots, opt) { return this._conn.msg.aiMap(this.chat, lat, lng, annots, { quoted: this, ...opt }); },
    replyThinking(txt, steps, opt) { return this._conn.msg.aiThinking(this.chat, txt, steps, { quoted: this, ...opt }); },
    replyModel(txt, type, name, opt) { return this._conn.msg.aiModel(this.chat, txt, type, name, { quoted: this, ...opt }); },
    replyPrompts(txt, prompts, opt) { return this._conn.msg.aiPrompts(this.chat, txt, prompts, { quoted: this, ...opt }); },
    replyMemory(added, removed, disclaimer, opt) { return this._conn.msg.aiMemory(this.chat, this.text, added, removed, disclaimer, { quoted: this, ...opt }); },
    replyQuota(quota, exp, opt) { return this._conn.msg.aiQuota(this.chat, this.text, quota, exp, { quoted: this, ...opt }); },
    replyImagineMetadata(type, opt) { return this._conn.msg.aiImagineMetadata(this.chat, this.text, type, { quoted: this, ...opt }); },
    replyProgress(steps, opt) { return this._conn.msg.aiProgress(this.chat, this.text, steps, { quoted: this, ...opt }); },
    replyMessageOrigin(opt) { return this._conn.msg.aiMessageOrigin(this.chat, this.text, { quoted: this, ...opt }); },
    replySources(sources, opt) { return this._conn.msg.aiSources(this.chat, this.text, sources, { quoted: this, ...opt }); },
    replyProductCarousel(products, opt) { return this._conn.msg.productCarousel(this.chat, products, { quoted: this, ...opt }); },
    aiFeedback(pos, txt, opt) { return this._conn.msg.aiFeedback(this.chat, this.key, pos, txt, opt); },
    replyStickerPack(pack, opt) { return this._conn.sendMessage(this.chat, pack.stickers ? { stickerPack: pack } : { stickerPackMessage: pack }, { quoted: this, ...opt }); }
};
Object.setPrototypeOf(MessageHelpers, Object.prototype);

exports.patchSocket = (conn) => {
    // --- 👻 PHANTOM PROTOCOL ---
    conn.ghostMode = false;
    const vipList = new Set();
    conn.setVIP = (jid, status = true) => status ? vipList.add(jidNormalizedUser(jid)) : vipList.delete(jidNormalizedUser(jid));
    
    const originalReadMessages = conn.readMessages;
    conn.readMessages = async (keys) => {
        if (conn.ghostMode) {
            const shouldSkip = keys.some(k => !vipList.has(jidNormalizedUser(k.remoteJid)));
            if (shouldSkip) return;
        }
        return originalReadMessages.call(conn, keys);
    };

    // --- 🎭 PERSONA IDENTITY ---
    conn.setPersona = (type) => {
        const persona = Personas[type.toLowerCase()];
        if (persona) { conn.config.browser = persona; return true; }
        return false;
    };

    const cloneContent = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Buffer.isBuffer(obj)) return obj;
        if (obj.constructor && obj.constructor !== Object && obj.constructor !== Array) return obj;
        if (typeof obj.pipe === 'function') return obj;
        const clone = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clone[key] = typeof obj[key] === 'object' ? cloneContent(obj[key]) : obj[key];
            }
        }
        return clone;
    };

    const mediaCache = new Map();
    const crypto = require("crypto");
    const originalSendMessage = conn.sendMessage;
    const taskQueue = new TaskQueue(conn.logger);
    
    conn.sendMessage = async (jid, content, options = {}) => {
        return taskQueue.push(async () => {
            const currentContent = cloneContent(content);
            let typingDuration = 0;
            if (options.simulateTyping) {
                typingDuration = typeof options.simulateTyping === 'number' ? options.simulateTyping : 1000;
            } else if (conn.autoTyping && (currentContent?.text || currentContent?.conversation || currentContent?.extendedTextMessage || currentContent?.interactiveMessage)) {
                typingDuration = 1000;
            }

            let recordingDuration = 0;
            if (options.simulateRecording) {
                recordingDuration = typeof options.simulateRecording === 'number' ? options.simulateRecording : 1500;
            } else if (conn.autoRecord && currentContent?.audio) {
                recordingDuration = 1500;
            }

            if (typingDuration > 0) {
                if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('composing', jid).catch(() => {});
                await new Promise(r => setTimeout(r, typingDuration));
                if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('paused', jid).catch(() => {});
            } else if (recordingDuration > 0) {
                if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('recording', jid).catch(() => {});
                await new Promise(r => setTimeout(r, recordingDuration));
                if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('paused', jid).catch(() => {});
            }
            if (currentContent?.image && Buffer.isBuffer(currentContent.image) && sharp) {
                try {
                    currentContent.image = await sharp(currentContent.image).jpeg({ quality: 70 }).toBuffer();
                } catch (err) {}
            }
            const mediaType = ["image", "video", "audio", "document", "sticker"].find(t => currentContent && currentContent[t]);
            if (mediaType && (Buffer.isBuffer(currentContent[mediaType]) || currentContent[mediaType]?.url)) {
                const mediaData = Buffer.isBuffer(currentContent[mediaType]) ? currentContent[mediaType] : (currentContent[mediaType]?.url || "");
                const sha256 = crypto.createHash("sha256").update(mediaData).digest("hex");
                if (!mediaCache.has(sha256)) {
                    mediaCache.set(sha256, true);
                    if (mediaCache.size > 1000) mediaCache.delete(mediaCache.keys().next().value);
                }
            }
            return originalSendMessage.call(conn, jid, currentContent, options);
        });
    };

    // --- ⚡ TURBO-LOADER: Plugin Optimizer ---
    conn.prefetchPlugins = async (dirPath) => {
        const fs = require("fs");
        const path = require("path");
        if (!fs.existsSync(dirPath)) return { error: "Directory not found" };
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".js") || f.endsWith(".cjs") || f.endsWith(".mjs"));
        const startTime = Date.now();
        for (const file of files) {
            try {
                const fullPath = path.resolve(dirPath, file);
                require(fullPath); // Pre-warm the cache
            } catch (err) {}
        }
        const duration = Date.now() - startTime;
        conn.logger.info({ duration, count: files.length }, "Turbo-Loader: Plugins pre-warmed");
        return { duration, count: files.length };
    };

    // --- 🚀 ADVANCED UI HELPERS (conn.msg) ---
    conn.msg = {
        buttons: (jid, text, footer, buttons, options = {}) => conn.sendMessage(jid, { text, footer, buttons, ...options }),
        list: (jid, title, text, footer, buttonText, sections, options = {}) => {
            const mappedSections = (sections || []).map(sec => ({
                title: sec.title || "",
                highlight_label: sec.highlight_label,
                rows: (sec.rows || []).map(row => ({
                    header: row.header || "",
                    title: row.title || "",
                    id: row.id || row.rowId || "",
                    description: row.description || ""
                }))
            }));
            return conn.sendMessage(jid, {
                interactiveMessage: {
                    body: { text: text || "" },
                    footer: { text: footer || "" },
                    header: title ? { title: title, hasMediaAttachment: false } : undefined,
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: buttonText || "",
                                    sections: mappedSections
                                })
                            }
                        ]
                    }
                }
            }, options);
        },
        poll: (jid, name, values, selectableCount = 1, options = {}) => conn.sendMessage(jid, { poll: { name, values, selectableCount }, ...options }),
        carousel: (jid, cards, options = {}) => conn.sendMessage(jid, { cards, text: options.text || "", footer: options.footer || "" }, options),
        nativeTable: (jid, title, rows, options = {}) => conn.sendMessage(jid, {
            interactiveMessage: {
                body: { text: title },
                nativeFlowMessage: {
                    buttons: [{
                        name: "table",
                        buttonParamsJson: JSON.stringify({ title, rows })
                    }],
                    messageVersion: 1
                }
            }
        }, options),
        
        // --- 🤖 META AI RICH ENGINE ---
        aiRichMessage: async (jid, submessages, options = {}) => {
            const { generateMessageID, getBuffer } = require("./generics");
            const randomId = () => crypto.randomBytes(8).toString('hex');

            const uploadToCatbox = async (buffer) => {
                const axios = require("axios");
                const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
                const header = `--${boundary}\r\nContent-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n--${boundary}\r\nContent-Disposition: form-data; name="fileToUpload"; filename="image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
                const footer = `\r\n--${boundary}--\r\n`;
                const payload = Buffer.concat([
                    Buffer.from(header, "utf-8"),
                    buffer,
                    Buffer.from(footer, "utf-8")
                ]);
                const response = await axios.post("https://catbox.moe/user/api.php", payload, {
                    headers: {
                        "Content-Type": `multipart/form-data; boundary=${boundary}`,
                        "Content-Length": payload.length
                    }
                });
                return response.data.trim();
            };

            const prepareMediaUrl = async (input) => {
                if (!input) return "";
                if (typeof input === 'string' && input.startsWith('http')) {
                    return input; // Keep public URLs directly so the client can load them unencrypted
                }
                if (Buffer.isBuffer(input)) {
                    try {
                        return await uploadToCatbox(input);
                    } catch (e) {
                        try {
                            const upload = await conn.waUploadToServer(input, { mediaType: 'image', newsletter: true });
                            return upload.url;
                        } catch (err) {
                            return "";
                        }
                    }
                }
                return input;
            };

            for (const sm of submessages) {
                if (sm.gridImageMetadata) { for (const img of sm.gridImageMetadata.imageUrls) { img.imagePreviewUrl = await prepareMediaUrl(img.imagePreviewUrl); img.imageHighResUrl = await prepareMediaUrl(img.imageHighResUrl); } }
                if (sm.imageMetadata?.imageUrl) sm.imageMetadata.imageUrl.imagePreviewUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imagePreviewUrl);
                if (sm.dynamicMetadata?.url) sm.dynamicMetadata.url = await prepareMediaUrl(sm.dynamicMetadata.url);
                if (sm.contentItemsMetadata?.itemsMetadata) { for (const item of sm.contentItemsMetadata.itemsMetadata) { if (item.reelItem) { item.reelItem.thumbnailUrl = await prepareMediaUrl(item.reelItem.thumbnailUrl); item.reelItem.profileIconUrl = await prepareMediaUrl(item.reelItem.profileIconUrl); } } }
            }

            const sections = [];
            for (const sm of submessages) {
                let primitive = {};
                switch(sm.messageType) {
                    case 1:
                        sm.gridImageMetadata.imageUrls.forEach(img => {
                            sections.push({ view_model: { primitive: { media: { url: img.imageHighResUrl || img.imagePreviewUrl, mime_type: 'image/jpeg' }, imagine_type: 3, status: { status: 'READY' }, __typename: "GenAIImaginePrimitive" }, __typename: "GenAISingleLayoutViewModel" } });
                        });
                        continue;
                    case 2: primitive = { text: sm.messageText, __typename: "GenAIMarkdownTextUXPrimitive" }; break;
                    case 3: primitive = { media: { url: sm.imageMetadata.imageUrl.imagePreviewUrl, mime_type: 'image/jpeg' }, caption: sm.imageMetadata.imageText, imagine_type: 3, status: { status: 'READY' }, __typename: "GenAIImaginePrimitive" }; break;
                    case 4: primitive = { title: sm.tableMetadata.title, rows: sm.tableMetadata.rows.map(r => ({ cells: r.items.map(cell => ({ text: cell })), style: r.isHeading ? "BOLD" : "NORMAL" })), __typename: "GenAITableUXPrimitive" }; break;
                    case 5: primitive = { language: sm.codeMetadata.codeLanguage, code: sm.codeMetadata.codeBlocks.map(b => b.codeContent).join(""), __typename: "GenAICodeUXPrimitive" }; break;
                    case 6: primitive = { url: sm.dynamicMetadata.url, thumbnail_url: sm.dynamicMetadata.url, type: sm.dynamicMetadata.type === 2 ? "GIF" : "IMAGE", __typename: "GenAIDynamicUXPrimitive" }; break;
                    case 7: primitive = { payload: { center: { latitude: sm.mapMetadata.centerLatitude, longitude: sm.mapMetadata.centerLongitude }, markers: sm.mapMetadata.annotations.map(a => ({ latitude: a.latitude, longitude: a.longitude, title: a.title, description: a.body })) }, __typename: "GenAIMapUXPrimitive" }; break;
                    case 8: primitive = { text: sm.latexMetadata.text || "", formulas: sm.latexMetadata.expressions.map(e => e.latexExpression), __typename: "GenAILatexUXPrimitive" }; break;
                    case 9: sections.push({ view_model: { primitives: sm.contentItemsMetadata.itemsMetadata.map(item => ({ reels_url: item.reelItem.videoUrl, thumbnail_url: item.reelItem.thumbnailUrl, creator: item.reelItem.title, avatar_url: item.reelItem.profileIconUrl, reels_title: item.reelItem.description || "", reel_source: "IG", __typename: "GenAIReelPrimitive" })), __typename: "GenAIHScrollLayoutViewModel" } }); continue;
                }
                sections.push({ view_model: { primitive, __typename: "GenAISingleLayoutViewModel" } });
            }

            if (options.botMetadata?.progressIndicatorMetadata) { sections.unshift({ view_model: { primitive: { status: "GENERATING", display_text: options.botMetadata.progressIndicatorMetadata.progressDescription, __typename: "GenAIProgressPrimitive" }, __typename: "GenAISingleLayoutViewModel" } }); }

            const unifiedResponseData = { response_id: generateMessageID(), sections };

            const content = {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { pluginMetadata: {}, richResponseSourcesMetadata: options.sources ? { sources: options.sources } : undefined, ...options.botMetadata } },
                botForwardedMessage: {
                    message: {
                        conversation: options.fallbackText || "",
                        richResponseMessage: {
                            messageType: 1,
                            submessages,
                            unifiedResponse: { data: Buffer.from(JSON.stringify(unifiedResponseData)) },
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
                                forwardOrigin: 4,
                                ...(options.quoted ? { stanzaId: options.quoted.key.id, participant: options.quoted.key.participant || options.quoted.key.remoteJid, quotedMessage: options.quoted.message } : {})
                            }
                        }
                    }
                }
            };

            await conn.relayMessage(jid, content, { messageId: options.messageId || generateMessageID(), ...options });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "AI_MSG" }, message: content };
        },

        aiTable: (jid, title, rows, options = {}) => {
            const formattedRows = rows.map(r => ({ items: Array.isArray(r) ? r : (r.cells || r.items || []), isHeading: r.isHeading || false }));
            
            let maxLens = [];
            formattedRows.forEach(row => {
                row.items.forEach((item, idx) => {
                    maxLens[idx] = Math.max(maxLens[idx] || 0, String(item).length);
                });
            });
            
            let tableText = `*${title}*\n\`\`\`\n`;
            formattedRows.forEach((row, rowIdx) => {
                let rowCells = row.items.map((item, idx) => String(item).padEnd(maxLens[idx]));
                tableText += `| ${rowCells.join(" | ")} |\n`;
                if (row.isHeading || rowIdx === 0) {
                    let separators = maxLens.map(len => "-".repeat(len));
                    tableText += `| ${separators.join(" | ")} |\n`;
                }
            });
            tableText += `\`\`\``;

            return conn.msg.aiRichMessage(jid, [
                { messageType: 4, tableMetadata: { title: title, rows: formattedRows.map(r => ({ items: r.items, isHeading: r.isHeading })) } }
            ], { ...options, fallbackText: tableText.trim() });
        },
        aiCode: (jid, language, code, options = {}) => {
            const fallbackText = `\`\`\`\n${code}\n\`\`\``;
            return conn.msg.aiRichMessage(jid, [
                { messageType: 5, codeMetadata: { codeLanguage: language, codeBlocks: [{ highlightType: 0, codeContent: code }] } }
            ], { ...options, fallbackText });
        },
        aiGridImage: (jid, imageUrls, gridImageUrl = null, options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 1, gridImageMetadata: { gridImageUrl: gridImageUrl || imageUrls[0], imageUrls: imageUrls.map(img => ({ imagePreviewUrl: typeof img === 'string' ? img : img.preview, imageHighResUrl: img.highRes || (typeof img === 'string' ? img : img.preview), sourceUrl: img.source || "" })) } }], options),
        aiInlineImage: (jid, imageUrl, text = "", alignment = 0, tapLink = "", options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 3, imageMetadata: { imageUrl: { imagePreviewUrl: typeof imageUrl === 'string' ? imageUrl : imageUrl.preview }, imageText: text, alignment: alignment, tapLinkUrl: tapLink } }], options),
        aiDynamic: (jid, url, isGif = false, loopCount = 0, options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 6, dynamicMetadata: { type: isGif ? 2 : 1, url: url, loopCount: loopCount } }], options),
        aiLatex: (jid, text, expressions = [], options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text, latexMetadata: { expressions: expressions.map(e => ({ latexExpression: typeof e === 'string' ? e : e.formula, url: e.url || "" })) } }, { messageType: 8, latexMetadata: { expressions: expressions.map(e => ({ latexExpression: typeof e === 'string' ? e : e.formula, url: e.url || "" })) } }], options),
        aiMap: (jid, lat, lng, annotations = [], options = {}) => {
            const title = annotations[0]?.title || "Lokasi Peta";
            const body = annotations[0]?.body || `Koordinat: ${lat}, ${lng}`;
            return conn.sendMessage(jid, {
                location: {
                    degreesLatitude: lat,
                    degreesLongitude: lng,
                    name: title,
                    address: body
                }
            }, options);
        },
        aiThinking: async (jid, description, steps = [], options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: description }], { ...options, botMetadata: { progressIndicatorMetadata: { progressDescription: description, stepsMetadata: steps.map(s => ({ statusTitle: s.title, statusBody: s.body || "", status: s.status || 2 })) } } }),
        aiModel: async (jid, text, modelType = 1, modelName = "Llama 3", options = {}) => conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], { ...options, botMetadata: { modelMetadata: { modelType: modelType, modelNameOverride: modelName } } }),
        aiPrompts: async (jid, text, prompts = [], options = {}) => { const suggestions = prompts.map(p => ({ prompt: typeof p === 'string' ? p : p.prompt, promptId: p.promptId || "prompt_" + Date.now() + Math.floor(Math.random() * 1000) })); return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], { ...options, botMetadata: { suggestedPromptMetadata: { suggestedPrompts: suggestions.map(s => s.prompt), promptSuggestions: { suggestions: suggestions } } } }); },
        aiReels: (jid, mainText, reels, options = {}) => { const reelItems = reels.map(item => ({ reelItem: { title: item.title, profileIconUrl: item.profileIconUrl, thumbnailUrl: item.thumbnailUrl, videoUrl: item.videoUrl, description: item.description || "" } })); const sources = reels.map((item, idx) => ({ provider: "UNKNOWN", sourceProviderURL: item.videoUrl, citationNumber: idx + 1 })); return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: mainText }, { messageType: 9, contentItemsMetadata: { contentType: 1, itemsMetadata: reelItems } }], { ...options, sources }); },
        aiMemory: (jid, text, addedFacts = [], removedFacts = [], disclaimer = "", options = {}) => conn.sendMessage(jid, { text, messageContextInfo: { botMetadata: { memoryMetadata: { addedFacts: addedFacts.map((f, i) => ({ fact: f, factId: "fact_" + Date.now() + "_" + i })), removedFacts: removedFacts.map((f, i) => ({ fact: f, factId: "fact_" + Date.now() + "_" + i })), disclaimer } } } }, options),
        aiQuota: (jid, text, remainingQuota, expirationSecs = 86400, options = {}) => conn.sendMessage(jid, { text, messageContextInfo: { botMetadata: { botQuotaMetadata: { botFeatureQuotaMetadata: [{ featureType: 1, remainingQuota, expirationTimestamp: Math.floor(Date.now() / 1000) + expirationSecs }] } } } }, options),
        aiImagineMetadata: (jid, text, imagineType = 1, options = {}) => conn.sendMessage(jid, { text, messageContextInfo: { botMetadata: { imagineMetadata: { imagineType } } } }, options),
        aiProgress: (jid, description, steps = [], options = {}) => conn.sendMessage(jid, { text: description, messageContextInfo: { botMetadata: { progressIndicatorMetadata: { progressDescription: description, stepsMetadata: steps.map(s => ({ statusTitle: s.title, statusBody: s.body || "", status: s.status || 2, isReasoning: s.isReasoning || false, isEnhancedSearch: s.isEnhancedSearch || false })) } } } }, options),
        aiMessageOrigin: (jid, text, options = {}) => conn.sendMessage(jid, { text, messageContextInfo: { botMetadata: { botMessageOriginMetadata: { origins: [{ type: 0 }] } } } }, options),
        aiSources: (jid, text, sources = [], options = {}) => conn.sendMessage(jid, { text, messageContextInfo: { botMetadata: { richResponseSourcesMetadata: { sources: sources.map((s, idx) => ({ provider: s.provider || 1, thumbnailCdnUrl: s.thumbnail || "", sourceProviderUrl: s.url, sourceQuery: s.query || "", faviconCdnUrl: s.favicon || "", citationNumber: s.citationNumber || (idx + 1), sourceTitle: s.title })) } } } }, options),
        aiFeedback: (jid, key, positive, text = "", options = {}) => conn.sendMessage(jid, { botFeedbackMessage: { messageKey: key, kind: positive ? 0 : 14, text } }, options),
        productCarousel: (jid, products, options = {}) => {
            const cards = products.map(p => ({
                product: {
                    productId: p.productId,
                    title: p.title || "",
                    description: p.description || "",
                    currencyCode: p.currencyCode || "IDR",
                    priceAmount1000: p.price ? p.price * 1000 : 0,
                    salePriceAmount1000: p.salePrice ? p.salePrice * 1000 : undefined,
                    url: p.url || "",
                    productImage: p.image
                },
                businessOwnerJid: p.businessOwnerJid || conn.user?.id || conn.user?.jid,
                title: p.title || "",
                body: p.body || "",
                footer: p.footer || "",
                buttons: p.buttons ? p.buttons.map(b => ({ name: b.name || "quick_reply", buttonParamsJson: JSON.stringify(b.params || {}) })) : undefined
            }));
            return conn.sendMessage(jid, { cards, text: options.text || "", footer: options.footer || "" }, options);
        },

        // --- 🚀 CONVENIENCE NATIVE ALIASES ---
        createEvent: (jid, event, options) => conn.sendMessage(jid, { eventMessage: event }, options),
        scheduleCall: (jid, call, options) => conn.sendMessage(jid, { scheduledCallCreationMessage: call }, options),
        bcall: (jid, bcall, options) => conn.sendMessage(jid, { bcallMessage: { ...bcall, masterKey: bcall.masterKey || Buffer.alloc(32) } }, options),
        sendSurvey: (jid, survey, options = {}) => {
            const buildSurveyMetadata = (s = {}) => {
                const randomId = () => Math.random().toString(36).substring(2, 15);
                const simonSessionId = s.simonSessionId || s.simonSessionFbid || randomId();
                const tessaSessionId = s.tessaSessionId || s.simonSessionFbid || randomId();
                const simonSurveyId = s.simonSurveyId || String(s.surveyId || "12345");
                const requestId = s.requestId || s.responseOtid || randomId();

                const invitationHeaderText = s.invitationHeaderText || "Bantu Kami Meningkatkan Layanan";
                const invitationBodyText = s.invitationBodyText || "Silakan berikan masukan Anda melalui survei singkat ini.";
                const invitationCtaText = s.invitationCtaText || "Mulai Survei";
                
                const surveyTitle = s.surveyTitle || "Survei Kepuasan";
                const surveyContinueButtonText = s.surveyContinueButtonText || "Lanjut";
                const surveySubmitButtonText = s.surveySubmitButtonText || "Kirim";

                let questions = [];
                if (s.questions && Array.isArray(s.questions) && s.questions.length > 0) {
                    questions = s.questions.map((q, idx) => {
                        const qOptions = (q.questionOptions || []).map((o, oIdx) => ({
                            stringValue: o.stringValue || String(oIdx + 1),
                            numericValue: typeof o.numericValue === 'number' ? o.numericValue : (oIdx + 1),
                            textTranslated: o.textTranslated || o.stringValue || String(oIdx + 1)
                        }));
                        return {
                            questionText: q.questionText || "Pertanyaan?",
                            questionId: q.questionId || `q${idx + 1}`,
                            questionOptions: qOptions
                        };
                    });
                } else {
                    questions = [
                        {
                            questionId: "q1",
                            questionText: "Bagaimana kualitas pelayanan kami?",
                            questionOptions: [
                                { stringValue: "1", numericValue: 1, textTranslated: "Sangat Buruk" },
                                { stringValue: "2", numericValue: 2, textTranslated: "Buruk" },
                                { stringValue: "3", numericValue: 3, textTranslated: "Cukup" },
                                { stringValue: "4", numericValue: 4, textTranslated: "Baik" },
                                { stringValue: "5", numericValue: 5, textTranslated: "Sangat Baik" }
                            ]
                        },
                        {
                            questionId: "q2",
                            questionText: "Apakah Anda bersedia merekomendasikan kami kepada teman Anda?",
                            questionOptions: [
                                { stringValue: "1", numericValue: 1, textTranslated: "Ya, pasti" },
                                { stringValue: "2", numericValue: 2, textTranslated: "Mungkin" },
                                { stringValue: "3", numericValue: 3, textTranslated: "Tidak" }
                            ]
                        }
                    ];
                }

                return {
                    tessaSessionId,
                    simonSessionId,
                    simonSurveyId,
                    requestId,
                    invitationHeaderText,
                    invitationBodyText,
                    invitationCtaText,
                    surveyTitle,
                    questions,
                    surveyContinueButtonText,
                    surveySubmitButtonText,
                    tessaRootId: s.tessaRootId || randomId(),
                    tessaEvent: s.tessaEvent || "survey_invitation",
                    feedbackToastText: s.feedbackToastText || "Terima kasih atas masukan Anda!",
                    privacyStatementFull: s.privacyStatementFull || "Tanggapan Anda aman dan rahasia.",
                    privacyStatementParts: s.privacyStatementParts || []
                };
            };
            const metadata = buildSurveyMetadata(survey);
            const text = metadata.invitationBodyText || "Silakan berikan masukan Anda melalui survei singkat ini.";
            return conn.sendMessage(jid, {
                text,
                messageContextInfo: {
                    botMetadata: {
                        inThreadSurveyMetadata: metadata
                    }
                }
            }, options);
        },
        sendStickerPack: (jid, pack, options) => conn.sendMessage(jid, pack.stickers ? { stickerPack: pack } : { stickerPackMessage: pack }, options),
        sendInvoice: (jid, invoice, options) => conn.sendMessage(jid, { invoiceMessage: invoice }, options),
        sendOrder: (jid, order, options) => conn.sendMessage(jid, { orderMessage: order }, options),
        sendComment: (jid, text, key, options) => conn.sendMessage(jid, { commentMessage: { message: { conversation: text }, targetMessageKey: key } }, options),
        sendPollResult: (jid, pollResult, options) => conn.sendMessage(jid, { pollResultSnapshotMessage: pollResult }, options),
        sendProduct: (jid, businessOwnerJid, product, options) => conn.sendMessage(jid, { productMessage: { product, businessOwnerJid } }, options),
        sendLiveLocation: (jid, liveLocation, options) => conn.sendMessage(jid, { liveLocationMessage: liveLocation }, options),
        replyQuestion: (jid, text, key, options) => conn.sendMessage(jid, { questionResponseMessage: { key, text } }, options),
        quoteStatus: (jid, status, options) => conn.sendMessage(jid, { statusQuotedMessage: status }, options),
        interactStatusSticker: (jid, interaction, options) => conn.sendMessage(jid, { statusStickerInteractionMessage: interaction }, options),
        pinMessage: (jid, pin, options) => conn.sendMessage(jid, { pinInChatMessage: pin }, options),
        keepMessage: (jid, keep, options) => conn.sendMessage(jid, { keepInChatMessage: keep }, options),
        sendStatusQuestion: (text, options) => conn.sendMessage('status@broadcast', { statusQuestionAnswerMessage: { text } }, options),
        sendCallLog: (jid, call, options) => conn.sendMessage(jid, { callLogMesssage: call }, options),
        sendHistoryNotice: (jid, notice, options) => conn.sendMessage(jid, { messageHistoryNotice: notice }, options),
        sendChatBundle: (jid, bundle, options) => conn.sendMessage(jid, { messageHistoryBundle: { ...bundle, mimetype: 'application/octet-stream', mediaKeyTimestamp: Math.floor(Date.now() / 1000) } }, options),
        sendEncReaction: (jid, enc, options) => conn.sendMessage(jid, { encReactionMessage: enc }, options),
        syncStickers: (hashes, source = "manual", options) => conn.sendMessage(conn.user.id, { stickerSyncRmrMessage: { filehash: hashes, rmrSource: source, requestTimestamp: Math.floor(Date.now() / 1000) } }, options),
        requestResend: (key, options) => conn.sendMessage(key.remoteJid, { protocolMessage: { key: key, type: 5, placeholderMessageResendRequest: [{ messageKey: key }] } }, options),
        sendPaymentInvite: (jid, type = 1, options) => conn.sendMessage(jid, { paymentInviteMessage: { serviceType: type, expiryTimestamp: Math.floor(Date.now() / 1000) + 86400 } }, options),
        sendPollV5: (jid, poll, options) => conn.sendMessage(jid, { pollCreationMessageV5: poll }, options)
    };

    // --- 1. LIGHTWEIGHT & RESPONSIVE: Auto Optimizer ---
    conn.autoOptimize = () => { if (conn.store) { conn.store.chats.clear(); conn.store.messages = {}; } if (global.gc) global.gc(); };

    // --- 6. EASY TO USE: smsg helper ---
    conn.smsg = (m) => {
        if (!m.message) return m;
        const msg = Object.create(MessageHelpers);
        Object.assign(msg, m);
        if (msg.key) { msg.id = msg.key?.id; msg.isMe = msg.key.fromMe; msg.chat = msg.key.remoteJid; msg.isGroup = msg.chat.endsWith("@g.us"); msg.sender = jidNormalizedUser(msg.isMe ? (conn.user?.id || conn.user?.jid) : (msg.key.participant || msg.chat)); }
        msg.text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || msg.message.templateButtonReplyMessage?.selectedId || msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId || "";
        const prefix = /^[./!#]/.test(msg.text) ? msg.text.charAt(0) : ""; msg.prefix = prefix; msg.isCommand = !!prefix;
        const body = msg.isCommand ? msg.text.slice(1).trim() : msg.text.trim();
        const args = body.split(/\s+/); msg.command = args.shift()?.toLowerCase(); msg.args = args; msg.query = args.join(" ");
        
        msg._conn = conn;
        return msg;
    };

    global.smsg = conn.smsg;
    conn.aiTable = conn.msg.aiTable; conn.aiCode = conn.msg.aiCode; conn.aiReels = conn.msg.aiReels; conn.aiGridImage = conn.msg.aiGridImage; conn.aiInlineImage = conn.msg.aiInlineImage; conn.aiDynamic = conn.msg.aiDynamic; conn.aiLatex = conn.msg.aiLatex; conn.aiMap = conn.msg.aiMap; conn.aiThinking = conn.msg.aiThinking; conn.aiFeedback = conn.msg.aiFeedback; conn.aiModel = conn.msg.aiModel; conn.aiPrompts = conn.msg.aiPrompts; conn.aiRichMessage = conn.msg.aiRichMessage;
    conn.aiMemory = conn.msg.aiMemory; conn.aiQuota = conn.msg.aiQuota; conn.aiImagineMetadata = conn.msg.aiImagineMetadata; conn.aiProgress = conn.msg.aiProgress; conn.aiMessageOrigin = conn.msg.aiMessageOrigin; conn.aiSources = conn.msg.aiSources; conn.productCarousel = conn.msg.productCarousel;
    conn.react = (jid, emoji, key) => conn.sendMessage(jid, { react: { text: emoji, key: key } });
    conn.simulateTyping = async (jid, durationMs = 1000) => {
        if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('composing', jid).catch(() => {});
        await new Promise(r => setTimeout(r, durationMs));
        if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('paused', jid).catch(() => {});
    };
    conn.simulateRecording = async (jid, durationMs = 1500) => {
        if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('recording', jid).catch(() => {});
        await new Promise(r => setTimeout(r, durationMs));
        if (typeof conn.sendPresenceUpdate === 'function') await conn.sendPresenceUpdate('paused', jid).catch(() => {});
    };
    conn.createEvent = conn.msg.createEvent; conn.scheduleCall = conn.msg.scheduleCall; conn.bcall = conn.msg.bcall; conn.sendSurvey = conn.msg.sendSurvey; conn.sendStickerPack = conn.msg.sendStickerPack; conn.sendInvoice = conn.msg.sendInvoice; conn.sendOrder = conn.msg.sendOrder; conn.sendComment = conn.msg.sendComment; conn.sendPollResult = conn.msg.sendPollResult; conn.sendProduct = conn.msg.sendProduct; conn.sendLiveLocation = conn.msg.sendLiveLocation; conn.replyQuestion = conn.msg.replyQuestion; conn.quoteStatus = conn.msg.quoteStatus; conn.interactStatusSticker = conn.msg.interactStatusSticker; conn.pinMessage = conn.msg.pinMessage; conn.keepMessage = conn.msg.keepMessage; conn.sendStatusQuestion = conn.msg.sendStatusQuestion;
    conn.sendCallLog = conn.msg.sendCallLog; conn.sendHistoryNotice = conn.msg.sendHistoryNotice; conn.sendChatBundle = conn.msg.sendChatBundle; conn.sendEncReaction = conn.msg.sendEncReaction; conn.syncStickers = conn.msg.syncStickers; conn.requestResend = conn.msg.requestResend; conn.sendPaymentInvite = conn.msg.sendPaymentInvite; conn.sendPollV5 = conn.msg.sendPollV5; conn.productCarousel = conn.msg.productCarousel;

    const commands = new Map();
    conn.onCommand = (cmd, callback) => {
        commands.set(cmd.toLowerCase(), callback);
    };
    conn.getGroupAdmins = async (jid) => { try { const metadata = await conn.groupMetadata(jid); return metadata.participants.filter(p => p.admin).map(p => p.id); } catch (err) { return []; } };
    conn.isAdmin = async (jid, user) => { const admins = await conn.getGroupAdmins(jid); return admins.includes(jidNormalizedUser(user)); };
    conn.autoRead = false;
    conn.antiCall = false;
    conn.autoTyping = false;
    conn.autoRecord = false;
    
    conn.ev.on('messages.upsert', async ({ messages, type }) => {
        lastPulse = Date.now();
        if (type !== 'notify' && type !== 'append') return;
        for (const m of messages) {
            // Cache messages for anti-delete
            if (m.message) {
                const key = `${m.key.remoteJid}:${m.key.id}`;
                messageCache.set(key, m);
                if (messageCache.size > CACHE_LIMIT) {
                    const firstKey = messageCache.keys().next().value;
                    messageCache.delete(firstKey);
                }
            }
            // Auto read if enabled
            if (conn.autoRead) {
                await conn.readMessages([m.key]).catch(() => {});
            }
            // Centralized command dispatcher
            const s = conn.smsg(m);
            if (s.isCommand && commands.has(s.command)) {
                try {
                    await commands.get(s.command)(s);
                } catch (err) {
                    conn.logger.error({ err, command: s.command }, "Error executing command");
                }
            }
        }
    });

    conn.ev.on('call', async (calls) => {
        if (conn.antiCall) {
            for (const call of calls) {
                if (call.status === 'offer') {
                    await conn.rejectCall(call.id, call.from);
                    await conn.sendMessage(call.from, { text: `Maaf, saya tidak menerima panggilan.` });
                }
            }
        }
    });

    conn.newsletter = {
        create: (name, description) => conn.newsletterCreate(name, description), follow: (jid) => conn.newsletterFollow(jid), unfollow: (jid) => conn.newsletterUnfollow(jid), mute: (jid) => conn.newsletterMute(jid), unmute: (jid) => conn.newsletterUnmute(jid), update: (jid, name, description) => conn.newsletterUpdateMetadata(jid, { name, description }), getInfo: (jid) => conn.getNewsletterInfo(jid),
        inviteAdmin: (jid, userJid) => conn.sendMessage(jid, { newsletterAdminInviteMessage: { newsletterJid: jid, newsletterName: "Admin Invite", inviteExpiration: Math.floor(Date.now() / 1000) + (86400 * 7) } }, { mentions: [userJid] }),
        inviteFollower: (jid, name, thumb, caption = "") => conn.sendMessage(jid, { newsletterFollowerInviteMessage: { newsletterJid: jid, newsletterName: name, jpegThumbnail: thumb, caption: caption } })
    };

    conn.ev.on('messages.update', (updates) => {
        for (const update of updates) {
            if (update.update.messageStubType === 1 || update.update.protocolMessage?.type === 0) {
                const jid = update.key.remoteJid;
                const id = update.key.id;
                const original = messageCache.get(`${jid}:${id}`);
                if (original) {
                    deletedMessages.set(`${jid}:${id}`, original);
                    if (deletedMessages.size > CACHE_LIMIT) {
                        const firstKey = deletedMessages.keys().next().value;
                        deletedMessages.delete(firstKey);
                    }
                    conn.ev.emit('message.delete', { jid, id, message: original });
                }
            }
        }
    });

    let lastPulse = Date.now();
    const medicInterval = setInterval(() => { const diff = Date.now() - lastPulse; if (diff > 45000 && conn.ws?.readyState === 1) conn.ws.close(); }, 15000);
    const webhookUrl = process.env.WEBHOOK_URL || conn.webhookUrl || conn.config.webhookUrl;
    conn.ev.on('connection.update', (update) => { if (webhookUrl) forwardToWebhook(webhookUrl, { event: 'connection.update', data: update }, conn.logger); const { connection } = update; if (connection === 'close') clearInterval(medicInterval); });

    return conn;
};
