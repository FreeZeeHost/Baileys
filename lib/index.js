"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

const freezee = require("./Utils/freezee-socket")
const patcher = require("./Utils/socket-patcher")
const Utils = require("./Utils")
const WABinary = require("./WABinary")
const Types = require("./Types")
const Defaults = require("./Defaults")
const WAProto = require("../WAProto")

// --- PRIMARY EXPORTS WITH ALIASES ---
exports.default = freezee.makeFreeZeeSocket
exports.makeWASocket = freezee.makeFreeZeeSocket
exports.makeFreeZeeSocket = freezee.makeFreeZeeSocket
exports.makeConn = freezee.makeFreeZeeSocket
exports.makeClient = freezee.makeFreeZeeSocket
exports.makeWA = freezee.makeFreeZeeSocket

exports.patchSocket = patcher.patchSocket

// --- MASSIVE EXPLICIT NAMED EXPORTS (FOR ESM/IMPORT SUPPORT) ---

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
exports.getAggregateVotesInPollMessage = Utils.getAggregateVotesInPollMessage
exports.aggregateMessageKeysNotFromMe = Utils.aggregateMessageKeysNotFromMe

// 2. JID & User (Crucial for serialize.js and handler.js)
exports.jidDecode = WABinary.jidDecode
exports.jidEncode = WABinary.jidEncode
exports.jidNormalizedUser = WABinary.jidNormalizedUser
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.isJidGroup = WABinary.isJidGroup
exports.isJidUser = WABinary.isJidUser
exports.isJidBroadcast = WABinary.isJidBroadcast
exports.isJidNewsletter = WABinary.isJidNewsletter
exports.isLidUser = WABinary.isLidUser
exports.getDevice = WABinary.getDevice

// 3. Auth & Connection
exports.useMultiFileAuthState = require("./Utils/use-mongo-file-auth-state").useMongoFileAuthState
exports.useMongoFileAuth = require("./Utils/use-mongo-file-auth-state").useMongoFileAuthState
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion
exports.initAuthCreds = Utils.initAuthCreds
exports.DisconnectReason = Types.DisconnectReason

// 4. Constants & Tools
exports.proto = WAProto.proto
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON
exports.delay = Utils.delay
exports.toNumber = Utils.toNumber
exports.makeInMemoryStore = require("./Store").makeInMemoryStore

// Re-export everything else for CJS compatibility
Object.assign(exports, Utils, WABinary, Types, require("./Store"), Defaults, WAProto)
