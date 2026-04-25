"use strict"
Object.defineProperty(exports, "__esModule", { value: true })

// PRIMARY OVERRIDE
const freezee = require("./Utils/freezee-socket")
exports.default = freezee.makeFreeZeeSocket
exports.makeFreeZeeSocket = freezee.makeFreeZeeSocket
exports.makeWASocket = freezee.makeFreeZeeSocket

// CORE UTILS
const Utils = require("./Utils")
exports.extractMessageContent = Utils.extractMessageContent
exports.getContentType = Utils.getContentType
exports.generateWAMessage = Utils.generateWAMessage
exports.jidDecode = require("./WABinary").jidDecode
exports.useMultiFileAuthState = Utils.useMultiFileAuthState
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion

// SUB-MODULES
exports.Utils = Utils
exports.WABinary = require("./WABinary")
exports.Types = require("./Types")
exports.Store = require("./Store")
exports.Defaults = require("./Defaults")
exports.WAProto = require("../WAProto")
