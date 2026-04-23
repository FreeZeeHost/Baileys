# @freezeehost/baileys 🚀🔥
The most stable and feature-rich WhatsApp Baileys framework in 2026.

## 🌟 Key Features
- **Plug-and-Play MongoDB**: Internal database embedded (Zero config).
- **Gold Master Stability**: Fully synced with latest official NPM Baileys.
- **Smart Anti-Spam Queue**: Automated human-like delays for sending messages.
- **Pre-Boot Loading UI**: Elegant visual progress (0-100%).
- **Dual-Format Support**: Native support for both ESM (`import`) and CJS (`require`).
- **Real-time Status Detector**: Catch every WhatsApp Story instantly.

---

## 🛠️ Getting Started

### Initialization
```javascript
import { makeFreeZeeSocket } from '@freezeehost/baileys'

const sock = await makeFreeZeeSocket({
    // optional config
    printQRInTerminal: true
})

// Bot will show Loading [████░░░░] 0-100%
```

### 💬 Rich Messages (`sock.msg`)
Send complex interactive messages easily.

```javascript
// 1. Buttons Message
await sock.msg.buttons(jid, "Halo!", "Ini footer", [
    { buttonId: 'id1', buttonText: { displayText: 'Tombol 1' }, type: 1 }
])

// 2. Poll Message
await sock.msg.poll(jid, "Suka kopi?", ["Ya", "Tidak"], 1)

// 3. Carousel Message
await sock.msg.carousel(jid, [/* Array of card messages */])

// 4. Native Table
await sock.msg.nativeTable(jid, "Daftar Harga", [
    { title: "Kopi", description: "Rp 5.000" },
    { title: "Teh", description: "Rp 3.000" }
])
```

### 🛡️ Smart Anti-Spam & Stealth
```javascript
// Automated: Every message sent will have a 1.5s - 3.5s random delay
// and auto-typing/recording presence.

// Bypass Queue (Urgent Message)
await sock.sendMessage(jid, { text: "PENTING!" }, { urgent: true })

// Send Album (Multiple Media)
await sock.sendAlbumMessage(jid, [
    { type: 'image', data: { url: './img1.jpg' }, caption: 'Foto 1' },
    { type: 'image', data: { url: './img2.jpg' } }
], "Ini Caption Album")
```

### 📡 Status/Story Detector (Real-time)
```javascript
sock.onStatusUpdate(async (m) => {
    console.log("Status detected from:", m.statusData.sender)
    console.log("Caption:", m.statusData.caption)
    
    // Example: Auto-save status (getsw)
    await sock.sendMessage(sock.user.id, { forward: m })
})
```

### 🧠 Memory Optimizer
```javascript
// Clear expired status and chat data to keep the bot fast
sock.autoOptimize()
```

---

## 📦 Requirements
- Node.js v20+
- Internet Connection

## 📜 License
MIT © FreeZeeHost Project
