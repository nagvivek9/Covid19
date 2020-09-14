const screens=['loginscreen','mainscreen'];
function showScreen(id) {
 screens.forEach(s=>document.getElementById(s).style.display='none');
 document.getElementById(id).style.display='block';
}

function pageload() {
 console.log('Pageloaded');
}