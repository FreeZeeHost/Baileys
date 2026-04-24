"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Fixed with True Synchronized Connection Lock
 */
const makeFreeZeeSocket = async (config = {}) => {
    // 1. MUST AWAIT MongoDB before doing ANYTHING else
    console.log(">>>> [1/4] Menghubungkan ke Cloud Storage...")
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    console.log(">>>> [2/4] Cloud Storage Terhubung! Menyiapkan koneksi WhatsApp...")

    // 2. Setup Config with the ACTUAL state from MongoDB
    const finalConfig = {
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2],
        browser: require("./generics").Browsers.ubuntu('Chrome'),
        // Ensure registration doesn't fire until we are ready
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true
    }

    // 3. Create Socket ONLY after we have real credentials
    let sock = (0, socket_1.default)(finalConfig)

    // 4. Handle auto-save
    sock.ev.on('creds.update', saveCreds)

    // 5. Apply Patches
    sock = (0, socket_patcher_1.patchSocket)(sock)

    console.log(">>>> [4/4] Bot Siap melayani perintah!")
    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
