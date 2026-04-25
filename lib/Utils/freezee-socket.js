"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * God-Mode Synchronous Wrapper
 */
const makeFreeZeeSocket = (config = {}) => {
    // 1. Placeholder state to prevent crash
    const state = config.auth || {
        creds: require("./generics").initAuthCreds(),
        keys: { get: async () => ({}), set: async () => {} }
    }

    // 2. Setup Config
    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2],
        browser: require("./generics").Browsers.ubuntu('Chrome'),
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true
    }

    // 3. Create Socket (Instantly returns an object)
    let sock = (0, socket_1.default)(finalConfig)
    sock.authState = state

    // 4. Signal: Let other functions wait for MongoDB
    let dbSynced = false
    const dbPromise = (0, use_mongo_file_auth_state_1.useMongoFileAuthState)().then(({ state: mongoState, saveCreds }) => {
        Object.assign(state.creds, mongoState.creds)
        state.keys = mongoState.keys
        sock.ev.on('creds.update', saveCreds)
        dbSynced = true
        console.log(">>>> [FREEZEE] Cloud Storage Synced!")
        return true
    })

    // 5. Patch requestPairingCode to WAIT for MongoDB
    const originalRPC = sock.requestPairingCode.bind(sock)
    sock.requestPairingCode = async (phoneNumber) => {
        if (!dbSynced) {
            console.log(">>>> [FREEZEE] Menunggu Database sebelum pairing...")
            await dbPromise
        }
        // Force cleanup identity for new pairing if not registered
        if (!sock.authState.creds.registered) {
            delete sock.authState.creds.me
        }
        return originalRPC(phoneNumber)
    }

    // 6. Apply Other Patches
    sock = (0, socket_patcher_1.patchSocket)(sock)

    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
