"use strict"

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k
    var desc = Object.getOwnPropertyDescriptor(m, k)
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k] } }
    }
    Object.defineProperty(o, k2, desc)
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k
    o[k2] = m[k]
}))

var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p)
}

Object.defineProperty(exports, "__esModule", { value: true })

const socket_1 = require("./Socket")
const socket_patcher_1 = require("./Utils/socket-patcher")
const freezee_socket_1 = require("./Utils/freezee-socket")
const Utils = require("./Utils")
const WABinary = require("./WABinary")
const Types = require("./Types")
const Defaults = require("./Defaults")
const Store = require("./Store")
const WAProto = require("../WAProto")

// --- PRIMARY EXPORTS (For ESM 'import' & CJS 'require') ---
exports.default = freezee_socket_1.makeFreeZeeSocket
exports.makeWASocket = freezee_socket_1.makeFreeZeeSocket
exports.makeFreeZeeSocket = freezee_socket_1.makeFreeZeeSocket
exports.patchSocket = socket_patcher_1.patchSocket

// --- EXPLICIT NAMED EXPORTS (REQUIRED FOR ESM) ---
// 1. Message & Media
exports.extractMessageContent = Utils.extractMessageContent
exports.getContentType = Utils.getContentType
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateWAMessage = Utils.generateWAMessage
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.downloadMediaMessage = Utils.downloadMediaMessage
exports.downloadContentFromMessage = Utils.downloadContentFromMessage
exports.normalizeMessageContent = Utils.normalizeMessageContent
exports.generateForwardMessageContent = Utils.generateForwardMessageContent
exports.generateMessageID = Utils.generateMessageID

// 2. JID & User
exports.jidDecode = WABinary.jidDecode
exports.jidEncode = WABinary.jidEncode
exports.jidNormalizedUser = WABinary.jidNormalizedUser
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.isJidGroup = WABinary.isJidGroup
exports.isJidUser = WABinary.isJidUser
exports.isJidBroadcast = WABinary.isJidBroadcast
exports.isJidNewsletter = WABinary.isJidNewsletter
exports.getDevice = WABinary.getDevice

// 3. Auth & Connection
exports.useMultiFileAuthState = Utils.useMongoFileAuthState // Forced Mongo for FreeZee
exports.useMongoFileAuth = Utils.useMongoFileAuthState
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion
exports.initAuthCreds = Utils.initAuthCreds
exports.makeCacheableSignalKeyStore = Utils.makeCacheableSignalKeyStore
exports.DisconnectReason = Types.DisconnectReason

// 4. Constants & Tools
exports.proto = WAProto.proto
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON
exports.delay = Utils.delay
exports.toNumber = Utils.toNumber
exports.makeInMemoryStore = Store.makeInMemoryStore

// --- SUB-MODULES RE-EXPORT ---
__exportStar(require("./Socket"), exports)
__exportStar(require("./Utils"), exports)
__exportStar(require("./Types"), exports)
__exportStar(require("./Store"), exports)
__exportStar(require("./Defaults"), exports)
__exportStar(require("./WABinary"), exports)
__exportStar(require("../WAProto"), exports)
