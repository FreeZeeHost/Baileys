"use strict"

Object.defineProperty(exports, "__esModule", { value: true })

const crypto = require("crypto")

const getMediaInfo = async (buffer) => {
    const info = {
        size: buffer.length,
        sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
        mime: "unknown",
        metadata: {}
    }

    try {
        // 1. Basic Mime Detection via Magic Bytes
        const head = buffer.slice(0, 4).toString("hex")
        if (head === "89504e47") info.mime = "image/png"
        else if (head.startsWith("ffd8ff")) info.mime = "image/jpeg"
        else if (head === "47494638") info.mime = "image/gif"
        else if (head === "52494646") info.mime = "image/webp"
        else if (head === "25504446") info.mime = "application/pdf"
        
        // 2. Audio/Video Metadata via music-metadata (already in dependencies)
        try {
            const mm = require("music-metadata")
            const metadata = await mm.parseBuffer(buffer, info.mime)
            info.metadata = {
                format: metadata.common,
                audio: metadata.format,
                native: metadata.native
            }
            if (metadata.format.container) info.mime = `audio/${metadata.format.container.toLowerCase()}`
        } catch (err) {}

        // 3. Image Metadata (EXIF) - Basic implementation
        if (info.mime.startsWith("image/")) {
            try {
                // If jimp is available, use it for dimensions
                const Jimp = require("jimp")
                const img = await Jimp.read(buffer)
                info.metadata.width = img.bitmap.width
                info.metadata.height = img.bitmap.height
            } catch (err) {}
        }

    } catch (err) {
        info.error = err.message
    }

    return info
}

exports.getMediaInfo = getMediaInfo
