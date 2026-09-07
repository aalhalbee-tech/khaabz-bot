const express = require('express')
const app = express()
app.get('/', (req,res)=> res.send('Khaabz Bot is Running ✅'))
app.listen(process.env.PORT || 3000, ()=> console.log("Web Port Fixed"))

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const qrcode = require('qrcode-terminal')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ["Khaabz Bot", "Chrome", "1.0.0"]
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (up) => {
    const { connection, lastDisconnect, qr } = up

    if(qr) {
      console.log("\n==========================")
      qrcode.generate(qr, { small: true })
      console.log("==========================")
      console.log("امسح الباركود هلا من واتساب > الاجهزة المرتبطة")
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      console.log("انقطع الاتصال، عم جدد الباركود...")
      if (code!== DisconnectReason.loggedOut) {
        setTimeout(()=> startBot(), 3000)
      }
    }

    if (connection === 'open') {
      console.log('✅ تم الربط بنجاح - البوت شغال')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ""
    const from = m.key.remoteJid

    console.log("رسالة:", text)

    if (text.trim() === "الاوامر") {
      await sock.sendMessage(from, {
        text: `*أهلا بك في Khaabz Bot* 👑

*الاوامر:*
>.ملصق - حول صورة لملصق
>.جوجل - بحث
>.ذكاء - اسأل الذكاء

البوت شغال 24/7 ✅`
      })
    }
  })
}

startBot()
