import { AnyWASocket, WAMessage } from '../Types';

export type MiddlewareFunction = (
    message: WAMessage & { drop: () => void },
    next: () => Promise<void>
) => Promise<void> | void;

/**
 * Adds an Express-like middleware system to Baileys for processing messages
 * at high speed before they are emitted to the main application.
 */
export declare const withMiddleware: (sock: any) => any;
