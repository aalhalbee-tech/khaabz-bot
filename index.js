const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs');
const pino = require('pino');

// دالات مساعدة لإدارة قاعدة البيانات البسيطة (JSON) لضمان عدم ضياع البيانات عند إعادة التشغيل
const db = {
    read: (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {},
    write: (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))
};

// تحميل البيانات
let tasbeeh = db.read('tasbeeh.json');
let laws = db.read('laws.json');

// مصفوفة النكات العربية المتنوعة والمضحكة
const jokes = [
    "مرة واحد اشترى موبايل ذكي، طلع أذكى منه وما رضي يفتح له القفل 😂",
    "واحد بخيل اتجوز بخيلة، جابوا ولد حطوه في البنك 💰😂",
    "محشش شاف إشارة 'ممنوع الوقوف' قام انبطح 🏃‍♂️😂",
    "واحد سأل محشش: ليش القطار مهم؟ قال: لأن تحته خطين 🚂😂",
    "صاحب محل دخلت عليه زبونة قالت له: عندك سكر؟ قالها: إي يا قلبي، قالت له: الله يشفيك، ومشت 🤦‍♂️😂",
    "دكتور عيون محشش شاف علامة (E) مقلوبة قال: هذي تنورة أمي وهي صغيرة 👁️😂",
    "واحد كسلان دخل الامتحان وقع منه القلم، سلم الورقة وقال: خلاص فركشت ✍️😂",
    "محشش سألوه: شو أقدم حيوان؟ قال: الحمار الوحشي، لأنه أبيض وأسود 🦓😂"
];

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }), 
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    // ==========================================
    // نِظام النكات المتكررة التلقائي (كل ساعة)
    // ==========================================
    setInterval(async () => {
        // نتحقق من وجود قروبات مسجلة في "القوانين" أو "التسبيح" لإرسال النكبة لها كمثال للمجموعات النشطة
        const activeJids = Object.keys(laws); 
        
        if (activeJids.length > 0) {
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            const jokeMsg = `🤖 *فقرة النكتة التلقائية لتنشيط الجروب:* \n\n${randomJoke} \n\n_تفاعلوا يا جماعة! 🥳_`;
            
            for (const jid of activeJids) {
                try {
                    // إرسال النكتة لكل مجموعة مسجلة بالبوت
                    await sock.sendMessage(jid, { text: jokeMsg });
                } catch (e) {
                    console.log(`فشل الإرسال للمجموعة: ${jid}`);
                }
            }
        }
    }, 60 * 60 * 1000); // 60 دقيقة * 60 ثانية * 1000 ملي ثانية (يعني كل ساعة تلقائياً)

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0]; // تعديل بسيط لضمان قراءة الرسالة الأولى بدقة
            if (!msg.message || msg.key.fromMe) return;

            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            
            let text = msg.message.conversation || 
                       msg.message.extendedTextMessage?.text || 
                       msg.message.imageMessage?.caption || "";
            
            let low = text.trim().toLowerCase();
            let mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

            // 1. أمر الأوامر
            if (low === "الاوامر" || low === "أوامر" || low === "اوامر") {
                const menu = `📜 *قائمة أوامر البوت الاحترافي*:\n\n` +
                             `• *نكتة* 🎭 -> لطلب نكتة فورية في أي وقت\n` +
                             `• *تسبيح* 📿 -> لبدء تحدي تسبيح جديد\n` +
                             `• *سبحان الله* ✨ -> لزيادة العداد الحالي\n` +
                             `• *عدد* 📊 -> لمعرفة كم وصل العداد\n\n` +
                             `• *حط قوانين [النص]* 📝 -> لحفظ قوانين القروب\n` +
                             `• *قوانين* 📋 -> لعرض قوانين القروب الحالية\n\n` +
                             `• *ملصق* 🎨 -> (بالرد على صورة) لتحويلها لملصق\n\n` +
                             `• *حب @منشن* ❤️ -> لقياس نسبة الحب\n` +
                             `• *زواج @منشن* 💍 -> لعمل زواج تخيلي`;
                await sock.sendMessage(jid, { text: menu });
                return;
            }

            // أمر نكتة (يدوي بطلب من العضو)
            if (low === "نكتة" || low === "نكته") {
                const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
                await sock.sendMessage(jid, { text: `😂 *إليك هذه النكتة:* \n\n${randomJoke}` });
                return;
            }

            // 2. نظام التسبيح المطور
            if (low === "تسبيح") {
                tasbeeh[jid] = { count: 0 };
                db.write('tasbeeh.json', tasbeeh);
                await sock.sendMessage(jid, { text: `📿 *بدأ تحدي التسبيح!* \nشاركونا الأجر وقولوا: (سبحان الله)` });
                return;
            }

            if (low === "سبحان الله") {
                if (tasbeeh[jid]) {
                    tasbeeh[jid].count++;
                    if (tasbeeh[jid].count >= 1000) {
                        await sock.sendMessage(jid, { text: `🎉 *ما شاء الله!* تم إكمال 1000 تسبيحة بنجاح. كتب الله أجركم جميعا 🤍` });
                        delete tasbeeh[jid];
                    }
                    db.write('tasbeeh.json', tasbeeh);
                }
                return;
            }

            if (low === "عدد") {
                const currentCount = tasbeeh[jid] ? tasbeeh[jid].count : null;
                await sock.sendMessage(jid, { 
                    text: currentCount !== null ? `📿 العداد الحالي: *${currentCount}* / 1000` : `❌ لا يوجد تحدي تسبيح قائم حالياً. اكتب *تسبيح* للبدء.` 
                });
                return;
            }

            // 3. نظام القوانين
            if (low.startsWith("حط قوانين")) {
                const lawText = text.replace(/حط قوانين/i, "").trim();
                if (!lawText) return await sock.sendMessage(jid, { text: `⚠️ يرجى كتابة القوانين بعد الأمر.` });
                
                laws[jid] = lawText;
                db.write('laws.json', laws);
                await sock.sendMessage(jid, { text: `✅ *تم حفظ قوانين المجموعة بنجاح!*` });
                return;
            }

            if (low === "قوانين") {
                await sock.sendMessage(jid, { text: laws[jid] ? `📋 *قوانين المجموعة:*\n\n${laws[jid]}` : `❌ لم يتم تعيين قوانين لهذه المجموعة بعد.` });
                return;
            }

            // 4. صناعة الملصقات
            if (low === "ملصق" || low === "ستيكر") {
                const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
                const isImage = msg.message.imageMessage || quotedMsg?.imageMessage;

                if (!isImage) return await sock.sendMessage(jid, { text: `⚠️ يرجى إرسال صورة مع كلمة *ملصق* أو الرد على صورة موجودة!` });

                await sock.sendMessage(jid, { text: `⏳ جاري تحويل صورتك إلى ملصق...` });
                
                const mediaMessage = quotedMsg?.imageMessage ? { message: quotedMsg } : msg;
                const buffer = await sock.downloadMediaMessage(mediaMessage);

                const sticker = new Sticker(buffer, {
                    pack: 'بوت الواتساب الاحترافي', 
                    author: 'Baileys Bot', 
                    type: StickerTypes.FULL, 
                    quality: 70 
                });

                const stickerBuffer = await sticker.toBuffer();
                await sock.sendMessage(jid, { sticker: stickerBuffer });
                return;
            }

            // 5. ألعاب التسلية
            if (low.startsWith("حب")) {
                let targetJid = mentions[0] || sender;
                let percent = Math.floor(Math.random() * 101);
                let msgLove = percent < 30 ? "💔 فاشل وضائع" : percent < 60 ? "🤔 فيه أمل بسيط" : percent < 85 ? "❤️ علاقة جميلة وحلوة" : "💍 حب أسطوري ينتهى بالزواج";
                
                let targetTag = `@${targetJid.split('@')[0]}`;
                let senderTag = `@${sender.split('@')[0]}`;

                await sock.sendMessage(jid, {
                    text: `💘 نسبة الحب بين ${senderTag} و ${targetTag} هي: *${percent}%*\nالتقييم: _${msgLove}_`,
                    mentions: [sender, targetJid]
                });
                return;
            }

            if (low.startsWith("زواج")) {
                if (!mentions[0]) return await sock.sendMessage(jid, { text: `⚠️ يرجى عمل منشن للشخص الذي تريد الزواج منه!` });
                if (mentions[0] === sender) return await sock.sendMessage(jid, { text: `😂 لا يمكنك الزواج من نفسك!` });

                await sock.sendMessage(jid, {
                    text: `💍 تم عقد قران العضو @${sender.split('@')[0]} على العضو @${mentions[0].split('@')[0]} \n\nألف مبروك لكما الزواج التخيلي السعيد! 🎉🥳`,
                    mentions: [sender, mentions[0]]
                });
                return;
            }

        } catch (error) {
            console.error("❌ حدث خطأ أثناء معالجة الأمر: ", error);
        }
    });

    console.log("✅ البوت الاحترافي يعمل الآن بنجاح مع ميزة النكت المتكررة تلقائياً!");
}

start();
