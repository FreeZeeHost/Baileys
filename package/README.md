<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="@freezeehost/baileys" width="450"/>  

  <h1>@freezeehost/baileys</h1>
  <p><strong>Lightweight, High-Performance, and Feature-Rich WhatsApp Web Library for Node.js</strong></p>
  
  <p>
    <a href="https://npmjs.com/package/@freezeehost/baileys">
      <img src="https://img.shields.io/npm/v/@freezeehost/baileys?color=blue&logo=npm" alt="npm version">
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/github/license/whiskeysockets/baileys?color=green" alt="License">
    </a>
    <a href="https://github.com/FreeZeeHostProject/Baileys/stargazers">
      <img src="https://img.shields.io/github/stars/FreeZeeHostProject/Baileys?color=yellow&logo=github" alt="GitHub stars">
    </a>
  </p>
</div>

---

## 🔌 PnP (Plug & Play) Installation
Ganti library Baileys lama Anda dengan versi **FreeZee** yang lebih stabil dan kencang hanya dalam satu langkah:

### Update `package.json`
Tambahkan baris ini di bagian `dependencies`:
```json
"dependencies": {
  "baileys": "github:FreeZeeHostProject/Baileys"
}
```
Lalu jalankan `npm install` atau `yarn install`.

**Kenapa harus menggunakan versi FreeZee?**
- ✅ **Global Injection**: Otomatis menyediakan `proto`, `smsg`, dan `delay` secara global.
- ✅ **Auto-Fix 405**: Protokol pendaftaran terbaru untuk mencegah "Connection Closed" saat pairing.
- ✅ **Zero Config**: Langsung jalan tanpa perlu merubah kode bot Anda yang sudah ada.

---

## 🔥 High-Performance Engine Updates (2026 Edition)
Library ini telah di-overhaul total untuk performa ekstrim dan keamanan tingkat tinggi.

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| **🎭 Persona Switcher** | Ubah identitas bot menjadi iPhone/Android/Windows secara instan (Anti-Ban). | ✅ **AKTIF** |
| **🛡️ Anti-Delete Core** | Menangkap pesan yang ditarik/dihapus secara otomatis di level library. | ✅ **AKTIF** |
| **🧠 Smart Media Proxy** | Penghemat bandwidth & penyimpanan VPS hingga 80% (Deduplikasi SHA256). | ✅ **AKTIF** |
| **🔐 AES-256 Logger** | Logging aktivitas terenkripsi langsung ke MongoDB (Sangat Aman). | ✅ **AKTIF** |
| **🩺 Auto-Medic** | Pemulihan socket otomatis jika koneksi macet (Self-Healing). | ✅ **AKTIF** |
| **🚦 Task Queue** | Antrian pesan cerdas dengan delay dinamis untuk menghindari limit WA. | ✅ **AKTIF** |
| **👻 Phantom Mode** | Baca pesan tanpa centang biru dan lock status "Always Typing". | ✅ **AKTIF** |

---

## 💎 FreeZee Premium Features

### ☁️ MongoDB Cloud Auth
Lupakan masalah file `auth-info.json` yang korup. Simpan sesi Anda dengan aman di MongoDB dengan sinkronisasi otomatis.

### 🥷 Stealth Mode
Buat bot Anda terlihat seperti manusia dengan simulasi mengetik dan merekam suara secara otomatis.
- `conn.simulateTyping(jid, duration)`
- `conn.simulateRecording(jid, duration)`

### 🚀 Auto Memory Optimizer
Menjaga bot tetap berjalan berbulan-bulan tanpa lag dengan pembersihan cache otomatis.
- `conn.autoOptimize()`

### 🔘 One-Line UI Builders (`conn.msg`)
Sederhanakan interaksi kompleks menjadi satu panggilan fungsi saja:
- **Buttons, List, Polling, Carousel, Native Table.**

---

