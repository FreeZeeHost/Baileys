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

    // Build base connet
    const conn = makeWASocket({
        ...restConfig,
        auth: state,
        printQRInTerminal: !usePairingCode && (restConfig.printQRInTerminal !== false)
    });

    conn.authState = state;
    conn.config = {
        ...restConfig,
        auth: state,
        printQRInTerminal: !usePairingCode && (restConfig.printQRInTerminal !== false)
    };
    
    // Apply Premium Patches
    const patchedConn = patchSocket(conn);

    // --- 🤖 HYBRID PAIRING LOGIC ---
    const triggerPairing = async () => {
        if (usePairingCode && phoneNumber && !patchedConn.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
                    const code = await patchedConn.requestPairingCode(cleanedNumber);
                    patchedConn.logger.info({ phoneNumber: cleanedNumber, pairingCode: code }, "Hybrid Pairing: Code generated successfully");
                    // Emit custom event for developers to catch
                    patchedConn.ev.emit('pairing-code', code);
                } catch (err) {
                    patchedConn.logger.info("Hybrid Pairing: Waiting for connection to stabilize...");
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
            patchedConn.mongoCollection = collection;
            Object.assign(state.creds, mongoState.creds);
            state.keys = mongoState.keys;
            patchedConn.ev.on('creds.update', saveCreds);

            // Re-check pairing after mongo load (maybe creds were empty)
            triggerPairing();
        }).catch(err => {
            patchedConn.logger.error({ err }, "MongoDB Auth initialization failed");
        });
    }
    
    return patchedConn;
};
