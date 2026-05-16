import pkg from './index.js';
export const {
    makeWASocket,
    proto,
    generateWAMessageFromContent,
    generateWAMessage,
    generateWAMessageContent,
    extractMessageContent,
    getContentType,
    normalizeMessageContent,
    jidNormalizedUser,
    jidDecode,
    jidEncode,
    areJidsSameUser,
    DisconnectReason,
    Browsers,
    WA_DEFAULT_EPHEMERAL,
    MessageType,
    MessageOptions,
    MIMETYPE_MAP,
    downloadMediaMessage,
    prepareWAMessageMedia,
    patchSocket,
    useMongoFileAuthState,
    useMultiFileAuthState,
    makeFreeZeeSocket,
    smsg,
    fetchLatestBaileysVersion
} = pkg;

export default makeWASocket;
