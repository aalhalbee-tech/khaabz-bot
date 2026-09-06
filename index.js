require('http').createServer((req,res)=>res.end('Bot ON')).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

async function start(){
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:['Ubuntu','Chrome','20.0'] });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', u=>{
        console.log(u);
        if(u.connection==='open') console.log('✅ تم الاتصال');
    });

    sock.ev.on('messages.upsert', async m=>{
        try{
            const msg = m.messages[0];
            if(!msg.message) return;
            const from = msg.key.remoteJid;
            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
            console.log('رسالة وصلت:', text, 'من:', from, 'مني؟', msg.key.fromMe);

            if(text === '.اوامر' || text === '.ذكر' || text === '.حديث'){
                await sock.sendMessage(from, {text: '✅ البوت شغال! \n\n.ذكر = ذكر عشوائي\n.حديث = حديث قصير\n\nسبحان الله وبحمده سبحان الله العظيم ❤️'});
                console.log('رديت!');
            }
        }catch(e){ console.log('خطأ:', e); }
    });
}
start();            }
            else if(cmd==='مخفي'){
                const meta = await sock.groupMetadata(from);
                const t = text.slice(6) || '🤲 اذكروا الله';
                await sock.sendMessage(from,{text: t, mentions: meta.participants.map(p=>p.id)});
            }
            else if(cmd==='ملصق' || cmd==='s'){
                const q = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
                const target = q? {message: q} : msg;
                const buf = await sock.downloadMediaMessage(target).catch(()=>null);
                if(buf) await sock.sendMessage(from,{sticker: buf});
            }
            else if(cmd==='اوامر'){
                await sock.sendMessage(from,{text:`🤖 *بوت خابز الديني*\n\n📿.ذكر - ذكر عشوائي\n📜.حديث - حديث قصير\n👥.منشن /.مخفي\n🏷️.ملصق\n📥 ارسل رابط انستا يحمله تلقائي\n\nالبوت يرسل اذكار كل 6 ساعات تلقائي 🤲`});
            }
        }catch{}
    });
}
start();
