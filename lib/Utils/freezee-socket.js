"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Fixed for SYNCHRONOUS return to support non-awaited calls
 */
const makeFreeZeeSocket = (config = {}) => {
    // 1. Ambil Auth State (Internal handle promise)
    const authPromise = (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    
    // 2. Siapkan state bayangan agar bot tidak crash saat baru nyala
    const state = config.auth || {
        creds: require("./generics").initAuthCreds(),
        keys: { get: async () => ({}), set: async () => {} }
    }

    // 3. Gabungkan config
    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2],
        browser: require("./generics").Browsers.ubuntu('Chrome'),
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true
    }

    // 4. Buat Socket INSTAN (Bukan Async)
    let sock = (0, socket_1.default)(finalConfig)
    
    // 5. Tempelkan authState agar bot Anda bisa baca sock.authState.creds
    sock.authState = state

    // 6. Masukkan data asli dari MongoDB saat sudah siap di balik layar
    authPromise.then(({ state: mongoState, saveCreds }) => {
        Object.assign(state.creds, mongoState.creds)
        state.keys = mongoState.keys
        sock.authState = state // Re-confirm
        sock.ev.on('creds.update', saveCreds)
        console.log(">>>> [3/4] Sesi Cloud berhasil disinkronkan!")
    }).catch(err => console.error("!!!! GAGAL SYNC CLOUD:", err.message))

    // 7. Apply Patches
    sock = (0, socket_patcher_1.patchSocket)(sock)

    return sock // MENGEMBALIKAN OBJEK LANGSUNG, BUKAN PROMISE!
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
