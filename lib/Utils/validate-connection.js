const getUserAgent = (config) => {
    return {
        appVersion: {
            primary: config.version[0],
            secondary: config.version[1],
            tertiary: config.version[2],
        },
        platform: WAProto_1.proto.ClientPayload.UserAgent.Platform.WEB,
        releaseChannel: WAProto_1.proto.ClientPayload.UserAgent.ReleaseChannel.RELEASE,
        osVersion: '0.1',
        device: 'Desktop',
        osBuildNumber: '0.1',
        localeLanguageIso6391: 'en',
        mnc: '000',
        mcc: '000',
        localeCountryIso31661Alpha2: config.countryCode
    }
}

const getPlatformType = (platform) => {
    const platformType = platform.toUpperCase()
    // Force specific numeric values if needed, but here we use enum names
    return WAProto_1.proto.DeviceProps.PlatformType[platformType] || WAProto_1.proto.DeviceProps.PlatformType.DESKTOP
}

const generateRegistrationNode = ({ registrationId, signedPreKey, signedIdentityKey }, config) => {
    const appVersionBuf = crypto_1.createHash('md5')
        .update(config.version.join('.'))
        .digest()
    
    // Ensure browser name is something standard like 'Chrome'
    const browserName = config.browser[1] || 'Chrome'
    
    const companion = {
        os: config.browser[0],
        platformType: getPlatformType(browserName),
        requireFullSync: config.syncFullHistory,
    }
    
    const companionProto = WAProto_1.proto.DeviceProps.encode(companion).finish()
    const registerPayload = {
        ...getClientPayload(config),
        passive: false,
        pull: false,
        devicePairingData: {
            buildHash: appVersionBuf,
            deviceProps: companionProto,
            eRegid: generics_1.encodeBigEndian(registrationId),
            eKeytype: Defaults_1.KEY_BUNDLE_TYPE,
            eIdent: signedIdentityKey.public,
            eSkeyId: generics_1.encodeBigEndian(signedPreKey.keyId, 3),
            eSkeyVal: signedPreKey.keyPair.public,
            eSkeySig: signedPreKey.signature,
        },
    }
    return WAProto_1.proto.ClientPayload.fromObject(registerPayload)
}