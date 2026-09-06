require('http').createServer((req,res)=>res.end('Bot ON')).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

async function start(){
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:['Ubuntu','Chrome','20.0'] });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', u=>{
        if(u.connection==='open') console.log('✅ تم الاتصال');
    });
    sock.ev.on('messages.upsert', async m=>{
        try{
            const msg = m.messages[0];
            if(!msg.message || msg.key.fromMe) return;
            const from = msg.key.remoteJid;
            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
            console.log('وصل:', text);
            if(['.اوامر','.ذكر','.حديث','.بوت'].includes(text)){
                await sock.sendMessage(from, {text: '✅ البوت شغال!\n\n.ذكر\n.حديث\n\nسبحان الله وبحمده ❤️'});
            }
        }catch(e){ console.log(e); }
    });
}
start();
