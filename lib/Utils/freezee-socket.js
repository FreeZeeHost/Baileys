"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Fixed for 401 Rejection & Sync Persistence
 */
const makeFreeZeeSocket = (config = {}) => {
    // 1. Create a stable state reference
    const state = config.auth || {
        creds: require("./generics").initAuthCreds(),
        keys: {
            get: async (type, ids) => {
                const data = {}
                return data
            },
            set: async () => {}
        }
    }

    // 2. Setup Config with the stable reference
    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3000, 1017531287],
        browser: require("./generics").Browsers.ubuntu('Chrome')
    }

    // 3. Create Socket
    let sock = (0, socket_1.default)(finalConfig)

    // 4. Async background load from MongoDB
    const authPromise = (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    authPromise.then(({ state: mongoState, saveCreds }) => {
        // Aggressively merge MongoDB data into the existing reference
        Object.assign(state.creds, mongoState.creds)
        state.keys = mongoState.keys
        
        sock.ev.on('creds.update', saveCreds)
        console.log(">>>> [3/4] Sesi dari Cloud Storage berhasil dimuat!")
    })

    // 5. Self-Healing for 401 Rejection
    sock.ev.on('connection.update', (update) => {
        const { lastDisconnect } = update
        const statusCode = lastDisconnect?.error?.output?.statusCode
        
        if (statusCode === 401) {
            console.log("!!!! [REPAIR] Sesi terdeteksi basi (401). Membersihkan sesi...")
            // Clear identity but keep the socket alive for new pairing
            delete state.creds.me
            state.creds.registered = false
        }
    })

    // 6. Apply Patches
    sock = (0, socket_patcher_1.patchSocket)(sock)

    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
