function http_worker() {
 var _hosturl;
 var _port;

 this.init = function(hosturl,port) {
  _hosturl = hosturl;
  _port = port;
 }

 this.request = function(action, params, cb) {
  var url = _hosturl;
  if(_port != 0) url += (":"+_port);
  url += ("/api/"+action);
  var d = '';
  for(var p in params) {
   if(!params.hasOwnProperty(p)) continue;
   if(d.length) d+= '&';
   d+=encodeURIComponent(p)+'='+encodeURIComponent(params[p]);
  }

  var x = new XMLHttpRequest();
  x.open('POST',url);
  x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  x.setRequestHeader('Access-Control-Allow-Origin','*');
  x.onreadystatechange=function() {
   if(x.readyState===4) {
    if(x.status!=200) {
     console.log("http_worker -> HTTP error: "+x.status);
     return cb(new Error("HTTP error: "+x.status), null);
    }
    var j;
    console.log(x.responseText);
    try {
     j = JSON.parse(x.responseText);
    }
    catch(error) {
     var temp = "(" + x.responseText + ")";  
     j = eval(temp);
    }
    console.log("http_worker -> (" + x.responseText.length + ") - " + x.responseText);

    if(j) return cb(null, j);
    return cb(new Error("JSON parse error: "+x.responseText), null);
   }
  };
  console.log("http_worker <- "+ url + " " + JSON.stringify(params));
  x.send(d);
 }
}