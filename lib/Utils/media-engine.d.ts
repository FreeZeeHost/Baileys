import { AnyWASocket } from '../Types';

export interface MediaEngineOptions {
    /** Maximum number of media items to keep in cache (default: 100) */
    maxCacheItems?: number;
    /** Time to live for cache items in milliseconds (default: 1 hour) */
    cacheTtlMs?: number;
}

/**
 * Adds an Integrated Media Engine to the socket.
 * Provides `downloadMedia` with auto-caching and `sendSticker` naturally.
 */
export declare const withMediaEngine: (sock: any, options?: MediaEngineOptions) => {
    downloadMedia: (message: any, type: string) => Promise<Buffer>;
    sendSticker: (jid: string, bufferOrUrl: string | Buffer, options?: any) => Promise<any>;
    sendStickerPack: (jid: string, stickers: (string | Buffer)[], options?: { packname?: string, author?: string, delay?: number, quoted?: any, [key: string]: any }) => Promise<any[]>;
    sendAlbumMessage: (jid: string, medias: any[], options?: { delay?: number, quoted?: any, [key: string]: any }) => Promise<any[]>;
};
