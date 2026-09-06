require('http').createServer((req,res)=>res.end('Khaabz Bot Live')).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');

async function start(){
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const sock = makeWASocket({
        auth: state,
        logger: P({level:'silent'}),
        browser: ['Ubuntu','Chrome','20.0'],
        printQRInTerminal: false
    });
    sock.ev.on('creds.update', saveCreds);

    // اذا مو مربوط طلع كود
    if(!state.creds.registered){
        setTimeout(async()=>{
            try{
                let code = await sock.requestPairingCode('963993675005');
                console.log(`\n====================`);
                console.log(`الكود تبعك هو: ${code}`);
                console.log(`روح واتساب > الاجهزة المرتبطة > ربط برقم الهاتف`);
                console.log(`====================\n`);
            }catch(e){ console.log('خطأ:', e.message); }
        }, 5000);
    }

    sock.ev.on('connection.update', async (u)=>{
        if(u.connection === 'open'){
            console.log('✅✅✅ البوت شغال ومربوط - Khaabz Bot Ready');
        }
        if(u.connection === 'close'){
            const code = u.lastDisconnect?.error?.output?.statusCode;
            if(code !== DisconnectReason.loggedOut) start();
            else console.log('تم تسجيل الخروج، احذف مجلد auth_info واعمل Deploy');
        }
    });

    sock.ev.on('messages.upsert', async m=>{
        try{
            const msg = m.messages[0];
            if(!msg.message || msg.key.fromMe) return;
            const from = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            if(!text.startsWith('.')) return;
            const args = text.slice(1).trim().split(/ +/);
            const cmd = args.shift().toLowerCase();

            if(cmd === 'منشن' || cmd === 'الجميع' || cmd === 'tagall'){
                if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'للقروبات فقط'});
                const meta = await sock.groupMetadata(from);
                const mentions = meta.participants.map(p=>p.id);
                await sock.sendMessage(from,{text:`منشن للكل 📢\n${args.join(' ')||''}`,mentions});
            }
            if(cmd === 'اوامر' || cmd === 'help'){
                await sock.sendMessage(from,{text:`🤖 اوامر بوت خابز\n\n.منشن - منشن للكل\n.اوامر - القائمة`});
            }
        }catch(e){}
    });
}
start();
