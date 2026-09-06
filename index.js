const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
let tasbeeh = {}, laws = {}
async function start(){
const { state, saveCreds } = await useMultiFileAuthState('auth')
const sock = makeWASocket({ auth: state })
sock.ev.on('creds.update', saveCreds)
sock.ev.on('messages.upsert', async m=>{
const msg = m.messages[0]; if(!msg.message) return
const jid = msg.key.remoteJid
let text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || ""
let low = text.trim().toLowerCase()
let mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []

if(low=="الاوامر"){
 await sock.sendMessage(jid,{text:`📜 الأوامر:\nتسبيح - عدد\nقوانين - حط قوانين\nملصق\nحب @1 @2\nزواج @`})
 return
}
if(low=="تسبيح"){ tasbeeh[jid]={count:0}; await sock.sendMessage(jid,{text:`📿 بدأ التسبيح - قولوا سبحان الله`}); return }
if(low=="سبحان الله"){ if(tasbeeh[jid]){ tasbeeh[jid].count++; if(tasbeeh[jid].count>=1000){ await sock.sendMessage(jid,{text:`🎉 خلصنا 1000`}); delete tasbeeh[jid] } } return }
if(low=="عدد"){ await sock.sendMessage(jid,{text: tasbeeh[jid]? `📿 ${tasbeeh[jid].count} / 1000` : `❌ مافي تسبيح`}); return }
if(low.startsWith("حط قوانين")){ laws[jid]=text.replace(/حط قوانين/i,"").trim(); await sock.sendMessage(jid,{text:`✅ تم الحفظ`}); return }
if(low=="قوانين"){ await sock.sendMessage(jid,{text: laws[jid] || `❌ لا يوجد قوانين`}); return }
if(low=="ملصق"){
 try{
  let q = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
  let buf = q?.imageMessage? await sock.downloadMediaMessage({message: q}) : await sock.downloadMediaMessage(msg)
  await sock.sendMessage(jid,{sticker: buf})
 }catch{}
 return
}
if(low.startsWith("حب")){
  let percent = Math.floor(Math.random()*101)
  let msgLove = percent<30? "💔 فاشل" : percent<60? "🤔 في أمل" : percent<85? "❤️ حلو" : "💍 أسطوري"
  await sock.sendMessage(jid,{text:`💘 ${text} = ${percent}% ${msgLove}`})
  return
}
if(low.startsWith("زواج")){
  if(mentions[0]) await sock.sendMessage(jid,{text:`💍 تم زواج @${msg.key.participant.split('@')[0]} و @${mentions[0].split('@')[0]} مبروك 🎉`, mentions:[msg.key.participant, mentions[0]]})
  return
}
})
console.log("✅ شغال بدون توقيع")
}
start()
