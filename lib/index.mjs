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
    prepareWAMessageMedia
} = pkg;

export const makeFreeZeeSocket = makeWASocket;

export default makeWASocket;
