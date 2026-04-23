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

## 🔥 Updated New (20 April 2026)
- 🛡️ **Anti Bad Session**: Atomic writes & auto-backup for `creds.json`.
- 🔁 **Smart Session Manager**: Multi-session support with exponential backoff.
- 🥷 **Stealth Mode**: Humanized interaction (typing delay & random presence).
- ⏳ **Smart Message Queue**: Auto-retry failed messages when back online.
- 🚀 **Fast-Response Middleware**: Parallel message processing (Express-style).
- 🖼️ **Integrated Media Engine**: Instant `downloadMedia` with LRU Cache.
- 🛠️ **Simplified API**: `patchSocket` with easy group & newsletter aliases.
- 📊 **Rich Proto Helpers**: Native Table, Carousel, Shop, and Buttons helpers.
- ✨ **Full Rebranding**: Now officially `@freezeehost/baileys`.

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
<details>
<summary><strong>💻 Show 📥 Installation Code</strong></summary>

```bash
npm install @freezeehost/baileys
# or
yarn add @freezeehost/baileys
```
</details>

<br>

## 🚀 Quick Start
<details>
<summary><strong>💻 Show 🚀 Quick Start Code</strong></summary>

```javascript
const {
  default: makeFreeZeeSocket,
  useMultiFileAuthState,
} = require('@freezeehost/baileys');

const {
  state,
  saveCreds
} = await useMultiFileAuthState("./path/to/sessions/folder")

/*
 * const FreeZeeHost = makeFreeZeeSocket({ printQRInTerminal: true });
 * code to get WhatsApp web connection
 * QR code or pairing code type available
 */

FreeZeeHost.ev.on('messages.upsert', ({ messages }) => {
  console.log('New message:', messages[0].message);
});
```
</details>

<br>

### 🛠️ Advanced Patcher (Simplified API)
The easiest way to supercharge your socket with all the new features.

<details>
<summary><strong>💻 Show 🛠️ Advanced Patcher (Simplified API) Code</strong></summary>

```javascript
const { patchSocket } = require('@freezeehost/baileys');
const sock = patchSocket(makeFreeZeeSocket({ auth: state }));

// --- NEW SIMPLIFIED FUNCTIONS ---

// 1. Group Management
await sock.groupAdd(jid, ["123@s.whatsapp.net"]);
await sock.groupRemove(jid, ["123@s.whatsapp.net"]);
await sock.groupPromote(jid, ["123@s.whatsapp.net"]);
await sock.groupDemote(jid, ["123@s.whatsapp.net"]);

// 1b. Group Editing (New!)
await sock.groupEditSubject(jid, "New Subject");
await sock.groupEditDescription(jid, "New Description");
await sock.groupEditSetting(jid, 'announcement'); // Only admins can send messages
await sock.groupEditSetting(jid, 'not_announcement'); // All participants can send messages

// 1c. Message Editing (New!)
await sock.editMessage(jid, m.key, "This message has been edited!");

// 2. Newsletter (Channel)
const metadata = await sock.getNewsletter("https://whatsapp.com/channel/xxx");

// 4. Automated Features
sock.autoRead(); // Automatically mark all incoming messages as read

// 5. Command Router (New!)
// The easiest way to build your bot commands
sock.onCommand('.ping', async (m, args) => {
   await m.reply('Pong! Bot is active.');
});

sock.onCommand(/^\!(help|menu)$/, async (m, args) => {
   await m.reply('Here is your help menu...');
});

// --- CLOUD SESSIONS (Auto-Connect) ---
// Just call it! No config needed, Plug and Play!
const { useMongoFileAuthState, patchSocket, makeFreeZeeSocket } = require('@freezeehost/baileys');

async function start() {
  const { state, saveCreds } = await useMongoFileAuthState(); // Automatically connects to FreeZeeHost DB
  const sock = patchSocket(makeFreeZeeSocket({ auth: state }));
  sock.ev.on('creds.update', saveCreds);
}

await sock.sendMessage(jid, sock.msg.text("Hello"));
await sock.sendMessage(jid, sock.msg.poll("Favorite Color?", ["Red", "Blue"]));

// --- RICH MESSAGES (Interactive) ---
// Buttons
await sock.sendMessage(jid, sock.msg.buttons("Choose one:", [
  { id: 'id1', text: 'Button 1' },
  { id: 'id2', text: 'Button 2' }
], "Footer text", "Header text"));

// Lists
await sock.sendMessage(jid, sock.msg.list("Description", "Click Here", [
  {
    title: "Section 1",
    rows: [{ title: "Option 1", id: "1", description: "Desc 1" }]
  }
], "Title"));

// Native Flow (Modern Interactive)
await sock.sendMessage(jid, sock.msg.interactive("Body content", [
  { name: "quick_reply", params: { display_text: "Yes", id: "yes" } },
  { name: "cta_url", params: { display_text: "Open Web", url: "https://google.com" } }
], "Header", "Footer"));

// --- TABLES (Exclusive) ---
await sock.sendMessage(jid, sock.msg.table(
  ['No', 'Product', 'Price'], // Headers
  [
    ['1', 'Node.js', 'Free'],
    ['2', 'WhatsApp', 'Free'],
    ['3', 'Coffee', '$5']
  ] // Rows
));

// 5. Album & Media
await sock.sendAlbumMessage(jid, [
  sock.msg.image({ url: '...' }, 'Caption 1'),
  sock.msg.video({ url: '...' }, 'Caption 2')
]);

// 6. Sticker Pack (New!)
await sock.sendStickerPack(jid, [
  'https://example.com/stiker1.webp',
  'https://example.com/stiker2.webp',
  fs.readFileSync('./stiker3.webp')
], { packname: 'FreeZeeHost', author: 'Bot' });

// 6. Stealth & Security
// Automatically active after patchSocket()
```
</details>
<details>
<summary><strong>🔗 Connect with QR Code</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const FreeZeeHost = makeFreeZeeSocket({
  printQRInTerminal: true, // true to display QR Code
  auth: state
})
```
</details>
</details>

<details>
<summary><strong>🔢 Connect with Pairing Code</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const FreeZeeHost = makeFreeZeeSocket({
  printQRInTerminal: false, // false so that the pairing code is not disturbed
  auth: state
})

if (!FreeZeeHost.authState.creds.registered) {
  const number = "62xxxx"

  // use default pairing code (default 1-8)
  const code = await FreeZeeHost.requestPairingCode(number)

  // use customer code pairing (8 digit)
  const customCode = "ABCD4321"
  const code = await FreeZeeHost.requestPairingCode(number, customCode)
  console.log(code)
}
```
</details>
</details>

<br>

### 📡 Handling Events
<details>
<summary><strong>📌 Example to Start</strong></summary>

<details>
<summary><strong>💻 Show 📡 Handling Events Code</strong></summary>

```javascript
FreeZeeHost.ev.on('messages.upsert', ({ messages }) => {
  console.log('New message:', messages[0].message);
});
```
</details>
</details>

<details>
<summary><strong>🗳️ Decrypt Poll Votes</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
FreeZeeHost.ev.on('messages.update', (m) => {
  if (m.pollUpdates) console.log('Poll vote:', m.pollUpdates);
});
```
</details>
</details>

<br>

### 📨 Sending Messages

<details>
<summary><strong>💻 Show 📨 Sending Messages Code</strong></summary>

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
FreeZeeHost.sendMessage(jid, content, options)
```
</details>

