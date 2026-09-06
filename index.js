require('http').createServer((req,res)=>res.end('Live')).listen(process.env.PORT||3000);
const {default:makeWASocket,useMultiFileAuthState}=require('@whiskeysockets/baileys');
const P=require('pino');
(async()=>{
const{state,saveCreds}=await useMultiFileAuthState('./auth_info');
const sock=makeWASocket({auth:state,logger:P({level:'silent'}),browser:['Ubuntu','Chrome','20.0']});
sock.ev.on('creds.update',saveCreds);
if(!state.creds.registered){
setTimeout(async()=>{
let code=await sock.requestPairingCode('963993675005');
console.log('الكود:',code);
},3000);
}
sock.ev.on('connection.update',u=>{
if(u.connection==='open')console.log('✅ تم الربط - لا تمسح شي هلا');
});
})();
