"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Ultra-Clean Session Management
 */
const makeFreeZeeSocket = (config = {}) => {
    // 1. Create a stable state reference
    const state = config.auth || {
        creds: require("./generics").initAuthCreds(),
        keys: {
            get: async () => ({}),
            set: async () => {}
        }
    }

    // 2. Setup Config
    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3000, 1017531287],
        browser: require("./generics").Browsers.ubuntu('Chrome')
    }

    // 3. Create Socket
    let sock = (0, socket_1.default)(finalConfig)

    // 4. Async background load from MongoDB with Sanity Check
    const authPromise = (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    authPromise.then(({ state: mongoState, saveCreds }) => {
        // SANITY CHECK: Jika data di DB belum 'registered', abaikan saja agar bisa pairing ulang
        if (mongoState.creds && mongoState.creds.registered) {
            Object.assign(state.creds, mongoState.creds)
            state.keys = mongoState.keys
            console.log(">>>> [3/4] Sesi resmi berhasil dimuat dari Cloud!")
        } else {
            console.log(">>>> [3/4] Database kosong/belum login. Siap untuk pairing baru.")
        }
        
        sock.ev.on('creds.update', saveCreds)
    })

    // 5. Self-Healing
    sock.ev.on('connection.update', (update) => {
        const { lastDisconnect } = update
        const statusCode = lastDisconnect?.error?.output?.statusCode
        if (statusCode === 401) {
            delete state.creds.me
            state.creds.registered = false
        }
    })

    // 6. Apply Patches
    sock = (0, socket_patcher_1.patchSocket)(sock)

    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
