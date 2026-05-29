import { makeWASocket, useMultiFileAuthState, Browsers } from './lib/index.mjs';
import pino from 'pino';
import fs from 'fs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function start() {
    console.log('Starting pairing test...');
    if (fs.existsSync('temp_test_session')) {
        fs.rmSync('temp_test_session', { recursive: true, force: true });
    }
    const { state, saveCreds } = await useMultiFileAuthState('temp_test_session');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.ubuntu("Chrome"),
        printQRInTerminal: false
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.message;
            console.log('[-] Connection closed. Reason:', reason);
        } else if(connection === 'open') {
            console.log('[+] Connection opened!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    console.log('[*] Waiting 12 seconds for socket initialization...');
    await delay(12000);

    try {
        console.log('[*] Requesting pairing code for 6285102360656...');
        const code = await sock.requestPairingCode('6285102360656');
        console.log('[!] SUCCESS! Pairing code received:', code);
        
        // Clean up
        setTimeout(() => {
            fs.rmSync('temp_test_session', { recursive: true, force: true });
            process.exit(0);
        }, 2000);
    } catch (err) {
        console.error('[-] FAILED to request pairing code:', err.message);
        fs.rmSync('temp_test_session', { recursive: true, force: true });
        process.exit(1);
    }
}

start().catch(err => {
    console.error('Critical error:', err);
    process.exit(1);
});
