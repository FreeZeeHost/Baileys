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

// --- THE ULTIMATE OVERRIDE ---
// Apapun yang diimport (default atau named), arahkan ke versi Premium FreeZeeHost
exports.default = freezee_socket_1.makeFreeZeeSocket
exports.makeWASocket = freezee_socket_1.makeFreeZeeSocket
exports.makeFreeZeeSocket = freezee_socket_1.makeFreeZeeSocket
exports.patchSocket = socket_patcher_1.patchSocket

// --- EXPLICIT NAMED EXPORTS ---
exports.proto = WAProto.proto
exports.extractMessageContent = Utils.extractMessageContent
exports.getContentType = Utils.getContentType
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateWAMessage = Utils.generateWAMessage
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.downloadMediaMessage = Utils.downloadMediaMessage
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion
exports.normalizeMessageContent = Utils.normalizeMessageContent

// Auth & JID Helpers
exports.useMultiFileAuthState = Utils.useMultiFileAuthState
exports.useSingleFileAuthState = Utils.useSingleFileAuthState
exports.makeCacheableSignalKeyStore = Utils.makeCacheableSignalKeyStore
exports.initAuthCreds = Utils.initAuthCreds
exports.jidDecode = WABinary.jidDecode
exports.jidEncode = WABinary.jidEncode
exports.jidNormalizedUser = WABinary.jidNormalizedUser
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.isJidGroup = WABinary.isJidGroup
exports.isJidUser = WABinary.isJidUser
exports.getDevice = WABinary.getDevice

// Constants
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET
exports.DisconnectReason = Types.DisconnectReason
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON
exports.delay = Utils.delay
exports.toNumber = Utils.toNumber
exports.makeInMemoryStore = require("./Store").makeInMemoryStore

// Re-export original socket as RawSocket if needed
exports.makeRawWASocket = socket_1.default

// Sub-modules
exports.Utils = Utils
exports.WABinary = WABinary
exports.Types = Types
exports.Store = require("./Store")
exports.Defaults = Defaults
exports.WAProto = WAProto
