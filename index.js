// Mai Bot - نسخة ثابتة 100% - لا تولد QR اذا مربوط
require('http').createServer((_,r)=>r.end('Online')).listen(process.env.PORT||10000);

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

const AZKAR = [
"سبحان الله وبحمده، سبحان الله العظيم ❤️",
"سبحان الله والحمد لله ولا إله إلا الله والله أكبر",
"أستغفر الله العظيم وأتوب إليه",
"اللهم صل وسلم على نبينا محمد ﷺ",
"لا حول ولا قوة إلا بالله",
"لا إله إلا أنت سبحانك إني كنت من الظالمين"
];

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({level:'silent'}),
    browser: ['Chrome','Ubuntu','22.04'],
    printQRInTerminal: false,
    syncFullHistory: false,
  });

  sock.ev.on('creds.update', saveCreds);

  // اطبع QR بس اذا مو مسجل - اذا مسجل مثل صورتك ما يطبع شي
  sock.ev.on('connection.update', async (u) => {
    if (u.qr &&!state.creds.registered) {
      console.log('QR:', u.qr);
    }
    if (u.connection === 'open') {
      console.log('✅ البوت شغال - الجلسة محفوظة');
    }
    if (u.connection === 'close') {
      console.log('انقطع - يعيد التشغيل بعد 3 ثواني');
      setTimeout(start, 3000);
    }
  });

  sock.ev.on('messages.upsert', async ({messages}) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    let txt = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
    if(!txt) return;
    let cmd = txt.toLowerCase().replace(/^[.\/!]/,'').trim();

    try {
      if (['اوامر','menu','بوت','help','الاوامر'].includes(cmd)) {
        await sock.sendMessage(jid, {text:
`🤖 *بوت Mai* شغال ✅

.ذكر - ذكر عشوائي
.دعاء - دعاء
.حديث - حديث شريف
.اية - آية قرآنية

اكتب الأمر مع نقطة أو بدون`});
      }
      else if (cmd.includes('ذكر')) {
        await sock.sendMessage(jid, {text: AZKAR[Math.floor(Math.random()*AZKAR.length)]});
      }
      else if (cmd.includes('دعاء')) {
        await sock.sendMessage(jid, {text: '🤲 اللهم إني أسألك العفو والعافية في الدنيا والآخرة'});
      }
      else if (cmd.includes('حديث')) {
        await sock.sendMessage(jid, {text: '📜 قال ﷺ: من قال سبحان الله وبحمده مائة مرة حطت خطاياه وإن كانت مثل زبد البحر'});
      }
      else if (cmd.includes('اية') || cmd.includes('قران')) {
        await sock.sendMessage(jid, {text: '﴿ وَاذْكُرْ رَبَّكَ إِذَا نَسِيتَ ﴾ [الكهف:24] 🤍'});
      }
    } catch(e){ console.log(e.message) }
  });
}
start();
