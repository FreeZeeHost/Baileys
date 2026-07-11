"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const makeMutex = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let task = Promise.resolve()
    return {
        mutex(code) {
            task = (async () => {
                // wait for the previous task to complete
                // if there is an error, we swallow so as to not block the queue
                try {
                    await task
                }
                catch (_a) { }
                
                let timeoutId
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(new Error("Mutex task timed out after 15 seconds"))
                    }, 15000)
                })

                try {
                    // execute the current task
                    const result = await Promise.race([code(), timeoutPromise])
                    return result
                }
                finally {
                    clearTimeout(timeoutId)
                }
            })()
            // we replace the existing task, appending the new piece of execution to it
            // so the next task will have to wait for this one to finish
            return task
        },
    }
}

const makeKeyedMutex = () => {
    const map = {}
    return {
        mutex(key, task) {
            if (!map[key]) {
                map[key] = makeMutex()
            }
            return map[key].mutex(task)
        }
    }
}

module.exports = {
  makeMutex, 
  makeKeyedMutex
}