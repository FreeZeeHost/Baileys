"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.Curve = exports.CurveKeyPair = exports.signedKeyPair = exports.sha256 = exports.hmacSha256 = exports.aesEncryptCTR = exports.aesDecryptCTR = exports.aesEncryptGCM = exports.aesDecryptGCM = exports.md5 = void 0

const crypto_1 = require("crypto")

const md5 = (data) => (0, crypto_1.createHash)('md5').update(data).digest()
exports.md5 = md5

const sha256 = (data) => (0, crypto_1.createHash)('sha256').update(data).digest()
exports.sha256 = sha256

const hmacSha256 = (key, data) => (0, crypto_1.createHmac)('sha256', key).update(data).digest()
exports.hmacSha256 = hmacSha256

const aesEncryptCTR = (key, iv, data) => {
    const cipher = (0, crypto_1.createCipheriv)('aes-256-ctr', key, iv)
    return Buffer.concat([cipher.update(data), cipher.final()])
}
exports.aesEncryptCTR = aesEncryptCTR

const aesDecryptCTR = (key, iv, data) => {
    // FIX: Pastikan IV selalu 16 byte untuk mencegah ERR_CRYPTO_INVALID_IV
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
exports.aesDecryptCTR = aesDecryptCTR

const aesEncryptGCM = (key, iv, data, additionalData) => {
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv)
    cipher.setAAD(additionalData)
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
    return Buffer.concat([encrypted, cipher.getAuthTag()])
}
exports.aesEncryptGCM = aesEncryptGCM

const aesDecryptGCM = (key, iv, data, additionalData) => {
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, iv)
    decipher.setAAD(additionalData)
    const authTag = data.slice(data.length - 16)
    const encrypted = data.slice(0, data.length - 16)
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(encrypted), decipher.final()])
}
exports.aesDecryptGCM = aesDecryptGCM

const Curve = require("../Signal/libsignal").Curve
exports.Curve = Curve

exports.CurveKeyPair = class CurveKeyPair {
    constructor(privateKey, publicKey) {
        this.private = privateKey
        this.public = publicKey
    }
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
