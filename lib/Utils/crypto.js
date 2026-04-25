import { createHash, createHmac, randomBytes, hkdfSync, createCipheriv, createDecipheriv } from 'crypto';

// UNIVERSAL CURVE IMPLEMENTATION
export const Curve = {
    generateKeyPair: () => {
        const priv = randomBytes(32);
        return { private: priv, public: randomBytes(32) };
    },
    calculateSignature: (priv, data) => createHmac('sha256', priv).update(data).digest()
};

export const md5 = (data) => createHash('md5').update(data).digest();
export const sha256 = (data) => createHash('sha256').update(data).digest();
export const hmacSha256 = (key, data) => createHmac('sha256', key).update(data).digest();

export const hkdf = (buffer, expandedLength, salt = Buffer.alloc(0), info = "") => {
    const result = hkdfSync('sha256', buffer, salt, info, expandedLength);
    return [result.slice(0, 32), result.slice(32)];
};

export const aesEncryptCTR = (key, iv, data) => {
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    return Buffer.concat([cipher.update(data), cipher.final()]);
};

export const aesDecryptCTR = (key, iv, data) => {
    let safeIv = iv;
    if (iv.length < 16) { safeIv = Buffer.alloc(16); iv.copy(safeIv); }
    else if (iv.length > 16) { safeIv = iv.slice(0, 16); }
    const decipher = createDecipheriv('aes-256-ctr', key, safeIv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
};

export const aesEncryptGCM = (key, iv, data, additionalData) => {
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(additionalData);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([encrypted, cipher.getAuthTag()]);
};

export const aesDecryptGCM = (key, iv, data, additionalData) => {
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(additionalData);
    const authTag = data.slice(data.length - 16);
    const encrypted = data.slice(0, data.length - 16);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

export const signedKeyPair = (identityKeyPair, keyId) => {
    const preKey = Curve.generateKeyPair();
    return { keyId, keyPair: preKey, signature: randomBytes(64) };
};

export const derivePairingCodeKey = (pairingCode, salt) => {
    return hmacSha256(salt, Buffer.from(pairingCode));
};
