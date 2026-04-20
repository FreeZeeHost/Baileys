"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.withStealthMode = void 0

const generics_1 = require("./generics")

/**
 * Adds Stealth Mode (Humanizer) to the socket.
 * Automatically handles typing states and randomized delays.
 */
const withStealthMode = (sock, options = {}) => {
    const {
        typingDelayPerChar = 40, // ms per character
        maxTypingDelay = 3000,   // max wait 3s
        minTypingDelay = 500,    // min wait 0.5s
        autoPresence = true      // auto set online when sending
    } = options

    const originalSendMessage = sock.sendMessage.bind(sock)

    sock.sendMessage = async (jid, content, options = {}) => {
        // Skip stealth for reaction or if explicitly disabled
        if (content.reaction || options.stealth === false) {
            return originalSendMessage(jid, content, options)
        }

        // 1. Determine delay based on content length
        let delayMs = minTypingDelay
        if (content.text) {
            delayMs = Math.min(content.text.length * typingDelayPerChar, maxTypingDelay)
        } else if (content.image || content.video || content.document) {
            delayMs = 2000 // Fixed delay for media
        }

        // Add some randomness (jitter)
        delayMs += Math.floor(Math.random() * 500)

        try {
            // 2. Send Presence Update
            const presenceType = (content.audio || content.video) ? 'recording' : 'composing'
            
            if (autoPresence) {
                await sock.sendPresenceUpdate('available')
            }
            
            await sock.sendPresenceUpdate(presenceType, jid)

            // 3. Wait for the simulated human action
            await (0, generics_1.delay)(delayMs)

            // 4. Stop presence (optional, usually sending the message stops it)
            await sock.sendPresenceUpdate('paused', jid)

            // 5. Finally send the message
            return await originalSendMessage(jid, content, options)
        } catch (error) {
            return await originalSendMessage(jid, content, options)
        }
    }

    return sock
}

exports.withStealthMode = withStealthMode
