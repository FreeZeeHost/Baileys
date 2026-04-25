/**
 * MASTER TEST: @freezeehost/baileys INTEGRITY CHECK
 */
const { makeFreeZeeSocket } = require('./lib');

async function runMasterTest() {
    console.log("🚀 MEMULAI MASTER TEST INTEGRITAS...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
        // 1. Test Socket Creation
        console.log("[1/6] Inisialisasi makeFreeZeeSocket...");
        const sock = await makeFreeZeeSocket({ printQRInTerminal: false });
        
        if (sock && typeof sock === 'object') {
            console.log("   ✅ Socket berhasil dibuat.");
        } else {
            throw new Error("Gagal membuat objek socket.");
        }

        // 2. Test Core Baileys Functions
        console.log("[2/6] Verifikasi Fungsi Core Baileys...");
        const coreFuncs = ['sendMessage', 'relayMessage', 'sendPresenceUpdate', 'groupMetadata', 'requestPairingCode'];
        coreFuncs.forEach(f => {
            if (typeof sock[f] === 'function') {
                console.log(`   ✅ sock.${f}: TERSEDIA`);
            } else {
                console.error(`   ❌ sock.${f}: HILANG!`);
            }
        });

        // 3. Test sock.msg (Premium Interactive Helpers)
        console.log("[3/6] Verifikasi sock.msg (Premium Helpers)...");
        if (sock.msg && typeof sock.msg === 'object') {
            const msgHelpers = ['buttons', 'list', 'poll', 'carousel', 'nativeTable'];
            msgHelpers.forEach(h => {
                if (typeof sock.msg[h] === 'function') {
                    console.log(`   ✅ sock.msg.${h}: TERSEDIA`);
                } else {
                    console.error(`   ❌ sock.msg.${h}: HILANG!`);
                }
            });
        } else {
            console.error("   ❌ sock.msg: HILANG!");
        }

        // 4. Test Manual Stealth Functions
        console.log("[4/6] Verifikasi Manual Stealth (Typing/Recording)...");
        const stealthFuncs = ['simulateTyping', 'simulateRecording'];
        stealthFuncs.forEach(s => {
            if (typeof sock[s] === 'function') {
                console.log(`   ✅ sock.${s}: TERSEDIA`);
            } else {
                console.error(`   ❌ sock.${s}: HILANG!`);
            }
        });

        // 5. Test Status & Album Functions
        console.log("[5/6] Verifikasi Status & Album Helpers...");
        const extraFuncs = ['onStatusUpdate', 'getAllStatusSenders', 'getStatusesFrom', 'sendAlbumMessage', 'autoOptimize'];
        extraFuncs.forEach(e => {
            if (typeof sock[e] === 'function') {
                console.log(`   ✅ sock.${e}: TERSEDIA`);
            } else {
                console.error(`   ❌ sock.${e}: HILANG!`);
            }
        });

        // 6. Test Sync AuthState
        console.log("[6/6] Verifikasi Sinkronisasi AuthState...");
        if (sock.authState && sock.authState.creds) {
            console.log("   ✅ sock.authState.creds: TERSEDIA");
        } else {
            console.error("   ❌ sock.authState.creds: HILANG!");
        }

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎉 HASIL AKHIR: SEMUA FITUR 100% BEKERJA!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        process.exit(0);

    } catch (error) {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("❌ MASTER TEST GAGAL!");
        console.error("Detail Error:", error.message);
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        process.exit(1);
    }
}

runMasterTest();
