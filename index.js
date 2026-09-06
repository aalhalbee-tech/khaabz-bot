app.get("/", async (req,res) => {
  if (isConnected) {
    return res.send("<h1 style='text-align:center;margin-top:100px'>✅ تم ربط البوت بنجاح!</h1>")
  }
  if (!qrString) {
    return res.send(`<head><meta http-equiv="refresh" content="2"></head><h1 style='text-align:center;margin-top:100px'>⏳ جاري توليد الباركود...</h1>`)
  }
  try {
    const qrImage = await QRCode.toDataURL(qrString)
    res.send(`
      <div style="text-align:center; font-family:sans-serif; margin-top:20px">
        <h1>📱 امسح الباركود</h1>
        <p>معك دقيقة - الموقع يحدث لحاله كل 20 ثانية</p>
        <img src="${qrImage}" style="width:320px; height:320px; border:8px solid black; border-radius:16px"/>
        <p id="timer" style="font-size:22px; font-weight:bold; color:red">20</p>
        <script>
          let t=20;
          setInterval(()=>{
            t--;
            document.getElementById('timer').innerText=t + ' ثانية متبقية';
            if(t<=0) location.reload();
          },1000);
          setTimeout(()=>location.reload(), 20000);
        </script>
        <p><small>اذا انتهى الوقت، الصفحة تجيب باركود جديد لحالها (3 محاولات = دقيقة)</small></p>
      </div>
    `)
  } catch(e){ res.send("حدث الصفحة") }
})
