const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['khaabz-bot', 'Chrome', '1.0']
    });
    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        const phone = process.env.PHONE_NUMBER;
        if (phone) {
            setTimeout(async () => {
                try {
                    const cleanPhone = phone.replace(/[^0-9]/g,'');
                    const code = await sock.requestPairingCode(cleanPhone);
                    console.log('===========================');
                    console.log('كود الربط هو: ' + code);
                    console.log('===========================');
                } catch(e){ console.log('خطأ: ' + e.message) }
            }, 4000);
        }
    }

    sock.ev.on('connection.update', (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ البوت شغال واتصل');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if(!m.message) return;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
        if(text.toLowerCase() === 'ping') {
            await sock.sendMessage(m.key.remoteJid, { text: 'pong ✅ البوت شغال' });
        }
    });
}
startBot();
