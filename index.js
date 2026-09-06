require('http').createServer((req,res)=>res.end('Bot Live')).listen(process.env.PORT||3000);

const {default:makeWASocket, useMultiFileAuthState} = require('@whiskeysockets/baileys');
const P = require('pino');

async function start() {
  const {state, saveCreds} = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({
    auth: state,
    logger: P({level:'silent'}),
    browser: ['Ubuntu','Chrome','20.0'],
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  // اذا مو مربوط اطلب كود كل دقيقة
  if (!state.creds.registered) {
    const getCode = async () => {
      try {
        await new Promise(r=>setTimeout(r, 5000));
        let code = await sock.requestPairingCode('963993675005'); // رقمك بدون +
        console.log(`\n\n========================`);
        console.log(`  الكود تبعك هو: ${code}`);
        console.log(`  صالح لمدة دقيقة`);
        console.log(`========================\n\n`);
      } catch(e){ console.log('خطأ بالكود:', e.message) }
    }
    await getCode();
    setInterval(getCode, 60000); // كل دقيقة كود جديد
  }

  sock.ev.on('connection.update', (u) => {
    if (u.connection === 'open') {
      console.log('✅✅✅ تم الربط بنجاح - هلا فيك تحط كود البوت النهائي');
    }
  });
}
start();
