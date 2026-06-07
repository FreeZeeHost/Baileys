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
-   📊 **AI Table**: `m.replyTable(title, rows)`
-   🎬 **AI Reels**: `m.replyReels(text, reels)`
-   💻 **AI Code**: `m.replyCode(language, code)`
-   🖼️ **AI Grid**: `m.replyGridImage(imageUrls)`
-   💭 **AI Thinking**: `m.replyThinking(description, steps)`
-   💬 **AI Prompts**: `m.replyPrompts(text, chips)`
-   🧠 **AI Memory**: `m.replyMemory(added, removed, disclaimer)`
-   📈 **AI Quota**: `m.replyQuota(remainingQuota, expirationSecs)`
-   🎨 **AI Imagine Type**: `m.replyImagineMetadata(imagineType)`
-   🧭 **AI Progress/Reasoning**: `m.replyProgress(steps)`
-   🌐 **AI Search Sources**: `m.replySources(sources)`
-   📣 **AI Message Origin**: `m.replyMessageOrigin()`
-   🛍️ **Product Carousel**: `m.replyProductCarousel(products)`

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
    conn.onCommand('ping', (m) => m.reply('Pong!'));
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
// Menggunakan message helper (smsg)
await m.replyStickerPack({
    name: "FreeZee Baileys Uji Pack",
    publisher: "FreeZeeHost",
    description: "Deskripsi pack stiker",
    cover: { url: "https://files.catbox.moe/gw41eq.png" },
    stickers: [
        { sticker: { url: "https://files.catbox.moe/gw41eq.png" }, emojis: ["🔥"] },
        { sticker: { url: "https://files.catbox.moe/gw41eq.png" }, emojis: ["💡"] }
    ]
});

// Menggunakan koneksi langsung
await conn.sendStickerPack(jid, {
    name: "FreeZee Baileys Uji Pack",
    publisher: "FreeZeeHost",
    cover: bufferCover,
    stickers: [
        { sticker: bufferSticker1, emojis: ["🔥"] }
    ]
});
```
</details>

<details>
<summary><strong>🤖 Meta AI Advanced Protocol Features</strong></summary>

Anda sekarang dapat meniru perilaku bot Meta AI secara mendalam (termasuk reasoning, ingatan, kuota, kutipan pencarian, dan feedback jempol).

#### 1. 🧠 AI Memory (Ingatan Jangka Panjang)
Kirim fakta yang ingin Anda simpan atau hapus dari memori AI tentang pengguna.
```javascript
// Menggunakan message helper (smsg)
await m.replyMemory(
    ["User menyukai JavaScript", "User lahir di Jakarta"], // Fakta baru untuk disimpan
    ["User menyukai Python"],                              // Fakta lama untuk dihapus
    "Memori disimpan otomatis untuk personalisasi respons."
);

// Menggunakan koneksi langsung
await conn.aiMemory(jid, "Fakta memori berhasil diperbarui!", ["Fakta baru"], ["Fakta lama"], "Catatan disclaimer");
```

#### 2. 📊 AI Quota (Indikator Kuota Fitur)
Tampilkan sisa kuota fitur AI untuk obrolan/user saat ini.
```javascript
// Sisa kuota 15 kali, reset dalam 24 jam (86400 detik)
await m.replyQuota(15, 86400);

// Menggunakan koneksi langsung
await conn.aiQuota(jid, "Sisa kuota harian Anda hampir habis.", 15, 86400);
```

#### 3. 🎨 AI Imagine Metadata (Tipe Generator Gambar)
Metadata tipe generator gambar (standard, avatar, real-time flash, edit).
```javascript
// Opsi tipe: 1 (IMAGINE), 2 (MEMU/Avatar), 3 (FLASH/Realtime), 4 (EDIT)
await m.replyImagineMetadata(3); // Mode FLASH
```

#### 4. 🧭 AI Progress & Reasoning (Langkah Berpikir DeepSeek/o1)
Tampilkan langkah-langkah detail berpikir AI (penalaran/reasoning) dan status eksekusinya.
```javascript
await m.replyProgress([
    { title: "Menganalisis Kode", body: "Memeriksa sintaks JavaScript...", status: 3, isReasoning: true },
    { title: "Mencari di Google", body: "Mencari dokumentasi terbaru...", status: 2, isEnhancedSearch: true },
    { title: "Selesai", status: 1 }
]);
```

#### 5. 🌐 AI Search Sources (Tombol Kutipan / Sumber)
Tampilkan tombol/link referensi pencarian Google/Bing di bawah pesan.
```javascript
await m.replySources([
    { provider: 2, title: "Google Search", url: "https://google.com", query: "baileys wa web" },
    { provider: 1, title: "Bing Search", url: "https://bing.com", query: "whatsapp api" }
]);
```

#### 6. 👍👎 AI Feedback (Tombol Penilaian Respons)
Kirim penilaian jempol atas/bawah atas respons AI sebelumnya.
```javascript
// Memberikan jempol atas (positif)
await m.aiFeedback(true);

// Memberikan jempol bawah (negatif) dengan komentar keluhan
await m.aiFeedback(false, "Penjelasan kurang akurat.");
```

#### 7. 📣 AI Message Origin (Pemicu Mandiri AI)
Kirim pesan yang ditandai secara resmi dipicu atas inisiatif mandiri oleh AI (*AI-initiated*).
```javascript
await m.replyMessageOrigin();
```

#### 8. 🛍️ Product Carousel (Carousel Produk)
Kirim carousel produk dengan informasi detail produk (nama, harga, link, deskripsi, gambar) beserta tombol action di masing-masing kartu produk.
```javascript
// Menggunakan message helper (smsg)
await m.replyProductCarousel([
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
