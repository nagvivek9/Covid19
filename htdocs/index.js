const localstore=new dataStore();
localstore.initialize();
const https_client=new http_worker();
https_client.init('localhost',3000)

const screens=['loginscreen','mainscreen'];
function showScreen(id) {
 screens.forEach(s=>document.getElementById(s).style.display='none');
 document.getElementById(id).style.display='block';
}

function pageload() {
 console.log('Pageloaded');
}