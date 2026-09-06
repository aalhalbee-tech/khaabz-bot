const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys")
const express = require("express")
const QRCode = require("qrcode")
const app = express()
let qr=null, connected=false

// رابط البوت
app.get("/", async (req,res)=>{
  if(connected) return res.send("<h1 style=text-align:center;margin-top:100px>✅ بوت ابو تقى شغال 100%</h1>")
  if(!qr) return res.send('<head><meta http-equiv="refresh" content="2"></head><h1 style=text-align:center>⏳ انتظر ثواني للباركود</h1>')
  const img=await QRCode.toDataURL(qr)
  res.send(`<div style=text-align:center><h2>بوت ابو تقى 👑</h2><img src="${img}" style="width:300px;border:8px solid #000;border-radius:20px"></div>`)
})
app.listen(process.env.PORT||10000)

// قائمة الاذكار
const azkar=["سبحان الله وبحمده","لا اله الا الله","استغفر الله العظيم","لا حول ولا قوة الا بالله","اللهم صل على محمد"]
const quran=["ألا بذكر الله تطمئن القلوب ❤️","إن مع العسر يسرا","لا تحزن إن الله معنا","وبشر الصابرين","إن الله يحب المحسنين"]
const nokat=["محشش سألوه شو بتحب؟ قال لما الشرطي يقول اتفضل روح 😂","بخيل مات كتبوا على قبره: الدخول مجاناً 😂","واحد غبي ضاع في السوق 😂"]
const saraha=["صراحة.. تحب حد في القروب؟","صراحة.. آخر كذبة كذبتها؟","لو تطرد واحد مين؟","صراحة.. بتغار؟"]
const tahadi=["تحدي: غني ريكورد 10 ثواني 😂","تحدي: غير اسمك لبطيخة 5 دقائق","تحدي: ارسل أغبى صورة عندك"]

