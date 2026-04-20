import { StealthOptions } from './stealth-mode';
import { MediaEngineOptions } from './media-engine';
import { Logger } from 'pino';

export interface PatchOptions {
    stealth?: StealthOptions;
    media?: MediaEngineOptions;
    logger?: Logger;
}

/**
 * The ultimate patcher for Baileys.
 * Applies all advanced features (Stealth, Queue, Middleware, Media Engine) 
 * and adds simplified aliases for group/newsletter functions.
 */
export declare const patchSocket: (sock: any, options?: PatchOptions) => any & {
    msg: {
        text: (text: string) => any;
        image: (image: any, caption?: string) => any;
        video: (video: any, caption?: string) => any;
        sticker: (sticker: any) => any;
        document: (document: any, caption?: string, fileName?: string) => any;
        contact: (displayName: string, phoneNumber: string) => any;
        location: (degreesLatitude: number, degreesLongitude: number, name?: string) => any;
        poll: (name: string, values: string[], selectableCount?: number) => any;
        buttons: (text: string, buttons: { id: string, text: string }[], footer?: string, header?: string) => any;
        list: (text: string, buttonText: string, sections: { title: string, rows: { title: string, description?: string, id: string }[] }[], title?: string, footer?: string) => any;
        interactive: (content: string, buttons: { name: string, params?: any }[], header?: string, footer?: string) => any;
        table: (headers: string[], rows: any[][]) => any;
        nativeTable: (content: string, tableData: { text: string, bold?: boolean, align?: "left" | "center" | "right" }[][], header?: string, footer?: string) => any;
        proto: any;
    };
    groupAdd: (jid: string, participants: string[]) => Promise<any>;
    groupRemove: (jid: string, participants: string[]) => Promise<any>;
    groupPromote: (jid: string, participants: string[]) => Promise<any>;
    groupDemote: (jid: string, participants: string[]) => Promise<any>;
    getNewsletter: (idOrInvite: string) => Promise<any>;
    autoRead: () => void;
    sendRichMessage: (jid: string, text: string, options?: {
        title?: string,
        body?: string,
        thumbnailUrl?: string,
        sourceUrl?: string,
        renderLargerThumbnail?: boolean,
        quoted?: any,
        mentions?: string[],
        [key: string]: any
    }) => Promise<any>;
};
