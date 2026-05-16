# 🚀 @freezeehost/baileys 

[![npm version](https://img.shields.io/badge/version-2.1.5-blue.svg)](https://www.npmjs.com/package/@freezeehost/baileys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stability: God-Mode](https://img.shields.io/badge/Stability-God--Mode-brightgreen.svg)]()

> **The Most Powerful, Stable, and Lightweight Baileys Fork in 2026.**  
> Dirancang khusus untuk bot WhatsApp enterprise dengan fitur premium yang tidak ada di versi original.

---

## 🌟 Fitur Unggulan (FreeZee Premium)

### ☁️ MongoDB Cloud Auth
Lupakan `auth-info.json` yang sering corrupt. Sesi bot Anda sekarang disimpan secara otomatis di MongoDB Cloud dengan sistem **Atomic Save**.
- **Anti-Reconnect Loop**: Menghindari koneksi terputus tiba-tiba.
- **Auto-Sync**: Sesi otomatis tersinkronisasi antar server.

### 🥷 Stealth Mode (Fitur Hantu)
Bot Anda akan terlihat lebih manusiawi dengan simulasi interaksi asli.
- `sock.simulateTyping(jid, duration)` -> Muncul status "Mengetik..."
- `sock.simulateRecording(jid, duration)` -> Muncul status "Merekam suara..."

### 🚀 Auto Memory Optimizer
Menjaga bot tetap ringan dan responsif meskipun aktif berhari-hari.
- `sock.autoOptimize()` -> Membersihkan cache chat & pesan lama secara cerdas untuk membebaskan RAM.

### 🎨 Advanced Sticker Engine
Engine pembuatan stiker terintegrasi yang mendukung gambar dan video secara langsung.
- `sock.sendStickerPack(jid, paths, options)` -> Kirim paket stiker massal dengan watermark kustom.

### 🔘 UI Interactive Builders
Kirim pesan interaktif hanya dengan satu baris kode pendek!
- **Buttons**: `sock.msg.buttons(...)`
- **List**: `sock.msg.list(...)`
- **Polling**: `sock.msg.poll(...)`
- **Carousel**: `sock.msg.carousel(...)`
- **Native Table**: `sock.msg.nativeTable(...)`

---

## 📦 Instalasi

```bash
npm install @freezeehost/baileys
```

Atau gunakan langsung dari GitHub:
```bash
npm install https://github.com/FreeZeeHostProject/Baileys
```

---

## 🛠️ Penggunaan Dasar (Hybrid Support)

Library ini mendukung **ESM** (`import`) dan **CommonJS** (`require`) secara native.

### Menggunakan ESM (Modern)
```javascript
import { makeFreeZeeSocket, useMongoFileAuthState } from '@freezeehost/baileys';

const { state, saveCreds } = await useMongoFileAuthState("URL_MONGODB_ANDA");
const sock = makeFreeZeeSocket({
    auth: state,
    printQRInTerminal: true
});

sock.ev.on('creds.update', saveCreds);
```

### Menggunakan CommonJS (Legacy)
```javascript
const { makeFreeZeeSocket, useMongoFileAuthState } = require('@freezeehost/baileys');

async function connect() {
    const { state, saveCreds } = await useMongoFileAuthState();
    const conn = makeFreeZeeSocket({ auth: state });
    // ...
}
```

---

## 💎 Contoh Fitur Premium

### 1. Kirim Pesan Tombol (Easy Way)
```javascript
await sock.msg.buttons(jid, "Halo Bosku!", "Silakan pilih menu di bawah:", [
    { buttonId: 'id1', buttonText: { displayText: 'Menu Utama' } },
    { buttonId: 'id2', buttonText: { displayText: 'Owner' } }
]);
```

### 2. Aktifkan Mode Hantu (Stealth)
```javascript
// Sebelum memproses perintah berat, biar bot terlihat "real"
await sock.simulateTyping(jid, 2000); 
await sock.sendMessage(jid, { text: "Ini hasil pencariannya..." });
```

### 3. Kirim Paket Stiker Massal
```javascript
await sock.sendStickerPack(jid, ['./stiker1.png', './video.mp4'], {
    packname: 'FreeZeeHost Pack',
    author: '@freezeehost'
});
```

### 4. Optimalisasi RAM (Setiap 1 Jam)
```javascript
setInterval(() => {
    sock.autoOptimize();
    console.log('RAM Bot dibersihkan!');
}, 3600000);
```

---

## 🤝 Kontribusi
Ingin menambah fitur canggih lainnya? Silakan lakukan Pull Request ke repository kami!

**Author**: 𝙁𝙧𝙚𝙚𝙕𝙚𝙚𝙃𝙤𝙨𝙩  
**License**: MIT  

---
*Made with ❤️ by FreeZeeHost Project*
