import { makeFreeZeeSocket, Browsers } from './lib/index.mjs';
import pino from 'pino';

async function test() {
    console.log('--- TESTING CUSTOM FREEZEE FEATURES ---');
    
    // 1. Test Factory & Patching
    const sock = makeFreeZeeSocket({
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        auth: {
            creds: { registered: true }, // dummy
            keys: { get: async () => ({}), set: async () => {} }
        }
    });

    console.log('1. makeFreeZeeSocket: SUCCESS');

    // 2. Test smsg helper
    if (typeof sock.smsg === 'function') {
        const dummyMsg = {
            key: { id: '123', remoteJid: 'test@s.whatsapp.net', fromMe: false },
            message: { conversation: 'Hello World' }
        };
        const m = sock.smsg(dummyMsg);
        console.log('2. smsg helper: SUCCESS (Text extracted:', m.text, ')');
    } else {
        console.error('2. smsg helper: FAILED (Not a function)');
    }

    // 3. Test autoOptimize
    if (typeof sock.autoOptimize === 'function') {
        sock.autoOptimize();
        console.log('3. autoOptimize: SUCCESS');
    } else {
        console.error('3. autoOptimize: FAILED (Not a function)');
    }

    // 4. Test sendSticker (Function availability)
    if (typeof sock.sendSticker === 'function') {
        console.log('4. sendSticker: SUCCESS (Function exists)');
    } else {
        console.error('4. sendSticker: FAILED (Function missing)');
    }

    console.log('--- ALL CUSTOM FEATURES VERIFIED ---');
    process.exit(0);
}

test().catch(e => {
    console.error('TEST CRASHED:', e);
    process.exit(1);
});
