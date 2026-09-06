require('http').createServer((req,res)=>{res.writeHead(200);res.end('Bot Live')}).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

console.log("بدا التشغيل...");
if (fs.existsSync('./auth_info')) {
  fs.rmSync('./auth_info', {recursive:true, force:true});
  console.log("مسحت الجلسة القديمة");
}

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:['Ubuntu','Chrome','20.0.04'] });
  sock.ev.on('creds.update', saveCreds);

  if(!sock.authState.creds.registered){
    setTimeout(async ()=>{
      try{
        let phone = "963993675005";
        console.log("عم اطلب كود للرقم:", phone);
        let code = await sock.requestPairingCode(phone);
        console.log("============================");
        console.log("كود الربط هو:", code);
        console.log("============================");
      }catch(e){ console.log("خطأ بالكود:", e.message); }
    }, 8000);
  }

  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('✅✅✅ تم الربط بنجاح ✅✅✅');
  });
}
startBot();
