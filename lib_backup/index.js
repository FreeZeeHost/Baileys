"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const socket_1 = require("./Socket")
exports.default = socket_1.default
exports.makeWASocket = socket_1.default
exports.makeFreeZeeSocket = require("./Utils/freezee-socket").makeFreeZeeSocket
exports.useMongoFileAuthState = require("./Utils/use-mongo-file-auth-state").useMongoFileAuthState