async function start(){
  const {state, saveCreds}=await useMultiFileAuthState("session")
  const sock=makeWASocket({auth: state, browser: ["AbuTaqa","Chrome","1.0"]})
  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", u=>{
    if(u.qr) qr=u.qr
    if(u.connection==="open"){ connected=true; qr=null; console.log("✅ تم الربط") }
    if(u.connection==="close") setTimeout(start,3000)
  })

  sock.ev.on("messages.upsert", async (m)=>{
    const msg=m.messages[0]
    if(!msg.message) return
    const jid=msg.key.remoteJid
    const body=(msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim()
    const low=body.toLowerCase()

    // .الاوامر
    if(low==".الاوامر"){
      await sock.sendMessage(jid,{text:`*👑 أوامر بوت ابو تقى*

*🔧 ادارة:*
.طرد @ - طرد عضو (للأدمن)
.قفل / .فتح - قفل القروب

*👑 تصميم:*
.المصمم - معلوماتك
.اسعاري - أسعار التصميم
.اعمالي - معرض أعمالك

*🎮 ترفيه:*
.ذكر - ذكر عشوائي
.قران - آية
.نكتة - نكتة
.صراحة - لعبة صراحة
.تحدي - تحدي
.حب احمد + سارة - نسبة حب
.منشن - منشن للكل

*🤖 حالة:*
.بوت - حالة البوت

— بوت ابو تقى 👑 | للتصميم: .المصمم`})
      return
    }

    if(low==".ذكر"){
      const r=azkar[Math.floor(Math.random()*azkar.length)]
      await sock.sendMessage(jid,{text:`📿 *${r}*`},{quoted:msg})
      return
    }

    if(low==".قران"){
      const r=quran[Math.floor(Math.random()*quran.length)]
      await sock.sendMessage(jid,{text:`📖 *${r}*`},{quoted:msg})
      return
    }

    if(low==".نكتة"){
      const r=nokat[Math.floor(Math.random()*nokat.length)]
      await sock.sendMessage(jid,{text:`😂 ${r}`})
      return
    }

    if(low==".صراحة"){
      const r=saraha[Math.floor(Math.random()*saraha.length)]
      await sock.sendMessage(jid,{text:`🎲 ${r}`})
      return
    }

    if(low==".تحدي"){
      const r=tahadi[Math.floor(Math.random()*tahadi.length)]
      await sock.sendMessage(jid,{text:`😈 ${r}`})
      return
    }

    // أمر الحب بدون توقيع مزعج
    if(low.startsWith(".حب ")){
      const parts=body.slice(4).split("+")
      if(parts.length<2){ await sock.sendMessage(jid,{text:"اكتب: .حب احمد + سارة"}); return }
      const p=Math.floor(Math.random()*100)+1
      const heart=p>80?"💘 مولعين ❤️❤️":p>60?"💕 مناسبين":p>30?"💔 نص ونص":"💔 ما ينفع"
      await sock.sendMessage(jid,{text:`${heart}\n*${parts[0].trim()} + ${parts[1].trim()} = ${p}%*`})
      return
    }

    if(low==".منشن"){
      if(!jid.endsWith("@g.us")){ await sock.sendMessage(jid,{text:"هاد للقروبات فقط"}); return }
      const g=await sock.groupMetadata(jid)
      const mentions=g.participants.map(x=>x.id)
      await sock.sendMessage(jid,{text:`👑 تعالو يا حلوين\n`+mentions.map(x=>`@${x.split('@')[0]}`).join(' '), mentions:mentions})
      return
    }

    if(low==".المصمم"){
      await sock.sendMessage(jid,{text:`👑 *المصمم: ابو تقى*
🎨 مصمم شعارات وبنرات احترافي
📱 تصميم سوشيال - لوقو - بوستر

للطلب: راسلني خاص ❤️`})
      return
    }

    if(low==".اسعاري"){
      await sock.sendMessage(jid,{text:`💰 *أسعار التصميم - ابو تقى*

🔹 لوغو عادي: 50
🔹 لوغو احترافي 3D: 100
🔹 بنر سوشيال: 30
🔹 باكج كامل (لوغو+بنر+كفر): 150

الدفع: شحن - بايير

— بوت ابو تقى 👑`})
      return
    }

    if(low==".اعمالي"){
      await sock.sendMessage(jid,{text:`🎨 *معرض أعمال ابو تقى*

شوف شغلي على الخاص وارسل لك النماذج

اكتب .المصمم للتواصل 👑`})
      return
    }

    if(low==".بوت"){
      await sock.sendMessage(jid,{text:`✅ البوت شغال 100%\n⚡ بوت ابو تقى 👑`})
      return
    }

    // أوامر الادمن
    if(low.startsWith(".طرد")){
      if(!jid.endsWith("@g.us")) return
      const mentioned=msg.message.extendedTextMessage?.contextInfo?.mentionedJid
      if(!mentioned || mentioned.length==0){ await sock.sendMessage(jid,{text:"منشن الشخص: .طرد @احمد"}); return }
      try{ await sock.groupParticipantsUpdate(jid, mentioned, "remove"); await sock.sendMessage(jid,{text:`تم الطرد ✅`}) }catch{ await sock.sendMessage(jid,{text:"لازم البوت يكون أدمن"}) }
      return
    }

    if(low==".قفل"){
      if(!jid.endsWith("@g.us")) return
      try{ await sock.groupSettingUpdate(jid, "announcement"); await sock.sendMessage(jid,{text:"🔒 تم قفل القروب"}) }catch{ await sock.sendMessage(jid,{text:"لازم البوت أدمن"}) }
      return
    }

    if(low==".فتح"){
      if(!jid.endsWith("@g.us")) return
      try{ await sock.groupSettingUpdate(jid, "not_announcement"); await sock.sendMessage(jid,{text:"🔓 تم فتح القروب"}) }catch{ await sock.sendMessage(jid,{text:"لازم البوت أدمن"}) }
      return
    }

  })
}
start()    }

    if(low.startsWith(".حب ")){
      const parts=body.slice(4).split("+")
      if(parts.length<2){ await sock.sendMessage(jid,{text:"اكتب: .حب احمد + سارة"}); return }
      const p=Math.floor(Math.random()*100)+1
      let heart=p>80?"❤️❤️❤️ مولعين":p>50?"❤️ نص ونص":"💔 بعيد"
      await sock.sendMessage(jid,{text:`💘 *${parts[0].trim()} + ${parts[1].trim()} = ${p}%*\n${heart}${SIGN}`})
      return
    }

    if(low==".منشن"){
      if(!jid.endsWith("@g.us")){ await sock.sendMessage(jid,{text:"هاد للقروبات بس"}); return }
      const g=await sock.groupMetadata(jid)
      const mentions=g.participants.map(x=>x.id)
      await sock.sendMessage(jid,{text:`👑 *تعالو يا حلوين*${SIGN}\n`+mentions.map(x=>`@${x.split('@')[0]}`).join(' '), mentions:mentions})
      return
    }

    if(low==".المصمم"){
      await sock.sendMessage(jid,{text:`👑 *المصمم: ابو تقى*
🎨 مصمم شعارات وبنرات احترافي
📩 للطلب: خاص

${SIGN}`})
      return
    }

    if(low==".اسعاري"){
      await sock.sendMessage(jid,{text:`💰 *اسعار ابو تقى*

🔹 لوغو عادي: 50 جنيه
🔹 لوغو احترافي: 100
🔹 بنر سوشيال: 30
🔹 باكج كامل: 150

${SIGN}`})
      return
    }

    if(low==".بوت"){
      await sock.sendMessage(jid,{text:`✅ *البوت شغال 100%*
⚡ سرعة: ممتازة
👑 المطور: ابو تقى`})
      return
    }

  })
}
start()
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
start()    else if(low === ".صراحة"){ await sock.sendMessage(jid, {text:`🎲 ${saraha[Math.floor(Math.random()*saraha.length)]}${SIGN}`}) }
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
