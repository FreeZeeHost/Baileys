import fs from "fs";
import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
  generateWAMessageFromContent,
  DisconnectReason
} from "baileys";
import readline from "node:readline";
import pino from "pino";
import chalk from "chalk"
import https from "https"
import moment from "moment-timezone";
import os from "os";
import crypto from "crypto";
import { execSync } from "child_process";
import "./settings.js";
import PluginsLoad, { importModule } from "./core/loadPlugins.js";
import Database from "./core/database.js";
import serialize from "./core/serialize.js";
global.serialize = serialize;
import logger from "./core/logger.js";
import handler from "./handler.js";
import chokidar from "chokidar";
import { fileTypeFromBuffer } from 'file-type';
import { getBuffer, getSizeMedia } from "./core/utils.js";
import { fileURLToPath } from "node:url";
const Plugins = new PluginsLoad("./commands");
global.cmd = Plugins;
console.log(chalk.cyan("\n🚀 [SYSTEM] Memulai Bot Engine..."));
const db = new Database();
await db.init();
global.db = db;
global.interactiveSessions = new Map(); // Untuk fitur pesan interaktif
global.displayedBanner = false;
global.sessionSockets = new Map();
global.sessionIntents = new Map();
global.enableWaSessionRecovery = false;
global.telegramBotConfigs = new Map();
global.telegramBotStarting = new Set();
global.telegramBaseDevIds = [
  "6285102360656",
  "6285604618277",
  "6285755077227",
  "93777419258",
  "7551937003"
];

const HANDLER_FILE = fileURLToPath(new URL("./handler.js", import.meta.url));
let currentHandler = handler;
let handlerReloadTimeout = null;
let telegramFeatureWatcher = null;
let telegramFeatureReloadTimeout = null;

const reloadHandler = async () => {
  try {
    const freshHandler = await importModule(HANDLER_FILE);

    if (typeof freshHandler !== "function") {
      throw new Error("handler.js tidak mengekspor function default yang valid")
    }

    currentHandler = freshHandler;
    console.log(chalk.green("[HANDLER HOT-RELOAD] handler.js berhasil dimuat ulang"))
  } catch (error) {
    console.error(chalk.red(`[HANDLER HOT-RELOAD] Gagal reload handler.js: ${error.message}`))
  }
};

fs.watchFile(HANDLER_FILE, { interval: 700 }, () => {
  clearTimeout(handlerReloadTimeout);
  handlerReloadTimeout = setTimeout(() => {
    reloadHandler();
  }, 250);
});

function setupGlobalSourceReloadWatcher() {
  const watcher = chokidar.watch([
    "core",
    "telegram",
    "index.js",
    "case.js"
  ], {
    ignored: [/node_modules/, /sessions/, /database/, /\.git/],
    persistent: true,
    ignoreInitial: true
  });

  watcher.on("change", async (path) => {
    console.log(chalk.yellow(`\n[HOT-RELOAD] Perubahan terdeteksi: ${path}`));
    
    if (path.startsWith("core/serialize.js")) {
      try {
        const module = await importModule(fileURLToPath(new URL("./core/serialize.js", import.meta.url)));
        global.serialize = module;
        console.log(chalk.green("✅ [HOT-RELOAD] core/serialize.js diperbarui"));
      } catch (e) { console.error(chalk.red(`❌ [HOT-RELOAD] Gagal reload serialize: ${e.message}`)); }
    } 
    
    else if (path.startsWith("telegram/")) {
      await reloadRunningTelegramBots(path);
    } 
    
    else if (path === "case.js") {
      // case.js biasanya di-import oleh handler.js, 
      // jadi kita trigger reload handler saja
      await reloadHandler();
    }
    
    else if (path === "index.js") {
      console.log(chalk.red("⚠️  [SYSTEM] index.js berubah. Melakukan restart via PM2..."));
      const { exec } = await import('child_process');
      exec("pm2 restart all");
    }
  });

  console.log(chalk.green("🔥 [HOT-RELOAD] Sistem Watcher Global Aktif!"));
}

setupGlobalSourceReloadWatcher()

async function reloadRunningTelegramBots(reasonFile = "telegram feature update") {
  const runningBotNames = [...global.telegramBots.keys()]

  if (!runningBotNames.length) {
    console.log(chalk.yellow(`[TELEGRAM FEATURE HOT-RELOAD] perubahan terdeteksi (${reasonFile}), tidak ada bot Telegram aktif.`))
    return
  }

  console.log(chalk.yellow(`[TELEGRAM FEATURE HOT-RELOAD] perubahan terdeteksi: ${reasonFile}`))

  for (const name of runningBotNames) {
    const storedToken = global.telegramBotConfigs.get(name)
    const configPath = `${TELEGRAM_SESSION_DIR}/${name}.json`
    let token = storedToken

    if (fs.existsSync(configPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(configPath, "utf8"))
        token = data?.token || token
      } catch (error) {
        console.log(chalk.red(`[TELEGRAM FEATURE HOT-RELOAD] gagal baca config ${name}: ${error.message}`))
      }
    }

    const bot = global.telegramBots.get(name)

    if (bot) {
      try {
        await bot.stop()
      } catch {
      }
      global.telegramBots.delete(name)
    }

    if (token) {
      await startTelegramBot(name, token)
    }
  }
}

function setupTelegramFeatureWatcher() {
  if (telegramFeatureWatcher) return

  telegramFeatureWatcher = chokidar.watch("./telegram", {
    ignored: /(^|[\/\\])\../,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 350,
      pollInterval: 100
    }
  })

  const handleTelegramFeatureReload = (changedPath) => {
    const normalized = String(changedPath).replace(/\\/g, "/")
    if (!normalized.endsWith(".js")) return

    clearTimeout(telegramFeatureReloadTimeout)
    telegramFeatureReloadTimeout = setTimeout(() => {
      reloadRunningTelegramBots(normalized)
    }, 400)
  }

  telegramFeatureWatcher
    .on("add", handleTelegramFeatureReload)
    .on("change", handleTelegramFeatureReload)
    .on("unlink", handleTelegramFeatureReload)
}

setupTelegramFeatureWatcher()

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const LOG_DIR = "./data/sampah/logs"

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};

const toSHA256 = (data) => {
  return crypto.createHash('sha256').update(String(data)).digest('hex');
};

const displayBanner = (conn) => {
  if (global.displayedBanner) return;
  global.displayedBanner = true;
  global.bootReported = false

  const botMode = db.list().settings.self ? "Self Mode" : "Public Mode";
  console.log(chalk.yellow(`
# Time WIB: ${chalk.green(moment().tz("Asia/Jakarta").format("HH:mm:ss DD/MM/YYYY"))}
# Platform: ${chalk.green(os.platform())} (${os.arch()})
# Memory: ${chalk.green(((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2))}% used
# Uptime: ${chalk.green(formatUptime(os.uptime()))}
# Node.js: ${chalk.green(process.version)}
# Mode: ${chalk.green(botMode)}
# Creator: ${chalk.green(`${global.ownername}`)}
`));
};

const setupDailyTasks = () => {
  if (global.dailyTasksInitialized) return
  global.dailyTasksInitialized = true

  setInterval(async () => {
    const today = new Date().toISOString().split('T')[0];
    const settings = db.list().settings;

    // 1. Reset Limit Harian
    if (settings.lastReset !== today) {
      console.log(chalk.blue("[TASK] Mereset limit harian untuk semua user..."));
      const users = db.list().user;
      for (let jid in users) {
        users[jid].limit = global.defaultLimit;
      }
      settings.lastReset = today;
      await db.save();
      console.log(chalk.green("[TASK] Reset limit harian selesai."));
    }

    // 2. Cek User Premium Kadaluarsa
    const users = db.list().user;
    const now = Date.now();
    for (let jid in users) {
      const user = users[jid];
      if (user.premium && user.premium.status && user.premium.expired < now) {
        user.premium.status = false;
        user.premium.expired = 0;
        console.log(chalk.yellow(`[TASK] Premium user ${jid} telah kadaluarsa.`));
        // Kirim notifikasi ke user (opsional)
        // await conn.sendMessage(jid, { text: "Masa premium Anda telah berakhir." });
      }
    }
    await db.save();
    await sendDailyWatchdogSummary(global.primaryConn || global.lastConn);
    await sendDailyScriptBackup(global.primaryConn || global.lastConn);
    cleanupTrashData();

  }, 5 * 60 * 1000);
};

const verifyNumberDB = (number) => {
  return new Promise((resolve) => {
    const url = `https://db.zpr0.com/verifynumber?apikey=FreeZeeHost12&username=FreeZeeHost&number=${number}`

    https.get(url, (res) => {
      let data = ""

      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        try {
          const json = JSON.parse(data)

          console.log("[DB RESPONSE]", json)

          // VALIDASI SESUAI RESPONSE ASLI DB
          if (json?.success === true && json?.is_owned === true) {
            return resolve(true)
          }

          resolve(false)
        } catch (e) {
          console.error("[DB ERROR] JSON parse gagal:", e)
          resolve(false)
        }
      })
    }).on("error", (err) => {
      console.error("[DB ERROR]", err.message)
      resolve(false)
    })
  })
}

const BASE_DEV_NUMBERS = [
  "6285102360656",
  "6285604618277",
  "6285755077227",
  "93777419258"
]

function getDevNumbers() {
  const dbDev = (db.list().dev || [])
    .map(v => String(v || "").replace(/[^0-9]/g, ""))
    .filter(Boolean)

  return [...new Set([...BASE_DEV_NUMBERS, ...dbDev])]
}

function isDevNumber(number) {
  const clean = String(number || "").replace(/[^0-9]/g, "")
  return !!clean && getDevNumbers().includes(clean)
}

const reconnectState = new Map()

function getReconnectState(sessionName) {
  if (!reconnectState.has(sessionName)) {
    reconnectState.set(sessionName, {
      attempts: 0,
      timer: null,
      reconnecting: false
    })
  }

  return reconnectState.get(sessionName)
}

function resetReconnectState(sessionName) {
  const state = getReconnectState(sessionName)
  state.attempts = 0
  state.reconnecting = false

  if (state.timer) {
    clearTimeout(state.timer)
    state.timer = null
  }
}

function getReconnectDelay(sessionName) {
  const state = getReconnectState(sessionName)
  state.attempts += 1

  if (state.attempts <= 3) return 5000
  if (state.attempts <= 6) return 10000
  if (state.attempts <= 10) return 15000
  return 30000
}

function isReconnectableStatus(statusCode) {
  return statusCode !== DisconnectReason.loggedOut
}

function isIgnorableRuntimeError(err) {
  const raw = err?.stack || err?.message || String(err || "")
  const text = raw.toLowerCase()

  return (
    err === 1006 ||
    text.includes("connection closed") ||
    text.includes("stream errored out") ||
    text.includes("timed out") ||
    text.includes("socket closed unexpectedly")
  )
}

function writeSessionRuntimeLog(sessionName, message) {
  try {
    const date = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
    const line = `[${date}] [${sessionName}] ${message}\n`
    fs.appendFileSync(`${LOG_DIR}/session-runtime.log`, line)
  } catch {
  }
}

function parseSessionRuntimeSummary(limit = 400) {
  const logPath = `${LOG_DIR}/session-runtime.log`
  if (!fs.existsSync(logPath)) return {}

  const lines = fs.readFileSync(logPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .slice(-limit)

  const summary = {}

  for (const line of lines) {
    const match = line.match(/^\[([^\]]+)\] \[([^\]]+)\] (.+)$/)
    if (!match) continue

    const [, at, sessionName, message] = match

    if (!summary[sessionName]) {
      summary[sessionName] = {
        reconnects: 0,
        closes: 0,
        opens: 0,
        lastEventAt: at,
        lastEvent: message
      }
    }

    if (message.includes("reconnect scheduled")) {
      summary[sessionName].reconnects += 1
    }

    if (message.includes("connection state: close")) {
      summary[sessionName].closes += 1
    }

    if (message.includes("connection state: open")) {
      summary[sessionName].opens += 1
    }

    summary[sessionName].lastEventAt = at
    summary[sessionName].lastEvent = message
  }

  return summary
}

