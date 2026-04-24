"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Fixed for Mirroring original Baileys return object
 */
const makeFreeZeeSocket = async (config = {}) => {
    console.log(">>>> [1/4] Mencoba koneksi ke MongoDB...")
    
    // 1. Get Auth State from MongoDB
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    console.log(">>>> [2/4] Database Terhubung. Menyiapkan Socket...")

    // 2. Setup Config
    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3000, 1017531287]
    }

    // 3. Create Socket
    let sock = (0, socket_1.default)(finalConfig)

    // 4. Apply Patches
    console.log(">>>> [3/4] Melakukan Patching Fitur...")
    sock = (0, socket_patcher_1.patchSocket)(sock)

    // 5. Explicitly expose authState (Fix for Bot Script compatibility)
    sock.authState = state
    sock.saveCreds = saveCreds

    // 6. Auto Save
    sock.ev.on('creds.update', async () => {
        await saveCreds()
    })

    console.log(">>>> [4/4] Bot Siap! Mengembalikan objek socket ke script utama.")
    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
