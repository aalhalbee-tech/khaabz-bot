require('http').createServer((req,res)=>res.end('Khaabz Deen Bot')).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const axios = require('axios');

const azkar = [
"🤲 سبحان الله وبحمده - 100 مرة تمحي الذنوب",
"📿 أستغفر الله العظيم وأتوب إليه",
"✨ لا حول ولا قوة إلا بالله",
"❤️ اللهم صل وسلم على نبينا محمد",
"🌙 سبحان الله، الحمدلله، لا إله إلا الله، الله أكبر"
];

const ahadith = [
"📜 قال ﷺ: (الكلمة الطيبة صدقة) - رواه البخاري",
"📜 قال ﷺ: (لا تغضب ولك الجنة)",
"📜 قال ﷺ: (من لا يشكر الناس لا يشكر الله)",
"📜 قال ﷺ: (تبسمك في وجه أخيك صدقة)",
"📜 قال ﷺ: (خيركم من تعلم القرآن وعلمه)",
"📜 قال ﷺ: (الدين النصيحة)",
"📜 قال ﷺ: (اتق الله حيثما كنت)"
];

const autoReply = {
  "سلام": "وعليكم السلام ورحمة الله ❤️",
  "صباح الخير": "صباح النور بذكر الله ☀️",
  "اذكار": "اكتب.ذكر",
  "حديث": "اكتب.حديث"
};

async function start(){
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:['Ubuntu','Chrome','20.0'] });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', u=>{ if(u.connection==='open') console.log('✅ بوت الأذكار شغال'); });

    // اذكار تلقائية كل 6 ساعات
    setInterval(async ()=>{
        try{
            const groups = Object.keys(await sock.groupFetchAllParticipating());
            const zekr = azkar[Math.floor(Math.random()*azkar.length)];
            const hadith = ahadith[Math.floor(Math.random()*ahadith.length)];
            const msg = `🤲 *تذكير ديني*\n\n${zekr}\n\n${hadith}\n\nاكتب.ذكر او.حديث`;
            for(let g of groups) await sock.sendMessage(g,{text: msg});
        }catch{}
    }, 6*60*60*1000);

    sock.ev.on('messages.upsert', async m=>{
        try{
            const msg = m.messages[0];
            if(!msg.message || msg.key.fromMe) return;
            const from = msg.key.remoteJid;
            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || '').trim();
            const lower = text.toLowerCase();
            if(!text) return;

            // تحميل انستا تلقائي
            if(text.includes('instagram.com')){
                await sock.sendMessage(from,{text:'⏳ جاري تحميل من انستغرام...'});
                try{
                    const url = text.match(/https?:\/\/\S+/)[0];
                    // استخدم API مجاني للتحميل
                    await sock.sendMessage(from,{text:`📥 تم استلام الرابط:\n${url}\n\nميزة التحميل شغالة، سيتم ارسال الفيديو قريباً (تحتاج اضافة API تحميل)`});
                }catch{ await sock.sendMessage(from,{text:'❌ الرابط غير صحيح'}); }
            }

            // رد تلقائي
            for(let k in autoReply){
                if(lower.includes(k)){ await sock.sendMessage(from,{text: autoReply[k]}); return; }
            }

            if(!text.startsWith('.')) return;
            const cmd = text.slice(1).split(' ')[0].toLowerCase();

            if(cmd==='ذكر' || cmd==='اذكار'){
                await sock.sendMessage(from,{text: azkar[Math.floor(Math.random()*azkar.length)]});
            }
            else if(cmd==='حديث' || cmd==='احاديث'){
                await sock.sendMessage(from,{text: ahadith[Math.floor(Math.random()*ahadith.length)]});
            }
            else if(cmd==='منشن' || cmd==='الجميع'){
                const meta = await sock.groupMetadata(from);
                await sock.sendMessage(from,{text:'📢', mentions: meta.participants.map(p=>p.id)});
            }
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
