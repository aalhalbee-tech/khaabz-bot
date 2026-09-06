// بوت أذكار احترافي - Khaabz Bot
const http = require('http');
http.createServer((req, res) => res.end('Khaabz Bot Online ✅')).listen(process.env.PORT || 10000);

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

// === قاعدة البيانات ===
const DB = {
  azkar: [
    "سبحان الله وبحمده، سبحان الله العظيم ❤️",
    "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
    "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه",
    "اللهم صل وسلم وبارك على نبينا محمد ﷺ",
    "لا حول ولا قوة إلا بالله العلي العظيم",
    "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر",
  ],
  ahadith: [
    "قال ﷺ: (كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن: سبحان الله وبحمده سبحان الله العظيم)",
    "قال ﷺ: (من قال سبحان الله وبحمده في يوم مائة مرة حطت خطاياه وإن كانت مثل زبد البحر)",
    "قال ﷺ: (من صلى علي واحدة صلى الله عليه عشرا)",
  ],
  ad3iya: [
    "اللهم إني أسألك العفو والعافية في الدنيا والآخرة 🤲",
    "اللهم اغفر لي وارحمني واهدني وعافني وارزقني",
    "يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين",
    "اللهم أعنا على ذكرك وشكرك وحسن عبادتك",
  ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['Khaabz Bot', 'Chrome', '1.0'],
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('--- QR CODE ---');
      console.log(qr);
      console.log(`رابط المسح السريع: https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`);
    }

    if (connection === 'open') {
      console.log('✅ تم الاتصال بنجاح - البوت شغال');
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ انقطع الاتصال، إعادة المحاولة...');
      if (shouldReconnect) startBot();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const rawText = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
      const text = rawText.trim().toLowerCase().replace(/[.\s]+/g, "");

      if (!text) return;

      // الأوامر
      if (['اوامر','menu','بوت','help'].some(c => text.includes(c))) {
        await sock.sendMessage(from, {
          text: `🤖 *بوت الأذكار - Mai* 🤍\n\n` +
                `*╭── الأوامر ──╮*\n` +
                `*├* \`.ذكر\` - ذكر عشوائي\n` +
                `*├* \`.دعاء\` - دعاء\n` +
                `*├* \`.حديث\` - حديث شريف\n` +
                `*├* \`.اية\` - آية قرآنية\n` +
                `*╰* \`.اوامر\` - هذه القائمة\n\n` +
                `_اكتب الأمر بدون نقطة يشتغل برضو_\n\nسبحان الله وبحمده ❤️`
        });
      }
      else if (text.includes('ذكر')) {
        await sock.sendMessage(from, { text: getRandom(DB.azkar) });
      }
      else if (text.includes('دعاء')) {
        await sock.sendMessage(from, { text: `🤲 ${getRandom(DB.ad3iya)}` });
      }
      else if (text.includes('حديث')) {
        await sock.sendMessage(from, { text: `📜 ${getRandom(DB.ahadith)}` });
      }
      else if (text.includes('اية') || text.includes('قران')) {
        await sock.sendMessage(from, { text: `﴿ وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ ﴾ [الكهف:24] 🤍` });
      }

    } catch (e) {
      console.log('خطأ بالرسالة:', e.message);
    }
  });
}

startBot();
