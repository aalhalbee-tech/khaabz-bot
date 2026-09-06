require('http').createServer((_,r)=>r.end('Bot Online')).listen(process.env.PORT||10000);
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

async function start(){
  if(process.env.SESSION &&!fs.existsSync('./auth/creds.json')){
    fs.mkdirSync('./auth',{recursive:true});
    fs.writeFileSync('./auth/creds.json', Buffer.from(process.env.SESSION,'base64').toString());
  }
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({auth:state, logger:P({level:'silent'}), browser:['Ubuntu','Chrome','22.04']});
  sock.ev.on('creds.update', saveCreds);

  if(!state.creds.registered){
    setTimeout(async()=>{
      try{
        let num = (process.env.NUMBER||'').replace(/[^0-9]/g,'');
        if(!num){ console.log('حط رقمك في Environment باسم NUMBER'); return; }
        let code = await sock.requestPairingCode(num);
        console.log('كود الربط تبعك هو: '+code);
        console.log('روح واتساب > الاجهزة المرتبطة > ربط برقم هاتف > اكتب الكود هذا');
      }catch(e){ console.log('خطأ:',e.message); }
    },5000);
  }

  sock.ev.on('connection.update', async u=>{
    if(u.connection==='open'){
      console.log('✅✅✅ البوت اشتغل وثبت');
      if(fs.existsSync('./auth/creds.json')){
        let b64 = Buffer.from(fs.readFileSync('./auth/creds.json')).toString('base64');
        console.log('SESSION:'+b64);
        console.log('انسخ السطر اللي فوق كله وحطه في Environment باسم SESSION عشان يثبت للأبد');
      }
    }
    if(u.connection==='close') setTimeout(start,3000);
  });

  sock.ev.on('messages.upsert', async ({messages})=>{
    const m=messages[0]; if(!m?.message || m.key.fromMe) return;
    let t=(m.message.conversation||m.message.extendedTextMessage?.text||'').toLowerCase();
    if(t.includes('ذكر')) await sock.sendMessage(m.key.remoteJid,{text:'سبحان الله وبحمده ❤️'});
    if(t.includes('اوامر')) await sock.sendMessage(m.key.remoteJid,{text:'🤖 شغال\n.ذكر'});
  });
}
start();
