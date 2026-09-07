const express = require('express')
const app = express()
app.get('/', (req,res)=> res.send('Bot Running'))
app.listen(process.env.PORT || 3000, ()=> console.log("Port OK"))

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const qrcode = require('qrcode-terminal')

async function startBot(){
const { state, saveCreds } = await useMultiFileAuthState('auth')
const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:["Khaabz","Chrome","1.0.0"] })
sock.ev.on('creds.update', saveCreds)
sock.ev.on('connection.update', async (u)=>{
const {connection,lastDisconnect,qr}=u
if(qr){ qrcode.generate(qr,{small:true}); console.log("امسح الباركود هلا") }
if(connection==='close' && lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut){ setTimeout(startBot,3000) }
if(connection==='open') console.log('✅ تم الربط')
})
sock.ev.on('messages.upsert', async ({messages})=>{
const m=messages[0]; if(!m.message||m.key.fromMe) return
const txt=m.message.conversation||m.message.extendedTextMessage?.text||""
if(txt.trim()==="الاوامر"){ await sock.sendMessage(m.key.remoteJid,{text:"✅ شغال\n.ملصق\n.جوجل"}) }
})
}
startBot()
