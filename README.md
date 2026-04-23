# @freezeehost/baileys 🚀🔥
The most stable and feature-rich WhatsApp Baileys framework in 2026.

## 🌟 Key Features
- **Plug-and-Play MongoDB**: Internal database embedded (Zero config).
- **Gold Master Stability**: Fully synced with latest official NPM Baileys (2.3100.2).
- **Smart Anti-Spam Queue**: Automated human-like delays for sending messages.
- **Pre-Boot Loading UI**: Elegant visual progress (0-100%).
- **Dual-Format Support**: Native support for both ESM (`import`) and CJS (`require`).
- **Real-time Status Detector**: Catch every WhatsApp Story instantly.
- **High-Trust Identity**: Pre-configured with Ubuntu Chrome for anti-ban safety.

---

## 🛠️ Developer Guide (API Documentation)

### 1. Socket Initialization
```javascript
import { makeFreeZeeSocket } from '@freezeehost/baileys'

const sock = await makeFreeZeeSocket({
    printQRInTerminal: true,
    // Optional: add your custom pino logger
})
```

### 2. Interactive Message Helpers (`sock.msg`)
All these helpers are optimized for WhatsApp MD (Multi-Device).

| Helper | Syntax |
| :--- | :--- |
| **Buttons** | `sock.msg.buttons(jid, text, footer, buttons)` |
| **List** | `sock.msg.list(jid, title, text, footer, buttonText, sections)` |
| **Poll** | `sock.msg.poll(jid, name, values, selectableCount)` |
| **Carousel** | `sock.msg.carousel(jid, cards)` |
| **Native Table** | `sock.msg.nativeTable(jid, title, rows)` |

### 3. Advanced Senders
```javascript
// Send Multiple Images/Videos as an Album
await sock.sendAlbumMessage(jid, [
    { type: 'image', data: { url: 'image1.jpg' }, caption: 'First' },
    { type: 'video', data: { url: 'video.mp4' }, caption: 'Second' }
])

// Send Message with Auto-Stealth (Typing/Recording)
// This is automatic, but you can bypass it with:
await sock.sendMessage(jid, { text: "Fast message" }, { noStealth: true })

// Send Urgent Message (Bypass Queue)
await sock.sendMessage(jid, { text: "URGENT!" }, { urgent: true })
```

### 4. Utilities & Helpers
Exposed named exports for high-level bot development.

```javascript
import { 
  jidNormalizedUser, 
  getContentType, 
  downloadMediaMessage, 
  generateMessageID,
  Browsers
} from '@freezeehost/baileys'

// Normalize any JID (Support LID)
const cleanJid = jidNormalizedUser(m.key.remoteJid)

// Get Message Type safely
const type = getContentType(m.message)

// Generate Unique ID
const msgId = generateMessageID()
```

### 5. Event Handling
```javascript
// Detect New Status/Story in Real-time
sock.onStatusUpdate(async (m) => {
    console.log(`New story from ${m.statusData.sender}`)
    // Auto-save status
    await sock.sendMessage(sock.user.id, { forward: m })
})

// Listen to all connection updates
sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if(connection === 'open') console.log("Bot is Online!")
})
```

### 6. Database & Optimization
```javascript
// Automatically connected to FreeZeeHost MongoDB Cluster
// Use this to keep your server memory clean
sock.autoOptimize()
```

---

## 📦 Requirements
- Node.js v20 or higher
- MongoDB (Already embedded, but internet required)

## 📜 Credits
Developed and maintained by **FreeZeeHost Project**.
Baileys core engine by **WhiskeySockets**.

## ⚖️ License
MIT License
