const EventEmitter = require('events');

// Variables prefixed with 'mock' are allowed in jest.mock scope
const mockBrowsers = {
    ubuntu: jest.fn().mockReturnValue(['Ubuntu', 'Chrome', '20.0.0']),
    macOS: jest.fn(),
    windows: jest.fn(),
    linux: jest.fn()
};

const mockPersonas = { 
    ios: ['iOS', 'Safari', '15.0'], 
    android: ['Android', 'Chrome', '100.0'] 
};

// Mock dependencies
jest.mock('./lib/Utils/generics', () => ({
    generateMessageID: jest.fn().mockReturnValue('test-id'),
    getBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
    Personas: mockPersonas,
    Browsers: mockBrowsers
}));

const { patchSocket } = require('./lib/Utils/socket-patcher');

/**
 * 🧪 FreeZeeHost Premium Features Unit Test
 */

describe('FreeZee Baileys Premium Features', () => {
    let mockConn;

    beforeEach(() => {
        mockConn = {
            ev: new EventEmitter(),
            authState: {
                creds: { registered: true },
                keys: { get: async () => ({}), set: async () => {} }
            },
            config: { browser: ['Ubuntu', 'Chrome', '20.0.0'] },
            logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            },
            sendMessage: jest.fn().mockResolvedValue({ key: { id: 'test' } }),
            relayMessage: jest.fn().mockResolvedValue({}),
            sendPresenceUpdate: jest.fn().mockResolvedValue({}),
            waUploadToServer: jest.fn().mockResolvedValue({ url: 'https://mmg.whatsapp.net/test' })
        };

        patchSocket(mockConn);
    });

    test('should have all premium helpers installed', () => {
        expect(mockConn.setPersona).toBeDefined();
        expect(mockConn.aiTable).toBeDefined();
        expect(mockConn.createEvent).toBeDefined();
        expect(mockConn.smsg).toBeDefined();
    });

    test('setPersona should update browser config', () => {
        mockConn.setPersona('ios');
        expect(mockConn.config.browser[0]).toBe('iOS');
    });

    test('aiTable should call relayMessage with correct structure', async () => {
        await mockConn.aiTable('jid', 'Test Table', [['A', 'B']]);
        expect(mockConn.relayMessage).toHaveBeenCalled();
    });

    test('smsg should add reply helpers to message', () => {
        const rawMsg = {
            key: { remoteJid: 'jid', id: '123' },
            message: { conversation: 'hello' }
        };
        const m = mockConn.smsg(rawMsg);
        expect(m.reply).toBeDefined();
        expect(m.command).toBe('hello');
    });
});
