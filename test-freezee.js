const { makeFreeZeeSocket, Browsers } = require('./lib');
const pino = require('pino');

async function test() {
    console.log("--- TESTING FREEZEEHOST BAILEYS ---");
    
    try {
        // Langsung panggil wrapper sakti
        const sock = await makeFreeZeeSocket({
            logger: pino({ level: 'info' }),
            printQRInTerminal: true,
            browser: Browsers.ubuntu('Chrome')
        });

        console.log("[✓] Mencoba meminta kode pairing...");
        
        // Menggunakan nomor yang diberikan
        const code = await sock.requestPairingCode("6285604618277");
        
        console.log("\n==============================");
        console.log("KODE PAIRING ANDA:", code);
        console.log("==============================\n");
        console.log("[!] Masukkan kode tersebut ke WhatsApp di HP Anda.");

    } catch (err) {
        console.error("[✗] Terjadi kesalahan saat tes:", err.message);
    }
}

test();
