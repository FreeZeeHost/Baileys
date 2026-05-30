"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const http = require("http")

class ApiBridge {
    constructor(sock, port = 3000) {
        this.sock = sock
        this.port = port
        this.server = null
    }

    start() {
        this.server = http.createServer(async (req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`)
            
            res.setHeader("Content-Type", "application/json")

            if (req.method === "GET" && url.pathname === "/stats") {
                const metrics = this.sock.getActivityMetrics ? this.sock.getActivityMetrics() : {}
                res.writeHead(200)
                res.end(JSON.stringify({ success: true, metrics }))
                return
            }

            if (req.method === "POST" && url.pathname === "/send") {
                let body = ""
                req.on("data", chunk => body += chunk)
                req.on("end", async () => {
                    try {
                        const { jid, text, options } = JSON.parse(body)
                        const result = await this.sock.sendMessage(jid, { text }, options)
                        res.writeHead(200)
                        res.end(JSON.stringify({ success: true, messageId: result.key.id }))
                    } catch (err) {
                        res.writeHead(400)
                        res.end(JSON.stringify({ success: false, error: err.message }))
                    }
                })
                return
            }

            res.writeHead(404)
            res.end(JSON.stringify({ success: false, error: "Not Found" }))
        })

        this.server.listen(this.port, () => {
            this.sock.logger.info({ port: this.port }, "Built-in API Bridge: Server started")
        })
    }

    stop() {
        if (this.server) this.server.close()
    }
}

const forwardToWebhook = async (url, data, logger) => {
    if (!url) return
    const https = url.startsWith("https") ? require("https") : require("http")
    const payload = JSON.stringify(data)
    
    const req = https.request(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload)
        }
    }, (res) => {
        res.on("data", () => {}) // Consume response
    })

    req.on("error", (err) => {
        logger.error({ err, url }, "Webhook Bridge: Failed to forward event")
    })

    req.write(payload)
    req.end()
}

exports.ApiBridge = ApiBridge
exports.forwardToWebhook = forwardToWebhook
