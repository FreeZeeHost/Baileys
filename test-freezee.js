import { makeFreeZeeSocket, useMongoFileAuthState } from './lib/index.js';

async function start() {
    console.log('--- MEMULAI TES PAIRING KEMENANGAN KE 6285604618277 ---');
    try {
        const { state, saveCreds } = await useMongoFileAuthState();
        
        // Pastikan me dihapus jika belum teregistrasi agar tidak terjadi error 401 saat meminta pairing code
        if (!state.creds.registered) {
            state.creds.me = undefined;
        }

        const sock = makeFreeZeeSocket({
            auth: state,
            printQRInTerminal: false,
            browser: ['Ubuntu', 'Chrome', '22.04.4']
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                console.log('Connection closed:', lastDisconnect?.error?.message);
                if (lastDisconnect?.error) {
                    console.log('Reason:', lastDisconnect.error?.output?.statusCode);
                    console.log('Details:', lastDisconnect.error?.data);
                }
                if (lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log('Reconnecting in 5s...');
                    setTimeout(start, 5000);
                }
            } else if (connection === 'open') {
                console.log('==============================');
                console.log('[✓] KONEKSI SUKSES! BOT AKTIF!');
                console.log('==============================');
                try {
                    const meId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    await sock.sendMessage(meId, { text: '[✓] Laporan: Bot berhasil aktif dan online!' });
                    console.log('[✓] Pesan laporan berhasil dikirim ke diri sendiri.');
                    process.exit(0);
                } catch(err) {
                    console.error('[✗] Gagal mengirim pesan laporan:', err.message);
                    process.exit(1);
                }
            }
        });

        if (!sock.authState.creds.registered) {
            console.log('Bot aktif. Mencoba meminta kode pairing...');
            setTimeout(async () => {
                try {
                    const code = await sock.requestPairingCode('6285604618277');
                    console.log('==============================');
                    console.log('KODE PAIRING ANDA:', code);
                    console.log('==============================');
                } catch (e) {
                    console.error('ERROR PAIRING:', e.message);
                }
            }, 6000);
        } else {
             console.log('Sesi sudah terdaftar, menunggu koneksi OPEN...');
        }
    } catch(e) {
        console.error('CRITICAL ERROR:', e.message);
        process.exit(1);
    }
}
start();
