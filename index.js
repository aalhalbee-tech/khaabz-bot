const express = require('express');
const app = express();
app.get('/', (req,res)=> res.send('bot on'));
app.listen(process.env.PORT || 10000);
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const P = require('pino');
let DB={}; try{DB=JSON.parse(fs.readFileSync('./db.json'));}catch(e){DB={}}
const save=()=>fs.writeFileSync('./db.json', JSON.stringify(DB,null,2));
const today=()=>new Date().toISOString().split('T')[0];
const footer="\n\n- المصمم ابو تقى";
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({auth: state, logger: P({level:'silent'}), printQRInTerminal: true});
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', u=>{ if(u.qr) console.log('QR:'+u.qr); if(u.connection==='open') console.log('CONNECTED'); });
  sock.ev.on('messages.upsert', async m=>{
    const msg=m.messages[0]; if(!msg.message || msg.key.fromMe) return;
    const id=msg.key.remoteJid; if(id.includes('@g.us')) return;
    let text=(msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
    if(!DB[id]) DB[id]={days:{}}; let k=today(); if(DB[id].days[k]==undefined) DB[id].days[k]=0;
    if(text=='0' || text=='ما اخذنا'){ DB[id].days[k]=0; save(); await sock.sendMessage(id,{text:'اليوم ما اخذت ❌'+footer}); return; }
    if(!isNaN(text) && text!==''){ let n=parseInt(text); if(n>0){ DB[id].days[k]+=n; save(); await sock.sendMessage(id,{text:'تسجل '+n+' - اليوم: '+DB[id].days[k]+footer}); } return; }
    if(text=='اليوم'){ await sock.sendMessage(id,{text:'اليوم: '+(DB[id].days[k]||0)+footer}); return; }
    if(text=='الشهر'){ let tot=0, res='الشهر:\n'; Object.keys(DB[id].days).forEach(d=>{ res+=d+': '+DB[id].days[d]+'\n'; tot+=DB[id].days[d]; }); res+='الاجمالي: '+tot+footer; await sock.sendMessage(id,{text:res}); return; }
    await sock.sendMessage(id,{text:'ابعت رقم: 1 او 2 او 0 اذا ما اخذت'+footer});
  });
}
start();
