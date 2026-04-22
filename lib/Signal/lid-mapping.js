"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const lru_cache_1 = require("lru-cache")
const WABinary_1 = require("../WABinary")

// Function to create a dummy logger if the provided one is broken
const createSafeLogger = (logger) => {
    const pinoLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
    const safeLogger = logger || {}
    for (const level of pinoLevels) {
        if (typeof safeLogger[level] !== 'function') {
            safeLogger[level] = () => {} // Do nothing
        }
    }
    return safeLogger
}

class LIDMappingStore {
	constructor(keys, onWhatsAppFunc, logger) {
		this.mappingCache = new lru_cache_1.LRUCache({
            ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
            ttlAutopurge: true,
            updateAgeOnGet: true
        })
		this.keys = keys
		this.logger = createSafeLogger(logger)
		this.onWhatsAppFunc = onWhatsAppFunc
	}

    async storeLIDPNMappings(pairs) {
        const pairMap = {}
        for (const { lid, pn } of pairs) {
            if (!((WABinary_1.isLidUser(lid) && WABinary_1.isJidUser(pn)) || (WABinary_1.isJidUser(lid) && WABinary_1.isLidUser(pn)))) {
                this.logger.warn(`Invalid LID-PN mapping: ${lid}, ${pn}`)
                continue
            }
            
            const [lidJid, pnJid] = WABinary_1.isLidUser(lid) ? [lid, pn] : [pn, lid]
            const lidDecoded = WABinary_1.jidDecode(lidJid)
            const pnDecoded = WABinary_1.jidDecode(pnJid)
            
            if (!lidDecoded || !pnDecoded) return
            
            const pnUser = pnDecoded.user
            const lidUser = lidDecoded.user
            
            let existingLidUser = this.mappingCache.get(`pn:${pnUser}`)
            if (!existingLidUser) {
                const stored = await this.keys.get('lid-mapping', [pnUser])
                existingLidUser = stored[pnUser]
            }

            if (existingLidUser !== lidUser) {
                pairMap[pnUser] = lidUser
                this.mappingCache.set(`pn:${pnUser}`, lidUser)
                this.mappingCache.set(`lid:${lidUser}`, pnUser)
            }
        }

        const entries = Object.entries(pairMap)
        if (entries.length) {
            await this.keys.set({ 'lid-mapping': pairMap })
        }
    }

    async getLIDForPN(pn) {
        const pnDecoded = WABinary_1.jidDecode(pn)
        if (!pnDecoded || WABinary_1.isLidUser(pn)) return pn

        const pnUser = pnDecoded.user
        let lidUser = this.mappingCache.get(`pn:${pnUser}`)
        
        if (!lidUser) {
            const stored = await this.keys.get('lid-mapping', [pnUser])
            lidUser = stored[pnUser]
        }

        if (!lidUser && this.onWhatsAppFunc) {
            this.logger.trace(`querying LID for PN: ${pnUser}`)
            try {
                const [result] = await this.onWhatsAppFunc(pn)
                if (result?.exists && result.lid) {
                    lidUser = WABinary_1.jidDecode(result.lid).user
                    await this.storeLIDPNMappings([{ lid: result.lid, pn }])
                }
            } catch (err) {
                this.logger.debug(`failed to query LID for PN: ${pnUser} (${err})`)
            }
        }

        return lidUser ? WABinary_1.jidEncode(lidUser, 'lid') : pn
    }

    async getPNForLID(lid) {
        const lidDecoded = WABinary_1.jidDecode(lid)
        if (!lidDecoded || !WABinary_1.isLidUser(lid)) return lid

        const lidUser = lidDecoded.user
        let pnUser = this.mappingCache.get(`lid:${lidUser}`)

        if (!pnUser) {
            const stored = await this.keys.get('lid-mapping', [lidUser])
            pnUser = stored[lidUser]
        }

        return pnUser ? WABinary_1.jidEncode(pnUser, 's.whatsapp.net') : lid
    }
}

exports.LIDMappingStore = LIDMappingStore
