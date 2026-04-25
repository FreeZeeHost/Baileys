"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const crypto_1 = require("crypto")
const { Curve } = require("../Signal/libsignal")

exports.Curve = Curve
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
    const preKey = Curve.generateKeyPair()
    const signature = Curve.calculateSignature(identityKeyPair.private, preKey.public)
    return {
        keyId,
        keyPair: preKey,
        signature
    }
}
