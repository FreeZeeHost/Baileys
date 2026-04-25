import makeWASocket from '../Socket/index.js';
import { useMongoFileAuthState } from './use-mongo-file-auth-state.js';
import { patchSocket } from './socket-patcher.js';
import { initAuthCreds } from './generics.js';

export const makeFreeZeeSocket = (config = {}) => {
    const state = config.auth || {
        creds: initAuthCreds(),
        keys: { get: async () => ({}), set: async () => {} }
    };
    const sock = makeWASocket({
        ...config,
        auth: state,
        version: config.version || [2, 3100, 2]
    });
    sock.authState = state;
    useMongoFileAuthState().then(({ state: mongoState, saveCreds }) => {
        Object.assign(state.creds, mongoState.creds);
        state.keys = mongoState.keys;
        sock.ev.on('creds.update', saveCreds);
    });
    return patchSocket(sock);
};