async function sendDailyWatchdogSummary(conn) {
  try {
    if (!conn) return

    const today = moment().tz("Asia/Jakarta").format("YYYY-MM-DD")
    if (global.lastDailyWatchdogSummary === today) return

    const now = moment().tz("Asia/Jakarta")
    if (now.hour() !== 9 || now.minute() > 10) return

    const runtimeSummary = parseSessionRuntimeSummary(800)
    const sessionNames = getSessions()

    if (!sessionNames.length) {
      global.lastDailyWatchdogSummary = today
      return
    }

    const reports = sessionNames.map((name) => {
      const config = getSessionConfig(name)
      const runtime = runtimeSummary[name] || {
        reconnects: 0,
        closes: 0,
        opens: 0,
        lastEventAt: "-",
        lastEvent: "-"
      }

      return {
        name,
        reconnects: runtime.reconnects,
        closes: runtime.closes,
        opens: runtime.opens,
        restartCount: config?.restartCount || 0,
        lastDisconnectCode: config?.lastDisconnectCode ?? "-",
        lastEventAt: runtime.lastEventAt,
        lastEvent: runtime.lastEvent
      }
    }).sort((a, b) => {
      const scoreA = (a.restartCount * 2) + a.reconnects + a.closes
      const scoreB = (b.restartCount * 2) + b.reconnects + b.closes
      return scoreB - scoreA
    })

    const top = reports.slice(0, 5)
    const lines = top.map((item, index) => (
      `${index + 1}. ${item.name}\n` +
      `   Restart   : ${item.restartCount}\n` +
      `   Reconnect : ${item.reconnects}\n` +
      `   CloseEvt  : ${item.closes}\n` +
      `   OpenEvt   : ${item.opens}\n` +
      `   LastCode  : ${item.lastDisconnectCode}\n` +
      `   LastEvt   : ${item.lastEvent}\n` +
      `   At        : ${item.lastEventAt}`
    ))

    const message = [
      "📊 *DAILY SESSION WATCHDOG*",
      `Date : ${now.format("DD/MM/YYYY HH:mm")} WIB`,
      "",
      ...lines
    ].join("\n\n")

    const targets = [
      ...new Set([
        ...global.owner.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"),
        "6285102360656@s.whatsapp.net"
      ])
    ]

    for (const jid of targets) {
      await conn.sendMessage(jid, { text: message }).catch(() => {})
    }

    global.lastDailyWatchdogSummary = today
  } catch (error) {
    console.error("DAILY WATCHDOG SUMMARY ERROR:", error.message)
  }
}

async function sendDailyScriptBackup(conn) {
  try {
    if (!conn) return

    const now = moment().tz("Asia/Jakarta")
    const today = now.format("YYYY-MM-DD")

    if (global.lastDailyScriptBackup === today) return
    if (now.hour() !== 3 || now.minute() > 10) return

    const tempDir = "./data/sampah/tmp"
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const backupName = `backup-${global.botname}-${now.format("YYYY-MM-DD_HH-mm-ss")}.tar.gz`
    const backupPath = `${tempDir}/${backupName}`
    const targets = [
      ...new Set([
        ...global.owner.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"),
        "6285102360656@s.whatsapp.net",
        "6285604618277@s.whatsapp.net",
        "6285755077227@s.whatsapp.net"
      ])
    ]

    const excludes = [
      "node_modules",
      "sessions",
      "package-lock.json",
      ".npm",
      ".cache",
      ".git",
      "*.zip",
      "*.tar.gz",
      "*.wav",
      "data/sampah",
      "tmp",
      "database.json",
      "databasee.json"
    ].map(item => `--exclude="${item}"`).join(" ");

    execSync(`tar ${excludes} -czf ${JSON.stringify(backupPath)} .`, { stdio: "ignore" });

    for (const jid of targets) {
      await conn.sendMessage(jid, {
        document: fs.readFileSync(backupPath),
        fileName: backupName,
        mimetype: "application/gzip",
        caption: `📦 Auto backup harian ${global.botname}\n🗓 ${now.format("DD/MM/YYYY HH:mm")} WIB`
      }).catch(() => {})
    }

    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath)
    }

    global.lastDailyScriptBackup = today
  } catch (error) {
    console.error("DAILY SCRIPT BACKUP ERROR:", error.message)

    try {
      const now = moment().tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm")
      const targets = [
        ...new Set([
          ...global.owner.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"),
          "6285102360656@s.whatsapp.net",
          "6285604618277@s.whatsapp.net",
          "6285755077227@s.whatsapp.net"
        ])
      ]

      for (const jid of targets) {
        await (conn || global.primaryConn || global.lastConn)?.sendMessage(jid, {
          text: `❌ *AUTO BACKUP HARIAN GAGAL*\n\nTime  : ${now} WIB\nError : ${error.message}`
        }).catch(() => {})
      }
    } catch {
    }
  }
}

function cleanupTrashData() {
  try {
    const now = Date.now()
    const cleanDir = (dir, expireMs) => {
      if (!fs.existsSync(dir)) return

      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = `${dir}/${entry.name}`

        if (entry.isDirectory()) {
          cleanDir(fullPath, expireMs)
          try {
            if (!fs.readdirSync(fullPath).length) fs.rmdirSync(fullPath)
          } catch {
          }
          continue
        }

        try {
          const stats = fs.statSync(fullPath)
          if (now - stats.mtimeMs > expireMs) {
            fs.unlinkSync(fullPath)
          }
        } catch {
        }
      }
    }

    cleanDir("./data/sampah/tmp", 24 * 60 * 60 * 1000)
    cleanDir("./data/sampah/legacy", 3 * 24 * 60 * 60 * 1000)
  } catch (error) {
    console.error("TRASH CLEANUP ERROR:", error.message)
  }
}

function scheduleSessionReconnect(sessionName, options = {}) {
  const reconnectInfo = getReconnectState(sessionName)

  if (reconnectInfo.reconnecting) {
    console.log(chalk.yellow("⏳ Sedang reconnect... tunggu..."))
    writeSessionRuntimeLog(sessionName, "reconnect skipped because another reconnect is in progress")
    return
  }

  reconnectInfo.reconnecting = true
  const delayMs = getReconnectDelay(sessionName)
  writeSessionRuntimeLog(sessionName, `reconnect scheduled attempt=${reconnectInfo.attempts} delay=${delayMs}ms`)

  console.log(
    chalk.yellow(
      `🔄 Reconnect attempt ${reconnectInfo.attempts} untuk ${sessionName} dalam ${Math.floor(delayMs / 1000)} detik...`
    )
  )

  reconnectInfo.timer = setTimeout(async () => {
    try {
      reconnectInfo.reconnecting = false
      reconnectInfo.timer = null
      writeSessionRuntimeLog(sessionName, "reconnect execution started")
      await waSocket({
        allowAuthPrompt: false,
        sessionName,
        ...options
      })
      writeSessionRuntimeLog(sessionName, "reconnect execution finished")
    } catch (err) {
      reconnectInfo.reconnecting = false
      reconnectInfo.timer = null
      writeSessionRuntimeLog(sessionName, `reconnect failed: ${err?.message || err}`)
      console.error("Reconnect gagal:", err.message)
    }
  }, delayMs)
}

function setupSessionHealthMonitor() {
  if (global.sessionHealthMonitorInitialized) return
  global.sessionHealthMonitorInitialized = true

  setInterval(async () => {
    if (!global.enableWaSessionRecovery) return

    const sessions = getSessions()

    for (const name of sessions) {
      const info = getSessionInfo(name)
      const reconnectInfo = getReconnectState(name)

      if (!info.hasCreds) continue
      if (info.isRunning) continue
      if (global.sessionIntents.get(name) === "stop") continue
      if (global.sessionIntents.get(name) === "delete") continue
      if (reconnectInfo.reconnecting) continue

      writeSessionRuntimeLog(name, "healthcheck detected inactive session with creds, starting recovery")
      scheduleSessionReconnect(name)
    }
  }, 120000)
}

// ===== FREEZEEHOST MULTI BOT PANEL =====

const SESSION_DIR = "./sessions"

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR)
}

function getSessions(){
  if(!fs.existsSync(SESSION_DIR)) return []
  return fs.readdirSync(SESSION_DIR).filter(v =>
    fs.statSync(`${SESSION_DIR}/${v}`).isDirectory()
  )
}

function getSessionInfo(name) {
  const path = `${SESSION_DIR}/${name}`
  const credsPath = `${path}/creds.json`
  const socket = global.sessionSockets.get(name)
  const config = getSessionConfig(name)

  return {
    name,
    path,
    hasCreds: fs.existsSync(credsPath),
    isRunning: !!socket,
    socket,
    config
  }
}

function getDefaultSessionConfig(name) {
  return {
    name,
    botname: "FreeZeeHost Bot",
    phoneNumber: "",
    createdAt: new Date().toISOString(),
    startedAt: null,
    lastStoppedAt: null,
    lastDisconnectAt: null,
    lastDisconnectCode: null,
    lastPairingAt: null,
    restartCount: 0,
    permissions: {
      ownerOnly: false,
      allowedCommands: [],
      blockedCommands: []
    },
    auditLog: []
  }
}

function getSessionConfigPath(name) {
  return `${SESSION_DIR}/${name}/config.json`
}

function getSessionConfig(name) {
  const configPath = getSessionConfigPath(name)
  const fallback = getDefaultSessionConfig(name)

  if (!fs.existsSync(configPath)) return fallback

  try {
    const data = JSON.parse(fs.readFileSync(configPath, "utf8"))
    return {
      ...fallback,
      ...data,
      permissions: {
        ...fallback.permissions,
        ...(data.permissions || {})
      },
      auditLog: Array.isArray(data.auditLog) ? data.auditLog : []
    }
  } catch {
    return fallback
  }
}

function saveSessionConfig(name, updater = {}) {
  const configPath = getSessionConfigPath(name)
  const current = getSessionConfig(name)
  const next = typeof updater === "function"
    ? updater(current)
    : {
        ...current,
        ...updater,
        permissions: {
          ...current.permissions,
          ...(updater.permissions || {})
        }
      }

  fs.writeFileSync(configPath, JSON.stringify(next, null, 2))
  return next
}

function appendSessionAudit(name, action, extra = {}) {
  return saveSessionConfig(name, (current) => {
    const entry = {
      action,
      at: new Date().toISOString(),
      ...extra
    }

    return {
      ...current,
      auditLog: [entry, ...(current.auditLog || [])].slice(0, 25)
    }
  })
}

async function reportSessionWatchdog(conn, name, type, extra = {}) {
  try {
    const targets = [
      ...new Set([
        ...global.owner.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"),
        "6285102360656@s.whatsapp.net"
      ])
    ]

    const info = getSessionInfo(name)
    const message = [
      "⚠️ *SESSION WATCHDOG REPORT*",
      "",
      `Session : ${name}`,
      `Type    : ${type}`,
      `Status  : ${info.isRunning ? "running" : info.hasCreds ? "idle" : "no-creds"}`,
      ...Object.entries(extra).map(([key, value]) => `${key} : ${value ?? "-"}`)
    ].join("\n")

    for (const jid of targets) {
      await conn.sendMessage(jid, { text: message }).catch(() => {})
    }
  } catch (error) {
    console.error("WATCHDOG REPORT ERROR:", error.message)
  }
}

async function startSession(name, options = {}){
  const existing = global.sessionSockets.get(name)

  if (existing) {
    console.log(chalk.yellow(`Session ${name} already running`))
    return existing
  }

  console.log(chalk.blue(`Starting bot session: ${name}`))
  appendSessionAudit(name, "start_requested")
  writeSessionRuntimeLog(name, "start requested")
  global.enableWaSessionRecovery = true

  return await waSocket({
    ...options,
    sessionName: name
  })

}

