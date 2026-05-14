import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { makeCommunitiesSocket } from './communities.js';

export * from './socket.js';
export * from './messages-send.js';
export * from './messages-recv.js';
export * from './chats.js';
export * from './groups.js';
export * from './newsletter.js';
export * from './business.js';
export * from './community.js';
export * from './usync.js';

const makeWASocket = (config) => {
    const newConfig = {
        ...DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    if (config.shouldSyncHistoryMessage === undefined) {
        newConfig.shouldSyncHistoryMessage = () => !!newConfig.syncFullHistory;
    }
    return makeCommunitiesSocket(newConfig);
};

export { makeWASocket };
export default makeWASocket;
