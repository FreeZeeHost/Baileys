<div align="center">
  <img src="https://files.catbox.moe/gw41eq.png" alt="@freezeehost/baileys" width="450"/>  

  <h1>@freezeehost/baileys</h1>
  <p><strong>Lightweight, Full-Featured WhatsApp Web for Node.js</strong></p>
  
  <p>
    <a href="https://npmjs.com/package/@freezeehost/baileys">
      <img src="https://img.shields.io/npm/v/@freezeehost/baileys?color=blue&logo=npm" alt="npm version">
    </a>
    <a href="https://github.com/whiskeysockets/baileys/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/whiskeysockets/baileys?color=green" alt="License">
    </a>
    <a href="https://github.com/whiskeysockets/baileys/stargazers">
      <img src="https://img.shields.io/github/stars/whiskeysockets/baileys?color=yellow&logo=github" alt="GitHub stars">
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

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| **🎭 Persona Switcher** | Ubah identitas bot menjadi iPhone/Android/Windows secara instan (Anti-Ban). | ✅ **AKTIF** |
| **🛡️ Anti-Delete Core** | Menangkap pesan yang ditarik/dihapus secara otomatis di level library. | ✅ **AKTIF** |
| **🧠 Smart Media Proxy** | Penghemat bandwidth & penyimpanan VPS hingga 80% (Deduplikasi SHA256). | ✅ **AKTIF** |
| **🔐 AES-256 Logger** | Logging aktivitas terenkripsi langsung ke MongoDB (Sangat Aman). | ✅ **AKTIF** |
| **🩺 Auto-Medic** | Pemulihan socket otomatis jika koneksi macet (Self-Healing). | ✅ **AKTIF** |
| **🚦 Task Queue** | Antrian pesan cerdas dengan delay dinamis untuk menghindari limit WA. | ✅ **AKTIF** |
| **👻 Phantom Mode** | Baca pesan tanpa centang biru dan lock status "Always Typing". | ✅ **AKTIF** |

## 💎 FreeZee Premium Features

### ☁️ MongoDB Cloud Auth
Forget `auth-info.json` corruption. Store your sessions safely in MongoDB with atomic updates and automatic synchronization.
- **Internal Bypass**: Automatically uses our high-speed internal DB if no URL is provided.

### 🥷 Stealth Mode
Make your bot look human. Simulate typing and recording statuses seamlessly while your bot processes heavy commands.
- `conn.simulateTyping(jid, duration)` -> Status "Mengetik..."
- `conn.simulateRecording(jid, duration)` -> Status "Merekam suara..."

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

### 💼 Native Commerce & Professional
Fitur native untuk bot bisnis dan transaksi profesional.

#### 🛒 Native Order Card
Kirim kartu pesanan native yang interaktif.
```javascript
await conn.sendOrder(jid, {
    id: "order_123",
    title: "Order Baru: Bot Premium",
    text: "Silakan konfirmasi pesanan Anda di bawah.",
    totalAmount: 50000,
    currency: "IDR",
    itemCount: 1,
    thumbnail: fs.readFileSync("./thumb.jpg")
});
```

#### 💰 Native Invoice
Kirim tagihan atau invoice resmi dalam format native.
```javascript
await conn.sendInvoice(jid, {
    note: "Tagihan VPS Bulan Juni",
    token: "invoice_token_xyz",
    type: "PDF" // atau 'IMAGE'
});
```

#### 📦 Native Product Catalog
Bagikan produk dari katalog bisnis Anda secara native.
```javascript
await conn.sendProduct(jid, "628xxx@s.whatsapp.net", {
    id: "prod_456",
    title: "VPS High Performance",
    price: 150000,
    thumbnail: "https://..."
});
```

### 🤝 Interaction & Engagement
Fitur untuk meningkatkan interaksi user dengan bot.

#### 💬 Message Comments (Attached Replies)
Lampirkan komentar langsung ke pesan tertentu (seperti fitur komentar di media sosial).
```javascript
// Membalas pesan 'm' dengan komentar native
await m.replyComment("Setuju banget sama ini!");

// Mode Global
await conn.sendComment(jid, "Komentar saya", targetMessageKey);
```

#### 📊 Poll Result Snapshot
Kirim ringkasan hasil voting atau kuis yang cantik secara native.
```javascript
await m.replyPollResult("Hasil Pilihan", [
    { name: "Opsi A", count: 15 },
    { name: "Opsi B", count: 7 }
]);
```

#### 📍 Native Live Location
Berbagi lokasi terkini secara realtime di dalam chat.
```javascript
await m.replyLiveLocation(-6.2, 106.8, 3600); // 3600 detik (1 jam)
```

#### ❓ Bot/AI Question Reply
Memberikan balasan resmi untuk kotak pertanyaan interaktif.
```javascript
await conn.replyQuestion(jid, "Jawaban saya adalah...", questionMessageKey);
```

### 📱 Social & Status Features
Maksimalkan fitur Status dan Channel WhatsApp.

#### ❓ Status Ask Me Anything (Q&A)
Kirim kotak pertanyaan interaktif ke Status WhatsApp bot.
```javascript
await conn.sendStatusQuestion("Ada ide fitur baru buat bot ini?");
```

#### 🎭 Native Status Quoting
Kutip (quote) Status WhatsApp orang lain ke dalam chat secara native.
```javascript
await conn.quoteStatus(jid, "Status ini keren!", statusKey, thumbBuffer);
```

#### ✉️ Newsletter/Channel Invites
Kirim undangan resmi untuk admin atau follower channel.
```javascript
// Undang Admin
await conn.newsletter.inviteAdmin(jid, "628xxx@s.whatsapp.net");

// Undang Follower
await conn.newsletter.inviteFollower(jid, "Nama Channel", thumbBuffer, "Join yuk!");
```

### 🛠️ Chat Organization & Group Management

#### 📌 Message Pinning
Pin pesan penting di bagian atas chat.
```javascript
await m.pin(86400); // Pin selama 24 jam
await conn.pinMessage(jid, messageKey, 86400);
```

#### 💾 Message Keeping (Preservation)
Simpan pesan di chat "Pesan Sementara" agar tidak hilang.
```javascript
await m.keep(); // Simpan pesan
await m.unkeep(); // Batal simpan
```

#### 📅 Native Group Events
Buat undangan acara resmi di dalam grup.
```javascript
await conn.createEvent(jid, {
    name: "Mabar Akhir Pekan",
    description: "Kumpul di Discord jam 9 malam",
    startTime: "2026-06-15T21:00:00",
    location: { lat: -6.2, lng: 106.8, name: "Voice Channel 1" }
});
```

#### 📞 Scheduled Group Calls
Jadwalkan telepon grup (suara/video) secara resmi.
```javascript
await conn.scheduleCall(jid, "Briefing Pagi", 1, Date.now() + 3600000);
```

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

// Mode Reply
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

#### 🖼️ AI Grid Image
Mengirim kumpulan gambar dalam format grid cantik.
```javascript
// Mode Global
await conn.aiGridImage(jid, ["https://url1.jpg", "https://url2.jpg"]);

// Mode Reply
await m.replyGridImage(["https://url1.jpg", "https://url2.jpg", "https://url3.jpg"]);
```

#### 🖼️ AI Inline Image (Text + Image)
Mengirim gambar yang menyatu dengan teks (sejajar).
```javascript
// Mode Global
await conn.aiInlineImage(jid, "https://url.jpg", "Ini deskripsi", 0); // 0: Leading, 1: Trailing, 2: Center

// Mode Reply
await m.replyInlineImage("https://url.jpg", "Deskripsi di samping gambar");
```

