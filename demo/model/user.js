//user model

var ec      = require('ec');
var db      = ec.mysql;
var helper  = ec.helper;
var table   = "user";

module.exports ={
    //根椐uid或name查询用户信息
    get: function(uid, name, cb){
        var options = {};
        if(uid) options.wh = {uid:uid};
        else if(name) options.wh = {name:name};
        db.get(table, options, cb);
    },
    add: function(name, pass, cb){
        var data = {name:name,pass:pass};
        //判断是否存在相同用户名
        db.get(table, {wh:{name: data['name']}}, function(err,result){
            if(!err){
                if(result.length > 0){
                    return cb('name exists');
                }else{
                    db.add(table,data, cb);
                }
            }
            else{
                return cb(err);
            }
        });
    },
    set: function(uid, data, cb){
        var wh = {uid: uid};
        db.update(table, data, wh, cb);
    }
};
