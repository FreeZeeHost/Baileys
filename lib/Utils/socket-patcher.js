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
    react(emoji) { return this._conn.sendMessage(this.chat, { react: { text: emoji, key: this.key } }); },
    forward(jid, options = {}) { return this._conn.sendMessage(jid, { forward: this }, { ...options }); },
    replyImage(urlOrBuffer, caption = "", options = {}) { return this._conn.sendMessage(this.chat, { image: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, caption }, { quoted: this, ...options }); },
    replyVideo(urlOrBuffer, caption = "", options = {}) { return this._conn.sendMessage(this.chat, { video: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, caption }, { quoted: this, ...options }); },
    replyAudio(urlOrBuffer, ptt = false, options = {}) { return this._conn.sendMessage(this.chat, { audio: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, ptt }, { quoted: this, ...options }); },
    replyDocument(urlOrBuffer, fileName, options = {}) { return this._conn.sendMessage(this.chat, { document: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, fileName }, { quoted: this, ...options }); },
    replyWithTyping(text, options = {}, duration = 1000) { return this._conn.sendMessage(this.chat, { text }, { simulateTyping: duration, quoted: this, ...options }); },
    replyWithVN(urlOrBuffer, options = {}, duration = 1500) { return this._conn.sendMessage(this.chat, { audio: typeof urlOrBuffer === 'string' ? { url: urlOrBuffer } : urlOrBuffer, ptt: true }, { simulateRecording: duration, quoted: this, ...options }); },
    
    replyInvoice(data, options = {}) { return this._conn.msg.sendInvoice(this.chat, data, { quoted: this, ...options }); },
    replyOrder(data, options = {}) { return this._conn.msg.sendOrder(this.chat, data, { quoted: this, ...options }); },
    replyComment(text, options = {}) { return this._conn.msg.sendComment(this.chat, text, this.key, { quoted: this, ...options }); },
    replyPollResult(votes, options = {}) { return this._conn.msg.sendPollResult(this.chat, votes, { quoted: this, ...options }); },
    replyProduct(owner, data, options = {}) { return this._conn.msg.sendProduct(this.chat, owner, data, { quoted: this, ...options }); },
    replyLiveLocation(lat, lng, options = {}) { return this._conn.msg.sendLiveLocation(this.chat, { degreesLatitude: lat, degreesLongitude: lng }, { quoted: this, ...options }); },
    replyCallLog(data, options = {}) { return this._conn.msg.sendCallLog(this.chat, data, { quoted: this, ...options }); },
    replyStickerPack(pack, options = {}) { return this._conn.msg.sendStickerPack(this.chat, pack, { quoted: this, ...options }); },
    pin(duration = 86400, options = {}) { return this._conn.msg.pinMessage(this.chat, this.key, duration, { quoted: this, ...options }); },
    unpin(options = {}) { return this._conn.msg.unpinMessage(this.chat, this.key, { quoted: this, ...options }); },
    keep(options = {}) { return this._conn.msg.keepMessage(this.chat, this.key, 1, { quoted: this, ...options }); },
    undoKeep(options = {}) { return this._conn.msg.keepMessage(this.chat, this.key, 2, { quoted: this, ...options }); },
    replyQuestion(text, key, options = {}) { return this._conn.msg.replyQuestion(this.chat, text, key || this.key, { quoted: this, ...options }); },
    replySurvey(survey, options = {}) { return this._conn.msg.sendSurvey(this.chat, survey, { quoted: this, ...options }); },
    replyStatusQuestion(text, options = {}) { return this._conn.msg.sendStatusQuestion(text, { quoted: this, ...options }); },
    replyVideoNote(urlOrBuffer, options = {}) { return this._conn.msg.sendVideoNote(this.chat, urlOrBuffer, { quoted: this, ...options }); },
    replyImagePoll(name, optionsArray, options = {}) { return this._conn.msg.sendImagePoll(this.chat, name, optionsArray, { quoted: this, ...options }); },
    replyAIReminder(text, timestampMs, frequency = 1, options = {}) { return this._conn.msg.sendAIReminder(this.chat, text, timestampMs, frequency, { quoted: this, ...options }); },
    replyLottieSticker(urlOrBuffer, options = {}) { return this._conn.msg.sendLottieSticker(this.chat, urlOrBuffer, { quoted: this, ...options }); },
    replyGroupEvent(event, options = {}) { return this._conn.msg.sendGroupEvent(this.chat, event, { quoted: this, ...options }); },
    replyAlbum(medias, options = {}) { return this._conn.msg.sendAlbum(this.chat, medias, { quoted: this, ...options }); },

    replyTable(title, rows, opt = {}) { return this.aiTable(title, rows, opt); },
    replyCode(language, code, opt = {}) { return this.aiCode(language, code, opt); },
    replyReels(mainText, reels, opt = {}) { return this.aiReels(mainText, reels, opt); },
    replyGridImage(imgs, grid, opt) { return this._conn.msg.aiGridImage(this.chat, imgs, grid, { quoted: this, ...opt }); },
    replyInlineImage(url, txt, align, link, opt) { return this._conn.msg.aiInlineImage(this.chat, url, txt, align, link, { quoted: this, ...opt }); },
    replyDynamic(url, isGif = false, loopCount = 0, opt = {}) { return this.aiDynamic(url, isGif, loopCount, opt); },
    replyLatex(text, formulas, opt = {}) { return this.aiLatex(text, formulas, opt); },
    replyMap(lat, lng, annots, opt) { return this._conn.msg.aiMap(this.chat, lat, lng, annots, { quoted: this, ...opt }); },
    replyThinking(description, steps, opt = {}) { return this.aiThinking(description, steps, opt); },
    replyModel(text, modelType = 1, modelName = "Llama 3", opt = {}) { return this.aiModel(text, modelType, modelName, opt); },
    replyPrompts(text, prompts, opt = {}) { return this.aiPrompts(text, prompts, opt); },
    replyMemory(addedFacts = [], removedFacts = [], disclaimer = "", opt = {}) { return this.aiMemory("", addedFacts, removedFacts, disclaimer, opt); },
    replyQuota(remainingQuota, expirationSecs = 86400, opt = {}) { return this.aiQuota("", remainingQuota, expirationSecs, opt); },
    replyImagineMetadata(imagineType = 1, opt = {}) { return this.aiImagineMetadata("", imagineType, opt); },
    replyProgress(description, steps = [], opt = {}) { return this.aiProgress(description, steps, opt); },
    replyMessageOrigin(text = "", opt = {}) { return this.aiMessageOrigin(text, opt); },
    replySources(text = "", sources = [], opt = {}) {
        if (Array.isArray(text)) {
            sources = text;
            text = "";
        }
        return this.aiSources(text, sources, opt);
    },
    replyProductCarousel(products, opt = {}) { return this.productCarousel(products, opt); },

    aiTable(title, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiTable(this.chat, title, ...args, options);
    },
    aiCode(language, code, opt = {}) {
        return this._conn.aiCode(this.chat, language, code, { quoted: this, ...opt });
    },
    aiReels(mainText, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiReels(this.chat, mainText, ...args, options);
    },
    aiGridImage(...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiGridImage(this.chat, ...args, options);
    },
    aiInlineImage(imageUrl, text = "", alignment = 0, tapLink = "", opt = {}) {
        return this._conn.aiInlineImage(this.chat, imageUrl, text, alignment, tapLink, { quoted: this, ...opt });
    },
    aiDynamic(url, isGif = false, loopCount = 0, opt = {}) {
        return this._conn.aiDynamic(this.chat, url, isGif, loopCount, { quoted: this, ...opt });
    },
    aiLatex(text, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiLatex(this.chat, text, ...args, options);
    },
    aiMap(lat, lng, annotations = [], opt = {}) {
        return this._conn.aiMap(this.chat, lat, lng, annotations, { quoted: this, ...opt });
    },
    aiThinking(description, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiThinking(this.chat, description, ...args, options);
    },
    aiFeedback(key, positive, text = "", opt = {}) {
        return this._conn.aiFeedback(this.chat, key, positive, text, { quoted: this, ...opt });
    },
    aiModel(text, modelType = 1, modelName = "Llama 3", opt = {}) {
        return this._conn.aiModel(this.chat, text, modelType, modelName, { quoted: this, ...opt });
    },
    aiPrompts(text, ...args) {
        let options = { quoted: this };
        if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
            const userOpt = args.pop();
            options = { ...options, ...userOpt };
        }
        return this._conn.aiPrompts(this.chat, text, ...args, options);
    },
    aiMemory(text, addedFacts = [], removedFacts = [], disclaimer = "", opt = {}) {
        return this._conn.aiMemory(this.chat, text, addedFacts, removedFacts, disclaimer, { quoted: this, ...opt });
    },
    aiQuota(text, remainingQuota, expirationSecs = 86400, opt = {}) {
        return this._conn.aiQuota(this.chat, text, remainingQuota, expirationSecs, { quoted: this, ...opt });
    },
    aiImagineMetadata(text, imagineType = 1, opt = {}) {
        return this._conn.aiImagineMetadata(this.chat, text, imagineType, { quoted: this, ...opt });
    },
    aiProgress(description, steps = [], opt = {}) {
        return this._conn.aiProgress(this.chat, description, steps, { quoted: this, ...opt });
    },
    aiMessageOrigin(text, opt = {}) {
        return this._conn.aiMessageOrigin(this.chat, text, { quoted: this, ...opt });
    },
    aiSources(text, sources = [], opt = {}) {
        return this._conn.aiSources(this.chat, text, sources, { quoted: this, ...opt });
    },
    productCarousel(products, opt = {}) {
        return this._conn.productCarousel(this.chat, products, { quoted: this, ...opt });
    }
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

    const axios = require("axios");
    const fs = require("fs");

    const uploadToCatbox = async (buffer) => {
        const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
        const header = `--${boundary}\r\nContent-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n--${boundary}\r\nContent-Disposition: form-data; name="fileToUpload"; filename="image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
        const footer = `\r\n--${boundary}--\r\n`;
        const payload = Buffer.concat([
            Buffer.from(header, "utf-8"),
            buffer,
            Buffer.from(footer, "utf-8")
        ]);
        console.log("[DEBUG] Catbox upload started, size:", payload.length);
        const response = await axios.post("https://catbox.moe/user/api.php", payload, {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
                "Content-Length": payload.length
            },
            timeout: 10000
        });
        console.log("[DEBUG] Catbox upload completed:", response.data);
        return response.data.trim();
    };

    const uploadToUguu = async (buffer) => {
        const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
        const header = `--${boundary}\r\nContent-Disposition: form-data; name="files[]"; filename="file.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
        const footer = `\r\n--${boundary}--\r\n`;
        const payload = Buffer.concat([
            Buffer.from(header, "utf-8"),
            buffer,
            Buffer.from(footer, "utf-8")
        ]);
        console.log("[DEBUG] Uguu upload started, size:", payload.length);
        const response = await axios.post("https://uguu.se/upload", payload, {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
                "Content-Length": payload.length
            },
            timeout: 10000
        });
        console.log("[DEBUG] Uguu upload completed");
        if (response.data && response.data.success && response.data.files && response.data.files[0]) {
            return response.data.files[0].url.trim();
        }
        throw new Error("Uguu upload failed");
    };

    const uploadToPixeldrain = async (buffer) => {
        console.log("[DEBUG] Pixeldrain upload started, size:", buffer.length);
        const response = await axios.put("https://pixeldrain.com/api/file/file.jpg", buffer, {
            headers: {
                "Content-Type": "image/jpeg"
            },
            timeout: 10000
        });
        console.log("[DEBUG] Pixeldrain upload completed:", response.data);
        if (response.data && response.data.success && response.data.id) {
            return `https://pixeldrain.com/api/file/${response.data.id}`;
        }
        throw new Error("Pixeldrain upload failed");
    };

    const uploadAnywhere = async (buffer) => {
        const tempFilePath = "./temp-upload-" + Date.now() + "-" + Math.random().toString(36).substring(7) + ".jpg";
        try {
            if (typeof conn.waUploadToServer === 'function') {
                const crypto = require('crypto');
                const fileEncSha256 = crypto.createHash('sha256').update(buffer).digest('base64');
                fs.writeFileSync(tempFilePath, buffer);
                console.log("[DEBUG] waUploadToServer started with temp file:", tempFilePath);
                const upload = await conn.waUploadToServer(tempFilePath, { mediaType: 'image', fileEncSha256B64: fileEncSha256, newsletter: true, timeoutMs: 10000 });
                console.log("[DEBUG] waUploadToServer completed with result:", upload);
                try {
                    fs.unlinkSync(tempFilePath);
                } catch (err) {}
                if (upload) {
                    if (upload.directPath) return `https://mmg.whatsapp.net${upload.directPath}`;
                    if (upload.mediaUrl || upload.url) return upload.mediaUrl || upload.url;
                }
            } else {
                console.log("[DEBUG] conn.waUploadToServer is not a function!");
            }
        } catch (e) {
            console.log("[DEBUG] waUploadToServer failed:", e.message);
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (err) {}
        }
        console.log("[DEBUG] Falling back to public uploaders...");
        try {
            return await uploadToCatbox(buffer);
        } catch (e) {
            console.log("[DEBUG] Catbox fallback failed:", e.message);
            try {
                return await uploadToUguu(buffer);
            } catch (e2) {
                console.log("[DEBUG] Uguu fallback failed:", e2.message);
                try {
                    return await uploadToPixeldrain(buffer);
                } catch (e3) {
                    console.log("[DEBUG] Pixeldrain fallback failed:", e3.message);
                    throw new Error("All uploaders failed");
                }
            }
        }
    };

    const urlCache = new Map();
    const prepareMediaUrl = async (input, options = {}) => {
        const customUploader = options.uploader;
        if (!input) return "";
        console.log("[DEBUG] prepareMediaUrl started for:", typeof input === 'string' ? input.substring(0, 100) : "Buffer");
        if (typeof input === 'string') {
            if (input.startsWith('http://') || input.startsWith('https://')) {
                if (input.includes('.whatsapp.net') || input.includes('.fbcdn.net') || input.includes('.whatsapp.com')) {
                    console.log("[DEBUG] URL is already a WhatsApp/FB CDN URL, returning directly:", input);
                    return input;
                }
                
                const cacheKey = input + (customUploader ? '-custom' : '');
                if (urlCache.has(cacheKey)) {
                    console.log("[DEBUG] URL found in cache:", urlCache.get(cacheKey));
                    return urlCache.get(cacheKey);
                }

                try {
                    console.log("[DEBUG] Downloading external URL:", input);
                    const response = await axios.get(input, { responseType: 'arraybuffer', timeout: 5000 });
                    if (response.data) {
                        const fileBuffer = Buffer.from(response.data);
                        console.log("[DEBUG] Download completed. Uploading...");
                        const result = customUploader ? await customUploader(fileBuffer) : await uploadAnywhere(fileBuffer);
                        if (result && result !== input) {
                            urlCache.set(cacheKey, result);
                        }
                        console.log("[DEBUG] Upload finished, result:", result);
                        return result;
                    }
                } catch (err) {
                    console.log("[DEBUG] Failed to download or upload external URL:", err.message);
                }
                return input;
            }
            try {
                if (fs.existsSync(input)) {
                    console.log("[DEBUG] Local file exists, uploading:", input);
                    const fileBuffer = fs.readFileSync(input);
                    return customUploader ? await customUploader(fileBuffer) : await uploadAnywhere(fileBuffer);
                }
            } catch (err) {
                console.log("[DEBUG] Failed to upload local file:", err.message);
            }
            return input;
        }
        if (Buffer.isBuffer(input)) {
            try {
                console.log("[DEBUG] Buffer input, uploading...");
                return customUploader ? await customUploader(input) : await uploadAnywhere(input);
            } catch (err) {
                console.log("[DEBUG] Failed to upload Buffer:", err.message);
                return "";
            }
        }
        return input;
    };

    const originalRelayMessage = conn.relayMessage;
    conn.relayMessage = async (jid, content, options = {}) => {
        let richMsg = content?.botForwardedMessage?.message?.richResponseMessage;
        if (richMsg) {
            const mediaPromises = [];

            if (Array.isArray(richMsg.submessages)) {
                for (const sm of richMsg.submessages) {
                    if (sm.gridImageMetadata) {
                        if (sm.gridImageMetadata.gridImageUrl) {
                            mediaPromises.push((async () => sm.gridImageMetadata.gridImageUrl.imagePreviewUrl = await prepareMediaUrl(sm.gridImageMetadata.gridImageUrl.imagePreviewUrl, options))());
                            mediaPromises.push((async () => sm.gridImageMetadata.gridImageUrl.imageHighResUrl = await prepareMediaUrl(sm.gridImageMetadata.gridImageUrl.imageHighResUrl, options))());
                        }
                        if (Array.isArray(sm.gridImageMetadata.imageUrls)) {
                            for (const img of sm.gridImageMetadata.imageUrls) {
                                mediaPromises.push((async () => img.imagePreviewUrl = await prepareMediaUrl(img.imagePreviewUrl, options))());
                                mediaPromises.push((async () => img.imageHighResUrl = await prepareMediaUrl(img.imageHighResUrl, options))());
                            }
                        }
                    }
                    if (sm.imageMetadata?.imageUrl) {
                        mediaPromises.push((async () => sm.imageMetadata.imageUrl.imagePreviewUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imagePreviewUrl, options))());
                        mediaPromises.push((async () => sm.imageMetadata.imageUrl.imageHighResUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imageHighResUrl, options))());
                    }
                    if (sm.dynamicMetadata?.url) {
                        mediaPromises.push((async () => sm.dynamicMetadata.url = await prepareMediaUrl(sm.dynamicMetadata.url, options))());
                    }
                    if (sm.contentItemsMetadata?.itemsMetadata) {
                        for (const item of sm.contentItemsMetadata.itemsMetadata) {
                            if (item.reelItem) {
                                mediaPromises.push((async () => item.reelItem.thumbnailUrl = await prepareMediaUrl(item.reelItem.thumbnailUrl, options))());
                                mediaPromises.push((async () => item.reelItem.profileIconUrl = await prepareMediaUrl(item.reelItem.profileIconUrl, options))());
                            }
                        }
                    }
                }
            }

            let parsedUnifiedData = null;
            if (richMsg.unifiedResponse?.data) {
                try {
                    let data = richMsg.unifiedResponse.data;
                    parsedUnifiedData = typeof data === 'string' ? JSON.parse(data) : data;
                    if (parsedUnifiedData && Array.isArray(parsedUnifiedData.sections)) {
                        for (const sec of parsedUnifiedData.sections) {
                            const vm = sec.view_model;
                            if (!vm) continue;
                            if (vm.primitive) {
                                const prim = vm.primitive;
                                if (prim.media?.url) {
                                    mediaPromises.push((async () => prim.media.url = await prepareMediaUrl(prim.media.url, options))());
                                }
                                if (prim.url) {
                                    mediaPromises.push((async () => prim.url = await prepareMediaUrl(prim.url, options))());
                                }
                                if (prim.thumbnail_url) {
                                    mediaPromises.push((async () => prim.thumbnail_url = await prepareMediaUrl(prim.thumbnail_url, options))());
                                }
                            }
                            if (Array.isArray(vm.primitives)) {
                                for (const prim of vm.primitives) {
                                    if (prim.thumbnail_url) {
                                        mediaPromises.push((async () => prim.thumbnail_url = await prepareMediaUrl(prim.thumbnail_url, options))());
                                    }
                                    if (prim.avatar_url) {
                                        mediaPromises.push((async () => prim.avatar_url = await prepareMediaUrl(prim.avatar_url, options))());
                                    }
                                    if (prim.reels_url) {
                                        mediaPromises.push((async () => prim.reels_url = await prepareMediaUrl(prim.reels_url, options))());
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    conn.logger.error({ err }, "Error parsing unifiedResponse.data in relayMessage");
                }
            }

            await Promise.all(mediaPromises);

            if (parsedUnifiedData) {
                if (typeof richMsg.unifiedResponse.data === 'string') {
                    richMsg.unifiedResponse.data = JSON.stringify(parsedUnifiedData);
                } else {
                    richMsg.unifiedResponse.data = parsedUnifiedData;
                }
            }
        }
        return originalRelayMessage.call(conn, jid, content, options);
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
            const randomId = () => crypto.randomBytes(8).toString('hex');

            const mediaPromises = [];

            for (const sm of submessages) {
                if (sm.gridImageMetadata) {
                    if (sm.gridImageMetadata.gridImageUrl) {
                        mediaPromises.push((async () => sm.gridImageMetadata.gridImageUrl.imagePreviewUrl = await prepareMediaUrl(sm.gridImageMetadata.gridImageUrl.imagePreviewUrl, options))());
                        mediaPromises.push((async () => sm.gridImageMetadata.gridImageUrl.imageHighResUrl = await prepareMediaUrl(sm.gridImageMetadata.gridImageUrl.imageHighResUrl, options))());
                    }
                    if (Array.isArray(sm.gridImageMetadata.imageUrls)) {
                        for (const img of sm.gridImageMetadata.imageUrls) {
                            mediaPromises.push((async () => img.imagePreviewUrl = await prepareMediaUrl(img.imagePreviewUrl, options))());
                            mediaPromises.push((async () => img.imageHighResUrl = await prepareMediaUrl(img.imageHighResUrl, options))());
                        }
                    }
                }
                if (sm.imageMetadata?.imageUrl) {
                    mediaPromises.push((async () => sm.imageMetadata.imageUrl.imagePreviewUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imagePreviewUrl, options))());
                    mediaPromises.push((async () => sm.imageMetadata.imageUrl.imageHighResUrl = await prepareMediaUrl(sm.imageMetadata.imageUrl.imageHighResUrl, options))());
                }
                if (sm.dynamicMetadata?.url) {
                    mediaPromises.push((async () => sm.dynamicMetadata.url = await prepareMediaUrl(sm.dynamicMetadata.url, options))());
                }
                if (sm.contentItemsMetadata?.itemsMetadata) {
                    for (const item of sm.contentItemsMetadata.itemsMetadata) {
                        if (item.reelItem) {
                            mediaPromises.push((async () => item.reelItem.thumbnailUrl = await prepareMediaUrl(item.reelItem.thumbnailUrl, options))());
                            mediaPromises.push((async () => item.reelItem.profileIconUrl = await prepareMediaUrl(item.reelItem.profileIconUrl, options))());
                        }
                    }
                }
            }

            await Promise.all(mediaPromises);

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
                    case 4:
                        primitive = {
                            title: sm.tableMetadata.title,
                            rows: sm.tableMetadata.rows.map(r => ({
                                cells: r.items.map(cell => ({ text: String(cell) })),
                                style: r.isHeading ? "BOLD" : "NORMAL"
                            })),
                            __typename: "GenAITableUXPrimitive"
                        };
                        break;
                    case 5:
                        primitive = {
                            language: sm.codeMetadata.codeLanguage,
                            code: sm.codeMetadata.codeBlocks.map(b => b.codeContent).join(""),
                            __typename: "GenAICodeUXPrimitive"
                        };
                        break;
                    case 6: primitive = { url: sm.dynamicMetadata.url, thumbnail_url: sm.dynamicMetadata.url, type: sm.dynamicMetadata.type === 2 ? "GIF" : "IMAGE", __typename: "GenAIDynamicUXPrimitive" }; break;
                    case 7:
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
                    case 8:
                        primitive = {
                            text: sm.latexMetadata.text || "",
                            formulas: sm.latexMetadata.expressions.map(e => e.latexExpression),
                            __typename: "GenAILatexUXPrimitive"
                        };
                        break;
                    case 9:
                        sections.push({
                            view_model: {
                                primitives: sm.contentItemsMetadata.itemsMetadata.map(item => ({
                                    reels_url: item.reelItem.videoUrl,
                                    thumbnail_url: item.reelItem.thumbnailUrl,
                                    creator: item.reelItem.title,
                                    avatar_url: item.reelItem.profileIconUrl,
                                    reels_title: item.reelItem.description || "Deskripsi video...",
                                    likes_count: 0,
                                    shares_count: 0,
                                    view_count: 0,
                                    reel_source: "IG",
                                    is_verified: false,
                                    __typename: "GenAIReelPrimitive"
                                })),
                                __typename: "GenAIHScrollLayoutViewModel"
                            }
                        });
                        continue;
                    default:
                        continue;
                }
                sections.push({ view_model: { primitive, __typename: "GenAISingleLayoutViewModel" } });
            }

            if (options.botMetadata?.progressIndicatorMetadata) { sections.unshift({ view_model: { primitive: { status: "GENERATING", display_text: options.botMetadata.progressIndicatorMetadata.progressDescription, __typename: "GenAIProgressPrimitive" }, __typename: "GenAISingleLayoutViewModel" } }); }

            const unifiedResponseData = { response_id: generateMessageID(), sections };

            const content = {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { pluginMetadata: {}, richResponseSourcesMetadata: options.sources ? { sources: options.sources } : undefined, ...options.botMetadata } },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1,
                            submessages,
                            unifiedResponse: { data: JSON.stringify(unifiedResponseData) },
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

        aiTable: (jid, title, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            
            let realTitle = "Table";
            let rows = [];
            
            if (Array.isArray(title)) {
                if (args.length > 0) {
                    rows = [title, ...args];
                } else {
                    rows = [title];
                }
            } else {
                realTitle = title || "Table";
                if (args.length === 1 && Array.isArray(args[0]) && Array.isArray(args[0][0])) {
                    rows = args[0];
                } else if (args.length === 1 && Array.isArray(args[0])) {
                    rows = args[0];
                } else {
                    rows = args;
                }
            }

            const formattedRows = rows.map((r, idx) => {
                const items = Array.isArray(r) ? r : (r.cells || r.items || [r]);
                const isHeading = r.isHeading !== undefined ? r.isHeading : (idx === 0);
                return { items, isHeading };
            });
            
            let maxLens = [];
            formattedRows.forEach(row => {
                row.items.forEach((item, idx) => {
                    maxLens[idx] = Math.max(maxLens[idx] || 0, String(item).length);
                });
            });
            
            let tableText = `*${realTitle}*\n\`\`\`\n`;
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
                { messageType: 2, messageText: `*${realTitle}*` },
                { messageType: 4, tableMetadata: { title: realTitle, rows: formattedRows.map(r => ({ items: r.items, isHeading: r.isHeading })) } }
            ], { ...options, fallbackText: tableText.trim() });
        },
        aiCode: (jid, language, code, options = {}) => {
            if (code === undefined || (code && typeof code === 'object' && !Buffer.isBuffer(code) && Object.keys(options).length === 0)) {
                const actualOptions = (code && typeof code === 'object') ? code : options;
                code = language;
                language = "javascript";
                options = actualOptions;
            }
            const fallbackText = `\`\`\`\n${code}\n\`\`\``;
            return conn.msg.aiRichMessage(jid, [
                { messageType: 2, messageText: `*Code (${language}):*` },
                { messageType: 5, codeMetadata: { codeLanguage: language, codeBlocks: [{ highlightType: 0, codeContent: code }] } }
            ], { ...options, fallbackText });
        },
        aiGridImage: (jid, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let imageUrls = [];
            let gridImageUrl = null;
            if (args.length === 1 && Array.isArray(args[0])) {
                imageUrls = args[0];
            } else if (args.length === 2 && Array.isArray(args[0])) {
                imageUrls = args[0];
                gridImageUrl = args[1];
            } else {
                imageUrls = args.filter(x => typeof x === 'string');
            }
            const gridUrlObj = typeof gridImageUrl === 'string' ? { imagePreviewUrl: gridImageUrl, imageHighResUrl: gridImageUrl } : (gridImageUrl || { imagePreviewUrl: imageUrls[0], imageHighResUrl: imageUrls[0] });
            const formattedUrls = imageUrls.map(img => typeof img === 'string' ? { imagePreviewUrl: img, imageHighResUrl: img } : img);
            const fallbackText = `🖼️ *Grid Images:*\n` + formattedUrls.map((img, idx) => `- Image #${idx + 1}: ${img.imageHighResUrl || img.imagePreviewUrl}`).join("\n");
            return conn.msg.aiRichMessage(jid, [{
                messageType: 1,
                gridImageMetadata: {
                    gridImageUrl: gridUrlObj,
                    imageUrls: formattedUrls
                }
            }], { ...options, fallbackText });
        },
        aiInlineImage: (jid, imageUrl, text = "", alignment = 0, tapLink = "", options = {}) => {
            const imgUrlObj = typeof imageUrl === 'string' ? { imagePreviewUrl: imageUrl, imageHighResUrl: imageUrl } : (imageUrl || {});
            const fallbackText = `🖼️ *Image:*\n${text ? `${text}\n` : ""}Link: ${imgUrlObj.imageHighResUrl || imgUrlObj.imagePreviewUrl || ""}`;
            return conn.msg.aiRichMessage(jid, [{
                messageType: 3,
                imageMetadata: {
                    imageUrl: imgUrlObj,
                    imageText: text,
                    alignment: alignment,
                    tapLinkUrl: tapLink
                }
            }], { ...options, fallbackText });
        },
        aiDynamic: (jid, url, isGif = false, loopCount = 0, options = {}) => {
            const fallbackText = `🖼️ *Dynamic Media (${isGif ? "GIF" : "IMAGE"}):*\nLink: ${url}`;
            return conn.msg.aiRichMessage(jid, [{ messageType: 6, dynamicMetadata: { type: isGif ? 2 : 1, url: url, loopCount: loopCount } }], { ...options, fallbackText });
        },
        aiLatex: (jid, text, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let expressions = [];
            if (args.length === 1 && Array.isArray(args[0])) {
                expressions = args[0];
            } else {
                expressions = args;
            }
            const submessages = [];
            const headerText = text || "*Latex Formula:*";
            submessages.push({ messageType: 2, messageText: headerText });
            submessages.push({
                messageType: 8,
                latexMetadata: {
                    expressions: expressions.map(e => ({
                        latexExpression: typeof e === 'string' ? e : e.formula,
                        url: e.url || ""
                    }))
                }
            });
            const fallbackText = `${headerText}\n\n*Formulas:*\n` + expressions.map(e => {
                const expr = typeof e === 'string' ? e : e.formula || "";
                return `$$ ${expr} $$`;
            }).join("\n");
            return conn.msg.aiRichMessage(jid, submessages, { ...options, fallbackText });
        },
        aiMap: (jid, lat, lng, annotations = [], options = {}) => {
            const mappedAnnotations = annotations.map((a, idx) => ({
                annotationNumber: a.annotationNumber || (idx + 1),
                latitude: a.latitude || lat,
                longitude: a.longitude || lng,
                title: a.title || "",
                body: a.body || ""
            }));
            const headerText = annotations[0] ? `*${annotations[0].title || "Map Location"}*` : "*Map Location*";
            const fallbackText = annotations[0] ? `*${annotations[0].title}*\n${annotations[0].body}\nhttps://maps.google.com/?q=${lat},${lng}` : `https://maps.google.com/?q=${lat},${lng}`;
            return conn.msg.aiRichMessage(jid, [
                { messageType: 2, messageText: headerText },
                {
                    messageType: 7,
                    mapMetadata: {
                        centerLatitude: lat,
                        centerLongitude: lng,
                        annotations: mappedAnnotations
                    }
                }
            ], { ...options, fallbackText });
        },
        aiThinking: async (jid, description, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let steps = [];
            if (args.length === 1 && Array.isArray(args[0])) {
                steps = args[0];
            } else {
                steps = args;
            }
            const mappedSteps = steps.map((s, idx) => {
                if (typeof s === 'string') {
                    const status = idx === steps.length - 1 ? 2 : 3;
                    return { statusTitle: s, statusBody: "", status };
                }
                return {
                    statusTitle: s.title || s.statusTitle || "",
                    statusBody: s.body || s.statusBody || "",
                    status: s.status || 2
                };
            });
            const fallbackText = `🧠 *[ THINKING ]*\n_${description}_\n\n` + mappedSteps.map(s => {
                const icon = s.status === 1 ? "✅" : s.status === 2 ? "⏳" : "❌";
                return `${icon} *${s.statusTitle}*${s.statusBody ? `\n   ${s.statusBody}` : ""}`;
            }).join("\n");
            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: description }], { ...options, fallbackText, botMetadata: { progressIndicatorMetadata: { progressDescription: description, stepsMetadata: mappedSteps } } });
        },
        aiModel: async (jid, text, modelType = 1, modelName = "Llama 3", options = {}) => {
            const fallbackText = `🤖 *[ MODEL: ${modelName} ]*\n${text}`;
            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], { ...options, fallbackText, botMetadata: { modelMetadata: { modelType: modelType, modelNameOverride: modelName } } });
        },
        aiPrompts: async (jid, text, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let prompts = [];
            if (args.length === 1 && Array.isArray(args[0])) {
                prompts = args[0];
            } else {
                prompts = args;
            }
            const suggestions = prompts.map(p => ({ prompt: typeof p === 'string' ? p : p.prompt, promptId: p.promptId || "prompt_" + Date.now() + Math.floor(Math.random() * 1000) }));
            const fallbackText = `${text}\n\n*Suggestions:*\n` + suggestions.map((s, idx) => `${idx + 1}. ${s.prompt}`).join("\n");
            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: text }], { ...options, fallbackText, botMetadata: { suggestedPromptMetadata: { suggestedPrompts: suggestions.map(s => s.prompt), promptSuggestions: { suggestions: suggestions } } } });
        },
        aiReels: (jid, mainText, ...args) => {
            let options = {};
            if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
                options = args.pop();
            }
            let reels = [];
            if (args.length === 1 && Array.isArray(args[0])) {
                reels = args[0];
            } else {
                reels = args;
            }
            const defaultThumb = "https://files.catbox.moe/gw41eq.png";
            const reelItems = reels.map(item => {
                const videoUrl = typeof item === 'string' ? item : item.videoUrl;
                const title = item.title || "Video Reels";
                const description = item.description || "";
                const thumbnailUrl = item.thumbnailUrl || defaultThumb;
                const profileIconUrl = item.profileIconUrl || defaultThumb;
                return {
                    reelItem: { title, profileIconUrl, thumbnailUrl, videoUrl, description }
                };
            });
            const sources = reels.map((item, idx) => {
                const videoUrl = typeof item === 'string' ? item : item.videoUrl;
                return {
                    provider: "UNKNOWN",
                    thumbnailCDNURL: "",
                    sourceProviderURL: videoUrl,
                    sourceQuery: "",
                    faviconCDNURL: "",
                    citationNumber: idx + 1,
                    sourceTitle: ""
                };
            });
            const fallbackText = `${mainText}\n\n` + reelItems.map((r, idx) => `🎥 *Reel #${idx + 1}: ${r.reelItem.title}*\n${r.reelItem.description}\nLink: ${r.reelItem.videoUrl}`).join("\n\n");
            return conn.msg.aiRichMessage(jid, [{ messageType: 2, messageText: mainText }, { messageType: 9, contentItemsMetadata: { contentType: 1, itemsMetadata: reelItems } }], { ...options, fallbackText, sources });
        },
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
        pinMessage: async (jid, key, durationInSeconds = 86400, options = {}) => {
            const content = {
                pinInChatMessage: {
                    key,
                    type: 1, // PIN_FOR_ALL
                    senderTimestampMs: Date.now()
                },
                messageContextInfo: {
                    messageAddOnDurationInSecs: durationInSeconds
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "PIN_MSG" }, message: content };
        },
        unpinMessage: async (jid, key, options = {}) => {
            const content = {
                pinInChatMessage: {
                    key,
                    type: 2, // UNPIN_FOR_ALL
                    senderTimestampMs: Date.now()
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "UNPIN_MSG" }, message: content };
        },
        keepMessage: async (jid, key, keepType = 1, options = {}) => {
            const content = {
                keepInChatMessage: {
                    key,
                    keepType,
                    timestampMs: Date.now()
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "KEEP_MSG" }, message: content };
        },
        sendStatusQuestion: (text, options) => conn.sendMessage('status@broadcast', { statusQuestionAnswerMessage: { text } }, options),
        sendCallLog: (jid, call, options) => conn.sendMessage(jid, { callLogMesssage: call }, options),
        sendHistoryNotice: (jid, notice, options) => conn.sendMessage(jid, { messageHistoryNotice: notice }, options),
        sendChatBundle: (jid, bundle, options) => conn.sendMessage(jid, { messageHistoryBundle: { ...bundle, mimetype: 'application/octet-stream', mediaKeyTimestamp: Math.floor(Date.now() / 1000) } }, options),
        sendEncReaction: (jid, enc, options) => conn.sendMessage(jid, { encReactionMessage: enc }, options),
        syncStickers: (hashes, source = "manual", options) => conn.sendMessage(conn.user.id, { stickerSyncRmrMessage: { filehash: hashes, rmrSource: source, requestTimestamp: Math.floor(Date.now() / 1000) } }, options),
        requestResend: (key, options) => conn.sendMessage(key.remoteJid, { protocolMessage: { key: key, type: 5, placeholderMessageResendRequest: [{ messageKey: key }] } }, options),
        sendPaymentInvite: (jid, type = 1, options) => conn.sendMessage(jid, { paymentInviteMessage: { serviceType: type, expiryTimestamp: Math.floor(Date.now() / 1000) + 86400 } }, options),
        sendPollV5: (jid, poll, options) => conn.sendMessage(jid, { pollCreationMessageV5: poll }, options),
        sendVideoNote: async (jid, pathOrBuffer, options = {}) => {
            const { prepareWAMessageMedia } = require("./messages");
            const media = await prepareWAMessageMedia({ video: pathOrBuffer }, {
                upload: conn.waUploadToServer,
                mediaType: 'video',
                ...options
            });
            if (!media.videoMessage) throw new Error("Failed to prepare video message");
            const ptvMessage = {
                ...media.videoMessage,
                gifPlayback: false
            };
            await conn.relayMessage(jid, { ptvMessage }, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "PTV_MSG" }, message: { ptvMessage } };
        },
        sendImagePoll: async (jid, name, optionsArray, options = {}) => {
            const formattedOptions = [];
            for (const opt of optionsArray) {
                let imgUrl = null;
                if (opt.image) {
                    imgUrl = await prepareMediaUrl(opt.image, options);
                }
                formattedOptions.push({
                    optionName: opt.text,
                    optionImage: imgUrl ? { imagePreviewUrl: imgUrl, imageHighResUrl: imgUrl } : null
                });
            }
            const content = {
                pollCreationOptionImageMessage: {
                    name,
                    options: formattedOptions,
                    selectableOptionsCount: options.selectableCount || 1
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "POLL_IMG" }, message: content };
        },
        editScheduledCall: async (jid, callKey, title, timestampMs, editType = 2, callType = 1, options = {}) => {
            const content = {
                scheduledCallEditMessage: {
                    key: callKey,
                    editMessage: {
                        callType,
                        title,
                        scheduledTimestampMs: timestampMs
                    },
                    editType
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "CALL_EDIT" }, message: content };
        },
        sendAIReminder: async (jid, text, timestampMs, frequency = 1, options = {}) => {
            const content = {
                extendedTextMessage: { text: `⏰ *AI Reminder:* "${text}"` }
            };
            const botMetadata = {
                reminderMetadata: {
                    action: 2, // CREATE
                    name: text,
                    nextTriggerTimestamp: Math.floor(timestampMs / 1000),
                    frequency
                }
            };
            const fullContent = {
                ...content,
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata
                }
            };
            await conn.relayMessage(jid, fullContent, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "AI_REMIND" }, message: fullContent };
        },
        sendLottieSticker: async (jid, pathOrBuffer, options = {}) => {
            const { prepareWAMessageMedia } = require("./messages");
            const media = await prepareWAMessageMedia({ sticker: pathOrBuffer }, {
                upload: conn.waUploadToServer,
                mediaType: 'sticker',
                ...options
            });
            if (!media.stickerMessage) throw new Error("Failed to prepare sticker message");
            const content = {
                lottieStickerMessage: {
                    ...media.stickerMessage
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "LOTTIE_STICKER" }, message: content };
        },
        sendGroupEvent: async (jid, event, options = {}) => {
            const content = {
                eventMessage: {
                    name: event.name || "",
                    description: event.description || "",
                    startTime: event.startTime,
                    endTime: event.endTime,
                    location: event.location, // LocationMessage structure
                    joinLink: event.joinLink || "",
                    isCanceled: event.isCanceled || false,
                    isScheduleCall: event.isScheduleCall || false,
                    hasReminder: event.hasReminder || false,
                    reminderOffsetSec: event.reminderOffsetSec || 0,
                    extraGuestsAllowed: event.extraGuestsAllowed || false,
                    contextInfo: options.contextInfo
                }
            };
            await conn.relayMessage(jid, content, {
                messageId: options.messageId || generateMessageID(),
                ...options
            });
            return { key: { remoteJid: jid, fromMe: true, id: options.messageId || "EVENT_MSG" }, message: content };
        },
        sendAlbum: async (jid, medias, options = {}) => {
            const imageCount = medias.filter(m => m.image).length;
            const videoCount = medias.filter(m => m.video).length;
            const albumMessageId = options.messageId || generateMessageID();
            const albumKey = { remoteJid: jid, fromMe: true, id: albumMessageId };
            
            const albumPlaceholder = {
                albumMessage: {
                    expectedImageCount: imageCount,
                    expectedVideoCount: videoCount,
                    contextInfo: options.contextInfo
                }
            };
            await conn.relayMessage(jid, albumPlaceholder, { messageId: albumMessageId });
            
            let index = 0;
            const results = [];
            for (const media of medias) {
                const mediaId = generateMessageID();
                const type = media.image ? 'image' : 'video';
                const { prepareWAMessageMedia } = require("./messages");
                const upload = conn.waUploadToServer;
                const mediaObject = media.image ? { image: media.image } : { video: media.video };
                const prepared = await prepareWAMessageMedia(mediaObject, {
                    upload,
                    mediaType: type,
                    ...options
                });
                
                const key = type === 'image' ? 'imageMessage' : 'videoMessage';
                if (!prepared[key]) throw new Error(`Failed to prepare ${type} message for album`);
                if (media.caption) prepared[key].caption = media.caption;
                
                const content = {
                    [key]: prepared[key],
                    messageContextInfo: {
                        messageAssociation: {
                            associationType: 1, // MEDIA_ALBUM
                            parentMessageKey: albumKey,
                            messageIndex: index
                        }
                    }
                };
                await conn.relayMessage(jid, content, {
                    messageId: mediaId,
                    ...options
                });
                results.push({ key: { remoteJid: jid, fromMe: true, id: mediaId }, message: content });
                index++;
            }
            return { albumKey, medias: results };
        }
    };

    // --- 1. LIGHTWEIGHT & RESPONSIVE: Auto Optimizer ---
    conn.autoOptimize = () => { if (conn.store) { conn.store.chats.clear(); conn.store.messages = {}; } if (global.gc) global.gc(); };

    // --- 6. EASY TO USE: smsg helper ---
    conn.smsg = (m) => {
        if (!m.message) return m;
        Object.assign(m, MessageHelpers);
        if (m.key) { m.id = m.key?.id; m.isMe = m.key.fromMe; m.chat = m.key.remoteJid; m.isGroup = m.chat.endsWith("@g.us"); m.sender = jidNormalizedUser(m.isMe ? (conn.user?.id || conn.user?.jid) : (m.key.participant || m.chat)); }
        m.text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || m.message.templateButtonReplyMessage?.selectedId || m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || "";
        const prefix = /^[./!#]/.test(m.text) ? m.text.charAt(0) : ""; m.prefix = prefix; m.isCommand = !!prefix;
        const body = m.isCommand ? m.text.slice(1).trim() : m.text.trim();
        const args = body.split(/\s+/); m.command = args.shift()?.toLowerCase(); m.args = args; m.query = args.join(" ");
        
        Object.defineProperty(m, '_conn', {
            value: conn,
            enumerable: false,
            writable: true,
            configurable: true
        });
        return m;
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
    conn.sendVideoNote = conn.msg.sendVideoNote; conn.sendImagePoll = conn.msg.sendImagePoll; conn.editScheduledCall = conn.msg.editScheduledCall; conn.sendAIReminder = conn.msg.sendAIReminder; conn.sendLottieSticker = conn.msg.sendLottieSticker;
    conn.sendGroupEvent = conn.msg.sendGroupEvent; conn.sendAlbum = conn.msg.sendAlbum;
    conn.unpinMessage = conn.msg.unpinMessage;

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
        inviteFollower: (jid, name, thumb, caption = "") => conn.sendMessage(jid, { newsletterFollowerInviteMessageV2: { newsletterJid: jid, newsletterName: name, jpegThumbnail: thumb, caption: caption } })
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