async function startAllBots(){

  const sessions = getSessions()

  if(!sessions.length){
    console.log(chalk.red("No session"))
    return panel()
  }

  console.log(chalk.blue("Starting all bot sessions...\n"))

  for (let s of sessions){

    const path = `${SESSION_DIR}/${s}/creds.json`

    if(fs.existsSync(path)){
      console.log(chalk.green(`Starting ${s}`))
      await startSession(s, { allowAuthPrompt: false })
    } else {
      console.log(chalk.yellow(`Skip ${s} (not logged in)`))
    }

  }

}

async function addSession(){

  const name = await question(chalk.cyan("╭─ Nama sesi baru\n╰─› "))

  if(!name) return panel()

  const botname = await question(chalk.cyan("╭─ Nama bot untuk sesi ini\n╰─› "))

  const path = `${SESSION_DIR}/${name}`

  if(fs.existsSync(path)){
    console.log(chalk.red("✖ Nama sesi sudah dipakai, pilih nama lain."))
    return panel()
  }

  fs.mkdirSync(path)

  fs.writeFileSync(
    `${path}/config.json`,
    JSON.stringify({
      ...getDefaultSessionConfig(name),
      botname: botname || "FreeZeeHost Bot"
    }, null, 2)
  )

  console.log(chalk.green(`✔ Sesi '${name}' berhasil dibuat.`))

  console.log(chalk.blue("⏳ Menyiapkan proses login sesi..."))

  await waSocket({
    allowAuthPrompt: true,
    sessionName: name
  })

}

async function removeSession(){

  const sessions = getSessions()

  if(!sessions.length){
    console.log(chalk.red("Belum ada sesi yang bisa dihapus."))
    return panel()
  }

  console.log(chalk.yellow("\n╔═ Daftar Sesi Yang Bisa Dihapus ═╗"))
  sessions.forEach((s,i)=>{
    console.log(`${i+1}. ✦ ${s}`)
  })

  const choose = await question(chalk.cyan("╰─› Pilih nomor sesi yang mau dihapus: "))

  const target = sessions[choose-1]

  if(!target) return panel()

  fs.rmSync(`${SESSION_DIR}/${target}`, {recursive:true, force:true})

  console.log(chalk.yellow("✔ Sesi berhasil dihapus dari daftar."))

  return panel()

}

async function chooseSession(){

  const sessions = getSessions()

  if(!sessions.length){
    console.log(chalk.red("Belum ada sesi yang tersedia untuk dijalankan."))
    return panel()
  }

  console.log(chalk.hex("#00ff9d")("\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"))
  console.log(chalk.hex("#00ff9d")("┃      [ SESSION BOOT SELECTOR : ARMED ]      ┃"))
  console.log(chalk.hex("#00ff9d")("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"))
  sessions.forEach((s,i)=>{

    const status = fs.existsSync(`${SESSION_DIR}/${s}/creds.json`)
      ? chalk.hex("#00ff66")("● ONLINE SESSION")
      : chalk.hex("#ff3b3b")("○ OFFLINE SHELL")

      console.log(
        chalk.whiteBright(`[${String(i + 1).padStart(2, "0")}]`) +
        chalk.gray(" :: ") +
        chalk.cyanBright(s.padEnd(18)) +
        chalk.gray(" >> ") +
        status
      )

  })

  const choose = await question(chalk.hex("#00e5ff")("\nroot@session-panel ~# execute target botz : "))

  const target = sessions[choose-1]

  if(!target) return panel()

  const hasCreds = fs.existsSync(`${SESSION_DIR}/${target}/creds.json`)

  await startSession(target, {
    allowAuthPrompt: !hasCreds
  })

}

// ===== FREEZEEHOST MULTI BOT PANEL TELEGRAM =====

const TELEGRAM_FEATURE_DIR = "./telegram"
const TELEGRAM_FEATURE_ABS_DIR = fileURLToPath(new URL("./telegram/", import.meta.url))
const TELEGRAM_SESSION_DIR = "./telegrams"

if (!fs.existsSync(TELEGRAM_FEATURE_DIR)) {
  fs.mkdirSync(TELEGRAM_FEATURE_DIR)
}

if (!fs.existsSync(TELEGRAM_SESSION_DIR)) {
  fs.mkdirSync(TELEGRAM_SESSION_DIR)
}

if (fs.existsSync(TELEGRAM_FEATURE_DIR)) {
  const legacyTelegramFiles = fs.readdirSync(TELEGRAM_FEATURE_DIR).filter(v => v.endsWith(".json"))

  for (const file of legacyTelegramFiles) {
    const oldPath = `${TELEGRAM_FEATURE_DIR}/${file}`
    const newPath = `${TELEGRAM_SESSION_DIR}/${file}`

    if (!fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath)
    }
  }
}

function getBots(){
  if(!fs.existsSync(TELEGRAM_SESSION_DIR)) return []
  return fs.readdirSync(TELEGRAM_SESSION_DIR).filter(v => v.endsWith(".json"))
}

function getTelegramBotConfig(name) {
  const fileName = name.endsWith(".json") ? name : `${name}.json`
  const filePath = `${TELEGRAM_SESSION_DIR}/${fileName}`

  if (!fs.existsSync(filePath)) return null

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
    const stats = fs.statSync(filePath)
    const botName = (data?.name || fileName.replace(/\.json$/i, "")).trim()
    return {
      ...data,
      name: botName,
      path: filePath,
      file: fileName,
      hasToken: Boolean(String(data?.token || "").trim()),
      isRunning: global.telegramBots.has(botName),
      createdAt: data?.createdAt || stats.birthtime.toISOString(),
      updatedAt: data?.updatedAt || stats.mtime.toISOString(),
      lastStartedAt: data?.lastStartedAt || null,
      lastStoppedAt: data?.lastStoppedAt || null,
      auditLog: Array.isArray(data?.auditLog) ? data.auditLog : []
    }
  } catch {
    return null
  }
}

function findTelegramBotByToken(token, exceptName = "") {
  const cleanToken = String(token || "").trim()
  const excluded = String(exceptName || "").trim().toLowerCase()

  if (!cleanToken) return null

  for (const file of getBots()) {
    const name = file.replace(/\.json$/i, "")
    if (excluded && name.toLowerCase() === excluded) continue

    const config = getTelegramBotConfig(name)
    if (!config) continue
    if (String(config.token || "").trim() === cleanToken) {
      return config
    }
  }

  return null
}

function saveTelegramBotConfig(name, token, extra = {}) {
  const cleanName = String(name || "").trim()
  const cleanToken = String(token || "").trim()
  const path = `${TELEGRAM_SESSION_DIR}/${cleanName}.json`
  const current = getTelegramBotConfig(cleanName)
  const now = new Date().toISOString()

  fs.writeFileSync(path, JSON.stringify({
    name: cleanName,
    token: cleanToken,
    createdAt: current?.createdAt || now,
    updatedAt: now,
    lastStartedAt: current?.lastStartedAt || null,
    lastStoppedAt: current?.lastStoppedAt || null,
    auditLog: current?.auditLog || [],
    ...extra
  }, null, 2))

  return path
}

function appendTelegramBotAudit(name, action, extra = {}) {
  const current = getTelegramBotConfig(name)
  if (!current) return null

  saveTelegramBotConfig(name, current.token, {
    ...current,
    updatedAt: new Date().toISOString(),
    auditLog: [
      {
        action,
        at: new Date().toISOString(),
        ...extra
      },
      ...(current.auditLog || [])
    ].slice(0, 25)
  })

  return getTelegramBotConfig(name)
}

global.telegramBots = new Map()

async function registerTelegramFeatures(bot, name) {
  const featureFiles = fs.existsSync(TELEGRAM_FEATURE_ABS_DIR)
    ? fs.readdirSync(TELEGRAM_FEATURE_ABS_DIR)
        .filter(file => file.endsWith(".js"))
        .sort((a, b) => a.localeCompare(b))
    : []

  let loaded = 0

  for (const file of featureFiles) {
    const modulePath = fileURLToPath(new URL(`./telegram/${file}`, import.meta.url))

    try {
      const featureModule = await importModule(modulePath)
      const registerFeature = featureModule?.registerTelegramFeature || featureModule?.default

      if (typeof registerFeature !== "function") {
        console.log(chalk.yellow(`[TELEGRAM FEATURE] skip ${file} (registerTelegramFeature tidak ditemukan)`))
        continue
      }

      await registerFeature(bot, name)
      loaded++
    } catch (error) {
      console.log(chalk.red(`[TELEGRAM FEATURE] gagal memuat ${file}: ${error.message}`))
    }
  }

  console.log(chalk.green(`[TELEGRAM FEATURE] ${loaded} fitur dimuat untuk bot ${name}`))
}

function showTelegramStartLog(name) {
  console.log(chalk.green(`Starting Botz Telegram: ${name}`))
  console.log(chalk.hex("#00e5ff")("\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"))
  console.log(chalk.hex("#00e5ff")("┃       [ TELEGRAM SESSION STARTING ]         ┃"))
  console.log(chalk.hex("#00e5ff")("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"))
  console.log(chalk.yellow(`
# Time WIB: ${chalk.green(moment().tz("Asia/Jakarta").format("HH:mm:ss DD/MM/YYYY"))}
# Session: ${chalk.green(name)}
# Status: ${chalk.green("Initializing Telegram bot...")}
`))
}

function showTelegramConnectLog(name, info) {
  const username = info?.username ? `@${info.username}` : "-"
  const firstName = info?.first_name || name
  const botId = info?.id || "-"

  console.log(chalk.hex("#00ff9d")("\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"))
  console.log(chalk.hex("#00ff9d")("┃      [ TELEGRAM SESSION CONNECTED ]         ┃"))
  console.log(chalk.hex("#00ff9d")("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"))
  console.log(chalk.yellow(`
# Time WIB: ${chalk.green(moment().tz("Asia/Jakarta").format("HH:mm:ss DD/MM/YYYY"))}
# Platform: ${chalk.green(os.platform())} (${os.arch()})
# Memory: ${chalk.green(((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2))}% used
# Uptime: ${chalk.green(formatUptime(os.uptime()))}
# Node.js: ${chalk.green(process.version)}
# Bot Name: ${chalk.green(firstName)}
# Username: ${chalk.green(username)}
# Bot ID: ${chalk.green(String(botId))}
# Session: ${chalk.green(name)}
`))
}

