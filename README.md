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
- [Premium Features (FreeZeeHost Exclusive)](#-premium-features-exclusive)
- [Installation](#-installation)  
- [Quick Start](#-quick-start)  
- [Connecting Account](#-connecting-account)
- [Handling Events](#-handling-events)
- [Sending Messages](#-sending-messages)
  - [Rich Messages (Buttons, Polls, Carousel)](#-rich-messages-interactive)
  - [Media Messages (Album, Stickers)](#-media-messages)
- [Status/Story Detector](#-real-time-status-detector)
- [Groups & Management](#-groups)
- [Privacy Settings](#-privacy)
- [Disclaimer](#-disclaimer)  

<br>

## 💎 Premium Features (Exclusive)
- 🛡️ **Anti Bad Session**: Atomic writes & auto-repair for corrupted session data.
- 🔁 **Smart Session Manager**: Embedded MongoDB (Zero-Config Plug & Play).
- 🥷 **Stealth Mode**: Automated humanized typing/recording delays (Anti-Ban).
- ⏳ **Smart Anti-Spam Queue**: Adaptive message delivery with random delays.
- 🚀 **Pre-Boot Loading UI**: Elegant visual initialization progress (0-100%).
- 📡 **Real-time Status Detector**: Instant WhatsApp Story/Status capture.
- ✨ **Full Dual-Format**: Native support for ESM (`import`) and CJS (`require`).

<br>

## 🌱 Owner’s Notice  
Proyek ini dikembangkan berdasarkan library **Whiskeysocket** dengan peningkatan signifikan oleh administrator FreeZeeHost untuk **memudahkan pengguna serta memperbaiki kesalahan bot yang sebelumnya sering dialami**.  

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

## 🛠️ Advanced Patcher (Simplified API)
The easiest way to supercharge your socket with all the new features.

```javascript
const { patchSocket } = require('@freezeehost/baileys');
const sock = patchSocket(makeWASocket({ auth: state }));

// --- NEW SIMPLIFIED FUNCTIONS ---

// 1. Group Management
await sock.groupAdd(jid, ["123@s.whatsapp.net"]);
await sock.groupRemove(jid, ["123@s.whatsapp.net"]);
await sock.groupPromote(jid, ["123@s.whatsapp.net"]);
await sock.groupDemote(jid, ["123@s.whatsapp.net"]);

// 2. Message Editing
await sock.editMessage(jid, m.key, "This message has been edited!");

// 3. Command Router (The easiest way to build bot commands)
sock.onCommand('.ping', async (m, args) => {
   await m.reply('Pong! Bot is active.');
});

// 4. Memory Optimization
sock.autoOptimize(); // Clear expired cache to keep bot fast
```

<br>

## 📡 Real-time Status Detector
Capture every WhatsApp Story instantly.
```javascript
sock.onStatusUpdate(async (m) => {
    console.log("Status detected from:", m.statusData.sender)
    console.log("Caption:", m.statusData.caption)
    
    // Auto-save status (getsw)
    await sock.sendMessage(sock.user.id, { forward: m })
})
```

<br>

## 📨 Sending Messages

### --- RICH MESSAGES (Interactive) ---
<details>
<summary><strong>📊 Polls & Buttons</strong></summary>

```javascript
// 1. Create Poll
await sock.msg.poll(jid, "Your favorite fruit?", ["Apple", "Mango", "Durian"], 1)

// 2. Buttons (Native Flow)
await sock.msg.buttons(jid, "Select Option", "Footer text", [
    { buttonId: 'id1', buttonText: { displayText: 'Option 1' }, type: 1 }
])
```
</details>

<details>
<summary><strong>📱 Carousel & Shop Flow</strong></summary>

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

// Shop Message
await sock.sendMessage(jid, {      
  text: 'Check our store',
  shop: { surface: 1, id: 'fb_store_id' }
})
```
</details>

<details>
<summary><strong>📊 Tables (Exclusive)</strong></summary>

```javascript
await sock.msg.nativeTable(jid, "Price List", [
  { title: "Item 1", description: "Rp 1.000" },
  { title: "Item 2", description: "Rp 2.000" }
])
```
</details>

### --- MEDIA MESSAGES ---
<details>
<summary><strong>🖼️ Image, Video & Audio</strong></summary>

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
<summary><strong>📸 Album & Sticker Packs</strong></summary>

```javascript
// Send Album (Multiple Media)
await sock.sendAlbumMessage(jid, [
  { type: 'image', data: { url: '...' }, caption: 'First' },
  { type: 'video', data: { url: '...' } }
], "Album Caption")

// Send Sticker Pack
await sock.sendStickerPack(jid, [
  'https://url1.webp', 'https://url2.webp'
], { packname: 'My Pack', author: 'FreeZee' });
```
</details>

<br>

## 🛡️ Smart Anti-Spam Queue
Automated: Every message sent will have a **1.5s - 3.5s random delay** and auto-typing presence to mimic human behavior.
```javascript
// Bypass Queue (Urgent Message)
await sock.sendMessage(jid, { text: "URGENT!" }, { urgent: true })
```

<br>

## 🌐 Connecting Account
<details>
<summary><strong>🔢 Connect with Pairing Code</strong></summary>

```javascript
const number = "62xxxx"
const code = await sock.requestPairingCode(number)
console.log("Your Code:", code)
```
</details>

<details>
<summary><strong>🔗 Connect with QR Code</strong></summary>

```javascript
const sock = makeFreeZeeSocket({ printQRInTerminal: true })
```
</details>

<br>

## 🔒 Privacy & Settings
<details>
<summary><strong>🛡️ Block/Unblock</strong></summary>

```javascript
await sock.updateBlockStatus(jid, 'block')
await sock.updateBlockStatus(jid, 'unblock')
```
</details>

<details>
<summary><strong>👤 Profile Update</strong></summary>

```javascript
await sock.updateProfileStatus('Online 24/7')
await sock.updateProfileName('My Bot Name')
await sock.updateProfilePicture(jid, { url: './new-pfp.jpg' })
```
</details>

<br>

## ⚡ Contact Admin
- [Site](https://zass.cloud)
- [Channel](https://zass.cloud/wa/channel/info)

<br>

## ⚖️ Disclaimer
This project is for educational and personal use only. Use it responsibly. We are not responsible for any banned accounts.

## 📜 License
MIT © **FreeZeeHost Project**
