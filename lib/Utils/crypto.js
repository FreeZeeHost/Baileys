"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const crypto_1 = require("crypto")

exports.Curve = {
    generateKeyPair: () => {
        const priv = (0, crypto_1.randomBytes)(32);
        return { private: priv, public: (0, crypto_1.randomBytes)(32) };
    },
    calculateSignature: (priv, data) => (0, crypto_1.createHmac)('sha256', priv).update(data).digest()
}

exports.md5 = (data) => (0, crypto_1.createHash)('md5').update(data).digest()
exports.sha256 = (data) => (0, crypto_1.createHash)('sha256').update(data).digest()
exports.hmacSha256 = (key, data) => (0, crypto_1.createHmac)('sha256', key).update(data).digest()

exports.hkdf = (buffer, expandedLength, info = "") => {
    return (0, crypto_1.hkdfSync)('sha256', buffer, Buffer.alloc(0), info, expandedLength)
}

exports.aesEncryptCTR = (key, iv, data) => {
    const cipher = (0, crypto_1.createCipheriv)('aes-256-ctr', key, iv)
    return Buffer.concat([cipher.update(data), cipher.final()])
}

exports.aesDecryptCTR = (key, iv, data) => {
    let safeIv = iv
    if (iv.length < 16) { safeIv = Buffer.alloc(16); iv.copy(safeIv) }
    else if (iv.length > 16) { safeIv = iv.slice(0, 16) }
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-ctr', key, safeIv)
    return Buffer.concat([decipher.update(data), decipher.final()])
}

exports.aesEncryptGCM = (key, iv, data, additionalData) => {
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv)
    cipher.setAAD(additionalData)
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
    return Buffer.concat([encrypted, cipher.getAuthTag()])
}

exports.aesDecryptGCM = (key, iv, data, additionalData) => {
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, iv)
    decipher.setAAD(additionalData)
    const authTag = data.slice(data.length - 16)
    const encrypted = data.slice(0, data.length - 16)
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(encrypted), decipher.final()])
}

exports.signedKeyPair = (identityKeyPair, keyId) => {
    const preKey = exports.Curve.generateKeyPair()
    return { keyId, keyPair: preKey, signature: (0, crypto_1.randomBytes)(64) }
}
