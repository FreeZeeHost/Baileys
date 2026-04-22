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

// --- EXPLICIT NAMED EXPORTS (VITAL FOR ESM/IMPORT SUPPORT) ---

// 1. Protobuf & Constants
exports.proto = WAProto.proto
exports.DisconnectReason = Types.DisconnectReason
exports.WA_DEFAULT_EPHEMERAL = Defaults.WA_DEFAULT_EPHEMERAL
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET
exports.OFFICIAL_BIZ_JID = WABinary.OFFICIAL_BIZ_JID

// 2. JID Functions
exports.jidNormalizedUser = WABinary.jidNormalizedUser
exports.jidDecode = WABinary.jidDecode
exports.jidEncode = WABinary.jidEncode
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.isJidGroup = WABinary.isJidGroup
exports.isJidUser = WABinary.isJidUser
exports.isJidStatusV3 = WABinary.isJidStatusV3
exports.isJidBroadcast = WABinary.isJidBroadcast
exports.isJidNewsletter = WABinary.isJidNewsletter
exports.isLidUser = WABinary.isLidUser
exports.getDevice = WABinary.getDevice

// 3. Message & Content Functions
exports.getContentType = Utils.getContentType
exports.extractMessageContent = Utils.extractMessageContent
exports.generateMessageID = Utils.generateMessageID
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateWAMessage = Utils.generateWAMessage
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateForwardMessageContent = Utils.generateForwardMessageContent
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.aggregateMessageKeys = Utils.aggregateMessageContent
exports.downloadContentFromMessage = Utils.downloadContentFromMessage
exports.downloadMediaMessage = Utils.downloadMediaMessage
exports.decodeMessageNode = Utils.decodeMessageNode
exports.decryptMessageNode = Utils.decryptMessageNode

// 4. Utility Functions
exports.Browsers = Utils.Browsers
exports.BufferJSON = Utils.BufferJSON
exports.delay = Utils.delay
exports.toNumber = Utils.toNumber
exports.unixTimestampSeconds = Utils.unixTimestampSeconds
exports.makeInMemoryStore = Store.makeInMemoryStore
exports.makeCacheManagerStore = Store.makeCacheManagerStore

// 5. Auth & Connection Functions
exports.useMultiFileAuthState = Utils.useMultiFileAuthState
exports.useSingleFileAuthState = Utils.useSingleFileAuthState
exports.useMongoFileAuth = Utils.useMongoFileAuthState // FreeZeeHost Plugin
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion
exports.makeLibSignalRepository = Signal.makeLibSignalRepository

// Merge all other symbols for CommonJS (require) compatibility
Object.assign(exports, Socket)
Object.assign(exports, Utils)
Object.assign(exports, Types)
Object.assign(exports, Store)
Object.assign(exports, Defaults)
Object.assign(exports, WABinary)
Object.assign(exports, WAProto)
exports.libsignal = Signal
