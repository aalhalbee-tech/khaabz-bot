const http = require('http');
const QRCode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');

let lastQR = null;

const server = http.createServer(async (req,res)=>{
  if(lastQR){
    const qrImage = await QRCode.toDataURL(lastQR);
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(`<center><h1>امسح الـ QR بواتسابك</h1><img src="${qrImage}" width="350"/><br><br><a href="/">تحديث</a><br><p>واتساب > الاجهزة المرتبطة > ربط جهاز > مسح الرمز</p></center>`);
  } else {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(`<center><h1>انتظر... جاري توليد QR</h1><p>حدث الصفحة بعد 10 ثواني</p><a href="/">تحديث</a></center>`);
  }
});
server.listen(process.env.PORT||3000);

async function start(){
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:['Ubuntu','Chrome','20.0'] });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (u)=>{
        const { connection, lastDisconnect, qr } = u;
        if(qr){ lastQR = qr; console.log('QR جديد - افتح موقعك: https://khaabz-bot.onrender.com'); }
        if(connection === 'open'){ console.log('✅✅✅ تم الربط بنجاح'); lastQR = null; }
        if(connection === 'close'){
            if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) start();
        }
    });
    sock.ev.on('messages.upsert', async m=>{
        const msg = m.messages[0];
        if(!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if(!text.startsWith('.')) return;
        const args = text.slice(1).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        if(cmd === 'منشن' || cmd === 'الجميع'){
            const meta = await sock.groupMetadata(from);
            const mentions = meta.participants.map(p=>p.id);
            await sock.sendMessage(from,{text:`منشن للكل 📢\n${args.join(' ')}`, mentions});
        }
    });
}
start();
