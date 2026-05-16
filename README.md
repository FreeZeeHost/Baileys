<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="WhatsApp Baileys" width="450"/>  

  <h1>🚀 @freezeehost/baileys</h1>
  <p><strong>Lightweight, Full-Featured, and Hybrid WhatsApp Web for Node.js</strong></p>
  
  <p>
    <a href="https://npmjs.com/package/@freezeehost/baileys">
      <img src="https://img.shields.io/npm/v/@freezeehost/baileys?color=blue&logo=npm" alt="npm version">
    </a>
    <a href="https://github.com/FreeZeeHostProject/Baileys/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/FreeZeeHostProject/Baileys?color=green" alt="License">
    </a>
    <a href="https://github.com/FreeZeeHostProject/Baileys/stargazers">
      <img src="https://img.shields.io/github/stars/FreeZeeHostProject/Baileys?color=yellow&logo=github" alt="GitHub stars">
    </a>
  </p>
</div>

<br>

## 📚 Table of Contents  
- [Features](#-features)  
- [FreeZee Premium Features](#-freezee-premium-features)
- [Installation](#-installation)  
- [Quick Start](#-quick-start)  
- [Documentation](#-documentation)  
  - [Connecting Account](#-connecting-account)  
  - [Handling Events](#-handling-events)  
  - [Sending Messages](#-sending-messages)  
  - [Interactive UI Builders](#-interactive-ui-builders)
  - [Status Tracker (GETSW)](#-status-tracker-getsw)
  - [Groups](#-groups)  
  - [Privacy](#-privacy)  
  - [Advanced](#-advanced)  
- [Disclaimer](#-disclaimer)  

<br>

## 🌟 Features
- ✅ **Multi-Device Support**  
- 🔄 **Real-Time Messaging** (text, media, polls, buttons)  
- 🛠️ **Group & Channel Management** (create, modify, invite)  
- 🔒 **End-to-End Encryption**  
- 📦 **Session Persistence** (Cloud MongoDB & Multi-File)
- ⚡ **Native Hybrid Support**: Works perfectly with both ESM (`import`) and CJS (`require`).
- 💎 **FreeZee Singularity Core**: Unified utility chain to eliminate "Named export not found" errors.

<br>

## 💎 FreeZee Premium Features

### ☁️ MongoDB Cloud Auth
Simpan sesi bot Anda secara otomatis di MongoDB Cloud dengan sistem **Atomic Save**. Lupakan file JSON yang sering rusak.
- **Internal Database**: Otomatis menggunakan database internal kami jika Anda tidak menyediakan URL sendiri.

### 🥷 Stealth Mode (Mode Hantu)
Membuat bot Anda terlihat lebih manusiawi dengan simulasi interaksi yang nyata.
- `conn.simulateTyping(jid, duration)` -> Status "Mengetik..."
- `conn.simulateRecording(jid, duration)` -> Status "Merekam suara..."

### 🚀 Auto Memory Optimizer
Menjaga performa bot tetap ringan meskipun aktif berhari-hari. 
- `conn.autoOptimize()` -> Membersihkan cache chat & pesan lama secara cerdas untuk membebaskan RAM.

### 🔘 One-Line UI Builders (`conn.msg`)
Kirim pesan interaktif yang kompleks cukup dengan satu baris kode.
- **Buttons**: `conn.msg.buttons(...)`
- **List**: `conn.msg.list(...)`
- **Polling**: `conn.msg.poll(...)`
- **Carousel**: `conn.msg.carousel(...)`
- **Native Table**: `conn.msg.nativeTable(...)`

### 📱 Status Tracker (GETSW)
Fitur tercanggih untuk melacak dan mengambil data status (Story) WhatsApp.
- `conn.onStatusUpdate(callback)` -> Mendeteksi setiap ada status baru yang diposting.
- `conn.getAllStatusSenders()` -> Mengambil daftar semua orang yang sedang pasang status.
- `conn.getStatusesFrom(jid)` -> Mengambil semua riwayat status dari nomor tertentu.

<br>

## 🌱 Owner’s Notice  

Proyek ini dikembangkan berdasarkan library **Whiskeysocket**, dengan perbaikan dan peningkatan yang dilakukan oleh administrator **FreeZeeHost**.  
Tujuan utama dari proyek ini adalah untuk **memudahkan pengguna serta memperbaiki kesalahan bot yang sebelumnya sering dialami (Error 400/500, Circular Dependency, ESM Mismatches)**.  

Saat ini proyek sudah mencapai tahap **Stable Production (God-Mode)**.  

Terimakasih, salam hangat, **FreeZeeHost**!
<br>

## 📥 Installation
```bash
npm install @freezeehost/baileys
```

<br>

## 🚀 Quick Start (Hybrid Support)

### Menggunakan CommonJS (Legacy)
```javascript
const {
  makeConn,
  useMongoFileAuthState,
} = require('@freezeehost/baileys');

async function start() {
    const { state, saveCreds } = await useMongoFileAuthState();
    const conn = makeConn({ 
        auth: state,
        printQRInTerminal: true 
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', ({ messages }) => {
        console.log('New message:', messages[0].message);
    });
}
start();
```

### Menggunakan ESM (Modern)
```javascript
import { makeConn, useMongoFileAuthState } from '@freezeehost/baileys';

const { state, saveCreds } = await useMongoFileAuthState();
const conn = makeConn({ auth: state });
```

<br>

## 📖 Documentation

### 🔌 Connecting Account
<details>
<summary><strong>🔗 Connect with QR Code</strong></summary>

```javascript
const conn = makeConn({
  printQRInTerminal: true, // true to display QR Code
  auth: state
})
```
</details>

<details>
<summary><strong>🔢 Connect with Pairing Code</strong></summary>

```javascript
const conn = makeConn({
  printQRInTerminal: false,
  auth: state
})

if (!conn.authState.creds.registered) {
  const number = "62xxxx"

  // use default pairing code
  const code = await conn.requestPairingCode(number)

  // use customer code pairing (8 digit premium)
  const customCode = "FREEZE12"
  const code2 = await conn.requestPairingCode(number, customCode)
  console.log(code2)
}
```
</details>

<br>

### 📡 Handling Events
<details>
<summary><strong>📌 Example to Start</strong></summary>

```javascript
conn.ev.on('messages.upsert', ({ messages }) => {
  console.log('New message:', messages[0].message);
});
```
</details>

<details>
<summary><strong>🗳️ Decrypt Poll Votes</strong></summary>

```javascript
conn.ev.on('messages.update', (m) => {
  for (const { key, update } of m) {
    if (update.pollUpdates) {
        console.log('Poll vote detected:', update.pollUpdates);
    }
  }
});
```
</details>

<br>

### 📨 Sending Messages

```javascript
/**
 * Sends a message using the WhatsApp socket connection.
 * 
 * @param {string} jid - Recipient's JID
 * @param {Object} content - Message content (text, image, etc.)
 * @param {Object} [options] - quoted, ephemeral, etc.
 */
await conn.sendMessage(jid, content, options)
```

<details>
<summary><strong>📝 Text Message</strong></summary>

```javascript
// Simple Text
await conn.sendMessage(jid, { text: 'Hello!' });

// Text with link preview
await conn.sendMessage(jid, {
  text: 'Visit https://example.com',
  linkPreview: {
    'canonical-url': 'https://example.com',
    title: 'Example Domain',
    description: 'A demo website',
    jpegThumbnail: fs.readFileSync('preview.jpg')
  }
});

// With Quoted Reply
await conn.sendMessage(jid, { text: 'Hello FreeZee!' }, { quoted: m });
```
</details>


<details>
<summary><strong>🖼️ Image Message</strong></summary>

```javascript
// With local file buffer
await conn.sendMessage(jid, { 
  image: fs.readFileSync('image.jpg'),
  caption: 'Caption!',
  mentions: ['1234567890@s.whatsapp.net'] 
});

// With URL
await conn.sendMessage(jid, { 
  image: { url: 'https://example.com/image.jpg' },
  caption: 'From URL'
});
```
</details>

<details>
<summary><strong>🎥 Video Message</strong></summary>

```javascript
// With Local File
await conn.sendMessage(jid, { 
  video: fs.readFileSync('video.mp4'),
  caption: 'Clip!'
});

// View Once Message
await conn.sendMessage(jid, {
  video: fs.readFileSync('secret.mp4'),
  viewOnce: true 
});
```
</details>

<details>
<summary><strong>🎵 Audio/PTT Message</strong></summary>

```javascript
// Push-to-talk (PTT)
await conn.sendMessage(jid, { 
  audio: fs.readFileSync('voice.ogg'),
  ptt: true
});
```
</details>

<details>
<summary><strong>👤 Contact Message</strong></summary>

```javascript
const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:FreeZeeHost\nTEL;waid=628xxx:+628xxx\nEND:VCARD';
await conn.sendMessage(jid, { contacts: { displayName: 'Admin', contacts: [{ vcard }] } });
```
</details>

<details>
<summary><strong>🔥 Sticker Pack (Premium)</strong></summary>

```javascript
// Send bulk stickers as a pack
await conn.sendStickerPack(jid, ['./s1.png', './s2.webp'], {
    packname: "My Bot Pack",
    author: "FreeZeeHost"
});
```
</details>

<details>
<summary><strong>💥 React Message</strong></summary>

```javascript
await conn.sendMessage(jid, { react: { text: '👍', key: m.key } });
```
</details>

<details>
<summary><strong>📌 Pin & Keep Message</strong></summary>

```javascript
// Pin Message (1 = Pin, 2 = Unpin)
await conn.sendMessage(jid, {
  pin: {
    type: 1, 
    time: 86400,
    key: m.key
  }
})

// Keep message
await conn.sendMessage(jid, {
  keep: {
    key: m.key,
    type: 1 
  }
})
```
</details>

<details>
<summary><strong>📊 Poll Message</strong></summary>

```javascript
await conn.sendMessage(jid, {
  poll: {
    name: 'Favorite color?',
    values: ['Red', 'Blue', 'Green'],
    selectableCount: 1 
  }
});
```
</details>

<details>
<summary><strong>📸 Album Message (Premium)</strong></summary>

```javascript
await conn.sendAlbumMessage(jid, [
    { type: 'image', data: { url: '...' }, caption: 'Pic 1' },
    { video: fs.readFileSync('vid.mp4'), caption: 'Vid 1' }
], { quoted: m });
```
</details>

<br>

### 🔘 Premium Interactive UI (`conn.msg`)

<details>
<summary><strong>Buttons Message</strong></summary>

```javascript
await conn.msg.buttons(jid, "Main Menu", "Select an option:", [
    { buttonId: 'id1', buttonText: { displayText: 'Option 1' } },
    { buttonId: 'id2', buttonText: { displayText: 'Option 2' } }
]);
```
</details>

<details>
<summary><strong>List Message</strong></summary>

```javascript
await conn.msg.list(jid, "Title", "Body text", "Footer", "Button Label", [
    { title: "Section 1", rows: [{ title: "Row 1", rowId: "r1" }] }
]);
```
</details>

<details>
<summary><strong>Carousel Message</strong></summary>

```javascript
await conn.msg.carousel(jid, [
    { title: 'Card 1', body: 'Desc', footer: 'Foot', buttons: [...] },
    { title: 'Card 2', body: 'Desc', footer: 'Foot', buttons: [...] }
]);
```
</details>

<details>
<summary><strong>Native Table</strong></summary>

```javascript
await conn.msg.nativeTable(jid, "Price List", [
    { header: "Pack", content: "Price" },
    { header: "Premium A", content: "10k" }
]);
```
</details>

<br>

### 📱 Status Tracker (GETSW)

<details>
<summary><strong>Usage Guide</strong></summary>

```javascript
// 1. Listen to all new status updates
conn.onStatusUpdate(async (status) => {
    console.log(`New status from ${status.statusData.sender}`);
    console.log(`Caption: ${status.statusData.caption}`);
});

// 2. Get list of all contacts who posted status
const senders = conn.getAllStatusSenders();

// 3. Get status history for a specific person
const stories = conn.getStatusesFrom("62xxx@s.whatsapp.net");
```
</details>

<br>

### 📣 Newsletter / Channel
<details>
<summary><strong>📋 Management</strong></summary>

```javascript
// Create Newsletter
const nl = await conn.newsletterCreate("My Channel", "Desc", { url: '...' });

// Metadata
const meta = await conn.newsletterMetadata("invite", "code");

// Follow/Unfollow
await conn.newsletterFollow(jid);
await conn.newsletterUnfollow(jid);
```
</details>

<br>

### 🛠️ Groups
<details>
<summary><strong>🔄 Management</strong></summary>

```javascript
// Create Group
const group = await conn.groupCreate("New Group", ["62xxx@s.whatsapp.net"]);

// Participants Update (add, remove, promote, demote)
await conn.groupParticipantsUpdate(jid, ["62xxx@s.whatsapp.net"], "add");

// Settings (announcement, locked)
await conn.groupSettingUpdate(jid, 'announcement');
```
</details>

<details>
<summary><strong>🔗 Invites & Requests</strong></summary>

```javascript
// Get Invite Link
const code = await conn.groupInviteCode(jid);

// Approve Request
await conn.groupRequestParticipantsUpdate(jid, ["62xxx@s.whatsapp.net"], "approve");
```
</details>

<br>

### 🔒 Privacy
<details>
<summary><strong>🖼️ Profile & Block</strong></summary>

```javascript
// Update PP
await conn.updateProfilePicture(jid, { url: 'https://...' });

// Block Status
await conn.updateBlockStatus(jid, 'block');

// Privacy Settings (all, contacts, contact_blacklist, none)
await conn.updateLastSeenPrivacy("none");
await conn.updateOnlinePrivacy("match_last_seen");
await conn.updateStatusPrivacy("contacts");
```
</details>

<br>

### ⚙️ Advanced
<details>
<summary><strong>🔧 Debug Logs</strong></summary>

```javascript
const conn = makeConn({ logger: { level: 'debug' } });
```
</details>

<details>
<summary><strong>📡 Raw WebSocket Events</strong></summary>

```javascript
conn.ws.on('CB:presence', (node) => console.log('Raw node:', node));
```
</details>

<br>

## ⚠️ Disclaimer
This project is **not affiliated** with WhatsApp/Meta. Use at your own risk.  

<br>

## 🌱 Credits
- **Original Engine**: WhiskeySockets/Baileys
- **Enterprise Patch**: 𝙁𝙧𝙚𝙚𝙕𝙚𝙚𝙃𝙤𝙨𝙩 Project

---
*Made with ❤️ by FreeZeeHost for the WhatsApp Developers community.*
