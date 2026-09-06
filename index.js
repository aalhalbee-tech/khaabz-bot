const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const express = require("express")
const app = express()
app.get("/", (req,res) => res.send("البوت شغال ✅ - شوف الكود في Logs"))
app.listen(process.env.PORT || 10000)

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("session")
    const sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: ["Khaabz","Chrome","1.0"] })
    sock.ev.on("creds.update", saveCreds)

    // اذا مو مربوط، طلب كود جديد كل مرة
    if (!sock.authState.creds.registered) {
        let num = (process.env.NUMBER || "").replace(/[^0-9]/g,"")
        if (!num) { console.log("❌ حط NUMBER في Environment"); return; }

        const getCode = async () => {
            try {
                const code = await sock.requestPairingCode(num)
                console.log("\n=============================")
                console.log("✅ كودك الجديد: " + code)
                console.log("معك 20 ثانية - واتساب > ربط برقم الهاتف")
                console.log("=============================\n")
            } catch(e) {
                console.log("فشل طلب الكود، رح اجرب بعد 10 ثواني")
            }
        }
        await getCode()
        // كل 30 ثانية جدد الكود تلقائيا
        setInterval(getCode, 30000)
    }

    sock.ev.on("connection.update", async (u) => {
        const { connection } = u
        if (connection === "open") {
            console.log("✅✅ تم الربط بنجاح! وقف تجديد الأكواد")
            clearInterval(global.codeInterval)
        }
        if (connection === "close") {
            console.log("انقطع الاتصال، اعادة تشغيل بعد 5 ثواني...")
            setTimeout(start, 5000)
        }
    })

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        if (text.trim() === ".ذكر") {
            await sock.sendMessage(msg.key.remoteJid, { text: "📿 سبحان الله وبحمده" })
        }
    })
}
start()
