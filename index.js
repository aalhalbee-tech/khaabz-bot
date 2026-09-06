require('http').createServer((req,res)=>{res.writeHead(200);res.end('Bot Live')}).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
if (fs.existsSync('./auth_info')) fs.rmSync('./auth_info',{recursive:true});
async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:['Khaabz Bot','Chrome','1.0.0'] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (update)=>{
    const { connection, lastDisconnect, qr } = update;
    if(qr){
      console.log('===== امسح هذا الباركود =====');
      qrcode.generate(qr, {small:true});
      console.log('QR CODE:', qr);
    }
    if(connection==='close'){
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if(shouldReconnect) startBot();
    } else if(connection==='open'){
      console.log('✅ تم الربط بنجاح!');
    }
  });
}
startBot();
