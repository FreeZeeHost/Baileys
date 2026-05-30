"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const crypto = require("crypto")
const generics = require("./generics")

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16

const encrypt = (text, masterKey) => {
    if (!masterKey) return text
    const key = crypto.createHash("sha256").update(masterKey).digest()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(typeof text === "string" ? text : JSON.stringify(text), "utf8", "hex")
    encrypted += cipher.final("hex")
    const tag = cipher.getAuthTag().toString("hex")
    return `${iv.toString("hex")}:${tag}:${encrypted}`
}

const decrypt = (text, masterKey) => {
    if (!masterKey) return text
    try {
        const key = crypto.createHash("sha256").update(masterKey).digest()
        const [ivHex, tagHex, encrypted] = text.split(":")
        const iv = Buffer.from(ivHex, "hex")
        const tag = Buffer.from(tagHex, "hex")
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
        decipher.setAuthTag(tag)
        let decrypted = decipher.update(encrypted, "hex", "utf8")
        decrypted += decipher.final("utf8")
        try { return JSON.parse(decrypted) } catch { return decrypted }
    } catch (err) {
        return "DECRYPTION_FAILED"
    }
}

class ActivityLogger {
    constructor(collection, encryptionKey) {
        this.collection = collection
        this.key = encryptionKey
        this.stats = {
            messagesSent: 0,
            messagesReceived: 0,
            errors: 0,
            commandsExecuted: 0,
            startTime: Date.now()
        }
    }

    async log(type, data) {
        this.stats[type === "sent" ? "messagesSent" : type === "recv" ? "messagesReceived" : "errors"]++
        
        if (this.collection) {
            const entry = {
                type,
                timestamp: new Date(),
                data: encrypt(data, this.key)
            }
            try {
                await this.collection.insertOne(entry)
            } catch (err) {
                // Silently fail to avoid crashing the bot
            }
        }
    }

    getMetrics() {
        return {
            ...this.stats,
            uptime: Math.floor((Date.now() - this.stats.startTime) / 1000),
            memory: process.memoryUsage().rss / 1024 / 1024
        }
    }
}

exports.encrypt = encrypt
exports.decrypt = decrypt
exports.ActivityLogger = ActivityLogger
