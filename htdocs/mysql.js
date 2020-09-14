var MYSQL = require('mysql');
var DOMAIN = require('domain');
var ASYNC = require('async');

function dab(f) {
 return DOMAIN.active ? DOMAIN.active.bind(f) : f;
}

module.exports = function(o) {

 const slowquery = o.slowquery||60000;

 var pools = {};
 function pool(c) {
  if(!c) c='default';
  if(pools[c]) return pools[c];
  if(!o.config[c])
   return o.logger && o.logger.error({connname:c},'No mysql connection %s defined',c),null;
  return pools[c]=MYSQL.createPool(o.config[c]);
 }

 function conn(c,cb) {
  if(!cb) cb=c, c='default';
  else if(!c) c='default';
  var P = pool(c);
  if(!P) return cb(new Error('Failed to create mysql pool for '+c));
  P.getConnection(dab(function(e,C) {
   if(e) return cb(e,C);
   C.config.queryFormat = function(q,v) {
    if(!v) return q;
    return q.replace(/:(\w+)/g, function(t,k) {
     return v.hasOwnProperty(k) ? ((v[k]===null)?'NULL':this.escape(v[k])) : t;
    }.bind(this));
   };
   C.Q = function(q,p,cb) {
    if(!cb) cb=p, p={};
    o.logger && o.logger.trace({query:q,args:p},'MySQL: %s',q);
    const t0=new Date();
    this.query(q,p,dab(function(e,r) {
     if(o.logger) {
      const t1=new Date();
      const dt = t1-t0;
      const ldata = {
       query:q, args:p, dt,
       connname:c,affected:r?r.affectedRows||null:null,
       changed:r?r.changedRows||null:null,
       inserted:r?r.insertId||null:null,
       length:r?r.length||null:null
      };
      if(dt<slowquery)
       o.logger.trace(ldata,"MySQL query '%s' took %dms",q,dt);
      else
       o.logger.warn(ldata,`Slow MySQL query: ${q}`);
     }
     cb(e,r);
    }));
   };
   cb(null,C);
  }));
 }

 return {

  P: function(n) {
   return pool(n);
  },

  C: function(n,cb) {
   if(!cb) cb=n,n=null;
   return conn(n,cb);
  },

  Q: function(n,q,p,cb) {
   var aty = Object.keys(arguments).length;
   if(aty==2) cb=q,q=n,p={},n=null;
   else if(aty==3) {
    cb=p;
    if(typeof q=='string') p={};
    else p=q,q=n,n=null;
   }
   conn(n,function(e,C) {
    if(e) return cb(e);
    C.Q(q,p,function(e,r) {
     C.release();
     cb(e,r);
    });
   });
  },

  E: function(cb) {
   ASYNC.each(pools,function(p) {
    p.end(dab(cb));
   },function(e,r) {
    pools=[];
    cb(e,r);
   });
  }
 };

};
