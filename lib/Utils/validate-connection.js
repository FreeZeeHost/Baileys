"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.generateRegistrationNode = void 0

const WAProto_1 = require("../../WAProto")
const crypto_1 = require("crypto")

const generateRegistrationNode = ({ creds }) => {
    if (!creds) {
        creds = require("./generics").initAuthCreds()
    }

    const appVersion = [2, 3100, 2]
    const buildHash = (0, crypto_1.createHash)('md5').update(appVersion.join('.')).digest()

    const companion = {
        passive: true, // Wajib TRUE untuk stabilitas 2.3100.2
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
        // FIX LOKASI ODN: Menambahkan History Sync Config
        historySyncConfig: {
            fullSyncDays: 3,
            fullSyncSizeMb: 100,
            storageQuotaMb: 100,
            inlineInitialPayloadInE2EeMsg: true
        },
        devicePairingData: {
            buildHash: buildHash,
            deviceProps: Buffer.from("CgZVYnVudHUSBggKEA8YBxgBIAE=", "base64"),
            eRegid: creds.registrationId || 0,
            eKeytype: 5,
            eIdent: (creds.signedIdentityKey?.public) || Buffer.alloc(32),
            eSkeyId: (creds.signedPreKey?.keyId) || 0,
            eSkeyVal: (creds.signedPreKey?.keyPair?.public) || Buffer.alloc(32),
            eSkeySig: (creds.signedPreKey?.signature) || Buffer.alloc(64),
        },
    }

    return WAProto_1.proto.ClientPayload.fromObject(companion)
}

exports.generateRegistrationNode = generateRegistrationNode