## 📚 Table of Contents  
- [Instalasi](#-instalasi)  
- [Quick Start](#-quick-start)  
- [Dokumentasi Lengkap](#-dokumentasi-lengkap)  
  - [Connecting Account](#-connecting-account)  
  - [Handling Events](#-handling-events)  
  - [Sending Messages](#-sending-messages)  
  - [Newsletter & Status](#-newsletter--status)  
  - [Groups & Privacy](#-groups--privacy)  
- [Advanced Features](#-advanced-features)  
- [Disclaimer & License](#-disclaimer)  

---

## 📥 Instalasi
```bash
npm install @freezeehost/baileys
# atau
yarn add @freezeehost/baileys
```

---

## 🚀 Quick Start

### CommonJS (CJS)
```javascript
const { default: makeWASocket, useMultiFileAuthState } = require('@freezeehost/baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./sessions");
    const conn = makeWASocket({ 
        printQRInTerminal: true,
        auth: state 
    });

    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('messages.upsert', ({ messages }) => {
        console.log('Pesan baru:', messages[0].message);
    });
}
startBot();
```

### ECMAScript Modules (ESM)
```javascript
import makeWASocket, { useMultiFileAuthState } from '@freezeehost/baileys';

const { state, saveCreds } = await useMultiFileAuthState("./sessions");
const conn = makeWASocket({ auth: state });
// ... rest of your code
```

---

## 📖 Dokumentasi Lengkap

### 🔌 Connecting Account
<details>
<summary><strong>🔗 Connect with QR Code</strong></summary>

```javascript
const conn = makeWASocket({
  printQRInTerminal: true,
  auth: state
})
```
</details>

<details>
<summary><strong>🔢 Connect with Pairing Code</strong></summary>

```javascript
const conn = makeWASocket({
  printQRInTerminal: false,
  auth: state
})

if (!conn.authState.creds.registered) {
  const number = "628xxx"
  const code = await conn.requestPairingCode(number)
  console.log(`Your Pairing Code: ${code}`)
}
```
</details>

### 📨 Sending Messages
<details>
<summary><strong>📝 Text & Media Messages</strong></summary>

```javascript
// Simple Text
await conn.sendMessage(jid, { text: 'Hello!' });

// Image with Caption
await conn.sendMessage(jid, { 
  image: { url: 'https://example.com/image.jpg' },
  caption: 'Hello World!'
});

// View Once Video
await conn.sendMessage(jid, {
  video: fs.readFileSync('video.mp4'),
  viewOnce: true
});
```
</details>

<details>
<summary><strong>🔘 Interactive & UI Messages</strong></summary>

#### Shop Flow Message
```javascript
await conn.sendMessage(jid, {      
  text: 'Body message',
  title: 'Title', 
  footer: '© @freezeehost/baileys',
  shop: { surface: 1, id: 'fb_store_id' }
})
```

#### Carousel Message
```javascript
await conn.sendMessage(jid, {
  text: 'Main Body',
  cards: [{
    image: { url: 'https://example.com/img1.jpg' },
    title: 'Card 1',
    buttons: [{ name: 'quick_reply', buttonParamsJson: '{"display_text":"OK","id":"1"}' }]
  }]
})
```
</details>

### 📣 Newsletter & Status
<details>
<summary><strong>📋 Newsletter Management</strong></summary>

```javascript
// Create Newsletter
const newsletter = await conn.newsletterCreate("Name", "Description");

// Follow/Unfollow
await conn.newsletterFollow(jid);
await conn.newsletterUnfollow(jid);
```
</details>

<details>
<summary><strong>📱 Status Tracker (GETSW)</strong></summary>

Fitur eksklusif untuk memantau dan mengunduh status WhatsApp secara otomatis.
- `conn.onStatusUpdate(callback)`
- `conn.getAllStatusSenders()`
- `conn.downloadStatusMedia(message)`

```javascript
sock.onStatusUpdate((m) => {
    console.log("Status baru dari:", m.key.participant)
})
```
</details>

### 👥 Groups & Privacy
<details>
<summary><strong>🔄 Group Actions</strong></summary>

```javascript
// Add Member
await conn.groupParticipantsUpdate(jid, [memberJid], 'add')

// Promote/Demote
await conn.groupParticipantsUpdate(jid, [memberJid], 'promote')

// Change Group Settings
await conn.groupSettingUpdate(jid, 'locked')
```
</details>

<details>
<summary><strong>🔒 Privacy Settings</strong></summary>

```javascript
// Hide Last Seen
await conn.updateLastSeenPrivacy("none")

// Update Status Privacy
await conn.updateStatusPrivacy("contacts")
```
</details>

---

## 🛡️ Disclaimer
Proyek ini **tidak berafiliasi** dengan WhatsApp/Meta. Segala risiko penggunaan (seperti banned) adalah tanggung jawab masing-masing pengguna. Gunakan secara bijak dan jangan melakukan spam.

## ⚡ Contact & Support
- **Site**: [zass.cloud](https://zass.cloud)
- **Channel**: [Official Channel](https://zass.cloud/wa/channel/info)
- **Community**: Join our community for updates and tips!

## 📜 License
- Lisensi ini diperuntukkan untuk **penggunaan pribadi dan non-komersial**.
- Dilarang keras melakukan **resale** atau **komersialisasi** tanpa izin.
- Berdasarkan library **WhiskeySockets** dengan optimasi oleh FreeZeeHost.

---
<div align="center">
  Made with ❤️ by <b>FreeZeeHost</b>
</div>
