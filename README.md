<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="@freezeehost/baileys" width="450"/>  

  <h1>@freezeehost/baileys</h1>
  <p><strong>Lightweight, Full-Featured WhatsApp Web for Node.js</strong></p>
  
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


## 🔌 PnP (Plug & Play) Installation
Ganti library Baileys lama Anda dengan versi FreeZee yang lebih stabil dan kencang dalam satu perintah:

```json
// Tambahkan baris ini di package.json bot Anda, di bagian "dependencies":
"dependencies": {
  "baileys": "github:FreeZeeHostProject/Baileys"
}
```
Lalu jalankan `npm install`.

*(Cara ini sangat ajaib! Bot Anda akan otomatis menggunakan mesin FreeZee tanpa perlu merubah satupun kata `require("baileys")` di dalam kodenya).*

**Kenapa harus pakai versi FreeZee?**
- ✅ **Global Injection**: Otomatis menyediakan `proto`, `smsg`, dan `delay` secara global (tidak perlu import manual di banyak file).
- ✅ **Auto-Fix 405**: Protokol pendaftaran sudah diperbarui untuk mencegah "Connection Closed" saat pairing.
- ✅ **Zero Config**: Langsung jalan tanpa perlu merubah kode bot Anda.


## 🔥 High-Performance Engine Updates (2026 Edition)
Library ini telah di-overhaul total untuk performa ekstrim dan keamanan tingkat tinggi. Berikut adalah fitur eksklusif yang baru saja ditambahkan:

| Fitur | Deskripsi | Kode Utama |
|-------|-----------|--------|
| **🎭 Persona Switcher** | Ubah identitas bot menjadi iPhone/Android/Windows secara instan. | `conn.setPersona('ios')` |
| **🛡️ Anti-Delete Core** | Menangkap pesan yang ditarik/dihapus secara otomatis. | `ev.on('message.delete')` |
| **🧠 Smart Media Proxy** | Penghemat bandwidth & penyimpanan (Deduplikasi SHA256). | *Otomatis* |
| **🤖 Meta AI Style** | Kirim pesan dengan format tabel, kode, dan reels AI. | `m.replyTable(...)` |
| **🩺 Auto-Medic** | Pemulihan otomatis jika koneksi macet (Self-Healing). | *Otomatis* |
| **🚦 Task Queue** | Antrian pesan cerdas untuk menghindari limit/ban. | *Otomatis* |
| **👻 Phantom Mode** | Baca pesan tanpa centang biru (Anti-Blue Tick). | `conn.ghostMode = true` |

---

## 💎 FreeZee Premium Features

### 🤖 Meta AI Style Messages (New!)
Kirim pesan dengan visual kaya persis seperti bot Meta AI resmi.

#### 📊 AI Table
Membuat tabel native AI yang cantik dan informatif.
```javascript
// Mode Global
await conn.aiTable(jid, "Judul Tabel", [
    { items: ["Nama", "Status"], isHeading: true },
    { items: ["Bot FreeZee", "Aktif"] }
]);

// Mode Reply (Sangat Simple)
await m.replyTable("Daftar Harga", [ ["Produk", "Harga"], ["Bot", "Rp 50rb"] ]);
```

#### 💻 AI Code Block
Mengirim blok kode dengan styling khusus AI dan indikator bahasa.
```javascript
// Mode Global
await conn.aiCode(jid, "javascript", "console.log('Hello World')");

// Mode Reply
await m.replyCode("python", "print('Hello World')");
```

#### 🎬 AI Reels Carousel
Membuat slider video (reels) lengkap dengan avatar dan nama kreator.
```javascript
const reels = [
    {
        title: "Kreator A",
        profileIconUrl: "https://...",
        thumbnailUrl: "https://...",
        videoUrl: "https://..."
    }
];

// Mode Global
await conn.aiReels(jid, "Teks utama", reels);

// Mode Reply
await m.replyReels("Cek video ini!", reels);
```

