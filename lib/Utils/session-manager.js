"use strict"

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod }
}

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeSessionManager = void 0

const events_1 = require("events")
const boom_1 = require("@hapi/boom")
const Types_1 = require("../Types")
const generics_1 = require("./generics")

/**
 * A robust session manager for Baileys that handles multi-sessions 
 * and implements exponential backoff for reconnections.
 */
const makeSessionManager = ({
    makeWASocket,
    logger,
    reconnectIntervals = [2000, 5000, 10000, 30000, 60000],
    maxReconnectAttempts = 10
}) => {
    const sessions = new Map()
    const retryCount = new Map()
    const ev = new events_1.EventEmitter()

    const createSession = async (id, config) => {
        if (sessions.has(id)) {
            logger?.warn(`Session ${id} already exists, closing existing one...`)
            const oldSocket = sessions.get(id)
            oldSocket.ev.removeAllListeners('connection.update')
            await oldSocket.end()
        }

        const socket = makeWASocket(config)
        sessions.set(id, socket)

        // Proxy all events to the session manager emitter
        const originalEmit = socket.ev.emit
        socket.ev.emit = (event, data) => {
            ev.emit('all', { id, event, data })
            ev.emit(`${id}.${event}`, data)
            return originalEmit.call(socket.ev, event, data)
        }

        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update

            if (connection === 'open') {
                retryCount.set(id, 0) // Reset retry count on success
                logger?.info(`Session ${id} connected successfully`)
            }

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error)?.output?.statusCode || lastDisconnect?.error?.data?.status
                const shouldReconnect = statusCode !== Types_1.DisconnectReason.loggedOut && statusCode !== Types_1.DisconnectReason.forbidden
                
                if (shouldReconnect) {
                    let count = retryCount.get(id) || 0
                    if (count < maxReconnectAttempts) {
                        const delayMs = reconnectIntervals[Math.min(count, reconnectIntervals.length - 1)]
                        logger?.info(`Session ${id} closed due to ${lastDisconnect?.error}, reconnecting in ${delayMs}ms (Attempt ${count + 1})`)
                        
                        retryCount.set(id, count + 1)
                        await (0, generics_1.delay)(delayMs)
                        
                        // Re-create session with same config
                        createSession(id, config)
                    } else {
                        logger?.error(`Session ${id} failed to reconnect after ${maxReconnectAttempts} attempts`)
                        sessions.delete(id)
                    }
                } else {
                    logger?.info(`Session ${id} logged out, not reconnecting`)
                    sessions.delete(id)
                }
            }
        })

        return socket
    }

    return {
        ev,
        createSession,
        getSession: (id) => sessions.get(id),
        deleteSession: async (id) => {
            const socket = sessions.get(id)
            if (socket) {
                await socket.logout()
                sessions.delete(id)
                retryCount.delete(id)
            }
        },
        listSessions: () => Array.from(sessions.keys())
    }
}

exports.makeSessionManager = makeSessionManager
