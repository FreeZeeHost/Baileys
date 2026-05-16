# 🚀 @freezeehost/baileys 

<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="WhatsApp Baileys" width="450"/>  

  <h1>The Most Powerful, Stable, and Hybrid Baileys Fork in 2026</h1>
  
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
- [🌟 Features](#-features)
- [💎 FreeZee Premium Features](#-freezee-premium-features)
- [📥 Installation](#-installation)  
- [🚀 Hybrid Quick Start](#-quick-start)  
- [📖 Detailed Documentation](#-detailed-documentation)
  - [🔌 Connecting Account](#-connecting-account)
  - [📡 Handling Events](#-handling-events)
  - [📨 Sending Messages](#-sending-messages)
  - [📣 Newsletter Management](#-newsletter)
  - [🛠️ Group Management](#-groups)
  - [🔒 Privacy Settings](#-privacy)
  - [⚙️ Advanced Usage](#-advanced)
- [📜 License](#-license)  

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
- **Internal Bypass**: Automatically uses our high-speed internal DB if no URL is provided.

### 🥷 Stealth Mode
Make your bot look human. Simulate typing and recording statuses seamlessly while your bot processes heavy commands.
- `sock.simulateTyping(jid, duration)` -> Status "Mengetik..."
- `sock.simulateRecording(jid, duration)` -> Status "Merekam suara..."

### 🚀 Auto Memory Optimizer
Keep your bot running for months without lag. 
- `sock.autoOptimize()` -> Clears chat caches and old message objects to keep RAM low.

### 🔘 One-Line UI Builders (`sock.msg`)
Simplify complex interactions into single function calls.
- **Buttons**: `sock.msg.buttons(...)`
- **List**: `sock.msg.list(...)`
- **Polling**: `sock.msg.poll(...)`
- **Carousel**: `sock.msg.carousel(...)`
- **Native Table**: `sock.msg.nativeTable(...)`

### 📱 Status Tracker (GETSW)
Perfect for building status-saving bots.
- `sock.onStatusUpdate(callback)` -> Listen to every new status posted.
- `sock.getAllStatusSenders()` -> Get list of everyone who has an active status.
- `sock.getStatusesFrom(jid)` -> Get history of statuses from a specific person.

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

## 📖 Detailed Documentation

### 🔌 Connecting Account
<details>
<summary><strong>🔗 QR Code Connection</strong></summary>

```javascript
const sock = makeFreeZeeSocket({
  printQRInTerminal: true,
  auth: state
});
```
</details>

<details>
<summary><strong>🔢 Pairing Code Connection</strong></summary>

```javascript
const sock = makeFreeZeeSocket({
  auth: state
});

if (!sock.authState.creds.registered) {
  const number = "62xxxx";
  const code = await sock.requestPairingCode(number);
  console.log(`Your pairing code: ${code}`);

  // Custom 8-digit Pairing Code
  const customCode = "FREEZE12";
  const code2 = await sock.requestPairingCode(number, customCode);
}
```
</details>

<br>

### 📡 Handling Events
<details>
<summary><strong>📩 Message Events</strong></summary>

```javascript
sock.ev.on('messages.upsert', ({ messages, type }) => {
  console.log('New messages:', messages);
  if(type === 'notify') {
    // Process new notification
  }
});
```
</details>

<details>
<summary><strong>📊 Poll Updates</strong></summary>

```javascript
sock.ev.on('messages.update', (m) => {
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

<details>
<summary><strong>📝 Text & Styling</strong></summary>

```javascript
// Simple Text
await sock.sendMessage(jid, { text: 'Hello!' });

// Quoted Reply
await sock.sendMessage(jid, { text: 'Reply to this' }, { quoted: m });

// Mentions
await sock.sendMessage(jid, { text: 'Hi @62xxx', mentions: ['62xxx@s.whatsapp.net'] });
```
</details>

<details>
<summary><strong>🖼️ Media (Image, Video, Audio)</strong></summary>

```javascript
// Image from URL
await sock.sendMessage(jid, { image: { url: 'https://...' }, caption: 'Caption' });

// Video from local buffer
await sock.sendMessage(jid, { video: fs.readFileSync('video.mp4'), caption: 'Video' });

// Audio (Voice Note)
await sock.sendMessage(jid, { audio: fs.readFileSync('voice.ogg'), ptt: true });

// View Once
await sock.sendMessage(jid, { image: { url: '...' }, viewOnce: true });
```
</details>

<details>
<summary><strong>👤 Contacts & Location</strong></summary>

```javascript
// Send Contact
const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Admin\nTEL;type=CELL;type=VOICE;waid=62xxx:+62xxx\nEND:VCARD';
await sock.sendMessage(jid, { contacts: { displayName: 'Admin', contacts: [{ vcard }] } });

// Send Location
await sock.sendMessage(jid, { location: { degreesLatitude: -6.2, degreesLongitude: 106.8, name: 'Jakarta' } });
```
</details>

<details>
<summary><strong>🎭 Reactions & Pinning</strong></summary>

```javascript
// React
await sock.sendMessage(jid, { react: { text: '💖', key: m.key } });

// Pin (1 = Pin, 2 = Unpin)
await sock.sendMessage(jid, { pin: { key: m.key, type: 1, time: 86400 } });

// Keep (Save disappearing message)
await sock.sendMessage(jid, { keep: { key: m.key, type: 1 } });
```
</details>

<details>
<summary><strong>🔥 Sticker Pack (Premium)</strong></summary>

```javascript
// Send multiple stickers as a pack
await sock.sendStickerPack(jid, ['./s1.png', './s2.webp'], {
    packname: "Cool Pack",
    author: "FreeZee"
});
```
</details>

<br>

### 📣 Newsletter
<details>
<summary><strong>📋 Newsletter Management</strong></summary>

```javascript
// Create Newsletter
const nl = await sock.newsletterCreate("My Channel", "Description", { url: '...' });

// Metadata
const meta = await sock.newsletterMetadata("invite", "code_here");

// Update Info
await sock.newsletterUpdateName(jid, "New Name");
await sock.newsletterUpdateDescription(jid, "New Desc");
```
</details>

<br>

### 🛠️ Groups
<details>
<summary><strong>🔄 Management</strong></summary>

```javascript
// Create Group
const group = await sock.groupCreate("Bot Support", ["62xxx@s.whatsapp.net"]);

// Participants (add, remove, promote, demote)
await sock.groupParticipantsUpdate(jid, ["62xxx@s.whatsapp.net"], "add");

// Settings
await sock.groupSettingUpdate(jid, 'announcement'); // Only admin can chat
await sock.groupSettingUpdate(jid, 'locked'); // Only admin can edit info
```
</details>

<details>
<summary><strong>🔗 Invites & Requests</strong></summary>

```javascript
// Get Invite Link
const code = await sock.groupInviteCode(jid);

// Request List
const requests = await sock.groupRequestParticipantsList(jid);

// Approve/Reject
await sock.groupRequestParticipantsUpdate(jid, ["62xxx@s.whatsapp.net"], "approve");
```
</details>

<br>

### 🔒 Privacy
<details>
<summary><strong>🖼️ Profile & Block</strong></summary>

```javascript
// Update PP
await sock.updateProfilePicture(jid, { url: '...' });

// Block/Unblock
await sock.updateBlockStatus(jid, 'block');

// Privacy Settings (all, contacts, contact_blacklist, none)
await sock.updateLastSeenPrivacy("none");
await sock.updateOnlinePrivacy("match_last_seen");
await sock.updateStatusPrivacy("contacts");
```
</details>

<br>

### ⚙️ Advanced
<details>
<summary><strong>📡 Raw Socket Access</strong></summary>

```javascript
// Listen to raw binary nodes
sock.ws.on('CB:presence', (node) => console.log('Raw presence:', node));
```
</details>

<br>

## 📜 License
This project is licensed under the **MIT License**. Personal use only for specific enhancements.

<br>

## 🌱 Credits
- **Original Engine**: WhiskeySockets/Baileys
- **Enterprise Patch**: 𝙁𝙧𝙚𝙚𝙕𝙚𝙚𝙃𝙤𝙨𝙩 Project

---
*Made with ❤️ by FreeZeeHost for the WhatsApp Developers community.*
