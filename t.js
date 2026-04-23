/**
 * CONTOH PLUGIN GETSW (ESM)
 * Menggunakan fitur Status Store & Native Flow @freezeehost/baileys
 */

import { jidNormalizedUser } from './lib/index.js' // Sesuaikan path jika plugin berada di folder lain

export default async function handler(m, { sock, command, text }) {
    const prefix = '.'
    
    // 1. Perintah Awal: .getsw (Menampilkan List Kontak)
    if (command === 'getsw' && !text) {
        const senders = sock.getAllStatusSenders()
        
        if (senders.length === 0) {
            return m.reply("Belum ada status yang terekam oleh bot.")
        }

        const rows = senders.map(jid => ({
            header: "Update Status",
            title: sock.getName(jid) || jid.split('@')[0],
            description: `Klik untuk melihat status dari ${jid.split('@')[0]}`,
            id: `${prefix}getsw ${jid}`
        }))

        // Menggunakan helper nativeTable/interactive yang sudah kita buat
        await sock.sendMessage(m.chat, {
            text: "🔍 *GET STATUS WHATSAPP*\nSilakan pilih kontak di bawah ini untuk melihat daftar statusnya.",
            footer: "FreeZeeHost Status Store",
            buttons: [{
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Pilih Kontak",
                    sections: [{
                        title: "Daftar Kontak",
                        rows: rows
                    }]
                })
            }]
        }, { quoted: m })
    }

    // 2. Tahap Kedua: .getsw [jid] (Menampilkan List Status dari Kontak Tersebut)
    if (command === 'getsw' && text && text.includes('@')) {
        const targetJid = text.trim()
        const statuses = sock.getStatusesFrom(targetJid)

        if (statuses.length === 0) {
            return m.reply("Status orang ini sudah kadaluarsa atau tidak ditemukan.")
        }

        const rows = statuses.map((s, index) => ({
            header: `Status #${index + 1}`,
            title: s.statusData.type.replace('Message', '').toUpperCase(),
            description: s.statusData.caption || "(Tanpa Caption)",
            id: `${prefix}getswfetch ${targetJid}|${index}`
        }))

        await sock.sendMessage(m.chat, {
            text: `📂 *DAFTAR STATUS: ${sock.getName(targetJid)}*\nAda ${statuses.length} status yang tersedia. Pilih salah satu untuk mendownload.`,
            footer: "FreeZeeHost Status Store",
            buttons: [{
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Pilih Status",
                    sections: [{
                        title: "History Status",
                        rows: rows
                    }]
                })
            }]
        }, { quoted: m })
    }

    // 3. Tahap Akhir: .getswfetch [jid]|[index] (Mengirimkan Status)
    if (command === 'getswfetch') {
        const [jid, index] = text.split('|')
        const statuses = sock.getStatusesFrom(jid)
        const targetStatus = statuses[parseInt(index)]

        if (!targetStatus) return m.reply("Gagal mengambil status.")

        await m.reply(`⏳ Sedang mengirim status dari ${sock.getName(jid)}...`)
        
        // Forward status ke user (Fitur GetSW sesungguhnya)
        await sock.sendMessage(m.chat, { forward: targetStatus }, { quoted: m })
    }
}