#### 👾 AI Dynamic Content (GIF)
Mengirim konten dinamis seperti GIF dengan gaya Meta AI.
```javascript
// Mode Global
await conn.aiDynamic(jid, "https://media.giphy.com/...", true);

// Mode Reply
await m.replyDynamic("https://url-ke-gif.com/...", true);
```

#### 📐 AI Latex (Matematika)
Mengirim rumus matematika yang terformat rapi.
```javascript
// Mode Global
await conn.aiLatex(jid, "Hasil perhitungan:", ["E = mc^2"]);

// Mode Reply
await m.replyLatex("Rumus Pythagoras:", ["a^2 + b^2 = c^2"]);
```

#### 📍 AI Map (Peta Interaktif)
Mengirim peta dengan pin lokasi (annotations) yang bisa diklik.
```javascript
const pins = [{ lat: -6.2, lng: 106.8, title: "Pusat Kota", body: "Keterangan lokasi" }];

// Mode Global
await conn.aiMap(jid, -6.2, 106.8, pins);

// Mode Reply
await m.replyMap(-6.2, 106.8, pins);
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

### 🧠 Advanced AI Behaviors (Level 2)
Fitur tingkat lanjut untuk membuat interaksi bot Anda benar-benar "hidup" seperti Meta AI asli.

#### 💬 AI Suggested Prompts (Chips)
Menambahkan tombol saran balasan (chips) di bagian bawah pesan.
```javascript
// Mode Global
await conn.aiPrompts(jid, "Apa yang ingin kamu bahas?", ["Resep Masakan", "Berita Hari Ini", "Cuaca"]);

// Mode Reply
await m.replyPrompts("Pilih opsi di bawah:", ["Bantuan", "Beli Premium", "Info Bot"]);
```

#### 💭 AI Thinking Indicator
Menampilkan proses berpikir bot langkah demi langkah. Berguna untuk tugas yang memakan waktu.
```javascript
// Mode Global
await conn.aiThinking(jid, "Menganalisis pertanyaan...", [
    { title: "Mencari data", body: "Searching source...", status: 2 }, // 2: Sukses
    { title: "Menyusun jawaban", body: "Drafting...", status: 1 }    // 1: Proses
]);

// Mode Reply
await m.replyThinking("Sedang berpikir...", [{ title: "Step 1", status: 2 }]);
```

#### 👍 AI User Feedback
User bisa memberikan rating jempol pada pesan bot.
```javascript
// Mengirim feedback positif untuk pesan m
await m.aiFeedback(true, "Jawaban sangat bagus!");

// Mengirim feedback negatif
await m.aiFeedback(false, "Kurang akurat.");
```

#### 🏷️ AI Model Branding
Memberikan label resmi model AI pada jawaban bot (misal: Llama 3).
```javascript
// Mode Global
await conn.aiModel(jid, "Jawaban dari bot.", 1, "Llama 3.1 Pro");

// Mode Reply
await m.replyModel("Halo, saya AI.", 2, "FreeZee Premium Model");
```




### 🔍 Deep Media X-Ray (Metadata)
Extract hidden information from any media file (Image, Audio, Video).
- **Functions**: `await conn.getMediaInfo(buffer)`
- **Capabilities**: Detects real MIME type, Image dimensions, Audio/Video duration, Bitrate, and EXIF data.
- **Deduplication Ready**: Returns unique SHA256 for easy file tracking.
\n### 🛡️ Internal Anti-Delete & ViewOnce Guard
Your bot will never miss a message again.
- **Anti-Delete**: Captured revoked messages are stored and accessible via `conn.getDeletedMessage(jid, id)`.
- **ViewOnce Bypass**: Automatically extracts content from "One-time view" messages, making them permanent.
- **Event**: Listen to `conn.ev.on("message.delete", callback)` to receive deleted content.

### 🩺 Auto-Medic (Self-Healing Socket)
Ensures your bot stays online 24/7.
- **Watchdog**: Monitored socket health. If silence is detected for >45s, the library performs a "Surgical Reconnect".
- **Zero-Stuck**: Automatically recovers from "Connecting..." freezes without restarting the process.

### 🚦 Smart Task Queue (Anti-Ban Engine)
Spread out your traffic to mimic human behavior.
- **Dynamic Delay**: Automatic spacing between sent messages and media.
- **Auto-Retry**: Failed media uploads are automatically retried up to 3 times with exponential backoff.
- **High Volume**: Safely send hundreds of messages without triggering WhatsApp anti-spam.

### 🗜️ Smart Media Compressor
Save VPS bandwidth and disk space.
- **Auto-JPEG**: If `sharp` is installed, images are optimized to 70% quality before upload.
- **Bandwidth Saver**: Reduces the data footprint of your bot by up to 3x.

### 🌐 Built-in API Bridge & Webhook
Control your bot from any application.
- **Mini-Server**: Set `API_PORT` to start a local HTTP server for stats and sending.
- **Event Forwarding**: Set `WEBHOOK_URL` to receive all WhatsApp events as real-time JSON POST requests.
- **Dashboard Ready**: Connect your PHP/Python website in seconds.

### 👻 Phantom Protocol (Advanced Presence)
Master the art of invisibility.
- **Ghost Mode**: `conn.ghostMode = true` to read messages without sending blue ticks.
- **Selective Read**: `conn.setVIP(jid)` to only show blue ticks to specific people.
- **Presence Lock**: `conn.setStatusPresence("composing", jid)` stays active forever.

### 🔐 Encrypted Activity Logger
Automate your compliance and security. Every message and system event is recorded into MongoDB with AES-256-GCM encryption.
- **Auto-Config**: Active immediately when using MongoDB Auth.
- **Privacy**: No one can read your logs without your master key.

### 🎭 Persona Identity Switcher
Change your bot identity on-the-fly. Make your bot appear as an iPhone, Android, or Windows desktop.
- `conn.setPersona("ios")` -> Spoof as iPhone Safari.
- `conn.setPersona("android")` -> Spoof as Android Chrome.
- **Anti-Ban**: Rotate identities to avoid detection by WhatsApp anti-bot systems.

### 🧠 Smart Media Proxy (Deduplication)
Save up to 80% of your VPS bandwidth and storage.
- **SHA256 Tracking**: Automatically detects if you are sending or receiving the same media multiple times.
- **Instant Reuse**: Reuses existing cloud media properties instead of re-uploading.

### ⚡ Turbo-Loader: Plugin Optimizer
Pre-warm your bot engine for instant responsiveness.
- `conn.prefetchPlugins("./commands")` -> Pre-loads and optimizes plugins in RAM.
- **Zero Lag**: Your bot responds to the first command as fast as the thousandth.

### 📊 Real-time Activity Metrics
Get a deep look into your bot health.
- `conn.getActivityMetrics()` -> Returns messages sent/recv, error counts, uptime, and RAM usage.

### 📱 Status Tracker (GETSW)
Perfect for building status-saving bots.
- `conn.onStatusUpdate(callback)` -> Listen to every new status posted.
- `conn.getAllStatusSenders()` -> Get list of everyone who has an active status.
- `conn.getStatusCounts()` -> Returns object with JID and number of available statuses.
- `conn.getStatusesFrom(jid)` -> Get history of statuses from a specific person.
- `conn.downloadStatusMedia(m)` -> Download image/video from a status message.

---


<br>

## 📚 Table of Contents  
- [Features](#-features)  
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

<br>

## 🔥 Updated New (14 Oktober 2025)
- 🍟 Convert LID Mentions to JID
- 🤖 Convert Sender LID to JID
- 👥 Convert Group ID LID to JID
- 🩸 Fixed All Bug LID (participant - mentionedJid - sender - admins group)
- ✨ Dependencities Update (vulnerabilities deleted)
- 🍡 watermark (FreeZeeHost)

<br>

## 🌱 Owner’s Notice  

Proyek ini bersifat **publik**, sehingga siapa pun dapat menggunakan atau melakukan *rename* untuk keperluan pribadi. Namun, penggunaan untuk tujuan **komersial** atau sekadar pencarian nama **tidak diperkenankan**.  

Proyek ini dikembangkan berdasarkan libary **Whiskeysocket**, dengan perbaikan dan peningkatan yang dilakukan oleh administrator.  
Tujuan utama dari proyek ini adalah untuk **memudahkan pengguna serta memperbaiki kesalahan bot yang sebelumnya sering dialami**.  

Saat ini proyek masih dalam tahap **Beta**, sehingga kemungkinan masih terdapat bug atau kendala tak terduga saat proses instalasi maupun eksekusi.  
Jika Anda mengalami masalah yang berlanjut, silakan hubungi kami melalui kontak yang telah tersedia.  

Terimakasih, salam hangat, FreeZeeHost!
<br>

## ⚡ Contact Admin
- [Site](https://zass.cloud)
- [Channel](https://zass.cloud/wa/channel/info)
- [Script Gratis](https://neolabsofficial.my.id)
- [Pterodactyl Murah](https://pteroku-desu.zass.cloud)

<br>

## 📜 License
- This project is licensed for **personal and non-commercial use only**.  
- Redistribution, modification, or renaming for personal purposes is allowed.  
- **Commercial use, resale, or name-hunting is strictly prohibited.**

<br>

## 🤝 Contribution Guidelines
We welcome contributions to improve this project. To contribute:  
1. Fork the repository  
2. Create a new branch for your feature or fix  
3. Submit a pull request with a clear explanation of the changes  

All contributions will be reviewed before merging.  

<br>

## 📥 Installation
```bash
npm install @freezeehost/baileys
# or
yarn add @freezeehost/baileys
```

<br>

## 🚀 Quick Start
```javascript
const {
  default: makeWASocket,
  useMultiFileAuthState,
} = require('@freezeehost/baileys');

