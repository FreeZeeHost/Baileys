<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="WhatsApp Baileys" width="450"/>  

  <h1>🚀 @freezeehost/baileys</h1>
  <p><strong>The Most Powerful, Stable, and Hybrid Baileys Fork in 2026</strong></p>
  
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
- 📦 **Session Persistence**  
- ⚡ **Native Hybrid Support**: Works perfectly with both ESM (`import`) and CJS (`require`).
- 💎 **FreeZee Singularity Core**: Unified utility chain to eliminate "Named export not found" errors.

<br>

## 💎 FreeZee Premium Features

### ☁️ MongoDB Cloud Auth
Store your sessions safely in MongoDB with atomic updates and automatic synchronization. Forget `auth-info.json` corruption.
- **Internal Database**: Automatically uses our high-speed internal DB if no URL is provided.

### 🥷 Stealth Mode (Ghost Mode)
Make your bot look human. Simulate typing and recording statuses seamlessly while your bot processes heavy commands.
- `conn.simulateTyping(jid, duration)` -> Status "Typing..."
- `conn.simulateRecording(jid, duration)` -> Status "Recording audio..."

### 🚀 Auto Memory Optimizer
Keep your bot running for months without lag. 
- `conn.autoOptimize()` -> Clears chat caches and old message objects to keep RAM low.

### 🔘 One-Line UI Builders (`conn.msg`)
Simplify complex interactions into single function calls.
- **Buttons**: `conn.msg.buttons(...)`
- **List**: `conn.msg.list(...)`
- **Polling**: `conn.msg.poll(...)`
- **Carousel**: `conn.msg.carousel(...)`
- **Native Table**: `conn.msg.nativeTable(...)`

### 📱 Status Tracker (GETSW)
Perfect for building status-saving bots.
- `conn.onStatusUpdate(callback)` -> Listen to every new status posted.
- `conn.getAllStatusSenders()` -> Get list of everyone who has an active status.
- `conn.getStatusesFrom(jid)` -> Get history of statuses from a specific person.

---

<br>

## 📥 Installation
```bash
npm install @freezeehost/baileys
```

<br>

## 🚀 Quick Start
```javascript
const {
  makeConn,
  useMongoFileAuthState,
} = require('@freezeehost/baileys');

async function start() {
  const { state, saveCreds } = await useMongoFileAuthState("URL_MONGODB_ANDA")
  
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

  // use custom code pairing (8 digit premium)
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

// Text with mentions
await conn.sendMessage(jid, { text: 'Hi @62xxx', mentions: ['62xxx@s.whatsapp.net'] });

// With Quoted Reply
await conn.sendMessage(jid, { text: 'Hello!' }, { quoted: m });
```
</details>


<details>
<summary><strong>🖼️ Image Message</strong></summary>

```javascript
// With local file buffer
await conn.sendMessage(jid, { 
  image: fs.readFileSync('image.jpg'),
  caption: 'Caption here'
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
  caption: 'Clip'
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
// Push-to-talk (PTT / Voice Note)
await conn.sendMessage(jid, { 
  audio: fs.readFileSync('voice.ogg'),
  ptt: true
});
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
await conn.sendMessage(jid, {
  react: {
    text: '👍', 
    key: m.key
  }
})
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
// Create a poll
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
<summary><strong>📸 Album Message</strong></summary>

```javascript
await conn.sendAlbumMessage(jid, [
    { image: { url: '...' }, caption: 'Pic 1' },
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

<br>

### 📱 Status Tracker (GETSW)

<details>
<summary><strong>Usage Guide</strong></summary>

```javascript
// Listen to all new status updates
conn.onStatusUpdate(async (status) => {
    console.log(\`New status from \${status.statusData.sender}\`);
    console.log(\`Caption: \${status.statusData.caption}\`);
});

// Get all contacts who posted status
const senders = conn.getAllStatusSenders();

// Get status history for a specific person
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
conn.ws.on('CB:presence', (node) => console.log('Raw presence:', node));
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
