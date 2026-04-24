"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

const socket_1 = require("./Socket")
const socket_patcher_1 = require("./Utils/socket-patcher")
const freezee_socket_1 = require("./Utils/freezee-socket")

// Primary Exports
exports.default = socket_1.default
exports.makeWASocket = socket_1.default
exports.makeFreeZeeSocket = freezee_socket_1.makeFreeZeeSocket
exports.patchSocket = socket_patcher_1.patchSocket

// Export common functions directly to avoid heavy dynamic loops
const Utils = require("./Utils")
const WABinary = require("./WABinary")

exports.jidNormalizedUser = WABinary.jidNormalizedUser
exports.areJidsSameUser = WABinary.areJidsSameUser
exports.getContentType = Utils.getContentType
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent
exports.generateWAMessage = Utils.generateWAMessage
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia
exports.downloadMediaMessage = Utils.downloadMediaMessage
exports.Browsers = Utils.Browsers
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion

// Sub-modules re-export
exports.Utils = Utils
exports.WABinary = WABinary
exports.Types = require("./Types")
exports.Store = require("./Store")
exports.Defaults = require("./Defaults")
exports.WAProto = require("../WAProto")
