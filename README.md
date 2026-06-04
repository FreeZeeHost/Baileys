<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="@freezeehost/baileys" width="450"/>  

  <h1>@freezeehost/baileys</h1>
  <p><strong>The Most Advanced, High-Performance WhatsApp Web Library (2026 Edition)</strong></p>
  
  <p>
    <a href="https://npmjs.com/package/@freezeehost/baileys">
      <img src="https://img.shields.io/npm/v/@freezeehost/baileys?color=blue&logo=npm" alt="npm version">
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/github/license/whiskeysockets/baileys?color=green" alt="License">
    </a>
    <a href="https://github.com/FreeZeeHostProject/Baileys/stargazers">
      <img src="https://img.shields.io/github/stars/FreeZeeHostProject/Baileys?color=yellow&logo=github" alt="GitHub stars">
    </a>
  </p>
</div>

---

## 🔌 PnP (Plug & Play) Installation
Library ini dirancang untuk menggantikan Baileys standar secara langsung (Drop-in Replacement). Cukup ganti dependency Anda dan nikmati fitur premiumnya.

### Update `package.json`
```json
"dependencies": {
  "baileys": "github:FreeZeeHostProject/Baileys"
}
```

---

## 🚀 Fitur Ungkapan (High-Level Features)
Daftar fitur eksklusif yang hanya tersedia di versi **FreeZeeHost**:

| Fitur | Fungsi | Kode Utama |
|-------|-----------|--------|
| **🎭 Persona Switcher** | Ganti identitas perangkat (iPhone/Android/PC) tanpa relogin. | `sock.setPersona('ios')` |
| **👻 Phantom Mode** | Baca pesan tanpa centang biru secara selektif. | `sock.ghostMode = true` |
| **🛡️ Anti-Delete** | Menangkap pesan yang ditarik oleh pengirim. | `ev.on('message.delete')` |
| **🧠 ViewOnce Bypass** | Otomatis mengubah pesan "Sekali Lihat" menjadi pesan biasa. | *Otomatis* |
| **🩺 Auto-Medic** | Mendeteksi socket macet dan memperbaikinya secara otomatis. | *Otomatis* |
| **🚦 Task Queue** | Antrian pesan cerdas untuk menghindari ban/spam detection. | *Otomatis* |

---

## 📖 Dokumentasi Fitur Premium & Code Examples

### 🎭 Persona Identity Switcher
Ubah identitas browser/perangkat bot Anda secara instan. Sangat berguna untuk menghindari deteksi bot dan mengubah tampilan "Login di perangkat lain".

```javascript
// Opsi: 'ios', 'android', 'windows', 'macos', 'portal'
sock.setPersona('ios'); 
console.log("Bot sekarang terdeteksi sebagai iPhone!");
```

### 👻 Phantom Mode (Selective Read)
Ingin membaca pesan tanpa diketahui pengirim (tanpa centang biru)? Gunakan Phantom Mode. Anda juga bisa mengecualikan orang tertentu (VIP) agar mereka tetap mendapat centang biru.

```javascript
sock.ghostMode = true; // Aktifkan mode hantu (Semua pesan tidak akan centang biru)

// Pengecualian: Tetap berikan centang biru untuk Owner/VIP
sock.setVIP("628123456789@s.whatsapp.net", true);
```

### 🛡️ Anti-Delete Core
Tangkap pesan yang dihapus oleh pengirim. Library akan menyimpan cache pesan sementara dan memberikan event khusus saat terjadi penghapusan.

```javascript
sock.ev.on('message.delete', ({ jid, id, message }) => {
    console.log(`Pesan dihapus di ${jid}!`);
    console.log(`Konten asli:`, message.text);
    
    // Kirim balik pesan yang dihapus (Anti-Delete)
    sock.sendMessage(jid, { text: `Terciduk menghapus pesan:\n\n${message.text}` }, { quoted: message });
});
```

### 📱 Status Tracker (GETSW)
Pantau status (story) WhatsApp orang lain secara otomatis. Cocok untuk fitur "Status Downloader".