const {
  state,
  saveCreds
} = await useMultiFileAuthState("./path/to/sessions/folder")

/*
 * const conn = makeWASocket({ printQRInTerminal: true });
 * code to get WhatsApp web connection
 * QR code or pairing code type available
 */

conn.ev.on('messages.upsert', ({ messages }) => {
  console.log('New message:', messages[0].message);
});
```

<br>

## 📖 Documentation

### 🔌 Connecting Account
<details>
<summary><strong>🔗 Connect with QR Code</strong></summary>

```javascript
const conn = makeWASocket({
  printQRInTerminal: true, // true to display QR Code
  auth: state
})
```
</details>

<details>
<summary><strong>🔢 Connect with Pairing Code</strong></summary>

```javascript
const conn = makeWASocket({
  printQRInTerminal: false, // false so that the pairing code is not disturbed
  auth: state
})

if (!conn.authState.creds.registered) {
  const number = "62xxxx"

  // use default pairing code (default 1-8)
  const code = await conn.requestPairingCode(number)

  // use customer code pairing (8 digit)
  const customCode = "ABCD4321"
  const code = await conn.requestPairingCode(number, customCode)
  console.log(code)
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
  if (m.pollUpdates) console.log('Poll vote:', m.pollUpdates);
});
```
</details>

<br>

### 📨 Sending Messages

```javascript
/**
 * Sends a message using the WhatsApp socket connection.
 * 
 * @param {string} jid - The JID (Jabber ID) of the recipient/user.
 *                       This is the unique identifier for the WhatsApp user/group.
 * @param {Object} content - The message content to be sent. Can be any valid message type
 *                           (text, image, video, document, etc.) with required parameters.
 * @param {Object} [options] - Optional parameters for message generation and sending.
 *                             Can include properties like:
 *                             - quoted: Message to reply to
 *                             - ephemeral: If message should disappear after viewing
 *                             - mediaUpload: Media upload options
 *                             - etc.
 * @returns {Promise<Object>} A promise that resolves with the sent message info or
 *                            rejects with an error if sending fails.
 */
const jid = '';        // Recipient's JID (WhatsApp ID) or LID
const content = {};     // Message content object
const options = {};     // Optional message options

// Send the message using the WhatsApp socket connection
conn.sendMessage(jid, content, options)
```

<details>
<summary><strong>📝 Text Message</strong></summary>

```javascript
// Simple Text
await conn.sendMessage(jid, { text: 'Hello!' });
```

```javascript
// Text with link preview
await conn.sendMessage(jid, {
  text: 'Visit https://example.com',
  linkPreview: {
    'canonical-url': 'https://example.com',
    title: 'Example Domain',
    description: 'A demo website',
    jpegThumbnail: fs.readFileSync('preview.jpg')
  }
});
```

```javascript
// With Quoted Reply
await conn.sendMessage(jid, { text: 'Hello Shiroko!' }, { quoted: message });
```
</details>


<details>
<summary><strong>🖼️ Image Message</strong></summary>

```javascript
// With local file buffer
await conn.sendMessage(jid, { 
  image: fs.readFileSync('shiroko.jpg'),
  caption: 'My wife!',
  mentions: ['1234567890@s.whatsapp.net'] // Tag users
});
```

```javascript
// With URL
await conn.sendMessage(jid, { 
  image: { url: 'https://example.com/shiroko.jpg' },
  caption: 'Emh ayang nya zass'
});
```
</details>

<details>
<summary><strong>🎥 Video Message</strong></summary>

```javascript
// With Local File
await conn.sendMessage(jid, { 
  video: fs.readFileSync('video.mp4'),
  caption: 'Funny clip!'
});
```

```javascript
// With URL File
await conn.sendMessage(jid, { 
  video: { url: 'https://example.com/video.mp4' },
  caption: 'Streamed video'
});
```

```javascript
// View Once Message
await conn.sendMessage(jid, {
  video: fs.readFileSync('secret.mp4'),
  viewOnce: true // Disappears after viewing
});
```
</details>

<details>
<summary><strong>🎵 Audio/PTT Message</strong></summary>

```javascript
// Regular audio
await conn.sendMessage(jid, { 
  audio: fs.readFileSync('audio.mp3'),
  ptt: false // For music
});
```

```javascript
// Push-to-talk (PTT)
await conn.sendMessage(jid, { 
  audio: fs.readFileSync('voice.ogg'),
  ptt: true, // WhatsApp voice note
  waveform: [0, 1, 0, 1, 0] // Optional waveform
});
```
</details>

<details>
<summary><strong>👤 Contact Message</strong></summary>

```javascript
const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
  + 'VERSION:3.0\n' 
  + 'FN:Jeff Singh\n' // full name
  + 'ORG:Ashoka Uni\n' // the organization of the contact
  + 'TELtype=CELLtype=VOICEwaid=911234567890:+91 12345 67890\n' // WhatsApp ID + phone number
  + 'END:VCARD'