<details>
<summary><strong>📝 Text Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Simple Text
await FreeZeeHost.sendMessage(jid, { text: 'Hello!' });
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Text with link preview
await FreeZeeHost.sendMessage(jid, {
  text: 'Visit https://example.com',
  linkPreview: {
    'canonical-url': 'https://example.com',
    title: 'Example Domain',
    description: 'A demo website',
    jpegThumbnail: fs.readFileSync('preview.jpg')
  }
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// With Quoted Reply
await FreeZeeHost.sendMessage(jid, { text: 'Hello Shiroko!' }, { quoted: message });
```
</details>
</details>


<details>
<summary><strong>🖼️ Image Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// With local file buffer
await FreeZeeHost.sendMessage(jid, { 
  image: fs.readFileSync('shiroko.jpg'),
  caption: 'My wife!',
  mentions: ['1234567890@s.whatsapp.net'] // Tag users
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// With URL
await FreeZeeHost.sendMessage(jid, { 
  image: { url: 'https://example.com/shiroko.jpg' },
  caption: 'Emh ayang nya zass'
});
```
</details>
</details>

<details>
<summary><strong>🎥 Video Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// With Local File
await FreeZeeHost.sendMessage(jid, { 
  video: fs.readFileSync('video.mp4'),
  caption: 'Funny clip!'
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// With URL File
await FreeZeeHost.sendMessage(jid, { 
  video: { url: 'https://example.com/video.mp4' },
  caption: 'Streamed video'
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// View Once Message
await FreeZeeHost.sendMessage(jid, {
  video: fs.readFileSync('secret.mp4'),
  viewOnce: true // Disappears after viewing
});
```
</details>
</details>

<details>
<summary><strong>🎵 Audio/PTT Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Regular audio
await FreeZeeHost.sendMessage(jid, { 
  audio: fs.readFileSync('audio.mp3'),
  ptt: false // For music
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Push-to-talk (PTT)
await FreeZeeHost.sendMessage(jid, { 
  audio: fs.readFileSync('voice.ogg'),
  ptt: true, // WhatsApp voice note
  waveform: [0, 1, 0, 1, 0] // Optional waveform
});
```
</details>
</details>

<details>
<summary><strong>👤 Contact Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
  + 'VERSION:3.0\n' 
  + 'FN:Jeff Singh\n' // full name
  + 'ORG:Ashoka Uni\n' // the organization of the contact
  + 'TELtype=CELLtype=VOICEwaid=911234567890:+91 12345 67890\n' // WhatsApp ID + phone number
  + 'END:VCARD'

await FreeZeeHost.sendMessage(jid, { 
  contacts: { 
    displayName: 'Your Name', 
    contacts: [{ vcard }] 
  }
})
```
</details>
</details>

<details>
<summary><strong>🔥 Sticker Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Simple send sticker 
await FreeZeeHost.sendSticker(jid, { 
   sticker: './your/path', //user path
   packname: "your packname", 
   author: "your author" 
  }
);
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Simple send sticker 
await FreeZeeHost.sendSticker(jid, { 
   sticker: { url : "https://your.url.com/image.webp" }, //user url
   packname: "your packname", 
   author: "your author" 
  }
);
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Simple send sticker 
await FreeZeeHost.sendSticker(jid, { 
   sticker: fs.readFileSync('sticker.webp'), //use buffer
   packname: "your packname", 
   author: "your author" 
  }
);
```
</details>
</details>

<details>
<summary><strong>💥 React Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
  react: {
    text: '👍', // use an empty string to remove the reaction
    key: message.key
  }
})
```
</details>
</details>

<details>
<summary><strong>📌 Pin & Keep Message</strong></summary>

| Time  | Seconds        |
|-------|----------------|
| 24h    | 86.400        |
| 7d     | 604.800       |
| 30d    | 2.592.000     |

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Pin Message
await FreeZeeHost.sendMessage(jid, {
  pin: {
    type: 1, // 2 to remove
    time: 86400,
    key: message.key
  }
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Keep message
await FreeZeeHost.sendMessage(jid, {
  keep: {
    key: message.key,
    type: 1 // or 2 to remove
  }
})
```
</details>
</details>

<details>
<summary><strong>📍 Location Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Static location
await FreeZeeHost.sendMessage(jid, {
  location: {
    degreesLatitude: 37.422,
    degreesLongitude: -122.084,
    name: 'Google HQ'
  }
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Thumbnail location
await FreeZeeHost.sendMessage(jid, {
  location: {
    degreesLatitude: 37.422,
    degreesLongitude: -122.084,
    name: 'Google HQ',
    jpegThumbnail: fs.readFileSync('preview.jpg')
  }
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Live location (updates in real-time)
await FreeZeeHost.sendMessage(jid, {
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
</details>

<details>
<summary><strong>📞 Call Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
  call: {
    name: 'Here is call message',
    type: 1 // 2 for video
  }
})
```
</details>
</details>

<details>
<summary><strong>🗓️ Event Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
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
</details>

<details>
<summary><strong>🛒 Order Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
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
</details>

<details>
<summary><strong>📊 Poll Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Create a poll
await FreeZeeHost.sendMessage(jid, {
  poll: {
    name: 'Favorite color?',
    values: ['Red', 'Blue', 'Green'],
    selectableCount: 1 // Single-choice
  }
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Poll results (snapshot)
await FreeZeeHost.sendMessage(jid, {
  pollResult: {
    name: 'Favorite color?',
    values: [['Red', 10], ['Blue', 20]] // [option, votes]
  }
});
```
</details>
</details>

<details>
<summary><strong>🛍️ Product Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
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
</details>


<details>
<summary><strong>💳 Payment Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
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
</details>


<details>
<summary><strong>📜 Payment Invite Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, { 
  paymentInvite: {
    type: 1, // 1 || 2 || 3
    expiry: 0 
  }   
})
```
</details>
</details>


<details>
<summary><strong>👤 Channel Admin Invite</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
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
</details>


<details>
<summary><strong>👥 Group Invite Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
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
</details>

<details>
<summary><strong>🔢 Phone Number Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Request phone number
await FreeZeeHost.sendMessage(jid, {
  requestPhoneNumber: {}
})
```
</details>
<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Share phone number
await FreeZeeHost.sendMessage(jid, {
  sharePhoneNumber: {}
})
```
</details>
</details>

<details>
<summary><strong>↪️  Reply Button Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Reply List Message
await FreeZeeHost.sendMessage(jid, {
  buttonReply: {
    name: 'Hii',
    description: 'description', 
    rowId: 'ID'
  }, 
  type: 'list'
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Reply Button Message
await FreeZeeHost.sendMessage(jid, {
  buttonReply: {
    displayText: 'Hii', 
    id: 'ID'
  }, 
  type: 'plain'
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Reply Template Message
await FreeZeeHost.sendMessage(jid, {
  buttonReply: {
    displayText: 'Hii',
    id: 'ID',
    index: 1 // number id button reply
  }, 
  type: 'template'
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Reply Interactive Message
await FreeZeeHost.sendMessage(jid, {
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
</details>

<details>
<summary><strong>#️⃣ Status Mentions Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendStatusMentions({
  image: {
    url: 'https://example.com/image.jpg'
  }, 
  caption: 'Nice day!'
}, ["123@s.whatsapp.net", "123@s.whatsapp.net"])
```
</details>
</details>

<details>
<summary><strong>📸 Album Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendAlbumMessage(jid,
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Text
await FreeZeeHost.sendMessage(jid, {      
  text: 'Here is body message',
  title: 'Here is title', 
  subtitle: 'Here is subtitle', 
  footer: '© WhatsApp Baileys',
  viewOnce: true,
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Image
await FreeZeeHost.sendMessage(jid, { 
  image: {
    url: 'https://www.example.com/image.jpg'
  },    
  caption: 'Here is body message',
  title: 'Here is title', 
  subtitle: 'Here is subtitle', 
  footer: '© WhatsApp Baileys',
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }, 
  hasMediaAttachment: true, // or false
  viewOnce: true
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Video
await FreeZeeHost.sendMessage(jid, { 
  video: {
    url: 'https://www.example.com/video.mp4'
  },    
  caption: 'Here is body message',
  title: 'Here is title', 
  subtitle: 'Here is subtitle', 
  footer: '© WhatsApp Baileys',
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }, 
  hasMediaAttachment: true, // or false
  viewOnce: true
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Document
await FreeZeeHost.sendMessage(jid, {
  document: { 
    url: 'https://www.example.com/document.pdf' 
  }, 
  mimetype: 'application/pdf', 
  jpegThumbnail: await FreeZeeHost.resize('https://www.example.com/thumbnail.jpg', 320, 320), 
  caption: 'Here is body message',
  title: 'Here is title',
  subtitle: 'Here is subtitle', 
  footer: '© WhatsApp Baileys',
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }, 
  hasMediaAttachment: false, // or true, 
  viewOnce: true
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Location
await FreeZeeHost.sendMessage(jid, { 
  location: {
    degressLatitude: -0, 
    degressLongitude: 0,
    name: 'Example Location'
  },    
  caption: 'Here is body message',
  title: 'Here is title', 
  subtitle: 'Here is subtitle', 
  footer: '© WhatsApp Baileys',
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
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Product
await FreeZeeHost.sendMessage(jid, {
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
  footer: '© WhatsApp Baileys',
  shop: {
    surface: 1, // 2 | 3 | 4
    id: 'facebook_store_name'
  }, 
  hasMediaAttachment: false, // or true
  viewOnce: true
})
```
</details>
</details>

<details>
<summary><strong>Carosell Message</strong></summary>

<div align="center">
  <img src="https://files.catbox.moe/cf3hxd.png" alt="Example Carosell Message" width="450"/>
  <p>Preview the carosel message display, a scrollable message card that displays various items.</td>
</div>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
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
</details>

<details>
<summary><strong>Native Flow Message</strong></summary>

> Native flow messages are used to display various types of button messages, even for flow dialogs. These buttons are easy to use and are often able to accommodate many parameters.

<details>
<summary><strong>header_type</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers text
await FreeZeeHost.sendMessage(jid, {
  text: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© WhatsApp Baileys',
  interactive: native_flow_button
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers image
await FreeZeeHost.sendMessage(jid, {
  image: { url: 'https://www.example.com/image.jpg' },
  caption: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© WhatsApp Baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Video
await FreeZeeHost.sendMessage(jid, {
  video: { url: 'https://www.example.com/video.mp4' },
  caption: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© WhatsApp Baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Document
await FreeZeeHost.sendMessage(jid, {
  document: { url: 'https://www.example.com/document.pdf' },
  jpegThumbnail: fs.readFileSync('preview.jpg'),
  mimetype: 'application/pdf',
  caption: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© WhatsApp Baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Location
await FreeZeeHost.sendMessage(jid, {
  location: { 
    degressLatitude: -0,
    degressLongitude: 0,
    name: 'Here is name location'
  },
  caption: 'This is body message!',
  title: 'This is title',
  subtitle: 'This is subtitle',
  footer: '© WhatsApp Baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Headers Product
await FreeZeeHost.sendMessage(jid, {
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
  footer: '© WhatsApp Baileys',
  hasMediaAttachment: true,
  interactive: native_flow_button
})
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'quick_reply',
  buttonParamsJson: JSON.stringify({
    display_text: 'Quick Reply',
    id: '123'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

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
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'cta_copy',
  buttonParamsJson: JSON.stringify({
    display_text: 'Action Copy',
    copy_code: '12345678'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'cta_call',
  buttonParamsJson: JSON.stringify({
    display_text: 'Action Call',
    phone_number: '628xxx'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'cta_catalog',
  buttonParamsJson: JSON.stringify({
    business_phone_number: '628xxx'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'cta_reminder',
  buttonParamsJson: JSON.stringify({
    display_text: 'Action Reminder'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'cta_cancel_reminder',
  buttonParamsJson: JSON.stringify({
    display_text: 'Action Unreminder'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'address_message',
  buttonParamsJson: JSON.stringify({
    display_text: 'Form Location'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'send_location',
  buttonParamsJson: JSON.stringify({
    display_text: 'Send Location'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

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
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'mpm',
  buttonParamsJson: JSON.stringify({
    product_id: '23942543532047956'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'wa_payment_transaction_details',
  buttonParamsJson: JSON.stringify({
    transaction_id: '12345848'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const native_flow_button = [{
  name: 'automated_greeting_message_view_catalog',
  buttonParamsJson: JSON.stringify({
    business_phone_number: '628xxx',
    catalog_product_id: '23942543532047956'
  })
}]
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

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
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

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
</details>

<details>
<summary><strong>🛍️ Product Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.sendMessage(jid, {
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
</details>

<details>
<summary><strong>🎭 Buttons Messages</strong></summary>

<br>

> This message button may not work if WhatsApp prohibits the free and open use of the message button. Use a WhatsApp partner if you still want to use the message button.

<details>
<summary><strong>header_type</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Button Headers Text
await FreeZeeHost.sendMessage(jid, {
  text: 'Choose an option:',
  buttons: button_params,
  footer: '© WhatsApp Baileys'
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Button Headers Image
await FreeZeeHost.sendMessage(jid, {
  image: fs.readFileSync('image.jpg'),
  caption: 'Choose an option:',
  buttons: button_params,
  footer: '© WhatsApp Baileys'
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Button Headers Video
await FreeZeeHost.sendMessage(jid, {
  video: fs.readFileSync('video.mp4'),
  caption: 'Choose an option:',
  buttons: button_params,
  footer: '© WhatsApp Baileys'
});
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Button Headers Location
await FreeZeeHost.sendMessage(jid, {
  location: {
    degreesLatitude: 37.422,
    degreesLongitude: -122.084
  },
  caption: 'Choose an option:',
  buttons: button_params,
  footer: '© WhatsApp Baileys'
});
```
</details>
</details>

<details>
<summary><strong>button_params</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

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
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

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
</details>

<details>
<summary><strong>🎭 List Messages </strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Single Select
await FreeZeeHost.sendMessage(jid, {
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
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Product List
await FreeZeeHost.sendMessage(jid, {
  title: 'Here is title product',
  text: 'Text message',
  footer: '© WhatsApp Baileys',
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
</details>

<br>

### 📣 Newsletter
<details>
<summary><strong>📋 Newsletter Metadata</strong></summary>

<details>
<summary><strong>💻 Show 📣 Newsletter Code</strong></summary>

```javascript
// code can't have "https://whatsapp.com/channel/", only code
const newsletter = await FreeZeeHost.newsletterMetadata("invite", "0029Vb6w7eO9sBIEUYRgeC30")
console.log("Newsletter metadata:", newsletter)
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// from jid newsletter
const newsletter = await FreeZeeHost.newsletterMetadata("jid", "120363421570647022@newsletter")
console.log("Newsletter metadata:", newsletter)
```
</details>
</details>

<details>
<summary><strong>👥 Newsletter Follow</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.newsletterFollow("120363421570647022@newsletter")
```
</details>
</details>

<details>
<summary><strong>👥 Newsletter Unfollow</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.newsletterUnfollow("120363421570647022@newsletter")
```
</details>
</details>

<details>
<summary><strong>🔈 Newsletter Mute</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.newsletterMute("120363421570647022@newsletter")
```
</details>
</details>

<details>
<summary><strong>🔊 Newsletter Unmute</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.newsletterUnmute("120363421570647022@newsletter")
```
</details>
</details>

<details>
<summary><strong>❤️ Newsletter Reaction Mode</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Allow all emoji
await FreeZeeHost.newsletterReactionMode("120363421570647022@newsletter", "ALL")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Allow special emoji (👍, ❤️, 😯, 😢, 🙏)
await FreeZeeHost.newsletterReactionMode("120363421570647022@newsletter", "BASIC")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// No reaction allowed
await FreeZeeHost.newsletterReactionMode("120363421570647022@newsletter", "NONE")
```
</details>
</details>

<details>
<summary><strong>📋 Update Description</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.newsletterUpdateDescription("120363421570647022@newsletter", "News description here!")
```
</details>
</details>

<details>
<summary><strong>👤 Update Name Newsletter</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.newsletterUpdateName("120363421570647022@newsletter", "New newsletter name!")
```
</details>
</details>

<details>
<summary><strong>🖼️ Change Profile Newsletter</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Change
await FreeZeeHost.newsletterUpdatePicture("120363421570647022@newsletter", { url: 'https://example.com/image.jpg' })
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Remove
await FreeZeeHost.newsletterRemovePicture("120363421570647022@newsletter")
```
</details>
</details>

<details>
<summary><strong>📣 Newsletter Create</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const newsletter = await FreeZeeHost.newsletterCreate("Here is name newsletter!", "Here is description!", { url: 'https://example.com/image.jpg' })
console.log("Here is data new created newsletter:", newsletter)
```
</details>
</details>

<details>
<summary><strong>🔥 List Newsletter Join</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const list_newsletter = await FreeZeeHost.newsletterFetchAllParticipating()
console.log("Your list newsletter join:", list_newsletter)
```
</details>
</details>

<details>
<summary><strong>😎 Newsletter Change Owner</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.newsletterChangeOwner("120363421570647022@newsletter", "123@lid")
```
</details>
</details>

<details>
<summary><strong>😂 Newsletter Demote</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.newsletterDemote("120363421570647022@newsletter", "123@lid")
```
</details>
</details>

<details>
<summary><strong>🌟 Newsletter Reaction Message</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.newsletterReactMessage("120363421570647022@newsletter", "12", "🦖")
```
</details>
</details>

<br>

### 🛠️ Groups
<details>
<summary><strong>🔄 Create Group</strong></summary>

<details>
<summary><strong>💻 Show 🛠️ Groups Code</strong></summary>

```javascript
const group = await FreeZeeHost.groupCreate("New Group Title", ["123@s.whatsapp.net", "456@s.whatsapp.net"]);
console.log("New group create data:", group)
```
</details>
</details>

<details>
<summary><strong>⚙️ Change Group Settings</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// only allow admins to send messages
await FreeZeeHost.groupSettingUpdate(jid, 'announcement')
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// allow everyone to send messages
await FreeZeeHost.groupSettingUpdate(jid, 'not_announcement')
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// allow everyone to modify the group's settings -- like display picture etc.
await FreeZeeHost.groupSettingUpdate(jid, 'unlocked')
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// only allow admins to modify the group's settings
await FreeZeeHost.groupSettingUpdate(jid, 'locked')
```
</details>
</details>

<details>
<summary><strong>💯 Add, Remove, Promote, Demote</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// add member
await FreeZeeHost.groupParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'add')

// remove member
await FreeZeeHost.groupParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'remove')

// promote member (admins)
await FreeZeeHost.groupParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'promote')

// demote member (unadmins)
await FreeZeeHost.groupParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'demote')
```
</details>
</details>

<details>
<summary><strong>👥 Change Subject Title</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.groupUpdateSubject(jid, 'New Subject Title!')
```
</details>
</details>

<details>
<summary><strong>📋 Change Description</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.groupUpdateDescription(jid, 'New Description!')
```
</details>
</details>

<details>
<summary><strong>⛔ Leave Group</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.groupLeave(jid)
```
</details>
</details>

<details>
<summary><strong>🔗 Invite Code</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// to create link with code use "https://chat.whatsapp.com/" + code
const code = await FreeZeeHost.groupInviteCode(jid)
console.log('group code: ' + code)
```
</details>
</details>

<details>
<summary><strong>🔁 Revoke/Reset Invite Code</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const code = await FreeZeeHost.groupRevokeInvite(jid)
console.log('New group code: ' + code)
```
</details>
</details>

<details>
<summary><strong>🟢 Join By Invite Code</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// code can't have "https://chat.whatsapp.com/", only code
const response = await FreeZeeHost.groupAcceptInvite(code)
console.log('joined to: ' + response)
```
</details>
</details>

<details>
<summary><strong>📋 Group Metadata By Code</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const response = await FreeZeeHost.groupGetInviteInfo(code)
console.log('group information: ' + response)
```
</details>
</details>

<details>
<summary><strong>📋 Group Metadata</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const metadata = await FreeZeeHost.groupMetadata(jid) 
console.log(metadata.id + ', title: ' + metadata.subject + ', description: ' + metadata.desc)
```
</details>
</details>

<details>
<summary><strong>🟢 Join using `groupInviteMessage`</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const response = await FreeZeeHost.groupAcceptInviteV4(jid, groupInviteMessage)
console.log('joined to: ' + response)
```
</details>
</details>

<details>
<summary><strong>👥 Join Request List</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const response = await FreeZeeHost.groupRequestParticipantsList(jid)
console.log(response)
```
</details>
</details>

<details>
<summary><strong>👥 Join Approve/Reject</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Approve
const response = await FreeZeeHost.groupRequestParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'approve')
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Reject
const response = await FreeZeeHost.groupRequestParticipantsUpdate(jid, ['123@s.whatsapp.net', '456@s.whatsapp.net'], 'reject')
```
</details>
</details>

<details>
<summary><strong>👥 Group Member List</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const response = await FreeZeeHost.groupFetchAllParticipating()
console.log(response)
```
</details>
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

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.groupToggleEphemeral(jid, 86400)
```
</details>
</details>

<details>
<summary><strong>👥 Member Add Mode</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Everyone Member
await FreeZeeHost.groupMemberAddMode(jid, 'all_member_add')
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Only Admin
await FreeZeeHost.groupMemberAddMode(jid, 'admin_add')
```
</details>
</details>

<br>

### 🔒 Privacy
<details>
<summary><strong>🖼️ Change Profile User or Group</strong></summary>

<details>
<summary><strong>💻 Show 🔒 Privacy Code</strong></summary>

```javascript
// Change
await FreeZeeHost.updateProfilePicture(jid, { url: 'https://example.com/image.jpg' })
```
</details>

<details>
<summary><strong>💻 Show 🔒 Privacy Code</strong></summary>

```javascript
// Remove
await FreeZeeHost.removeProfilePicture(jid)
```
</details>
</details>

<details>
<summary><strong>🚫 Block/Unblock User</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Block
await FreeZeeHost.updateBlockStatus(jid, 'block');
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Unblock
await FreeZeeHost.updateBlockStatus(jid, 'unblock');
```
</details>
</details>

<details>
<summary><strong>👤 Metadata Privacy</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const privacySettings = await FreeZeeHost.fetchPrivacySettings(true)
console.log('privacy settings: ' + privacySettings)
```
</details>
</details>

<details>
<summary><strong>⛔ Metadata Blocklist</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
const response = await FreeZeeHost.fetchBlocklist()
console.log(response)
```
</details>
</details>

<details>
<summary><strong>👀 Last Seen</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Everyone
await FreeZeeHost.updateLastSeenPrivacy("all")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Contacts
await FreeZeeHost.updateLastSeenPrivacy("contacts")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Contacts Blacklist
await FreeZeeHost.updateLastSeenPrivacy("contact_blacklist")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Hide
await FreeZeeHost.updateLastSeenPrivacy("none")
```
</details>
</details>

<details>
<summary><strong>👀 Online Status</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Everyone
await FreeZeeHost.updateOnlinePrivacy("all")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Match last seen
await FreeZeeHost.updateOnlinePrivacy("match_last_seen")
```
</details>
</details>

<details>
<summary><strong>🖼️ Profile Picture</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Everyone
await FreeZeeHost.updateProfilePicturePrivacy("all")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Contacts
await FreeZeeHost.updateProfilePicturePrivacy("contacts")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Contacts Blacklist
await FreeZeeHost.updateProfilePicturePrivacy("contact_blacklist")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Hide
await FreeZeeHost.updateProfilePicturePrivacy("none")
```
</details>
</details>

<details>
<summary><strong>✨ Status WhatsApp</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Everyone
await FreeZeeHost.updateStatusPrivacy("all")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Contacts
await FreeZeeHost.updateStatusPrivacy("contacts")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Contacts Blacklist
await FreeZeeHost.updateStatusPrivacy("contact_blacklist")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Hide
await FreeZeeHost.updateStatusPrivacy("none")
```
</details>
</details>

<details>
<summary><strong>👁️ Blue Tiks Read</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Show
await FreeZeeHost.updateReadReceiptsPrivacy("all")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Hide
await FreeZeeHost.updateReadReceiptsPrivacy("none")
```
</details>
</details>

<details>
<summary><strong>👥 Group Add</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Everyone
await FreeZeeHost.updateGroupsAddPrivacy("all")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Contacts
await FreeZeeHost.updateGroupsAddPrivacy("contacts")
```
</details>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
// Contacts Blacklist
await FreeZeeHost.updateGroupsAddPrivacy("contact_blacklist")
```
</details>
</details>

<details>
<summary><strong>🕑 Default Disappearing Mode</strong></summary>

| Time  | Seconds        |
|-------|----------------|
| Remove | 0          |
| 24h    | 86.400     |
| 7d     | 604.800    |
| 90d    | 7.776.000  |

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
await FreeZeeHost.updateDefaultDisappearingMode(86400)
```
</details>
</details>

<br>

### ⚙️ Advanced
<details>
<summary><strong>🔧 Debug Logs</strong></summary>

<details>
<summary><strong>💻 Show ⚙️ Advanced Code</strong></summary>

```javascript
const FreeZeeHost = makeFreeZeeSocket({ logger: { level: 'debug' } });
```
</details>
</details>

<details>
<summary><strong>📡 Raw WebSocket Events</strong></summary>

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```javascript
FreeZeeHost.ws.on('CB:presence', (json) => console.log('Sockets update:', json));

// for any message with tag 'edge_routing'
FreeZeeHost.ws.on('CB:edge_routing', (node) => console.log('Sockets update:', node));

// for any message with tag 'edge_routing' and id attribute = abcd
FreeZeeHost.ws.on('CB:edge_routing,id:abcd', (node) => console.log('Sockets update:', node));

// for any message with tag 'edge_routing', id attribute = abcd & first content node routing_info
FreeZeeHost.ws.on('CB:edge_routing,id:abcd,routing_info', (node) => console.log('Sockets update:', node));
```
</details>
</details>

<br>

## ⚠️ Disclaimer
This project is **not affiliated** with WhatsApp/Meta. Use at your own risk.  
Refer to [WhatsApp's Terms](https://www.whatsapp.com/legal) for compliance.

<br>

### 🔗 Full Documentation

## 🔥 Premium Features (FreeZeeHost 2026 Edition)
- 🛡️ **Anti Bad Session**: Atomic writes & auto-repair system.
- 🔁 **Smart Session Manager**: Embedded MongoDB (Zero-Config Plug & Play).
- 🥷 **Stealth Mode**: Automated humanized typing/recording delays to prevent bans.
- ⏳ **Smart Anti-Spam Queue**: Randomized adaptive message delivery.
- 🚀 **Pre-Boot Loading UI**: Elegant visual initialization progress (0-100%).
- 📡 **Real-time Status Detector**: Instant WhatsApp Story/Status capture.
- ✨ **Full Dual-Format**: Support for ESM (`import`) and CJS (`require`).
- 🛠️ **Advanced Direct Helper**: `sock.msg` and `sock.sendAlbumMessage` built-in.

---

## 📡 Real-time Status Detector (Premium)
Fitur ini memungkinkan bot untuk mendeteksi setiap kali ada kontak yang mengunggah status WhatsApp (teks, foto, atau video) secara instan.

<details>
<summary><strong>💻 Show Status Detector Code</strong></summary>

```javascript
// Setiap kali ada status baru masuk
sock.onStatusUpdate(async (m) => {
    console.log("Ada status baru dari:", m.statusData.sender)
    console.log("Tipe status:", m.statusData.type) // imageMessage, videoMessage, dll
    console.log("Caption:", m.statusData.caption)
    
    // CONTOH: Mengirim ulang status kontak ke nomor kita sendiri (Fitur GetSW)
    await sock.sendMessage(sock.user.id, { forward: m })
})
```
</details>

---


---

<h1 align='center'><img alt="Baileys logo" src="https://raw.githubusercontent.com/WhiskeySockets/Baileys/refs/heads/master/Media/logo.png" height="75"/></h1>

<div align='center'>Baileys is a WebSockets-based TypeScript library for interacting with the WhatsApp Web API.</div>


> [!CAUTION]
> NOTICE OF BREAKING CHANGE.
>
> As of 7.0.0, multiple breaking changes were introduced into the library.
>
> Please check out https://whiskey.so/migrate-latest for more information.

# Important Note
This is a temporary README.md, the new guide is in development and will this file will be replaced with .github/README.md (already a default on GitHub).

New guide link: https://baileys.wiki

# Sponsor
If you'd like to financially support this project, you can do so by supporting the current maintainer [here](https://purpshell.dev/sponsor).

# Disclaimer
This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates.
The official WhatsApp website can be found at whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.

The maintainers of Baileys do not in any way condone the use of this application in practices that violate the Terms of Service of WhatsApp. The maintainers of this application call upon the personal responsibility of its users to use this application in a fair way, as it is intended to be used.
Use at your own discretion. Do not spam people with this. We discourage any stalkerware, bulk or automated messaging usage.

##

- Baileys does not require Selenium or any other browser to be interface with WhatsApp Web, it does so directly using a **WebSocket**.
- Not running Selenium or Chromium saves you like **half a gig** of ram :/
- Baileys supports interacting with the multi-device & web versions of WhatsApp.
- Thank you to [@pokearaujo](https://github.com/pokearaujo/multidevice) for writing his observations on the workings of WhatsApp Multi-Device. Also, thank you to [@Sigalor](https://github.com/sigalor/whatsapp-web-reveng) for writing his observations on the workings of WhatsApp Web and thanks to [@Rhymen](https://github.com/Rhymen/go-whatsapp/) for the __go__ implementation.

> [!IMPORTANT]
> The original repository had to be removed by the original author - we now continue development in this repository here.
This is the only official repository and is maintained by the community.
> **Join the Discord [here](https://discord.gg/WeJM5FP9GG)**

## Example

Do check out & run [example.ts](Example/example.ts) to see an example usage of the library.
The script covers most common use cases.
To run the example script, download or clone the repo and then type the following in a terminal:
1. ``` cd path/to/Baileys ```
2. ``` yarn ```
3. ``` yarn example ```

## Install

Use the stable version:
<details>
<summary><strong>💻 Show Install Code</strong></summary>

```
yarn add @freezeehost/baileys
```
</details>

Use the edge version (no guarantee of stability, but latest fixes + features)
<details>
<summary><strong>💻 Show Install Code</strong></summary>

```
yarn add github:WhiskeySockets/Baileys
```
</details>

Then import your code using:
<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```ts
import makeFreeZeeSocket from '@freezeehost/baileys'
```
</details>

# Links

- [Discord](https://discord.gg/WeJM5FP9GG)
- [Docs](https://guide.whiskeysockets.io/)

# Index

- [Connecting Account](#connecting-account)
    - [Connect with QR-CODE](#starting-socket-with-qr-code)
    - [Connect with Pairing Code](#starting-socket-with-pairing-code)
    - [Receive Full History](#receive-full-history)
- [Important Notes About Socket Config](#important-notes-about-socket-config)
    - [Caching Group Metadata (Recommended)](#caching-group-metadata-recommended)
    - [Improve Retry System & Decrypt Poll Votes](#improve-retry-system--decrypt-poll-votes)
    - [Receive Notifications in Whatsapp App](#receive-notifications-in-whatsapp-app)

- [Save Auth Info](#saving--restoring-sessions)
- [Handling Events](#handling-events)
    - [Example to Start](#example-to-start)
    - [Decrypt Poll Votes](#decrypt-poll-votes)
    - [Summary of Events on First Connection](#summary-of-events-on-first-connection)
- [Implementing a Data Store](#implementing-a-data-store)
- [Whatsapp IDs Explain](#whatsapp-ids-explain)
- [Utility Functions](#utility-functions)
- [Sending Messages](#sending-messages)
    - [Non-Media Messages](#non-media-messages)
        - [Text Message](#text-message)
        - [Quote Message](#quote-message-works-with-all-types)
        - [Mention User](#mention-user-works-with-most-types)
        - [Forward Messages](#forward-messages)
        - [Location Message](#location-message)
        - [Contact Message](#contact-message)
        - [Reaction Message](#reaction-message)
        - [Pin Message](#pin-message)
        - [Poll Message](#poll-message)
    - [Sending with Link Preview](#sending-messages-with-link-previews)
    - [Media Messages](#media-messages)
        - [Gif Message](#gif-message)
        - [Video Message](#video-message)
        - [Audio Message](#audio-message)
        - [Image Message](#image-message)
        - [ViewOnce Message](#view-once-message)
- [Modify Messages](#modify-messages)
    - [Delete Messages (for everyone)](#deleting-messages-for-everyone)
    - [Edit Messages](#editing-messages)
- [Manipulating Media Messages](#manipulating-media-messages)
    - [Thumbnail in Media Messages](#thumbnail-in-media-messages)
    - [Downloading Media Messages](#downloading-media-messages)
    - [Re-upload Media Message to Whatsapp](#re-upload-media-message-to-whatsapp)
- [Reject Call](#reject-call)
- [Send States in Chat](#send-states-in-chat)
    - [Reading Messages](#reading-messages)
    - [Update Presence](#update-presence)
- [Modifying Chats](#modifying-chats)
    - [Archive a Chat](#archive-a-chat)
    - [Mute/Unmute a Chat](#muteunmute-a-chat)
    - [Mark a Chat Read/Unread](#mark-a-chat-readunread)
    - [Delete a Message for Me](#delete-a-message-for-me)
    - [Delete a Chat](#delete-a-chat)
    - [Star/Unstar a Message](#starunstar-a-message)
    - [Disappearing Messages](#disappearing-messages)
- [User Querys](#user-querys)
    - [Check If ID Exists in Whatsapp](#check-if-id-exists-in-whatsapp)
    - [Query Chat History (groups too)](#query-chat-history-groups-too)
    - [Fetch Status](#fetch-status)
    - [Fetch Profile Picture (groups too)](#fetch-profile-picture-groups-too)
    - [Fetch Bussines Profile (such as description or category)](#fetch-bussines-profile-such-as-description-or-category)
    - [Fetch Someone's Presence (if they're typing or online)](#fetch-someones-presence-if-theyre-typing-or-online)
- [Change Profile](#change-profile)
    - [Change Profile Status](#change-profile-status)
    - [Change Profile Name](#change-profile-name)
    - [Change Display Picture (groups too)](#change-display-picture-groups-too)
    - [Remove display picture (groups too)](#remove-display-picture-groups-too)
- [Groups](#groups)
    - [Create a Group](#create-a-group)
    - [Add/Remove or Demote/Promote](#addremove-or-demotepromote)
    - [Change Subject (name)](#change-subject-name)
    - [Change Description](#change-description)
    - [Change Settings](#change-settings)
    - [Leave a Group](#leave-a-group)
    - [Get Invite Code](#get-invite-code)
    - [Revoke Invite Code](#revoke-invite-code)
    - [Join Using Invitation Code](#join-using-invitation-code)
    - [Get Group Info by Invite Code](#get-group-info-by-invite-code)
    - [Query Metadata (participants, name, description...)](#query-metadata-participants-name-description)
    - [Join using groupInviteMessage](#join-using-groupinvitemessage)
    - [Get Request Join List](#get-request-join-list)
    - [Approve/Reject Request Join](#approvereject-request-join)
    - [Get All Participating Groups Metadata](#get-all-participating-groups-metadata)
    - [Toggle Ephemeral](#toggle-ephemeral)
    - [Change Add Mode](#change-add-mode)
- [Privacy](#privacy)
    - [Block/Unblock User](#blockunblock-user)
    - [Get Privacy Settings](#get-privacy-settings)
    - [Get BlockList](#get-blocklist)
    - [Update LastSeen Privacy](#update-lastseen-privacy)
    - [Update Online Privacy](#update-online-privacy)
    - [Update Profile Picture Privacy](#update-profile-picture-privacy)
    - [Update Status Privacy](#update-status-privacy)
    - [Update Read Receipts Privacy](#update-read-receipts-privacy)
    - [Update Groups Add Privacy](#update-groups-add-privacy)
    - [Update Default Disappearing Mode](#update-default-disappearing-mode)
- [Broadcast Lists & Stories](#broadcast-lists--stories)
    - [Send Broadcast & Stories](#send-broadcast--stories)
    - [Query a Broadcast List's Recipients & Name](#query-a-broadcast-lists-recipients--name)
- [Writing Custom Functionality](#writing-custom-functionality)
    - [Enabling Debug Level in Baileys Logs](#enabling-debug-level-in-baileys-logs)
    - [How Whatsapp Communicate With Us](#how-whatsapp-communicate-with-us)
    - [Register a Callback for Websocket Events](#register-a-callback-for-websocket-events)

## Connecting Account

WhatsApp provides a multi-device API that allows Baileys to be authenticated as a second WhatsApp client by scanning a **QR code** or **Pairing Code** with WhatsApp on your phone.

> [!NOTE]
> **[Here](#example-to-start) is a simple example of event handling**

> [!TIP]
> **You can see all supported socket configs [here](https://baileys.whiskeysockets.io/types/SocketConfig.html) (Recommended)**

### Starting socket with **QR-CODE**

> [!TIP]
> You can customize browser name if you connect with **QR-CODE**, with `Browser` constant, we have some browsers config, **see [here](https://baileys.whiskeysockets.io/types/BrowsersMap.html)**

<details>
<summary><strong>💻 Show Starting socket with **QR-CODE** Code</strong></summary>

```ts
import makeFreeZeeSocket from '@freezeehost/baileys'

const sock = makeFreeZeeSocket({
    // can provide additional config here
    browser: Browsers.ubuntu('My App'),
    printQRInTerminal: true
})
```
</details>

If the connection is successful, you will see a QR code printed on your terminal screen, scan it with WhatsApp on your phone and you'll be logged in!

### Starting socket with **Pairing Code**


> [!IMPORTANT]
> Pairing Code isn't Mobile API, it's a method to connect Whatsapp Web without QR-CODE, you can connect only with one device, see [here](https://faq.whatsapp.com/1324084875126592/?cms_platform=web)

The phone number can't have `+` or `()` or `-`, only numbers, you must provide country code

<details>
<summary><strong>💻 Show Starting socket with **Pairing Code** Code</strong></summary>

```ts
import makeFreeZeeSocket from '@freezeehost/baileys'

const sock = makeFreeZeeSocket({
    // can provide additional config here
    printQRInTerminal: false //need to be false
})

if (!sock.authState.creds.registered) {
    const number = 'XXXXXXXXXXX'
    const code = await sock.requestPairingCode(number)
    console.log(code)
}
```
</details>

### Receive Full History

1. Set `syncFullHistory` as `true`
2. Baileys, by default, use chrome browser config
    - If you'd like to emulate a desktop connection (and receive more message history), this browser setting to your Socket config:

<details>
<summary><strong>💻 Show Receive Full History Code</strong></summary>

```ts
const sock = makeFreeZeeSocket({
    ...otherOpts,
    // can use Windows, Ubuntu here too
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: true
})
```
</details>

## Important Notes About Socket Config

### Caching Group Metadata (Recommended)
- If you use baileys for groups, we recommend you to set `cachedGroupMetadata` in socket config, you need to implement a cache like this:

<details>
<summary><strong>💻 Show Caching Group Metadata (Recommended) Code</strong></summary>

    ```ts
    const groupCache = new NodeCache({stdTTL: 5 * 60, useClones: false})

    const sock = makeFreeZeeSocket({
        cachedGroupMetadata: async (jid) => groupCache.get(jid)
    })

    sock.ev.on('groups.update', async ([event]) => {
        const metadata = await sock.groupMetadata(event.id)
        groupCache.set(event.id, metadata)
    })

    sock.ev.on('group-participants.update', async (event) => {
        const metadata = await sock.groupMetadata(event.id)
        groupCache.set(event.id, metadata)
    })
    ```
</details>

### Improve Retry System & Decrypt Poll Votes
- If you want to improve sending message, retrying when error occurs and decrypt poll votes, you need to have a store and set `getMessage` config in socket like this:
<details>
<summary><strong>💻 Show Improve Retry System & Decrypt Poll Votes Code</strong></summary>

    ```ts
    const sock = makeFreeZeeSocket({
        getMessage: async (key) => await getMessageFromStore(key)
    })
    ```
</details>

### Receive Notifications in Whatsapp App
- If you want to receive notifications in whatsapp app, set `markOnlineOnConnect` to `false`
<details>
<summary><strong>💻 Show Receive Notifications in Whatsapp App Code</strong></summary>

    ```ts
    const sock = makeFreeZeeSocket({
        markOnlineOnConnect: false
    })
    ```
</details>
## Saving & Restoring Sessions

You obviously don't want to keep scanning the QR code every time you want to connect.

So, you can load the credentials to log back in:
<details>
<summary><strong>💻 Show Saving & Restoring Sessions Code</strong></summary>

```ts
import makeFreeZeeSocket, { useMultiFileAuthState } from '@freezeehost/baileys'

const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

// will use the given state to connect
// so if valid credentials are available -- it'll connect without QR
const sock = makeFreeZeeSocket({ auth: state })

// this will be called as soon as the credentials are updated
sock.ev.on('creds.update', saveCreds)
```
</details>

> [!IMPORTANT]
> `useMultiFileAuthState` is a utility function to help save the auth state in a single folder, this function serves as a good guide to help write auth & key states for SQL/no-SQL databases, which I would recommend in any production grade system.

> [!NOTE]
> When a message is received/sent, due to signal sessions needing updating, the auth keys (`authState.keys`) will update. Whenever that happens, you must save the updated keys (`authState.keys.set()` is called). Not doing so will prevent your messages from reaching the recipient & cause other unexpected consequences. The `useMultiFileAuthState` function automatically takes care of that, but for any other serious implementation -- you will need to be very careful with the key state management.

## Handling Events

- Baileys uses the EventEmitter syntax for events.
They're all nicely typed up, so you shouldn't have any issues with an Intellisense editor like VS Code.

> [!IMPORTANT]
> **The events are [these](https://baileys.whiskeysockets.io/types/BaileysEventMap.html)**, it's important you see all events

You can listen to these events like this:
<details>
<summary><strong>💻 Show Handling Events Code</strong></summary>

```ts
const sock = makeFreeZeeSocket()
sock.ev.on('messages.upsert', ({ messages }) => {
    console.log('got messages', messages)
})
```
</details>

### Example to Start

> [!NOTE]
> This example includes basic auth storage too

> [!NOTE]
> For reliable serialization of the authentication state, especially when storing as JSON, always use the BufferJSON utility.

<details>
<summary><strong>💻 Show Example to Start Code</strong></summary>

```ts
import makeFreeZeeSocket, { DisconnectReason, useMultiFileAuthState } from '@freezeehost/baileys'
import { Boom } from '@hapi/boom'

async function connectToWhatsApp () {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    const sock = makeFreeZeeSocket({
        // can provide additional config here
        auth: state,
        printQRInTerminal: true
    })
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', event => {
        for (const m of event.messages) {
            console.log(JSON.stringify(m, undefined, 2))

            console.log('replying to', m.key.remoteJid)
            await sock.sendMessage(m.key.remoteJid!, { text: 'Hello Word' })
        }
    })

    // to storage creds (session info) when it updates
    sock.ev.on('creds.update', saveCreds)
}
// run in main file
connectToWhatsApp()
```
</details>

> [!IMPORTANT]
> In `messages.upsert` it's recommended to use a loop like `for (const message of event.messages)` to handle all messages in array

### Decrypt Poll Votes

- By default poll votes are encrypted and handled in `messages.update`
- That's a simple example
<details>
<summary><strong>💻 Show Decrypt Poll Votes Code</strong></summary>

```ts
sock.ev.on('messages.update', event => {
    for(const { key, update } of event) {
        if(update.pollUpdates) {
            const pollCreation = await getMessage(key)
            if(pollCreation) {
                console.log(
                    'got poll update, aggregation: ',
                    getAggregateVotesInPollMessage({
                        message: pollCreation,
                        pollUpdates: update.pollUpdates,
                    })
                )
            }
        }
    }
})
```
</details>

- `getMessage` is a [store](#implementing-a-data-store) implementation (in your end)

### Summary of Events on First Connection

1. When you connect first time, `connection.update` will be fired requesting you to restart sock
2. Then, history messages will be received in `messaging.history-set`

## Implementing a Data Store

- Baileys does not come with a defacto storage for chats, contacts, or messages. However, a simple in-memory implementation has been provided. The store listens for chat updates, new messages, message updates, etc., to always have an up-to-date version of the data.

> [!IMPORTANT]
> I highly recommend building your own data store, as storing someone's entire chat history in memory is a terrible waste of RAM.

It can be used as follows:

<details>
<summary><strong>💻 Show Implementing a Data Store Code</strong></summary>

```ts
import makeFreeZeeSocket, { makeInMemoryStore } from '@freezeehost/baileys'
// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({ })
// can be read from a file
store.readFromFile('./baileys_store.json')
// saves the state to a file every 10s
setInterval(() => {
    store.writeToFile('./baileys_store.json')
}, 10_000)

const sock = makeFreeZeeSocket({ })
// will listen from this socket
// the store can listen from a new socket once the current socket outlives its lifetime
store.bind(sock.ev)

sock.ev.on('chats.upsert', () => {
    // can use 'store.chats' however you want, even after the socket dies out
    // 'chats' => a KeyedDB instance
    console.log('got chats', store.chats.all())
})

sock.ev.on('contacts.upsert', () => {
    console.log('got contacts', Object.values(store.contacts))
})

```
</details>

The store also provides some simple functions such as `loadMessages` that utilize the store to speed up data retrieval.

## Whatsapp IDs Explain

- `id` is the WhatsApp ID, called `jid` too, of the person or group you're sending the message to.
    - It must be in the format ```[country code][phone number]@s.whatsapp.net```
	    - Example for people: ```+19999999999@s.whatsapp.net```.
	    - For groups, it must be in the format ``` 123456789-123345@g.us ```.
    - For broadcast lists, it's `[timestamp of creation]@broadcast`.
    - For stories, the ID is `status@broadcast`.

## Utility Functions

- `getContentType`, returns the content type for any message
- `getDevice`, returns the device from message
- `makeCacheableSignalKeyStore`, make auth store more fast
- `downloadContentFromMessage`, download content from any message

## Sending Messages

- Send all types of messages with a single function
    - **[Here](https://baileys.whiskeysockets.io/types/AnyMessageContent.html) you can see all message contents supported, like text message**
    - **[Here](https://baileys.whiskeysockets.io/types/MiscMessageGenerationOptions.html) you can see all options supported, like quote message**

<details>
<summary><strong>💻 Show Sending Messages Code</strong></summary>

    ```ts
    const jid: string
    const content: AnyMessageContent
    const options: MiscMessageGenerationOptions

    sock.sendMessage(jid, content, options)
    ```
</details>

### Non-Media Messages

#### Text Message
<details>
<summary><strong>💻 Show Text Message Code</strong></summary>

```ts
await sock.sendMessage(jid, { text: 'hello word' })
```
</details>

#### Quote Message (works with all types)
<details>
<summary><strong>💻 Show Quote Message (works with all types) Code</strong></summary>

```ts
await sock.sendMessage(jid, { text: 'hello word' }, { quoted: message })
```
</details>

#### Mention User (works with most types)
- @number is to mention in text, it's optional
<details>
<summary><strong>💻 Show Mention User (works with most types) Code</strong></summary>

```ts
await sock.sendMessage(
    jid,
    {
        text: '@12345678901',
        mentions: ['12345678901@s.whatsapp.net']
    }
)
```
</details>

#### Forward Messages
- You need to have message object, can be retrieved from [store](#implementing-a-data-store) or use a [message](https://baileys.whiskeysockets.io/types/WAMessage.html) object
<details>
<summary><strong>💻 Show Forward Messages Code</strong></summary>

```ts
const msg = getMessageFromStore() // implement this on your end
await sock.sendMessage(jid, { forward: msg }) // WA forward the message!
```
</details>

#### Location Message
<details>
<summary><strong>💻 Show Location Message Code</strong></summary>

```ts
await sock.sendMessage(
    jid,
    {
        location: {
            degreesLatitude: 24.121231,
            degreesLongitude: 55.1121221
        }
    }
)
```
</details>
#### Contact Message
<details>
<summary><strong>💻 Show Contact Message Code</strong></summary>

```ts
const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
            + 'VERSION:3.0\n'
            + 'FN:Jeff Singh\n' // full name
            + 'ORG:Ashoka Uni;\n' // the organization of the contact
            + 'TEL;type=CELL;type=VOICE;waid=911234567890:+91 12345 67890\n' // WhatsApp ID + phone number
            + 'END:VCARD'

await sock.sendMessage(
    id,
    {
        contacts: {
            displayName: 'Jeff',
            contacts: [{ vcard }]
        }
    }
)
```
</details>

#### Reaction Message
- You need to pass the key of message, you can retrieve from [store](#implementing-a-data-store) or use a [key](https://baileys.whiskeysockets.io/types/WAMessageKey.html) object
<details>
<summary><strong>💻 Show Reaction Message Code</strong></summary>

```ts
await sock.sendMessage(
    jid,
    {
        react: {
            text: '💖', // use an empty string to remove the reaction
            key: message.key
        }
    }
)
```
</details>

#### Pin Message
- You need to pass the key of message, you can retrieve from [store](#implementing-a-data-store) or use a [key](https://baileys.whiskeysockets.io/types/WAMessageKey.html) object

- Time can be:

| Time  | Seconds        |
|-------|----------------|
| 24h    | 86.400        |
| 7d     | 604.800       |
| 30d    | 2.592.000     |

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```ts
await sock.sendMessage(
    jid,
    {
        pin: {
            type: 1, // 0 to remove
            time: 86400
            key: message.key
        }
    }
)
```
</details>

#### Poll Message
<details>
<summary><strong>💻 Show Poll Message Code</strong></summary>

```ts
await sock.sendMessage(
    jid,
    {
        poll: {
            name: 'My Poll',
            values: ['Option 1', 'Option 2', ...],
            selectableCount: 1,
            toAnnouncementGroup: false // or true
        }
    }
)
```
</details>

### Sending Messages with Link Previews

1. By default, wa does not have link generation when sent from the web
2. Baileys has a function to generate the content for these link previews
3. To enable this function's usage, add `link-preview-js` as a dependency to your project with `yarn add link-preview-js`
4. Send a link:
<details>
<summary><strong>💻 Show Sending Messages with Link Previews Code</strong></summary>

```ts
await sock.sendMessage(
    jid,
    {
        text: 'Hi, this was sent using https://github.com/whiskeysockets/baileys'
    }
)
```
</details>

### Media Messages

Sending media (video, stickers, images) is easier & more efficient than ever.

> [!NOTE]
> In media messages, you can pass `{ stream: Stream }` or `{ url: Url }` or `Buffer` directly, you can see more [here](https://baileys.whiskeysockets.io/types/WAMediaUpload.html)

- When specifying a media url, Baileys never loads the entire buffer into memory; it even encrypts the media as a readable stream.

> [!TIP]
> It's recommended to use Stream or Url to save memory

#### Gif Message
- Whatsapp doesn't support `.gif` files, that's why we send gifs as common `.mp4` video with `gifPlayback` flag
<details>
<summary><strong>💻 Show Gif Message Code</strong></summary>

```ts
await sock.sendMessage(
    jid,
    {
        video: fs.readFileSync('Media/ma_gif.mp4'),
        caption: 'hello word',
        gifPlayback: true
    }
)
```
</details>

#### Video Message
<details>
<summary><strong>💻 Show Video Message Code</strong></summary>

```ts
await sock.sendMessage(
    id,
    {
        video: {
            url: './Media/ma_gif.mp4'
        },
        caption: 'hello word',
	    ptv: false // if set to true, will send as a `video note`
    }
)
```
</details>

#### Audio Message
- To audio message work in all devices you need to convert with some tool like `ffmpeg` with this flags:
<details>
<summary><strong>💻 Show Audio Message Code</strong></summary>

    ```bash
        codec: libopus //ogg file
        ac: 1 //one channel
        avoid_negative_ts
        make_zero
    ```
</details>
    - Example:
<details>
<summary><strong>💻 Show Audio Message Code</strong></summary>

    ```bash
    ffmpeg -i input.mp4 -avoid_negative_ts make_zero -ac 1 output.ogg
    ```
</details>
<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```ts
await sock.sendMessage(
    jid,
    {
        audio: {
            url: './Media/audio.mp3'
        },
        mimetype: 'audio/mp4'
    }
)
```
</details>

#### Image Message
<details>
<summary><strong>💻 Show Image Message Code</strong></summary>

```ts
await sock.sendMessage(
    id,
    {
        image: {
            url: './Media/ma_img.png'
        },
        caption: 'hello word'
    }
)
```
</details>

#### View Once Message

- You can send all messages above as `viewOnce`, you only need to pass `viewOnce: true` in content object

<details>
<summary><strong>💻 Show View Once Message Code</strong></summary>

```ts
await sock.sendMessage(
    id,
    {
        image: {
            url: './Media/ma_img.png'
        },
        viewOnce: true, //works with video, audio too
        caption: 'hello word'
    }
)
```
</details>

## Modify Messages

### Deleting Messages (for everyone)

<details>
<summary><strong>💻 Show Deleting Messages (for everyone) Code</strong></summary>

```ts
const msg = await sock.sendMessage(jid, { text: 'hello word' })
await sock.sendMessage(jid, { delete: msg.key })
```
</details>

**Note:** deleting for oneself is supported via `chatModify`, see in [this section](#modifying-chats)

### Editing Messages

- You can pass all editable contents here
<details>
<summary><strong>💻 Show Editing Messages Code</strong></summary>

```ts
await sock.sendMessage(jid, {
      text: 'updated text goes here',
      edit: response.key,
    });
```
</details>

## Manipulating Media Messages

### Thumbnail in Media Messages
- For media messages, the thumbnail can be generated automatically for images & stickers provided you add `jimp` or `sharp` as a dependency in your project using `yarn add jimp` or `yarn add sharp`.
- Thumbnails for videos can also be generated automatically, though, you need to have `ffmpeg` installed on your system.

### Downloading Media Messages

If you want to save the media you received
<details>
<summary><strong>💻 Show Downloading Media Messages Code</strong></summary>

```ts
import { createWriteStream } from 'fs'
import { downloadMediaMessage, getContentType } from '@freezeehost/baileys'

sock.ev.on('messages.upsert', async ({ [m] }) => {
    if (!m.message) return // if there is no text or media message
    const messageType = getContentType(m) // get what type of message it is (text, image, video...)

    // if the message is an image
    if (messageType === 'imageMessage') {
        // download the message
        const stream = await downloadMediaMessage(
            m,
            'stream', // can be 'buffer' too
            { },
            {
                logger,
                // pass this so that baileys can request a reupload of media
                // that has been deleted
                reuploadRequest: sock.updateMediaMessage
            }
        )
        // save to file
        const writeStream = createWriteStream('./my-download.jpeg')
        stream.pipe(writeStream)
    }
}
```
</details>

### Re-upload Media Message to Whatsapp

- WhatsApp automatically removes old media from their servers. For the device to access said media -- a re-upload is required by another device that has it. This can be accomplished using:
<details>
<summary><strong>💻 Show Re-upload Media Message to Whatsapp Code</strong></summary>

```ts
await sock.updateMediaMessage(msg)
```
</details>

## Reject Call

- You can obtain `callId` and `callFrom` from `call` event

<details>
<summary><strong>💻 Show Reject Call Code</strong></summary>

```ts
await sock.rejectCall(callId, callFrom)
```
</details>

## Send States in Chat

### Reading Messages
- A set of message [keys](https://baileys.whiskeysockets.io/types/WAMessageKey.html) must be explicitly marked read now.
- You cannot mark an entire 'chat' read as it were with Baileys Web.
This means you have to keep track of unread messages.

<details>
<summary><strong>💻 Show Reading Messages Code</strong></summary>

```ts
const key: WAMessageKey
// can pass multiple keys to read multiple messages as well
await sock.readMessages([key])
```
</details>

The message ID is the unique identifier of the message that you are marking as read.
On a `WAMessage`, the `messageID` can be accessed using ```messageID = message.key.id```.

### Update Presence

- ``` presence ``` can be one of [these](https://baileys.whiskeysockets.io/types/WAPresence.html)
- The presence expires after about 10 seconds.
- This lets the person/group with `jid` know whether you're online, offline, typing etc.

<details>
<summary><strong>💻 Show Update Presence Code</strong></summary>

```ts
await sock.sendPresenceUpdate('available', jid)
```
</details>

> [!NOTE]
> If a desktop client is active, WA doesn't send push notifications to the device. If you would like to receive said notifications -- mark your Baileys client offline using `sock.sendPresenceUpdate('unavailable')`

## Modifying Chats

WA uses an encrypted form of communication to send chat/app updates. This has been implemented mostly and you can send the following updates:

> [!IMPORTANT]
> If you mess up one of your updates, WA can log you out of all your devices and you'll have to log in again.

### Archive a Chat
<details>
<summary><strong>💻 Show Archive a Chat Code</strong></summary>

```ts
const lastMsgInChat = await getLastMessageInChat(jid) // implement this on your end
await sock.chatModify({ archive: true, lastMessages: [lastMsgInChat] }, jid)
```
</details>
### Mute/Unmute a Chat

- Supported times:

| Time  | Miliseconds     |
|-------|-----------------|
| Remove | null           |
| 8h     | 86.400.000     |
| 7d     | 604.800.000    |

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```ts
// mute for 8 hours
await sock.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid)
// unmute
await sock.chatModify({ mute: null }, jid)
```
</details>
### Mark a Chat Read/Unread
<details>
<summary><strong>💻 Show Mark a Chat Read/Unread Code</strong></summary>

```ts
const lastMsgInChat = await getLastMessageInChat(jid) // implement this on your end
// mark it unread
await sock.chatModify({ markRead: false, lastMessages: [lastMsgInChat] }, jid)
```
</details>

### Delete a Message for Me
<details>
<summary><strong>💻 Show Delete a Message for Me Code</strong></summary>

```ts
await sock.chatModify(
    {
        clear: {
            messages: [
                {
                    id: 'ATWYHDNNWU81732J',
                    fromMe: true,
                    timestamp: '1654823909'
                }
            ]
        }
    },
    jid
)

```
</details>
### Delete a Chat
<details>
<summary><strong>💻 Show Delete a Chat Code</strong></summary>

```ts
const lastMsgInChat = await getLastMessageInChat(jid) // implement this on your end
await sock.chatModify({
        delete: true,
        lastMessages: [
            {
                key: lastMsgInChat.key,
                messageTimestamp: lastMsgInChat.messageTimestamp
            }
        ]
    },
    jid
)
```
</details>
### Pin/Unpin a Chat
<details>
<summary><strong>💻 Show Pin/Unpin a Chat Code</strong></summary>

```ts
await sock.chatModify({
        pin: true // or `false` to unpin
    },
    jid
)
```
</details>
### Star/Unstar a Message
<details>
<summary><strong>💻 Show Star/Unstar a Message Code</strong></summary>

```ts
await sock.chatModify({
        star: {
            messages: [
                {
                    id: 'messageID',
                    fromMe: true // or `false`
                }
            ],
            star: true // - true: Star Message; false: Unstar Message
        }
    },
    jid
)
```
</details>

### Disappearing Messages

- Ephemeral can be:

| Time  | Seconds        |
|-------|----------------|
| Remove | 0          |
| 24h    | 86.400     |
| 7d     | 604.800    |
| 90d    | 7.776.000  |

- You need to pass in **Seconds**, default is 7 days

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```ts
// turn on disappearing messages
await sock.sendMessage(
    jid,
    // this is 1 week in seconds -- how long you want messages to appear for
    { disappearingMessagesInChat: WA_DEFAULT_EPHEMERAL }
)

// will send as a disappearing message
await sock.sendMessage(jid, { text: 'hello' }, { ephemeralExpiration: WA_DEFAULT_EPHEMERAL })

// turn off disappearing messages
await sock.sendMessage(
    jid,
    { disappearingMessagesInChat: false }
)
```
</details>

## User Querys

### Check If ID Exists in Whatsapp
<details>
<summary><strong>💻 Show Check If ID Exists in Whatsapp Code</strong></summary>

```ts
const [result] = await sock.onWhatsApp(jid)
if (result.exists) console.log (`${jid} exists on WhatsApp, as jid: ${result.jid}`)
```
</details>

### Query Chat History (groups too)

- You need to have oldest message in chat
<details>
<summary><strong>💻 Show Query Chat History (groups too) Code</strong></summary>

```ts
const msg = await getOldestMessageInChat(jid) // implement this on your end
await sock.fetchMessageHistory(
    50, //quantity (max: 50 per query)
    msg.key,
    msg.messageTimestamp
)
```
</details>
- Messages will be received in `messaging.history-set` event

### Fetch Status
<details>
<summary><strong>💻 Show Fetch Status Code</strong></summary>

```ts
const status = await sock.fetchStatus(jid)
console.log('status: ' + status)
```
</details>

### Fetch Profile Picture (groups too)
- To get the display picture of some person/group
<details>
<summary><strong>💻 Show Fetch Profile Picture (groups too) Code</strong></summary>

```ts
// for low res picture
const ppUrl = await sock.profilePictureUrl(jid)
console.log(ppUrl)

// for high res picture
const ppUrl = await sock.profilePictureUrl(jid, 'image')
```
</details>

### Fetch Bussines Profile (such as description or category)
<details>
<summary><strong>💻 Show Fetch Bussines Profile (such as description or category) Code</strong></summary>

```ts
const profile = await sock.getBusinessProfile(jid)
console.log('business description: ' + profile.description + ', category: ' + profile.category)
```
</details>

### Fetch Someone's Presence (if they're typing or online)
<details>
<summary><strong>💻 Show Fetch Someone's Presence (if they're typing or online) Code</strong></summary>

```ts
// the presence update is fetched and called here
sock.ev.on('presence.update', console.log)

// request updates for a chat
await sock.presenceSubscribe(jid)
```
</details>

## Change Profile

### Change Profile Status
<details>
<summary><strong>💻 Show Change Profile Status Code</strong></summary>

```ts
await sock.updateProfileStatus('Hello World!')
```
</details>
### Change Profile Name
<details>
<summary><strong>💻 Show Change Profile Name Code</strong></summary>

```ts
await sock.updateProfileName('My name')
```
</details>
### Change Display Picture (groups too)
- To change your display picture or a group's

> [!NOTE]
> Like media messages, you can pass `{ stream: Stream }` or `{ url: Url }` or `Buffer` directly, you can see more [here](https://baileys.whiskeysockets.io/types/WAMediaUpload.html)

<details>
<summary><strong>💻 Show Change Display Picture (groups too) Code</strong></summary>

```ts
await sock.updateProfilePicture(jid, { url: './new-profile-picture.jpeg' })
```
</details>
### Remove display picture (groups too)
<details>
<summary><strong>💻 Show Remove display picture (groups too) Code</strong></summary>

```ts
await sock.removeProfilePicture(jid)
```
</details>

## Groups

- To change group properties you need to be admin

### Create a Group
<details>
<summary><strong>💻 Show Create a Group Code</strong></summary>

```ts
// title & participants
const group = await sock.groupCreate('My Fab Group', ['1234@s.whatsapp.net', '4564@s.whatsapp.net'])
console.log('created group with id: ' + group.gid)
await sock.sendMessage(group.id, { text: 'hello there' }) // say hello to everyone on the group
```
</details>
### Add/Remove or Demote/Promote
<details>
<summary><strong>💻 Show Add/Remove or Demote/Promote Code</strong></summary>

```ts
// id & people to add to the group (will throw error if it fails)
await sock.groupParticipantsUpdate(
    jid,
    ['abcd@s.whatsapp.net', 'efgh@s.whatsapp.net'],
    'add' // replace this parameter with 'remove' or 'demote' or 'promote'
)
```
</details>
### Change Subject (name)
<details>
<summary><strong>💻 Show Change Subject (name) Code</strong></summary>

```ts
await sock.groupUpdateSubject(jid, 'New Subject!')
```
</details>
### Change Description
<details>
<summary><strong>💻 Show Change Description Code</strong></summary>

```ts
await sock.groupUpdateDescription(jid, 'New Description!')
```
</details>
### Change Settings
<details>
<summary><strong>💻 Show Change Settings Code</strong></summary>

```ts
// only allow admins to send messages
await sock.groupSettingUpdate(jid, 'announcement')
// allow everyone to send messages
await sock.groupSettingUpdate(jid, 'not_announcement')
// allow everyone to modify the group's settings -- like display picture etc.
await sock.groupSettingUpdate(jid, 'unlocked')
// only allow admins to modify the group's settings
await sock.groupSettingUpdate(jid, 'locked')
```
</details>
### Leave a Group
<details>
<summary><strong>💻 Show Leave a Group Code</strong></summary>

```ts
// will throw error if it fails
await sock.groupLeave(jid)
```
</details>
### Get Invite Code
- To create link with code use `'https://chat.whatsapp.com/' + code`
<details>
<summary><strong>💻 Show Get Invite Code Code</strong></summary>

```ts
const code = await sock.groupInviteCode(jid)
console.log('group code: ' + code)
```
</details>
### Revoke Invite Code
<details>
<summary><strong>💻 Show Revoke Invite Code Code</strong></summary>

```ts
const code = await sock.groupRevokeInvite(jid)
console.log('New group code: ' + code)
```
</details>
### Join Using Invitation Code
- Code can't have `https://chat.whatsapp.com/`, only code
<details>
<summary><strong>💻 Show Join Using Invitation Code Code</strong></summary>

```ts
const response = await sock.groupAcceptInvite(code)
console.log('joined to: ' + response)
```
</details>
### Get Group Info by Invite Code
<details>
<summary><strong>💻 Show Get Group Info by Invite Code Code</strong></summary>

```ts
const response = await sock.groupGetInviteInfo(code)
console.log('group information: ' + response)
```
</details>
### Query Metadata (participants, name, description...)
<details>
<summary><strong>💻 Show Query Metadata (participants, name, description...) Code</strong></summary>

```ts
const metadata = await sock.groupMetadata(jid)
console.log(metadata.id + ', title: ' + metadata.subject + ', description: ' + metadata.desc)
```
</details>
### Join using `groupInviteMessage`
<details>
<summary><strong>💻 Show Join using `groupInviteMessage` Code</strong></summary>

```ts
const response = await sock.groupAcceptInviteV4(jid, groupInviteMessage)
console.log('joined to: ' + response)
```
</details>
### Get Request Join List
<details>
<summary><strong>💻 Show Get Request Join List Code</strong></summary>

```ts
const response = await sock.groupRequestParticipantsList(jid)
console.log(response)
```
</details>
### Approve/Reject Request Join
<details>
<summary><strong>💻 Show Approve/Reject Request Join Code</strong></summary>

```ts
const response = await sock.groupRequestParticipantsUpdate(
    jid, // group id
    ['abcd@s.whatsapp.net', 'efgh@s.whatsapp.net'],
    'approve' // or 'reject'
)
console.log(response)
```
</details>
### Get All Participating Groups Metadata
<details>
<summary><strong>💻 Show Get All Participating Groups Metadata Code</strong></summary>

```ts
const response = await sock.groupFetchAllParticipating()
console.log(response)
```
</details>
### Toggle Ephemeral

- Ephemeral can be:

| Time  | Seconds        |
|-------|----------------|
| Remove | 0          |
| 24h    | 86.400     |
| 7d     | 604.800    |
| 90d    | 7.776.000  |

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```ts
await sock.groupToggleEphemeral(jid, 86400)
```
</details>

### Change Add Mode
<details>
<summary><strong>💻 Show Change Add Mode Code</strong></summary>

```ts
await sock.groupMemberAddMode(
    jid,
    'all_member_add' // or 'admin_add'
)
```
</details>

## Privacy

### Block/Unblock User
<details>
<summary><strong>💻 Show Block/Unblock User Code</strong></summary>

```ts
await sock.updateBlockStatus(jid, 'block') // Block user
await sock.updateBlockStatus(jid, 'unblock') // Unblock user
```
</details>
### Get Privacy Settings
<details>
<summary><strong>💻 Show Get Privacy Settings Code</strong></summary>

```ts
const privacySettings = await sock.fetchPrivacySettings(true)
console.log('privacy settings: ' + privacySettings)
```
</details>
### Get BlockList
<details>
<summary><strong>💻 Show Get BlockList Code</strong></summary>

```ts
const response = await sock.fetchBlocklist()
console.log(response)
```
</details>
### Update LastSeen Privacy
<details>
<summary><strong>💻 Show Update LastSeen Privacy Code</strong></summary>

```ts
const value = 'all' // 'contacts' | 'contact_blacklist' | 'none'
await sock.updateLastSeenPrivacy(value)
```
</details>
### Update Online Privacy
<details>
<summary><strong>💻 Show Update Online Privacy Code</strong></summary>

```ts
const value = 'all' // 'match_last_seen'
await sock.updateOnlinePrivacy(value)
```
</details>
### Update Profile Picture Privacy
<details>
<summary><strong>💻 Show Update Profile Picture Privacy Code</strong></summary>

```ts
const value = 'all' // 'contacts' | 'contact_blacklist' | 'none'
await sock.updateProfilePicturePrivacy(value)
```
</details>
### Update Status Privacy
<details>
<summary><strong>💻 Show Update Status Privacy Code</strong></summary>

```ts
const value = 'all' // 'contacts' | 'contact_blacklist' | 'none'
await sock.updateStatusPrivacy(value)
```
</details>
### Update Read Receipts Privacy
<details>
<summary><strong>💻 Show Update Read Receipts Privacy Code</strong></summary>

```ts
const value = 'all' // 'none'
await sock.updateReadReceiptsPrivacy(value)
```
</details>
### Update Groups Add Privacy
<details>
<summary><strong>💻 Show Update Groups Add Privacy Code</strong></summary>

```ts
const value = 'all' // 'contacts' | 'contact_blacklist'
await sock.updateGroupsAddPrivacy(value)
```
</details>
### Update Default Disappearing Mode

- Like [this](#disappearing-messages), ephemeral can be:

| Time  | Seconds        |
|-------|----------------|
| Remove | 0          |
| 24h    | 86.400     |
| 7d     | 604.800    |
| 90d    | 7.776.000  |

<details>
<summary><strong>💻 Click to Show Example Code</strong></summary>

```ts
const ephemeral = 86400
await sock.updateDefaultDisappearingMode(ephemeral)
```
</details>

## Broadcast Lists & Stories

### Send Broadcast & Stories
- Messages can be sent to broadcasts & stories. You need to add the following message options in sendMessage, like this:
<details>
<summary><strong>💻 Show Send Broadcast & Stories Code</strong></summary>

```ts
await sock.sendMessage(
    jid,
    {
        image: {
            url: url
        },
        caption: caption
    },
    {
        backgroundColor: backgroundColor,
        font: font,
        statusJidList: statusJidList,
        broadcast: true
    }
)
```
</details>
- Message body can be a `extendedTextMessage` or `imageMessage` or `videoMessage` or `voiceMessage`, see [here](https://baileys.whiskeysockets.io/types/AnyRegularMessageContent.html)
- You can add `backgroundColor` and other options in the message options, see [here](https://baileys.whiskeysockets.io/types/MiscMessageGenerationOptions.html)
- `broadcast: true` enables broadcast mode
- `statusJidList`: a list of people that you can get which you need to provide, which are the people who will get this status message.

- You can send messages to broadcast lists the same way you send messages to groups & individual chats.
- Right now, WA Web does not support creating broadcast lists, but you can still delete them.
- Broadcast IDs are in the format `12345678@broadcast`
### Query a Broadcast List's Recipients & Name
<details>
<summary><strong>💻 Show Query a Broadcast List's Recipients & Name Code</strong></summary>

```ts
const bList = await sock.getBroadcastListInfo('1234@broadcast')
console.log (`list name: ${bList.name}, recps: ${bList.recipients}`)
```
</details>

## Writing Custom Functionality
Baileys is written with custom functionality in mind. Instead of forking the project & re-writing the internals, you can simply write your own extensions.

### Enabling Debug Level in Baileys Logs
First, enable the logging of unhandled messages from WhatsApp by setting:
<details>
<summary><strong>💻 Show Enabling Debug Level in Baileys Logs Code</strong></summary>

```ts
const sock = makeFreeZeeSocket({
    logger: P({ level: 'debug' }),
})
```
</details>
This will enable you to see all sorts of messages WhatsApp sends in the console.

### How Whatsapp Communicate With Us

> [!TIP]
> If you want to learn whatsapp protocol, we recommend to study about Libsignal Protocol and Noise Protocol

- **Example:** Functionality to track the battery percentage of your phone. You enable logging and you'll see a message about your battery pop up in the console:
<details>
<summary><strong>💻 Show How Whatsapp Communicate With Us Code</strong></summary>

    ```
    {
        "level": 10,
        "fromMe": false,
        "frame": {
            "tag": "ib",
            "attrs": {
                "from": "@s.whatsapp.net"
            },
            "content": [
                {
                    "tag": "edge_routing",
                    "attrs": {},
                    "content": [
                        {
                            "tag": "routing_info",
                            "attrs": {},
                            "content": {
                                "type": "Buffer",
                                "data": [8,2,8,5]
                            }
                        }
                    ]
                }
            ]
        },
        "msg":"communication"
    }
    ```
</details>

The `'frame'` is what the message received is, it has three components:
- `tag` -- what this frame is about (eg. message will have 'message')
- `attrs` -- a string key-value pair with some metadata (contains ID of the message usually)
- `content` -- the actual data (eg. a message node will have the actual message content in it)
- read more about this format [here](/src/WABinary/readme.md)

### Register a Callback for Websocket Events

> [!TIP]
> Recommended to see `onMessageReceived` function in `socket.ts` file to understand how websockets events are fired

<details>
<summary><strong>💻 Show Register a Callback for Websocket Events Code</strong></summary>

```ts
// for any message with tag 'edge_routing'
sock.ws.on('CB:edge_routing', (node: BinaryNode) => { })

// for any message with tag 'edge_routing' and id attribute = abcd
sock.ws.on('CB:edge_routing,id:abcd', (node: BinaryNode) => { })

// for any message with tag 'edge_routing', id attribute = abcd & first content node routing_info
sock.ws.on('CB:edge_routing,id:abcd,routing_info', (node: BinaryNode) => { })
```
</details>

# License
Copyright (c) 2025 Rajeh Taher/WhiskeySockets

Licensed under the MIT License:
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Thus, the maintainers of the project can't be held liable for any potential misuse of this project.
