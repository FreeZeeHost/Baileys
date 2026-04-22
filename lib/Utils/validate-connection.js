"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const boom_1 = require("@hapi/boom")
const crypto_1 = require("crypto")
const WAProto_1 = require("../../WAProto")
const Defaults_1 = require("../Defaults")
const WABinary_1 = require("../WABinary")
const crypto_2 = require("./crypto")
const generics_1 = require("./generics")
const signal_1 = require("./signal")

const getUserAgent = (config) => ({
    appVersion: { primary: config.version[0], secondary: config.version[1], tertiary: config.version[2] },
    platform: 14, releaseChannel: 0, osVersion: '0.1', device: 'Desktop', osBuildNumber: '0.1', 
    localeLanguageIso6391: 'en', mnc: '000', mcc: '000', localeCountryIso31661Alpha2: 'US'
})

const getClientPayload = (config) => ({
    connectType: 1, connectReason: 1, userAgent: getUserAgent(config),
    webInfo: { webSubPlatform: 0 }
})

const generateLoginNode = (userJid, config) => {
    const { user, device } = (0, WABinary_1.jidDecode)(userJid)
    return WAProto_1.proto.ClientPayload.fromObject({
        ...getClientPayload(config),
        passive: true, pull: true, username: +user, device: device, lidDbMigrated: false
    })
}

const generateRegistrationNode = ({ registrationId, signedPreKey, signedIdentityKey }, config) => {
    const appVersionBuf = crypto_1.createHash('md5').update(config.version.join('.')).digest()
    const companion = {
        os: config.browser[0],
        platformType: 1,
        requireFullSync: config.syncFullHistory,
        version: { primary: 10, secondary: 15, tertiary: 7 }
    }
    const companionProto = WAProto_1.proto.DeviceProps.encode(companion).finish()
    return WAProto_1.proto.ClientPayload.fromObject({
        ...getClientPayload(config),
        passive: false, pull: false,
        devicePairingData: {
            buildHash: appVersionBuf, deviceProps: companionProto,
            eRegid: (0, generics_1.encodeBigEndian)(registrationId),
            eKeytype: Defaults_1.KEY_BUNDLE_TYPE, eIdent: signedIdentityKey.public,
            eSkeyId: (0, generics_1.encodeBigEndian)(signedPreKey.keyId, 3),
            eSkeyVal: signedPreKey.keyPair.public, eSkeySig: signedPreKey.signature
        }
    })
}

const configureSuccessfulPairing = (stanza, { advSecretKey, signedIdentityKey, signalIdentities }) => {
    const msgId = stanza.attrs.id;
    const pairSuccessNode = (0, WABinary_1.getBinaryNodeChild)(stanza, 'pair-success');
    const deviceIdentityNode = (0, WABinary_1.getBinaryNodeChild)(pairSuccessNode, 'device-identity');
    const platformNode = (0, WABinary_1.getBinaryNodeChild)(pairSuccessNode, 'platform');
    const deviceNode = (0, WABinary_1.getBinaryNodeChild)(pairSuccessNode, 'device');
    const businessNode = (0, WABinary_1.getBinaryNodeChild)(pairSuccessNode, 'biz');
    if (!deviceIdentityNode || !deviceNode) throw new boom_1.Boom('Missing device-identity or device in pair success node', { data: stanza });
    const bizName = businessNode?.attrs.name;
    const jid = deviceNode.attrs.jid;
    const lid = deviceNode.attrs.lid;
    const { details, hmac, accountType } = WAProto_1.proto.ADVSignedDeviceIdentityHMAC.decode(deviceIdentityNode.content);
    let hmacPrefix = Buffer.from([]);
    if (accountType !== undefined && accountType === 1) hmacPrefix = Defaults_1.WA_ADV_HOSTED_ACCOUNT_SIG_PREFIX;
    const advSign = (0, crypto_2.hmacSign)(Buffer.concat([hmacPrefix, details]), Buffer.from(advSecretKey, 'base64'));
    if (Buffer.compare(hmac, advSign) !== 0) throw new boom_1.Boom('Invalid account signature');
    const account = WAProto_1.proto.ADVSignedDeviceIdentity.decode(details);
    const { accountSignatureKey, accountSignature, details: deviceDetails } = account;
    const deviceIdentity = WAProto_1.proto.ADVDeviceIdentity.decode(deviceDetails);
    const accountSignaturePrefix = deviceIdentity.deviceType === 1 ? Defaults_1.WA_ADV_HOSTED_ACCOUNT_SIG_PREFIX : Defaults_1.WA_ADV_ACCOUNT_SIG_PREFIX;
    const accountMsg = Buffer.concat([accountSignaturePrefix, deviceDetails, signedIdentityKey.public]);
    if (!(0, crypto_2.Curve).verify(accountSignatureKey, accountMsg, accountSignature)) throw new boom_1.Boom('Failed to verify account signature');
    const deviceMsg = Buffer.concat([Defaults_1.WA_ADV_DEVICE_SIG_PREFIX, deviceDetails, signedIdentityKey.public, accountSignatureKey]);
    account.deviceSignature = (0, crypto_2.Curve).sign(signedIdentityKey.private, deviceMsg);
    const identity = (0, signal_1.createSignalIdentity)(lid, accountSignatureKey);
    const accountEnc = encodeSignedDeviceIdentity(account, false);
    const reply = { tag: 'iq', attrs: { to: WABinary_1.S_WHATSAPP_NET, type: 'result', id: msgId }, content: [{ tag: 'pair-device-sign', attrs: {}, content: [{ tag: 'device-identity', attrs: { 'key-index': deviceIdentity.keyIndex.toString() }, content: accountEnc }] }] };
    return { creds: { account, me: { id: jid, name: bizName, lid }, signalIdentities: [...(signalIdentities || []), identity], platform: platformNode?.attrs?.name }, reply };
}

const encodeSignedDeviceIdentity = (account, includeSignatureKey) => {
    account = { ...account };
    if (!includeSignatureKey || !account.accountSignatureKey?.length) account.accountSignatureKey = null;
    return WAProto_1.proto.ADVSignedDeviceIdentity.encode(account).finish();
}

module.exports = { generateLoginNode, generateRegistrationNode, configureSuccessfulPairing, encodeSignedDeviceIdentity }
