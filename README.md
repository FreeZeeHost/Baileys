<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="WhatsApp Baileys" width="450"/>  

  <h1>@freezeehost/baileys 🚀🔥</h1>
  <p><strong>Lightweight, Full-Featured & Ultra Stable WhatsApp Web for Node.js</strong></p>
  
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
- [Premium Exclusive](#-premium-features-2026)
- [Documentation](#-documentation)  
  - [Sending Messages](#-sending-messages)  
  - [Interactive Messages](#-interactive-messages)
  - [Media & Album](#-media--album)
  - [Groups & Management](#-groups)  
  - [Privacy & Settings](#-privacy)  
- [Disclaimer](#-disclaimer)  

<br>

## 🌟 Features
- ✅ **Multi-Device Support** (Pairing Code & QR)
- 🔄 **Real-Time Messaging** (text, media, polls, buttons)  
- 🛠️ **Group & Channel Management** (create, modify, invite)  
- 🔒 **End-to-End Encryption**  
- 📦 **Session Persistence** (MongoDB & File)

<br>

## 🔥 Premium Features (2026 Edition)
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

## 🚀 Quick Start
<details>
<summary><strong>🚀 Show Quick Start Code</strong></summary>

```javascript
import { makeFreeZeeSocket } from '@freezeehost/baileys'

async function start() {
  const sock = await makeFreeZeeSocket({ printQRInTerminal: true })
  
  sock.ev.on('messages.upsert', ({ messages }) => {
      console.log('Received:', messages[0].message)
  })
}
start()
```
</details>

<br>

## 👨‍💻 Documentation & API

### 📨 Sending Messages
<details>
<summary><strong>📝 Text & Context</strong></summary>

```javascript
// Simple Text
await sock.sendMessage(jid, { text: 'Hello!' })

// With Quoted Reply
await sock.sendMessage(jid, { text: 'Reply message' }, { quoted: m })

// With Mentions
await sock.sendMessage(jid, { text: '@12345', mentions: ['12345@s.whatsapp.net'] })
```
</details>

<details>
<summary><strong>🎭 Interactive Messages (Buttons, Polls, Lists)</strong></summary>

```javascript
// 1. Buttons (Native Flow)
await sock.msg.buttons(jid, "Body", "Footer", [
    { buttonId: 'id1', buttonText: { displayText: 'Option 1' }, type: 1 }
])

// 2. Poll Message
await sock.msg.poll(jid, "Question?", ["A", "B"], 1)

// 3. List Message
await sock.msg.list(jid, "Title", "Text", "Footer", "Button Text", [
    { title: "Section", rows: [{ title: "Opt 1", id: "1" }] }
])
```
</details>

<details>
<summary><strong>📱 Advanced Interactive (Carousel & Shop)</strong></summary>

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

// Native Table
await sock.msg.nativeTable(jid, "Price List", [
  { title: "Item 1", description: "Rp 1.000" }
])
```
</details>

### 🖼️ Media & Album
<details>
<summary><strong>📸 Image, Video & Stickers</strong></summary>

```javascript
// Send Image
await sock.sendMessage(jid, { image: { url: '...' }, caption: 'Cool!' })

// Send Sticker Pack
await sock.sendStickerPack(jid, ['./s1.webp'], { packname: 'My Pack', author: 'FreeZee' });

// Send Album (Multiple Media)
await sock.sendAlbumMessage(jid, [
  { type: 'image', data: { url: '...' }, caption: 'One' },
  { type: 'video', data: { url: '...' } }
])
```
</details>

### 🛡️ Security & Stealth
<details>
<summary><strong>🥷 Anti-Ban Features</strong></summary>

```javascript
// Toggle Stealth Mode (Auto-typing/recording)
sock.setStealthMode(false) // Turn off
sock.setStealthMode(true)  // Turn on (Default)

// Urgent Message (Bypass Queue)
await sock.sendMessage(jid, { text: "Fast!" }, { urgent: true })

// Memory Optimizer
sock.autoOptimize()
```
</details>

### 📡 Real-time Events
<details>
<summary><strong>🔔 Status & Connection</strong></summary>

```javascript
// Detect New Status/Story (getsw)
sock.onStatusUpdate(async (m) => {
    console.log("New Status from:", m.statusData.sender)
    await sock.sendMessage(sock.user.id, { forward: m })
})

// Connection Update
sock.ev.on('connection.update', (update) => {
    if(update.connection === 'open') console.log("Online!")
})
```
</details>

<br>

## 👥 Groups & Management
<details>
<summary><strong>🛠️ Show Group API</strong></summary>

```javascript
// Management
await sock.groupAdd(jid, ["user@s.whatsapp.net"])
await sock.groupRemove(jid, ["user@s.whatsapp.net"])
await sock.groupPromote(jid, ["user@s.whatsapp.net"])
await sock.groupDemote(jid, ["user@s.whatsapp.net"])

// Editing
await sock.groupUpdateSubject(jid, "New Name")
await sock.groupUpdateDescription(jid, "New Desc")
await sock.groupSettingUpdate(jid, 'announcement') // Only admin can chat
```
</details>

<br>

## 🔒 Privacy & Settings
<details>
<summary><strong>🛡️ Show Privacy API</strong></summary>

```javascript
// Block/Unblock
await sock.updateBlockStatus(jid, 'block')

// Profile
await sock.updateProfileStatus('Hello!')
await sock.updateProfileName('My Name')
await sock.updateProfilePicture(jid, { url: './pfp.jpg' })

// Privacy
await sock.updateLastSeenPrivacy('contacts')
await sock.updateOnlinePrivacy('match_last_seen')
```
</details>

<br>

## ⚡ Contact Admin
- [Site](https://zass.cloud)
- [Channel](https://zass.cloud/wa/channel/info)
- [Script Gratis](https://neolabsofficial.my.id)

<br>

## ⚖️ Disclaimer
This project is for educational and personal use only. Use it responsibly.

## 📜 License
MIT © **FreeZeeHost Project**
