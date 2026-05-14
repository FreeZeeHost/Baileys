import { makeFreeZeeSocket, proto, generateWAMessageFromContent } from './lib/index.js';
import pino from 'pino';

async function test() {
    console.log('Testing exports...');
    if (typeof generateWAMessageFromContent !== 'function') {
        console.error('generateWAMessageFromContent is not exported!');
    } else {
        console.log('generateWAMessageFromContent is exported correctly.');
    }

    if (typeof proto !== 'object') {
        console.error('proto is not exported!');
    } else {
        console.log('proto is exported correctly.');
    }

    const jid = '6285604618277@s.whatsapp.net';
    try {
        const msg = generateWAMessageFromContent(jid,
            proto.Message.fromObject({
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: 'Test interactive' },
                            footer: { text: 'Footer' },
                            nativeFlowMessage: {
                                buttons: [{
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: 'Title',
                                        sections: [{
                                            title: 'Section',
                                            rows: [{ title: 'Row', id: '1' }]
                                        }]
                                    })
                                }]
                            }
                        }
                    }
                }
            }),
            {}
        );
        console.log('Interactive message generated successfully:', JSON.stringify(msg.message, null, 2).substring(0, 200) + '...');
    } catch (e) {
        console.error('Failed to generate interactive message:', e.message);
    }
}

test();
