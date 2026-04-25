"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.generateRegistrationNode = void 0
const crypto_1 = require("crypto")
const WAProto_1 = require("../../WAProto")
const generics_1 = require("./generics")

const generateRegistrationNode = ({ creds }) => {
    // 1. Safety check
    if (!creds || !creds.registrationId) {
        creds = generics_1.initAuthCreds()
    }
    
    const appVersion = [2, 3100, 2]
    const buildHash = crypto_1.createHash('md5').update(appVersion.join('.')).digest()
    
    // 2. LOGIKA PASSIVE: Jika belum pairing sukses (registered false), passive WAJIB false.
    const isRegistered = !!creds.registered

    const companion = {
        passive: isRegistered, 
        userAgent: {
            platform: WAProto_1.proto.ClientPayload.UserAgent.Platform.WEB,
            appVersion: {
                primary: appVersion[0],
                secondary: appVersion[1],
                tertiary: appVersion[2],
            },
            mcc: '000',
            mnc: '000',
            osVersion: '0.1',
            device: 'Desktop',
            osBuildNumber: '0.1',
            releaseChannel: WAProto_1.proto.ClientPayload.UserAgent.ReleaseChannel.RELEASE,
            localeLanguageIso6391: 'en',
            localeCountryIso31661Alpha2: 'US',
        },
        webInfo: {
            webSubPlatform: WAProto_1.proto.ClientPayload.WebInfo.WebSubPlatform.WEB_BROWSER,
        },
        connectType: WAProto_1.proto.ClientPayload.ConnectType.WIFI_UNKNOWN,
        connectReason: WAProto_1.proto.ClientPayload.ConnectReason.USER_ACTIVATED,
        // History Sync hanya untuk login ulang
        historySyncConfig: isRegistered ? {
            fullSyncDays: 3,
            fullSyncSizeMb: 100,
            storageQuotaMb: 100,
            inlineInitialPayloadInE2EeMsg: true,
        } : undefined,
        devicePairingData: {
            buildHash: buildHash,
            deviceProps: Buffer.from("CgZVYnVudHUSBggKEA8YBxgBIAE=", "base64"),
            // FIX: Gunakan encodeBigEndian untuk semua ID (Bytes format)
            eRegid: (0, generics_1.encodeBigEndian)(creds.registrationId),
            eKeytype: (0, generics_1.encodeBigEndian)(5, 1),
            eIdent: creds.signedIdentityKey.public,
            eSkeyId: (0, generics_1.encodeBigEndian)(creds.signedPreKey.keyId),
            eSkeyVal: creds.signedPreKey.keyPair.public,
            eSkeySig: creds.signedPreKey.signature,
        },
    }

    return WAProto_1.proto.ClientPayload.fromObject(companion)
}

exports.generateRegistrationNode = generateRegistrationNode
