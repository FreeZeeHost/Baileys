<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="@freezeehost/baileys" width="550"/>  

  <h1>@freezeehost/baileys</h1>
  <p><strong>The Most Advanced, High-Performance, and Feature-Rich WhatsApp Web Library for Node.js</strong></p>
  
  <p>
    <a href="https://npmjs.com/package/@freezeehost/baileys">
      <img src="https://img.shields.io/npm/v/@freezeehost/baileys?color=blue&style=for-the-badge&logo=npm" alt="npm version">
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
    </a>
    <a href="https://github.com/FreeZeeHostProject/Baileys/stargazers">
      <img src="https://img.shields.io/github/stars/FreeZeeHostProject/Baileys?color=yellow&style=for-the-badge&logo=github" alt="GitHub stars">
    </a>
  </p>
</div>

---

## ⚠️ PENTING: Disclaimer & Warning
Proyek ini **tidak berafiliasi** dengan WhatsApp atau Meta. Penggunaan library ini dapat melanggar [Ketentuan Layanan WhatsApp](https://www.whatsapp.com/legal).

*   **Risiko Ban**: Fitur seperti *Persona Switcher*, *Ghost Mode*, dan *Anti-Delete* adalah fitur eksperimental. Penggunaan yang berlebihan atau tidak bijak dapat menyebabkan nomor WhatsApp Anda diblokir secara permanen.
*   **Gunakan Akun Cadangan**: Kami sangat menyarankan untuk melakukan testing menggunakan nomor cadangan sebelum diimplementasikan ke akun utama.
*   **Tanggung Jawab**: Pengembang library ini tidak bertanggung jawab atas segala kerugian, termasuk namun tidak terbatas pada pemblokiran akun atau kehilangan data.

---

## 🆚 Perbedaan dengan Official Baileys
Library ini adalah "Performance Fork" dari WhiskeySockets Baileys dengan optimasi ekstrim untuk kebutuhan bot modern.

| Fitur | Official Baileys | @freezeehost/baileys |
|-------|------------------|----------------------|
| **Meta AI UI Support** | ❌ Terbatas | ✅ **Full Native Rendering** (Table, Reels, Code, Grid) |
| **Media Handling** | Standar | ✅ **Auto-Upload Buffer** & MMG Link Spoofing |
| **Koneksi** | Manual | ✅ **Hybrid Pairing** (Auto-detect QR/Pairing Code) |
| **Stabilitas** | Standar | ✅ **Auto-Medic** (Socket Self-Healing Watchdog) |
| **Privacy** | Standar | ✅ **Ghost Mode** & **Selective Read Receipts** |
| **Anti-Delete** | ❌ Tidak Ada | ✅ **Native Core Engine Integration** |
| **Performa** | Standar | ✅ **Smart Media Proxy** (SHA256 Deduplication) |
| **Identitas** | Tetap | ✅ **Persona Switcher** (iPhone/Android/Windows Spoofing) |

---

## 🔌 Instalasi (Plug & Play)

### Rekomendasi (via NPM)
```bash
npm install @freezeehost/baileys
```

### Versi Terbaru (via GitHub)
```bash
npm install github:FreeZeeHostProject/Baileys
```

### Drop-in Replacement
Jika Anda sudah memiliki bot berbasis Baileys, cukup ganti dependency di `package.json` Anda agar otomatis mendapatkan semua fitur premium FreeZee:
```json
"dependencies": {
  "baileys": "npm:@freezeehost/baileys@latest"
}
```

---

## 🔥 Fitur Unggulan (2026 Edition)

### 🤖 Meta AI Style Messages
Kirim pesan dengan visual mewah yang biasanya hanya bisa dilakukan oleh bot resmi Meta AI.
-   📊 **AI Table**: `conn.aiTable(jid, title, rows)`
-   🎬 **AI Reels**: `conn.aiReels(jid, text, reels)`
-   💻 **AI Code**: `conn.aiCode(jid, language, code)`
-   🖼️ **AI Grid**: `conn.aiGridImage(jid, imageUrls)`
-   💭 **AI Thinking**: `conn.aiThinking(jid, description, steps)`
-   💬 **AI Prompts**: `conn.aiPrompts(jid, text, chips)`
-   🧠 **AI Memory**: `conn.aiMemory(jid, text, added, removed, disclaimer)`
-   📈 **AI Quota**: `conn.aiQuota(jid, text, remainingQuota, expirationSecs)`
-   🎨 **AI Imagine Type**: `conn.aiImagineMetadata(jid, text, imagineType)`
-   🧭 **AI Progress/Reasoning**: `conn.aiProgress(jid, steps)`
-   🌐 **AI Search Sources**: `conn.aiSources(jid, text, sources)`
-   📣 **AI Message Origin**: `conn.aiMessageOrigin(jid, text)`
-   🛍️ **Product Carousel**: `conn.productCarousel(jid, products)`

### 🎭 Persona Identity Switcher
Ubah identitas perangkat bot Anda secara instan untuk menghindari deteksi sistem anti-bot.
```javascript
// Opsi: 'ios', 'android', 'windows', 'macos'
conn.setPersona('ios'); 
```

### 👻 Phantom Mode (Ghost Protocol)
Baca pesan tanpa memicu centang biru (Read Receipt). Mendukung pengecualian untuk orang tertentu (VIP).
```javascript
conn.ghostMode = true;
conn.setVIP("628xxx@s.whatsapp.net"); // Tetap kirim centang biru ke nomor ini
```

### 🩺 Auto-Medic (Self-Healing Socket)
Mendeteksi jika koneksi WhatsApp macet (Silent Failure). Jika dalam 45 detik tidak ada data, library melakukan *surgical reconnect* secara otomatis.

---

## 🚀 Quick Start
```javascript
const { default: makeFreeZeeSocket, useMultiFileAuthState } = require('@freezeehost/baileys');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const conn = makeFreeZeeSocket({
        auth: state,
        phoneNumber: "628xxxxxxxx", // Masukkan nomor untuk otomatis mode Pairing Code!
    });

    conn.ev.on('creds.update', saveCreds);
    conn.onCommand('ping', (m) => conn.sendMessage(m.chat, { text: 'Pong!' }, { quoted: m }));
}
start();
```

---

## 📜 Full Documentation
Silakan cek [GitHub Wiki](https://github.com/FreeZeeHostProject/Baileys/wiki) atau scroll ke bawah untuk detail teknis lainnya:
- [Connecting Account](#-connecting-account)
- [Handling Events](#-handling-events)
- [Groups & Privacy](#-groups)
- [Advanced Features](#-advanced)

<br>

<details>
<summary><strong>🔌 Connecting Account Detail</strong></summary>

### 🔗 Connect with QR Code
```javascript
const conn = makeFreeZeeSocket({
  printQRInTerminal: true,
  auth: state
})
```

### 🔢 Connect with Pairing Code
Library akan menangani pendaftaran secara hybrid jika `phoneNumber` disediakan.
```javascript
const conn = makeFreeZeeSocket({
  auth: state,
  phoneNumber: "628xxxxxxxx"
})

conn.ev.on('pairing-code', (code) => {
  console.log("KODE PAIRING ANDA:", code);
});
```
</details>

<details>
<summary><strong>🛠️ Deep Protocol Features (Secret)</strong></summary>

#### 🛠️ Manual Message Resend
Fix error **"Menunggu pesan ini"** secara paksa.
```javascript
await conn.requestResend(m.key);
```

#### 📊 Poll V5 (Support Gambar)
Polling versi terbaru dengan dukungan gambar di pilihan jawaban.
```javascript
await conn.sendPollV5(jid, { name: "Vote!", options: [{ name: "Opsi 1", image: buffer }] });
```

#### 📞 Native Call Logs
Kirim riwayat panggilan native (Missed call, dsb).
```javascript
await conn.sendCallLog(jid, { isVideo: false, outcome: 1 });
```

#### 📦 Sticker Pack (Kirim Sticker Pack)
Kirim paket stiker kustom (sticker pack) berisi koleksi stiker secara native.
```javascript
// Kirim paket stiker kustom (sticker pack) berisi koleksi stiker secara native
await conn.sendStickerPack(jid, {
    name: "FreeZee Baileys Uji Pack",
    publisher: "FreeZeeHost",
    cover: bufferCover, // atau { url: "https://..." }
    stickers: [
        { sticker: bufferSticker1, emojis: ["🔥"] },
        { sticker: bufferSticker2, emojis: ["💡"] }
    ]
});
```
</details>

<details>
<summary><strong>📢 Newsletter Advanced Operations</strong></summary>

Selain membuat dan mengundang follower, Anda sekarang memiliki kontrol penuh terhadap Saluran (Newsletter) secara terprogram:

#### 1. Ikuti & Batal Ikuti Saluran (Follow/Unfollow)
```javascript
// Mengikuti saluran
await conn.newsletter.follow("120363xxx@newsletter");

// Berhenti mengikuti saluran
await conn.newsletter.unfollow("120363xxx@newsletter");
```

#### 2. Bisukan & Bunyikan Saluran (Mute/Unmute)
```javascript
// Membisukan notifikasi saluran
await conn.newsletter.mute("120363xxx@newsletter");

// Menyalakan kembali notifikasi saluran
await conn.newsletter.unmute("120363xxx@newsletter");
```

#### 3. Perbarui Metadata Saluran (Update Metadata)
Mengubah nama dan deskripsi saluran resmi Anda secara instan.
```javascript
await conn.newsletter.update("120363xxx@newsletter", "Nama Baru Saluran", "Deskripsi Baru Saluran");
```

#### 4. Undang Kontak Menjadi Admin Saluran (Invite Admin)
```javascript
await conn.newsletter.inviteAdmin("120363xxx@newsletter", "628xxxxxxxx@s.whatsapp.net");
```
</details>

<details>
<summary><strong>🎁 Unreleased Native & Rich Flow Features</strong></summary>

Kumpulan fitur interaktif native terbaru yang belum dirilis secara resmi tetapi didukung penuh oleh core engine FreeZee:

#### 1. Korsel Pesan Native (Native Message Carousel)
Kirim korsel non-produk menggunakan layout pesan bawaan WhatsApp.
```javascript
await conn.msg.carousel(jid, [
    { message: { conversation: "Slide Pertama" } },
    { message: { conversation: "Slide Kedua" } }
]);
```

#### 2. Tabel Interaktif Native (Native Flow Table)
Kirim tabel interaktif dengan format kolom dan baris yang rapi secara terstruktur.
```javascript
await conn.msg.nativeTable(jid, "Judul Tabel", [
    { cells: ["Kolom A", "Kolom B"] },
    { cells: ["Baris 1", "Baris 2"] }
]);
```

#### 3. Undangan Panggilan Terjadwal (Scheduled Call)
```javascript
await conn.msg.scheduleCall(jid, {
    callType: 1, // 1 = Voice, 2 = Video
    title: "Sesi Diskusi Coding",
    scheduledTimestampMs: Math.floor(Date.now() / 1000) + 3600
});
```

#### 4. Balas dengan Komentar (Reply Comment)
Mengomentari status atau pesan secara native.
```javascript
// Kirim komentar pada pesan target
await conn.sendComment(jid, "Teks komentar", targetMessageKey);
```

#### 5. Meneruskan Pesan Utuh (Forward Message)
Meneruskan pesan dari cache atau merekonstruksi pesan secara utuh ke kontak/grup lain.
```javascript
await conn.sendMessage(targetJid, { forward: messageObject });
```

#### 6. Respon Pertanyaan & Kuis (Reply Question)
Mengirimkan jawaban atas pesan jenis pertanyaan/kuis interaktif.
```javascript
// Mengirimkan jawaban kuis/pertanyaan
await conn.replyQuestion(jid, "Jawaban pertanyaan", targetMessageKey);
```

#### 7. Kutip & Interaksi Status Broadcast (Status Actions)
```javascript
// Mengutip status seseorang secara langsung
await conn.msg.quoteStatus(jid, {
    key: { remoteJid: "status@broadcast", id: "status_id", participant: "628xxx@s.whatsapp.net" },
    message: { conversation: "Status Uji" }
});

// Interaksi stiker ke status
await conn.msg.interactStatusSticker(jid, {
    statusJid: "status@broadcast",
    stickerHash: "sha256_hash_stiker",
    interactionType: 1
});

// Menjawab pertanyaan status broadcast secara langsung
await conn.sendStatusQuestion("Jawaban Anda");
```

#### 8. Notifikasi Sinkronisasi & Bundel Chat (History Notice & Chat Bundle)
```javascript
// Mengirim notifikasi sinkronisasi riwayat pesan
await conn.msg.sendHistoryNotice(jid, { metadata: { syncType: 1 } });

// Mengirim bundel cadangan riwayat chat
await conn.msg.sendChatBundle(jid, {
    bundleName: "Riwayat Chat Backup",
    mimetype: "application/octet-stream",
    fileLength: 100
});
```

#### 9. Reaksi Terenkripsi & Snapshot Hasil Polling
```javascript
// Mengirim reaksi emoji terenkripsi (Encrypted Reaction)
await conn.msg.sendEncReaction(jid, {
    targetMessageKey: targetKey,
    encPayload: bufferPayload,
    encIv: bufferIv
});

// Mengirim snapshot hasil akhir polling (Poll Result)
await conn.sendPollResult(jid, {
    pollJid: jid,
    pollName: "Bahasa terfavorit?",
    pollValues: ["JavaScript", "Python"],
    votes: [
        { optionName: "JavaScript", voteCount: 10 },
        { optionName: "Python", voteCount: 5 }
    ]
});
```

#### 10. Survei Dalam Obrolan (In-Thread Survey)
Mengirim pesan ajakan survei (In-Thread Survey) interaktif bawaan WhatsApp yang akan membuka kuesioner pilihan ganda saat diklik oleh pengguna.
```javascript
// Menggunakan koneksi langsung (conn)
await conn.sendSurvey(jid, {
    surveyTitle: "Survei Kepuasan",
    invitationHeaderText: "Bantu Kami Meningkatkan Layanan",
    invitationBodyText: "Silakan berikan masukan Anda melalui survei singkat ini.",
    invitationCtaText: "Mulai Survei",
    questions: [
        {
            questionId: "q1",
            questionText: "Bagaimana kualitas pelayanan kami?",
            questionOptions: [
                { stringValue: "1", numericValue: 1, textTranslated: "Sangat Buruk" },
                { stringValue: "2", numericValue: 2, textTranslated: "Cukup" },
                { stringValue: "3", numericValue: 3, textTranslated: "Sangat Baik" }
            ]
        }
    ]
});
```
</details>

<details>
<summary><strong>🔧 System & Optimization Features</strong></summary>

Fitur manajemen sistem, memori, dan penyamaran agen bot:

#### 1. Pengaturan Ghost Mode & VIP List
```javascript
conn.ghostMode = true; // Aktifkan tanpa mengirim laporan baca otomatis

// Tambahkan kontak agar tetap menerima centang biru dari Anda
conn.setVIP("628xxxxxxxx@s.whatsapp.net", true);
```

#### 2. Auto-Typing & Auto-VN (Simulasi Ketikan & Rekaman VN Realistis)
Secara otomatis memicu status "sedang mengetik..." (composing) sebelum mengirim pesan teks, atau "sedang merekam audio..." (recording) sebelum mengirim Voice Note.

##### **Global Toggle (Otomatis):**
```javascript
// Aktifkan auto-typing global untuk seluruh pesan teks
conn.autoTyping = true;

// Aktifkan auto-record (auto-vn) global untuk seluruh pesan audio
conn.autoRecord = true;
```

##### **Ad-Hoc / Opsi Pengiriman:**
Anda dapat mengaktifkan simulasi mengetik/merekam secara spesifik pada panggilan `sendMessage` dengan durasi kustom (milidetik):
```javascript
// Kirim pesan dengan simulasi mengetik selama 2 detik
await conn.sendMessage(jid, { text: "Halo!" }, { simulateTyping: 2000 });

// Kirim VN dengan simulasi merekam selama 3 detik
await conn.sendMessage(jid, { audio: { url: "..." }, ptt: true }, { simulateRecording: 3000 });
```

##### **Fungsi Helper Socket:**
```javascript
// Simulasikan status mengetik selama durasi tertentu (default 1000ms) tanpa mengirim pesan
await conn.simulateTyping(jid, 2000);

// Simulasikan status merekam audio selama durasi tertentu (default 1500ms) tanpa mengirim pesan
await conn.simulateRecording(jid, 3000);
```

#### 3. Model Penyamaran Browser Perangkat (Persona Identity)
Ubah platform perangkat WhatsApp Web Anda (IOS, Android, Windows, macOS, WearOS, Portal) secara instan.
```javascript
// Opsi: 'ios', 'android', 'windows', 'macos', 'portal', 'wearos'
conn.setPersona('ios'); 
```

#### 4. Prefetch Plugin (Turbo-Loader)
Prapemanasan cache file javascript pada folder plugin agar eksekusi perintah bot lebih instan.
```javascript
const result = await conn.prefetchPlugins("./plugins");
console.log(`Prefetch selesai dalam ${result.duration}ms untuk ${result.count} plugin.`);
```

#### 5. Auto-Optimize Memory
Mengosongkan cache store pesan yang tidak terpakai dan memicu Garbage Collector untuk menghemat RAM VPS.
```javascript
conn.autoOptimize();
```
</details>

<details>
<summary><strong>🎨 Meta AI Style Messages (Visual Layout)</strong></summary>

Gunakan API ini untuk merender visual pesan interaktif Meta AI yang elegan dan modern secara native pada client WhatsApp:

#### 1. 📊 AI Table (Tabel Formatted Meta AI)
Mengirimkan tabel terformat yang rapi dengan kolom dan baris tebal/normal.
```javascript
await conn.aiTable(jid, "Bot Pricing Plan", [
    { items: ["Plan", "Price", "Features"], isHeading: true },
    { items: ["Basic", "Free", "Auto-Reply"], isHeading: false },
    { items: ["Premium", "$5/mo", "Meta AI Features"], isHeading: false }
]);
```

#### 2. 💻 AI Code (Blok Kode Pemrograman)
Kirim blok kode pemrograman dengan syntax highlighting yang rapi.
```javascript
const codeText = "const bot = makeFreeZeeSocket();\nconsole.log('Hello FreeZee!');";
await conn.aiCode(jid, "javascript", codeText);
```

#### 3. 🎬 AI Reels (Instagram/Facebook Reels Preview)
Kirim daftar reels video vertikal yang dapat diputar secara native lengkap dengan thumbnail dan nama pembuat.
```javascript
await conn.aiReels(jid, "Tonton Reels Terpopuler Hari Ini:", [
    {
        title: "Belajar Coding 60 Detik",
        description: "Tips cepat belajar JavaScript secara gratis.",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        thumbnailUrl: "https://toko.com/thumbnail.png",
        profileIconUrl: "https://toko.com/avatar.png"
    }
]);
```

#### 4. 🖼️ AI Grid (Grid Kolase Gambar)
Kirim kolase grid gambar interaktif (seperti hasil generasi gambar Meta AI) yang menampung multi-gambar secara estetik.
```javascript
// Menggunakan message helper (smsg)
await m.replyGridImage([
    "https://toko.com/image1.jpg",
    "https://toko.com/image2.jpg"
]);

// Menggunakan koneksi langsung
await conn.aiGridImage(jid, [
    "https://toko.com/image1.jpg",
    "https://toko.com/image2.jpg"
]);
```

#### 5. 📎 AI Inline Image (Gambar Inline dengan Teks)
Mengirimkan gambar yang terintegrasi secara inline dengan deskripsi teks di bawahnya beserta link tautan eksternal.
```javascript
// Menggunakan message helper (smsg)
await m.replyInlineImage("https://toko.com/gambar.jpg", "Ini adalah ilustrasi gambar inline Meta AI", 0, "https://freezeehost.com");

// Menggunakan koneksi langsung
await conn.aiInlineImage(jid, "https://toko.com/gambar.jpg", "Ini adalah ilustrasi gambar inline Meta AI", 0, "https://freezeehost.com");
```

#### 6. 🔄 AI Dynamic Image (Gambar Dinamis / GIF)
Mengirimkan gambar atau GIF dinamis dengan opsi looping yang berputar secara otomatis.
```javascript
// Parameter: jid, url, isGif, loopCount
await conn.aiDynamic(jid, "https://toko.com/animation.gif", true, 0);
```

#### 7. 📐 AI Latex (Rumus Matematika LaTeX)
Mengirimkan teks beserta format rendering rumus matematika LaTeX yang kompleks.
```javascript
await conn.aiLatex(jid, "Rumus matematika kuadrat sempurna:", ["f(x) = a x^2 + b x + c", "E = m c^2"]);
```

#### 8. 🗺️ AI Map (Anotasi Peta Interaktif)
Mengirim peta interaktif dengan pin titik koordinat beserta judul dan deskripsi lokasinya.
```javascript
// Menggunakan message helper (smsg)
await m.replyMap(-6.2088, 106.8456, [
    { latitude: -6.2088, longitude: 106.8456, title: "Monas", body: "Monumen Nasional Indonesia" }
]);

// Menggunakan koneksi langsung
await conn.aiMap(jid, -6.2088, 106.8456, [
    { latitude: -6.2088, longitude: 106.8456, title: "Monas", body: "Monumen Nasional Indonesia" }
]);
```

#### 9. 🧠 AI Thinking / Reasoning Steps (Langkah Berpikir)
Tampilkan status "Sedang berpikir..." beserta langkah-langkah penalaran detail di dalam thread chat.
```javascript
await conn.aiThinking(jid, "Sedang menganalisis basis data...", [
    { title: "Melacak Log Pesan", body: "Memindai riwayat chat terakhir...", status: 3, isReasoning: true },
    { title: "Mencari Informasi", body: "Menghubungkan ke API server...", status: 2, isEnhancedSearch: true },
    { title: "Selesai", status: 1 }
]);
```

#### 10. 🏷️ AI Model Branding
Tampilkan branding model kecerdasan buatan resmi di bawah balon pesan Anda.
```javascript
// Parameter: jid, teks, tipeModel, namaModel
await conn.aiModel(jid, "Pesan ini diproses menggunakan model Llama Premium.", 2, "Llama 3.1 Instruct");
```

#### 11. 💡 AI Prompts (Saran Prompt Interaktif / Chips)
Tampilkan tombol-tombol saran prompt kecil (quick chips) di bawah balon pesan untuk memandu obrolan pengguna selanjutnya.
```javascript
await conn.aiPrompts(jid, "Bagaimana saya bisa membantu Anda hari ini?", [
    "Jelaskan fitur AI",
    "Kirim tabel harga",
    "Kirim carousel produk"
]);
```
</details>

<details>
<summary><strong>🤖 Meta AI Advanced Protocol Features</strong></summary>

Anda sekarang dapat meniru perilaku bot Meta AI secara mendalam (termasuk reasoning, ingatan, kuota, kutipan pencarian, dan feedback jempol).

#### 1. 🧠 AI Memory (Ingatan Jangka Panjang)
Kirim fakta yang ingin Anda simpan atau hapus dari memori AI tentang pengguna.
```javascript
await conn.aiMemory(jid, "Fakta memori berhasil diperbarui!", ["Fakta baru"], ["Fakta lama"], "Catatan disclaimer");
```

#### 2. 📊 AI Quota (Indikator Kuota Fitur)
Tampilkan sisa kuota fitur AI untuk obrolan/user saat ini.
```javascript
// Sisa kuota 15 kali, reset dalam 24 jam (86400 detik)
await conn.aiQuota(jid, "Sisa kuota harian Anda hampir habis.", 15, 86400);
```

#### 3. 🎨 AI Imagine Metadata (Tipe Generator Gambar)
Metadata tipe generator gambar (standard, avatar, real-time flash, edit).
```javascript
// Opsi tipe: 1 (IMAGINE), 2 (MEMU/Avatar), 3 (FLASH/Realtime), 4 (EDIT)
await conn.aiImagineMetadata(jid, "Generasi Gambar AI...", 3); // Mode FLASH
```

#### 4. 🧭 AI Progress & Reasoning (Langkah Berpikir DeepSeek/o1)
Tampilkan langkah-langkah detail berpikir AI (penalaran/reasoning) dan status eksekusinya.
```javascript
await conn.aiProgress(jid, "Langkah Berpikir", [
    { title: "Menganalisis Kode", body: "Memeriksa sintaks JavaScript...", status: 3, isReasoning: true },
    { title: "Mencari di Google", body: "Mencari dokumentasi terbaru...", status: 2, isEnhancedSearch: true },
    { title: "Selesai", status: 1 }
]);
```

#### 5. 🌐 AI Search Sources (Tombol Kutipan / Sumber)
Tampilkan tombol/link referensi pencarian Google/Bing di bawah pesan.
```javascript
await conn.aiSources(jid, "Berikut adalah hasil pencarian yang ditemukan:", [
    { provider: 2, title: "Google Search", url: "https://google.com", query: "baileys wa web" },
    { provider: 1, title: "Bing Search", url: "https://bing.com", query: "whatsapp api" }
]);
```

#### 6. 👍👎 AI Feedback (Tombol Penilaian Respons)
Kirim penilaian jempol atas/bawah atas respons AI sebelumnya.
```javascript
// Memberikan jempol atas (positif)
await conn.aiFeedback(jid, lastMessageKey, true);

// Memberikan jempol bawah (negatif) dengan komentar keluhan
await conn.aiFeedback(jid, lastMessageKey, false, "Penjelasan kurang akurat.");
```

#### 7. 📣 AI Message Origin (Pemicu Mandiri AI)
Kirim pesan yang ditandai secara resmi dipicu atas inisiatif mandiri oleh AI (*AI-initiated*).
```javascript
await conn.aiMessageOrigin(jid, "Pesan inisiatif AI");
```

#### 8. 🛍️ Product Carousel (Carousel Produk)
Kirim carousel produk dengan informasi detail produk (nama, harga, link, deskripsi, gambar) beserta tombol action di masing-masing kartu produk.
```javascript
await conn.productCarousel(jid, [
    {
        productId: "prod_1",
        title: "Kopi Hitam Espresso",
        description: "Kopi espresso murni pilihan.",
        price: 25000,
        image: "https://toko.com/espresso.jpg",
        url: "https://toko.com/espresso",
        body: "Dapatkan diskon pagi hari!",
        buttons: [{ name: "quick_reply", params: { display_text: "Beli Kopi", id: "buy_kopi" } }]
    },
    {
        productId: "prod_2",
        title: "Matcha Latte Premium",
        description: "Teh hijau matcha asli Jepang.",
        price: 30000,
        image: "https://toko.com/matcha.jpg",
        url: "https://toko.com/matcha",
        body: "Terlaris minggu ini!",
        buttons: [{ name: "quick_reply", params: { display_text: "Beli Matcha", id: "buy_matcha" } }]
    }
], { text: "Silakan pilih produk terbaik kami:" });
```
</details>

---

## 🛡️ Disclaimer
This project is **not affiliated** with WhatsApp/Meta. Use at your own risk.  
Proyek ini dikembangkan untuk tujuan edukasi dan kemudahan pengembangan bot. Penyalahgunaan fitur dapat berakibat pada pemblokiran akun.

## ⚡ Contact & Support
- **Site**: [zass.cloud](https://zass.cloud)
- **Channel**: [Official Channel](https://zass.cloud/wa/channel/info)

---
<div align="center">
  Made with ❤️ by <b>FreeZeeHost Team</b>
</div>
