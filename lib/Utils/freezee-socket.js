"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Fixed for Perfect Sync Compatibility with any bot script
 */
const makeFreeZeeSocket = (config = {}) => {
    console.log(">>>> [1/4] Mempersiapkan Inisialisasi Sync...")
    
    // 1. Get Auth State - Now returns a Promise, but we handle it internally
    const authPromise = (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    
    // 2. We need a placeholder state to start the socket immediately
    // If the bot script didn't await, it expects something NOW.
    const state = config.auth || {
        creds: require("./generics").initAuthCreds(),
        keys: { get: () => ({}), set: () => {} }
    }

    // 3. Create Socket
    let sock = (0, socket_1.default)({
        ...config,
        auth: state,
        version: config.version || [2, 3000, 1017531287]
    })

    // 4. Once MongoDB is ready, inject it into the socket
    authPromise.then(({ state: mongoState, saveCreds }) => {
        sock.authState = mongoState
        sock.ev.on('creds.update', saveCreds)
        console.log(">>>> [3/4] Socket terhubung ke Cloud Storage!")
    })

    // 5. Apply Patches
    sock = (0, socket_patcher_1.patchSocket)(sock)

    console.log(">>>> [4/4] Mengembalikan objek socket secara instan ke bot.")
    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
