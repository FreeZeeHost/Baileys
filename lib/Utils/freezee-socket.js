"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Fixed for SYNCHRONOUS return & authState Mapping
 */
const makeFreeZeeSocket = (config = {}) => {
    // 1. Create a stable state reference immediately
    const state = config.auth || {
        creds: require("./generics").initAuthCreds(),
        keys: { 
            get: async (type, ids) => { return {} },
            set: async () => {}
        }
    }

    // 2. Setup Config
    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2],
        browser: require("./generics").Browsers.ubuntu('Chrome'),
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true
    }

    // 3. Create Socket (Instantly)
    let sock = (0, socket_1.default)(finalConfig)
    
    // 4. MAPPING KRUSIAL: Agar bot Anda tidak crash 'undefined reading creds'
    sock.authState = state
    
    // 5. Connect MongoDB in background and sync data
    const authPromise = (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    authPromise.then(({ state: mongoState, saveCreds }) => {
        // Sync real data from MongoDB into our stable reference
        Object.assign(state.creds, mongoState.creds)
        state.keys = mongoState.keys
        
        sock.saveCreds = saveCreds
        sock.ev.on('creds.update', saveCreds)
        console.log(">>>> [3/4] Database Cloud Sinkron!")
    }).catch(err => {
        console.error("!!!! GAGAL KONEKSI MONGODB:", err.message)
    })

    // 6. Apply Patches
    sock = (0, socket_patcher_1.patchSocket)(sock)

    return sock // MENGEMBALIKAN OBJEK LANGSUNG, BUKAN PROMISE
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
