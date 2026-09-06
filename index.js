const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const express = require("express")
const QRCode = require("qrcode")
const app = express()
let qr=null, connected=false

app.get("/", async (req,res)=>{
  if(connected) return res.send("<h1 style=text-align:center>✅ بوت ابو تقى شغال</h1>")
  if(!qr) return res.send("<h1 style=text-align:center>⏳ انتظار باركود</h1>")
  const img=await QRCode.toDataURL(qr)
  res.send(`<center><img src="${img}" style="width:300px"></center>`)
})
app.listen(process.env.PORT||10000)

async function start(){
  const {state, saveCreds}=await useMultiFileAuthState("session")
  const sock=makeWASocket({auth: state, browser: ["bot","Chrome","1"]})
  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", u=>{
    if(u.qr) qr=u.qr
    if(u.connection==="open"){ connected=true; qr=null; console.log("connected") }
    if(u.connection==="close") setTimeout(start,3000)
  })
  sock.ev.on("messages.upsert", async (m)=>{
    const msg=m.messages[0]
    if(!msg.message) return
    if(msg.key.fromMe) return
    const jid=msg.key.remoteJid
    const txt=(msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim()
    const low=txt.toLowerCase()

    if(low==".الاوامر"){
      await sock.sendMessage(jid,{text:"اوامر بوت ابو تقى:\n.ذكر\n.قران\n.نكتة\n.صراحة\n.تحدي\n.بوت"})
      return
    }
    if(low==".بوت"){
      await sock.sendMessage(jid,{text:"✅ البوت شغال - ابو تقى 👑"})
      return
    }
    if(low==".ذكر"){
      await sock.sendMessage(jid,{text:"📿 سبحان الله وبحمده\n— ابو تقى 👑"})
      return
    }
  })
}
start()      await sock.sendMessage(jid,{text:"👑 المصمم: ابو تقى\n🎨 تصميم شعارات - بنرات\nللطلب خاص"})
      return
    }
    if(low==".اسعاري"){
      await sock.sendMessage(jid,{text:"💰 اسعار ابو تقى\nلوغو: 50\nسوشيال: 20\nباكج كامل: 100"+SIGN})
      return
    }
    if(low==".بوت"){
      await sock.sendMessage(jid,{text:"✅ البوت شغال 100%\n👑 ابو تقى"})
      return
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
