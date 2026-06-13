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

#### 11. Circular Video Notes (Push-To-Video / Video Note)
Mengirim pesan video bulat instan yang langsung diputar otomatis secara circular di obrolan penerima.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.replyVideoNote("./video.mp4");
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.sendVideoNote(jid, "./video.mp4");
    ```

#### 12. Jajak Pendapat Bergambar (Image Polls)
Mengirim jajak pendapat (poll) interaktif bawaan WhatsApp di mana setiap opsi pilihan dapat menyertakan gambar.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.replyImagePoll("Pilih desain kaos favoritmu:", [
        { text: "Desain Hitam", image: "./black_shirt.png" },
        { text: "Desain Putih", image: "./white_shirt.png" }
    ]);
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.sendImagePoll(jid, "Pilih desain kaos favoritmu:", [
        { text: "Desain Hitam", image: "./black_shirt.png" },
        { text: "Desain Putih", image: "./white_shirt.png" }
    ]);
    ```

#### 13. Reschedule Panggilan Terjadwal (Scheduled Call Edit)
Mengubah detail atau membatalkan panggilan suara/video terjadwal di grup WhatsApp.
*   **Contoh Kode via Socket `conn`:**
    // editType: 1 = Batal/Cancel, 2 = Ubah/Modify
    ```javascript
    await conn.editScheduledCall(jid, originalCallMessageKey, "Ulang: Meeting Proyek", Date.now() + 3600000, 2, 1);
    ```

#### 14. Stiker Vektor Animasi (Lottie Stickers)
Mengirim stiker animasi berbasis vektor menggunakan format file Lottie secara native.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.replyLottieSticker("./sticker.tgs");
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.sendLottieSticker(jid, "./sticker.tgs");
    ```

#### 15. Acara Grup Interaktif (Group Event)
Membuat/mengirim pesan undangan acara grup (Group Event) secara terstruktur di mana anggota grup bisa memberikan tanggapan (RSVP).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.replyGroupEvent({
        name: "Developer Meetup 2026",
        description: "Temu santai developer membahas teknologi terbaru Meta AI.",
        startTime: Math.floor(Date.now() / 1000) + 86400, // Besok
        endTime: Math.floor(Date.now() / 1000) + 90000,
        extraGuestsAllowed: true
    });
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.sendGroupEvent(jid, {
        name: "Developer Meetup 2026",
        description: "Temu santai developer membahas teknologi terbaru Meta AI.",
        startTime: Math.floor(Date.now() / 1000) + 86400,
        endTime: Math.floor(Date.now() / 1000) + 90000,
        extraGuestsAllowed: true
    });
    ```

#### 16. Album Media Native (Native Media Album)
Mengelompokkan pengiriman gambar dan video ke dalam satu album native di WhatsApp menggunakan fitur `MessageAssociation`.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.replyAlbum([
        { image: "./foto1.jpg", caption: "Caption Foto 1" },
        { image: "./foto2.png", caption: "Caption Foto 2" },
        { video: "./video.mp4", caption: "Caption Video" }
    ]);
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.sendAlbum(jid, [
        { image: "./foto1.jpg", caption: "Caption Foto 1" },
        { image: "./foto2.png", caption: "Caption Foto 2" },
        { video: "./video.mp4", caption: "Caption Video" }
    ]);
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

Gunakan API ini untuk merender visual pesan interaktif Meta AI yang elegan dan modern secara native pada client WhatsApp. 

Sekarang Anda bisa menggunakan **Message Helper (smsg)** langsung melalui objek pesan `m` (seperti `m.aiTable`, `m.aiCode`, dll.) yang otomatis menargetkan room chat dan membalas pesan secara instan (quoted message) tanpa perlu mendefinisikan `jid`/`options` secara manual.

---

