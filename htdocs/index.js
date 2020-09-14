const localstore=new dataStore();
localstore.initialize();
const https_client=new http_worker();
https_client.init('http://localhost',3000)

const screens=['loginscreen','mainscreen'];
function showScreen(id) {
 screens.forEach(s=>document.getElementById(s).style.display='none');
 document.getElementById(id).style.display='block';
}

function pageload() {
 const isLoggedIn=localstore.getLocalData('token','');
 if(isLoggedIn) showScreen('mainscreen');
 else showScreen('loginscreen');
}

function onlogin() {
 var username=document.getElementById('txt_username').value;
 var password=document.getElementById('txt_password').value;
 https_client.request('login',{username:username,password:password},function(e,r){
  if(e) return console.log('Failed to login');
  if(r.status=='ok') {
   localstore.storeLocalData('token',r.token);
   showScreen('mainscreen');
  }
 });
}