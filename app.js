const PATH = require('path');
var HTTP = require('http');
const EXPRESS = require('express');
const app = EXPRESS();

const htdocsdir = PATH.join(__dirname,'htdocs');

app.use(EXPRESS.static(htdocsdir));

app.use(function(req,res,cb) { 
 const api_path = (req.originalUrl||req.url||'').replace(/\?.*/,'');
 cb(`missing link — ${api_path}`);
});

const server= HTTP.createServer(app);
server.listen(3000,function(){
 console.log(`HTTP server listening on the port ${3000}`);
});