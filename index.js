require('http').createServer((_,r)=>r.end('Online')).listen(process.env.PORT||10000);
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({auth:state, logger:P({level:'silent'}), browser:['Chrome','Ubuntu','22.04']});
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', u=>{
    if(u.connection==='open') console.log('✅ شغال');
    if(u.connection==='close') setTimeout(start,3000);
  });
  sock.ev.on('messages.upsert', async ({messages})=>{
    const msg = messages[0];
    if(!msg.message) return;
    const text = (msg.message.conversation||msg.message.extendedTextMessage?.text||'').trim();
    const from = msg.key.remoteJid;
    console.log(`رسالة وصلت من ${from}: ${text} | fromMe=${msg.key.fromMe}`);
    // يرد حتى على نفسه للتجربة
    if(text.toLowerCase().includes('ذكر')){
      await sock.sendMessage(from, {text:'✅ شفت رسالتك - سبحان الله وبحمده ❤️'});
      console.log('تم الرد');
    }
    if(text.toLowerCase().includes('تست')){
      await sock.sendMessage(from, {text:'البوت شغال 100% ✅'});
    }
  });
}
start();
