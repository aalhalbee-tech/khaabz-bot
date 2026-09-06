require('http').createServer((req,res)=>res.end('Live')).listen(process.env.PORT||3000);
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
async function start(){
 const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
 const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:['Ubuntu','Chrome','20.0'] });
 sock.ev.on('creds.update', saveCreds);
 if(!state.creds.registered){
   const getCode = async()=>{
     try{
       let code = await sock.requestPairingCode('963993675005');
       console.log(`\n=== الكود: ${code} ===\n`);
     }catch(e){ console.log(e.message)}
   };
   setTimeout(getCode, 3000);
   setInterval(getCode, 30000); // كل 30 ثانية كود جديد
 }
 sock.ev.on('connection.update', u=>{
   if(u.connection === 'open') console.log('✅✅✅ تم الربط بنجاح');
 });
}
start();
