const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const express = require("express")
const QRCode = require("qrcode")

const app = express()
let lastQR = null

app.get("/", async (req,res) => {
  if (!lastQR) return res.send("<h1>انتظر... الباركود جاي ⏳ حدث الصفحة بعد 5 ثواني</h1>")
  const qrImage = await QRCode.toDataURL(lastQR)
  res.send(`
    <div style="text-align:center; font-family:sans-serif; margin-top:50px">
      <h1>📱 امسح الباركود بواتساب</h1>
      <p>واتساب > الأجهزة المرتبطة > ربط جهاز > امسح</p>
      <img src="${qrImage}" style="width:300px; height:300px; border:10px solid #000; border-radius:20px"/>
      <p>الباركود يتغير كل 20 ثانية، حدث الصفحة اذا انتهى</p>
    </div>
  `)
})

app.listen(process.env.PORT || 10000, () => console.log("web شغال"))

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: ["Khaabz","Chrome","1.0"] })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (u) => {
    if (u.qr) {
      lastQR = u.qr
      console.log("طلع باركود جديد - افتح رابط موقعك")
    }
    if (u.connection === "open") {
      console.log("✅ تم الربط!")
      lastQR = null
    }
  })

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    if (text.trim() === ".ذكر") {
      await sock.sendMessage(msg.key.remoteJid, { text: "📿 سبحان الله وبحمده سبحان الله العظيم" })
    }
  })
}
start()
