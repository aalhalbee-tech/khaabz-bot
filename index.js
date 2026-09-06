const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const express = require("express")
const QRCode = require("qrcode")
const app = express()
let qr = null
let connected = false

app.get("/", async (req,res)=>{
  if(connected) return res.send("<h1 style='text-align:center;margin-top:100px'>✅ تم الربط بنجاح - تقدر تسكر الصفحة</h1>")
  if(!qr) return res.send('<head><meta http-equiv="refresh" content="2"></head><h1 style=text-align:center;margin-top:100px>⏳ جاري توليد الباركود... ثانيتين</h1>')
  const img = await QRCode.toDataURL(qr)
  res.send(`<div style=text-align:center;font-family:sans-serif;margin-top:30px><h1>📱 امسح الباركود</h1><p>واتساب > الأجهزة المرتبطة > ربط جهاز</p><img src="${img}" style="width:340px;height:340px;border:10px solid #000;border-radius:20px"/><p style=color:red;font-weight:bold>يتجدد كل 20 ثانية - الصفحة تحدث لحالها</p><script>setTimeout(()=>location.reload(),20000)</script></div>`)
})
app.listen(process.env.PORT||10000)

async function start(){
  const {state, saveCreds} = await useMultiFileAuthState("session")
  const sock = makeWASocket({auth: state, browser: ["Khaabz","Chrome","1.0"]})
  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", u=>{
    if(u.qr){ qr=u.qr; console.log("باركود جديد") }
    if(u.connection==="open"){ connected=true; qr=null; console.log("تم الربط!") }
    if(u.connection==="close") setTimeout(start,3000)
  })
}
start()
