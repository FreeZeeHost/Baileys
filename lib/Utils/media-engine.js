"use strict"

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod }
}

Object.defineProperty(exports, "__esModule", { value: true })
exports.withMediaEngine = void 0

const LRUCache_1 = require("lru-cache")
const messages_media_1 = require("./messages-media")
const crypto_1 = require("crypto")

/**
 * Adds an Integrated Media Engine to the socket.
 * Provides `downloadMedia` with auto-caching and `sendSticker` naturally.
 */
const withMediaEngine = (sock, options = {}) => {
    // Cache up to 100 media items, items expire after 1 hour by default
    const mediaCache = new LRUCache_1.LRUCache({
        max: options.maxCacheItems || 100,
        ttl: options.cacheTtlMs || 1000 * 60 * 60, 
    })

    /**
     * Downloads media from a message natively with LRU Caching.
     * @param {Object} message The message containing media (e.g. msg.message.imageMessage)
     * @param {String} type The type of media (e.g. 'image', 'video', 'audio', 'document')
     * @returns {Promise<Buffer>} The decrypted media buffer
     */
    sock.downloadMedia = async (message, type) => {
        if (!message) throw new Error('No message provided to downloadMedia')
        
        // Extract the actual media message object if a full WebMessageInfo is passed
        const mediaMessage = message.message ? 
            (message.message.imageMessage || message.message.videoMessage || message.message.audioMessage || message.message.documentMessage || message.message.stickerMessage) : 
            message

        if (!mediaMessage || !mediaMessage.url) {
            throw new Error('Message does not contain valid media')
        }

        // Generate a unique cache key based on the media's fileSha256
        const fileHash = mediaMessage.fileSha256 ? 
            Buffer.from(mediaMessage.fileSha256).toString('hex') : 
            crypto_1.createHash('md5').update(mediaMessage.url).digest('hex')

        const cacheKey = `media_${fileHash}`

        // Check if we already have it in RAM
        if (mediaCache.has(cacheKey)) {
            return mediaCache.get(cacheKey)
        }

        // If not in cache, download it
        const stream = await (0, messages_media_1.downloadContentFromMessage)(mediaMessage, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        // Save to cache for future instant access
        mediaCache.set(cacheKey, buffer)

        return buffer
    }

    /**
     * Simplified sticker sending.
     * Note: This assumes you have the sticker buffer ready. 
     */
    sock.sendSticker = async (jid, bufferOrUrl, options = {}) => {
        let buffer = bufferOrUrl

        // Basic URL fetcher if string is provided
        if (typeof bufferOrUrl === 'string' && bufferOrUrl.startsWith('http')) {
            const axios = require('axios').default
            const res = await axios.get(bufferOrUrl, { responseType: 'arraybuffer' })
            buffer = Buffer.from(res.data)
        }

        return sock.sendMessage(jid, { sticker: buffer, ...options })
    }

    /**
     * Sends a collection of stickers as a pack.
     * @param {String} jid The remote JID
     * @param {Array} stickers Array of Buffers or URLs
     * @param {Object} options Options like packname, author, delay
     */
    sock.sendStickerPack = async (jid, stickers, options = {}) => {
        const { delay: delayMs = 1500, packname, author, quoted, ...rest } = options
        const results = []
        const { delay } = require('./generics')

        for (const stc of stickers) {
            const result = await sock.sendSticker(jid, stc, { packname, author, quoted, ...rest })
            results.push(result)

            if (delayMs > 0) await delay(delayMs)
        }
        return results
    }

    /**
     * Sends an album (collection of media) easily in one function call.
     * @param {String} jid The remote JID to send to
     * @param {Array} medias Array of media objects (image, video, etc.)
     * @param {Object} options Options like quoted, delay, etc.
     */
    sock.sendAlbumMessage = async (jid, medias, options = {}) => {
        const { delay: delayMs = 1000, quoted, ...rest } = options
        const results = []
        
        for (const media of medias) {
            const result = await sock.sendMessage(jid, media, { quoted, ...rest })
            results.push(result)
            
            // Small delay between sends to ensure WA groups them as an album
            if (delayMs > 0) {
                const { delay } = require('./generics')
                await delay(delayMs)
            }
        }
        
        return results
    }

    return sock
}

exports.withMediaEngine = withMediaEngine
