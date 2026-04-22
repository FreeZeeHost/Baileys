const pino = require("pino");
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

// --- THE ULTIMATE EXPLICIT NAMED EXPORTS (FOR ESM/IMPORT SUPPORT) ---

// 1. Protobuf & Constants
exports.proto = WAProto.proto
exports.DisconnectReason = Types.DisconnectReason
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET
exports.OFFICIAL_BIZ_JID = WABinary.OFFICIAL_BIZ_JID
exports.PHONENUMBER_MCC = Defaults.PHONENUMBER_MCC
exports.DEFAULT_ORIGIN = Defaults.DEFAULT_ORIGIN

// 2. JID Functions
exports.jidNormalizedUser = WABinary.jidNormalizedUser
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.jidDecode = WABinary.jidDecode
exports.jidEncode = WABinary.jidEncode
exports.isJidGroup = WABinary.isJidGroup
exports.isJidUser = WABinary.isJidUser
exports.isJidBroadcast = WABinary.isJidBroadcast
exports.isJidNewsletter = WABinary.isJidNewsletter
exports.isJidStatusV3 = WABinary.isJidStatusV3
exports.isLidUser = WABinary.isLidUser
exports.getDevice = WABinary.getDevice

// 3. Message Generation & Media
exports.getContentType = Utils.getContentType
exports.extractMessageContent = Utils.extractMessageContent
exports.normalizeMessageContent = Utils.normalizeMessageContent
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateWAMessage = Utils.generateWAMessage
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.generateForwardMessageContent = Utils.generateForwardMessageContent
exports.generateMessageID = Utils.generateMessageID
exports.downloadContentFromMessage = Utils.downloadContentFromMessage
exports.downloadMediaMessage = Utils.downloadMediaMessage
exports.getAggregateVotesInPollMessage = Utils.getAggregateVotesInPollMessage
exports.decodeMessageNode = Utils.decodeMessageNode
exports.decryptMessageNode = Utils.decryptMessageNode
exports.encodeWAMessage = Utils.encodeWAMessage

// 4. Utilities & Versions
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON
exports.delay = Utils.delay
exports.toNumber = Utils.toNumber
exports.unixTimestampSeconds = Utils.unixTimestampSeconds
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion
exports.fetchLatestWaWebVersion = Utils.fetchLatestBaileysVersion // Alias
exports.getErrorCodeFromStreamError = Utils.getErrorCodeFromStreamError

// 5. Store & Auth
exports.makeInMemoryStore = Store.makeInMemoryStore
exports.makeCacheManagerStore = Store.makeCacheManagerStore
exports.useMultiFileAuthState = Utils.useMultiFileAuthState
exports.useSingleFileAuthState = Utils.useSingleFileAuthState
exports.useMongoFileAuth = Utils.useMongoFileAuthState
exports.initAuthCreds = Utils.initAuthCreds
exports.makeLibSignalRepository = Signal.makeLibSignalRepository

// 6. Binary Node Helpers
exports.binaryNodeToString = WABinary.binaryNodeToString
exports.getBinaryNodeChild = WABinary.getBinaryNodeChild
exports.getBinaryNodeChildren = WABinary.getBinaryNodeChildren
exports.getAllBinaryNodeChildren = WABinary.getAllBinaryNodeChildren
exports.assertNodeErrorFree = WABinary.assertNodeErrorFree
exports.encodeBinaryNode = WABinary.encodeBinaryNode
exports.decodeBinaryNode = WABinary.decodeBinaryNode

// Re-export everything else for CJS support
Object.assign(exports, Socket)
Object.assign(exports, Utils)
Object.assign(exports, Types)
Object.assign(exports, Store)
Object.assign(exports, Defaults)
Object.assign(exports, WABinary)
Object.assign(exports, WAProto)
exports.libsignal = Signal
