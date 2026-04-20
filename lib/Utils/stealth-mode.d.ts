import { AnyWASocket, WAPresence } from '../Types';

export interface StealthOptions {
    /** Milliseconds of delay per character in text messages (default: 40) */
    typingDelayPerChar?: number;
    /** Maximum delay in milliseconds (default: 3000) */
    maxTypingDelay?: number;
    /** Minimum delay in milliseconds (default: 500) */
    minTypingDelay?: number;
    /** Automatically set presence to 'available' before sending (default: true) */
    autoPresence?: boolean;
}

/**
 * Wraps the socket with stealth features to humanize interactions
 * and reduce the risk of being banned.
 */
export declare const withStealthMode: (sock: any, options?: StealthOptions) => any;
