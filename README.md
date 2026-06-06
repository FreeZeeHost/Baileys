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
