"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("../Socket/index.js");
const use_mongo = require("./use-mongo-file-auth-state.js");
const patcher = require("./socket-patcher.js");
const generics = require("./generics.js");

exports.makeFreeZeeSocket = (config = {}) => {
    const state = config.auth || {
        creds: generics.initAuthCreds(),
        keys: { get: async () => ({}), set: async () => {} }
    };
    const sock = (0, socket_1.default)({
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2]
    });
    sock.authState = state;
    
    const patchedSock = patcher.patchSocket(sock);

    use_mongo.useMongoFileAuthState().then(({ state: mongoState, saveCreds }) => {
        Object.assign(state.creds, mongoState.creds);
        state.keys = mongoState.keys;
        patchedSock.ev.on('creds.update', saveCreds);
    });
    
    return patchedSock;
};
