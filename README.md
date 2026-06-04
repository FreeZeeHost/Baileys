<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="@freezeehost/baileys" width="550"/>  

  <h1>@freezeehost/baileys (2026 Edition)</h1>
  <p><strong>The Most Advanced, High-Performance, and Feature-Rich WhatsApp Web Library for Node.js</strong></p>
  
  <p>
    <a href="https://npmjs.com/package/@freezeehost/baileys">
      <img src="https://img.shields.io/npm/v/@freezeehost/baileys?color=blue&style=for-the-badge&logo=npm" alt="npm version">
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/github/license/whiskeysockets/baileys?color=green&style=for-the-badge" alt="License">
    </a>
    <a href="https://github.com/FreeZeeHostProject/Baileys/stargazers">
      <img src="https://img.shields.io/github/stars/FreeZeeHostProject/Baileys?color=yellow&style=for-the-badge&logo=github" alt="GitHub stars">
    </a>
  </p>
</div>

---

## 🌟 Introduction
**Baileys FreeZeeHost Edition** adalah evolusi dari library Baileys standar (WhiskeySockets). Kami telah menambahkan layer optimasi ekstrim, fitur keamanan tingkat tinggi, dan API yang jauh lebih user-friendly untuk developer bot masa kini.

Library ini dirancang untuk **kecepatan, stabilitas, dan keamanan (Anti-Ban)**. Tidak memerlukan Selenium atau Chromium, menghemat RAM server Anda hingga 80%.

---

