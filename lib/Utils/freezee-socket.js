const makeWASocket = require('../Socket').default;
const { useMongoFileAuthState } = require('./use-mongo-file-auth-state');
const { patchSocket } = require('./socket-patcher');
const { initAuthCreds } = require('./auth-utils');

exports.makeFreeZeeSocket = (config = {}) => {
    const state = config.auth || {
        creds: initAuthCreds(),
        keys: { get: async () => ({}), set: async () => {} }
    };
    const sock = makeWASocket({
        ...config,
        auth: state,
        version: config.version || [2, 3000, 1035194821]
    });
    sock.authState = state;
    
    const patchedSock = patchSocket(sock);

    if (!config.auth) {
        useMongoFileAuthState().then(({ state: mongoState, saveCreds }) => {
            Object.assign(state.creds, mongoState.creds);
            state.keys = mongoState.keys;
            patchedSock.ev.on('creds.update', saveCreds);
        });
    }
    
    return patchedSock;
};
