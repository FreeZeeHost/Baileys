"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const freezee = require("./Utils/freezee-socket")
exports.default = freezee.makeFreeZeeSocket
exports.makeFreeZeeSocket = freezee.makeFreeZeeSocket
exports.makeWASocket = freezee.makeFreeZeeSocket
const Utils = require("./Utils")
const WABinary = require("./WABinary")
exports.extractMessageContent = Utils.extractMessageContent
exports.getContentType = Utils.getContentType
exports.generateWAMessage = Utils.generateWAMessage
exports.jidDecode = WABinary.jidDecode
exports.useMultiFileAuthState = require("./Utils/use-mongo-file-auth-state").useMongoFileAuthState
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion
exports.Utils = Utils
exports.WABinary = WABinary
exports.Types = require("./Types")
exports.Store = require("./Store")
exports.Defaults = require("./Defaults")
exports.WAProto = require("../WAProto")
