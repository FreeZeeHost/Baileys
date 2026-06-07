"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const WAProto_1 = require("../../WAProto")
const auth_utils_1 = require("./auth-utils")
const generics_1 = require("./generics")

/*
code from amiruldev readjusted by @irull2nd, don't delete WM!
*/
const useMongoFileAuthState = async (collection) => {
  const memoryCache = new Map()

  const writeData = (data, id) => {
    memoryCache.set(id, data)
    const informationToStore = JSON.parse(
      JSON.stringify(data, generics_1.BufferJSON.replacer)
    )
    const update = {
      $set: {
        ...informationToStore,
      },
    }

    return collection.updateOne({_id: id}, update, {upsert: true})
  }

  const readData = async (id) => {
    if (memoryCache.has(id)) {
      return memoryCache.get(id)
    }
    try {
      const doc = await collection.findOne({_id: id})
      if (!doc) return null
      const data = JSON.stringify(doc)
      const decoded = JSON.parse(data, generics_1.BufferJSON.reviver)
      memoryCache.set(id, decoded)
      return decoded
    } catch (err) {
      console.log(err)
      return null
    }
  }

  const removeData = async (id) => {
    memoryCache.delete(id)
    try {
      await collection.deleteOne({_id: id})
    } catch (err) {
      console.log('error', err)
    }
  }

  const creds = (await readData('creds')) || auth_utils_1.initAuthCreds()

   return{
    collection,
    state:{
      creds,
      keys: {
        get: async (type,ids)=> {
          const data = {}
          await Promise
          .all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`)
              if(type === "app-state-sync-key" && value){
                value = WAProto_1.proto.Message.AppStateSyncKeyData.fromObject(value)
              }
              data[id] = value
            })
          )
          return data
        },
        set: async (data) => {
          const tasks = []
          for (const category of Object.keys(data)){
            for (const id of Object.keys(data[category])){
              const value = data[category][id]
              const key = `${category}-${id}`
              tasks.push(value? writeData(value,key) : removeData(key))
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