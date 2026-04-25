"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

const freezee = require("./Utils/freezee-socket")
const patcher = require("./Utils/socket-patcher")

// PRIMARY EXPORTS WITH ALIASES (Banyak Nama)
exports.default = freezee.makeFreeZeeSocket
exports.makeFreeZeeSocket = freezee.makeFreeZeeSocket
exports.makeWASocket = freezee.makeFreeZeeSocket
exports.makeConn = freezee.makeFreeZeeSocket
exports.makeClient = freezee.makeFreeZeeSocket
exports.makeWA = freezee.makeFreeZeeSocket

exports.patchSocket = patcher.patchSocket

// CORE UTILS EXPORTS
const Utils = require("./Utils")
const WABinary = require("./WABinary")
Object.assign(exports, Utils, WABinary, require("./Types"), require("./Store"), require("./Defaults"))

// Ensure important named exports for ESM
exports.extractMessageContent = Utils.extractMessageContent
exports.getContentType = Utils.getContentType
exports.jidDecode = WABinary.jidDecode
exports.useMultiFileAuthState = require("./Utils/use-mongo-file-auth-state").useMongoFileAuthState
