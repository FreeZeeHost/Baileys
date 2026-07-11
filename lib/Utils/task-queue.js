"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class TaskQueue {
    constructor(logger) {
        this.queues = new Map()
        this.logger = logger
    }

    async push(key, task) {
        if (typeof key === 'function') {
            task = key
            key = 'default'
        }
        if (!this.queues.has(key)) {
            this.queues.set(key, { queue: [], processing: false })
        }
        const state = this.queues.get(key)
        return new Promise((resolve, reject) => {
            state.queue.push({ task, resolve, reject })
            this.process(key)
        })
    }

    async process(key) {
        const state = this.queues.get(key)
        if (!state || state.processing || state.queue.length === 0) return
        state.processing = true

        while (state.queue.length > 0) {
            const { task, resolve, reject } = state.queue.shift()
            let retryCount = 0
            const maxRetries = 3

            while (retryCount < maxRetries) {
                try {
                    const result = await task()
                    resolve(result)
                    break
                } catch (err) {
                    retryCount++
                    if (retryCount >= maxRetries) {
                        this.logger.error({ err }, `TaskQueue: Task for ${key} failed after max retries`)
                        reject(err)
                    } else {
                        const wait = retryCount * 1500
                        this.logger.warn({ retryCount, wait, err }, `TaskQueue: Task for ${key} failed, retrying...`)
                        await delay(wait)
                    }
                }
            }
            
            // Dynamic delay to prevent spam detection per JID
            await delay(300)
        }

        state.processing = false
        if (state.queue.length === 0) {
            this.queues.delete(key)
        }
    }
}

exports.TaskQueue = TaskQueue
