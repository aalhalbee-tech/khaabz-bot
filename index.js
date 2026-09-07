const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false, // بدون باركود
    browser: ["Khaabz", "Chrome", "1.0.0"]
  })

  sock.ev.on('creds.update', saveCreds)

  // يطلع كود الربط فقط
  if (!sock.authState.creds.registered) {
    await new Promise(r => setTimeout(r, 3000))
    const num = "963993675005" // <--- حط رقمك هنا مع رمز البلد بدون +
    const code = await sock.requestPairingCode(num)
    console.log("==========================")
    console.log("كود الربط: " + code)
    console.log("==========================")
  }

  sock.ev.on('connection.update', (u) => {
    if (u.connection === 'open') console.log('✅ البوت مربوط وشغال')
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