### 1. 📊 AI Table (Tabel Formatted Meta AI)
Mengirimkan tabel terformat yang rapi dengan kolom dan baris tebal/normal.
*   **Penjelasan Parameter:**
    - `title` (Tipe: `String` / `Array`): Judul tabel yang ditampilkan di bagian atas. Jika Anda langsung memasukkan Array, maka judul otomatis menggunakan teks `"Table"`, dan Array tersebut diproses sebagai baris pertama (kolom header).
    - `...args` (Tipe: `Array`): Baris-baris tabel berikutnya. Setiap baris diwakili oleh Array berisi nilai kolom (`["Kolom1", "Kolom2"]`). Baris pertama otomatis dicetak tebal sebagai header tabel.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    // Membuat tabel dengan judul kustom:
    await m.aiTable(
        "Daftar Harga Bot",
        ["Paket", "Harga", "Fitur Utama"],
        ["Basic", "Gratis", "Auto-Reply Standar"],
        ["Pro", "Rp 50.000", "Semua Fitur Meta AI"]
    );

    // Membuat tabel langsung tanpa menuliskan judul kustom:
    await m.aiTable(
        ["Nama", "Jabatan", "Lokasi"],
        ["Alice", "Developer", "Jakarta"],
        ["Bob", "Designer", "Bandung"]
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiTable(
        jid, 
        "Laporan Penjualan", 
        ["Bulan", "Omset"], 
        ["Januari", "10 Juta"], 
        ["Februari", "15 Juta"]
    );
    ```

---

### 2. 💻 AI Code (Blok Kode Pemrograman)
Mengirimkan blok kode pemrograman dengan syntax highlighting yang rapi.
*   **Penjelasan Parameter:**
    - `language` (Tipe: `String`): Nama bahasa pemrograman untuk pewarnaan sintaks (contoh: `'javascript'`, `'python'`, `'cpp'`, `'html'`, `'css'`). Jika Anda melewatkan parameter ini dan langsung mengisinya dengan isi kode, sistem otomatis menggunakan format bahasa `'javascript'`.
    - `code` (Tipe: `String`): Isi kode/script pemrograman lengkap yang ingin dikirimkan.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    // Mengirim kode JavaScript tanpa harus menuliskan nama bahasa pemrograman:
    await m.aiCode('const sum = (a, b) => a + b;\nconsole.log(sum(5, 10));');

    // Mengirim kode Python dengan menentukan bahasa pemrograman secara spesifik:
    await m.aiCode('python', 'def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("FreeZee")');
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiCode(jid, 'javascript', 'console.log("Hello World");');
    ```

---

### 3. 🎬 AI Reels (Instagram/Facebook Reels Preview)
Mengirimkan daftar reels video vertikal horizontal-scrollable yang dapat diputar secara native lengkap dengan thumbnail dan nama pembuat.
*   **Penjelasan Parameter:**
    - `mainText` (Tipe: `String`): Deskripsi pesan utama yang tampil di atas barisan reels.
    - `...args` (Tipe: `Object` / `Array`): Objek-objek video reels. Setiap objek wajib memiliki struktur:
        - `title` (Tipe: `String`): Nama atau judul video reels.
        - `description` (Tipe: `String`): Deskripsi singkat isi video.
        - `videoUrl` (Tipe: `String`): Link URL langsung ke file video MP4.
        - `thumbnailUrl` (Tipe: `String`): Link URL gambar cover/preview video.
        - `profileIconUrl` (Tipe: `String`): Link URL foto profil pembuat video.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiReels(
        "Rekomendasi video hari ini:",
        {
            title: "Belajar JavaScript 60 Detik",
            description: "Belajar arrow function dengan mudah.",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
            profileIconUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
        }
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiReels(jid, "Tonton video berikut:", [
        {
            title: "Tutorial Node.js",
            description: "Membuat bot WhatsApp dari nol.",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
            profileIconUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
        }
    ]);
    ```

---

### 4. 🖼️ AI Grid (Grid Kolase Gambar)
Mengirimkan kolase gambar interaktif estetik yang menampung banyak gambar dalam satu layout rapi secara native (seperti hasil generasi foto Meta AI).
*   **Penjelasan Parameter:**
    - `...args` (Tipe: `String` / `Array`): Daftar link URL gambar yang ingin dimasukkan ke dalam kolase grid.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiGridImage(
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb"
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiGridImage(jid, [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb"
    ]);
    ```

---

### 5. 📎 AI Inline Image (Gambar Inline dengan Teks)
Mengirimkan gambar yang terintegrasi secara inline dengan deskripsi teks di bawahnya beserta link tautan eksternal yang dapat diklik.
*   **Penjelasan Parameter:**
    - `imageUrl` (Tipe: `String`): Link URL file gambar utama yang ingin ditampilkan.
    - `text` (Tipe: `String`): Teks caption atau deskripsi di bawah gambar.
    - `alignment` (Tipe: `Number`): Posisinya rata teks (`0` untuk kiri/leading, `1` untuk kanan/trailing, `2` untuk tengah/center).
    - `tapLink` (Tipe: `String`): Link URL eksternal yang akan otomatis dibuka saat user menekan gambar tersebut.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiInlineImage(
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa", 
        "Jelajahi teknologi hosting super cepat FreeZeeHost.", 
        0, 
        "https://freezeehost.com"
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiInlineImage(
        jid, 
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa", 
        "Jelajahi teknologi kami.", 
        0, 
        "https://freezeehost.com"
    );
    ```

---

### 6. 🔄 AI Dynamic Image (Gambar Dinamis / GIF)
Mengirimkan gambar bergerak atau GIF dinamis dengan opsi jumlah putaran putar otomatis.
*   **Penjelasan Parameter:**
    - `url` (Tipe: `String`): Link URL file gambar/GIF bergerak.
    - `isGif` (Tipe: `Boolean`): Nilai `true` jika ingin diputar sebagai video GIF/looping animasi bergerak, atau `false` untuk gambar biasa.
    - `loopCount` (Tipe: `Number`): Jumlah perulangan putaran animasi. Isi dengan nilai `0` untuk putaran tanpa batas waktu (infinite loop).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiDynamic("https://media.giphy.com/media/3o7qE1YN7aBOFPRw8E/giphy.gif", true, 0);
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiDynamic(jid, "https://media.giphy.com/media/3o7qE1YN7aBOFPRw8E/giphy.gif", true, 0);
    ```

---

### 7. 📐 AI Latex (Rumus Matematika LaTeX)
Mengirimkan teks pengantar beserta rendering format rumus matematika LaTeX yang rumit dengan hasil visual rapi secara native.
*   **Penjelasan Parameter:**
    - `text` (Tipe: `String`): Kalimat pembuka atau pengantar sebelum rumus matematika.
    - `...args` (Tipe: `String`): Baris-baris ekspresi rumus matematika menggunakan sintaks penulisan LaTeX (contoh: `"E = m c^2"`).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiLatex(
        "Berikut adalah rumus fisika dan kalkulus dasar:",
        "E = m c^2",
        "\\int_{a}^{b} x^2 \\, dx = \\frac{b^3 - a^3}{3}"
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiLatex(jid, "Rumus kuadratik:", ["x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"]);
    ```

---

### 8. 🗺️ AI Map (Anotasi Peta Interaktif)
Mengirimkan peta navigasi interaktif lengkap dengan penanda titik koordinat kustom (pin map) beserta judul dan deskripsi detail lokasi tersebut.
*   **Penjelasan Parameter:**
    - `lat` (Tipe: `Number`): Koordinat garis lintang (latitude) pusat peta.
    - `lng` (Tipe: `Number`): Koordinat garis bujur (longitude) pusat peta.
    - `annotations` (Tipe: `Array`): Daftar objek pin penanda lokasi pada peta. Setiap objek pin wajib memiliki data:
        - `latitude` (Tipe: `Number`): Koordinat lintang pin tersebut.
        - `longitude` (Tipe: `Number`): Koordinat bujur pin tersebut.
        - `title` (Tipe: `String`): Judul nama lokasi pin penanda.
        - `body` (Tipe: `String`): Deskripsi singkat mengenai lokasi pin tersebut.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiMap(-6.2088, 106.8456, [
        { 
            latitude: -6.2088, 
            longitude: 106.8456, 
            title: "Monas Jakarta", 
            body: "Pusat Monumen Nasional Indonesia" 
        }
    ]);
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiMap(jid, -6.2088, 106.8456, [
        { 
            latitude: -6.2088, 
            longitude: 106.8456, 
            title: "Monas", 
            body: "Monumen Nasional" 
        }
    ]);
    ```

---

### 9. 🧠 AI Thinking / Reasoning Steps (Langkah Berpikir)
Menampilkan animasi status progress berjalan "Sedang berpikir..." beserta detail langkah log pemrosesan penalaran internal (seperti model o1/DeepSeek) dalam chat balon secara realtime.
*   **Penjelasan Parameter:**
    - `description` (Tipe: `String`): Teks keterangan utama yang ditampilkan di atas proses berpikir.
    - `...args` (Tipe: `String` / `Object`): Langkah-langkah progress pemrosesan. Anda dapat memasukkan data berupa string teks langkah secara berurutan. Langkah terakhir akan otomatis dianggap sebagai langkah aktif yang sedang dikerjakan.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiThinking(
        "Menganalisis permintaan Anda...",
        "Memeriksa parameter input",
        "Mencari data di server pusat",
        "Menyusun visual tabel respons"
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiThinking(jid, "Sedang menghitung nilai matematika...", [
        "Membaca angka input",
        "Mengevaluasi operasi perkalian",
        "Menyelesaikan hasil akhir"
    ]);
    ```

---

### 10. 🏷️ AI Model Branding
Menempelkan tanda/logo branding model kecerdasan buatan resmi secara estetik di bagian bawah gelembung balon pesan respons.
*   **Penjelasan Parameter:**
    - `text` (Tipe: `String`): Isi teks pesan utama.
    - `modelType` (Tipe: `Number`): Tipe layout/logo branding (contoh: gunakan angka `1` atau `2` untuk variasi visual logo AI yang berbeda).
    - `modelName` (Tipe: `String`): Nama model kecerdasan buatan yang ingin dicantumkan (contoh: `'Llama 3.2 Instruct'`).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiModel(
        "Hasil analisis server menunjukkan kestabilan server optimal.", 
        2, 
        "Llama 3.1 Pro"
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiModel(jid, "Hasil kompilasi selesai.", 1, "Meta AI CodeLlama");
    ```

---

### 11. 💡 AI Prompts (Saran Prompt Interaktif / Chips)
Menampilkan deretan tombol kecil saran teks cepat (quick chips) di bawah balon respons untuk membantu memudahkan interaksi chat berikutnya bagi pengguna.
*   **Penjelasan Parameter:**
    - `text` (Tipe: `String`): Kalimat tanya atau arahan di atas tombol saran prompt.
    - `...args` (Tipe: `String`): Judul teks tombol-tombol saran prompt yang ingin ditampilkan (contoh: `"Fitur Bot"`, `"Daftar Layanan"`).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiPrompts(
        "Ada hal lain yang ingin Anda ketahui?",
        "Tunjukkan harga paket",
        "Cara sewa bot",
        "Hubungi Admin"
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiPrompts(jid, "Pilih bantuan:", ["Cek Kuota", "Ganti Bahasa"]);
    ```

</details>

<details>
<summary><strong>🤖 Meta AI Advanced Protocol Features</strong></summary>

Gunakan fitur protokol tingkat lanjut untuk mensimulasikan fungsionalitas cerdas Meta AI yang mendalam (seperti sistem ingatan fakta, manajemen kuota, integrasi sumber pencarian web, tombol feedback jempol, hingga carousel produk).

Sekarang Anda bisa menggunakan **Message Helper (smsg)** langsung melalui objek pesan `m` (seperti `m.aiMemory`, `m.aiQuota`, dll.) yang otomatis menargetkan room chat dan membalas pesan secara instan (quoted message) tanpa perlu mendefinisikan `jid`/`options` secara manual.

---

### 1. 🧠 AI Memory (Ingatan Jangka Panjang)
Kirim fakta yang ingin Anda simpan atau hapus secara resmi dari data memori AI tentang user bersangkutan.
*   **Penjelasan Parameter:**
    - `text` (Tipe: `String`): Pesan utama yang dikirim bersamaan dengan pembaruan memori.
    - `addedFacts` (Tipe: `Array`): Daftar string fakta baru yang ingin disimpan ke memori user.
    - `removedFacts` (Tipe: `Array`): Daftar string fakta lama yang ingin dihapus dari memori user.
    - `disclaimer` (Tipe: `String`): Keterangan disclaimer kecil di bagian paling bawah.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiMemory(
        "Sistem berhasil memperbarui ingatan profil Anda!",
        ["User menyukai pemrograman Node.js", "User berlangganan paket Premium VPS"],
        ["User menggunakan hosting gratisan"],
        "Ingatan disimpan secara lokal untuk meningkatkan kecerdasan respons."
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiMemory(
        jid,
        "Memori diperbarui.",
        ["User tinggal di Jakarta"],
        [],
        "Memori AI aktif."
    );
    ```

---

### 2. 📊 AI Quota (Indikator Kuota Fitur)
Menampilkan sisa kuota penggunaan fitur bot AI untuk pengguna saat ini.
*   **Penjelasan Parameter:**
    - `text` (Tipe: `String`): Pesan peringatan kuota kepada pengguna.
    - `remainingQuota` (Tipe: `Number`): Jumlah angka sisa kuota pemakaian fitur yang masih dimiliki pengguna.
    - `expirationSecs` (Tipe: `Number`): Waktu hitung mundur kapan kuota akan pulih kembali (dalam satuan detik).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiQuota(
        "Anda telah menggunakan sebagian besar batas pembuatan gambar harian Anda.", 
        5, 
        86400
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiQuota(jid, "Batas kuota harian:", 10, 3600);
    ```

---

### 3. 🎨 AI Imagine Metadata (Tipe Generator Gambar)
Menandai pesan dengan metadata tipe operasi generator gambar kecerdasan buatan.
*   **Penjelasan Parameter:**
    - `text` (Tipe: `String`): Pesan konfirmasi/keterangan gambar.
    - `imagineType` (Tipe: `Number`): Angka tipe operasi generator gambar (`1` untuk IMAGINE standar, `2` untuk MEMU/Avatar kustom, `3` untuk FLASH/real-time generation, `4` untuk EDIT/modifikasi gambar).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiImagineMetadata("Sistem sedang memproses avatar real-time Anda...", 3);
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiImagineMetadata(jid, "Membuat gambar baru...", 1);
    ```

---

### 4. 🧭 AI Progress & Reasoning (Langkah Berpikir Lanjut)
Mengirimkan status progres tugas berjalan yang komprehensif lengkap dengan penanda tipe langkah (penalaran/pencarian web).
*   **Penjelasan Parameter:**
    - `description` (Tipe: `String`): Judul umum status progres.
    - `steps` (Tipe: `Array`): Daftar objek detail langkah pekerjaan. Setiap objek langkah memiliki struktur data:
        - `title` (Tipe: `String`): Judul langkah progres.
        - `body` (Tipe: `String`): Deskripsi detail mengenai langkah tersebut.
        - `status` (Tipe: `Number`): Status penyelesaian langkah (`1` untuk direncanakan/planned, `2` untuk sedang diproses/executing, `3` untuk selesai/finished).
        - `isReasoning` (Tipe: `Boolean`): Nilai `true` jika langkah ini merupakan penalaran berpikir internal.
        - `isEnhancedSearch` (Tipe: `Boolean`): Nilai `true` jika langkah ini melibatkan pencarian data secara eksternal (search web).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiProgress(
        "Menjalankan Pemindaian Server...",
        [
            { title: "Verifikasi API Key", body: "Memeriksa kecocokan kunci keamanan...", status: 3, isReasoning: true },
            { title: "Koneksi Database", body: "Membangun jembatan data...", status: 2, isEnhancedSearch: false },
            { title: "Kirim Hasil Laporan", status: 1 }
        ]
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiProgress(jid, "Proses bot:", [
        { title: "Inisialisasi", body: "Memuat modul pendukung...", status: 3 }
    ]);
    ```

---

### 5. 🌐 AI Search Sources (Tombol Kutipan / Sumber)
Menyematkan referensi sumber tepercaya dari hasil pencarian web mesin pencari Google/Bing di bagian bawah balon pesan.
*   **Penjelasan Parameter:**
    - `text` (Tipe: `String`): Isi teks jawaban pesan utama.
    - `sources` (Tipe: `Array`): Daftar objek referensi website pencarian. Setiap objek sumber wajib berisi data:
        - `provider` (Tipe: `Number`): Angka penanda penyedia mesin pencari (`1` untuk Bing, `2` untuk Google).
        - `title` (Tipe: `String`): Judul halaman web/artikel sumber referensi.
        - `url` (Tipe: `String`): Alamat link website sumber referensi yang dapat diklik langsung.
        - `query` (Tipe: `String`): Kata kunci pencarian yang digunakan untuk menemukan referensi tersebut.
        - `citationNumber` (Tipe: `Number`): Angka urutan nomor sitasi kutipan.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiSources(
        "Berikut adalah dokumentasi referensi mengenai WhatsApp API:",
        [
            { 
                provider: 2, 
                title: "GitHub Baileys Library", 
                url: "https://github.com/WhiskeySockets/Baileys", 
                query: "baileys whatsapp node.js", 
                citationNumber: 1 
            },
            { 
                provider: 1, 
                title: "Dokumentasi Resmi Meta API", 
                url: "https://developers.facebook.com/docs/whatsapp", 
                query: "whatsapp cloud api developer guide", 
                citationNumber: 2 
            }
        ]
    );
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiSources(jid, "Sumber informasi:", [
        { provider: 2, title: "Google", url: "https://google.com", query: "test", citationNumber: 1 }
    ]);
    ```

---

### 6. 👍👎 AI Feedback (Tombol Penilaian Respons)
Mengirimkan rating penilaian umpan balik (jempol ke atas/bawah) terhadap pesan tertentu sebelumnya untuk optimalisasi kualitas obrolan.
*   **Penjelasan Parameter:**
    - `key` (Tipe: `Object`): Kunci pengenal unik dari pesan target yang ingin dinilai (`{ remoteJid, id, fromMe }`).
    - `positive` (Tipe: `Boolean`): Nilai `true` jika memberikan jempol ke atas (menyukai respons), atau `false` untuk jempol ke bawah (kurang menyukai respons).
    - `text` (Tipe: `String`): Kalimat penjelasan keluhan kustom jika memberikan rating negatif (opsional).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    // Memberi penilaian jempol ke atas pada pesan terakhir:
    const targetKey = m.quoted ? m.quoted.key : m.key;
    await m.aiFeedback(targetKey, true);

    // Memberi penilaian jempol ke bawah disertai alasan keluhan:
    await m.aiFeedback(targetKey, false, "Respons yang diberikan keluar dari konteks pertanyaan.");
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiFeedback(jid, targetKey, true);
    ```

---

### 7. 📣 AI Message Origin (Pemicu Mandiri AI)
Mengirimkan pesan dengan label metadata khusus yang menandakan pesan tersebut dipicu atas inisiatif mandiri oleh AI (*AI-initiated*).
*   **Penjelasan Parameter:**
    - `text` (Tipe: `String`): Isi teks pesan yang dikirimkan.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.aiMessageOrigin("Halo! Saya mendeteksi ketidakaktifan obrolan, apakah ada yang bisa saya bantu kembali?");
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.aiMessageOrigin(jid, "Pemberitahuan terjadwal otomatis dari AI.");
    ```

---

### 8. 🛍️ Product Carousel (Carousel Produk)
Mengirimkan kartu carousel produk yang dapat digeser secara horizontal lengkap dengan nama produk, deskripsi, harga, tautan pembelian, foto produk, serta tombol aksi quick reply di setiap kartu produk.
*   **Penjelasan Parameter:**
    - `products` (Tipe: `Array`): Daftar objek informasi kartu produk. Setiap kartu produk wajib berisi data:
        - `productId` (Tipe: `String`): ID pengenal unik produk.
        - `title` (Tipe: `String`): Nama produk.
        - `description` (Tipe: `String`): Penjelasan singkat produk.
        - `price` (Tipe: `Number`): Nominal harga produk (dalam angka utuh, contoh: `25000` untuk Rp 25.000).
        - `image` (Tipe: `String`): Link URL gambar visual produk.
        - `url` (Tipe: `String`): Link URL halaman pembelian produk.
        - `body` (Tipe: `String`): Teks keterangan promo/layanan tambahan di bawah deskripsi kartu produk.
        - `buttons` (Tipe: `Array`): Tombol aksi di bawah kartu produk. Berisi objek `{ name: "quick_reply", params: { display_text: "Label Tombol", id: "action_id" } }`.
    - `options` (Tipe: `Object`): Pilihan opsi konfigurasi tambahan seperti deskripsi teks utama carousel (`text`) dan footer carousel (`footer`).
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    await m.productCarousel([
        {
            productId: "kopi_01",
            title: "Espresso Coffee Blend",
            description: "Kopi robusta espresso berkualitas tinggi.",
            price: 25000,
            image: "https://images.unsplash.com/photo-1510972527409-cca19de31749",
            url: "https://toko.com/kopi-espresso",
            body: "Diskon Hemat Pagi Hari",
            buttons: [{ name: "quick_reply", params: { display_text: "Pesan Sekarang", id: "pesan_espresso" } }]
        },
        {
            productId: "teh_02",
            title: "Matcha Latte Premium",
            description: "Teh matcha hijau murni dari Jepang.",
            price: 30000,
            image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a",
            url: "https://toko.com/matcha-latte",
            body: "Terlaris Pekan Ini",
            buttons: [{ name: "quick_reply", params: { display_text: "Pesan Sekarang", id: "pesan_matcha" } }]
        }
    ], { text: "Silakan pilih menu minuman terbaik kami di bawah ini:" });
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.productCarousel(jid, productsList, { text: "Daftar produk kami:" });
    ```

---

### 9. ⏰ AI Reminder (Pengingat Pesan Meta AI)
Mengirimkan pesan penunjuk pengingat berbasis Meta AI untuk membuat, mengedit, atau menjadwalkan notifikasi asisten AI.
*   **Contoh Kode via `m` (Paling Mudah):**
    ```javascript
    // Memasang pengingat sekali (frequency: 1) untuk 1 jam ke depan
    await m.replyAIReminder("Mulai meeting evaluasi", Date.now() + 3600000, 1);
    ```
*   **Contoh Kode via Socket `conn`:**
    ```javascript
    await conn.sendAIReminder(jid, "Ingatkan untuk minum obat", Date.now() + 7200000, 1);
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
