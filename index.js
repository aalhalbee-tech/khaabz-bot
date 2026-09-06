require('http').createServer((_,r)=>r.end('Online')).listen(process.env.PORT||10000);
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

// اذا في جلسة محفوظة بمتغير البيئة رجعها
if(process.env.SESSION &&!fs.existsSync('./auth/creds.json')){
  fs.mkdirSync('./auth',{recursive:true});
  fs.writeFileSync('./auth/creds.json', Buffer.from(process.env.SESSION,'base64').toString());
}

async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({auth:state, logger:P({level:'silent'}), browser:['Chrome','Ubuntu','22.04']});
  sock.ev.on('creds.update', async ()=>{
    await saveCreds();
    try{
      const data = fs.readFileSync('./auth/creds.json');
      console.log('=== انسخ هذا المتغير وحطه في Render ===');
      console.log(Buffer.from(data).toString('base64').slice(0,200)+'...');
      console.log('الجلسة انحفظت، صارت ثابتة');
    }catch(e){}
  });
  sock.ev.on('connection.update', u=>{
    if(u.qr &&!state.creds.registered) console.log('QR:', u.qr);
    if(u.connection==='open') console.log('✅ شغال وثابت');
    if(u.connection==='close') setTimeout(start,3000);
  });
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m=messages[0]; if(!m?.message) return;
    const txt=(m.message.conversation||m.message.extendedTextMessage?.text||'').toLowerCase();
    if(txt.includes('ذكر')) await sock.sendMessage(m.key.remoteJid,{text:'سبحان الله وبحمده ❤️'});
    if(txt.includes('اوامر')) await sock.sendMessage(m.key.remoteJid,{text:'🤖 شغال ✅\n.ذكر\n.دعاء'});
  });
}
start();
