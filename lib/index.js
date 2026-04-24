"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

const socket_1 = require("./Socket")
const socket_patcher_1 = require("./Utils/socket-patcher")
const freezee_socket_1 = require("./Utils/freezee-socket")
const Utils = require("./Utils")
const WABinary = require("./WABinary")
const Types = require("./Types")
const Defaults = require("./Defaults")
const WAProto = require("../WAProto")

// Primary Exports
exports.default = socket_1.default
exports.makeWASocket = socket_1.default
exports.makeFreeZeeSocket = freezee_socket_1.makeFreeZeeSocket
exports.patchSocket = socket_patcher_1.patchSocket

// --- EXPLICIT NAMED EXPORTS (REQUIRED FOR ESM SUPPORT) ---
exports.proto = WAProto.proto
exports.extractMessageContent = Utils.extractMessageContent
exports.getContentType = Utils.getContentType
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateWAMessage = Utils.generateWAMessage
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.downloadMediaMessage = Utils.downloadMediaMessage
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion
exports.jidNormalizedUser = WABinary.jidNormalizedUser
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET
exports.DisconnectReason = Types.DisconnectReason
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON
exports.delay = Utils.delay
exports.makeInMemoryStore = require("./Store").makeInMemoryStore

// Sub-modules re-export for CJS
exports.Utils = Utils
exports.WABinary = WABinary
exports.Types = Types
exports.Store = require("./Store")
exports.Defaults = Defaults
exports.WAProto = WAProto
