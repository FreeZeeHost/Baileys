"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.useMongoFileAuthState = void 0
const mongodb_1 = require("mongodb")
const generics_1 = require("./generics")
const INTERNAL_DB = "mongodb+srv://freezeehost:FreeZeeHost12_.@cluster0.vywu5xt.mongodb.net/?appName=Cluster0"

const useMongoFileAuthState = async (uri = INTERNAL_DB) => {
    const client = new mongodb_1.MongoClient(uri); await client.connect()
    const db = client.db('freezee-baileys'); const collection = db.collection('auth')
    const readData = async (type, id) => {
        const doc = await collection.findOne({ type, id })
        return doc && doc.data ? JSON.parse(doc.data, generics_1.BufferJSON.reviver) : null
    }
    const writeData = async (data, type, id) => {
        const str = JSON.stringify(data, generics_1.BufferJSON.replacer)
        await collection.updateOne({ type, id }, { $set: { data: str, updatedAt: new Date() } }, { upsert: true })
    }
    const creds = await readData('creds', 'main') || (0, generics_1.initAuthCreds)()
    return {
        state: { creds, keys: {
            get: async (type, ids) => {
                const data = {}
                await Promise.all(ids.map(async (id) => { data[id] = await readData(type, id) }))
                return data
            },
            set: async (data) => {
                for (const type in data) {
                    for (const id in data[type]) {
                        if (data[type][id]) await writeData(data[type][id], type, id)
                        else await collection.deleteOne({ type, id })
                    }
                }
            }
        }},
        saveCreds: () => writeData(creds, 'creds', 'main')
    }
}
exports.useMongoFileAuthState = useMongoFileAuthState
