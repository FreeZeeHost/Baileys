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
**FreeZee Baileys** is a highly optimized version of the Baileys WhatsApp library. It combines the legendary stability of the **Ryuu version** (for perfect message decryption) with **FreeZee's custom performance enhancements** and full support for modern Node.js versions (v25+).

## 🌟 Key Features
- ✅ **Hybrid Engine**: Merged with the most stable decryption logic to fix "raw text" issues.
- ✅ **Dual-Support (ESM/CJS)**: Seamlessly use `import` or `require()` without errors.
- ✅ **Auto-Optimizer**: Built-in `sock.autoOptimize()` to clear cache and save RAM.
- ✅ **Smsg Helper**: Injected `sock.smsg()` to simplify message objects for bot developers.
- ✅ **LID Fixes**: Full automatic handling of WhatsApp's new Linked ID (LID) system.
- ✅ **Fast Pairing**: Optimized pairing code system for instant linking.
- ✅ **Sticker & Media**: Built-in stable functions for sending and processing media.

## 📦 Installation
```bash
npm install github:freezeehost/baileys
```

## 🛠️ Quick Start (ESM)
```javascript
import { makeFreeZeeSocket, Browsers } from '@freezeehost/baileys'

const sock = makeFreeZeeSocket({
    printQRInTerminal: true,
    browser: Browsers.ubuntu('Chrome')
})

sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = sock.smsg(messages[0])
    if (m.text === '.ping') {
        await sock.sendMessage(m.chat, { text: 'Pong!' })
    }
})
```

## 🔥 Added/Improved Functions
- `makeFreeZeeSocket()`: The primary entry point for a patched, ready-to-go socket.
- `sock.smsg()`: Transform complex WA message objects into simple, readable data.
- `sock.autoOptimize()`: Keep your bot running fast even after long uptimes.
- `sock.sendSticker()`: Easy sticker sending from various inputs.

<br>

---
<p align="center">Maintained with ❤️ by <b>FreeZeeHost Project</b> & <b>Ryuu</b></p>
