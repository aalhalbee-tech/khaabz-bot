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
        browser:['Ubuntu','Chrome','20.0'],
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', u=>{
        const { connection } = u;
        if(connection==='open') console.log('✅ تم الاتصال - البوت جاهز');
        if(connection==='close') start();
    });

    sock.ev.on('messages.upsert', async m=>{
        try{
            const msg = m.messages[0];
            if(!msg.message) return;

            const from = msg.key.remoteJid;
            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || '').trim();

            console.log('وصلت رسالة:', text);

            if(text === '.اوامر' || text === '.بوت' || text === '.ذكر' || text === '.حديث'){
                await sock.sendMessage(from, {text: `✅ البوت شغال 100%\n\nالأوامر:\n.ذكر - ذكر عشوائي\n.حديث - حديث نبوي\n\nسبحان الله وبحمده سبحان الله العظيم ❤️`});
                console.log('رديت على:', from);
            }
        }catch(e){
            console.log('خطأ:', e.message);
        }
    });
}
start();