## 📌 Table of Contents
- [🔌 Instalasi](#-instalasi)
- [🔢 Connecting Account](#-connecting-account)
- [💎 Fitur Premium (Eksklusif)](#-fitur-premium-eksklusif)
  - [🎭 Persona Switcher](#-persona-switcher)
  - [👻 Phantom Mode](#-phantom-mode)
  - [🛡️ Anti-Delete Core](#-anti-delete-core)
  - [🧠 Smart Media Proxy](#-smart-media-proxy)
  - [🩺 Auto-Medic (Self-Healing)](#-auto-medic-self-healing)
- [🔘 Interactive UI Builders (sock.msg)](#-interactive-ui-builders-sockmsg)
- [📱 Status Tracker (GETSW)](#-status-tracker-getsw)
- [💾 Saving & Restoring Sessions](#-saving--restoring-sessions)
- [📨 Sending Messages (Complete Guide)](#-sending-messages-complete-guide)
- [📡 Handling Events](#-handling-events)
- [👥 Groups & Privacy](#-groups--privacy)
- [⚙️ Internal Optimizations](#-internal-optimizations)
- [🛡️ Disclaimer & License](#-disclaimer--license)

---

## 🔌 Instalasi

### Menggunakan NPM
```bash
npm install @freezeehost/baileys
```

### Menggunakan Github (Edge Version)
```bash
npm install github:FreeZeeHostProject/Baileys
```

### Drop-in Replacement (PnP)
Jika Anda sudah memiliki bot berbasis Baileys, cukup ubah dependencies di `package.json` Anda:
```json
"dependencies": {
  "baileys": "github:FreeZeeHostProject/Baileys"
}
```

---

## 🔢 Connecting Account

### 🔗 Connect with QR Code
```javascript
const { default: makeWASocket, useMultiFileAuthState, patchSocket } = require('@freezeehost/baileys');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ["Ubuntu", "Chrome", "20.0.0"]
    });

    // WAJIB: Aktifkan fitur premium FreeZeeHost
    patchSocket(sock);

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') console.log("Bot Online!");
    });
}
start();
```

### 🔢 Connect with Pairing Code
Metode pendaftaran tanpa scan QR, hanya menggunakan nomor telepon.
```javascript
const sock = makeWASocket({ auth: state, printQRInTerminal: false });
patchSocket(sock);

if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode("628xxxxxxxx");
    console.log(`Your Pairing Code: ${code}`);
}
```

---

## 💎 Fitur Premium (Eksklusif)

### 🎭 Persona Switcher
Ubah identitas perangkat bot Anda secara instan tanpa perlu relogin. Ini sangat efektif untuk menghindari filter spam WhatsApp.
```javascript
// Opsi: 'ios', 'android', 'windows', 'macos', 'portal', 'wearos'
sock.setPersona('ios'); 
// Sekarang bot Anda akan terdeteksi sebagai iPhone oleh WhatsApp
```

### 👻 Phantom Mode
Baca pesan tanpa memicu centang biru (Read Receipt) secara selektif.
```javascript
sock.ghostMode = true; // Aktifkan mode hantu

// Kecualikan Owner/VIP agar mereka tetap melihat centang biru saat Anda baca
sock.setVIP("628123456789@s.whatsapp.net", true);
```

### 🛡️ Anti-Delete Core
Capture pesan yang ditarik/dihapus oleh pengirim secara otomatis.
```javascript
sock.ev.on('message.delete', ({ jid, id, message }) => {
    console.log(`Pesan dihapus oleh ${jid}. Konten: ${message.text}`);
    // Kirim balik pesan yang dihapus ke chat
    sock.sendMessage(jid, { text: `Terciduk hapus pesan:\n\n${message.text}` }, { quoted: message });
});
```

### 🧠 Smart Media Proxy
Sistem deduplikasi media berbasis SHA256. Jika Anda mengirim file yang sama berulang kali, library tidak akan melakukan upload ulang, melainkan menggunakan cache internal untuk menghemat bandwidth.

### 🩺 Auto-Medic (Self-Healing)
Mendeteksi jika koneksi WhatsApp macet (Silent Failure). Jika dalam 45 detik tidak ada data yang masuk, library akan melakukan restart koneksi secara otomatis untuk menjaga bot tetap online 24/7.

---

## 🔘 Interactive UI Builders (sock.msg)
Sederhanakan pengiriman pesan interaktif menjadi satu baris kode yang elegan.

```javascript
// 1. Interactive List Message
await sock.msg.list(jid, "Menu Utama", "Pilih menu di bawah", "© FreeZeeHost", "Klik Disini", [
    { title: "Kategori A", rows: [{ title: "Fitur 1", id: ".cmd1", description: "Deskripsi fitur" }] }
]);

// 2. Carousel Card (Slider)
await sock.msg.carousel(jid, [
    { title: "Produk 1", body: "Murah meriah", image: { url: "..." }, buttons: [...] },
    { title: "Produk 2", body: "Kualitas premium", image: { url: "..." }, buttons: [...] }
]);

// 3. Native Flow Table (Tabel Cantik)
const rows = [
    { col1: "Item", col2: "Price" },
    { col1: "VPN 1 Month", col2: "Rp 10.000" }
];
await sock.msg.nativeTable(jid, "Price List", rows);
```

---

## 📱 Status Tracker (GETSW)
Fitur eksklusif untuk memantau status WhatsApp orang lain.
```javascript
// Event saat ada status baru masuk
sock.onStatusUpdate(async (m) => {
    console.log(`Status baru dari ${m.key.participant}`);
    // Otomatis download media status tersebut
    const buffer = await sock.downloadStatusMedia(m);
});

// Ambil list semua pengirim status
const senders = sock.getAllStatusSenders();
```

---

## 💾 Saving & Restoring Sessions

### 📂 Multi-File Auth (Standard)
```javascript
const { state, saveCreds } = await useMultiFileAuthState('sessions_folder');
```

### ☁️ MongoDB Cloud Auth (Recommended)
Simpan sesi Anda di awan (Cloud) untuk keamanan ekstra dan kemudahan migrasi VPS.
```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient("your_mongo_url");
await client.connect();

const collection = client.db('bot').collection('auth');
const { state, saveCreds } = await useMongoFileAuthState(collection);
```

---

## 📨 Sending Messages (Complete Guide)

### 📝 Text & Formatting
```javascript
await sock.sendMessage(jid, { text: 'Hello *Bold*, _Italic_, ~Strike~' });

// Dengan Mention
await sock.sendMessage(jid, { 
    text: 'Hello @628xxx', 
    mentions: ['628xxx@s.whatsapp.net'] 
});
```

### 🖼️ Media Messages
```javascript
// Image with Caption
await sock.sendMessage(jid, { image: { url: 'path/to/img.jpg' }, caption: 'Cool!' });

// Video / Video Note (PTV)
await sock.sendMessage(jid, { video: { url: '...' }, ptv: true });

// View Once Media
await sock.sendMessage(jid, { image: { url: '...' }, viewOnce: true });
```

### 📍 Location & Contact
```javascript
await sock.sendMessage(jid, { location: { degreesLatitude: -6.2, degreesLongitude: 106.8 } });

await sock.sendMessage(jid, { 
    contacts: { 
        displayName: 'FreeZeeHost', 
        contacts: [{ vcard: '...' }] 
    } 
});
```

### 📊 Poll Messages
```javascript
await sock.sendMessage(jid, {
    poll: {
        name: 'Siapa presiden pilihanmu?',
        values: ['Opsi 1', 'Opsi 2'],
        selectableCount: 1
    }
});
```

---

## 📡 Handling Events
Semua event telah dioptimasi dan dikategorikan untuk kemudahan akses.

```javascript
// Pesan masuk (Upsert)
sock.ev.on('messages.upsert', ({ messages, type }) => {
    const m = sock.smsg(messages[0]); // Auto-serialize
    if (m.text === 'ping') m.reply('Pong!');
});

// Update koneksi
sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    // Logika Reconnect Otomatis sudah terpasang di Auto-Medic
});

// Participant Group (Join/Leave)
sock.ev.on('group-participants.update', (event) => {
    console.log(`User ${event.participants} telah ${event.action} di grup ${event.id}`);
});
```

---

## 👥 Groups & Privacy

### Group Management
```javascript
await sock.groupCreate("New Group", ["jid1", "jid2"]);
await sock.groupParticipantsUpdate(jid, ["jid1"], "add"); // add, remove, promote, demote
await sock.groupUpdateSubject(jid, "New Name");
await sock.groupLeave(jid);
```

### Privacy Settings
```javascript
await sock.updateLastSeenPrivacy("none");
await sock.updateStatusPrivacy("contacts");
await sock.updateReadReceiptsPrivacy("none");
```

---

## ⚙️ Internal Optimizations
- **Encrypted Logger**: Aktivitas bot dicatat secara terenkripsi ke database (opsional) untuk audit keamanan.
- **Dynamic Task Queue**: Mencegah overload pengiriman pesan yang bisa menyebabkan nomor terblokir.
- **Turbo-Loader**: Pre-warming engine untuk memuat plugin bot lebih cepat saat startup.
- **Memory Garbage Collector**: Secara berkala membersihkan cache yang tidak terpakai untuk menjaga penggunaan RAM tetap rendah.

---

## 🛡️ Disclaimer & License
Copyright (c) 2026 **FreeZeeHost Project**.

Proyek ini **tidak berafiliasi** dengan WhatsApp atau Meta. Gunakan dengan risiko Anda sendiri. Segala bentuk penyalahgunaan (seperti spam) bukan tanggung jawab pengembang library ini.

Lisensi: **MIT License**. Dilarang keras melakukan komersialisasi/resale tanpa izin tertulis dari FreeZeeHost Team.

---
<div align="center">
  <p>Created with ❤️ by <b>FreeZeeHost Team</b></p>
  <p><i>Empowering the WhatsApp Bot Ecosystem</i></p>
</div>
