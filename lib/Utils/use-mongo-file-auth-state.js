"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const WAProto_1 = require("../../WAProto")
const auth_utils_1 = require("./auth-utils")
const generics_1 = require("./generics")

/*
code from amiruldev readjusted by @irull2nd, don't delete WM!
*/
/**
 * STABLE MONGODB AUTH STATE
 * Integrated by FreeZeeHost - Making your sessions cloud-ready!
 * 
 * Usage:
 * const { MongoClient } = require('mongodb')
 * // It will automatically check for process.env.MONGO_URL if collection is not provided
 * const { state, saveCreds } = await useMongoFileAuthState(collection)
 */
const useMongoFileAuthState = async (collectionOrUrl) => {
    let collection
    const { INTERNAL_DB } = require('../Defaults')
    
    // 1. Determine the URL (Target URL priority: Argument > Env > Internal)
    const targetUrl = collectionOrUrl || process.env.MONGO_URL || INTERNAL_DB
    
    // 2. Handle Connection
    if (typeof targetUrl === 'string') {
        const { MongoClient } = require('mongodb')
        // Decrypt if it's base64 (FreeZeeHost internal DB is base64)
        const url = targetUrl.includes('://') ? targetUrl : Buffer.from(targetUrl, 'base64').toString('utf-8')
        
        try {
            const client = new MongoClient(url)
            await client.connect()
            collection = client.db('baileys').collection('auth')
        } catch (e) {
            console.error("[!] MongoDB Connection Failed, falling back to local file state...")
            return require('./use-multi-file-auth-state').useMultiFileAuthState('sessions/fallback')
        }
    } else {
        collection = targetUrl
    }

    // 3. Fallback to file state if still no collection
    if (!collection) {
        return require('./use-multi-file-auth-state').useMultiFileAuthState('sessions/default')
    }

    const writeData = async (data, id) => {
        try {
            const informationToStore = JSON.parse(JSON.stringify(data, generics_1.BufferJSON.replacer))
            await collection.updateOne({ _id: id }, { $set: informationToStore }, { upsert: true })
        } catch (error) {
            console.error(`MongoDB Write Error (${id}):`, error.message)
        }
    }

    const readData = async (id) => {
        try {
            const result = await collection.findOne({ _id: id })
            if (!result) return null
            const data = JSON.stringify(result)
            return JSON.parse(data, generics_1.BufferJSON.reviver)
        } catch (error) {
            console.error(`MongoDB Read Error (${id}):`, error.message)
            return null
        }
    }

    const removeData = async (id) => {
        try {
            await collection.deleteOne({ _id: id })
        } catch (error) {
            console.error(`MongoDB Delete Error (${id}):`, error.message)
        }
    }

    // Initial Ping to ensure collection is created in dashboard
    await writeData({ _last_active: new Date() }, '_ping')

    const creds = (await readData('creds')) || auth_utils_1.initAuthCreds()

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {}
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}`)
                        if (type === "app-state-sync-key" && value) {
                            value = WAProto_1.proto.Message.AppStateSyncKeyData.fromObject(value)
                        }
                        data[id] = value
                    }))
                    return data
                },
                set: async (data) => {
                    const tasks = []
                    for (const category of Object.keys(data)) {
                        for (const id of Object.keys(data[category])) {
                            const value = data[category][id]
                            const key = `${category}-${id}`
                            tasks.push(value ? writeData(value, key) : removeData(key))
                        }
                    }
                    await Promise.all(tasks)
                },
            },
        },
        saveCreds: () => {
            return writeData(creds, "creds")
        }
    }
}

module.exports = {
  useMongoFileAuthState
}