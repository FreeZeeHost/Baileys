const { makeFreeZeeSocket, useMultiFileAuthState, DisconnectReason } = require('./lib/index.js');
const pino = require('pino');

async function startBot() {
    console.log('Starting FreeZeeHost Baileys Ultimate Test Bot...');
    const { state, saveCreds } = await useMultiFileAuthState('./session_test');
    
    const conn = makeFreeZeeSocket({
        auth: state,
        printQRInTerminal: true,
        usePairingCode: false,
        logger: pino({ level: 'info' })
    });

    conn.ev.on('pairing-code', (code) => {
        console.log('===================================================');
        console.log(`🔑 PAIRING CODE: ${code}`);
        console.log('===================================================');
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('===================================================');
            console.log('✅ ULTIMATE TEST BOT IS ONLINE!');
            console.log('===================================================');
        } else if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`❌ Connection closed. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                startBot();
            }
        }
    });

    // --- 🛡️ ANTI-DELETE LISTENER ---
    const deletedCache = new Map();
    conn.ev.on('messages.upsert', ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const m of messages) {
            const s = conn.smsg(m);
            if (s.message) {
                deletedCache.set(`${s.chat}:${s.id}`, s);
            }
        }
    });
    
    conn.ev.on('message.delete', ({ jid, id }) => {
        const original = deletedCache.get(`${jid}:${id}`);
        if (original) {
            conn.sendMessage(jid, { 
                text: `⚠️ *Anti-Delete Detected!*\n\n*Pengirim:* @${original.sender.split('@')[0]}\n*Pesan Terhapus:* "${original.text || 'Bukan pesan teks/media'}"`,
                mentions: [original.sender]
            }, { quoted: original });
        }
    });

    // --- 🚀 NATIVE & CORE FEATURES ---

    // 1. Text & Basic Commands
    const sendMenu = (m) => {
        const menuText = `🤖 *FREEZEEHOST BAILEYS ULTIMATE TEST BOT* 🤖
Berikut adalah daftar seluruh fitur yang tersedia untuk diuji, dikategorikan secara jelas:

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 *1. NATIVE & CORE FEATURES*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• *.menu* atau *.help* - Menampilkan daftar perintah ini
• *.ping* - Cek respon bot
• *.media* - Kirim Gambar, Audio, dan Dokumen
• *.buttons* - Kirim Pesan Interaktif Tombol (Button)
• *.list* - Kirim Pesan Interaktif Daftar (Section List)
• *.poll* - Kirim Pesan Polling Interaktif
• *.groupinfo* - Cek informasi grup & status admin (Khusus Grup)
• *.settings* - Konfigurasi Auto-Read, Anti-Call, Auto-Typing & Auto-VN
• *.autotyping <on/off>* - Toggle simulasi mengetik otomatis
• *.autovn <on/off>* - Toggle simulasi merekam VN otomatis
• *.replytyping <teks>* - Kirim balasan dengan simulasi mengetik (1.5 detik)
• *.replyvn <url>* - Kirim VN dengan simulasi merekam (2 detik)
• *.presence <status>* - Ubah status presensi (composing/recording/paused)
• *.react <emoji>* - Reaksi emoji ke pesan (Kutip pesan)
• *.pin* - Menyematkan pesan (Pin) (Kutip pesan)
• *.keep* - Mengunci/menyimpan pesan (Keep) (Kutip pesan)
• *.onwa <nomor>* - Cek apakah nomor terdaftar di WhatsApp
• *.block* - Blokir kontak / chat ini
• *.unblock <nomor>* - Buka blokir kontak
• *.bizprofile* - Cek profil bisnis suatu kontak

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 *2. NEWSLETTER / SALURAN FEATURES*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• *.newsletter-create <nama>|<deskripsi>* - Buat saluran baru
• *.newsletter-info <jid>* - Cek info detail saluran
• *.newsletter-invite <jid>|<nama>* - Kirim undangan saluran
• *.newsletter-follow <jid>* - Ikuti saluran
• *.newsletter-unfollow <jid>* - Berhenti mengikuti saluran
• *.newsletter-mute <jid>* - Bisukan saluran
• *.newsletter-unmute <jid>* - Bunyikan saluran
• *.newsletter-update <jid>|<nama>|<deskripsi>* - Perbarui metadata saluran
• *.newsletter-inviteadmin <jid>|<userJid>* - Undang admin saluran

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 *3. PROTOCOL & NATIVE SHORTCUTS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• *.bcall* - Kirim undangan Video Call terjadwal
• *.survey* - Kirim pesan survei in-thread
• *.sticker-sync* - Kirim sinkronisasi stiker manual
• *.stickerpack* - Kirim sticker pack kustom
• *.resend* - Meminta pengiriman ulang pesan (Kutip pesan)
• *.payinvite* - Kirim undangan pembayaran
• *.comment <teks>* - Berikan komentar/balasan status/pesan (Kutip pesan)
• *.forward <nomor/jid>* - Meneruskan (forward) pesan terpilih (Kutip pesan)

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 *4. META AI STYLE MESSAGES (VISUAL)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• *.table* - Kirim tabel terformat Meta AI
• *.code* - Kirim blok kode pemrograman Meta AI
• *.reels* - Kirim preview reels/video vertikal Meta AI
• *.grid* - Kirim grid gambar kolase Meta AI
• *.inline* - Kirim gambar inline dengan teks Meta AI
• *.dynamic* - Kirim gambar dinamis Meta AI
• *.latex* - Kirim rumus matematika LaTeX Meta AI
• *.map* - Kirim anotasi peta interaktif Meta AI
• *.think* - Kirim langkah berpikir (Thinking Steps) Meta AI
• *.model* - Kirim branding model AI Meta AI
• *.prompts* - Kirim saran prompt interaktif Meta AI

━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ *5. META AI ADVANCED PROTOCOL (METADATA)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• *.memory* - Kirim metadata memori AI (BotMemoryMetadata)
• *.quota* - Kirim info kuota AI (BotQuotaMetadata)
• *.imagine* - Kirim info metadata generasi gambar (imagine)
• *.sources* - Kirim sumber pencarian web AI (BotSearchSources)
• *.origin* - Kirim info asal pesan AI (BotMessageOrigin)
• *.feedback* - Berikan jempol atas/bawah pada pesan AI (aiFeedback)

━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ *6. PRODUCT CAROUSEL & BUSINESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• *.carousel* - Kirim komidi putar produk (Product Carousel)
• *.product* - Kirim informasi detail produk bisnis

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎁 *7. UNRELEASED NATIVE FEATURES (NEW)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• *.event* - Kirim undangan acara grup (Group Event)
• *.invoice* - Kirim tagihan resmi (Invoice Message)
• *.order* - Kirim detail pesanan belanja (Order Message)
• *.liveloc* - Bagikan lokasi terkini (Live Location)
• *.calllog* - Kirim riwayat panggilan telepon (Call Log)
• *.progress* - Kirim langkah progress/pelacakan (Progress Steps)
• *.pollv5* - Kirim polling WhatsApp versi terbaru (Poll V5)
• *.schedulecall <judul>* - Kirim undangan panggilan terjadwal (Scheduled Call)
• *.carousel-native* - Kirim carousel pesan non-produk native
• *.table-native* - Kirim tabel interaktif native (Native Flow Table)
• *.replyquestion <teks>* - Kirim respon dari kuis/pertanyaan (Kutip pesan)
• *.quotestatus* - Kirim pesan kutipan status broadcast
• *.statussticker* - Kirim interaksi sticker ke status broadcast
• *.statusquestion <teks>* - Kirim balasan pertanyaan status broadcast
• *.historynotice* - Kirim notifikasi sinkronisasi riwayat pesan
• *.chatbundle* - Kirim bundel riwayat chat
• *.encreaction* - Kirim reaksi emoji terenkripsi (Kutip pesan)
• *.pollresult* - Kirim snapshot hasil poling (Poll Result)

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 *8. SYSTEM, PERSONA & OPTIMIZATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
• *.ghost <on/off>* - Aktifkan/matikan Ghost Mode (Tanpa Read)
• *.vip <add/remove> <jid/nomor>* - Tambah/hapus kontak dari VIP Ghost Mode
• *.persona <type>* - Ubah user agent/persona (ios, android, windows, macos, portal, wearos)
• *.prefetch <dir>* - Prapemanasan/prefetch plugin dalam folder
• *.optimize* - Bersihkan store memory & pemicu Garbage Collector

━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *Catatan:*
- Pastikan bot berjalan dan nomor Anda terhubung.
- Anda dapat menyalin nama perintah untuk langsung mengujinya.`;
        m.reply(menuText);
    };

    conn.onCommand('menu', sendMenu);
    conn.onCommand('help', sendMenu);
    conn.onCommand('ping', (m) => m.reply('Pong! 🏓'));

    // 2. Media Send/Reply
    conn.onCommand('media', async (m) => {
        m.reply('Sedang menguji pengiriman seluruh jenis media...');
        await m.replyImage('https://files.catbox.moe/gw41eq.png', 'Ini adalah Gambar Uji');
        await m.replyAudio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        await m.replyDocument('https://files.catbox.moe/gw41eq.png', 'test-doc.jpg');
    });

    // 3. Buttons (Interactive Native)
    conn.onCommand('buttons', async (m) => {
        await conn.msg.buttons(m.chat, "Pilih opsi di bawah ini:", "Footer Tombol", [
            { buttonId: "btn_1", buttonText: { displayText: "Opsi 1" }, type: 1 },
            { buttonId: "btn_2", buttonText: { displayText: "Opsi 2" }, type: 1 }
        ], { quoted: m });
    });

    // 4. List (Interactive Section List)
    conn.onCommand('list', async (m) => {
        await conn.msg.list(m.chat, "Pilihan Menu", "Silakan pilih salah satu:", "Footer List", "Pilih Menu", [
            {
                title: "Menu Utama",
                rows: [
                    { title: "Kopi Hitam", rowId: "kopi", description: "Kopi espresso segar" },
                    { title: "Matcha Latte", rowId: "matcha", description: "Teh hijau susu Jepang" }
                ]
            }
        ], { quoted: m });
    });

    // 5. Poll Message
    conn.onCommand('poll', async (m) => {
        await conn.msg.poll(m.chat, "Bahasa pemrograman terfavorit Anda?", ["JavaScript", "Python", "Go", "Rust"], 1, { quoted: m });
    });

    // 6. Group Actions & Details
    conn.onCommand('groupinfo', async (m) => {
        if (!m.isGroup) return m.reply('Perintah ini hanya dapat dijalankan di dalam grup!');
        const metadata = await conn.groupMetadata(m.chat);
        const admins = await conn.getGroupAdmins(m.chat);
        const isSenderAdmin = await conn.isAdmin(m.chat, m.sender);
        
        m.reply(`📊 *Informasi Grup:*\n\n*Nama Grup:* ${metadata.subject}\n*Deskripsi:* ${metadata.desc || '-'}\n*Jumlah Anggota:* ${metadata.participants.length}\n*Jumlah Admin:* ${admins.length}\n*Status Anda:* ${isSenderAdmin ? 'Admin 👑' : 'Anggota Biasa'}`);
    });

    // 7. Settings (Auto-Read, Anti-Call, Auto-Typing & Auto-VN)
    conn.onCommand('settings', (m) => {
        const query = m.query.toLowerCase();
        if (query === 'autoread on') {
            conn.autoRead = true;
            m.reply('Auto-Read diaktifkan!');
        } else if (query === 'autoread off') {
            conn.autoRead = false;
            m.reply('Auto-Read dimatikan!');
        } else if (query === 'anticall on') {
            conn.antiCall = true;
            m.reply('Anti-Call diaktifkan!');
        } else if (query === 'anticall off') {
            conn.antiCall = false;
            m.reply('Anti-Call dimatikan!');
        } else if (query === 'autotyping on') {
            conn.autoTyping = true;
            m.reply('Auto-Typing diaktifkan!');
        } else if (query === 'autotyping off') {
            conn.autoTyping = false;
            m.reply('Auto-Typing dimatikan!');
        } else if (query === 'autovn on') {
            conn.autoRecord = true;
            m.reply('Auto-VN diaktifkan!');
        } else if (query === 'autovn off') {
            conn.autoRecord = false;
            m.reply('Auto-VN dimatikan!');
        } else {
            m.reply(`🔧 *Pengaturan Bot:*\n\n*Auto-Read:* ${conn.autoRead ? 'ON' : 'OFF'}\n*Anti-Call:* ${conn.antiCall ? 'ON' : 'OFF'}\n*Auto-Typing:* ${conn.autoTyping ? 'ON' : 'OFF'}\n*Auto-VN:* ${conn.autoRecord ? 'ON' : 'OFF'}\n\n_Ketik .settings [fitur] on/off untuk mengubah. Pilihan fitur: autoread, anticall, autotyping, autovn_`);
        }
    });

    // 8. Presence Updates
    conn.onCommand('presence', async (m) => {
        const type = m.query.toLowerCase();
        if (['composing', 'recording', 'paused'].includes(type)) {
            await conn.sendPresenceUpdate(type, m.chat);
            m.reply(`Status presensi Anda diubah ke: ${type}`);
        } else {
            m.reply(`Gunakan: .presence composing | recording | paused`);
        }
    });

    // Auto-Typing direct control
    conn.onCommand('autotyping', (m) => {
        const query = m.query.toLowerCase().trim();
        if (query === 'on') {
            conn.autoTyping = true;
            m.reply('Auto-Typing diaktifkan!');
        } else if (query === 'off') {
            conn.autoTyping = false;
            m.reply('Auto-Typing dimatikan!');
        } else {
            m.reply(`Status Auto-Typing saat ini: *${conn.autoTyping ? 'ON' : 'OFF'}*\n\nKetik *.autotyping on* untuk mengaktifkan atau *.autotyping off* untuk mematikan.`);
        }
    });

    // Auto-VN direct control
    conn.onCommand('autovn', (m) => {
        const query = m.query.toLowerCase().trim();
        if (query === 'on') {
            conn.autoRecord = true;
            m.reply('Auto-VN diaktifkan!');
        } else if (query === 'off') {
            conn.autoRecord = false;
            m.reply('Auto-VN dimatikan!');
        } else {
            m.reply(`Status Auto-VN saat ini: *${conn.autoRecord ? 'ON' : 'OFF'}*\n\nKetik *.autovn on* untuk mengaktifkan atau *.autovn off* untuk mematikan.`);
        }
    });

    // Send text message with custom simulated typing delay
    conn.onCommand('replytyping', async (m) => {
        const text = m.query || "Ini adalah pesan balasan dengan simulasi mengetik otomatis selama 1.5 detik!";
        await m.replyWithTyping(text, {}, 1500);
    });

    // Send audio message with custom simulated recording delay
    conn.onCommand('replyvn', async (m) => {
        const url = m.query || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        m.reply('Mengirim VN dengan simulasi merekam audio selama 2 detik...');
        await m.replyWithVN(url, {}, 2000);
    });

    // 9. React to a message
    conn.onCommand('react', async (m) => {
        if (!m.message.extendedTextMessage?.contextInfo?.stanzaId) {
            return m.reply("Kutip/reply pesan yang ingin direaksikan dengan emoji!");
        }
        const emoji = m.query || "👍";
        const key = {
            remoteJid: m.chat,
            fromMe: m.message.extendedTextMessage.contextInfo.participant === (conn.user?.id || conn.user?.jid),
            id: m.message.extendedTextMessage.contextInfo.stanzaId,
            participant: m.message.extendedTextMessage.contextInfo.participant
        };
        await conn.react(m.chat, emoji, key);
    });

    // 10. Pin a message
    conn.onCommand('pin', async (m) => {
        if (!m.message.extendedTextMessage?.contextInfo?.stanzaId) {
            return m.reply("Kutip/reply pesan yang ingin di-pin!");
        }
        const quotedKey = {
            remoteJid: m.chat,
            fromMe: m.message.extendedTextMessage.contextInfo.participant === (conn.user?.id || conn.user?.jid),
            id: m.message.extendedTextMessage.contextInfo.stanzaId,
            participant: m.message.extendedTextMessage.contextInfo.participant
        };
        await conn.msg.pinMessage(m.chat, { key: quotedKey, type: 1, senderTimestampMs: Date.now() });
        m.reply("Pesan berhasil di-pin!");
    });

    // 11. Keep a message (Chat Lock/Keep)
    conn.onCommand('keep', async (m) => {
        if (!m.message.extendedTextMessage?.contextInfo?.stanzaId) {
            return m.reply("Kutip/reply pesan yang ingin di-keep!");
        }
        const quotedKey = {
            remoteJid: m.chat,
            fromMe: m.message.extendedTextMessage.contextInfo.participant === (conn.user?.id || conn.user?.jid),
            id: m.message.extendedTextMessage.contextInfo.stanzaId,
            participant: m.message.extendedTextMessage.contextInfo.participant
        };
        await conn.msg.keepMessage(m.chat, { key: quotedKey, keepType: 1, timestampMs: Date.now() });
        m.reply("Pesan berhasil di-keep!");
    });

    // 12. Check WhatsApp Registration
    conn.onCommand('onwa', async (m) => {
        if (!m.query) return m.reply("Gunakan: .onwa <nomor>");
        const result = await conn.onWhatsApp(m.query);
        if (result && result.length > 0 && result[0].exists) {
            m.reply(`✅ Nomor ${m.query} terdaftar di WhatsApp.\nJID: ${result[0].jid}`);
        } else {
            m.reply(`❌ Nomor ${m.query} tidak terdaftar di WhatsApp.`);
        }
    });

    // 13. Block & Unblock Contacts
    conn.onCommand('block', async (m) => {
        const target = m.query || m.chat;
        await conn.updateBlockStatus(target, "block");
        m.reply(`Kontak ${target} berhasil diblokir!`);
    });
    conn.onCommand('unblock', async (m) => {
        if (!m.query) return m.reply("Gunakan: .unblock <jid/nomor>");
        await conn.updateBlockStatus(m.query, "unblock");
        m.reply(`Kontak ${m.query} berhasil dibuka blokirnya!`);
    });

    // 14. Business Profile
    conn.onCommand('bizprofile', async (m) => {
        const target = m.query || m.chat;
        try {
            const profile = await conn.getBusinessProfile(target);
            if (profile) {
                m.reply(`💼 *Profil Bisnis:* \n\n*Deskripsi:* ${profile.description || '-'}\n*Email:* ${profile.email || '-'}\n*Website:* ${profile.website ? profile.website.join(', ') : '-'}\n*Kategori:* ${profile.category || '-'}`);
            } else {
                m.reply("Profil bisnis tidak ditemukan atau kontak bukan akun bisnis.");
            }
        } catch (e) {
            m.reply("Gagal mengambil profil bisnis: " + e.message);
        }
    });

    // --- 📢 NEWSLETTER / SALURAN FEATURES ---

    // 15. Create Newsletter
    conn.onCommand('newsletter-create', async (m) => {
        const [name, desc] = m.query.split('|');
        if (!name) return m.reply("Gunakan: .newsletter-create <nama>|<deskripsi>");
        try {
            const result = await conn.newsletter.create(name, desc || "");
            m.reply(`✅ Saluran berhasil dibuat!\n*JID:* ${result.id}\n*Nama:* ${result.name}`);
        } catch (e) {
            m.reply("Gagal membuat saluran: " + e.message);
        }
    });

    // 16. Get Newsletter Info
    conn.onCommand('newsletter-info', async (m) => {
        if (!m.query) return m.reply("Gunakan: .newsletter-info <newsletter-jid>");
        try {
            const info = await conn.newsletter.getInfo(m.query);
            m.reply(`📢 *Detail Saluran:*\n\n*Nama:* ${info.name}\n*Deskripsi:* ${info.description || '-'}\n*Pengikut:* ${info.subscribers}\n*Status:* ${info.state}`);
        } catch (e) {
            m.reply("Gagal mengambil info saluran: " + e.message);
        }
    });

    // 17. Invite Follower to Newsletter
    conn.onCommand('newsletter-invite', async (m) => {
        const [newsletterJid, name] = m.query.split('|');
        if (!newsletterJid || !name) return m.reply("Gunakan: .newsletter-invite <newsletter-jid>|<nama-saluran>");
        try {
            await conn.newsletter.inviteFollower(newsletterJid, name, Buffer.alloc(0));
            m.reply("Undangan pengikut saluran dikirim!");
        } catch (e) {
            m.reply("Gagal mengirim undangan saluran: " + e.message);
        }
    });

    // --- 🤝 PROTOCOL & NATIVE SHORTCUTS ---

    // 18. BCALL (Scheduled Video Call)
    conn.onCommand('bcall', async (m) => {
        await conn.msg.bcall(m.chat, {
            callType: 1, // Video
            title: "Sesi Uji Coba Video Call",
            callKey: Buffer.alloc(32)
        }, { quoted: m });
        m.reply("Tautan video call berhasil dibuat!");
    });

    // 19. In-Thread Survey
    conn.onCommand('survey', async (m) => {
        await m.replySurvey({
            surveyId: 12345,
            simonSessionFbid: "session_fbid",
            responseOtid: "response_otid",
            responseTimestampMsString: Date.now().toString()
        });
        m.reply("Pesan survei terkirim!");
    });

    // 20. Sync Stickers
    conn.onCommand('sticker-sync', async (m) => {
        await conn.msg.syncStickers([Buffer.alloc(32).toString('hex')], "manual", { quoted: m });
        m.reply("Sinkronisasi stiker terkirim!");
    });

    conn.onCommand('stickerpack', async (m) => {
        m.reply("Sedang memproses dan mengirim Sticker Pack...");
        try {
            await m.replyStickerPack({
                name: "FreeZee Baileys Uji Pack",
                publisher: "FreeZeeHost",
                description: "Sticker pack uji coba untuk Baileys Ultimate",
                cover: { url: "https://files.catbox.moe/gw41eq.png" },
                stickers: [
                    { sticker: { url: "https://files.catbox.moe/gw41eq.png" }, emojis: ["🔥"] },
                    { sticker: { url: "https://files.catbox.moe/gw41eq.png" }, emojis: ["💡"] }
                ]
            });
        } catch (e) {
            m.reply("Gagal mengirim sticker pack: " + e.message);
        }
    });

    // 21. Resend Message Request
    conn.onCommand('resend', async (m) => {
        if (!m.message.extendedTextMessage?.contextInfo?.stanzaId) {
            return m.reply("Kutip/reply pesan yang ingin diminta resend!");
        }
        const quotedKey = {
            remoteJid: m.chat,
            fromMe: m.message.extendedTextMessage.contextInfo.participant === (conn.user?.id || conn.user?.jid),
            id: m.message.extendedTextMessage.contextInfo.stanzaId,
            participant: m.message.extendedTextMessage.contextInfo.participant
        };
        await conn.msg.requestResend(quotedKey, { quoted: m });
        m.reply("Permintaan kirim ulang pesan berhasil dikirim!");
    });

    // 22. Payment Invite
    conn.onCommand('payinvite', async (m) => {
        await conn.msg.sendPaymentInvite(m.chat, 1, { quoted: m });
        m.reply("Undangan pembayaran terkirim!");
    });

    // --- 🎨 META AI STYLE MESSAGES (VISUAL / RICH VISUAL) ---

    // 23. AI Table
    conn.onCommand('table', (m) => {
        m.replyTable("Bot Pricing Plan", [
            { items: ["Plan", "Price", "Features"], isHeading: true },
            { items: ["Basic", "Free", "Auto-Reply"], isHeading: false },
            { items: ["Premium", "$5/mo", "Meta AI Features"], isHeading: false }
        ]);
    });

    // 24. AI Code
    conn.onCommand('code', (m) => {
        m.replyCode("javascript", "const bot = makeFreeZeeSocket();\nbot.onCommand('ping', (m) => m.reply('Pong!'));");
    });

    // 25. AI Reels
    conn.onCommand('reels', (m) => {
        m.replyReels("Tonton Reels Terpopuler Hari Ini:", [
            {
                title: "Belajar Coding 60 Detik",
                description: "Tips cepat belajar JavaScript secara gratis.",
                videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                thumbnailUrl: "https://files.catbox.moe/gw41eq.png",
                profileIconUrl: "https://files.catbox.moe/gw41eq.png"
            }
        ]);
    });

    // 26. AI Grid Image
    conn.onCommand('grid', (m) => {
        m.replyGridImage([
            "https://files.catbox.moe/gw41eq.png",
            "https://files.catbox.moe/gw41eq.png"
        ]);
    });

    // 27. AI Inline Image
    conn.onCommand('inline', (m) => {
        m.replyInlineImage("https://files.catbox.moe/gw41eq.png", "Ini adalah ilustrasi gambar inline Meta AI", 0, "https://zass.cloud");
    });

    // 28. AI Dynamic
    conn.onCommand('dynamic', (m) => {
        m.replyDynamic("https://files.catbox.moe/gw41eq.png", false, 0);
    });

    // 29. AI Latex Formula
    conn.onCommand('latex', (m) => {
        m.replyLatex("Rumus matematika kuadrat sempurna:", ["f(x) = a x^2 + b x + c", "E = m c^2"]);
    });

    // 30. AI Map Annotations
    conn.onCommand('map', (m) => {
        m.replyMap(-6.2088, 106.8456, [
            { lat: -6.2088, lng: 106.8456, title: "Monas", body: "Monumen Nasional Indonesia" }
        ]);
    });

    // 31. AI Thinking / Reasoning Steps
    conn.onCommand('think', async (m) => {
        await m.replyThinking("Sedang menganalisis basis data...", [
            { title: "Melacak Log Pesan", body: "Memindai riwayat chat terakhir...", status: 3, isReasoning: true },
            { title: "Mencari Informasi", body: "Menghubungkan ke API server...", status: 2, isEnhancedSearch: true },
            { title: "Selesai", status: 1 }
        ]);
        
        setTimeout(() => {
            m.reply("Pindai selesai! Bot berjalan dalam kondisi prima.");
        }, 4000);
    });

    // 32. AI Model Branding
    conn.onCommand('model', (m) => {
        m.replyModel("Pesan ini diproses menggunakan model Llama Premium.", 2, "Llama 3.1 Instruct");
    });

    // 33. AI Prompt Suggestions
    conn.onCommand('prompts', (m) => {
        m.replyPrompts("Bagaimana saya bisa membantu Anda hari ini?", [
            "Jelaskan fitur AI",
            "Kirim tabel harga",
            "Kirim carousel produk"
        ]);
    });

    // --- ⚙️ META AI ADVANCED PROTOCOL (METADATA / RICH PROTOCOL) ---

    // 34. AI Memory facts
    conn.onCommand('memory', (m) => {
        m.replyMemory(
            ["User sedang menguji semua fitur Baileys"],
            ["Fakta tidak relevan sebelumnya"],
            "Informasi ini disimpan dalam ingatan bot untuk personalisasi."
        );
    });

    // 35. AI Quota limit
    conn.onCommand('quota', (m) => {
        m.replyQuota(50, 86400);
    });

    // 36. AI Imagine Metadata
    conn.onCommand('imagine', (m) => {
        m.replyImagineMetadata(3); // Mode 3 = FLASH (realtime generation)
    });

    // 37. AI Search Sources
    conn.onCommand('sources', (m) => {
        m.replySources([
            { provider: 2, title: "Google Search", url: "https://google.com", query: "baileys github release" }
        ]);
    });

    // 38. AI Message Origin
    conn.onCommand('origin', (m) => {
        m.replyMessageOrigin();
    });

    // 39. AI Feedback Thumbs rating
    conn.onCommand('feedback', async (m) => {
        m.reply("Mengirim penilaian jempol atas pada pesan Anda...");
        await m.aiFeedback(true, "Pengujian respon bot berhasil.");
    });

    // --- 🛍️ PRODUCT CAROUSEL ---

    // 40. Product Carousel
    conn.onCommand('carousel', (m) => {
        m.replyProductCarousel([
            {
                productId: "prod_1",
                title: "Kopi Hitam Espresso",
                description: "Kopi espresso murni dari biji kopi pilihan terbaik.",
                price: 25000,
                image: "https://files.catbox.moe/gw41eq.png",
                url: "https://zass.cloud/kopi-espresso",
                body: "Diskon pagi 10%!",
                footer: "Diskon Khusus",
                buttons: [{ name: "quick_reply", params: { display_text: "Beli Espresso", id: "buy_espresso" } }]
            },
            {
                productId: "prod_2",
                title: "Matcha Latte Premium",
                description: "Matcha asli Jepang dengan susu creamy.",
                price: 30000,
                image: "https://files.catbox.moe/gw41eq.png",
                url: "https://zass.cloud/matcha",
                body: "Terlaris minggu ini!",
                footer: "Rekomendasi",
                buttons: [{ name: "quick_reply", params: { display_text: "Beli Matcha", id: "buy_matcha" } }]
            }
        ], { text: "Silakan jelajahi katalog produk kami:" });
    });

    // 41. Group Event
    conn.onCommand('event', async (m) => {
        try {
            await conn.msg.createEvent(m.chat, {
                name: "Sesi Coding Baileys",
                description: "Membahas implementasi fitur baru di WhatsApp",
                startTime: Math.floor(Date.now() / 1000) + 3600
              }, { quoted: m });
        } catch (e) {
            m.reply("Gagal membuat event: " + e.message);
        }
    });

    // 42. Invoice Message
    conn.onCommand('invoice', async (m) => {
        try {
            await m.replyInvoice({
                title: "Tagihan Lisensi Bot",
                description: "Langganan Bulanan Premium",
                amount: 150000,
                currency: "IDR"
            }, { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim invoice: " + e.message);
        }
    });

    // 43. Order Message
    conn.onCommand('order', async (m) => {
        try {
            await m.replyOrder({
                orderId: "ord_" + Date.now(),
                title: "Kopi Espresso & Matcha Latte",
                subtotal: 55000,
                currency: "IDR"
            }, { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim order: " + e.message);
        }
    });

    // 44. Live Location
    conn.onCommand('liveloc', async (m) => {
        try {
            await m.replyLiveLocation(-6.2088, 106.8456, { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim live location: " + e.message);
        }
    });

    // 45. Call Log
    conn.onCommand('calllog', async (m) => {
        try {
            await m.replyCallLog({
                callType: 1, // Video call
                duration: 350,
                isIncoming: true
            }, { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim call log: " + e.message);
        }
    });

    // 46. Progress Steps
    conn.onCommand('progress', async (m) => {
        try {
            await m.replyProgress("Status pengerjaan fitur bot:", [
                { title: "Analisis Kebutuhan", body: "Selesai dianalisis", status: 1 },
                { title: "Pengembangan Kode", body: "Sedang dikembangkan", status: 2 },
                { title: "Pengujian", body: "Menunggu giliran", status: 3 }
            ], { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim progress: " + e.message);
        }
    });

    // 47. Poll V5
    conn.onCommand('pollv5', async (m) => {
        try {
            await conn.msg.sendPollV5(m.chat, {
                name: "Pilih Framework Favorit:",
                values: ["Next.js", "Vite", "Astro", "Nuxt"],
                selectableCount: 1
            }, { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim poll v5: " + e.message);
        }
    });

    // 48. Newsletter Follow
    conn.onCommand('newsletter-follow', async (m) => {
        if (!m.query) return m.reply("Gunakan: .newsletter-follow <newsletter-jid>");
        try {
            await conn.newsletter.follow(m.query);
            m.reply(`Berhasil mengikuti saluran JID: ${m.query}`);
        } catch (e) {
            m.reply("Gagal mengikuti saluran: " + e.message);
        }
    });

    // 49. Newsletter Unfollow
    conn.onCommand('newsletter-unfollow', async (m) => {
        if (!m.query) return m.reply("Gunakan: .newsletter-unfollow <newsletter-jid>");
        try {
            await conn.newsletter.unfollow(m.query);
            m.reply(`Berhasil berhenti mengikuti saluran JID: ${m.query}`);
        } catch (e) {
            m.reply("Gagal unfollow saluran: " + e.message);
        }
    });

    // 50. Newsletter Mute
    conn.onCommand('newsletter-mute', async (m) => {
        if (!m.query) return m.reply("Gunakan: .newsletter-mute <newsletter-jid>");
        try {
            await conn.newsletter.mute(m.query);
            m.reply(`Berhasil membisukan saluran JID: ${m.query}`);
        } catch (e) {
            m.reply("Gagal membisukan saluran: " + e.message);
        }
    });

    // 51. Newsletter Unmute
    conn.onCommand('newsletter-unmute', async (m) => {
        if (!m.query) return m.reply("Gunakan: .newsletter-unmute <newsletter-jid>");
        try {
            await conn.newsletter.unmute(m.query);
            m.reply(`Berhasil membunyikan kembali saluran JID: ${m.query}`);
        } catch (e) {
            m.reply("Gagal unmute saluran: " + e.message);
        }
    });

    // 52. Newsletter Update
    conn.onCommand('newsletter-update', async (m) => {
        const [jid, name, desc] = m.query.split('|');
        if (!jid || !name) return m.reply("Gunakan: .newsletter-update <newsletter-jid>|<nama baru>|<deskripsi baru>");
        try {
            await conn.newsletter.update(jid, name, desc || "");
            m.reply(`Berhasil memperbarui metadata saluran JID: ${jid}`);
        } catch (e) {
            m.reply("Gagal memperbarui saluran: " + e.message);
        }
    });

    // 53. Newsletter Invite Admin
    conn.onCommand('newsletter-inviteadmin', async (m) => {
        const [jid, userJid] = m.query.split('|');
        if (!jid || !userJid) return m.reply("Gunakan: .newsletter-inviteadmin <newsletter-jid>|<user-jid/nomor>");
        const formattedUserJid = userJid.includes('@') ? userJid : userJid.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        try {
            await conn.newsletter.inviteAdmin(jid, formattedUserJid);
            m.reply(`Undangan admin saluran dikirim ke @${formattedUserJid.split('@')[0]}`, { mentions: [formattedUserJid] });
        } catch (e) {
            m.reply("Gagal mengundang admin saluran: " + e.message);
        }
    });

    // 54. Comment Status / Message
    conn.onCommand('comment', async (m) => {
        if (!m.message.extendedTextMessage?.contextInfo?.stanzaId) {
            return m.reply("Kutip/reply pesan yang ingin dikomentari!");
        }
        if (!m.query) return m.reply("Gunakan: .comment <teks>");
        try {
            await m.replyComment(m.query);
        } catch (e) {
            m.reply("Gagal mengirim comment: " + e.message);
        }
    });

    // 55. Product Details
    conn.onCommand('product', async (m) => {
        try {
            await m.replyProduct(conn.user.id || conn.user.jid, {
                productId: "prod_" + Date.now(),
                title: "Kopi Hitam Premium",
                description: "Biji kopi Arabika pilihan dari Kintamani Bali.",
                currencyCode: "IDR",
                priceAmount1000: 35000000,
                url: "https://freezeehost.com",
                productImage: { url: "https://files.catbox.moe/gw41eq.png", mimetype: 'image/jpeg' }
            });
        } catch (e) {
            m.reply("Gagal mengirim produk: " + e.message);
        }
    });

    // 56. Schedule Call
    conn.onCommand('schedulecall', async (m) => {
        if (!m.query) return m.reply("Gunakan: .schedulecall <judul>");
        try {
            await conn.msg.scheduleCall(m.chat, {
                callType: 1, // Voice call
                title: m.query,
                scheduledTimestampMs: Math.floor(Date.now() / 1000) + 3600
            }, { quoted: m });
            m.reply("Panggilan terjadwal berhasil dibuat!");
        } catch (e) {
            m.reply("Gagal menjadwalkan panggilan: " + e.message);
        }
    });

    // 57. Carousel Native
    conn.onCommand('carousel-native', async (m) => {
        try {
            await conn.msg.carousel(m.chat, [
                {
                    title: "Slide 1",
                    body: "Slide 1: Native Carousel Message",
                    footer: "Footer Uji Coba 1",
                    image: "https://files.catbox.moe/gw41eq.png",
                    buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Tombol 1", id: "btn_1" }) }]
                },
                {
                    title: "Slide 2",
                    body: "Slide 2: Native Carousel Message",
                    footer: "Footer Uji Coba 2",
                    image: "https://files.catbox.moe/gw41eq.png",
                    buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Tombol 2", id: "btn_2" }) }]
                }
            ], { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim native carousel: " + e.message);
        }
    });

    // 58. Table Native
    conn.onCommand('table-native', async (m) => {
        try {
            await conn.msg.nativeTable(m.chat, "Tabel Native", [
                { cells: ["Kolom A", "Kolom B"] },
                { cells: ["Baris 1", "Baris 2"] }
            ], { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim native table: " + e.message);
        }
    });

    // 59. Reply Question / Quiz response
    conn.onCommand('replyquestion', async (m) => {
        if (!m.message.extendedTextMessage?.contextInfo?.stanzaId) {
            return m.reply("Kutip/reply pesan pertanyaan yang ingin dijawab!");
        }
        if (!m.query) return m.reply("Gunakan: .replyquestion <jawaban>");
        const key = {
            remoteJid: m.chat,
            fromMe: m.message.extendedTextMessage.contextInfo.participant === (conn.user?.id || conn.user?.jid),
            id: m.message.extendedTextMessage.contextInfo.stanzaId,
            participant: m.message.extendedTextMessage.contextInfo.participant
        };
        try {
            await m.replyQuestion(m.query, key);
        } catch (e) {
            m.reply("Gagal mengirim balasan pertanyaan: " + e.message);
        }
    });

    // 60. Quote Status Broadcast
    conn.onCommand('quotestatus', async (m) => {
        try {
            await conn.msg.quoteStatus(m.chat, {
                key: {
                    remoteJid: "status@broadcast",
                    fromMe: false,
                    id: "status_id_" + Date.now(),
                    participant: m.sender
                },
                message: { conversation: "Status Uji Coba" }
            }, { quoted: m });
        } catch (e) {
            m.reply("Gagal mengutip status: " + e.message);
        }
    });

    // 61. Status Sticker Interaction
    conn.onCommand('statussticker', async (m) => {
        try {
            await conn.msg.interactStatusSticker(m.chat, {
                statusJid: "status@broadcast",
                stickerHash: Buffer.alloc(32).toString('hex'),
                interactionType: 1
            }, { quoted: m });
            m.reply("Interaksi stiker status berhasil dikirim!");
        } catch (e) {
            m.reply("Gagal interaksi stiker status: " + e.message);
        }
    });

    // 62. Status Question Answer
    conn.onCommand('statusquestion', async (m) => {
        if (!m.query) return m.reply("Gunakan: .statusquestion <jawaban>");
        try {
            await m.replyStatusQuestion(m.query);
            m.reply("Jawaban pertanyaan status terkirim!");
        } catch (e) {
            m.reply("Gagal mengirim jawaban pertanyaan status: " + e.message);
        }
    });

    // 63. History Notice
    conn.onCommand('historynotice', async (m) => {
        try {
            await conn.msg.sendHistoryNotice(m.chat, {
                metadata: {
                    syncType: 1
                }
            }, { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim history notice: " + e.message);
        }
    });

    // 64. Chat Bundle
    conn.onCommand('chatbundle', async (m) => {
        try {
            await conn.msg.sendChatBundle(m.chat, {
                bundleName: "Chat Bundle Uji Coba",
                mimetype: "application/octet-stream",
                fileLength: 100
            }, { quoted: m });
        } catch (e) {
            m.reply("Gagal mengirim chat bundle: " + e.message);
        }
    });

    // 65. Encrypted Reaction
    conn.onCommand('encreaction', async (m) => {
        if (!m.message.extendedTextMessage?.contextInfo?.stanzaId) {
            return m.reply("Kutip/reply pesan yang ingin dikirimi encrypted reaction!");
        }
        const quotedKey = {
            remoteJid: m.chat,
            fromMe: m.message.extendedTextMessage.contextInfo.participant === (conn.user?.id || conn.user?.jid),
            id: m.message.extendedTextMessage.contextInfo.stanzaId,
            participant: m.message.extendedTextMessage.contextInfo.participant
        };
        try {
            await conn.msg.sendEncReaction(m.chat, {
                targetMessageKey: quotedKey,
                encPayload: Buffer.alloc(32),
                encIv: Buffer.alloc(16)
            }, { quoted: m });
            m.reply("Encrypted reaction berhasil dikirim!");
        } catch (e) {
            m.reply("Gagal mengirim encrypted reaction: " + e.message);
        }
    });

    // 66. Poll Result snapshot
    conn.onCommand('pollresult', async (m) => {
        try {
            await m.replyPollResult({
                pollJid: m.chat,
                pollName: "Bahasa pemrograman terfavorit Anda?",
                pollValues: ["JavaScript", "Python"],
                votes: [
                    { optionName: "JavaScript", voteCount: 10 },
                    { optionName: "Python", voteCount: 5 }
                ]
            });
        } catch (e) {
            m.reply("Gagal mengirim poll result: " + e.message);
        }
    });

    // 67. Ghost Mode Settings
    conn.onCommand('ghost', async (m) => {
        const arg = m.query.toLowerCase();
        if (arg === 'on') {
            conn.ghostMode = true;
            m.reply("Ghost Mode diaktifkan! Pesan masuk tidak akan ditandai sebagai dibaca secara otomatis untuk non-VIP.");
        } else if (arg === 'off') {
            conn.ghostMode = false;
            m.reply("Ghost Mode dinonaktifkan.");
        } else {
            m.reply(`Gunakan: .ghost on/off\nStatus Saat Ini: ${conn.ghostMode ? 'ON' : 'OFF'}`);
        }
    });

    // 68. VIP list Settings
    conn.onCommand('vip', async (m) => {
        const [action, target] = m.query.split(/\s+/);
        if (!action || !target) return m.reply("Gunakan: .vip add/remove <nomor/jid>");
        const formattedJid = target.includes('@') ? target : target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (action.toLowerCase() === 'add') {
            conn.setVIP(formattedJid, true);
            m.reply(`Berhasil menambahkan @${formattedJid.split('@')[0]} ke daftar VIP.`, { mentions: [formattedJid] });
        } else if (action.toLowerCase() === 'remove') {
            conn.setVIP(formattedJid, false);
            m.reply(`Berhasil menghapus @${formattedJid.split('@')[0]} dari daftar VIP.`, { mentions: [formattedJid] });
        } else {
            m.reply("Gunakan: .vip add/remove <nomor/jid>");
        }
    });

    // 69. Browser Persona Settings
    conn.onCommand('persona', async (m) => {
        if (!m.query) return m.reply("Gunakan: .persona <ios | android | windows | macos | portal | wearos>");
        const success = conn.setPersona(m.query);
        if (success) {
            m.reply(`Persona browser berhasil diubah menjadi: *${m.query.toUpperCase()}*.\nPerubahan akan aktif sepenuhnya saat menghubungkan ulang session.`);
        } else {
            m.reply("Persona tidak dikenal! Pilih salah satu: ios, android, windows, macos, portal, wearos");
        }
    });

    // 70. Prefetch Plugins
    conn.onCommand('prefetch', async (m) => {
        const dir = m.query || "./lib";
        m.reply(`Memulai prefetch plugin di direktori: ${dir}...`);
        try {
            const result = await conn.prefetchPlugins(dir);
            if (result.error) {
                m.reply(`Gagal prefetch: ${result.error}`);
            } else {
                m.reply(`Prefetch Selesai!\n⏱️ *Durasi:* ${result.duration}ms\n📦 *Jumlah File:* ${result.count}`);
            }
        } catch (e) {
            m.reply("Terjadi kesalahan: " + e.message);
        }
    });

    // 71. Optimize Connection Memory
    conn.onCommand('optimize', async (m) => {
        try {
            conn.autoOptimize();
            m.reply("Bot auto-optimize telah dijalankan. Store memory dibersihkan, garbage collector dipicu.");
        } catch (e) {
            m.reply("Gagal optimize: " + e.message);
        }
    });

    // 72. Forward Message
    conn.onCommand('forward', async (m) => {
        if (!m.message.extendedTextMessage?.contextInfo?.stanzaId) {
            return m.reply("Kutip/reply pesan yang ingin di-forward!");
        }
        if (!m.query) return m.reply("Gunakan: .forward <nomor/jid>");
        const formattedJid = m.query.includes('@') ? m.query : m.query.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        try {
            const targetJid = m.chat;
            const targetId = m.message.extendedTextMessage.contextInfo.stanzaId;
            let original = deletedCache.get(`${targetJid}:${targetId}`);
            
            if (!original) {
                const contextInfo = m.message.extendedTextMessage.contextInfo;
                if (contextInfo.quotedMessage) {
                    original = conn.smsg({
                        key: {
                            remoteJid: m.chat,
                            fromMe: contextInfo.participant === (conn.user?.id || conn.user?.jid),
                            id: contextInfo.stanzaId,
                            participant: contextInfo.participant
                        },
                        message: contextInfo.quotedMessage
                    });
                }
            }

            if (original) {
                await original.forward(formattedJid);
                m.reply(`Berhasil mem-forward pesan ke @${formattedJid.split('@')[0]}`, { mentions: [formattedJid] });
            } else {
                m.reply("Pesan tidak ditemukan di cache dan tidak dapat direkonstruksi.");
            }
        } catch (e) {
            m.reply("Gagal mem-forward pesan: " + e.message);
        }
    });
}

startBot().catch(err => console.error("Critical error starting bot:", err));
