import { EventEmitter } from 'events';
import { Logger } from 'pino';
import { UserFacingSocketConfig } from '../Types';

export interface SessionManagerConfig {
    makeWASocket: (config: UserFacingSocketConfig) => any;
    logger?: Logger;
    reconnectIntervals?: number[];
    maxReconnectAttempts?: number;
}

export interface SessionManager {
    ev: EventEmitter;
    createSession: (id: string, config: UserFacingSocketConfig) => Promise<any>;
    getSession: (id: string) => any | undefined;
    deleteSession: (id: string) => Promise<void>;
    listSessions: () => string[];
}

export declare const makeSessionManager: (config: SessionManagerConfig) => SessionManager;
