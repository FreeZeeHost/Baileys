const { makeFreeZeeSocket } = require('./lib');

async function test() {
    console.log("--- FINAL TEST: ULTRA PLUG-AND-PLAY ---");
    try {
        const sock = await makeFreeZeeSocket();
        console.log("[✓] Mencoba meminta kode pairing (Menunggu 5 detik agar enkripsi matang)...");
        const code = await sock.requestPairingCode("6285604618277");
        console.log("\n==============================");
        console.log("KODE PAIRING ANDA:", code);
        console.log("==============================\n");
    } catch (err) {
        console.error("[✗] Gagal:", err.message);
    }
}
test();
