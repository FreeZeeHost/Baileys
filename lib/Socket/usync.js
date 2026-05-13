import { makeCommunitiesSocket } from './communities.js';

export const makeUSyncSocket = (config) => {
    return makeCommunitiesSocket(config);
};