```javascript
// 1. Dapatkan daftar semua orang yang baru update status
const senders = sock.getAllStatusSenders();

// 2. Ambil daftar status dari orang tertentu
const statuses = sock.getStatusesFrom("628xxx@s.whatsapp.net");

// 3. Download media status (Gambar/Video)
const buffer = await sock.downloadStatusMedia(statuses[0]);

// 4. Event Listener Status Baru
sock.onStatusUpdate((m) => {
    console.log(`Status baru dari ${m.key.participant}: ${m.statusData.caption}`);
});
```

### 🚀 Smart Command & Reply Helpers
Membuat bot menjadi jauh lebih simpel dan rapi.

```javascript
// Command Handler Simpel
sock.onCommand('.menu', async (m) => {
    await m.reply("Ini adalah menu bot FreeZeeHost!");
});

// Reply otomatis menyertakan quote/tag pesan asal
await m.reply("Pesan ini otomatis membalas Anda.");
```

### 🔘 Advanced Interactive UI (sock.msg)
Sederhanakan pengiriman pesan kompleks (Buttons, Lists, Table) menjadi satu baris kode.

```javascript
// 1. Send Interactive List
await sock.msg.list(jid, "Judul", "Deskripsi", "Footer", "Klik Disini", [
    { title: "Opsi 1", rows: [{ title: "Pilih Ini", id: ".cmd1" }] }
]);

// 2. Send Native Flow Table
const rows = [
    { column1: "Nama", column2: "Harga" },
    { column1: "Bot Premium", column2: "Rp 50.000" }
];
await sock.msg.nativeTable(jid, "Daftar Harga", rows);

// 3. Send Carousel (Card Slider)
const cards = [
    { title: "Produk A", body: "Keren", image: { url: "..." }, buttons: [...] },
    { title: "Produk B", body: "Murah", image: { url: "..." }, buttons: [...] }
];
await sock.msg.carousel(jid, cards);
```

### 🥷 Stealth Mode (Typing Simulation)
Bot akan melakukan simulasi "Sedang mengetik..." atau "Sedang merekam suara..." sebelum membalas pesan agar terlihat seperti manusia asli.

```javascript
await sock.simulateTyping(jid, 3000); // Simulasi mengetik selama 3 detik
await sock.sendMessage(jid, { text: "Halo, saya manusia!" });

await sock.simulateRecording(jid, 2000); // Simulasi merekam suara
```

---

## ⚙️ Internal Optimizations (Under the Hood)

- **Smart Media Proxy**: Library secara otomatis mengecek SHA256 media sebelum mengirim. Jika media yang sama pernah dikirim sebelumnya, library akan mencoba menggunakan cache untuk menghemat bandwidth.
- **Auto-Medic (Self-Healing)**: Setiap 45 detik, library mengecek detak jantung socket. Jika terdeteksi "macet" (silence), library akan melakukan *surgical restart* pada koneksi tanpa mematikan proses bot.
- **Task Queue**: Semua pesan keluar masuk ke antrian internal. Ini mencegah bot diblokir oleh WhatsApp karena mengirim terlalu banyak pesan dalam satu milidetik (Spam Prevention).
- **Global Injection**: `proto`, `delay`, dan `smsg` otomatis tersedia secara global. Anda tidak perlu lagi melakukan `require` berulang kali di setiap file plugin.

---

## 📋 Quick Start (Complete Example)

```javascript
const { default: makeWASocket, useMultiFileAuthState, patchSocket } = require('@freezeehost/baileys');

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    // WAJIB: Pasang fitur premium FreeZee
    patchSocket(sock);

    sock.ev.on('creds.update', saveCreds);

    // Gunakan helper onCommand
    sock.onCommand('.ping', (m) => m.reply('Pong!'));
    
    sock.onCommand('.ios', (m) => {
        sock.setPersona('ios');
        m.reply('Identity switched to iPhone.');
    });
}
connect();
```

---

## 🛡️ Disclaimer
Proyek ini **tidak berafiliasi** dengan WhatsApp/Meta. Segala risiko penggunaan (seperti banned) adalah tanggung jawab masing-masing pengguna. Gunakan secara bijak dan jangan melakukan spam.

## ⚡ Contact & Support
- **Site**: [zass.cloud](https://zass.cloud)
- **Channel**: [Official Channel](https://zass.cloud/wa/channel/info)

---
<div align="center">
  Made with ❤️ by <b>FreeZeeHost</b>
</div>
