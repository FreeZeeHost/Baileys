const { useMongoFileAuthState } = require('./use-mongo-file-auth-state');
const { patchSocket } = require('./socket-patcher');
const { initAuthCreds } = require('./auth-utils');

/**
 * FreeZeeHost Hybrid Socket Factory
 * Otomatis menangani QR Code atau Pairing Code secara cerdas.
 */
exports.makeFreeZeeSocket = (config = {}) => {
    const makeWASocket = require('../Socket').default;
    
    // Defaulting state if not provided
    const state = config.auth || {
        creds: initAuthCreds(),
        keys: { get: async () => ({}), set: async () => {} }
    };

    const { 
        phoneNumber, 
        usePairingCode = !!phoneNumber,
        ...restConfig 
    } = config;

    // Build base socket
    const sock = makeWASocket({
        ...restConfig,
        auth: state,
        printQRInTerminal: !usePairingCode && (restConfig.printQRInTerminal !== false)
    });

    sock.authState = state;
    
    // Apply Premium Patches
    const patchedSock = patchSocket(sock);

    // --- 🤖 HYBRID PAIRING LOGIC ---
    const triggerPairing = async () => {
        if (usePairingCode && phoneNumber && !patchedSock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
                    const code = await patchedSock.requestPairingCode(cleanedNumber);
                    patchedSock.logger.info({ phoneNumber: cleanedNumber, pairingCode: code }, "Hybrid Pairing: Code generated successfully");
                    // Emit custom event for developers to catch
                    patchedSock.ev.emit('pairing-code', code);
                } catch (err) {
                    patchedSock.logger.info("Hybrid Pairing: Waiting for connection to stabilize...");
                }
            }, 5000);
        }
    };

    // Initial check
    triggerPairing();

    // Setup MongoDB Auth if URL is present (Auto-load)
    const mongoUrl = process.env.MONGO_URL;
    if (mongoUrl && !config.auth) {
        useMongoFileAuthState().then(({ state: mongoState, saveCreds, collection }) => {
            patchedSock.mongoCollection = collection;
            Object.assign(state.creds, mongoState.creds);
            state.keys = mongoState.keys;
            patchedSock.ev.on('creds.update', saveCreds);

            // Re-check pairing after mongo load (maybe creds were empty)
            triggerPairing();
        }).catch(err => {
            patchedSock.logger.error({ err }, "MongoDB Auth initialization failed");
        });
    }
    
    return patchedSock;
};
