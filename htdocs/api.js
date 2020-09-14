const R = require('express').Router({caseSensitive:true});
const logthru = ['trace','debug','info','warn','error','fatal'].reduce(function(p,c) {
 p[c]=function() { var l = console; return l[c].apply(l,arguments) };
 return p;
},{});
const mysql=require('./mysql')({config: {default: {
 host: 'yourhost',
 user: 'username', password: 'pwd',
 database: 'db',
 meta_database: 'meta'
}},
logger: logthru});
const ASYNC=require('async');
const SHORTID=require('shortid');

R.post('/login',function(req,res,cb) {
 const un=req.USERDATA.P('username');
 const pwd=req.USERDATA.P('password');
 ASYNC.waterfall([
  function auth(cb) {
   mysql.Q('SELECT 1 FROM home_user WHERE phone=:un AND password=:pwd LIMIT 1',
   {un,pwd},function(e,r){
    if(e) return cb(e);
    if(!r.length) return cb('Invalid user');
    cb(null,null);
   });
  },
  function token(r,cb) {
   const token=SHORTID.generate();
   mysql.Q('INSERT INTO home_token(token,date_created) VALUES(:tok,now())',
   {tok:token},function(e,r){
    if(e) return cb(e);
    cb(null,token);
   });
  }
 ],function(e,r){
  if(e) return cb(e);
  res.json({status:'ok',token:r});
 });
 
 
});
function auth_token(req,res,cb) {
 var token=req.USERDATA.P('_T');
 if(!token) return res.json({status:'auth'});
 mysql.Q('SELECT 1 FROM home_token WHERE token=:token LIMIT 1',
  {token},function(e,r){
   if(e) return cb(e);
   if(!r.length) return res.json({status:'auth'});
   cb();
  });
 cb();
}
const countries={
 'INDIA': {
  'Telangana': {
   positive: 100,
   totaltests: 200000
  },
  'Andhrapradesh': {
   positive: 200,
   totaltests: 300000
  }
 },
 'GERMANY': {
  'Hamburg': {
   positive: 50,
   totaltests: 300000
  },
  'Hesse': {
   positive: 500,
   totaltests: 100000
  }
 },
 'SPAIN': {
  'Madrid': {
   positive: 200,
   totaltests: 300000
  },
  'Málaga': {
   positive: 90,
   totaltests: 500000
  }
  
 },
 'SRILANKA': {
  'Anuradhapura': {
   positive: 200,
   totaltests: 300000
  },
  'Badulla': {
   positive: 800,
   totaltests: 50000
  }
  
 }};
R.all('/countries',auth_token,function(req,res,cb){
 res.json({status:'ok', list:Object.keys(countries)});
});

R.all('/states',auth_token,function(req,res,cb){
 var country=req.USERDATA.P('country');
 if(!country) return res.json({status:'data'});
 if(!countries[country]) return res.json({status:'notfound'});
 res.json({status:'ok', list:countries[country]});
});

R.post('/user/create', function(req,res,cb){
 var fn=req.USERDATA.P('firstname');
 var ln=req.USERDATA.P('lastname');
 var un=req.USERDATA.P('username');
 var pwd=req.USERDATA.P('password');
 mysql.Q(`INSERT INTO home_user(firstname,lastname,username,password,date_created) 
         VALUES(:fn,:ln,ün,:pwd,now())`,
 {fn,ln,un,pwd},function(e,r){
  if(e) return cb(e);
  res.json({status:'ok'});
 });
});
R.get('/user/:uid', function(req,res,cb){
 var uid=req.USERDATA.P('uid');
 mysql.Q(`SELECT firstname,lastname,username,password FROM home_user WHERE id=:uid`,
 {uid},function(e,r){
  if(e) return cb(e);
  if(!r.length) return res.json({status:'notfound'});
  res.json({status:'ok',user:r[0]});
 });
});
R.put('/user/update', function(req,res,cb){
 var fn=req.USERDATA.P('firstname');
 var ln=req.USERDATA.P('lastname');
 var un=req.USERDATA.P('username');
 var pwd=req.USERDATA.P('password');
 mysql.Q(`UPDATE home_user SET firstname=COALESCE(:fn,firstname),lastname=COALESCE(:ln,lastname),
 username=COALESCE(:un,username),password=COALESCE(:pwd,password))`,
 {fn,ln,un,pwd},function(e,r){
  if(e) return cb(e);
  res.json({status:'ok'});
 });
});

R.delete('/user/:uid', function(req,res,cb){
 var uid=req.USERDATA.P('uid');
 mysql.Q(`DELETE FROM home_user WHERE id=:uid`,
 {uid},function(e,r){
  if(e) return cb(e);
  res.json({status:'ok'});
 });
});
module.exports = R;