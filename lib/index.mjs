import Baileys from './index.js';
const {
    makeWASocket,
    proto,
    generateWAMessageFromContent,
    extractMessageContent,
    getContentType,
    jidNormalizedUser,
    DisconnectReason,
    Browsers
} = Baileys;

export {
    makeWASocket,
    proto,
    generateWAMessageFromContent,
    extractMessageContent,
    getContentType,
    jidNormalizedUser,
    DisconnectReason,
    Browsers
};

export const makeFreeZeeSocket = makeWASocket;
export default makeWASocket;
