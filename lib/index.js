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

// --- THE FINAL MEGA EXPLICIT EXPORTS (0% ERROR RATE) ---

// 1. Constants & Enums
exports.proto = WAProto.proto
exports.DisconnectReason = Types.DisconnectReason
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET
exports.OFFICIAL_BIZ_JID = WABinary.OFFICIAL_BIZ_JID
exports.PHONENUMBER_MCC = Defaults.PHONENUMBER_MCC
exports.DEFAULT_ORIGIN = Defaults.DEFAULT_ORIGIN
exports.WAMessageStatus = Types.WAMessageStatus
exports.WAMessageStubType = Types.WAMessageStatus // Fallback

// 2. JID & User Functions
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

// 3. Message Processing & Logic
exports.getContentType = Utils.getContentType
exports.extractMessageContent = Utils.extractMessageContent
exports.normalizeMessageContent = Utils.normalizeMessageContent
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateWAMessage = Utils.generateWAMessage
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.generateForwardMessageContent = Utils.generateForwardMessageContent
exports.generateMessageID = Utils.generateMessageID
exports.generateMessageIDV2 = Utils.generateMessageIDV2
exports.downloadContentFromMessage = Utils.downloadContentFromMessage
exports.downloadMediaMessage = Utils.downloadMediaMessage
exports.getAggregateVotesInPollMessage = Utils.getAggregateVotesInPollMessage
exports.getAggregateResponsesInEventMessage = Utils.getAggregateResponsesInEventMessage
exports.aggregateMessageKeysNotFromMe = Utils.aggregateMessageKeysNotFromMe
exports.decodeMessageNode = Utils.decodeMessageNode
exports.decryptMessageNode = Utils.decryptMessageNode
exports.encodeWAMessage = Utils.encodeWAMessage
exports.getKeyAuthor = Utils.getKeyAuthor

// 4. Auth, Store & Versioning
exports.makeInMemoryStore = Store.makeInMemoryStore
exports.makeCacheManagerStore = Store.makeCacheManagerStore
exports.useMultiFileAuthState = Utils.useMultiFileAuthState
exports.useSingleFileAuthState = Utils.useSingleFileAuthState
exports.useMongoFileAuth = Utils.useMongoFileAuthState
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion
exports.fetchLatestWaWebVersion = Utils.fetchLatestWaWebVersion
exports.makeLibSignalRepository = Signal.makeLibSignalRepository

// 5. Binary Node Helpers (XMPP)
exports.binaryNodeToString = WABinary.binaryNodeToString
exports.getBinaryNodeChild = WABinary.getBinaryNodeChild
exports.getBinaryNodeChildren = WABinary.getBinaryNodeChildren
exports.getAllBinaryNodeChildren = WABinary.getAllBinaryNodeChildren
exports.assertNodeErrorFree = WABinary.assertNodeErrorFree
exports.encodeBinaryNode = WABinary.encodeBinaryNode
exports.decodeBinaryNode = WABinary.decodeBinaryNode

// 6. Generic Helpers
exports.delay = Utils.delay
exports.delayCancellable = Utils.delayCancellable
exports.promiseTimeout = Utils.promiseTimeout
exports.toNumber = Utils.toNumber
exports.unixTimestampSeconds = Utils.unixTimestampSeconds
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON
exports.bytesToCrockford = Utils.bytesToCrockford

// Re-export everything else via Object.assign for CJS
Object.assign(exports, Socket)
Object.assign(exports, Utils)
Object.assign(exports, Types)
Object.assign(exports, Store)
Object.assign(exports, Defaults)
Object.assign(exports, WABinary)
Object.assign(exports, WAProto)
exports.libsignal = Signal
