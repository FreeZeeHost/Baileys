"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

const socket_1 = require("./Socket")
const socket_patcher_1 = require("./Utils/socket-patcher")
const freezee_socket_1 = require("./Utils/freezee-socket")
const Utils = require("./Utils")
const Socket = require("./Socket")
const Store = require("./Store")
const Types = require("./Types")
const Defaults = require("./Defaults")
const WABinary = require("./WABinary")
const Signal = require("./Signal/libsignal")
const WAProto = require("../WAProto")

// Primary Exports
exports.default = socket_1.default
exports.makeWASocket = socket_1.default
exports.patchSocket = socket_patcher_1.patchSocket
exports.makeFreeZeeSocket = freezee_socket_1.makeFreeZeeSocket

// Explicit Named Exports for ESM Compatibility (Node.js strictly needs these)
exports.proto = WAProto.proto
exports.generateMessageID = Utils.generateMessageID
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.jidDecode = WABinary.jidDecode
exports.jidEncode = WABinary.jidEncode
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET
exports.DisconnectReason = Types.DisconnectReason
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON
exports.delay = Utils.delay
exports.downloadContentFromMessage = Utils.downloadContentFromMessage
exports.generateForwardMessageContent = Utils.generateForwardMessageContent
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.extractMessageContent = Utils.extractMessageContent
exports.getDevice = WABinary.getDevice
exports.isJidGroup = WABinary.isJidGroup
exports.isJidUser = WABinary.isJidUser
exports.isJidStatusV3 = WABinary.isJidStatusV3
exports.isJidBroadcast = WABinary.isJidBroadcast
exports.isJidNewsletter = WABinary.isJidNewsletter
exports.useMultiFileAuthState = Utils.useMultiFileAuthState
exports.useMongoFileAuth = Utils.useMongoFileAuthState // For FreeZeeHost compatibility

// Merge all other sub-exports for CJS/Require support
Object.assign(exports, Socket)
Object.assign(exports, Utils)
Object.assign(exports, Types)
Object.assign(exports, Store)
Object.assign(exports, Defaults)
Object.assign(exports, WABinary)
Object.assign(exports, WAProto)
exports.libsignal = Signal
