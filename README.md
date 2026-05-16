<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="WhatsApp Baileys" width="450"/>  

  <h1>🚀 @freezeehost/baileys</h1>
  <p><strong>The Most Powerful, Stable, and Hybrid Baileys Fork in 2026</strong></p>
  
  <p>
    <a href="https://npmjs.com/package/@freezeehost/baileys">
      <img src="https://img.shields.io/npm/v/@freezeehost/baileys?color=blue&logo=npm" alt="npm version">
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Stability-God--Mode-brightgreen.svg" alt="Stability">
    </a>
  </p>
</div>

<br>

## 📚 Table of Contents  
- [Features](#-features)  
- [FreeZee Premium Features](#-freezee-premium-features)
- [Installation](#-installation)  
- [Hybrid Quick Start](#-quick-start)  
- [Premium Documentation](#-premium-documentation)
  - [MongoDB Cloud Auth](#-mongodb-cloud-auth)
  - [Stealth Mode](#-stealth-mode)
  - [Interactive UI Builders](#-interactive-ui-builders)
  - [Status Tracker (GETSW)](#-status-tracker-getsw)
  - [Advanced Media](#-advanced-media)
- [Base Documentation](#-base-documentation)  
- [Disclaimer](#-disclaimer)  

<br>

## 🌟 Features
- ✅ **Native Hybrid Support**: Works perfectly with both ESM (`import`) and CJS (`require`).
- ✅ **Multi-Device Support**: Optimized for the latest WhatsApp Multi-Device protocol.
- ✅ **Singularity Core**: Unified utility chain to eliminate "Named export not found" errors.
- ✅ **Enterprise Stability**: Designed for high-traffic bots with anti-crash protection.

<br>

## 💎 FreeZee Premium Features

### ☁️ MongoDB Cloud Auth
Forget `auth-info.json` corruption. Store your sessions safely in MongoDB with atomic updates and automatic synchronization.

### 🥷 Stealth Mode
Make your bot look human. Simulate typing and recording statuses seamlessly while your bot processes heavy commands.

### 🚀 Auto Memory Optimizer
Keep your bot running for months without lag. Clean up message caches and chat stores automatically to free up RAM.

### 🔘 One-Line UI Builders
Send complex interactive messages (Buttons, Lists, Polls, Carousels) with simple one-line functions.

---

<br>

## 📥 Installation
```bash
npm install @freezeehost/baileys
```

<br>

## 🚀 Hybrid Quick Start

### Using ESM (Modern)
```javascript
import { makeFreeZeeSocket, useMongoFileAuthState } from '@freezeehost/baileys';

const { state, saveCreds } = await useMongoFileAuthState("YOUR_MONGODB_URL");
const sock = makeFreeZeeSocket({
    auth: state,
    printQRInTerminal: true
});

sock.ev.on('creds.update', saveCreds);
```

### Using CommonJS (Legacy)
```javascript
const { makeFreeZeeSocket, useMongoFileAuthState } = require('@freezeehost/baileys');

async function connect() {
    const { state, saveCreds } = await useMongoFileAuthState();
    const sock = makeFreeZeeSocket({ auth: state });
    // ...
}
```

---

<br>

## 📖 Premium Documentation

### ☁️ MongoDB Cloud Auth
Our internal database is provided by default, but you can use your own:
```javascript
const { state, saveCreds } = await useMongoFileAuthState("mongodb+srv://user:pass@cluster.mongodb.net/dbname");
```

### 🥷 Stealth Mode
<details>
<summary><strong>Show Code</strong></summary>

```javascript
// Simulate typing for 3 seconds
await sock.simulateTyping(jid, 3000);

// Simulate audio recording for 2 seconds
await sock.simulateRecording(jid, 2000);
```
</details>

### 🔘 Interactive UI Builders (`sock.msg`)
<details>
<summary><strong>Show Code</strong></summary>

```javascript
// Send Buttons
await sock.msg.buttons(jid, "Hello!", "Footer text", [
    { buttonId: 'id1', buttonText: { displayText: 'Button 1' } }
]);

// Send Poll
await sock.msg.poll(jid, "Vote now!", ["Option A", "Option B"], 1);

// Send Carousel (Multiple Cards)
await sock.msg.carousel(jid, [
    { title: 'Card 1', body: 'Desc', footer: 'Foot', buttons: [...] },
    { title: 'Card 2', body: 'Desc', footer: 'Foot', buttons: [...] }
]);

// Send Native Table
await sock.msg.nativeTable(jid, "Product List", [
    { header: "Name", content: "Price" },
    { header: "Bot Premium", content: "Free" }
]);
```
</details>

### 📱 Status Tracker (GETSW)
Listen to status updates, track who posted what, and retrieve history.
<details>
<summary><strong>Show Code</strong></summary>

```javascript
// Listen to status updates from everyone
sock.onStatusUpdate(async (status) => {
    console.log(`New status from ${status.statusData.sender}`);
    console.log(`Caption: ${status.statusData.caption}`);
});

// Get list of all contacts who have active statuses in cache
const senders = sock.getAllStatusSenders();

// Get specific statuses from a user
const statuses = sock.getStatusesFrom("62xxx@s.whatsapp.net");
```
</details>

### 🖼️ Advanced Media
<details>
<summary><strong>Show Code</strong></summary>

```javascript
// Send Album (Bulk Media)
await sock.sendAlbumMessage(jid, [
    { type: 'image', data: { url: '...' }, caption: 'Pic 1' },
    { type: 'video', data: fs.readFileSync('vid.mp4') }
]);

// Send Sticker Pack (Bulk Stickers)
await sock.sendStickerPack(jid, ['./1.png', './2.webp'], {
    packname: "My Bot",
    author: "FreeZeeHost"
});
```
</details>

### 🚀 RAM Optimization
```javascript
// Clear caches to keep the bot responsive
sock.autoOptimize();
```

---

<br>

## 📖 Base Documentation (Original Baileys)

### 📨 Sending Messages
<details>
<summary><strong>📝 Text & Media</strong></summary>

```javascript
// Simple Text
await sock.sendMessage(jid, { text: 'Hello!' });

// Image with URL
await sock.sendMessage(jid, { 
  image: { url: 'https://example.com/image.jpg' },
  caption: 'Beautiful View'
});

// Audio PTT
await sock.sendMessage(jid, { 
  audio: fs.readFileSync('voice.ogg'),
  ptt: true
});
```
</details>

### 🛠️ Groups
<details>
<summary><strong>🔄 Management</strong></summary>

```javascript
// Create Group
const group = await sock.groupCreate("Bot Fans", ["123@s.whatsapp.net"]);

// Add Member
await sock.groupParticipantsUpdate(jid, ["456@s.whatsapp.net"], "add");

// Get Metadata
const metadata = await sock.groupMetadata(jid);
```
</details>

<br>

## 📜 License
This project is licensed under the **MIT License**.

<br>

## 🌱 Credits
- **Original Library**: WhiskeySockets/Baileys
- **Enhancements**: 𝙁𝙧𝙚𝙚𝙕𝙚𝙚𝙃𝙤𝙨𝙩 Project

---
*Made with ❤️ for the WhatsApp Bot Community*
