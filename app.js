const PATH = require('path');
var HTTP = require('http');
const EXPRESS = require('express');
const app = EXPRESS();

const htdocsdir = PATH.join(__dirname,'htdocs');
app.use(function(req,res,cb) {
 res.set('Access-Control-Allow-Origin','*');
 cb();
});
const BODYPARSER = require('body-parser');
app.use(BODYPARSER.urlencoded({extended:true})).use(BODYPARSER.json());
function hasprop(o,p) {
 if(!o) return false;
 if(o[p]) return true;
 if(o.hasOwnProperty) return o.hasOwnProperty(p);
 return Object.hasOwnProperty.call(o,p);
}
function setup(req,res,cb) {
 if(!req.USERDATA) req.USERDATA = {};
 req.USERDATA.P = function(n) {
  if(hasprop(req.body,n)) return req.body[n];
  if(hasprop(req.query,n)) return req.query[n];
  if(hasprop(req.params,n)) return req.params[n];
  if(hasprop(req.cookies,n)) return req.cookies[n];
  return undefined;
 };
 cb();
}
app.use(setup);

app.use('/api',require('./htdocs/api.js'));
app.use(EXPRESS.static(htdocsdir));

app.use(function(req,res,cb) { 
 const api_path = (req.originalUrl||req.url||'').replace(/\?.*/,'');
 cb(`missing link — ${api_path}`);
});

const server= HTTP.createServer(app);
server.listen(3000,function(){
 console.log(`HTTP server listening on the port ${3000}`);
});