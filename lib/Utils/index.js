"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const generics = require("./generics.js");
const messages = require("./messages.js");
const history = require("./history.js");
const chatUtils = require("./chat-utils.js");

// Re-export everything from generics
Object.assign(exports, generics);

// Re-export from other modules with fallback
Object.assign(exports, messages);
Object.assign(exports, history);
Object.assign(exports, chatUtils);

// Primary Entry Points
exports.makeFreeZeeSocket = require("./freezee-socket.js").makeFreeZeeSocket;
exports.patchSocket = require("./socket-patcher.js").patchSocket;
exports.useMongoFileAuthState = require("./use-mongo-file-auth-state.js").useMongoFileAuthState;

// Final Named Export Mapping (For ESM Node.js V25 detection)
exports.delay = generics.delay;
exports.toNumber = generics.toNumber;
exports.unixTimestampSeconds = generics.unixTimestampSeconds;
exports.initAuthCreds = generics.initAuthCreds;
exports.Curve = generics.Curve;
exports.generateSignalPubKey = generics.generateSignalPubKey;
exports.bytesToCrockford = generics.bytesToCrockford;
exports.generateRegistrationId = generics.generateRegistrationId;
exports.generateMessageID = generics.generateMessageID;
exports.generateMessageIDV2 = generics.generateMessageIDV2;
exports.bindWaitForConnectionUpdate = generics.bindWaitForConnectionUpdate;
exports.promiseTimeout = generics.promiseTimeout;
exports.sha256 = generics.sha256;
exports.hmacSha256 = generics.hmacSha256;
exports.hmacSign = generics.hmacSign;
exports.aesEncryptGCM = generics.aesEncryptGCM;
exports.aesDecryptGCM = generics.aesDecryptGCM;
exports.aesEncrypt = generics.aesEncrypt;
exports.aesDecrypt = generics.aesDecrypt;
