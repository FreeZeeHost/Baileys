"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.withMiddleware = void 0

/**
 * Adds an Express-like middleware system to Baileys for processing messages
 * at high speed before they are emitted to the main application.
 */
const withMiddleware = (sock) => {
    const middlewares = []

    /**
     * Use a middleware function.
     * @param {Function} fn (message, next) => void
     */
    sock.use = (fn) => {
        middlewares.push(fn)
        return sock
    }

    // Intercept messages.upsert
    const originalOn = sock.ev.on.bind(sock.ev)
    const originalEmit = sock.ev.emit.bind(sock.ev)

    sock.ev.emit = async (event, data) => {
        if (event === 'messages.upsert' && middlewares.length > 0) {
            const { messages, type } = data
            
            // Process messages in parallel for maximum speed (Fast-Response)
            const processedMessages = await Promise.all(messages.map(async (msg) => {
                let currentIdx = 0
                let isDropped = false

                const next = async () => {
                    if (currentIdx < middlewares.length) {
                        const middleware = middlewares[currentIdx++]
                        await middleware(msg, next)
                    }
                }

                // Add helper to drop message
                msg.drop = () => { isDropped = true }

                await next()
                
                return isDropped ? null : msg
            }))

            // Filter out dropped messages
            const finalMessages = processedMessages.filter(m => m !== null)

            if (finalMessages.length > 0) {
                return originalEmit(event, { messages: finalMessages, type })
            }
            return false // Prevent emission if all dropped
        }

        return originalEmit(event, data)
    }

    return sock
}

exports.withMiddleware = withMiddleware
