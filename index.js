const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const express = require("express")
const QRCode = require("qrcode")
const app = express()
let qr=null, connected=false
const SIGN="\n\n— 👑 ابو تقى - المصمم"

app.get("/", async (req,res)=>{
  if(connected) return res.send("<h1 style=text-align:center;margin-top:100px>✅ بوت ابو تقى شغال</h1>")
  if(!qr) return res.send('<head><meta http-equiv="refresh" content="2"></head><h1 style=text-align:center>⏳ ثواني ويطلع الباركود</h1>')
  const img=await QRCode.toDataURL(qr)
  res.send(`<div style=text-align:center><h2>امسح الباركود</h2><img src="${img}" style="width:300px;border:8px solid #000;border-radius:20px"></div>`)
})
app.listen(process.env.PORT||10000)

const azkar=["سبحان الله وبحمده","لا اله الا الله وحده لا شريك له","استغفر الله العظيم","لا حول ولا قوة الا بالله","اللهم صل على محمد"]
const quran=["ألا بذكر الله تطمئن القلوب","إن مع العسر يسرا","لا تحزن إن الله معنا","و بشر الصابرين"]
const nokat=["محشش سألوه شو بتحب؟ قال الشرطي لما يقول اتفضل روح 😂","بخيل مات كتبوا على قبره: الدخول مجاناً 😂","واحد غبي ضاع في السوق سأل واحد وين السوق؟ قاله بالنص 😂"]
const saraha=["صراحة.. تحب حد في القروب؟","صراحة.. اخر كذبة؟","لو تطرد واحد من القروب مين؟","صراحة.. بتغار؟"]
const tahadi=["تحدي: غني ريكورد 10 ثواني 😂","تحدي: غير اسمك لـ بطيخة 5 دقايق","تحدي: ارسل اغبى صورة عندك"]

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

    if(low==".الاوامر"){
      await sock.sendMessage(jid,{text:`*👑 أوامر بوت ابو تقى الخرافي*

📿 *.ذكر* - ذكر عشوائي
📖 *.قران* - آية
😂 *.نكتة* - نكتة
🎲 *.صراحة* - لعبة صراحة
😈 *.تحدي* - تحدي
💘 *.حب احمد + سارة* - نسبة حب
📢 *.منشن* - منشن للكل
🎨 *.المصمم* - معلوماتك
💰 *.اسعاري* - اسعارك
🤖 *.بوت* - حالة البوت
${SIGN}`})
      return
    }

    if(low==".ذكر"){
      const r=azkar[Math.floor(Math.random()*azkar.length)]
      await sock.sendMessage(jid,{text:`📿 *${r}*${SIGN}`},{quoted:msg})
      return
    }

    if(low==".قران"){
      const r=quran[Math.floor(Math.random()*quran.length)]
      await sock.sendMessage(jid,{text:`📖 *${r}*${SIGN}`},{quoted:msg})
      return
    }

    if(low==".نكتة"){
      const r=nokat[Math.floor(Math.random()*nokat.length)]
      await sock.sendMessage(jid,{text:`😂 ${r}${SIGN}`})
      return
    }

    if(low==".صراحة"){
      const r=saraha[Math.floor(Math.random()*saraha.length)]
      await sock.sendMessage(jid,{text:`🎲 ${r}${SIGN}`})
      return
    }

    if(low==".تحدي"){
      const r=tahadi[Math.floor(Math.random()*tahadi.length)]
      await sock.sendMessage(jid,{text:`😈 ${r}${SIGN}`})
      return
    }

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
