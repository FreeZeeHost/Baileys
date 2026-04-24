"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.generateRegistrationNode = void 0

const WAProto_1 = require("../../WAProto")
const crypto_1 = require("crypto")

const generateRegistrationNode = ({ creds }) => {
    const appVersion = [2, 3100, 2]
    const buildHash = (0, crypto_1.createHash)('md5').update(appVersion.join('.')).digest()

    const companion = {
        passive: true, 
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
        devicePairingData: {
            buildHash: buildHash,
            deviceProps: Buffer.from("CgZVYnVudHUSBggKEA8YBxgBIAE=", "base64"),
            eRegid: creds.registrationId,
            eKeytype: 5,
            eIdent: creds.signedIdentityKey.public,
            eSkeyId: creds.signedPreKey.keyId,
            eSkeyVal: creds.signedPreKey.keyPair.public,
            eSkeySig: creds.signedPreKey.signature,
        },
    }

    return WAProto_1.proto.ClientPayload.fromObject(companion)
}

exports.generateRegistrationNode = generateRegistrationNode
