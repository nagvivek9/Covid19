const R = require('express').Router({caseSensitive:true});
const logthru = ['trace','debug','info','warn','error','fatal'].reduce(function(p,c) {
 p[c]=function() { var l = console; return l[c].apply(l,arguments) };
 return p;
},{});
const mysql=require('./mysql')({config: {default: {
 host: 'us-cdbr-iron-east-03.cleardb.net',
 user: 'bffceedc8f4f44', password: '20c60fa7',
 database: 'heroku_54ea66f27e2e831',
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
 cb();
}
R.all('/countries',auth_token,function(req,res,cb){

});

module.exports = R;