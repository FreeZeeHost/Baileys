const { default: makeWASocket, useMultiFileAuthState } = require('@freezeehost/baileys');
const pino = require('pino');

/**
 * 🌟 FreeZeeHost Advanced Bot Example
 * 
 * Demonstrates the power of @freezeehost/baileys with Meta AI features
 * and native WhatsApp components.
 */

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    
    const conn = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'info' })
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('✅ Bot is online using @freezeehost/baileys!');
        }
    });

    // --- 🚀 NEW SMART COMMAND HANDLER ---
    conn.onCommand('ping', (m) => m.reply('Pong! 🏓'));

    // --- 📊 META AI TABLE EXAMPLE ---
    conn.onCommand('table', (m) => {
        m.replyTable("Bot Pricing", [
            ["Plan", "Price", "Features"],
            ["Basic", "Free", "Auto-Reply"],
            ["Premium", "$5/mo", "Meta AI & Anti-Delete"]
        ]);
    });

    // --- 🧠 AI THINKING EXAMPLE ---
    conn.onCommand('think', async (m) => {
        await m.replyThinking("Processing your request...", [
            { title: "Analyzing intent", status: 2 },
            { title: "Searching database", status: 1 }
        ]);
        
        setTimeout(() => {
            m.reply("Done thinking! How can I help you further?");
        }, 3000);
    });

    // --- 🎨 STICKER PACK EXAMPLE ---
    conn.onCommand('pack', (m) => {
        m.reply("Sending you a sample sticker pack metadata notification...");
        conn.sendStickerPack(m.chat, {
            id: "sample_pack",
            name: "FreeZee Stickers",
            publisher: "FreeZeeHost",
            stickers: []
        });
    });

    // --- 🛡️ ANTI-DELETE LISTENER ---
    conn.ev.on('message.delete', ({ jid, id, message }) => {
        conn.sendMessage(jid, { 
            text: `⚠️ *Anti-Delete Detected!*\n\nUser tried to delete:\n"${message.text}"` 
        }, { quoted: message });
    });
}

startBot();
