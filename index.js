const express = require('express')
const app = express()
app.get('/', (req,res)=> res.send('Khaabz Bot Running'))
app.listen(process.env.PORT || 3000, ()=> console.log("Web server running"))

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ["Khaabz Bot", "Chrome", "1.0.0"]
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (up) => {
    const { connection, lastDisconnect, qr } = up
    if(qr) console.log("باركود جديد طلع، امسحه بسرعة!")
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) {
        console.log("الباركود انتهى، راح اطلع واحد جديد...")
        startBot()
      }
    }
    if (connection === 'open') console.log('✅ تم الربط! البوت شغال')
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ""
    const from = m.key.remoteJid
    if (text.trim() === "الاوامر") {
      await sock.sendMessage(from, { text: "✅ البوت شغال يا غالي\n\nالاوامر:\n.ملصق\n.جوجل\n.ذكاء" })
    }
  })
}
startBot()
