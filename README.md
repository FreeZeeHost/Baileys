<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="WhatsApp Baileys" width="450"/>  

  <h1>WhatsApp Baileys</h1>
  <p><strong>Lightweight, Full-Featured WhatsApp Web for Node.js</strong></p>
  
  <p>
    <a href="https://npmjs.com/package/@freezeehost/baileys">
      <img src="https://img.shields.io/npm/v/@freezeehost/baileys?color=blue&logo=npm" alt="npm version">
    </a>
    <a href="https://github.com/freezeehost/Baileys/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/freezeehost/Baileys?color=green" alt="License">
    </a>
    <a href="https://github.com/freezeehost/Baileys/stargazers">
      <img src="https://img.shields.io/github/stars/freezeehost/Baileys?color=yellow&logo=github" alt="GitHub stars">
    </a>
  </p>
</div>

<br>

## 📚 Table of Contents  
- [Features](#-features)  
- [Installation](#-installation)  
- [Quick Start](#-quick-start)  
- [Premium Features](#-premium-features-exclusive)
- [Documentation](#-documentation)  
  - [Interactive Messages (Buttons, Carousel, Shop)](#-interactive-messages)
  - [Sending Messages](#-sending-messages)  
  - [Event Handling](#-handling-events)  
- [Disclaimer](#-disclaimer)  

<br>

## 🌟 Features
- ✅ **Multi-Device Support** (Pairing Code & QR)
- 🔄 **Real-Time Messaging** (text, media, polls, buttons)  
- 🛠️ **Group & Channel Management** (create, modify, invite)  
- 🔒 **End-to-End Encryption**  
- 📦 **Session Persistence** (File & MongoDB)  

<br>

## 🔥 Updated New (22 April 2026)
- 🛡️ **Anti Bad Session**: Atomic writes & auto-repair for session data.
- 🔁 **Smart Session Manager**: Embedded MongoDB (Zero-Config Plug & Play).
- 🥷 **Stealth Mode**: Automated humanized typing/recording delays.
- ⏳ **Smart Anti-Spam Queue**: Adaptive message delivery with random delays.
- 🚀 **Pre-Boot Loading UI**: Elegant visual initialization progress (0-100%).
- 📡 **Real-time Status Detector**: Instant WhatsApp Story/Status capture.
- ✨ **Full Dual-Format**: Native support for ESM (`import`) and CJS (`require`).

<br>

## 🌱 Owner’s Notice  
Proyek ini bersifat **publik**, dikembangkan berdasarkan library **Whiskeysocket** dengan peningkatan signifikan oleh administrator FreeZeeHost. Tujuan utama adalah **memudahkan pengguna serta memperbaiki kesalahan bot yang sebelumnya sering dialami**.  

Terimakasih, salam hangat, **FreeZeeHost**!

<br>

## 📥 Installation
```bash
npm install @freezeehost/baileys
```

<br>

## 🚀 Quick Start (Premium Experience)
The easiest way to start using the framework with all premium features active.

```javascript
import { makeFreeZeeSocket } from '@freezeehost/baileys'

async function startBot() {
  const sock = await makeFreeZeeSocket({
      printQRInTerminal: true
  })

  // Bot will show loading bar [████░░░░] 0-100%
  // Automatically connects to FreeZeeHost Cloud MongoDB

  sock.ev.on('connection.update', (m) => {
      if(m.connection === 'open') console.log("Bot Connected!")
  })
}

startBot()
```

<br>

## 💎 Premium Features (Exclusive)

### 1. Smart Anti-Spam & Stealth
Every message sent will have a 1.5s - 3.5s random delay and auto-typing presence to mimic human behavior.
```javascript
// Urgent message (Bypass Queue)
await sock.sendMessage(jid, { text: "Urgently needed!" }, { urgent: true })

// Send Album
await sock.sendAlbumMessage(jid, [
  { type: 'image', data: { url: '...' }, caption: 'First' },
  { type: 'video', data: { url: '...' } }
], "Album Caption")
```

### 2. Real-time Status/Story Detector
```javascript
sock.onStatusUpdate(async (m) => {
    console.log("New Status from:", m.statusData.sender)
    // Auto-save status to yourself (getsw)
    await sock.sendMessage(sock.user.id, { forward: m })
})
```

---

<br>

## 👨‍💻 Documentation & Usage

### 📩 Sending Messages
<details>
<summary><strong>📝 Text & Media</strong></summary>

```javascript
// Simple Text
await sock.sendMessage(jid, { text: 'Hello!' })

// Image with Caption
await sock.sendMessage(jid, { image: { url: '...' }, caption: 'Cool!' })

// View Once (Ephemeral)
await sock.sendMessage(jid, { video: { url: '...' }, viewOnce: true })
```
</details>

<details>
<summary><strong>📊 Polls & Buttons</strong></summary>

```javascript
// Create Poll
await sock.msg.poll(jid, "Your favorite fruit?", ["Apple", "Mango", "Durian"], 1)

// Buttons (Native Flow)
await sock.msg.buttons(jid, "Select Option", "Footer text", [
    { buttonId: 'id1', buttonText: { displayText: 'Option 1' }, type: 1 }
])
```
</details>

<details>
<summary><strong>📱 Interactive Messages (Carousel & Shop)</strong></summary>

```javascript
// Carousel (Multiple Cards)
await sock.msg.carousel(jid, [
  {
    image: { url: 'https://...' },
    title: 'Product 1',
    body: 'Details here',
    buttons: [{ name: 'quick_reply', buttonParamsJson: '...' }]
  }
])

// Native Table (Exclusive)
await sock.msg.nativeTable(jid, "Price List", [
  { title: "Item 1", description: "Rp 1.000" },
  { title: "Item 2", description: "Rp 2.000" }
])
```
</details>

<br>

## 📡 Handling Events
```javascript
sock.ev.on('messages.upsert', ({ messages }) => {
  console.log('Received:', messages[0].message)
})

sock.ev.on('messages.update', (m) => {
  if (m.pollUpdates) console.log('Poll update:', m.pollUpdates)
})
```

<br>

## ⚡ Contact Admin
- [Site](https://zass.cloud)
- [Channel](https://zass.cloud/wa/channel/info)

<br>

## ⚖️ Disclaimer
This project is for educational and personal use only. Use it responsibly. We are not responsible for any banned accounts.

## 📜 License
MIT © **FreeZeeHost Project**