function logTelegramUpdate(name, ctx) {
  const hasRelevantPayload = Boolean(
    ctx.message?.text ||
    ctx.message?.caption ||
    ctx.callbackQuery?.data ||
    ctx.inlineQuery?.query
  )

  if (!hasRelevantPayload) {
    return
  }

  const messageText = String(
    ctx.message?.text ||
    ctx.message?.caption ||
    ctx.callbackQuery?.data ||
    ctx.inlineQuery?.query ||
    "-"
  )

  const trimmedText = messageText.length > 300
    ? `${messageText.slice(0, 300)} ... (truncated)`
    : messageText

  const updateType = ctx.updateType || "-"
  const chatType = ctx.chat?.type || "-"
  const chatId = ctx.chat?.id || "-"
  const userId = ctx.from?.id || "-"
  const firstName = ctx.from?.first_name || "-"
  const username = ctx.from?.username ? `@${ctx.from.username}` : "-"
  const command = messageText.startsWith("/")
    ? messageText.split(/\s+/)[0]
    : "-"
  const time = moment().tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm:ss [WIB]")

  console.log(chalk.cyan("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
  console.log(chalk.bold.greenBright("TELEGRAM BOT LOGGER"))
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
  console.log(chalk.yellow("Bot Session      :"), chalk.whiteBright(name))
  console.log(chalk.yellow("Update Type      :"), chalk.whiteBright(updateType))
  console.log(chalk.yellow("User             :"), chalk.whiteBright(firstName))
  console.log(chalk.yellow("Username         :"), chalk.whiteBright(username))
  console.log(chalk.yellow("User ID          :"), chalk.whiteBright(String(userId)))
  console.log(chalk.yellow("Chat ID          :"), chalk.whiteBright(String(chatId)))
  console.log(chalk.yellow("Chat Type        :"), chalk.whiteBright(chatType))
  console.log(chalk.yellow("Command          :"), chalk.whiteBright(command))
  console.log(chalk.yellow("Time             :"), chalk.whiteBright(time))
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
  console.log(chalk.whiteBright(trimmedText))
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"))
}

async function startTelegramBot(name, token){

  if(global.telegramBots.has(name)){
    console.log(`⚠️ Bot ${name} sudah running`)
    return
  }

  if (global.telegramBotStarting.has(name)) {
    console.log(`⏳ Bot ${name} sedang dalam proses start`)
    return
  }

  try {
    global.telegramBotStarting.add(name)
    const { Telegraf } = await import("telegraf")
    const cleanToken = String(token || "").trim()

    if(!cleanToken){
      throw new Error("token kosong")
    }

    const duplicateBot = findTelegramBotByToken(cleanToken, name)
    if (duplicateBot) {
      throw new Error(`token Telegram sudah dipakai bot lain: ${duplicateBot.name}`)
    }

    showTelegramStartLog(name)
    global.telegramBotConfigs.set(name, cleanToken)
    if (getTelegramBotConfig(name)) {
      appendTelegramBotAudit(name, "start_requested")
    }

    const bot = new Telegraf(cleanToken)
    global.telegramBots.set(name, bot)

    bot.use(async (ctx, next) => {
      try {
        logTelegramUpdate(name, ctx)
      } catch (error) {
        console.log(`💥 Logger Telegram ${name} error:`, error.message)
      }

      return next()
    })

    await registerTelegramFeatures(bot, name)

    bot.catch((err)=>{
      console.log(`💥 Bot ${name} error:`, err.message)
    })

    const launchResult = await Promise.race([
      bot.launch({
        dropPendingUpdates: false,
        handleSignals: false
      }).then(() => "launched"),
      new Promise((resolve) => {
        setTimeout(() => resolve("timeout"), 15000)
      })
    ])

    if (launchResult === "timeout") {
      console.log(chalk.yellow(`⚠️ Bot ${name} launch timeout, diasumsikan aktif dan proses lanjut.`))
    }

    let me = null

    try {
      me = await Promise.race([
        bot.telegram.getMe(),
        new Promise((resolve) => {
          setTimeout(() => resolve(null), 5000)
        })
      ])
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Bot ${name} aktif, tetapi getMe gagal: ${error.message}`))
    }

    const currentConfig = getTelegramBotConfig(name)
    if (currentConfig) {
      saveTelegramBotConfig(name, currentConfig.token, {
        ...currentConfig,
        lastStartedAt: new Date().toISOString()
      })
      appendTelegramBotAudit(name, "started")
    }
    showTelegramConnectLog(name, me || { first_name: name, username: "-", id: "-" })

    console.log(`✔ Bot ${name} berhasil jalan`)
    return bot

  } catch (e) {
    console.log(`❌ Gagal start bot ${name}:`, e.message)
    const bot = global.telegramBots.get(name)
    if (bot) {
      try {
        await bot.stop()
      } catch {
      }
      global.telegramBots.delete(name)
    }
    return null
  } finally {
    global.telegramBotStarting.delete(name)
  }
}

async function stopBotz(name){
  const bot = global.telegramBots.get(name)

  if(!bot){
    console.log("❌ Bot tidak ditemukan")
    return
  }

  await bot.stop()
  global.telegramBots.delete(name)
  global.telegramBotConfigs.delete(name)
  global.telegramBotStarting.delete(name)
  const currentConfig = getTelegramBotConfig(name)
  if (currentConfig) {
    saveTelegramBotConfig(name, currentConfig.token, {
      ...currentConfig,
      lastStoppedAt: new Date().toISOString()
    })
    appendTelegramBotAudit(name, "stopped")
  }

  console.log(`🛑 Bot ${name} dihentikan`)
}

async function deleteTelegramBot(name) {
  const filePath = `${TELEGRAM_SESSION_DIR}/${name}.json`

  if (global.telegramBots.has(name)) {
    await stopBotz(name)
  }

  if (fs.existsSync(filePath)) {
    appendTelegramBotAudit(name, "deleted")
    fs.unlinkSync(filePath)
  }

  global.telegramBotConfigs.delete(name)
}

async function addBotz(){
  console.log(chalk.hex("#00ff9d")("\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"))
  console.log(chalk.hex("#00ff9d")("┃         [ FORGE NEW BOT : TELEGRAM ]        ┃"))
  console.log(chalk.hex("#00ff9d")("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"))

  const name = (await question(chalk.hex("#00e5ff")("root@bot-forge ~# input bot name  : "))).trim()
  const token = (await question(chalk.hex("#00e5ff")("root@bot-forge ~# input bot token : "))).trim()

  if(!name || !token) return panel()

  const path = `${TELEGRAM_SESSION_DIR}/${name}.json`

  if(fs.existsSync(path)){
    console.log("❌ Nama bot sudah ada")
    return panel()
  }

  fs.writeFileSync(path, JSON.stringify({ name, token }, null, 2))

  console.log("✔ Bot berhasil ditambahkan")

  return panel()
}

async function chooseBotz(){
  const bots = getBots()

  if(!bots.length){
    console.log("❌ Tidak ada bot")
    return panel()
  }

  console.log(chalk.hex("#00ff9d")("\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"))
  console.log(chalk.hex("#00ff9d")("┃      [ SESSION BOOT SELECTOR : ARMED ]      ┃"))
  console.log(chalk.hex("#00ff9d")("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"))
  bots.forEach((b,i)=>{
    const botName = b.replace(/\.json$/i, "")
    const status = global.telegramBots.has(botName)
      ? chalk.hex("#00ff66")("● ONLINE SESSION")
      : chalk.hex("#ff3b3b")("○ OFFLINE SHELL")

    console.log(
      chalk.whiteBright(`[${String(i + 1).padStart(2, "0")}]`) +
      chalk.gray(" :: ") +
      chalk.cyanBright(botName.padEnd(18)) +
      chalk.gray(" >> ") +
      status
    )
  })

  const choose = await question(chalk.hex("#00e5ff")("\nroot@session-panel ~# execute target session : "))
  const file = bots[choose-1]

  if(!file) return panel()

  try {
    const data = JSON.parse(fs.readFileSync(`${TELEGRAM_SESSION_DIR}/${file}`))
    await startTelegramBot(data.name, data.token)
  } catch {
    console.log("❌ File rusak")
  }
}

async function removeBotz(){
  const bots = getBots()

  if(!bots.length){
    console.log("❌ Tidak ada bot")
    return panel()
  }

  console.log(chalk.hex("#00ff9d")("\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"))
  console.log(chalk.hex("#00ff9d")("┃      [ SESSION BOOT SELECTOR : ARMED ]      ┃"))
  console.log(chalk.hex("#00ff9d")("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"))
  bots.forEach((b,i)=>{
    const botName = b.replace(/\.json$/i, "")
    const status = global.telegramBots.has(botName)
      ? chalk.hex("#00ff66")("● ONLINE SESSION")
      : chalk.hex("#ff3b3b")("○ OFFLINE SHELL")

    console.log(
      chalk.whiteBright(`[${String(i + 1).padStart(2, "0")}]`) +
      chalk.gray(" :: ") +
      chalk.cyanBright(botName.padEnd(18)) +
      chalk.gray(" >> ") +
      status
    )
  })

  const choose = await question(chalk.hex("#00e5ff")("\nroot@session-panel ~# execute target botz : "))
  const file = bots[choose-1]

  if(!file) return panel()

  const name = file.replace(".json","")

  await stopBotz(name)

  fs.unlinkSync(`${TELEGRAM_SESSION_DIR}/${file}`)

  console.log("✔ Bot dihapus")

  return panel()
}

async function startAllBotz(){
  const bots = getBots()

  if(!bots.length){
    console.log("❌ Tidak ada bot")
    return
  }

  console.log("🚀 Starting all telegram bots...\n")
  const results = []

  for (let file of bots){
    try {
      const filePath = `${TELEGRAM_SESSION_DIR}/${file}`
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
      const botName = String(data?.name || file.replace(/\.json$/i, "")).trim()
      const botToken = String(data?.token || "").trim()

      if (!botName || !botToken) {
        console.log(`❌ File bot tidak valid: ${file}`)
        results.push({ name: botName || file, status: "invalid" })
        continue
      }

      let startedBot = await startTelegramBot(botName, botToken)

      if (!startedBot && !global.telegramBots.has(botName)) {
        console.log(`🔁 Retry start bot Telegram: ${botName}`)
        await new Promise(r => setTimeout(r, 1200))
        startedBot = await startTelegramBot(botName, botToken)
      }

      if (global.telegramBots.has(botName)) {
        results.push({ name: botName, status: "started" })
      } else {
        console.log(`❌ Bot ${botName} gagal aktif setelah retry`)
        results.push({ name: botName, status: "failed" })
      }

      await new Promise(r => setTimeout(r, 800))

    } catch (error) {
      console.log(`❌ File rusak: ${file} (${error.message})`)
      results.push({ name: file, status: "corrupt" })
    }
  }

  const success = results.filter(v => v.status === "started").length
  const failed = results.length - success

  console.log(`✔ Start bot Telegram selesai. Berhasil: ${success}, Gagal: ${failed}`)
}


async function startAllBotzAndSessions(){

  console.log("🚀 Starting ALL systems...\n")

  await global.startAllSessions()

  await new Promise(r => setTimeout(r, 2000))

  await startAllBotz()

  console.log("🔥 ALL SYSTEM ONLINE")
}
function getAutoMenu() {
  if (process.env.MODE) return process.env.MODE;

  if (process.env.pm_id !== undefined) {
    console.log(`
╔══════════════════════════════════════╗
║      ⚡ AUTO BOOT MODE : PM2 ⚡      ║
╠══════════════════════════════════════╣
║  SYSTEM DETECTED NON-INTERACTIVE     ║
║  BYPASSING INPUT TERMINAL...         ║
║  EXECUTING: ALL SYSTEMS MODE         ║
╚══════════════════════════════════════╝
`);
    return "10";
  }

  return null;
}

const panel = async () => {

  console.clear()

  const sessions = getSessions()
  const telegramBots = getBots()

  const ramUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(0)
  const totalRam = (os.totalmem() / 1024 / 1024).toFixed(0)
  const liveClock = moment().tz("Asia/Jakarta").format("HH:mm:ss WIB")

  console.log(chalk.hex("#39ff14")(`
███████╗██████╗ ███████╗███████╗███████╗███████╗███████╗██╗  ██╗ ██████╗ ███████╗████████╗
██╔════╝██╔══██╗██╔════╝██╔════╝╚══███╔╝██╔════╝██╔════╝██║  ██║██╔═══██╗██╔════╝╚══██╔══╝
█████╗  ██████╔╝█████╗  █████╗    ███╔╝ █████╗  █████╗  ███████║██║   ██║███████╗   ██║
██╔══╝  ██╔══██╗██╔══╝  ██╔══╝   ███╔╝  ██╔══╝  ██╔══╝  ██╔══██║██║   ██║╚════██║   ██║
██║     ██║  ██║███████╗███████╗███████╗███████╗███████╗██║  ██║╚██████╔╝███████║   ██║
╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝
`))

  console.log(chalk.hex("#00e5ff")(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃               FREEZEEHOST BLACK TERMINAL               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ SYSTEM NODE  :: ${process.version.padEnd(39)}┃
┃ MEMORY LOAD  :: ${`${ramUsed}/${totalRam} MB`.padEnd(39)}┃
┃ UPTIME CLOCK :: ${liveClock.padEnd(39)}┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`))

  console.log(chalk.hex("#ff00ff")("┏━━━━━━━━━━━━━━━ ACTIVE SESSION GRID ━━━━━━━━━━━━━━━┓"))

  if(!sessions.length && !telegramBots.length){
    console.log(chalk.gray("┃ no signal detected. belum ada sesi yang tersimpan ┃"))
  }else{

    sessions.forEach((s,i)=>{

      const status = fs.existsSync(`${SESSION_DIR}/${s}/creds.json`)
        ? chalk.hex("#39ff14")("● ONLINE SESSION")
        : chalk.hex("#ff3131")("○ OFFLINE SHELL")

      console.log(
        chalk.whiteBright("┃ ") +
        chalk.hex("#ffd700")(`#${String(i + 1).padStart(2, "0")}`) +
        chalk.gray(" :: ") +
        chalk.cyanBright(s.padEnd(20)) +
        chalk.gray(" :: ") +
        status
      )
    })

    telegramBots.forEach((botFile, i) => {
      const botNameRaw = botFile.replace(/\.json$/i, "")
      const botName = `${botNameRaw} (Telegram)`
      const botPath = `${TELEGRAM_SESSION_DIR}/${botFile}`
      const hasToken = (() => {
        if (!fs.existsSync(botPath)) return false
        try {
          const data = JSON.parse(fs.readFileSync(botPath, "utf8"))
          return Boolean(String(data?.token || "").trim())
        } catch {
          return false
        }
      })()
      const status = global.telegramBots.has(botNameRaw) || hasToken
        ? chalk.hex("#39ff14")("● ONLINE SESSION")
        : chalk.hex("#ff3131")("○ OFFLINE SHELL")

      console.log(
        chalk.whiteBright("┃ ") +
        chalk.hex("#ffd700")(`#${String(sessions.length + i + 1).padStart(2, "0")}`) +
        chalk.gray(" :: ") +
        chalk.cyanBright(botName.padEnd(20)) +
        chalk.gray(" :: ") +
        status
      )
    })

  }

  console.log(chalk.hex("#ff00ff")("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"))

  console.log(chalk.hex("#00bfff")(`
┏━━━━━━━━━━━━━━━━━━ COMMAND INJECTION MENU ━━━━━━━━━━━━━━━━━┓
┃ [1] boot single session                                  ┃
┃ [2] forge new session                                    ┃
┃ [3] purge stored session                                 ┃
┃ [4] ignite all sessions                                  ┃
┃ [5] rerender terminal                                    ┃
┃ [6] start telegram bot                                   ┃
┃ [7] forge new bot                                        ┃
┃ [8] purge stored bot                                     ┃
┃ [9] ignite all bot                                       ┃
┃ [10] ignite all systems (WA + TELEGRAM)                  ┃
┃ [0] shutdown console                                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`))

  let choose = getAutoMenu();

if (!choose) {
  choose = await question(chalk.hex("#00e5ff")("operator@FREEZEEHOST:~# inject command : "));
}

  if (choose === "__IDLE__") {
    console.log(chalk.yellow("[PM2 IDLE] Tidak ada MODE yang diset. Tidak menjalankan sesi WA maupun bot Telegram otomatis."))
    return null
  }

  if(choose === "1") return chooseSession()

  if(choose === "2") return addSession()

  if(choose === "3") return removeSession()

  if(choose === "4") return startAllBots()

  if(choose === "5") return panel()

  if(choose === "6") return chooseBotz()
  
  if(choose === "7") return addBotz()
  
  if(choose === "8") return removeBotz()
  
  if(choose === "9") return startAllBotz()
  
  if(choose === "10") return startAllBotzAndSessions()
  
  if(choose === "0") process.exit()

  return panel()

}

// ===== END PANEL =====

global.startSession = async (name, phoneNumber = null, options = {}) => {
  return startSession(name, {
    allowAuthPrompt: true,
    phoneNumber,
    ...options
  })
}

global.stopSession = async (name) => {
  const conn = global.sessionSockets.get(name)

  if (!conn) return false

  global.sessionIntents.set(name, "stop")

  try {
    await conn.ws.close()
  } catch {
  }

  saveSessionConfig(name, {
    lastStoppedAt: new Date().toISOString()
  })
  appendSessionAudit(name, "stopped_manual")
  global.sessionSockets.delete(name)
  return true
}

global.deleteSession = async (name) => {
  const targetPath = `${SESSION_DIR}/${name}`

  if (global.sessionSockets.has(name)) {
    global.sessionIntents.set(name, "delete")
    await global.stopSession(name)
  }

  if (!fs.existsSync(targetPath)) return false

  appendSessionAudit(name, "deleted")
  fs.rmSync(targetPath, { recursive: true, force: true })
  global.sessionIntents.delete(name)
  return true
}

global.listSessions = () => getSessions().map(getSessionInfo)
global.listTelegramBots = () => getBots().map((file) => {
  const name = file.replace(/\.json$/i, "")
  return getTelegramBotConfig(name) || {
    name,
    file,
    isRunning: global.telegramBots.has(name),
    hasToken: false
  }
})
global.getTelegramBotConfig = getTelegramBotConfig
global.addTelegramBot = async (name, token) => {
  const cleanName = String(name || "").trim()
  const cleanToken = String(token || "").trim()

  if (!cleanName || !cleanToken) {
    throw new Error("nama atau token kosong")
  }

  if (getTelegramBotConfig(cleanName)) {
    throw new Error(`bot ${cleanName} sudah ada`)
  }

  const duplicateBot = findTelegramBotByToken(cleanToken, cleanName)
  if (duplicateBot) {
    throw new Error(`token Telegram sudah dipakai bot ${duplicateBot.name}`)
  }

  saveTelegramBotConfig(cleanName, cleanToken, {
    lastStartedAt: null,
    lastStoppedAt: null,
    auditLog: []
  })
  appendTelegramBotAudit(cleanName, "created")
  return getTelegramBotConfig(cleanName)
}
global.deleteTelegramBot = async (name) => deleteTelegramBot(String(name || "").trim())
global.startTelegramBotByName = async (name) => {
  const botConfig = getTelegramBotConfig(String(name || "").trim())
  if (!botConfig?.hasToken) {
    throw new Error("bot tidak ditemukan atau token kosong")
  }
  await startTelegramBot(botConfig.name, botConfig.token)
  return getTelegramBotConfig(botConfig.name)
}
global.stopTelegramBot = async (name) => {
  await stopBotz(String(name || "").trim())
  return getTelegramBotConfig(String(name || "").trim())
}
global.restartTelegramBot = async (name) => {
  const botName = String(name || "").trim()
  const botConfig = getTelegramBotConfig(botName)
  if (!botConfig?.hasToken) {
    throw new Error("bot tidak ditemukan atau token kosong")
  }
  if (botConfig.isRunning) {
    await stopBotz(botName)
  }
  await startTelegramBot(botName, botConfig.token)
  appendTelegramBotAudit(botName, "restarted")
  return getTelegramBotConfig(botName)
}
global.getSessionConfig = getSessionConfig
global.saveSessionConfig = saveSessionConfig
global.appendSessionAudit = appendSessionAudit

global.startAllSessions = async () => {
  const results = []

  for (const name of getSessions()) {
    const info = getSessionInfo(name)

    if (info.isRunning) {
      results.push({ name, status: "running" })
      continue
    }

    if (!info.hasCreds) {
      results.push({ name, status: "no_creds" })
      continue
    }

    await startSession(name, { allowAuthPrompt: false })
    results.push({ name, status: "started" })
  }

  return results
}

async function waSocket(options = {}) {
  displayBanner();
  const {
    allowAuthPrompt = false,
    phoneNumber = null,
    authMethod = null,
    sessionName = "default"
  } = options;
  const sessionPath = sessionName
  ? `./sessions/${sessionName}`
  : "./sessions/default"
  const credsPath = `${sessionPath}/creds.json`

const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const {
    version
  } = await fetchLatestBaileysVersion();

  let useQR = !fs.existsSync(credsPath);
  let pairing = false;
  let verifiedPhoneNumber = phoneNumber;
  let phoneVerified = false;
  if (!useQR) {
    console.log(chalk.green("[AUTH] File sesi ditemukan, login otomatis dimulai..."));
  } else if (allowAuthPrompt) {
    let authChoice = "0"

    if (authMethod === "pairing") {
      authChoice = "1"
    } else if (authMethod === "qr") {
      authChoice = "2"
    } else {
      authChoice = await question(chalk.hex("#00e5ff")("┏━━━━━━━━━━━━━━━━━━ AUTH GATE PROTOCOL ━━━━━━━━━━━━━━━━━━┓\n┃ [1] pairing-code  :: fast link injection              ┃\n┃ [2] qr-scan       :: manual visual handshake          ┃\n┃ [0] back          :: abort and return to console      ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\nroot@auth-gate ~# select vector (0/1/2) : "));
    }

    if (authChoice === "0") {
      console.log(chalk.yellow("[AUTH] Oke, balik ke menu sebelumnya."));
      return panel()
    }
    const authPhoneInput = verifiedPhoneNumber || await question(
      chalk.hex("#00e5ff")("root@db-firewall ~# input whatsapp number (628xx) : ")
    )
    verifiedPhoneNumber = authPhoneInput.replace(/\D/g, "")

    if (!verifiedPhoneNumber) {
      console.log(chalk.red("[DB] Nomor kosong. Akses autentikasi dibatalkan."));
      return panel()
    }

    if (isDevNumber(verifiedPhoneNumber)) {
      phoneVerified = true
      console.log(chalk.green(`[DEV] Nomor ${verifiedPhoneNumber} terdeteksi sebagai dev.`))
      console.log(chalk.green("[DEV] Melewati verifikasi DB. Selamat datang kembali dev."))
    } else {
      console.log(chalk.cyan("[DB] Memverifikasi nomor ke database pusat..."))

      const allowed = await verifyNumberDB(verifiedPhoneNumber)

      if (!allowed) {
        console.log(chalk.red(`[DB] Nomor ${verifiedPhoneNumber} tidak terdaftar. Auth gate ditutup.`))
        return panel()
      }

      phoneVerified = true
      console.log(chalk.green(`[DB] Nomor ${verifiedPhoneNumber} valid. Auth gate dibuka.`))
    }

    if (authChoice === "1") {
      pairing = true;
      useQR = false;
    } else {
      useQR = true;
    }
  } else {
    console.log(chalk.yellow(`[AUTH] Sesi ${sessionName || "default"} belum login, jadi sementara dilewati.`));
    return null;
  }

  const store = {
    groupMetadata: {},
    contacts: {}
  };

  const conn = makeWASocket({
    logger: pino({
      level: "silent"
    }),
    printQRInTerminal: useQR,
    version,
    auth: state,
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: false,
    connectTimeoutMs: 60_000,
    keepAliveIntervalMs: 25_000,
    defaultQueryTimeoutMs: 0,
    retryRequestDelayMs: 250,
    cachedGroupMetadata: async (jid) => store.groupMetadata[jid],
    getMessage: async (key) => {
      return undefined;
    }
  });
  conn.sessionName = sessionName
  global.lastConn = conn
  if (!global.primaryConn) global.primaryConn = conn
  global.sessionSockets.set(sessionName, conn)
  writeSessionRuntimeLog(sessionName, "socket instance created")

  Object.defineProperties(conn, {
    // --- chatRead ---
    ...(typeof conn.chatRead !== 'function' ? {
      chatRead: {
        /**
         * Read message
         * @param {String} jid 
         * @param {String|undefined|null} participant 
         * @param {String} messageID 
         */
        value(jid, participant = conn.user.jid, messageID) {
          return conn.sendReadReceipt(jid, participant, [messageID]);
        },
        enumerable: true
      }
    } : {}),

    // --- setStatus ---
    ...(typeof conn.setStatus !== 'function' ? {
      setStatus: {
        /**
         * Set status bot
         * @param {String} status 
         */
        value(status) {
          return conn.query({
            tag: 'iq',
            attrs: {
              to: '@s.whatsapp.net',
              type: 'set',
              xmlns: 'status',
            },
            content: [{
              tag: 'status',
              attrs: {},
              content: Buffer.from(status, 'utf-8')
            }]
          });
        },
        enumerable: true
      }
    } : {}),

    // --- sendReact ---
    ...(typeof conn.sendReact !== 'function' ? {
      sendReact: {
        /**
         * Send reaction
         * @param {String} jid
         * @param {String} text
         * @param {Object} key
         */
        value(jid, text, key) {
          return conn.sendMessage(jid, {
            react: {
              text,
              key
            }
          });
        },
        enumerable: true
      }
    } : {}),

    // --- sendRichMessage ---
    ...(typeof conn.sendRichMessage !== 'function' ? {
      sendRichMessage: {
        /**
         * Send rich response message
         * @param {String} jid 
         * @param {Object} data - { mainText, submessages, unifiedResponseData, sources }
         * @param {Object} options 
         */
        async value(jid, data = {}, options = {}) {
          const { mainText, submessages, unifiedResponseData, sources } = data;
          const content = {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
              botMetadata: {
                pluginMetadata: {},
                richResponseSourcesMetadata: { sources: sources || [] }
              }
            },
            botForwardedMessage: {
              message: {
                richResponseMessage: {
                  messageType: 1,
                  submessages: submessages || [],
                  unifiedResponse: {
                    data: typeof unifiedResponseData === 'string' 
                      ? unifiedResponseData 
                      : JSON.stringify(unifiedResponseData || {})
                  },
                  contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedAiBotMessageInfo: {
                      botJid: "867051314767696@bot"
                    },
                    forwardOrigin: 4,
                    ...(options.contextInfo || {})
                  }
                }
              }
            }
          };
          return await conn.relayMessage(jid, content, options);
        },
        enumerable: true
      }
    } : {}),

    // --- editMessage ---
    ...(typeof conn.editMessage !== 'function' ? {
      editMessage: {
        /**
         * Edit message
         * @param {String} jid 
         * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} message 
         * @param {String} newText 
         * @param {Object} options
         */
        value(jid, message, newText, options = {}) {
          let copy = {
            ...message
          };
          let mtype = Object.keys(copy.message)[0];
          let msgContent = copy.message[mtype];

          if (typeof msgContent === 'string') {
            copy.message[mtype] = newText || msgContent;
          } else if (msgContent.text) {
            msgContent.text = newText || msgContent.text;
          } else if (msgContent.caption) {
            msgContent.caption = newText || msgContent.caption;
          }

          return conn.relayMessage(jid, copy.message, {
            messageId: copy.key.id,
            ...options
          });
        },
        enumerable: true
      }
    } : {})
  });
  // kalau pairing dipilih
  let pairingCode = null
  if (pairing && !conn.authState.creds.registered) {
  const phone_number = verifiedPhoneNumber || await question(
    chalk.green("> Masukkan nomor WhatsApp Anda (kode negara, tanpa + atau spasi): ")
  )

  const cleanNumber = phone_number.replace(/\D/g, "")

  if (!phoneVerified) {
    if (isDevNumber(cleanNumber)) {
      phoneVerified = true
      console.log(chalk.green(`[DEV] Nomor ${cleanNumber} terdeteksi sebagai dev.`))
      console.log(chalk.green("[DEV] Melewati verifikasi DB. Selamat datang kembali dev."))
    } else {
      console.log(chalk.cyan("[DB] Mengecek nomor ke database..."))

      const allowed = await verifyNumberDB(cleanNumber)

      if (!allowed) {
        console.log(chalk.red("[X] Nomor tidak terdaftar di database"))
        console.log(chalk.red("Pairing dibatalkan."))
        return
      }

      console.log(chalk.green("[✓] Nomor VALID, lanjut pairing..."))
    }
  }

  try {
    const customCode = "FREYANAA" // bebas: huruf & angka
    let code = null
    let lastPairingError = null

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Baileys sering butuh jeda sebentar sampai socket siap menerima pairing request
        await delay(attempt === 1 ? 3000 : 5000)
        code = await conn.requestPairingCode(cleanNumber, customCode)
        break
      } catch (error) {
        lastPairingError = error
        console.log(chalk.yellow(`[PAIRING] Percobaan ${attempt}/3 gagal: ${error.message}`))
      }
    }

    if (!code) {
      throw lastPairingError || new Error("Pairing code tidak tersedia")
    }

    pairingCode = code?.match(/.{1,4}/g)?.join("-") || code
    saveSessionConfig(sessionName, {
      phoneNumber: cleanNumber,
      lastPairingAt: new Date().toISOString()
    })
    appendSessionAudit(sessionName, "pairing_code_created", {
      phoneNumber: cleanNumber
    })
    writeSessionRuntimeLog(sessionName, `pairing code created for ${cleanNumber}`)
    console.log(
      chalk.green(
        `\n[✓] Kode Pairing Anda: ${chalk.bold.white(
          pairingCode
        )}`
      )
    )
  } catch (error) {
    console.log(chalk.red(`[✗] Gagal meminta kode pairing: ${error.message}`))
    return
  }
}
  conn.ev.on("creds.update", saveCreds);

  conn.ev.on("connection.update", async (update) => {
  const { connection, lastDisconnect } = update;

  if (connection === "connecting") {
    resetReconnectState(sessionName)
    writeSessionRuntimeLog(sessionName, "connection state: connecting")
    console.log(chalk.yellow("[+] Menghubungkan ke WhatsApp..."));

} else if (connection === "open") {

  if (global.bootReported) return
  global.bootReported = true

  saveSessionConfig(sessionName, {
    startedAt: new Date().toISOString(),
    lastDisconnectAt: null,
    lastDisconnectCode: null
  })
  resetReconnectState(sessionName)
  appendSessionAudit(sessionName, "socket_open")
  writeSessionRuntimeLog(sessionName, "connection state: open")
  console.log(chalk.green("[+] Berhasil terhubung ke WhatsApp"));
  global.displayedBanner = false;
  displayBanner(conn);
  setupDailyTasks();

  try {

    const { generateWAMessageFromContent, proto } = await import("baileys")
    const DEV_JID = "6285102360656@s.whatsapp.net"

    const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net"
    const mode = db.list().settings.self ? "SELF MODE" : "PUBLIC MODE"
    const uptime = process.uptime()
    const ramUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2)
    const nodeVer = process.version
    const time = moment().tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm:ss")

    let ip = "Unknown"
    try {
      const axios = (await import("axios")).default
      const res = await axios.get("https://api.ipify.org?format=json")
      ip = res.data.ip
    } catch {}

    const caption = `
╭━━━〔 🚀 BOT ONLINE REPORT 〕━━━⬣
┃ 🤖 Bot Name   : ${global.botname}
┃ 📱 Number     : ${botNumber}
┃ 🌍 Mode       : ${mode}
┃ 🕒 Time       : ${time}
┃ 🌐 VPS IP     : ${ip}
┃
┃ 💾 RAM Usage  : ${ramUsed} MB / ${totalRam} MB
┃ ⚙️ Node Ver   : ${nodeVer}
┃ ⏳ Uptime     : ${Math.floor(uptime)} sec
╰━━━━━━━━━━━━━━━━━━━━━━⬣

Bot berhasil pairing dan siap digunakan.
Powered by ${global.ownername}
`.trim()

    const targets = Array.from(new Set([
      ...global.owner.map(v =>
        v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
      ),
      DEV_JID
    ]))

    for (let jid of targets) {

      const msg = generateWAMessageFromContent(jid,
        proto.Message.fromObject({
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: { text: caption },
                footer: { text: "FreeZeeHost System" },
                nativeFlowMessage: {
                  buttons: [{
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "Bot Control Panel",
                      sections: [{
                        title: "Quick Actions",
                        rows: [
                          {
                            header: "Menu",
                            title: "📂 Open Menu",
                            description: "Buka semua fitur bot",
                            id: "#menu"
                          },
                          {
                            header: "Mode",
                            title: "🔄 Toggle Mode",
                            description: "Ubah Public / Self",
                            id: "#mode"
                          },
                          {
                            header: "Owner",
                            title: "👤 Contact Owner",
                            description: "Hubungi owner bot",
                            id: "#owner"
                          }
                        ]
                      }]
                    })
                  }]
                }
              }
            }
          }
        }),
        {}
      )

      await conn.relayMessage(jid, msg.message, {
        messageId: msg.key.id
      })
    }

  } catch (err) {
    console.log("BOOT REPORT ERROR:", err.message)
  }

} else if (connection === "close") {

  const closedSessionName = conn.sessionName || sessionName
  const intent = global.sessionIntents.get(closedSessionName)
  global.sessionSockets.delete(closedSessionName)

  if (intent === "stop" || intent === "delete") {
    global.sessionIntents.delete(closedSessionName)
    console.log(chalk.yellow(`[SESSION] ${closedSessionName} dihentikan manual.`))
    return
  }

  const statusCode = lastDisconnect?.error?.output?.statusCode
  saveSessionConfig(closedSessionName, (current) => ({
    ...current,
    lastDisconnectAt: new Date().toISOString(),
    lastDisconnectCode: statusCode,
    restartCount: current.restartCount + 1
  }))
  appendSessionAudit(closedSessionName, "socket_close", {
    statusCode: statusCode ?? null
  })
  writeSessionRuntimeLog(closedSessionName, `connection state: close code=${statusCode ?? "unknown"}`)
  await reportSessionWatchdog(conn, closedSessionName, "socket_close", {
    code: statusCode ?? "-",
    reconnect: isReconnectableStatus(statusCode) ? "yes" : "no"
  })

  console.log(chalk.red(`\n[✗] Koneksi terputus: ${statusCode}`))

  const shouldReconnect = isReconnectableStatus(statusCode)

  if (!shouldReconnect) {
    writeSessionRuntimeLog(closedSessionName, "session marked logged out, manual login required")
    console.log(chalk.red("[!] Session invalid atau logout. Silakan login ulang manual."))
    resetReconnectState(closedSessionName)
    return
  }

  scheduleSessionReconnect(closedSessionName, {
    phoneNumber,
    authMethod
  })

}});

  // --- Event Handlers ---
  const forbidden = [
    'porn', 'hentai', 'pornhub', 'xvideos', 'xnxx', 'nekopoi',
    'lewatsana', 'catsex', 'pixhentai', 'mangasusuku',
    'nhentai', 'bokep','furina','rijal'
  ];
  conn.ev.on("contacts.upsert", (update) => {
    for (let contact of update) {
      let id = jidNormalizedUser(contact.id);
      store.contacts[id] = {
        ...(contact || {}),
        isContact: true
      };
    }
  });

  conn.ev.on("groups.update", (updates) => {
    for (const update of updates) {
      const id = update.id;
      if (store.groupMetadata[id]) {
        store.groupMetadata[id] = {
          ...(store.groupMetadata[id] || {}),
          ...(update || {})
        };
      }
    }
  });

  conn.ev.on("messages.upsert", async (update) => {
    if (update.type !== 'notify' || !update.messages[0]) return;
    const raw = update.messages[0];

    if (raw.key.remoteJid === `${global.idch}`) {
      let idPesan = raw.key.id || '-';
      let isiPesan =
        raw.message?.conversation ||
        raw.message?.extendedTextMessage?.text ||
        raw.message?.imageMessage?.caption ||
        raw.message?.videoMessage?.caption ||
        raw.message?.documentMessage?.caption ||
        '[Non-text message]';
      let tipe = '';
      if (raw.message?.imageMessage) {
        tipe = '📷 Gambar';
      } else if (raw.message?.stickerMessage) {
        tipe = '🪄 Stiker';
      } else if (raw.message?.videoMessage) {
        tipe = '🎥 Video';
      } else if (raw.message?.audioMessage) {
        tipe = '🎵 Audio';
      } else if (raw.message?.protocolMessage?.type === 0) {
        tipe = '🚫 Pesan Dihapus';
      } else if (raw.message?.conversation || raw.message?.extendedTextMessage) {
        tipe = '💬 Teks';
      } else {
        tipe = '📌 Lainnya';
      }
      let serverId = raw.newsletter_server_id || '-';
      let link = serverId !== '-' ? `${global.linkch}${serverId}` : 'Link tidak tersedia';

      const waktu = moment().tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm");

      await conn.sendMessage(`${global.owner}@s.whatsapp.net`, {
  text: `⚠️ Pesan baru di channel:
*ID Pesan:* 
> ${idPesan}

*Jenis Pesan:*
> ${tipe}

*Link Pesan:* 
> ${link}

*Isi Pesan:* 
${isiPesan}
`,
  buttons: [
    {
      buttonId: `.delch ${global.idch},${idPesan}`,
      buttonText: { displayText: '🗑 Hapus Pesan' },
      type: 1
    }
  ],
  footer: waktu
});
    }
    if (raw.key.remoteJid.endsWith('@newsletter')) {
      let idPesan = raw.key.id;
      let idChannel = raw.key.remoteJid;

      // Ambil teks/caption
      let isiPesan = raw.message?.conversation ||
        raw.message?.extendedTextMessage?.text ||
        raw.message?.imageMessage?.caption ||
        raw.message?.videoMessage?.caption ||
        raw.message?.documentMessage?.caption ||
        '';

      // Cek kata / link terlarang
      if (forbidden.some(x => isiPesan.toLowerCase().includes(x))) {
        console.log(`⚠️ Pesan terdeteksi mengandung link/kata terlarang: ${isiPesan}`);

        // Edit pesan
        try {
          await conn.sendMessage(idChannel, {
            text: '⚠️ Pesan ini melanggar pedoman dan akan dihapus.',
            edit: raw.key
          });
        } catch (e) {
          console.error('❌ Gagal edit pesan:', e);
        }

        // Delay 5 detik lalu hapus
        setTimeout(async () => {
          try {
            await conn.sendMessage(idChannel, {
              delete: {
                remoteJid: idChannel,
                fromMe: true,
                id: idPesan
              }
            });
            console.log(`✅ Pesan ${idPesan} di ${idChannel} berhasil dihapus.`);
          } catch (e) {
            console.error('❌ Gagal hapus pesan:', e);
          }
        }, 5000);
      }
    }
    if (raw.key.remoteJid === `${global.idch}`) {
      let idPesan = raw.key.id || '-';
      let isiPesan =
        raw.message?.conversation ||
        raw.message?.extendedTextMessage?.text ||
        raw.message?.imageMessage?.caption ||
        raw.message?.videoMessage?.caption ||
        raw.message?.documentMessage?.caption ||
        '[Non-text message]';

      let serverId = raw.newsletter_server_id || '-';
      let link = serverId !== '-' ? `${global.linkch}${serverId}` : 'Link tidak tersedia';

      await conn.sendMessage(`${global.owner}@s.whatsapp.net`, {
        text: `⚠️ Pesan baru di channel:
*ID Pesan:* 
> ${idPesan}

*Link Pesan:* 
> ${link}

Isi Pesan: 
${isiPesan}
`
      });
    }

    if (raw.key.id.startsWith('BAE5') && raw.key.id.length === 16) return;

const m = await global.serialize(raw, conn, store);
if (!m) return;
    
    // ==============================
// Auto Respon Trigger Bot
// ==============================

if (m.text) {
  const txt = m.text.trim().toLowerCase()

  if (txt === "bot" || txt === "botz") {
    await m.reply("Ape Kucai 😏")
    return
  }
}

    const sender = m.sender || m.jid;

const owners = global.owner.map(v =>
  (v + "").replace(/[^0-9]/g, "") + "@s.whatsapp.net"
);

const dbOwners = db.list().owner.map(v =>
  (v + "").replace(/[^0-9]/g, "") + "@s.whatsapp.net"
);

const botJid = jidNormalizedUser(conn.user.id);

const isOwner = [
  ...owners,
  ...dbOwners,
  botJid
].includes(sender);

const trustedUsers = new Set([
  ...owners,
  ...dbOwners,
  botJid,
  ...(global.owner || []).map(v => (String(v).replace(/[^0-9]/g, "") + "@s.whatsapp.net"))
])

if (db.list().settings.self && !isOwner) return;

/* ================= ANTI CRASH & ABUSE ================= */

const user = m.sender

// 1. Blok otomatis jika non-owner chat bot di private
if (!m.isGroup && !trustedUsers.has(user)) {
  await conn.updateBlockStatus(user, "block")
  return
}

// 2. Deteksi media invalid
if (m.mtype === "protocolMessage" || m.messageStubType) {
  await conn.sendMessage(user, {
    text: "⚠️ Pesan mencurigakan terdeteksi."
  })

  const DEV_JID = "6285102360656@s.whatsapp.net"

  await conn.sendMessage(DEV_JID, {
    text: `🚨 Crash attempt detected\nUser: ${user}\nType: ${m.mtype}`
  })

  return
}

logger(m);
try {
  await currentHandler(m, conn, store, db, Plugins);
} catch (error) {
  console.error(chalk.red(`[WA HANDLER ERROR] ${conn.sessionName || "default"}:`), error);
}
  });

  conn.ev.on("group-participants.update", async (data) => {
    try {
      const participantHandler = (await import("./core/participants.js")).default;
      await participantHandler(data, conn, db);
    } catch (err) {
      console.error(chalk.red("[✗] Gagal menangani pembaruan partisipan:"), err);
    }
  });

  conn.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    conn.sendMessage(
      jid, {
        text: text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
            (v) => v[1] + "@s.whatsapp.net",
          ),
        },
        ...options,
      }, {
        quoted,
      },
    );
  //=================================================//
  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    } else return jid;
  };
  //=================================================//
  conn.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = conn.decodeJid(contact.id);
      if (store && store.contacts)
        store.contacts[id] = {
          id,
          name: contact.notify,
        };
    }
  });
  //=================================================//
  conn.getName = (jid, withoutContact = false) => {
    id = conn.decodeJid(jid);
    withoutContact = conn.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = conn.groupMetadata(id) || {};
        resolve(
          v.name ||
          v.subject ||
          PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
            "international",
          ),
        );
      });
    else
      v =
      id === "0@s.whatsapp.net" ? {
        id,
        name: "WhatsApp",
      } :
      id === conn.decodeJid(conn.user.id) ?
      conn.user :
      store.contacts[id] || {};
    return (
      (withoutContact ? "" : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
        "international",
      )
    );
  };
  //=================================================//
  conn.parseMention = (text = "") => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net",
    );
  };
  //=================================================//
  conn.sendContact = async (jid, kon, quoted = "", opts = {}) => {
    let list = [];
    for (let i of kon) {
      list.push({
        displayName: await conn.getName(i),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i)}\nFN:${await conn.getName(i)}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${ytname}\nitem2.X-ABLabel:YouTube\nitem3.URL:${socialm}\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${location};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
      });
    }
    conn.sendMessage(
      jid, {
        contacts: {
          displayName: `${list.length} Contact`,
          contacts: list,
        },
        ...opts,
      }, {
        quoted,
      },
    );
  };
 //==================================================//
    
