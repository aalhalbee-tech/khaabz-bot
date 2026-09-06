const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const axios = require('axios')
const fs = require('fs')

// ===== ذاكرة البوت =====
let tasbeehGroups = {}
let warnings = {}
let groupLaws = {}
let userCounts = {} // عشان أكثر واحد سبح
let spamCheck = {}

async function startBot(){
const { state, saveCreds } = await useMultiFileAuthState('auth')
const sock = makeWASocket({ auth: state })

sock.ev.on('creds.update', saveCreds)

sock.ev.on('messages.upsert', async m => {
const msg = m.messages[0]
if(!msg.message || msg.key.fromMe) return
const jid = msg.key.remoteJid
const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
const low = text.toLowerCase().trim()

// ========= 1. ضد سبام =========
if(!spamCheck[jid]) spamCheck[jid] = {}
let sender = msg.key.participant || jid
if(!spamCheck[sender]) spamCheck[sender] = {count:0, last:Date.now()}
if(Date.now() - spamCheck[sender].last < 3000) spamCheck[sender].count++
else spamCheck[sender].count = 0
spamCheck[sender].last = Date.now()
if(spamCheck[sender].count > 8){
  await sock.sendMessage(jid,{text:`⚠️ @${sender.split('@')[0]} تم كتمك مؤقتا للسبام`, mentions:[sender]})
  return
}

// ========= 2. قائمة الأوامر الجديدة الذهبية =========
if(low==".الاوامر"){
await sock.sendMessage(jid,{text:`👑 *بوت ابو تقى الخرافي* 👑
━━━━━━━━━━━━━━━
🕌 *الإسلامي:*
┃ 📿 تسبيح : تسبيح جماعي
┃ 🔢 عدد : عدد التسبيح الحالي
┃ 📖 قران : آية قرآنية
┃ 🕋 مواقيت القاهرة : أوقات الصلاة
┃ 📿 ذكر : ذكر عشوائي
━━━━━━━━━━━━━━━
👥 *إدارة القروب:*
┃ 📢 منشن : منشن للكل
┃ 📜 قوانين : عرض القوانين
┃ ⚖️ تحذير @ : تحذير عضو (3=طرد)
┃ 👢 طرد @ : طرد مباشر
━━━━━━━━━━━━━━━
🎨 *خدمات التصميم:*
┃ 🛒 اطلب تصميم : طلب جديد
┃ 💰 اسعاري : قائمة الأسعار
┃ 🖼️ اعمالي : معرض أعمالي
┃ 💳 دفع : طرق الدفع
┃ 👑 المصمم : معلوماتي
━━━━━━━━━━━━━━━
⚡ *خدمات مفيدة:*
┃ 🧷 ملصق : رد على صورة يحولها ملصق
┃ 🌤️ طقس القاهرة : حالة الطقس
┃ 💵 دولار : سعر الدولار اليوم
━━━━━━━━━━━━━━━
🤖 *بوت : حالة البوت*

*— بوت ابو تقى 👑 | للطلب اكتب.اطلب تصميم*`})
return
}

// ========= 3. تسبيح جماعي + أكثر واحد سبح =========
if(low==".تسبيح"){
  if(tasbeehGroups[jid]){
    await sock.sendMessage(jid,{text:`⏳ تسبيح شغال! العدد ${tasbeehGroups[jid].count}`}); return
  }
  tasbeehGroups[jid]={count:0, goal:1000}
  userCounts[jid]={}
  await sock.sendMessage(jid,{text:`👑 *بدأ التسبيح الجماعي* 👑\n📿 الذكر: سبحان الله وبحمده\n🎯 الهدف: 1000\n\nاكتب *سبحان الله*`}); return
}
if(["سبحان الله","سبحان الله وبحمده","الله اكبر","الحمد لله"].includes(low)){
  if(tasbeehGroups[jid]){
    tasbeehGroups[jid].count++
    if(!userCounts[jid][sender]) userCounts[jid][sender]=0
    userCounts[jid][sender]++
    let c=tasbeehGroups[jid].count
    if(c%25==0) await sock.sendMessage(jid,{text:`📿 وصلنا ${c} / 1000 استمروا! 👏`})
    if(c>=1000){
      // مين أكثر واحد سبح
      let top = Object.entries(userCounts[jid]).sort((a,b)=>b[1]-a[1])[0]
      await sock.sendMessage(jid,{text:`🎉 *خلصنا 1000 تسبيحة!*\n🏆 الأكثر تسبيحا: @${top[0].split('@')[0]} (${top[1]} مرة)\n🤲 اللهم اكتب الأجر للجميع`, mentions:[top[0]]})
      delete tasbeehGroups[jid]; delete userCounts[jid]
    }
  } return
}
if(low==".عدد"){
  if(tasbeehGroups[jid]) await sock.sendMessage(jid,{text:`📿 العدد: ${tasbeehGroups[jid].count} / 1000`})
  else await sock.sendMessage(jid,{text:`❌ مافي تسبيح شغال`}); return
}

// ========= 4. قوانين القروب =========
if(low.startsWith(".حط قوانين")){
  let law = text.replace(".حط قوانين","").trim()
  groupLaws[jid]=law
  await sock.sendMessage(jid,{text:`✅ تم حفظ القوانين:\n${law}`}); return
}
if(low==".قوانين"){
  await sock.sendMessage(jid,{text: groupLaws[jid]? `📜 *قوانين القروب:*\n${groupLaws[jid]}` : `❌ ما حطيت قوانين، اكتب.حط قوانين ممنوع السب...`}); return
}

// ========= 5. تحذيرات =========
if(low.startsWith(".تحذير")){
  let mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
  if(mentioned[0]){
    if(!warnings[mentioned[0]]) warnings[mentioned[0]]=0
    warnings[mentioned[0]]++
    if(warnings[mentioned[0]]>=3){
      await sock.sendMessage(jid,{text:`👢 تم طرد @${mentioned[0].split('@')[0]} بعد 3 تحذيرات`, mentions:mentioned})
      await sock.groupParticipantsUpdate(jid, mentioned, "remove")
      delete warnings[mentioned[0]]
    } else {
      await sock.sendMessage(jid,{text:`⚠️ تحذير ${warnings[mentioned[0]]}/3 لـ @${mentioned[0].split('@')[0]}`, mentions:mentioned})
    }
  } return
}

// ========= 6. خدمات التصميم - تبيع لك =========
if(low==".اطلب تصميم"){
  await sock.sendMessage(jid,{text:`🛒 *طلب تصميم جديد*\n\nاكتب بهالشكل:\n.طلب لوقو مطعم - ألوان أحمر وأسود - الاسم Burger King\n\nوراح يوصلك الرد خاص ❤️`}); return
}
if(low.startsWith(".طلب")){
  let order = text.replace(".طلب","")
  await sock.sendMessage(jid,{text:`✅ تم استلام طلبك:\n${order}\n\nتواصل مع المصمم خاص وسيتم الرد بأسرع وقت 👑`})
  // يرسلك انت الطلب على الخاص - حط رقمك هنا
  // await sock.sendMessage("2010xxxxxxx@s.whatsapp.net",{text:`طلب جديد من ${jid}:\n${order}`})
  return
}
if(low==".اسعاري"){
  await sock.sendMessage(jid,{text:`💰 *أسعار ابو تقى* 💰\n━━━━━━━━━━━━\n🎨 لوقو احترافي: 150 جنيه\n🖼️ بوستر سوشيال: 70 جنيه\n📱 بنر متجر: 100 جنيه\n✨ باقة 3 تصاميم: 200 جنيه\n━━━━━━━━━━━━\n💳 الدفع: فودافون كاش / انستا باي\nاكتب.دفع`}); return
}
if(low==".دفع"){
  await sock.sendMessage(jid,{text:`💳 *طرق الدفع*\n📱 فودافون كاش: 010xxxxxxxx\n🏦 انستا باي: abutaqa@instapay\n\nارسل سكرين بعد الدفع ❤️`}); return
}
if(low==".اعمالي"){
  await sock.sendMessage(jid,{text:`🖼️ معرض أعمالي قريبا!\nحاليًا راسلني خاص أرسلك 10 نماذج فخمة 👑`}); return
}
if(low==".المصمم"){
  await sock.sendMessage(jid,{text:`👑 *المصمم ابو تقى*\n🎨 مصمم شعارات وبنرات احترافي\n⭐ خبرة 3 سنين\n📱 للطلب:.اطلب تصميم`}); return
}

// ========= 7. ملصق =========
if(low==".ملصق"){
  let quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
  if(quoted?.imageMessage){
    await sock.sendMessage(jid,{sticker:{url: await sock.downloadMediaMessage({message:quoted}) }})
  } else await sock.sendMessage(jid,{text:`❌ رد على صورة واكتب.ملصق`}); return
}

// ========= 8. مواقيت وطقس ودولار =========
if(low.startsWith(".مواقيت")){
  try{
    let city = text.split(" ")[1] || "Cairo"
    let res = await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Egypt&method=5`)
    let t=res.data.data.timings
    await sock.sendMessage(jid,{text:`🕋 *مواقيت ${city} اليوم*\n🌅 فجر: ${t.Fajr}\n☀️ ظهر: ${t.Dhuhr}\n🌤️ عصر: ${t.Asr}\n🌙 مغرب: ${t.Maghrib}\n🌃 عشاء: ${t.Isha}`})
  }catch{ await sock.sendMessage(jid,{text:`❌ خطأ جرب.مواقيت القاهرة`}) } return
}
if(low==".بوت"){ await sock.sendMessage(jid,{text:`✅ البوت شغال 100%\n⚡ بوت ابو تقى 👑\n📿 تسبيح جماعي • إدارة • تصميم`}); return
})

// ترحيب تلقائي بالأعضاء الجدد
sock.ev.on('group-participants.update', async e=>{
  if(e.action=="add"){
    await sock.sendMessage(e.id,{text:`👋 أهلا وسهلا @${e.participants[0].split('@')[0]} في القروب!\n📜 اكتب.قوانين\n👑 بوت ابو تقى يرحب بك ❤️`, mentions:e.participants})
  }
})

console.log("بوت ابو تقى شغال...")

// اذكار تلقائية كل يوم 8 الصبح و 8 بالليل
setInterval(async ()=>{
  let h = new Date().getHours()
  if(h==8 || h==20){
    // هنا تحط jid القروبات اللي تبي يرسل لها تلقائي
    // sock.sendMessage("groupid@g.us",{text:"📿 أذكار الصباح: سبحان الله وبحمده 100 مرة"})
  }
}, 3600000)

}
startBot()
