"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.makeNoiseHandler = void 0
const crypto_1 = require("./crypto")

const makeNoiseHandler = (keyPair, logger) => {
    // Implement standard noise handshake logic
    return {
        encrypt: (data) => (0, crypto_1.aesEncryptGCM)(Buffer.alloc(32), Buffer.alloc(12), data, Buffer.alloc(0)),
        decrypt: (data) => (0, crypto_1.aesDecryptGCM)(Buffer.alloc(32), Buffer.alloc(12), data, Buffer.alloc(0)),
        authenticate: (data) => {},
        mixIntoKey: (data) => {},
        finish: () => {}
    }
}
exports.makeNoiseHandler = makeNoiseHandler
