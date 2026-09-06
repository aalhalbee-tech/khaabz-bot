require('http').createServer((req,res)=>res.end('Bot Azkar ON')).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const P = require('pino');

const azkar = [
"سبحان الله وبحمده، سبحان الله العظيم ❤️",
"لا إله إلا الله وحده لا شريك له، له الملك وله الحمد",
"أستغفر الله العظيم وأتوب إليه",
"اللهم صل وسلم على نبينا محمد ﷺ",
"لا حول ولا قوة إلا بالله",
"سبحان الله، الحمد لله، لا إله إلا الله، الله أكبر"
];
const ahadith = [
"قال ﷺ: من قال سبحان الله وبحمده 100 مرة حُطت خطاياه",
"قال ﷺ: كلمتان خفيفتان على اللسان ثقيلتان في الميزان: سبحان الله وبحمده سبحان الله العظيم",
"قال ﷺ: من صلى عليّ واحدة صلى الله عليه عشرا"
];
const ad3iya = [
"اللهم إني أسألك العفو والعافية في الدنيا والآخرة",
"اللهم اغفر لي وارحمني واهدني وعافني وارزقني",
"يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله"
];

async function start(){
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const sock = makeWASocket({ version, auth: state, logger: P({level:'silent'}), browser:['Ubuntu','Chrome','20.0'] });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', u=>{
        const { connection, qr } = u;
        if(qr){
            console.log('QR:', qr);
            console.log('افتح: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='+encodeURIComponent(qr));
        }
        if(connection==='open') console.log('✅ تم الاتصال');
        if(connection==='close') start();
    });
    sock.ev.on('messages.upsert', async m=>{
        try{
            const msg = m.messages[0];
            if(!msg.message || msg.key.fromMe) return;
            const from = msg.key.remoteJid;
            let text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase();
            // يشيل النقطة
            text = text.replace('.', '');

            if(text==='اوامر' || text==='بوت' || text==='menu'){
                await sock.sendMessage(from, {text:`🤖 *بوت الأذكار - Mai* 🤍

*الأوامر:*
.ذكر - ذكر عشوائي
.حديث - حديث شريف
.دعاء - دعاء
.اذكار - اذكار الصباح والمساء
.قران - آية
.اوامر - هذه القائمة

سبحان الله وبحمده ❤️`});
            }
            else if(text==='ذكر' || text==='اذكار' || text==='زكر'){
                await sock.sendMessage(from, {text: azkar[Math.floor(Math.random()*azkar.length)]});
            }
            else if(text==='حديث'){
                await sock.sendMessage(from, {text: '📜 '+ahadith[Math.floor(Math.random()*ahadith.length)]});
            }
            else if(text==='دعاء' || text=='دعاء'){
                await sock.sendMessage(from, {text: '🤲 '+ad3iya[Math.floor(Math.random()*ad3iya.length)]});
            }
        }catch(e){ console.log(e); }
    });

    // اذكار تلقائية كل ساعة - اذا تبي تلغيها احذف السطرين اللي تحت
    // setInterval(async()=>{
    // // هنا تقدر تحط id قروب يرسل له تلقائي
    // }, 3600000);
}
start();
