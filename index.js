const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const express = require("express")
const QRCode = require("qrcode")
const app = express()
let qr=null, connected=false
const SIGN="\n\n— *بوت ابو تقى* 👑 | للتصميم:.المصمم"

app.get("/", async (req,res)=>{
  if(connected) return res.send("<h1 style=text-align:center;margin-top:100px>✅ بوت ابو تقى الخرافي شغال 👑🔥🕌</h1>")
  if(!qr) return res.send('<head><meta http-equiv="refresh" content="2"></head><h1 style=text-align:center>⏳</h1>')
  const img=await QRCode.toDataURL(qr)
  res.send(`<div style=text-align:center;margin-top:20px><h2>👑 بوت ابو تقى الخرافي</h2><img src="${img}" style="width:340px;border:10px solid #000;border-radius:20px"><script>setTimeout(()=>location.reload(),20000)</script></div>`)
})
app.listen(process.env.PORT||10000)

// === الداتا ===
const azkar=["سبحان الله وبحمده","لا إله إلا الله","أستغفر الله","لا حول ولا قوة إلا بالله","اللهم صل على محمد"]
const quran=["﴿ ألا بذكر الله تطمئن القلوب ﴾","﴿ إن مع العسر يسرا ﴾","﴿ لا تحزن إن الله معنا ﴾"]
const nokat=["محشش سألوه شو أحلى شي؟ قال لما الشرطي يقول اتفضل روح 😂","مرة بخيل مات كتبوا على قبره ادخلوا ببلاش 😂","نملة تزوجت فيل مات ثاني يوم قالت قضيت عمري أحفر له قبر 😂"]
const saraha=["صراحة.. تحب أحد في القروب؟","صراحة.. آخر كذبة كذبتها؟","صراحة.. مين تكرهه في القروب؟","لو تطرد واحد مين تختار؟"]
const tahadi=["تحدي: غني ريكورد 😂","تحدي: غير اسمك لـ بطيخة 10 دقايق","تحدي: أرسل أغبى صورة عندك","تحدي: اتصل بأمك وقلها أحبك"]

