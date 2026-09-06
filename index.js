require('http').createServer((req,res)=>res.end('Khaabz Bot Live')).listen(process.env.PORT||3000);

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0'],
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (u) => {
        if (u.connection === 'open') {
            console.log('✅✅✅ البوت شغال ومربوط - Khaabz Bot Ready');
        }
        if (u.connection === 'close') {
            const shouldReconnect = u.lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
            if (shouldReconnect) start();
        }
    });

    // أوامر البوت
    sock.ev.on('messages.upsert', async m => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;
            const from = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            if (!text.startsWith('.')) return;

            const args = text.slice(1).trim().split(/ +/);
            const cmd = args.shift().toLowerCase();

            // أمر منشن الجميع
            if (cmd === 'منشن' || cmd === 'الجميع' || cmd === 'tagall') {
                if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: 'الأمر هذا للقروبات فقط' });
                const meta = await sock.groupMetadata(from);
                const mentions = meta.participants.map(p => p.id);
                await sock.sendMessage(from, { text: `منشن للكل 📢\n${args.join(' ') || ''}`, mentions });
            }

            // أمر المساعدة
            if (cmd === 'اوامر' || cmd === 'help') {
                await sock.sendMessage(from, { text: `🤖 *اوامر بوت خابز*\n\n.منشن - يعمل منشن للكل\n.الجميع - نفس الأمر\n.اوامر - هاي القائمة` });
            }

        } catch (e) { console.log('Error:', e.message) }
    });
}
start();
