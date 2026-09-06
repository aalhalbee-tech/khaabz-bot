require('http').createServer((req,res)=>res.end('Bot ON')).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const P = require('pino');

async function start(){
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({level:'silent'}),
        browser:['Ubuntu','Chrome','20.0']
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (u)=>{
        const { connection, qr } = u;
        if(qr){
            console.log('===== QR CODE =====');
            console.log(qr);
            console.log('انسخ هذا الكود وافتح: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='+encodeURIComponent(qr));
            console.log('===== END QR =====');
        }
        if(connection==='open') console.log('✅✅✅ تم الاتصال - البوت جاهز ✅✅✅');
        if(connection==='close') start();
    });
    sock.ev.on('messages.upsert', async m=>{
        try{
            const msg = m.messages[0];
            if(!msg.message) return;
            const from = msg.key.remoteJid;
            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase();
            console.log('وصل:', text);
            if(['.اوامر','.بوت','.ذكر','.حديث'].includes(text)){
                await sock.sendMessage(from, {text: '✅ البوت اشتغل!\n\n.ذكر\n.حديث\n\nسبحان الله وبحمده ❤️'});
            }
        }catch(e){ console.log(e); }
    });
}
start();
