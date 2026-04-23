"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.makeFreeZeeSocket = void 0

const socket_1 = require("../Socket")
const socket_patcher_1 = require("./socket-patcher")
const use_mongo_file_auth_state_1 = require("./use-mongo-file-auth-state")
const generics_1 = require("./generics")

/**
 * THE ULTIMATE PLUG-AND-PLAY SOCKET
 * Ultra-Responsive Version
 */
const makeFreeZeeSocket = async (config = {}) => {
    // 1. Get Auth State from MongoDB
    const { state, saveCreds } = await (0, use_mongo_file_auth_state_1.useMongoFileAuthState)()
    
    // 2. Setup Config
    const finalConfig = {
        ...config,
        auth: state,
        printQRInTerminal: config.printQRInTerminal !== undefined ? config.printQRInTerminal : true,
        version: [2, 3100, 2],
        // Default identity
        browser: (0, generics_1.Browsers).ubuntu('Chrome')
    }

    // 3. Create Socket
    let sock = (0, socket_1.default)(finalConfig)

    // 4. Apply Patches (Helpers, etc)
    sock = (0, socket_patcher_1.patchSocket)(sock)

    // 5. Auto Save Creds
    sock.ev.on('creds.update', saveCreds)

    // 6. Return socket immediately
    return sock
}

exports.makeFreeZeeSocket = makeFreeZeeSocket