await conn.sendMessage(jid, { 
  contacts: { 
    displayName: 'Your Name', 
    contacts: [{ vcard }] 
  }
})
```
</details>

<details>
<summary><strong>🔥 Sticker Message</strong></summary>

```javascript
// Simple send sticker 
await conn.sendSticker(jid, { 
   sticker: './your/path', //user path
   packname: "your packname", 
   author: "your author" 
  }
);
```

```javascript
// Simple send sticker 
await conn.sendSticker(jid, { 
   sticker: { url : "https://your.url.com/image.webp" }, //user url
   packname: "your packname", 
   author: "your author" 
  }
);
```

```javascript
// Simple send sticker 
await conn.sendSticker(jid, { 
   sticker: fs.readFileSync('sticker.webp'), //use buffer
   packname: "your packname", 
   author: "your author" 
  }
);
```
</details>

<details>
<summary><strong>💥 React Message</strong></summary>

```javascript
await conn.sendMessage(jid, {
  react: {
    text: '👍', // use an empty string to remove the reaction
    key: message.key
  }
})
```
</details>

<details>
<summary><strong>📌 Pin & Keep Message</strong></summary>

| Time  | Seconds        |
|-------|----------------|
| 24h    | 86.400        |
| 7d     | 604.800       |
| 30d    | 2.592.000     |

```javascript
// Pin Message
await conn.sendMessage(jid, {
  pin: {
    type: 1, // 2 to remove
    time: 86400,
    key: message.key
  }
})
```

```javascript
// Keep message
await conn.sendMessage(jid, {
  keep: {
    key: message.key,
    type: 1 // or 2 to remove
  }
})
```
</details>

<details>
<summary><strong>📍 Location Message</strong></summary>

```javascript
// Static location
await conn.sendMessage(jid, {
  location: {
    degreesLatitude: 37.422,
    degreesLongitude: -122.084,
    name: 'Google HQ'
  }
});
```

```javascript
// Thumbnail location
await conn.sendMessage(jid, {
  location: {
    degreesLatitude: 37.422,
    degreesLongitude: -122.084,
    name: 'Google HQ',
    jpegThumbnail: fs.readFileSync('preview.jpg')
  }
});
```

```javascript
// Live location (updates in real-time)
await conn.sendMessage(jid, {
  location: {
    degreesLatitude: 37.422,
    degreesLongitude: -122.084,
    accuracyInMeters: 10
  },
  live: true, // Enable live tracking
  caption: 'I’m here!'
});
```
</details>

<details>
<summary><strong>📞 Call Message</strong></summary>

```javascript
await conn.sendMessage(jid, {
  call: {
    name: 'Here is call message',
    type: 1 // 2 for video
  }
})
```
</details>

<details>
<summary><strong>🗓️ Event Message</strong></summary>

```javascript
await conn.sendMessage(jid, {
  event: {
    isCanceled: false, // or true
    name: 'Here is name event',
    description: 'Short description here',
    location: {
      degreesLatitude: 0,
      degreesLongitude: 0,
      name: 'Gedung Tikus Kantor'
    },
    startTime: 17..., // timestamp date
    endTime: 17..., // timestamp date
    extraGuestsAllowed: true // or false
  }
})
```
</details>

<details>
<summary><strong>🛒 Order Message</strong></summary>

```javascript
await conn.sendMessage(jid, {
  order: {
    orderId: '123xxx',
    thumbnail: fs.readFileSync('preview.jpg'),
    itemCount: '123',
    status: 'INQUIRY', // INQUIRY || ACCEPTED || DECLINED
    surface: 'CATALOG',
    message: 'Here is order message',
    orderTitle: 'Here is title order',
    sellerJid: '628xxx@s.whatsapp.net'',
    token: 'token_here',
    totalAmount1000: '300000',
    totalCurrencyCode: 'IDR'
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
    selectableCount: 1 // Single-choice
  }
});
```

```javascript
// Poll results (snapshot)
await conn.sendMessage(jid, {
  pollResult: {
    name: 'Favorite color?',
    values: [['Red', 10], ['Blue', 20]] // [option, votes]
  }
});
```
</details>

<details>
<summary><strong>🛍️ Product Message</strong></summary>

```javascript
await conn.sendMessage(jid, {
  product: {
    productId: '123',
    title: 'Cool T-Shirt',
    description: '100% cotton',
    price: 1999, // In cents (e.g., $19.99)
    currencyCode: 'USD',
    productImage: fs.readFileSync('shirt.jpg')
  }
});
```
</details>


<details>
<summary><strong>💳 Payment Message</strong></summary>

```javascript
await conn.sendMessage(jid, {
  payment: {
    note: 'Here is payment message',
    currency: 'USD', // optional 
    offset: 0, // optional
    amount: '100000', // optional
    expiry: 0, // optional
    from: '628xxx@s.whatsapp.net', // optional
    image: { // optional
      placeholderArgb: "your_background", // optional
      textArgb: "your_text",  // optional
      subtextArgb: "your_subtext" // optional
    }
  }
})
```
</details>


<details>
<summary><strong>📜 Payment Invite Message</strong></summary>

```javascript
await conn.sendMessage(jid, { 
  paymentInvite: {
    type: 1, // 1 || 2 || 3
    expiry: 0 
  }   
})
```
</details>


<details>
<summary><strong>👤 Channel Admin Invite</strong></summary>

```javascript
await conn.sendMessage(jid, {
  adminInvite: {
    jid: '172xxx@newsletter',
    name: 'Newsletter Title', 
    caption: 'Undangan admin channel saya',
    expiration: 86400,
    jpegThumbnail: fs.readFileSync('preview.jpg') // optional
  }
})
```
</details>


<details>
<summary><strong>👥 Group Invite Message</strong></summary>

```javascript
await conn.sendMessage(jid, {
  groupInvite: {
    jid: '123xxx@g.us',
    name: 'Group Name!', 
    caption: 'Invitation To Join My Whatsapp Group',
    code: 'xYz3yAtf...', // code invite link
    expiration: 86400,
    jpegThumbnail: fs.readFileSync('preview.jpg') // optional            
  }
})
```
</details>

<details>
<summary><strong>🔢 Phone Number Message</strong></summary>

```javascript
// Request phone number
await conn.sendMessage(jid, {
  requestPhoneNumber: {}
})
```
```javascript
// Share phone number
await conn.sendMessage(jid, {
  sharePhoneNumber: {}
})
```
</details>

<details>
<summary><strong>↪️  Reply Button Message</strong></summary>

```javascript
// Reply List Message
await conn.sendMessage(jid, {
  buttonReply: {
    name: 'Hii',
    description: 'description', 
    rowId: 'ID'
  }, 
  type: 'list'
})
```

```javascript
// Reply Button Message
await conn.sendMessage(jid, {
  buttonReply: {
    displayText: 'Hii', 
    id: 'ID'
  }, 
  type: 'plain'
})
```

```javascript
// Reply Template Message
await conn.sendMessage(jid, {
  buttonReply: {
    displayText: 'Hii',
    id: 'ID',
    index: 1 // number id button reply
  }, 
  type: 'template'
})
```

```javascript
// Reply Interactive Message
await conn.sendMessage(jid, {
  buttonReply: {
    body: 'Hii', 
    nativeFlows: {
      name: 'menu_options', 
      paramsJson: JSON.stringify({ id: 'ID', description: 'description' }) 
      version: 1 // 2 | 3
    }
  }, 
  type: 'interactive'
})
```
</details>

<details>
<summary><strong>#️⃣ Status Mentions Message</strong></summary>

```javascript
await conn.sendStatusMentions({
  image: {
    url: 'https://example.com/image.jpg'
  }, 
  caption: 'Nice day!'
}, ["123@s.whatsapp.net", "123@s.whatsapp.net"])
```
</details>

<details>
<summary><strong>📸 Album Message</strong></summary>

```javascript
await conn.sendAlbumMessage(jid,
  [{
    image: { url: 'https://example.com/image.jpg' },
    caption: 'Hello World'
  },
  {
    image: fs.readFileSync('image.jpg'), 
    caption: 'Hello World'
  },
  {
    video: { url: 'https://example.com/video.mp4' },
    caption: 'Hello World'
  },
  {
    video: fs.readFileSync('video.mp4'),
    caption: 'Hello World'
  }],
{ quoted: message, delay: 3000 })
```
</details>

<details>
<summary><strong>👨‍💻 Interactive Message</strong></summary>

> This is an interactive chat created based on Proto WhatsApp business data, if the message does not work then there may be a change in the buttonParamsJson structure.

<details>
<summary><strong>Shop Flow Message</strong></summary>

<div align="center">
  <img src="https://files.catbox.moe/pdeeq8.png" alt="Example Shop Message" width="450"/>
  <p>Preview the shop message display, usually used to direct customers to the Facebook page or account.</td>
</div>

```javascript
// Headers Text
await conn.sendMessage(jid, {      
  text: 'Here is body message',
  title: 'Here is title', 
  subtitle: 'Here is subtitle', 
  footer: '© @freezeehost/baileys',
  viewOnce: true,
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }
})
```

```javascript
// Headers Image
await conn.sendMessage(jid, { 
  image: {
    url: 'https://www.example.com/image.jpg'
  },    
  caption: 'Here is body message',
  title: 'Here is title', 
  subtitle: 'Here is subtitle', 
  footer: '© @freezeehost/baileys',
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }, 
  hasMediaAttachment: true, // or false
  viewOnce: true
})
```

```javascript
// Headers Video
await conn.sendMessage(jid, { 
  video: {
    url: 'https://www.example.com/video.mp4'
  },    
  caption: 'Here is body message',
  title: 'Here is title', 
  subtitle: 'Here is subtitle', 
  footer: '© @freezeehost/baileys',
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }, 
  hasMediaAttachment: true, // or false
  viewOnce: true
})
```

```javascript
// Headers Document
await conn.sendMessage(jid, {
  document: { 
    url: 'https://www.example.com/document.pdf' 
  }, 
  mimetype: 'application/pdf', 
  jpegThumbnail: await conn.resize('https://www.example.com/thumbnail.jpg', 320, 320), 
  caption: 'Here is body message',
  title: 'Here is title',
  subtitle: 'Here is subtitle', 
  footer: '© @freezeehost/baileys',
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }, 
  hasMediaAttachment: false, // or true, 
  viewOnce: true
})
```

```javascript
// Headers Location
await conn.sendMessage(jid, { 
  location: {
    degressLatitude: -0, 
    degressLongitude: 0,
    name: 'Example Location'
  },    
  caption: 'Here is body message',
  title: 'Here is title', 
  subtitle: 'Here is subtitle', 
  footer: '© @freezeehost/baileys',
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }, 
  hasMediaAttachment: false, // or true
  viewOnce: true
})
```

```javascript
// Headers Product
await conn.sendMessage(jid, {
  product: {
    productImage: { 
      url: 'https://www.example.com/product.jpg'
    },
    productId: '23942543532047956', // catalog business ID
    title: 'Example Product',
    description: 'Example Product Description',
    currencyCode: 'IDR',
    priceAmount1000: '2000000',
    retailerId: 'ExampleRetailer',
    url: 'https://www.example.com/product',
    productImageCount: 1
  },
  businessOwnerJid: '628xxx@s.whatsapp.net',
  caption: 'Here is body message',
  title: 'Here is title',
  subtitle: 'Here is subtitle',
  footer: '© @freezeehost/baileys',
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }, 
  hasMediaAttachment: false, // or true
  viewOnce: true
})
```
</details>

<details>
<summary><strong>Carosell Message</strong></summary>

<div align="center">
  <img src="https://files.catbox.moe/cf3hxd.png" alt="Example Carosell Message" width="450"/>
  <p>Preview the carosel message display, a scrollable message card that displays various items.</td>
</div>

```javascript
await conn.sendMessage(jid, {
  text: 'Here is body message',
  title: 'Here is title', 
  subtile: 'Here is subtitle', 
  footer: '© WhatsApp baileys',
  cards: [{
    image: { url: 'https://www.example.com/image.jpg' }, // or buffer
    title: 'The title cards',
    body: 'The body cards',
    footer: '© WhatsApp',
    buttons: [{
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: 'Display Text',
        id: '123'
      })
    },
    {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: 'Display Text',
        url: 'https://www.example.com'
      })
    }]
  },
  {
    video: { url: 'https://www.example.com/video.mp4' }, // or buffer
    title: 'The title cards 2',
    body: 'The body cards 2',
    footer: '© WhatsApp',
    buttons: [{
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: 'Display Text',
        id: 'ID'
      })
    },
    {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: 'Display Text',
        url: 'https://www.example.com'
      })
    }]
  }]
})
```
</details>

<details>
<summary><strong>Native Flow Message</strong></summary>

> Native flow messages are used to display various types of button messages, even for flow dialogs. These buttons are easy to use and are often able to accommodate many parameters.

<details>
<summary><strong>header_type</strong></summary>

```javascript
// Headers text
await conn.sendMessage(jid, {
  text: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© @freezeehost/baileys',
  interactive: native_flow_button
})
```

```javascript
// Headers image
await conn.sendMessage(jid, {
  image: { url: 'https://www.example.com/image.jpg' },
  caption: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© @freezeehost/baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```

```javascript
// Headers Video
await conn.sendMessage(jid, {
  video: { url: 'https://www.example.com/video.mp4' },
  caption: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© @freezeehost/baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```

```javascript
// Headers Document
await conn.sendMessage(jid, {
  document: { url: 'https://www.example.com/document.pdf' },
  jpegThumbnail: fs.readFileSync('preview.jpg'),
  mimetype: 'application/pdf',
  caption: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© @freezeehost/baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```

```javascript
// Headers Location
await conn.sendMessage(jid, {
  location: { 
    degressLatitude: -0,
    degressLongitude: 0,
    name: 'Here is name location'
  },
  caption: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© @freezeehost/baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```

```javascript
// Headers Product
await conn.sendMessage(jid, {
  product: {
    productImage: { 
      url: 'https://www.example.com/product.jpg'
    },
    productId: '23942543532047956', // catalog business ID
    title: 'Example Product',
    description: 'Example Product Description',
    currencyCode: 'IDR',
    priceAmount1000: '2000000',
    retailerId: 'ExampleRetailer',
    url: 'https://www.example.com/product',
    productImageCount: 1
  },
  businessOwnerJid: '628xxx@s.whatsapp.net',
  caption: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© @freezeehost/baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```
</details>

<details>
<summary><strong>native_flow_button</strong></summary>

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/n3wqck.png" alt="Shiroko Quick Reply" width="300">
      </td>
      <td>
        quick_reply
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'quick_reply',
  buttonParamsJson: JSON.stringify({
    display_text: 'Quick Reply',
    id: '123'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/0bbxj0.png" alt="Shiroko CTA URL" width="300">
      </td>
      <td>
        cta_url
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'cta_url',
  buttonParamsJson: JSON.stringify({
    display_text: 'Action URL',
    url: 'https://www.example.com',
    merchant_url: 'https://www.example.com'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/8vgfcw.png" alt="Shiroko CTA Copy" width="300">
      </td>
      <td>
        cta_copy
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'cta_copy',
  buttonParamsJson: JSON.stringify({
    display_text: 'Action Copy',
    copy_code: '12345678'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/ftvx6v.png" alt="Shiroko CTA Call" width="300">
      </td>
      <td>
        cta_call
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'cta_call',
  buttonParamsJson: JSON.stringify({
    display_text: 'Action Call',
    phone_number: '628xxx'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/hpswwj.png" alt="Shiroko CTA Catalog" width="300">
      </td>
      <td>
        cta_catalog
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'cta_catalog',
  buttonParamsJson: JSON.stringify({
    business_phone_number: '628xxx'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/buia02.png" alt="Shiroko CTA Reminder" width="300">
      </td>
      <td>
        cta_reminder
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'cta_reminder',
  buttonParamsJson: JSON.stringify({
    display_text: 'Action Reminder'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/mhhqrc.png" alt="Shiroko CTA Reminder" width="300">
      </td>
      <td>
        cta_cancel_reminder
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'cta_cancel_reminder',
  buttonParamsJson: JSON.stringify({
    display_text: 'Action Unreminder'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/gktote.png" alt="Shiroko Address Message" width="300">
      </td>
      <td>
        address_message
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'address_message',
  buttonParamsJson: JSON.stringify({
    display_text: 'Form Location'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/amzsvv.png" alt="Shiroko Send Location" width="300">
      </td>
      <td>
        send_location
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'send_location',
  buttonParamsJson: JSON.stringify({
    display_text: 'Send Location'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/hpswwj.png" alt="Shiroko Open Web Views" width="300">
      </td>
      <td>
        open_webview
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'open_webview',
  buttonParamsJson: JSON.stringify({
    title: 'URL Web View',
    link: {
      in_app_webview: true, // or false
      url: 'https://www.example.com'
    }
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/1zv71s.png" alt="Shiroko Multi Product Message" width="300">
      </td>
      <td>
        mpm
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'mpm',
  buttonParamsJson: JSON.stringify({
    product_id: '23942543532047956'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/b41mfc.png" alt="Shiroko Transaction Details" width="300">
      </td>
      <td>
        wa_payment_transaction_details
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'wa_payment_transaction_details',
  buttonParamsJson: JSON.stringify({
    transaction_id: '12345848'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/krp9fv.png" alt="Shiroko Greeting Message" width="300">
      </td>
      <td>
        automated_greeting_message_view_catalog
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'automated_greeting_message_view_catalog',
  buttonParamsJson: JSON.stringify({
    business_phone_number: '628xxx',
    catalog_product_id: '23942543532047956'
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/vuqvmx.png" alt="Shiroko Form Message" width="300">
      </td>
      <td>
        galaxy_message
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'galaxy_message',
  buttonParamsJson: JSON.stringify({
    mode: 'published',
    flow_message_version: '3',
    flow_token: '1:1307913409923914:293680f87029f5a13d1ec5e35e718af3',
    flow_id: '1307913409923914',
    flow_cta: 'Here is button form',
    flow_action: 'navigate',
    flow_action_payload: {
      screen: 'QUESTION_ONE',
      params: {
        user_id: '123456789',
        referral: 'campaign_xyz'
      }
    },
    flow_metadata: {
      flow_json_version: '201',
      data_api_protocol: 'v2',
      flow_name: 'Lead Qualification [en]',
      data_api_version: 'v2',
      categories: ['Lead Generation', 'Sales']
    }
  })
}]
```
---

<table border="1">
  <thead>
    <tr>
      <th>display_flow_thumb</th>
      <th>native_flow</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://files.catbox.moe/zg4vs9.png" alt="Shiroko Single Select" width="300">
      </td>
      <td>
        single_select
      </td>
    </tr>
  </tbody>
</table>

```javascript
const native_flow_button = [{
  name: 'single_select',
  buttonParamsJson: JSON.stringify({
    title: 'Selection Button',
    sections: [{
      title: 'Title 1',
      highlight_label: 'Highlight label 1',
      rows: [{
          header: 'Header 1',
          title: 'Title 1',
          description: 'Description 1',
          id: 'Id 1'
        },
        {
          header: 'Header 2',
          title: 'Title 2',
          description: 'Description 2',
          id: 'Id 2'
        }
      ]
    }]
  })
}]
```
</details>
</details>
</details>

<details>
<summary><strong>🛍️ Product Message</strong></summary>

```javascript
await conn.sendMessage(jid, {
  product: {
    productId: '123',
    title: 'Cool T-Shirt',
    description: '100% cotton',
    price: 1999, // In cents (e.g., $19.99)
    currencyCode: 'USD',
    productImage: fs.readFileSync('shirt.jpg')
  }
});
```
</details>

<details>
<summary><strong>🎭 Buttons Messages</strong></summary>

<br>

> This message button may not work if WhatsApp prohibits the free and open use of the message button. Use a WhatsApp partner if you still want to use the message button.

<details>
<summary><strong>header_type</strong></summary>

```javascript
// Button Headers Text
await conn.sendMessage(jid, {
  text: 'Choose an option:',
  buttons: button_params,
  footer: '© @freezeehost/baileys'
});
```

```javascript
// Button Headers Image
await conn.sendMessage(jid, {
  image: fs.readFileSync('image.jpg'),
  caption: 'Choose an option:',
  buttons: button_params,
  footer: '© @freezeehost/baileys'
});
```

```javascript
// Button Headers Video
await conn.sendMessage(jid, {
  video: fs.readFileSync('video.mp4'),
  caption: 'Choose an option:',
  buttons: button_params,
  footer: '© @freezeehost/baileys'
});
```

```javascript
// Button Headers Location
await conn.sendMessage(jid, {
  location: {
    degreesLatitude: 37.422,
    degreesLongitude: -122.084
  },
  caption: 'Choose an option:',
  buttons: button_params,
  footer: '© @freezeehost/baileys'
});
```
</details>

<details>
<summary><strong>button_params</strong></summary>

```javascript
// Button Params Default
const button_params = [{
  buttonId: 'id1',
  buttonText: {
    displayText: 'Option 1'
  },
  type: 1
},{
  buttonId: 'id2',
  buttonText: {
    displayText: 'Option 2'
  },
  type: 1
}]
```

```javascript
// Button Params NativeFlow
const button_params = [{
  buttonId: 'id1',
  buttonText: {
    displayText: 'Option 1'
  },
  type: 1
},{
  buttonId: 'flow',
  buttonText: {
    displayText: 'flow'
  },
  nativeFlowInfo: {
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({
      display_text: 'Visit URL',
      url: 'https://web.whatsapp.com',
      merchant_url: 'https://web.whatsapp.com'
    })
  },
  type: 2
}]
```
</details>
</details>

<details>
<summary><strong>🎭 List Messages </strong></summary>

```javascript
// Single Select
await conn.sendMessage(jid, {
  text: 'Menu:',
  sections: [
    { title: 'Food', rows: [
      { title: 'Pizza', rowId: 'pizza' },
      { title: 'Burger', rowId: 'burger' }
    ]}
  ],
  buttonText: 'Browse'
});
```

```javascript
// Product List
await conn.sendMessage(jid, {
  title: 'Here is title product',
  text: 'Text message',
  footer: '© @freezeehost/baileys',
  buttonText: 'Select Menu', 
  productList: [{
    title: 'Product Collection', 
    products: [{
      productId: '23942543532047956' // catalog business ID
    }]
  }], 
  businessOwnerJid: '6285643115199@s.whatsapp.net',
  thumbnail: { url: 'https://www.example.com/file' }
})
```
</details>

<br>

### 📣 Newsletter
<details>
<summary><strong>📋 Newsletter Metadata</strong></summary>

```javascript
// code can't have "https://whatsapp.com/channel/", only code
const newsletter = await conn.newsletterMetadata("invite", "0029Vb6w7eO9sBIEUYRgeC30")
console.log("Newsletter metadata:", newsletter)
```

```javascript
// from jid newsletter
const newsletter = await conn.newsletterMetadata("jid", "120363421570647022@newsletter")
console.log("Newsletter metadata:", newsletter)
```
</details>

<details>
<summary><strong>👥 Newsletter Follow</strong></summary>

```javascript
await conn.newsletterFollow("120363421570647022@newsletter")
```
</details>

<details>
<summary><strong>👥 Newsletter Unfollow</strong></summary>

```javascript
await conn.newsletterUnfollow("120363421570647022@newsletter")
```
</details>

<details>
<summary><strong>🔈 Newsletter Mute</strong></summary>

```javascript
await conn.newsletterMute("120363421570647022@newsletter")
```
</details>

<details>
<summary><strong>🔊 Newsletter Unmute</strong></summary>

```javascript
await conn.newsletterUnmute("120363421570647022@newsletter")
```
</details>

<details>
<summary><strong>❤️ Newsletter Reaction Mode</strong></summary>

```javascript
// Allow all emoji
await conn.newsletterReactionMode("120363421570647022@newsletter", "ALL")
```

```javascript
// Allow special emoji (👍, ❤️, 😯, 😢, 🙏)
await conn.newsletterReactionMode("120363421570647022@newsletter", "BASIC")
```

```javascript
// No reaction allowed
await conn.newsletterReactionMode("120363421570647022@newsletter", "NONE")
```
</details>

<details>
<summary><strong>📋 Update Description</strong></summary>

```javascript
await conn.newsletterUpdateDescription("120363421570647022@newsletter", "News description here!")
```
</details>

<details>
<summary><strong>👤 Update Name Newsletter</strong></summary>

```javascript
await conn.newsletterUpdateName("120363421570647022@newsletter", "New newsletter name!")
```
</details>

<details>
<summary><strong>🖼️ Change Profile Newsletter</strong></summary>

```javascript
// Change
await conn.newsletterUpdatePicture("120363421570647022@newsletter", { url: 'https://example.com/image.jpg' })
```

```javascript
// Remove
await conn.newsletterRemovePicture("120363421570647022@newsletter")
```
</details>

<details>
<summary><strong>📣 Newsletter Create</strong></summary>

```javascript
const newsletter = await conn.newsletterCreate("Here is name newsletter!", "Here is description!", { url: 'https://example.com/image.jpg' })
console.log("Here is data new created newsletter:", newsletter)
```
</details>

<details>
<summary><strong>🔥 List Newsletter Join</strong></summary>

```javascript
const list_newsletter = await conn.newsletterFetchAllParticipating()
console.log("Your list newsletter join:", list_newsletter)
```
</details>

<details>
<summary><strong>😎 Newsletter Change Owner</strong></summary>

```javascript
await conn.newsletterChangeOwner("120363421570647022@newsletter", "123@lid")
```
</details>

<details>
<summary><strong>😂 Newsletter Demote</strong></summary>

```javascript
await conn.newsletterDemote("120363421570647022@newsletter", "123@lid")
```
</details>

<details>
<summary><strong>🌟 Newsletter Reaction Message</strong></summary>

```javascript
await conn.newsletterReactMessage("120363421570647022@newsletter", "12", "🦖")
```
</details>

<br>


### 📱 Status Tracker
<details>
<summary><strong>📱 Status Tracker (GETSW)</strong></summary>

Perfect for building status-saving bots. Includes history tracking and media downloading.
- `conn.onStatusUpdate(callback)` -> Listen to every new status posted.
- `conn.getAllStatusSenders()` -> Get list of everyone who has an active status.
- `conn.getStatusCounts()` -> Returns object with JID and number of available statuses.
- `conn.getStatusesFrom(jid)` -> Get history of statuses from a specific person.
- `conn.downloadStatusMedia(m)` -> Download image/video from a status message.

#### Basic Usage:
```javascript
// 1. Listen for new status updates in real-time
conn.onStatusUpdate((m) => {
    console.log("New status from:", m.key.participant)
})

// 2. Get counts of all available statuses (history)
const counts = conn.getStatusCounts()

// 3. Download media from a captured status
const statuses = conn.getStatusesFrom("628xxx@s.whatsapp.net")
if (statuses.length > 0) {
    const buffer = await conn.downloadStatusMedia(statuses[0])
    // returns Buffer
}
```

#### Interactive Menu Example (Single Select):
```javascript
const counts = conn.getStatusCounts()
const rows = Object.keys(counts).map(jid => ({
    header: "WhatsApp Status",
    title: conn.getName(jid) || jid.split("@")[0],
    description: `Available ${counts[jid]} stories`,
    id: `.getsw ${jid}`
}))

await conn.sendMessage(m.chat, {
    text: "Select a contact to view statuses:",
    footer: "FreeZee Baileys Status Tracker",
    buttons: [{
        name: "single_select",
        buttonParamsJson: JSON.stringify({
            title: "Status List",
            sections: [{ title: "Active Contacts", rows }]
        })
    }]
})
```

</details>

<br>

### 🛠️ Groups
<details>
<summary><strong>🔄 Create Group</strong></summary>

```javascript
const group = await conn.groupCreate("New Group Title", ["123@s.whatsapp.net", "456@s.whatsapp.net"]);
console.log("New group create data:", group)
```
</details>

<details>
<summary><strong>⚙️ Change Group Settings</strong></summary>

```javascript
// only allow admins to send messages
await conn.groupSettingUpdate(jid, 'announcement')
```

```javascript
// allow everyone to send messages
await conn.groupSettingUpdate(jid, 'not_announcement')
```

```javascript
// allow everyone to modify the group's settings -- like display picture etc.
await conn.groupSettingUpdate(jid, 'unlocked')
```

```javascript
// only allow admins to modify the group's settings
await conn.groupSettingUpdate(jid, 'locked')
```
</details>

<details>
<summary><strong>💯 Add, Remove, Promote, Demote</strong></summary>

```javascript
// add member
await conn.groupParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'add')

// remove member
await conn.groupParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'remove')

// promote member (admins)
await conn.groupParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'promote')

// demote member (unadmins)
await conn.groupParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'demote')
```
</details>

<details>
<summary><strong>👥 Change Subject Title</strong></summary>

```javascript
await conn.groupUpdateSubject(jid, 'New Subject Title!')
```
</details>

<details>
<summary><strong>📋 Change Description</strong></summary>

```javascript
await conn.groupUpdateDescription(jid, 'New Description!')
```
</details>

<details>
<summary><strong>⛔ Leave Group</strong></summary>

```javascript
await conn.groupLeave(jid)
```
</details>

<details>
<summary><strong>🔗 Invite Code</strong></summary>

```javascript
// to create link with code use "https://chat.whatsapp.com/" + code
const code = await conn.groupInviteCode(jid)
console.log('group code: ' + code)
```
</details>

<details>
<summary><strong>🔁 Revoke/Reset Invite Code</strong></summary>

```javascript
const code = await conn.groupRevokeInvite(jid)
console.log('New group code: ' + code)
```
</details>

<details>
<summary><strong>🟢 Join By Invite Code</strong></summary>

```javascript
// code can't have "https://chat.whatsapp.com/", only code
const response = await conn.groupAcceptInvite(code)
console.log('joined to: ' + response)
```
</details>

<details>
<summary><strong>📋 Group Metadata By Code</strong></summary>

```javascript
const response = await conn.groupGetInviteInfo(code)
console.log('group information: ' + response)
```
</details>

<details>
<summary><strong>📋 Group Metadata</strong></summary>

```javascript
const metadata = await conn.groupMetadata(jid) 
console.log(metadata.id + ', title: ' + metadata.subject + ', description: ' + metadata.desc)
```
</details>

<details>
<summary><strong>🟢 Join using `groupInviteMessage`</strong></summary>

```javascript
const response = await conn.groupAcceptInviteV4(jid, groupInviteMessage)
console.log('joined to: ' + response)
```
</details>

<details>
<summary><strong>👥 Join Request List</strong></summary>

```javascript
const response = await conn.groupRequestParticipantsList(jid)
console.log(response)
```
</details>

<details>
<summary><strong>👥 Join Approve/Reject</strong></summary>

```javascript
// Approve
const response = await conn.groupRequestParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'approve')
```

```javascript
// Reject
const response = await conn.groupRequestParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'reject')
```
</details>

<details>
<summary><strong>👥 Group Member List</strong></summary>

```javascript
const response = await conn.groupFetchAllParticipating()
console.log(response)
```
</details>

<details>
<summary><strong>🕑 Ephemeral Toggle</strong></summary>

- Ephemeral can be:

| Time  | Seconds        |
|-------|----------------|
| Remove | 0          |
| 24h    | 86.400     |
| 7d     | 604.800    |
| 90d    | 7.776.000  |

```javascript
await conn.groupToggleEphemeral(jid, 86400)
```
</details>

<details>
<summary><strong>👥 Member Add Mode</strong></summary>

```javascript
// Everyone Member
await conn.groupMemberAddMode(jid, 'all_member_add')
```

```javascript
// Only Admin
await conn.groupMemberAddMode(jid, 'admin_add')
```
</details>

<br>


<details>
<summary><strong>📅 Native Table Message (Premium)</strong></summary>

```javascript
await conn.msg.nativeTable(jid, "Product Price List", [
    { header: "Item Name", content: "Price" },
    { header: "Premium Bot", content: "$10" },
    { header: "Basic Bot", content: "Free" }
]);
```
</details>

<br>



### 🔒 Privacy
<details>
<summary><strong>🖼️ Change Profile User or Group</strong></summary>

```javascript
// Change
await conn.updateProfilePicture(jid, { url: 'https://example.com/image.jpg' })
```

```javascript
// Remove
await conn.removeProfilePicture(jid)
```
</details>

<details>
<summary><strong>🚫 Block/Unblock User</strong></summary>

```javascript
// Block
await conn.updateBlockStatus(jid, 'block');
```

```javascript
// Unblock
await conn.updateBlockStatus(jid, 'unblock');
```
</details>

<details>
<summary><strong>👤 Metadata Privacy</strong></summary>

```javascript
const privacySettings = await conn.fetchPrivacySettings(true)
console.log('privacy settings: ' + privacySettings)
```
</details>

<details>
<summary><strong>⛔ Metadata Blocklist</strong></summary>

```javascript
const response = await conn.fetchBlocklist()
console.log(response)
```
</details>

<details>
<summary><strong>👀 Last Seen</strong></summary>

```javascript
// Everyone
await conn.updateLastSeenPrivacy("all")
```

```javascript
// Contacts
await conn.updateLastSeenPrivacy("contacts")
```

```javascript
// Contacts Blacklist
await conn.updateLastSeenPrivacy("contact_blacklist")
```

```javascript
// Hide
await conn.updateLastSeenPrivacy("none")
```
</details>

<details>
<summary><strong>👀 Online Status</strong></summary>

```javascript
// Everyone
await conn.updateOnlinePrivacy("all")
```

```javascript
// Match last seen
await conn.updateOnlinePrivacy("match_last_seen")
```
</details>

<details>
<summary><strong>🖼️ Profile Picture</strong></summary>

```javascript
// Everyone
await conn.updateProfilePicturePrivacy("all")
```

```javascript
// Contacts
await conn.updateProfilePicturePrivacy("contacts")
```

```javascript
// Contacts Blacklist
await conn.updateProfilePicturePrivacy("contact_blacklist")
```

```javascript
// Hide
await conn.updateProfilePicturePrivacy("none")
```
</details>

<details>
<summary><strong>✨ Status WhatsApp</strong></summary>

```javascript
// Everyone
await conn.updateStatusPrivacy("all")
```

```javascript
// Contacts
await conn.updateStatusPrivacy("contacts")
```

```javascript
// Contacts Blacklist
await conn.updateStatusPrivacy("contact_blacklist")
```

```javascript
// Hide
await conn.updateStatusPrivacy("none")
```
</details>

<details>
<summary><strong>👁️ Blue Tiks Read</strong></summary>

```javascript
// Show
await conn.updateReadReceiptsPrivacy("all")
```

```javascript
// Hide
await conn.updateReadReceiptsPrivacy("none")
```
</details>

<details>
<summary><strong>👥 Group Add</strong></summary>

```javascript
// Everyone
await conn.updateGroupsAddPrivacy("all")
```

```javascript
// Contacts
await conn.updateGroupsAddPrivacy("contacts")
```

```javascript
// Contacts Blacklist
await conn.updateGroupsAddPrivacy("contact_blacklist")
```
</details>

<details>
<summary><strong>🕑 Default Disappearing Mode</strong></summary>

| Time  | Seconds        |
|-------|----------------|
| Remove | 0          |
| 24h    | 86.400     |
| 7d     | 604.800    |
| 90d    | 7.776.000  |

```javascript
await conn.updateDefaultDisappearingMode(86400)
```
</details>

<br>

### ⚙️ Advanced
<details>
<summary><strong>🔧 Debug Logs</strong></summary>

```javascript
const conn = makeWASocket({ logger: { level: 'debug' } });
```
</details>

<details>
<summary><strong>📡 Raw WebSocket Events</strong></summary>

```javascript
conn.ws.on('CB:presence', (json) => console.log('Sockets update:', json));

// for any message with tag 'edge_routing'
conn.ws.on('CB:edge_routing', (node) => console.log('Sockets update:', node));

// for any message with tag 'edge_routing' and id attribute = abcd
conn.ws.on('CB:edge_routing,id:abcd', (node) => console.log('Sockets update:', node));

// for any message with tag 'edge_routing', id attribute = abcd & first content node routing_info
conn.ws.on('CB:edge_routing,id:abcd,routing_info', (node) => console.log('Sockets update:', node));
```
</details>

### ⚡ Deep Protocol & Advanced Operations (Secret Fitur)
Fitur tingkat rendah (Low-Level) yang diekstrak langsung dari protokol terbaru WhatsApp.

#### 🛠️ Manual Message Resend
Minta WhatsApp kirim ulang pesan tertentu. Ampuh untuk fix error **"Menunggu pesan ini"**.
```javascript
// Meminta kirim ulang pesan 'm'
await conn.requestResend(m.key);
```

#### 📊 Poll V5 (Support Gambar)
Versi terbaru polling yang mendukung gambar di setiap pilihannya.
```javascript
await conn.sendPollV5(jid, {
    name: "Siapa Waifu Terbaik?",
    options: [
        { name: "Shiroko", image: fs.readFileSync("./shiroko.jpg") },
        { name: "Hoshino", image: fs.readFileSync("./hoshino.jpg") }
    ],
    selectableCount: 1
});
```

#### 📞 Native Call History Logs
Kirim bubble "Riwayat Panggilan" native (seperti manusia asli).
```javascript
await conn.sendCallLog(jid, {
    isVideo: false,
    duration: 120,
    outcome: 0 // 0: CONNECTED, 1: MISSED, 2: FAILED, 3: REJECTED
});
```

#### 📂 Massive Chat Bundle
Protokol native untuk mentransfer atau ekspor riwayat chat dalam jumlah besar.
```javascript
await conn.sendChatBundle(jid, {
    fileSha256: bufferSha,
    mediaKey: bufferKey,
    messageCount: 1000
});
```

#### 🛡️ Encrypted Reactions
Mengirim reaksi pesan di chat dengan tingkat enkripsi tinggi (Komunitas/Privasi).
```javascript
await conn.sendEncReaction(jid, "❤️", targetKey, { payload: encPayload, iv: encIv });
```

<br>

## ⚠️ Disclaimer
This project is **not affiliated** with WhatsApp/Meta. Use at your own risk.  
Refer to [WhatsApp's Terms](https://www.whatsapp.com/legal) for compliance.

<br>

### 🔗 Full Documentation
Explore all features in the **[Baileys GitHub Wiki](https://github.com/whiskeysockets/baileys/wiki)**