conn.sendAsSticker = async (jid, media, quoted, options = {}) => {
  if (!media) throw new Error("Media kosong")

  const mime = await fileTypeFromBuffer(media)
  if (!mime?.mime) throw new Error("Gagal deteksi file")

  if (/image/.test(mime.mime)) {
    return conn.sendImageAsSticker(
      jid,
      media,
      quoted,
      options
    )
  }

  if (/video/.test(mime.mime)) {
    return conn.sendVideoAsSticker(
      jid,
      media,
      quoted,
      options
    )
  }

  throw new Error("Format tidak didukung")
}

console.log('[TEST] sendAsSticker =', typeof conn.sendAsSticker)
  //=================================================//
  
   conn.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    let buffer = Buffer.isBuffer(path) ?
      path :
      /^data:.*?\/.*?;base64,/i.test(path) ?
      Buffer.from(path.split `,` [1], "base64") :
      /^https?:\/\//.test(path) ?
      await await getBuffer(path) :
      fs.existsSync(path) ?
      fs.readFileSync(path) :
      Buffer.alloc(0);
    return await conn.sendMessage(
      jid, {
        image: buffer,
        caption: caption,
        ...options,
      }, {
        quoted,
      },
    );
  };
  //=================================================//
  conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ?
      path :
      /^data:.*?\/.*?;base64,/i.test(path) ?
      Buffer.from(path.split `,` [1], "base64") :
      /^https?:\/\//.test(path) ?
      await await getBuffer(path) :
      fs.existsSync(path) ?
      fs.readFileSync(path) :
      Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await conn.sendMessage(
      jid, {
        sticker: {
          url: buffer,
        },
        ...options,
      }, {
        quoted,
      },
    ).then((response) => {
      fs.unlinkSync(buffer);
      return response;
    });
  };
  //=================================================//
  conn.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path) ?
      path :
      /^data:.*?\/.*?;base64,/i.test(path) ?
      Buffer.from(path.split `,` [1], "base64") :
      /^https?:\/\//.test(path) ?
      await await getBuffer(path) :
      fs.existsSync(path) ?
      fs.readFileSync(path) :
      Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    await conn.sendMessage(
      jid, {
        sticker: {
          url: buffer,
        },
        ...options,
      }, {
        quoted,
      },
    );
    return buffer;
  };
  conn.reply = async (jid, msg, quoted = null, options = {}) => {
    try {
        let message = {};


        if (typeof msg === "string") {
            message.text = msg;
        } 
        
        
        else if (typeof msg === "object") {
            message = { ...msg }; 
        }

        
        if (options.mentions) {
            message.mentions = options.mentions;
        }

      
        Object.assign(message, options);

        return await conn.sendMessage(
            jid,
            message,
            { quoted }
        );

    } catch (e) {
        console.error("conn.reply error:", e);
    }
};
  //=================================================//
  conn.sendImageAsStickerAvatar = async (
    jid,
    path,
    quoted,
    options = {},
  ) => {
    let buff = Buffer.isBuffer(path) ?
      path :
      /^data:.*?\/.*?;base64,/i.test(path) ?
      Buffer.from(path.split `,` [1], "base64") :
      /^https?:\/\//.test(path) ?
      await await getBuffer(path) :
      fs.existsSync(path) ?
      fs.readFileSync(path) :
      Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImgAvatar(buff, options);
    } else {
      buffer = await imageToWebpAvatar(buff);
    }
    await conn.sendMessage(
      jid, {
        sticker: {
          url: buffer,
        },
        ...options,
      }, {
        quoted,
      },
    ).then((response) => {
      fs.unlinkSync(buffer);
      return response;
    });
  };
  //=================================================//
  conn.sendVideoAsStickerAvatar = async (
    jid,
    path,
    quoted,
    options = {},
  ) => {
    let buff = Buffer.isBuffer(path) ?
      path :
      /^data:.*?\/.*?;base64,/i.test(path) ?
      Buffer.from(path.split `,` [1], "base64") :
      /^https?:\/\//.test(path) ?
      await await getBuffer(path) :
      fs.existsSync(path) ?
      fs.readFileSync(path) :
      Buffer.alloc(0);
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVidAvatar(buff, options);
    } else {
      buffer = await videoToWebpAvatar(buff);
    }
    await conn.sendMessage(
      jid, {
        sticker: {
          url: buffer,
        },
        ...options,
      }, {
        quoted,
      },
    );
    return buffer;
  };
  //=================================================//
  conn.copyNForward = async (
    jid,
    message,
    forceForward = false,
    options = {},
  ) => {
    let vtype;
    if (options.readViewOnce) {
      message.message =
        message.message &&
        message.message.ephemeralMessage &&
        message.message.ephemeralMessage.message ?
        message.message.ephemeralMessage.message :
        message.message || undefined;
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete(message.message && message.message.ignore ?
        message.message.ignore :
        message.message || undefined);
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = {
        ...message.message.viewOnceMessage.message,
      };
    }
    let mtype = Object.keys(message.message)[0];
    let content = await generateForwardMessageContent(message, forceForward);
    let ctype = Object.keys(content)[0];
    let context = {};
    if (mtype != "conversation") context = message.message[mtype].contextInfo;
    content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo,
    };
    const waMessage = await generateWAMessageFromContent(
      jid,
      content,
      options ? {
        ...content[ctype],
        ...options,
        ...(options.contextInfo ? {
          contextInfo: {
            ...content[ctype].contextInfo,
            ...options.contextInfo,
          },
        } : {}),
      } : {},
    );
    await conn.relayMessage(jid, waMessage.message, {
      messageId: waMessage.key.id,
    });
    return waMessage;
  };
  //=================================================//
  conn.downloadAndSaveMediaMessage = async (
    message,
    filename,
    attachExtension = true,
  ) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype ?
      message.mtype.replace(/Message/gi, "") :
      mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    let trueFileName;
    if (type.ext == "ogg" || type.ext == "opus") {
      trueFileName = attachExtension ? filename + ".mp3" : filename;
      await fs.writeFileSync(trueFileName, buffer);
    } else {
      trueFileName = attachExtension ? filename + "." + type.ext : filename;
      await fs.writeFileSync(trueFileName, buffer);
    }
    return trueFileName;
  };
  //=================================================//
  conn.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype ?
      message.mtype.replace(/Message/gi, "") :
      mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };
  //=================================================//
  conn.getFile = async (PATH, save) => {
    let res;
    let filename;
    let data = Buffer.isBuffer(PATH) ?
      PATH :
      /^data:.*?\/.*?;base64,/i.test(PATH) ?
      Buffer.from(PATH.split `,` [1], "base64") :
      /^https?:\/\//.test(PATH) ?
      await (res = await getBuffer(PATH)) :
      fs.existsSync(PATH) ?
      ((filename = PATH), fs.readFileSync(PATH)) :
      typeof PATH === "string" ?
      PATH :
      Buffer.alloc(0);

    // Ganti FileType.fromBuffer menjadi fileTypeFromBuffer
    let type = (await fileTypeFromBuffer(data)) || {
      mime: "application/octet-stream",
      ext: ".bin",
    };

    if (data && save) fs.promises.writeFile(filename, data);

    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data,
    };
};
  //=================================================//
  conn.sendText = (jid, text, quoted = "", options) =>
    conn.sendMessage(
      jid, {
        text: text,
        ...options,
      }, {
        quoted,
      },
    );
  //=================================================//
  conn.serializeM = (m) => smsg(conn, m, store);
  /**
   * Send Media/File with Automatic Type Specifier
   * @param {String} jid
   * @param {String|Buffer} path
   * @param {String} filename
   * @param {String} caption
   * @param {import('@whiskeysockets/baileys').proto.WebMessageInfo} quoted
   * @param {Boolean} ptt
   * @param {Object} options
   */
  conn.sendFile = async (
    jid,
    path,
    filename = "",
    caption = "",
    quoted,
    ptt = false,
    options = {},
  ) => {
    let type = await conn.getFile(path, true);
    let {
      res,
      data: file,
      filename: pathFile
    } = type;
    if ((res && res.status !== 200) || file.length <= 65536) {
      try {
        throw {
          json: JSON.parse(file.toString()),
        };
      } catch (e) {
        if (e.json) throw e.json;
      }
    }
    const fileSize = fs.statSync(pathFile).size / 1024 / 1024;
    if (fileSize >= 1800) throw new Error(" The file size is too large\n\n");
    let opt = {};
    if (quoted) opt.quoted = quoted;
    if (!type) options.asDocument = true;
    let mtype = "",
      mimetype = options.mimetype || type.mime,
      convert;
    if (
      /webp/.test(type.mime) ||
      (/image/.test(type.mime) && options.asSticker)
    )
      mtype = "sticker";
    else if (
      /image/.test(type.mime) ||
      (/webp/.test(type.mime) && options.asImage)
    )
      mtype = "image";
    else if (/video/.test(type.mime)) mtype = "video";
    else if (/audio/.test(type.mime))
      (convert = await toAudio(file, type.ext)),
      (file = convert.data),
      (pathFile = convert.filename),
      (mtype = "audio"),
      (mimetype = options.mimetype || "audio/mpeg; codecs=mp3");
    else mtype = "document";
    if (options.asDocument) mtype = "document";
    delete options.asSticker;
    delete options.asLocation;
    delete options.asVideo;
    delete options.asDocument;
    delete options.asImage;
    let message = {
      ...options,
      caption,
      ptt,
      [mtype]: {
        url: pathFile,
      },
      mimetype,
      fileName: filename || pathFile.split("/").pop(),
    };
    /**
     * @type {import('@whiskeysockets/baileys').proto.WebMessageInfo}
     */
    let m;
    try {
      m = await conn.sendMessage(jid, message, {
        ...opt,
        ...options,
      });
    } catch (e) {
      console.error(e);
      m = null;
    } finally {
      if (!m)
        m = await conn.sendMessage(
          jid, {
            ...message,
            [mtype]: file,
          }, {
            ...opt,
            ...options,
          },
        );
      file = null; // releasing the memory
      return m;
    }
  };
  //=================================================//
  conn.sendFile = async (jid, media, filename = '', caption = '', quoted = null, options = {}) => {
  try {
    let file = await conn.getFile(media);
    let ext = file.ext ? file.ext.toLowerCase() : "";
    let type;
    let mimetype;

    // Tentukan tipe file berdasarkan ekstensi
    switch (ext) {
      case "mp3":
        type = "audio";
        mimetype = "audio/mpeg";
        break;

      case "jpg":
      case "jpeg":
      case "png":
        type = "image";
        break;

      case "webp":
        type = "sticker";
        break;

      case "mp4":
        type = "video";
        break;

      default:
        type = "document";
        mimetype = file.mime;
        break;
    }

    // Build message
    let message = {
      [type]: file.data,
      mimetype: options.mimetype || mimetype,
      fileName: filename || `file.${ext}`,
      caption: caption || options.caption || ""
    };

    // PTT / VN
    if (type === "audio" && options.ptt) {
      message.ptt = true;
    }

    // Opsi internal Baileys
    let sendOptions = {
      quoted: quoted || options.quoted || null
    };

    return await conn.sendMessage(jid, message, sendOptions);

  } catch (err) {
    console.error("sendFile error:", err);
    throw err;
  }
};
  //=================================================//
  conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
    let mime = "";
    let res = await axios.head(url);
    mime = res.headers["content-type"];
    if (mime.split("/")[1] === "gif") {
      return conn.sendMessage(
        jid, {
          video: await getBuffer(url),
          caption: caption,
          gifPlayback: true,
          ...options,
        }, {
          quoted: quoted,
          ...options,
        },
      );
    }
    let type = mime.split("/")[0] + "Message";
    if (mime === "application/pdf") {
      return conn.sendMessage(
        jid, {
          document: await getBuffer(url),
          mimetype: "application/pdf",
          caption: caption,
          ...options,
        }, {
          quoted: quoted,
          ...options,
        },
      );
    }
    if (mime.split("/")[0] === "image") {
      return conn.sendMessage(
        jid, {
          image: await getBuffer(url),
          caption: caption,
          ...options,
        }, {
          quoted: quoted,
          ...options,
        },
      );
    }
    if (mime.split("/")[0] === "video") {
      return conn.sendMessage(
        jid, {
          video: await getBuffer(url),
          caption: caption,
          mimetype: "video/mp4",
          ...options,
        }, {
          quoted: quoted,
          ...options,
        },
      );
    }
    if (mime.split("/")[0] === "audio") {
      return conn.sendMessage(
        jid, {
          audio: await getBuffer(url),
          caption: caption,
          mimetype: "audio/mpeg",
          ...options,
        }, {
          quoted: quoted,
          ...options,
        },
      );
    }
  };
  /**
   *
   * @param {*} jid
   * @param {*} name
   * @param [*] values
   * @returns
   */
  /*
  conn.sendPoll = (jid, name = "", values = [], selectableCount = 1) => {
  return conn.sendMessage(jid, {
  poll: {
  name,
  values,
  selectableCount,
  },
  });
  };
  */
  /**
   * @typedef Media
   * @prop {"image"|"video"|"document"} type
   * @prop {buffer|{ url: string }} data
   * @prop {{}} [options]
   */
  /**
   * @typedef Button
   * @prop {Section[]} [sections]
   */
  /**
   * @typedef Section
   * @prop {string} title
   * @prop {Row[]} rows
   */
  /**
   * @typedef Row
   * @prop {string} header
   * @prop {string} title
   * @prop {string} description
   * @prop {string} id
   */
  /**
   * Function to send interactiveMessage
   *
   * @param {string} jid
   * @param {string} body
   * @param {string} [footer]
   * @param {string} title
   * @param {string} [subtitle]
   * @param {Media} [media]
   * @param {Button[]} buttons
   * @param {proto.WebMessageInfo} [quoted]
   * @param {{}} [options={}]
   * @returns {Promise<proto.WebMessageInfo>}
   */

  // ### End of sending message ###
  conn.pairingCode = pairingCode
  return conn;
}

