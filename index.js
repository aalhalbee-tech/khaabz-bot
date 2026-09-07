const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')

async function start(){
const { state, saveCreds } = await useMultiFileAuthState('auth')
const sock = makeWASocket({ auth: state, browser: ["Chrome","Chrome","1.0"] })
sock.ev.on('creds.update', saveCreds)

if(!state.creds.registered){
  let phone = "963993675005" // <-- حط رقمك هنا مع رمز البلد 963
  setTimeout(async ()=>{
    let code = await sock.requestPairingCode(phone)
    console.log("كود الربط تبعك: " + code)
  }, 3000)
}

sock.ev.on('connection.update', (u)=>{
  if(u.connection=="open") console.log("✅ ارتبط واتساب بنجاح!")
})
// ... باقي أوامر البوت تبعك تحت
}
start()
