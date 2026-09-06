const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')

let tasbeeh = {}
let laws = {}

async function start(){
const { state, saveCreds } = await useMultiFileAuthState('auth')
const sock = makeWASocket({ auth: state })
sock.ev.on('creds.update', saveCreds)

sock.ev.on('group-participants.update', async e=>{
 if(e.action=="add"){
  await sock.sendMessage(e.id,{text:`👋 أهلا @${e.participants[0].split('@')[0]} نورت! اكتب الاوامر`, mentions:e.participants})
 }
})

sock.ev.on('messages.upsert', async m=>{
const msg = m.messages[0]
if(!msg.message) return
const jid = msg.key.remoteJid

let text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.ephemeralMessage?.message?.extendedTextMessage?.text || msg.message.ephemeralMessage?.message?.conversation || ""
let low = text.trim().toLowerCase()
let mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []

// الاوامر
if(low=="الاوامر" || low==".الاوامر"){
 await sock.sendMessage(jid,{text:`👑 *بوت أبو تقى* 👑\n━━━━━━━━━━\n📿 تسبيح\n📿 عدد\n📜 قوانين\n⚖️ حط قوانين + النص\n🧷 ملصق - رد على صورة\n❤️ حب @1 @2\n💍 زواج @منشن\n━━━━━━━━━━`})
 return
}

// تسبيح
if(low=="تسبيح" || low==".تسبيح"){
 tasbeeh[jid]={count:0}
 await sock.sendMessage(jid,{text:`📿 *بدأ التسبيح*\nقولوا: سبحان الله\n🎯 الهدف 1000`})
 return
}
if(low=="سبحان الله"){
 if(tasbeeh[jid]){
  tasbeeh[jid].count++
  if(tasbeeh[jid].count%50==0) await sock.sendMessage(jid,{text:`📿 وصلنا ${tasbeeh[jid].count} / 1000`})
  if(tasbeeh[jid].count>=1000){ await sock.sendMessage(jid,{text:`🎉 خلصنا 1000 تسبيحة!`}); delete tasbeeh[jid] }
 }
 return
}
if(low=="عدد" || low==".عدد"){
 if(tasbeeh[jid]) await sock.sendMessage(jid,{text:`📿 العدد: ${tasbeeh[jid].count} / 1000`})
 else await sock.sendMessage(jid,{text:`❌ مافي تسبيح`})
 return
}

// قوانين
if(low.startsWith("حط قوانين")){
 laws[jid]=text.replace(/حط قوانين|\.حط قوانين/i,"").trim()
 await sock.sendMessage(jid,{text:`✅ تم حفظ القوانين`})
 return
}
if(low=="قوانين" || low==".قوانين"){
 await sock.sendMessage(jid,{text: laws[jid]? `📜 القوانين:\n${laws[jid]}` : `❌ ما في قوانين`})
 return
}

// ملصق
if(low=="ملصق" || low==".ملصق"){
 try{
  let quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
  let buf = null
  if(quoted?.imageMessage) buf = await sock.downloadMediaMessage({message: quoted})
  else if(msg.message.imageMessage) buf = await sock.downloadMediaMessage(msg)
  if(!buf){ await sock.sendMessage(jid,{text:`❌ رد على صورة واكتب ملصق`}); return }
  await sock.sendMessage(jid,{sticker: buf})
 }catch(e){ await sock.sendMessage(jid,{text:`❌ فشل تحويل الملصق`}) }
 return
}

// ❤️ حب
if(low.startsWith("حب")){
  if(mentions.length < 2){
    await sock.sendMessage(jid,{text:`❤️ اكتب: حب @شخص @شخص2`})
    return
  }
  let percent = Math.floor(Math.random()*101)
  let bar = "█".repeat(Math.floor(percent/10)) + "░".repeat(10-Math.floor(percent/10))
  let msgLove = percent < 30? "💔 حب فاشل اهرب" : percent < 60? "🤔 في أمل" : percent < 85? "❤️ حب حلو كملوا" : "💍 حب أسطوري تزوجوا!"
  await sock.sendMessage(jid,{text:`💘 *عداد الحب* 💘\n👤 @${mentions[0].split('@')[0]}\n👤 @${mentions[1].split('@')[0]}\n\n${bar} ${percent}%\n${msgLove}`, mentions: mentions})
  return
}

// 💍 زواج
if(low.startsWith("زواج")){
  if(mentions.length==0){ await sock.sendMessage(jid,{text:`💍 اكتب: زواج @البنت`}); return }
  await sock.sendMessage(jid,{text:`💍 *تم الزواج!* 💍\n\n🤵 @${msg.key.participant.split('@')[0]} تزوج @${mentions[0].split('@')[0]}\n\nمبروووك 🎉`, mentions:[msg.key.participant, mentions[0]]})
  return
}

})
console.log("✅ البوت شغال - تسبيح + قوانين + ملصق + حب")
}
start()
