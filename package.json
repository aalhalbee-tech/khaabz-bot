require('http').createServer((req,res)=>{res.end('Live')}).listen(process.env.PORT||3000);
const {default:makeWASocket,useMultiFileAuthState}=require('@whiskeysockets/baileys');
const P=require('pino');
const fs=require('fs');
if(fs.existsSync('./auth_info'))fs.rmSync('./auth_info',{recursive:true,force:true});
(async()=>{
const{state,saveCreds}=await useMultiFileAuthState('./auth_info');
const sock=makeWASocket({auth:state,logger:P({level:'silent'}),browser:['Ubuntu','Chrome','20.0']});
sock.ev.on('creds.update',saveCreds);
setTimeout(async()=>{
try{
let code=await sock.requestPairingCode('963993675005');
console.log('>>>>>>>>>>>>>>>>>>>>>');
console.log('الكود:',code);
console.log('>>>>>>>>>>>>>>>>>>>>>');
}catch(e){console.log(e.message)}
},3000);
sock.ev.on('connection.update',u=>{if(u.connection==='open')console.log('✅ تم الربط')});
})();
