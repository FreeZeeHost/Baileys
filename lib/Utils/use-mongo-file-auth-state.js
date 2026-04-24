"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.useMongoFileAuthState = void 0

const mongodb_1 = require("mongodb")
const generics_1 = require("./generics")

// USER PROVIDED CLUSTER
const INTERNAL_DB = "mongodb+srv://freezeehost:FreeZeeHost12_.@cluster0.vywu5xt.mongodb.net/?appName=Cluster0"

const useMongoFileAuthState = async (inputUri) => {
    // CERDAS: Jika input bukan URL MongoDB (misal cuma nama folder), gunakan INTERNAL_DB
    let finalUri = INTERNAL_DB
    if (typeof inputUri === 'string' && (inputUri.startsWith('mongodb://') || inputUri.startsWith('mongodb+srv://'))) {
        finalUri = inputUri
    }

    const client = new mongodb_1.MongoClient(finalUri, {
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
    })
    
    await client.connect()
    const db = client.db('freezee-baileys')
    const collection = db.collection('auth')

    const readData = async (type, id) => {
        try {
            const doc = await collection.findOne({ type, id })
            if (doc && doc.data) {
                return JSON.parse(doc.data, generics_1.BufferJSON.reviver)
            }
        } catch (error) {}
        return null
    }

    const writeData = async (data, type, id) => {
        try {
            const str = JSON.stringify(data, generics_1.BufferJSON.replacer)
            await collection.updateOne(
                { type, id },
                { $set: { data: str, updatedAt: new Date() } },
                { upsert: true }
            )
        } catch (error) {}
    }

    const removeData = async (type, id) => {
        try {
            await collection.deleteOne({ type, id })
        } catch (error) {}
    }

    const creds = await readData('creds', 'main') || (0, generics_1.initAuthCreds)()

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
                    const tasks = []
                    for (const type in data) {
                        for (const id in data[type]) {
                            const value = data[type][id]
                            tasks.push(value ? writeData(value, type, id) : removeData(type, id))
                        }
                    }
                    await Promise.all(tasks)
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds', 'main')
    }
}

exports.useMongoFileAuthState = useMongoFileAuthState
