"use strict"

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}

Object.defineProperty(exports, "__esModule", { value: true })

const boom_1 = require("@hapi/boom")
const crypto_1 = require("crypto")
const WAProto_1 = require("../../WAProto")
const Types_1 = require("../Types")
const WABinary_1 = require("../WABinary")

// IMPORT CURVE DENGAN JALUR YANG BENAR (KELUAR FOLDER UTILS DULU)


exports.baileysVersion = [2, 3100, 2]

exports.BufferJSON = {
    replacer: (k, value) => {
        if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === 'Buffer') {
            return { type: 'Buffer', data: Buffer.from(value?.data || value).toString('base64') }
        }
        return value
    },
    reviver: (_, value) => {
        if (typeof value === 'object' && value !== null && value.type === 'Buffer' && typeof value.data === 'string') {
            return Buffer.from(value.data, 'base64')
        }
        return value
    }
}

exports.initAuthCreds = () => {
    const { signedKeyPair } = require("./crypto")
    return {
        noiseKey: Curve.generateKeyPair(),
        pairingEphemeralKeyPair: Curve.generateKeyPair(),
        signedIdentityKey: Curve.generateKeyPair(),
        signedPreKey: signedKeyPair(Curve.generateKeyPair(), 1),
        registrationId: (0, crypto_1.randomBytes)(2).readUInt16BE() & 16383,
        advSecretKey: (0, crypto_1.randomBytes)(32).toString("base64"),
        processedHistoryMessages: [],
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        accountSyncCounter: 0,
        accountSettings: {
            unarchiveChats: false
        },
        deviceId: (0, crypto_1.randomBytes)(16).toString("base64"),
        phoneId: (0, crypto_1.randomBytes)(16).toString("base64"),
        identityId: (0, crypto_1.randomBytes)(20),
        registered: false,
        backupToken: (0, crypto_1.randomBytes)(20),
        registration: {},
        pairingCode: undefined,
        lastPropHash: undefined,
        routingInfo: undefined
    }
}

exports.encodeBigEndian = (e, t = 4) => {
    let r = e
    const a = new Uint8Array(t)
    for (let i = t - 1; i >= 0; i--) {
        a[i] = 255 & r
        r >>>= 8
    }
    return a
}

exports.generateRegistrationId = () => {
    return (0, crypto_1.randomBytes)(2).readUInt16BE() & 16383
}

exports.toNumber = (t) => typeof t === 'object' && t ? ('toNumber' in t ? t.toNumber() : t.low) : t || 0
exports.unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)
exports.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

exports.generateMessageID = () => '3EB0' + (0, crypto_1.randomBytes)(18).toString('hex').toUpperCase()

exports.Browsers = {
    ubuntu: (browser) => ['Ubuntu', browser, '22.04.4'],
    macOS: (browser) => ['Mac OS', browser, '13.5.2'],
    windows: (browser) => ['Windows', browser, '10.0.22631'],
    chrome: (browser) => ['Ubuntu', 'Chrome', '122.0.6261.129'],
    appropriate: (browser) => {
        const os = require('os')
        return [os.platform(), browser, os.release()]
    }
}