### 🎭 Persona Identity Switcher
Ganti identitas bot Anda secara instan tanpa relogin. Sangat ampuh untuk menghindari filter spam.
```javascript
// Opsi: 'ios', 'android', 'windows', 'macos', 'portal'
conn.setPersona('ios'); 
```

### 👻 Phantom Mode (Ghost Protocol)
Baca pesan tanpa diketahui pengirim. Anda bisa mengecualikan orang tertentu (VIP).
```javascript
conn.ghostMode = true; // Aktifkan Mode Hantu

// Kecualikan Owner agar tetap melihat centang biru saat kita baca
conn.setVIP("628123456789@s.whatsapp.net", true);
```

### 📱 Status Tracker (GETSW)
Fitur lengkap untuk memantau dan mengunduh status WhatsApp.
```javascript
// Event status baru
conn.onStatusUpdate((m) => {
    console.log("Status baru dari:", m.key.participant);
});

// Download media status
const buffer = await conn.downloadStatusMedia(statusMessage);
```

### 🚀 Smart Command & Reply Helpers
Membuat kode bot Anda menjadi sangat bersih (Clean Code).
```javascript
// Command Handler Otomatis (Support Prefix ./!#)
conn.onCommand('ping', (m) => m.reply('Pong!'));

// Berbagai mode reply instan
await m.replyImage(url, "Caption");
await m.replyVideo(url, "Caption");
await m.react("🔥");
```

---

## 🚀 Quick Start (FreeZee Style)
```javascript
const { default: makeFreeZeeSocket, useMultiFileAuthState } = require('@freezeehost/baileys');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const conn = makeFreeZeeSocket({
        auth: state,
        phoneNumber: "628xxxx", // Opsional: Otomatis mode Pairing Code!
    });

    conn.ev.on('creds.update', saveCreds);

    // Langsung buat command!
    conn.onCommand('hello', (m) => {
        m.replyTable("Selamat Datang", [ ["Fitur", "Status"], ["AI Table", "Ready"] ]);
    });
}
start();
```

---

## 📜 Full Documentation
Silakan cek bagian di bawah untuk detail teknis lainnya:
- [Connecting Account](#-connecting-account)
- [Handling Events](#-handling-events)
- [Groups & Privacy](#-groups)
- [Advanced Settings](#-advanced)

<br>

<details>
<summary><strong>🔌 Connecting Account Detail</strong></summary>

### 🔗 Connect with QR Code
```javascript
const conn = makeFreeZeeSocket({
  printQRInTerminal: true,
  auth: state
})
```

### 🔢 Connect with Pairing Code
Cukup masukkan `phoneNumber` di config, library akan menangani sisanya secara hybrid.
```javascript
const conn = makeFreeZeeSocket({
  auth: state,
  phoneNumber: "628xxxxxxxx"
})

conn.ev.on('pairing-code', (code) => {
  console.log("KODE PAIRING ANDA:", code);
});
```
</details>

<details>
<summary><strong>🛠️ Groups Management</strong></summary>

```javascript
// Cek Admin Simple
const isAdmin = await conn.isAdmin(jid, userJid);

// Ambil List Admin
const admins = await conn.getGroupAdmins(jid);

// Create/Join/Leave
await conn.groupCreate("Nama Grup", ["jid1"]);
await conn.groupLeave(jid);
```
</details>

---

## 🛡️ Disclaimer
Proyek ini **tidak berafiliasi** dengan WhatsApp/Meta. Gunakan secara bijak. Segala risiko (seperti ban) ditanggung pengguna.

## ⚡ Contact & Support
- **Site**: [zass.cloud](https://zass.cloud)
- **Channel**: [Official Channel](https://zass.cloud/wa/channel/info)

---
<div align="center">
  Made with ❤️ by <b>FreeZeeHost Team</b>
</div>
