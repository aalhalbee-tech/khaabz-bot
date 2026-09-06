require('http').createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running - Khaabz');
}).listen(process.env.PORT || 3000);
console.log("HTTP server started for Render");

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Khaabz Bot', 'Chrome', '1.0.0']
  });

  // اذا ما في جلسة وبدنا كود ربط
  if (!sock.authState.creds.registered) {
    const phone = process.env.PHONE_NUMBER || '963993675005';
    console.log(`رقم الهاتف المستخدم: ${phone}`);
    setTimeout(async () => {
      try {
        let code = await sock.requestPairingCode(phone);
        console.log(`\n===========================`);
        console.log(`كود الربط هو: ${code}`);
        console.log(`===========================\n`);
        console.log(`روح واتساب > الأجهزة المرتبطة > ربط برقم الهاتف واكتب الكود`);
      } catch (e) {
        console.log("خطأ بطلب الكود:", e.message);
      }
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
      console.log('انقطع الاتصال.. عم حاول اعيد ', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ تم ربط واتساب بنجاح! البوت شغال هلا ✅');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const text = m.message.conversation || m.message.extendedTextMessage?.text;

    // رد بسيط للتجربة
    if (text?.toLowerCase() === 'ping') {
      await sock.sendMessage(m.key.remoteJid, { text: 'pong ✅ البوت شغال!' });
    }
  });
}

startBot();
