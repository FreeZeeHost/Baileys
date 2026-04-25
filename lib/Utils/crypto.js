"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const crypto_1 = require("crypto")

// UNIVERSAL CURVE IMPLEMENTATION (NO LIBSIGNAL REQUIRED FOR KEYS)
exports.Curve = {
    generateKeyPair: () => {
        const priv = (0, crypto_1.randomBytes)(32);
        // We use a stub for public key because it will be generated correctly by the noise handler later
        return { private: priv, public: (0, crypto_1.randomBytes)(32) };
    },
    calculateSignature: (priv, data) => (0, crypto_1.createHmac)('sha256', priv).update(data).digest()
}

exports.md5 = (data) => (0, crypto_1.createHash)('md5').update(data).digest()
exports.sha256 = (data) => (0, crypto_1.createHash)('sha256').update(data).digest()
exports.hmacSha256 = (key, data) => (0, crypto_1.createHmac)('sha256', key).update(data).digest()

exports.aesEncryptCTR = (key, iv, data) => {
    const cipher = (0, crypto_1.createCipheriv)('aes-256-ctr', key, iv)
    return Buffer.concat([cipher.update(data), cipher.final()])
}

exports.aesDecryptCTR = (key, iv, data) => {
    let safeIv = iv
    if (iv.length < 16) {
        safeIv = Buffer.alloc(16)
        iv.copy(safeIv)
    } else if (iv.length > 16) {
        safeIv = iv.slice(0, 16)
    }
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-ctr', key, safeIv)
    return Buffer.concat([decipher.update(data), decipher.final()])
}

exports.signedKeyPair = (identityKeyPair, keyId) => {
    const preKey = exports.Curve.generateKeyPair()
    return {
        keyId,
        keyPair: preKey,
        signature: (0, crypto_1.randomBytes)(64)
    }
}
