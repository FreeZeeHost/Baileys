"use strict"

Object.defineProperty(exports, "__esModule", { value: true })
exports.patchSocket = void 0

const stealth_mode_1 = require("./stealth-mode")
const make_smart_queue_1 = require("./make-smart-queue")
const make_middleware_1 = require("./make-middleware")
const media_engine_1 = require("./media-engine")
const WAProto_1 = require("../../WAProto")

/**
 * The ultimate patcher for Baileys.
 * Applies all advanced features (Stealth, Queue, Middleware, Media Engine) 
 * and adds simplified aliases for group/newsletter functions.
 */
const patchSocket = (sock, options = {}) => {
    // 1. Apply Advanced Features
    (0, stealth_mode_1.withStealthMode)(sock, options.stealth)
    (0, make_smart_queue_1.withSmartQueue)(sock, options.logger || sock.logger)
    (0, make_middleware_1.withMiddleware)(sock)
    (0, media_engine_1.withMediaEngine)(sock, options.media)

    // 2. Protobuf Helpers (Simplified access to WAProto)
    sock.msg = {
        text: (text) => ({ text }),
        image: (image, caption) => ({ image, caption }),
        video: (video, caption) => ({ video, caption }),
        sticker: (sticker) => ({ sticker }),
        document: (document, caption, fileName) => ({ document, caption, fileName }),
        contact: (displayName, phoneNumber) => ({
            contacts: {
                displayName,
                contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${displayName}\nTEL;type=CELL;type=VOICE;waid=${phoneNumber.replace('+', '')}:${phoneNumber}\nEND:VCARD` }]
            }
        }),
        location: (degreesLatitude, degreesLongitude, name) => ({ location: { degreesLatitude, degreesLongitude, name } }),
        poll: (name, values, selectableCount = 1) => ({
            pollCreationMessage: {
                name,
                options: values.map(v => ({ optionName: v })),
                selectableOptionsCount: selectableCount
            }
        }),
        // --- NEW RICH/INTERACTIVE HELPERS ---
        buttons: (text, buttons, footer, header) => ({
            viewOnceMessage: {
                message: {
                    buttonsMessage: {
                        contentText: text,
                        footerText: footer,
                        headerText: header,
                        buttons: buttons.map(b => ({
                            buttonId: b.id,
                            buttonText: { displayText: b.text },
                            type: 1
                        })),
                        headerType: 1
                    }
                }
            }
        }),
        list: (text, buttonText, sections, title, footer) => ({
            viewOnceMessage: {
                message: {
                    listMessage: {
                        title,
                        description: text,
                        buttonText,
                        listType: 1,
                        footerText: footer,
                        sections: sections.map(s => ({
                            title: s.title,
                            rows: s.rows.map(r => ({
                                title: r.title,
                                description: r.description,
                                rowId: r.id
                            }))
                        }))
                    }
                }
            }
        }),
        interactive: (content, buttons, header, footer) => ({
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: header ? { title: header, hasDeterministic: true } : undefined,
                        body: { text: content },
                        footer: footer ? { text: footer } : undefined,
                        nativeFlowMessage: {
                            buttons: buttons.map(b => ({
                                name: b.name,
                                buttonParamsJson: JSON.stringify(b.params || {})
                            }))
                        }
                    }
                }
            }
        }),
        shop: (id, surface = 1, text, title, footer) => ({
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: title ? { title, hasDeterministic: true } : undefined,
                        body: { text },
                        footer: footer ? { text: footer } : undefined,
                        shopMessage: {
                            surface,
                            id
                        }
                    }
                }
            }
        }),
        carousel: (text, cards, title, footer) => ({
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: title ? { title, hasDeterministic: true } : undefined,
                        body: { text },
                        footer: footer ? { text: footer } : undefined,
                        carouselMessage: {
                            cards: cards.map(c => ({
                                header: c.image ? { imageMessage: c.image, hasDeterministic: true } : (c.video ? { videoMessage: c.video, hasDeterministic: true } : undefined),
                                body: { text: c.body },
                                footer: { text: c.footer },
                                nativeFlowMessage: {
                                    buttons: c.buttons.map(b => ({
                                        name: b.name,
                                        buttonParamsJson: JSON.stringify(b.params || {})
                                    }))
                                }
                            }))
                        }
                    }
                }
            }
        }),
        payment: (amount, currency = 'IDR', note) => ({
            requestPaymentMessage: {
                amount: {
                    value: amount,
                    offset: 1000,
                    currencyCode: currency
                },
                noteMessage: { extendedTextMessage: { text: note } }
            }
        }),
        table: (headers, rows) => {
            const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map(r => r[i]?.toString().length || 0)))
            const drawRow = (row) => '| ' + row.map((c, i) => (c?.toString() || '').padEnd(colWidths[i])).join(' | ') + ' |'
            const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+'
            
            let tableText = '```\n' + separator + '\n'
            tableText += drawRow(headers) + '\n'
            tableText += separator + '\n'
            rows.forEach(r => { tableText += drawRow(r) + '\n' })
            tableText += separator + '\n```'
            
            return { text: tableText }
        },
        nativeTable: (content, tableData, header, footer) => ({
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: header ? { title: header, hasDeterministic: true } : undefined,
                        body: { text: content },
                        footer: footer ? { text: footer } : undefined,
                        nativeFlowMessage: {
                            buttons: [{
                                name: "entry_point_button",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "View Table",
                                    subtitle: content,
                                    external_custom_sections: [{
                                        type: "table",
                                        rows: tableData.map(row => ({
                                            columns: row.map(col => ({
                                                text: col.text,
                                                is_bold: !!col.bold,
                                                align: col.align || "left"
                                            }))
                                        }))
                                    }]
                                })
                            }]
                        }
                    }
                }
            }
        }),
        // Native Proto Access
        proto: WAProto_1.proto
    }

    // 3. Add Simplified Aliases (Making it cleaner than any other Baileys)
    
    // Group Aliases
    sock.groupAdd = (jid, participants) => sock.groupParticipantsUpdate(jid, participants, 'add')
    sock.groupRemove = (jid, participants) => sock.groupParticipantsUpdate(jid, participants, 'remove')
    sock.groupPromote = (jid, participants) => sock.groupParticipantsUpdate(jid, participants, 'promote')
    sock.groupDemote = (jid, participants) => sock.groupParticipantsUpdate(jid, participants, 'demote')
    
    // Group Edit Aliases
    sock.groupEditSubject = (jid, subject) => sock.groupUpdateSubject(jid, subject)
    sock.groupEditDescription = (jid, description) => sock.groupUpdateDescription(jid, description)
    sock.groupEditSetting = (jid, setting) => sock.groupSettingUpdate(jid, setting) // 'announcement' | 'not_announcement' | 'locked' | 'unlocked'
    
    // Message Edit Alias
    sock.editMessage = (jid, key, text) => sock.sendMessage(jid, { text, edit: key })

    // Newsletter Aliases
    sock.getNewsletter = (idOrInvite) => {
        const type = idOrInvite.includes('@newsletter') ? 'jid' : 'invite'
        return sock.newsletterMetadata(type, idOrInvite)
    }
    
    /**
     * AUTO-READ: Automatically marks all incoming messages as read.
     * Usage: sock.autoRead()
     */
    sock.autoRead = () => {
        sock.ev.on('messages.upsert', async ({ messages }) => {
            for (const msg of messages) {
                if (!msg.key.fromMe) {
                    await sock.readMessages([msg.key])
                }
            }
        })
    }

    /**
     * COMMAND ROUTER: A simple way to handle bot commands.
     * @param {String|RegExp} pattern The command prefix or regex (e.g. '.menu')
     * @param {Function} callback (m, args) => void
     */
    sock.onCommand = (pattern, callback) => {
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return
            const m = messages[0]
            if (!m.message) return
            
            const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
            const isMatch = typeof pattern === 'string' ? text.startsWith(pattern) : pattern.test(text)

            if (isMatch) {
                const args = text.trim().split(/ +/).slice(1)
                // Add helper to reply directly
                m.reply = (content) => sock.sendMessage(m.key.remoteJid, typeof content === 'string' ? { text: content } : content, { quoted: m })
                await callback(m, args)
            }
        })
    }

    /**
     * RICH MESSAGE: Professional messages with link previews and auto-mentions.
     */
    sock.sendRichMessage = async (jid, text, options = {}) => {
        const { 
            title = 'FreeZeeHost Multi-Device', 
            body = 'Lightweight WhatsApp Library', 
            thumbnailUrl = 'https://files.catbox.moe/gw41eq.png',
            sourceUrl = 'https://github.com/freezeehost/Baileys',
            mediaType = 1,
            renderLargerThumbnail = true,
            quoted,
            mentions = [],
            ...rest 
        } = options

        // Auto-detect mentions in text (e.g. @628xxx)
        const detectedMentions = text.match(/@(\d+)/g)?.map(v => v.slice(1) + '@s.whatsapp.net') || []
        const finalMentions = [...new Set([...detectedMentions, ...mentions])]

        return sock.sendMessage(jid, {
            text: text,
            contextInfo: {
                mentionedJid: finalMentions,
                externalAdReply: {
                    title,
                    body,
                    mediaType,
                    thumbnailUrl,
                    sourceUrl,
                    renderLargerThumbnail,
                }
            },
            ...rest
        }, { quoted })
    }

    return sock
}

exports.patchSocket = patchSocket
