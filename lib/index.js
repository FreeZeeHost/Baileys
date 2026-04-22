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

// --- EXPLICIT NAMED EXPORTS (FOR ESM/IMPORT COMPATIBILITY) ---

// Protobuf & Constants
exports.proto = WAProto.proto
exports.DisconnectReason = Types.DisconnectReason
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET

// JID Functions
exports.jidNormalizedUser = WABinary.jidNormalizedUser
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.jidDecode = WABinary.jidDecode
exports.jidEncode = WABinary.jidEncode
exports.isJidGroup = WABinary.isJidGroup
exports.isJidUser = WABinary.isJidUser
exports.isJidBroadcast = WABinary.isJidBroadcast
exports.isJidNewsletter = WABinary.isJidNewsletter
exports.isJidStatusV3 = WABinary.isJidStatusV3

// Message Generation & Media
exports.getContentType = Utils.getContentType
exports.extractMessageContent = Utils.extractMessageContent
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateWAMessage = Utils.generateWAMessage
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.generateForwardMessageContent = Utils.generateForwardMessageContent
exports.generateMessageID = Utils.generateMessageID
exports.downloadContentFromMessage = Utils.downloadContentFromMessage
exports.downloadMediaMessage = Utils.downloadMediaMessage

// Utilities
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON
exports.delay = Utils.delay
exports.toNumber = Utils.toNumber

// Store & Auth
exports.makeInMemoryStore = Store.makeInMemoryStore
exports.useMultiFileAuthState = Utils.useMultiFileAuthState
exports.useMongoFileAuth = Utils.useMongoFileAuthState

// Re-export everything else for CJS support
Object.assign(exports, Socket)
Object.assign(exports, Utils)
Object.assign(exports, Types)
Object.assign(exports, Store)
Object.assign(exports, Defaults)
Object.assign(exports, WABinary)
Object.assign(exports, WAProto)
exports.libsignal = Signal
