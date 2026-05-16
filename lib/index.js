"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const Socket_1 = __importDefault(require("./Socket"));
const WAProto = require("../WAProto");
const Types = require("./Types");

// Explicitly require sub-modules for ESM static detection
const { fetchLatestBaileysVersion } = require("./Utils/generics");
const { useMultiFileAuthState } = require("./Utils/use-multi-file-auth-state");
const { useMongoFileAuthState } = require("./Utils/use-mongo-file-auth-state");
const { jidNormalizedUser, jidDecode, jidEncode, areJidsSameUser } = require("./WABinary/jid-utils");
const { generateWAMessageFromContent, generateWAMessage, generateWAMessageContent, extractMessageContent, getContentType, normalizeMessageContent, downloadMediaMessage, prepareWAMessageMedia } = require("./Utils/messages");
const { Browsers } = require("./Utils/browser-utils");
const { patchSocket } = require("./Utils/socket-patcher");

// Explicit exports for ESM static detection
exports.makeWASocket = Socket_1.default;
exports.proto = WAProto.proto;
exports.fetchLatestBaileysVersion = fetchLatestBaileysVersion;
exports.useMultiFileAuthState = useMultiFileAuthState;
exports.useMongoFileAuthState = useMongoFileAuthState;
exports.jidNormalizedUser = jidNormalizedUser;
exports.generateWAMessageFromContent = generateWAMessageFromContent;
exports.generateWAMessage = generateWAMessage;
exports.generateWAMessageContent = generateWAMessageContent;
exports.extractMessageContent = extractMessageContent;
exports.getContentType = getContentType;
exports.normalizeMessageContent = normalizeMessageContent;
exports.downloadMediaMessage = downloadMediaMessage;
exports.prepareWAMessageMedia = prepareWAMessageMedia;
exports.jidDecode = jidDecode;
exports.jidEncode = jidEncode;
exports.areJidsSameUser = areJidsSameUser;
exports.DisconnectReason = Types.DisconnectReason;
exports.Browsers = Browsers;
exports.patchSocket = patchSocket;
exports.makeFreeZeeSocket = Socket_1.default;
exports.smsg = global.smsg;

// Fallback for everything else
__exportStar(require("../WAProto"), exports);
__exportStar(require("./Utils"), exports);
__exportStar(require("./Types"), exports);
__exportStar(require("./Store"), exports);
__exportStar(require("./Defaults"), exports);
__exportStar(require("./WABinary"), exports);
__exportStar(require("./WAM"), exports);
__exportStar(require("./WAUSync"), exports);

exports.default = Socket_1.default;
