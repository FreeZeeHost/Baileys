"use strict";
// STATIC EXPORTS FOR ESM COMPATIBILITY
const Socket = require("./Socket/index.js");
const WABinary = require("./WABinary/index.js");
const Utils = require("./Utils/index.js");
const Types = require("./Types/index.js");
const Defaults = require("./Defaults/index.js");
const Store = require("./Store/index.js");
const WAProto = require("../WAProto/index.js");

const freezeeSocket = require("./Utils/freezee-socket.js");
const socketPatcher = require("./Utils/socket-patcher.js");
const useMongo = require("./Utils/use-mongo-file-auth-state.js");

// Export Main Socket Methods
exports.default = freezeeSocket.makeFreeZeeSocket;
exports.makeWASocket = freezeeSocket.makeFreeZeeSocket;
exports.makeFreeZeeSocket = freezeeSocket.makeFreeZeeSocket;
exports.makeConn = freezeeSocket.makeFreeZeeSocket;
exports.makeClient = freezeeSocket.makeFreeZeeSocket;
exports.makeWA = freezeeSocket.makeFreeZeeSocket;
exports.patchSocket = socketPatcher.patchSocket;
exports.useMongoFileAuthState = useMongo.useMongoFileAuthState;
exports.useMultiFileAuthState = useMongo.useMongoFileAuthState; // Override Default

// Dynamically bind all other methods to static exports
Object.assign(exports, Socket);
Object.assign(exports, WABinary);
Object.assign(exports, Utils);
Object.assign(exports, Types);
Object.assign(exports, Defaults);
Object.assign(exports, Store);
exports.WAProto = WAProto;

// Explicit bindings for ESM static analysis (Node 16+)
exports.areJidsSameUser = WABinary.areJidsSameUser;
exports.jidDecode = WABinary.jidDecode;
exports.jidEncode = WABinary.jidEncode;
exports.isJidGroup = WABinary.isJidGroup;
exports.isJidUser = WABinary.isJidUser;
exports.isJidBroadcast = WABinary.isJidBroadcast;
exports.isJidNewsletter = WABinary.isJidNewsletter;
exports.jidNormalizedUser = WABinary.jidNormalizedUser;

exports.extractMessageContent = Utils.extractMessageContent;
exports.getContentType = Utils.getContentType;
exports.generateWAMessage = Utils.generateWAMessage;
exports.generateWAMessageFromContent = Utils.generateWAMessageFromContent;
exports.generateMessageID = Utils.generateMessageID;
exports.downloadMediaMessage = Utils.downloadMediaMessage;
exports.downloadContentFromMessage = Utils.downloadContentFromMessage;
exports.prepareWAMessageMedia = Utils.prepareWAMessageMedia;
exports.normalizeMessageContent = Utils.normalizeMessageContent;
exports.getDevice = WABinary.getDevice;

exports.delay = Utils.delay;
exports.fetchLatestBaileysVersion = Utils.fetchLatestBaileysVersion;
exports.initAuthCreds = Utils.initAuthCreds;
exports.BufferJSON = Utils.BufferJSON;
exports.DisconnectReason = Types.DisconnectReason;
exports.S_WHATSAPP_NET = WABinary.S_WHATSAPP_NET;

// If we need to support specific others:
for (const key of Object.keys(WABinary)) { exports[key] = WABinary[key]; }
for (const key of Object.keys(Utils)) { exports[key] = Utils[key]; }
for (const key of Object.keys(Types)) { exports[key] = Types[key]; }
