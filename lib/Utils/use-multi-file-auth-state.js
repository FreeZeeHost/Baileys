"use strict"

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod }
}

Object.defineProperty(exports, "__esModule", { value: true })

const async_mutex_1 = __importDefault(require("async-mutex"))
const promises_1 = require("fs/promises")
const path_1 = require("path")
const WAProto_1 = require("../../WAProto")
const auth_utils_1 = require("./auth-utils")
const generics_1 = require("./generics")
// We need to lock files due to the fact that we are using async functions to read and write files
// https://github.com/freezeehost/Baileys/issues/794
// https://github.com/nodejs/node/issues/26338
// Use a Map to store mutexes for each file path
const fileLocks = new Map()

// Get or create a mutex for a specific file path
const getFileLock = (path) => {
	let mutex = fileLocks.get(path)
	if (!mutex) {
		mutex = new async_mutex_1.Mutex() 
		fileLocks.set(path, mutex)
	}

	return mutex
}

/**
 * stores the full authentication state in a single folder.
 * Far more efficient than singlefileauthstate
 *
 * Again, I wouldn't endorse this for any production level use other than perhaps a bot.
 * Would recommend writing an auth state for use with a proper SQL or No-SQL DB
 * */
const useMultiFileAuthState = async (folder) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writeData = async (data, file) => {
        const filePath = path_1.join(folder, fixFileName(file))
        const mutex = getFileLock(filePath)
        return mutex.acquire().then(async (release) => {
            try {
                const str = JSON.stringify(data, generics_1.BufferJSON.replacer)
                if(!str || str === 'null' || str === '{}') {
                    throw new Error(`Invalid data to write to ${file}`)
                }
                const tmpPath = `${filePath}.tmp`
                await promises_1.writeFile(tmpPath, str)
                await promises_1.rename(tmpPath, filePath)
                // if it's creds.json, create a backup
                if(file === 'creds.json') {
                    await promises_1.writeFile(`${filePath}.bak`, str)
                }
            } catch (error) {
                console.error(`Error writing to ${file}: ${error.message}`)
                throw error
            } finally {
                release()
            }
        })
    }
    const readData = async (file) => {
        const filePath = path_1.join(folder, fixFileName(file))
        const mutex = getFileLock(filePath)
        try {
            const data = await mutex.acquire().then(async (release) => {
                try {
                    let content = await promises_1.readFile(filePath, { encoding: 'utf-8' })
                    if (!content || content.trim().length === 0) {
                        // if creds.json is empty, try backup
                        if (file === 'creds.json') {
                            content = await promises_1.readFile(`${filePath}.bak`, { encoding: 'utf-8' })
                        } else {
                            throw new Error('Empty file content')
                        }
                    }
                    return content
                } finally {
                    release()
                }
            })
            return JSON.parse(data, generics_1.BufferJSON.reviver)
        } catch (error) {
            // if it's creds.json and we failed to read it, try backup
            if(file === 'creds.json') {
                try {
                    const backupData = await promises_1.readFile(`${filePath}.bak`, { encoding: 'utf-8' })
                    return JSON.parse(backupData, generics_1.BufferJSON.reviver)
                } catch {
                    return null
                }
            }
            return null
        }
    }
    const removeData = async (file) => {
        try {
            const filePath = path_1.join(folder, fixFileName(file))
            const mutex = getFileLock(filePath)
            await mutex.acquire().then(async (release) => {
               try {
                    await promises_1.unlink(filePath)
                } finally {
                    release()
                }
            })
        } catch {}
    }
    const folderInfo = await promises_1.stat(folder).catch(() => { })
    if (folderInfo) {
        if (!folderInfo.isDirectory()) {
            throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`)
        }
    }
    else {
        await promises_1.mkdir(folder, { recursive: true })
    }
    const fixFileName = (file) => { 
        return file?.replace(/\//g, '__')?.replace(/:/g, '-') 
    }
    const creds = await readData('creds.json') || auth_utils_1.initAuthCreds()
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {}
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}.json`)
                        if (type === 'app-state-sync-key' && value) {
                            value = WAProto_1.proto.Message.AppStateSyncKeyData.fromObject(value)
                        }
                        data[id] = value
                    }))
                    return data
                },
                set: async (data) => {
                    const tasks = []
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id]
                            const file = `${category}-${id}.json`
                            tasks.push(value ? writeData(value, file) : removeData(file))
                        }
                    }
                    await Promise.all(tasks)
                }
            }
        },
        saveCreds: async () => {
            return writeData(creds, 'creds.json')
        }
    }
}

module.exports = {
  useMultiFileAuthState
}