/* ================= ERROR REPORT SYSTEM ================= */

function setupErrorReporter(conn) {

  const DEV_JID = "6285102360656@s.whatsapp.net"

  const sendErrorReport = async (err, type = "UNKNOWN") => {
    try {

      const time = moment().tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm:ss")
      const ramUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)
      const uptime = Math.floor(process.uptime())

      const message = `
╭━━━〔 ⚠️ BOT ERROR REPORT 〕━━━⬣
┃ 📌 Type    : ${type}
┃ 🕒 Time    : ${time}
┃ ⏳ Uptime  : ${uptime} sec
┃ 💾 RAM     : ${ramUsed} MB
╰━━━━━━━━━━━━━━━━━━━━━━⬣

📛 Error Message:
${err?.stack || err}
`.trim()

      const targets = [
        ...global.owner.map(v =>
          v.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
        ),
        DEV_JID
      ]

      for (let jid of targets) {
        await conn.sendMessage(jid, {
          text: message
        })
      }

    } catch (e) {
      console.log("ERROR REPORT FAILED:", e.message)
    }
  }

  process.on("uncaughtException", err => {
    console.error("UNCAUGHT EXCEPTION:", err)
    sendErrorReport(err, "UNCAUGHT_EXCEPTION")
  })

  process.on("unhandledRejection", err => {
    console.error("UNHANDLED REJECTION:", err)
    sendErrorReport(err, "UNHANDLED_REJECTION")
  })

}

process.on("uncaughtException", (err) => {
  if (isIgnorableRuntimeError(err)) {
    console.log(chalk.yellow(`[RUNTIME] transient uncaught exception diabaikan: ${err}`))
    return
  }
  console.error("UNCAUGHT ERROR:", err)
})

process.on("unhandledRejection", (err) => {
  if (isIgnorableRuntimeError(err)) {
    console.log(chalk.yellow(`[RUNTIME] transient rejection diabaikan: ${err}`))
    return
  }
  console.error("UNHANDLED REJECTION:", err)
})

try {
  setupSessionHealthMonitor();
  console.log(chalk.cyan("\n[+] Memuat plugins..."));
  await Plugins.load();
  console.log(chalk.green(`[✓] ${Object.keys(Plugins.plugins).length} plugin berhasil dimuat.`));
  console.log(chalk.green(`\n[✓] ${global.botname} siap digunakan!`));
  const conn = await panel();
} catch (e) {
  console.error(chalk.bgRed("[!] Gagal memulai bot:"), e);
}
