const localstore=new dataStore();
localstore.initialize();
const https_client=new http_worker();
https_client.init('http://localhost',3000)

const screens=['loginscreen','mainscreen','statesscreen'];
function showScreen(id) {
 screens.forEach(s=>document.getElementById(s).style.display='none');
 document.getElementById(id).style.display='block';
}

function pageload() {
 const isLoggedIn=localstore.getLocalData('token','');
 if(isLoggedIn) load_mainscreen();
 else showScreen('loginscreen');
}
function on_country(evt) {
 var country=evt.target.id;
 var token=localstore.getLocalData('token','');
 https_client.request('states',{_T:token,country:country},function(e,r){
  if(e) return alert('Failed to get states list');
  if(!(r.list)) return alert('No states found in this country');
  for(var s in r.list) {
   var item =document.createElement('div');
   item.innerText=s;
   var positive =document.createElement('div');
   positive.innerText=`Positive: ${r.list[s].positive}`;
   var total =document.createElement('div');
   total.innerText=`Total tested: ${r.list[s].totaltests}`;
   document.getElementById('statesForm').appendChild(item);
   document.getElementById('statesForm').appendChild(positive);
   document.getElementById('statesForm').appendChild(total);
   document.getElementById('statesForm').append('<br/>');
   showScreen('statesscreen');
  }
  
 });

}
function load_mainscreen() {
 var token=localstore.getLocalData('token','');
 if(!token) alert('Something went wrong');
 https_client.request('countries',{_T:token},function(e,r){
  if(e) return alert('Failed to get conuntries list');
  if(r.list&&r.list.length) {
   r.list.forEach(c=>{
    var item=document.createElement('div');
    item.className='listitem';
    item.innerText=c;
    item.id=c;
    item.onclick=on_country.bind(this);
    document.getElementById('mainForm').appendChild(item);
   });
  }
  showScreen('mainscreen');
 });
}
function onlogin() {
 var username=document.getElementById('txt_username').value;
 var password=document.getElementById('txt_password').value;
 https_client.request('login',{username:username,password:password},function(e,r){
  if(e) return console.log('Failed to login');
  if(r.status=='ok') {
   localstore.storeLocalData('token',r.token);
   https_client.request('countries',{_T:r.token},function(e,r){
    if(e) return alert('Failed to get conuntries list');
    if(r.list&&r.list.length) {
     r.list.forEach(c=>{
      var item=document.createElement('div');
      item.className='listitem';
      item.innerText=c;
      item.id=c;
      item.onclick=on_country.bind(this);
      document.getElementById('mainForm').append(item);
     });
    }
    showScreen('mainscreen');
   });
  }
 });
}