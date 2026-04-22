"use strict"
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true })
const boom_1 = require("@hapi/boom")
const axios_1 = __importDefault(require("axios"))
const crypto_1 = require("crypto")
const crypto_2 = require("./crypto")
const os_1 = require("os")
const WAProto_1 = require("../../WAProto")
const baileysVersion = [2, 3100, 2]
const Types_1 = require("../Types")
const WABinary_1 = require("../WABinary")

const Browsers = {
    ubuntu: (browser) => ['Ubuntu', browser, '22.04.4'],
    macOS: (browser) => ['Mac OS', browser, '13.5.2'],
    windows: (browser) => ['Windows', 'Chrome', '122.0.6261.129'],
    appropriate: (browser) => {
        const platform = (0, os_1.platform)()
        return [platform, browser, (0, os_1.release)()]
    }
}

const BufferJSON = {
    replacer: (k, value) => {
        if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === 'Buffer') {
            return { type: 'Buffer', data: Buffer.from(value?.data || value).toString('base64') }
        }
        return value
    },
    reviver: (_, value) => {
        if (typeof value === 'object' && !!value && (value.buffer === true || value.type === 'Buffer')) {
            const val = value.data || value.value
            return typeof val === 'string' ? Buffer.from(val, 'base64') : Buffer.from(val || [])
        }
        return value
    }
}

const getPlatformId = (browser) => {
    const platformType = WAProto_1.proto.DeviceProps.PlatformType[browser.toUpperCase()]
    return platformType !== undefined ? platformType.toString() : '1'
}

const writeRandomPadMax16 = (msg) => {
    const pad = (0, crypto_1.randomBytes)(1)
    const padLength = (pad[0] & 0x0f) + 1
    return Buffer.concat([msg, Buffer.alloc(padLength, padLength)])
}

const unpadRandomMax16 = (e) => {
    const t = new Uint8Array(e)
    if (0 === t.length) throw new Error('unpadPkcs7 given empty bytes')
    var r = t[t.length - 1]
    if (r > t.length) throw new Error(`unpad given ${t.length} bytes, but pad is ${r}`)
    return new Uint8Array(t.buffer, t.byteOffset, t.length - r)
}

const encodeWAMessage = (message) => writeRandomPadMax16(WAProto_1.proto.Message.encode(message).finish())
const generateRegistrationId = () => (0, crypto_1.randomBytes)(2).readUInt16BE() & 16383
const encodeBigEndian = (e, t = 4) => {
    let r = e; const a = new Uint8Array(t)
    for (let i = t - 1; i >= 0; i--) { a[i] = 255 & r; r >>>= 8 }
    return a
}
const toNumber = (t) => ((typeof t === 'object' && t) ? ('toNumber' in t ? t.toNumber() : t.low) : t || 0)
const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

const delayCancellable = (ms) => {
    const stack = new Error().stack
    let timeout; let reject
    const delay = new Promise((resolve, _reject) => {
        timeout = setTimeout(resolve, ms)
        reject = _reject
    })
    const cancel = () => {
        clearTimeout(timeout)
        reject(new boom_1.Boom('Cancelled', { statusCode: 500, data: { stack } }))
    }
    return { delay, cancel }
}

const delay = (ms) => delayCancellable(ms).delay

async function promiseTimeout(ms, promise) {
    if (!ms) return new Promise(promise)
    const stack = new Error().stack
    const { delay, cancel } = delayCancellable(ms)
    const p = new Promise((resolve, reject) => {
        delay.then(() => reject(new boom_1.Boom('Timed Out', { statusCode: Types_1.DisconnectReason.timedOut, data: { stack } }))).catch(err => reject(err))
        promise(resolve, reject)
    }).finally(cancel)
    return p
}

const generateMdTagPrefix = () => {
    const bytes = (0, crypto_1.randomBytes)(4)
    return `${bytes.readUInt16BE()}.${bytes.readUInt16BE(2)}-`
}

const bindWaitForEvent = (ev, event) => {
    return async (check, timeoutMs) => {
        let listener; let closeListener
        await (promiseTimeout(timeoutMs, (resolve, reject) => {
            closeListener = ({ connection, lastDisconnect }) => {
                if (connection === 'close') reject((lastDisconnect?.error) || new boom_1.Boom('Connection Closed', { statusCode: Types_1.DisconnectReason.connectionClosed }))
            }
            ev.on('connection.update', closeListener)
            listener = async (update) => { if (await check(update)) resolve() }
            ev.on(event, listener)
        }).finally(() => {
            ev.off(event, listener)
            ev.off('connection.update', closeListener)
        }))
    }
}

module.exports = {
    baileysVersion,
    Browsers,
    BufferJSON,
    getPlatformId,
    writeRandomPadMax16,
    unpadRandomMax16,
    encodeWAMessage,
    generateRegistrationId,
    encodeBigEndian,
    toNumber,
    unixTimestampSeconds,
    delay,
    delayCancellable,
    promiseTimeout,
    generateMdTagPrefix,
    bindWaitForEvent,
    bindWaitForConnectionUpdate: (ev) => bindWaitForEvent(ev, 'connection.update'),
    printQRIfNecessaryListener: (ev, logger) => {
        ev.on('connection.update', async ({ qr }) => {
            if (qr) {
                const QR = await Promise.resolve().then(() => require('qrcode-terminal')).catch(() => { logger.error('QR code terminal not added as dependency') })
                QR?.generate(qr, { small: true })
            }
        })
    },
    fetchLatestBaileysVersion: async () => ({ version: baileysVersion, isLatest: true }),
    getErrorCodeFromStreamError: (node) => {
        const [reasonNode] = (0, WABinary_1.getAllBinaryNodeChildren)(node)
        return { reason: reasonNode?.tag || 'unknown', statusCode: +(node.attrs.code || Types_1.DisconnectReason.badSession) }
    },
    getCodeFromWSError: (error) => {
        if (error?.message?.includes('Unexpected server response: ')) {
            const code = +(error?.message.slice('Unexpected server response: '.length))
            if (!Number.isNaN(code) && code >= 400) return code
        }
        return error?.code?.startsWith('E') ? 408 : 500
    },
    bytesToCrockford: (buffer) => {
        let value = 0; let bitCount = 0; const crockford = []
        for (const element of buffer) {
            value = (value << 8) | (element & 0xff); bitCount += 8
            while (bitCount >= 5) {
                crockford.push('123456789ABCDEFGHJKLMNPQRSTVWXYZ'.charAt((value >>> (bitCount - 5)) & 31)); bitCount -= 5
            }
        }
        return crockford.join('')
    }
}
