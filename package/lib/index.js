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
const Utils = require("./Utils");
const WABinary = require("./WABinary");

// Explicit exports for ESM static detection (Mapping from folder indexes)
exports.makeWASocket = Socket_1.default;
exports.proto = WAProto.proto;
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion;
exports.useMultiFileAuthState = Utils.useMultiFileAuthState;
exports.useMongoFileAuthState = Utils.useMongoFileAuthState;
exports.jidNormalizedUser = WABinary.jidNormalizedUser;
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent;
exports.generateWAMessage = Utils.generateWAMessage;
exports.generateWAMessageContent = Utils.generateWAMessageContent;
exports.extractMessageContent = Utils.extractMessageContent;
exports.getContentType = Utils.getContentType;
exports.normalizeMessageContent = Utils.normalizeMessageContent;
exports.downloadMediaMessage = Utils.downloadMediaMessage;
exports.downloadContentFromMessage = Utils.downloadContentFromMessage;
exports.toBuffer = Utils.toBuffer;
exports.getDevice = Utils.getDevice;
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia;
exports.jidDecode = WABinary.jidDecode;
exports.jidEncode = WABinary.jidEncode;
exports.areJidsSameUser = WABinary.areJidsSameUser;
exports.DisconnectReason = Types.DisconnectReason;
exports.Browsers = Utils.Browsers;
exports.patchSocket = Utils.patchSocket;
exports.makeFreeZeeSocket = Utils.makeFreeZeeSocket;
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