async function start(){
  const {state, saveCreds}=await useMultiFileAuthState("session")
  const sock=makeWASocket({auth: state, browser: ["Khaabz","Chrome","1.0"]})
  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", u=>{
    if(u.qr) qr=u.qr
    if(u.connection==="open"){ connected=true; qr=null; console.log("تم الربط!") }
    if(u.connection==="close") setTimeout(start,3000)
  })

  // ذكر تلقائي كل ساعة
  setInterval(async()=>{
    if(!connected) return
    const text=`📿 *تذكير:*\n${azkar[Math.floor(Math.random()*azkar.length)]}${SIGN}`
    // يرسل لنفسك كتذكير، تقدر تغيره لقروب
    // await sock.sendMessage("120363xxx@g.us", {text})
  }, 3600000)

  sock.ev.on("messages.upsert", async (m)=>{
    const msg=m.messages[0]
    if(!msg.message || msg.key.fromMe) return
    const jid=msg.key.remoteJid
    const text=(msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim()
    const low=text.toLowerCase()
    const isGroup=jid.endsWith("@g.us")

    // حماية من الروابط
    if(isGroup && text.includes("https://")){
      // لو تبغى يطرد تلقائي شيل // من السطر الجاي
      // await sock.sendMessage(jid, {text: `⚠️ @${msg.key.participant.split('@')[0]} ممنوع الروابط!`, mentions:[msg.key.participant]})
    }

    if(low === ".الاوامر"){
      await sock.sendMessage(jid, {text:`*👑 بوت ابو تقى الخرافي - كل الأوامر*

*🕌 إسلامي:*
.ذكر - ذكر عشوائي
.قران - آية

*🔥 تسلية:*
.نكتة - نكتة
.صراحة - لعبة صراحة
.تحدي - تحدي
.حب احمد + سارة - نسبة الحب

*👥 قروب:*
.منشن - منشن الكل
.طرد @ - طرد عضو (للأدمن)
.قفل /.فتح - قفل القروب

*👑 تصميم:*
.المصمم - معلوماتك
.اسعاري - أسعار التصميم
.اعمالي - معرض أعمالك

.بوت - حالة البوت
${SIGN}`})
    }
    else if(low === ".ذكر"){ await sock.sendMessage(jid, {text:`📿 ${azkar[Math.floor(Math.random()*azkar.length)]}${SIGN}`}, {quoted:msg}) }
    else if(low === ".قران"){ await sock.sendMessage(jid, {text:`📖 ${quran[Math.floor(Math.random()*quran.length)]}${SIGN}`}, {quoted:msg}) }
    else if(low === ".نكتة"){ await sock.sendMessage(jid, {text:`😂 ${nokat[Math.floor(Math.random()*nokat.length)]}${SIGN}`}) }
    else if(low === ".صراحة"){ await sock.sendMessage(jid, {text:`🎲 ${saraha[Math.floor(Math.random()*saraha.length)]}${SIGN}`}) }
    else if(low === ".تحدي"){ await sock.sendMessage(jid, {text:`😈 ${tahadi[Math.floor(Math.random()*tahadi.length)]}${SIGN}`}) }
    else if(low.startsWith(".حب ")){
      const parts=text.slice(4).split("+")
      if(parts.length<2) return sock.sendMessage(jid,{text:"اكتب:.حب اسم + اسم"})
      const p=Math.floor(Math.random()*100)+1
      await sock.sendMessage(jid,{text:`💘 ${parts[0].trim()} + ${parts[1].trim()} = ${p}% ${p>70?'❤️ نار':'💔'}${SIGN}`})
    }
    else if(low === ".منشن" && isGroup){
      const g=await sock.groupMetadata(jid)
      await sock.sendMessage(jid,{text:`👑 يلا يا حلوين${SIGN}\n`+g.participants.map(p=>`@${p.id.split('@')[0]}`).join(' '), mentions:g.participants.map(p=>p.id)})
    }
    else if(low.startsWith(".طرد")){
      if(!isGroup) return
      const target=msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      if(target){ await sock.groupParticipantsUpdate(jid,[target],"remove"); await sock.sendMessage(jid,{text:`✅ تم الطرد${SIGN}`}) }
    }
    else if(low === ".قفل" && isGroup){ await sock.groupSettingUpdate(jid,"announcement"); await sock.sendMessage(jid,{text:`🔒 تم قفل القروب${SIGN}`}) }
    else if(low === ".فتح" && isGroup){ await sock.groupSettingUpdate(jid,"not_announcement"); await sock.sendMessage(jid,{text:`🔓 تم فتح القروب${SIGN}`}) }
    else if(low === ".المصمم"){
      await sock.sendMessage(jid,{text:`*👑 المصمم: ابو تقى*

🎨 تصميم شعارات - بنرات - سوشيال ميديا - أغلفة
💰 أسعار مناسبة + تسليم سريع
📩 للطلب راسلني خاص

اكتب.اسعاري عشان تشوف الأسعار
اكتب.اعمالي عشان تشوف شغلي

— بوت ابو تقى 👑`})
    }
    else if(low === ".اسعاري"){
      await sock.sendMessage(jid,{text:`*💰 أسعار ابو تقى* 👑

🖼️ لوغو احترافي: 50 ريال
📱 تصميم سوشيال: 20 ريال
🎬 بنر يوتيوب: 30 ريال
📦 باكج كامل (لوغو+بنر+صورة): 100 ريال

💬 خصم 20% لأعضاء القروب!

للطلب:.المصمم${SIGN}`})
    }
    else if(low === ".اعمالي"){
      await sock.sendMessage(jid,{text:`*🎨 أعمال ابو تقى* 👑

شوف شغلي على:
📸 انستا: حط رابطك هنا
👁️ بيهانس: حط رابطك هنا

أرسل لي.المصمم للتواصل المباشر${SIGN}`})
    }
    else if(low === ".بوت"){
      await sock.sendMessage(jid,{text:`✅ *بوت ابو تقى الخرافي شغال*

🔥 تسلية + 🕌 إسلامي + 🛡️ حماية + 🎨 مصمم
⏱️ شغال 24 ساعة بدون ما يطفي
👑 تصميم: ابو تقى`})
    }
  })
}
start()
