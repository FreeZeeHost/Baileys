import { generateWAMessageFromContent, proto } from './lib/index.js';

const jid = '6285604618277@s.whatsapp.net';
try {
    const msg = generateWAMessageFromContent(jid, 
        proto.Message.fromObject({
            extendedTextMessage: {
                text: 'Test with undefined newsletterJid',
                contextInfo: {
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: undefined,
                        newsletterName: 'Test'
                    }
                }
            }
        }), 
        {}
    );
    console.log('Message generated successfully with undefined newsletterJid');
} catch (e) {
    console.error('Failed with undefined newsletterJid:', e.message);
}

try {
    const msg = generateWAMessageFromContent(jid, 
        proto.Message.fromObject({
            extendedTextMessage: {
                text: 'Test with null newsletterJid',
                contextInfo: {
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: null,
                        newsletterName: 'Test'
                    }
                }
            }
        }), 
        {}
    );
    console.log('Message generated successfully with null newsletterJid');
} catch (e) {
    console.error('Failed with null newsletterJid:', e.message);
}
