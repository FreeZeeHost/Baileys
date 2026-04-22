"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const pino_1 = require("pino")
const logger = (0, pino_1.default)({
    level: process.env.BAILEYS_LOG_LEVEL || 'info'
})
exports.default = logger
module.exports = logger
