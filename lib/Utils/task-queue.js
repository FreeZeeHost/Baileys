"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class TaskQueue {
    constructor(logger) {
        this.queue = []
        this.processing = false
        this.logger = logger
    }

    async push(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject })
            this.process()
        })
    }

    async process() {
        if (this.processing || this.queue.length === 0) return
        this.processing = true

        while (this.queue.length > 0) {
            const { task, resolve, reject } = this.queue.shift()
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
                        this.logger.error({ err }, "TaskQueue: Task failed after max retries")
                        reject(err)
                    } else {
                        const wait = retryCount * 2000
                        this.logger.warn({ retryCount, wait }, "TaskQueue: Task failed, retrying...")
                        await delay(wait)
                    }
                }
            }
            
            // Dynamic delay to prevent spam detection
            await delay(500)
        }

        this.processing = false
    }
}

exports.TaskQueue = TaskQueue
