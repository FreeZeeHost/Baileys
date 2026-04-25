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
exports.default = freezee_socket_1.makeFreeZeeSocket
exports.makeWASocket = freezee_socket_1.makeFreeZeeSocket
exports.makeFreeZeeSocket = freezee_socket_1.makeFreeZeeSocket
exports.patchSocket = socket_patcher_1.patchSocket

// --- THE FINAL MEGA EXPLICIT EXPORTS (FOR ESM/IMPORT SUPPORT) ---

// 1. Constants & Enums
exports.proto = WAProto.proto
exports.DisconnectReason = Types.DisconnectReason
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET
exports.OFFICIAL_BIZ_JID = WABinary.OFFICIAL_BIZ_JID
exports.WAMessageStatus = Types.WAMessageStatus

// 2. JID & User Functions
exports.jidNormalizedUser = WABinary.jidNormalizedUser
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.jidDecode = WABinary.jidDecode
exports.jidEncode = WABinary.jidEncode
exports.isJidGroup = WABinary.isJidGroup
exports.isJidUser = WABinary.isJidUser
exports.isJidBroadcast = WABinary.isJidBroadcast
exports.isJidNewsletter = WABinary.isJidNewsletter
exports.isLidUser = WABinary.isLidUser
exports.getDevice = WABinary.getDevice

// 3. Message Processing & Logic
exports.getContentType = Utils.getContentType
exports.extractMessageContent = Utils.extractMessageContent
exports.normalizeMessageContent = Utils.normalizeMessageContent
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateWAMessage = Utils.generateWAMessage
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.downloadContentFromMessage = Utils.downloadContentFromMessage
exports.downloadMediaMessage = Utils.downloadMediaMessage
exports.generateForwardMessageContent = Utils.generateForwardMessageContent
exports.generateMessageID = Utils.generateMessageID
exports.getAggregateVotesInPollMessage = Utils.getAggregateVotesInPollMessage
exports.aggregateMessageKeysNotFromMe = Utils.aggregateMessageKeysNotFromMe

// 4. Auth & Versioning (Crucial for startup)
exports.useMultiFileAuthState = Utils.useMongoFileAuthState // Forced Mongo for FreeZee
exports.useMongoFileAuth = Utils.useMongoFileAuthState
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion
exports.fetchLatestWaWebVersion = Utils.fetchLatestBaileysVersion
exports.initAuthCreds = Utils.initAuthCreds
exports.makeInMemoryStore = require("./Store").makeInMemoryStore

// 5. Tools & Helpers
exports.delay = Utils.delay
exports.toNumber = Utils.toNumber
exports.unixTimestampSeconds = Utils.unixTimestampSeconds
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON

// Sub-modules re-export for CJS
exports.Utils = Utils
exports.WABinary = WABinary
exports.Types = Types
exports.Store = require("./Store")
exports.Defaults = Defaults
exports.WAProto = WAProto
