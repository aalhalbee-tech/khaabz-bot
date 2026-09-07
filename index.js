const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true, // باركود
    browser: ["Khaabz", "Chrome", "1.0.0"]
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect } = u

    if (connection === 'open') {
      console.log('✅ البوت مربوط وشغال')
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log("انتهى الباركود، جاري تجديد واحد جديد...")
      if (reason!== DisconnectReason.loggedOut) {
        setTimeout(() => startBot(), 3000) // يطلع باركود جديد بعد 3 ثواني
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    const from = msg.key.remoteJid
    if (text.trim() === "الاوامر") {
      await sock.sendMessage(from, { text: "✅ البوت شغال\n\n.ملصق\n.جوجل\n.ذكاء" })
    }
  })
}

startBot()
