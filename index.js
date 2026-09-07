// هذا الكود يخليه يرد على كلمة الاوامر
client.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0]
  if (!msg.message) return
  if (msg.key.fromMe) return // لا يرد على نفسه

  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
  const from = msg.key.remoteJid

  console.log("رسالة جديدة:", text)

  if (text.trim() === "الاوامر") {
    await client.sendMessage(from, {
      text: `أهلا بك في بوت Khaabz 🔥

*الاوامر المتاحة:*
1 -.ملصق
2 -.جوجل
3 -.ذكاء
4 -.لعب
5 -.تحميل

ابعت الأمر وشوف!`
    })
  }
})
