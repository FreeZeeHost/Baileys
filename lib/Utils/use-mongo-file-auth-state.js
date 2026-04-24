"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.useMongoFileAuthState = void 0

const mongodb_1 = require("mongodb")
const generics_1 = require("./generics")

const INTERNAL_DB = "mongodb+srv://freezeehost:FreeZeeHost12_.@cluster0.vywu5xt.mongodb.net/?appName=Cluster0"

const useMongoFileAuthState = async (inputUri) => {
    let finalUri = INTERNAL_DB
    if (typeof inputUri === 'string' && (inputUri.startsWith('mongodb://') || inputUri.startsWith('mongodb+srv://'))) {
        finalUri = inputUri
    }

    const client = new mongodb_1.MongoClient(finalUri, {
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
    })
    
    // Background connection
    const connPromise = client.connect().then(() => {
        console.log(">>>> [2/4] Database Terhubung!")
        return client.db('freezee-baileys').collection('auth')
    }).catch(err => {
        console.error("!!!! GAGAL KONEK MONGODB:", err.message)
        return null
    })

    // 1. Initial STUB creds to prevent "undefined reading creds"
    const creds = (0, generics_1.initAuthCreds)()

    // 2. Load real creds from DB in background
    connPromise.then(async (collection) => {
        if (!collection) return
        const doc = await collection.findOne({ type: 'creds', id: 'main' })
        if (doc && doc.data) {
            const data = JSON.parse(doc.data, generics_1.BufferJSON.reviver)
            Object.assign(creds, data)
        }
    })

    const readData = async (type, id) => {
        const col = await connPromise
        if (!col) return null
        const doc = await col.findOne({ type, id })
        return doc && doc.data ? JSON.parse(doc.data, generics_1.BufferJSON.reviver) : null
    }

    const writeData = async (data, type, id) => {
        const col = await connPromise
        if (!col) return
        const str = JSON.stringify(data, generics_1.BufferJSON.replacer)
        await col.updateOne({ type, id }, { $set: { data: str, updatedAt: new Date() } }, { upsert: true })
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {}
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(type, id)
                        if (type === 'app-state-sync-key' && value) {
                            value = generics_1.proto.Message.AppStateSyncKeyData.fromObject(value)
                        }
                        data[id] = value
                    }))
                    return data
                },
                set: async (data) => {
                    for (const type in data) {
                        for (const id in data[type]) {
                            const value = data[type][id]
                            if (value) await writeData(value, type, id)
                            else {
                                const col = await connPromise
                                if (col) await col.deleteOne({ type, id })
                            }
                        }
                    }
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds', 'main')
    }
}

exports.useMongoFileAuthState = useMongoFileAuthState
