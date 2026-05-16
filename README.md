<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="FreeZee Baileys" width="450"/>  

  <h1>FreeZee Baileys</h1>
  <p><strong>Stable, Lightweight, & Hybrid WhatsApp Web API for Node.js</strong></p>
  
  <p>
    <a href="https://github.com/FreeZeeHostProject/Baileys">
      <img src="https://img.shields.io/github/license/FreeZeeHostProject/Baileys?color=green" alt="License">
    </a>
    <a href="https://github.com/FreeZeeHostProject/Baileys/stargazers">
      <img src="https://img.shields.io/github/stars/FreeZeeHostProject/Baileys?color=yellow&logo=github" alt="GitHub stars">
    </a>
  </p>
</div>

<br>

## 🚀 Overview
**FreeZee Baileys** is a highly optimized, hybrid version of the Baileys WhatsApp library. It merges the legendary stability of the **Ryuu decryption logic** (fixing the "raw text" issue) with **FreeZee's custom performance enhancements**. It is designed to be the fastest, lightest, and most compatible version for modern bot development (Node.js v25+).

## 📚 Table of Contents  
- [Features](#-features)  
- [Installation](#-installation)  
- [Quick Start](#-quick-start)  
- [Custom Features (FreeZee Exclusive)](#-custom-features-freezee-exclusive)
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
- ✅ **Hybrid Decryption**: Fixed all "raw text" / `protocolMessage` bugs.
- ✅ **LID to JID Fix**: Fully automatic handling of WhatsApp's new Linked ID system.
- ✅ **Dual-Support (ESM/CJS)**: Works with `import` and `require()` out of the box.
- ✅ **Multi-Device Support**  
- ✅ **Real-Time Messaging** (text, media, polls, buttons, interactive)  
- ✅ **Group & Channel Management**
- ✅ **Fast Pairing**: Optimized pairing code system with custom code support.

<br>

## 🔥 Recent Updates
- 🍟 **Auto-LID Conversion**: Convert LID Mentions/Sender to standard JID.
- 🩸 **Fixed All Bug LID**: Fixed participant, mentionedJid, sender, and admins group detection.
- 🍡 **Watermark**: Standardized under **FreeZeeHost**.
- 🚀 **Performance**: Modularized WAProto to reduce memory footprint.

<br>

## 🌱 Owner’s Notice  
Proyek ini dikembangkan berdasarkan library **Whiskeysockets**, dengan perbaikan besar pada sistem dekripsi dan performa. Tujuan utama dari proyek ini adalah untuk **memudahkan pengguna serta memperbaiki kesalahan bot (no response/teks mentah) yang sering dialami pada versi standar**.

<br>

## 📥 Installation
```bash
npm install github:freezeehost/baileys
```

<br>

## 🚀 Quick Start (ESM)
```javascript
import { makeFreeZeeSocket, Browsers } from '@freezeehost/baileys'

const sock = makeFreeZeeSocket({
    printQRInTerminal: true,
    browser: Browsers.ubuntu('Chrome')
})

sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = sock.smsg(messages[0]) // Simple message helper
    if (m.text === '.ping') {
        await sock.sendMessage(m.chat, { text: 'Pong!' })
    }
})
```

<br>

## 🛠️ Custom Features (FreeZee Exclusive)

### 1. Simple Message Helper (`smsg`)
Transform complex WhatsApp message objects into a simple, readable object.
```javascript
sock.ev.on('messages.upsert', ({ messages }) => {
  const m = sock.smsg(messages[0])
  console.log(m.sender) // Returns clean JID
  console.log(m.text)   // Returns raw text from any message type
  console.log(m.isGroup) // Boolean
})
```

### 2. Auto Optimizer
Automatically clears chat and message cache to save RAM and keep the bot fast.
```javascript
// Usually called periodically or on connection open
sock.autoOptimize()
```

### 3. Send Sticker (Stable)
Simplified function to send stickers from Buffer, URL, or File Path.
```javascript
await sock.sendSticker(jid, { sticker: buffer_or_url })
```

### 4. Status Auto-Read
Automatically marks WhatsApp status/stories as seen.
```javascript
// Handled internally if enabled in options
```

<br>

## 📖 Documentation

### 🔌 Connecting Account
<details>
<summary><strong>🔗 Connect with QR Code</strong></summary>

```javascript
const sock = makeFreeZeeSocket({
  printQRInTerminal: true,
  auth: state
})
```
</details>

<details>
<summary><strong>🔢 Connect with Pairing Code</strong></summary>

```javascript
const sock = makeFreeZeeSocket({
  printQRInTerminal: false,
  auth: state
})

if (!sock.authState.creds.registered) {
  const number = "6285604618277"
  const code = await sock.requestPairingCode(number)
  console.log('Pairing Code:', code)
}
```
</details>

<br>

### 📨 Sending Messages

<details>
<summary><strong>📝 Text Message</strong></summary>

```javascript
// Simple Text
await sock.sendMessage(jid, { text: 'Hello!' });

// With Quoted Reply
await sock.sendMessage(jid, { text: 'Hello!' }, { quoted: m });
```
</details>

<details>
<summary><strong>🖼️ Media Message</strong></summary>

```javascript
// Image
await sock.sendMessage(jid, { image: { url: '...' }, caption: 'Hi' });

// Video
await sock.sendMessage(jid, { video: { url: '...' }, caption: 'Look' });

// View Once
await sock.sendMessage(jid, { image: { url: '...' }, viewOnce: true });
```
</details>

<details>
<summary><strong>👨‍💻 Interactive Message (Buttons/Lists)</strong></summary>

```javascript
// Button Message (Native Flow)
await sock.sendMessage(jid, {
    text: 'Click below!',
    footer: 'FreeZee Baileys',
    buttons: [{
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
            display_text: 'Menu',
            id: '.menu'
        })
    }]
})
```
</details>

<br>

### 🛠️ Group Management
<details>
<summary><strong>View Functions</strong></summary>

```javascript
await sock.groupCreate("New Group", ["jid1", "jid2"])
await sock.groupParticipantsUpdate(jid, ["jid1"], "add") // add, remove, promote, demote
await sock.groupUpdateSubject(jid, "New Title")
```
</details>

<br>

## ⚡ Contact & Support
- [GitHub Repository](https://github.com/FreeZeeHostProject/Baileys)
- [Official Channel](https://zass.cloud/wa/channel/info)

---
<p align="center">Maintained with ❤️ by <b>FreeZeeHost Project</b> & <b>Ryuu</b></p>
