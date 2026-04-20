"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.withSmartQueue = void 0

const generics_1 = require("./generics")

/**
 * Adds a Smart Queue to the socket.
 * Automatically queues messages if the connection is down and retries on reconnect.
 */
const withSmartQueue = (sock, logger) => {
    const queue = []
    let isProcessing = false

    const originalSendMessage = sock.sendMessage.bind(sock)

    const processQueue = async () => {
        if (isProcessing || queue.length === 0) return
        
        // Only process if socket is open
        // Note: we check isOpen from the websocket client if possible
        if (!sock.ws?.isOpen) return

        isProcessing = true
        logger?.info({ count: queue.length }, 'Processing smart message queue')

        while (queue.length > 0) {
            const item = queue[0]
            try {
                await originalSendMessage(item.jid, item.content, item.options)
                queue.shift() // Remove successfully sent item
                await (0, generics_1.delay)(500) // Small delay between batch sends
            } catch (error) {
                logger?.error({ error, jid: item.jid }, 'Failed to send queued message, will retry later')
                break // Stop processing for now
            }
        }

        isProcessing = false
    }

    // Wrap sendMessage to catch failures
    sock.sendMessage = async (jid, content, options = {}) => {
        try {
            if (!sock.ws?.isOpen && options.enqueue !== false) {
                throw new Error('Connection Closed')
            }
            return await originalSendMessage(jid, content, options)
        } catch (error) {
            if (options.enqueue !== false) {
                logger?.warn({ jid }, 'Message failed to send, added to smart queue')
                queue.push({ jid, content, options })
                return { status: 'queued' }
            }
            throw error
        }
    }

    // Auto-process queue when connection is back online
    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') {
            processQueue()
        }
    })

    return sock
}

exports.withSmartQueue = withSmartQueue
