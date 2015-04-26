// @Author: Tim<tim8670@gmail.com>
// session存取（提供通用存取接口）

var req     = require('./request');
var res     = require('./response');
var log     = require('./log');
var helper  = require('./helper');
var conf    = require(__CONFIG);
var fs      = require('fs');
var path    = require('path');

module.exports = {
    handler: {},
    on :false,
    needCommit :false,
    
    //设置一个session
    set: function(k,v){
        if(this.on || this.start()) {
            this.handler.write(k,v);
            this.needCommit = true;
        }
    },
    //读取session中指定一个key的值
    get: function(k){
        if(this.on || this.start()) {
            return this.handler.read(k);
        }
    },
    //获取整个session的内容
    getAll:function(){
        if(this.on || this.start()) {
            var content = this.handler.read();
            var hasProp = false;  
            for (var prop in content){  
                hasProp = true;  
                break;  
            }
            return hasProp ? content : null; //未有session时返回空串
        }
    },
    //清空session（有指定k时，只删除该k及其内容）
    unset:function(k){
        if(this.on || this.start()) {
            this.handler.destroy(k);
            this.needCommit = true;
        }
    },
    //初始化session
    start:function(){
        conf.log.fwDebug && log.debug('session start');
        if(conf.session.handler && conf.session.handler != 'builtin'){ //使用应用定义的session
            try{
                var hf = path.join(conf.appPath,conf.session.handler);
                this.handler = require(hf);
                if(!this.handler.open || !this.handler.write || !this.handler.read || !this.handler.save || !this.handler.destroy || !this.handler.gc){
                    throw 'Session Handler Error';
                }
            }catch(e){
                log.error(e.toString());
                if(e.statck){
                    log.error(e.statck);
                }
                if(e != 'Session Handler Error '){
                    e = 'Session Handler Not Found';
                }
                res.showErr(500,e);
                return false;
            }
        }else{ //内置处理
            conf.log.fwDebug && log.debug('use builtin sessiion handler');
            this.handler = {
                sName:'', //session文件名
                sid:'',
                data:{},
                open:function(sid){
                    this.sid = sid;
                    this.sName  = path.join(conf.session.savePath || '/tmp/',this.sid);
                    if(fs.existsSync(this.sName)){
                        this.data = JSON.parse(fs.readFileSync(this.sName,'utf8'));
                    }
                },
                write:function(k,v){
                    this.data[k] = v;
                },
                read:function(k){
                    return k ? this.data[k] : this.data;
                },
                //持久化
                save:function(){
                    fs.writeFile(this.sName,JSON.stringify(this.data));
                },
                destroy:function(k){
                    if(k)  delete this.data[k];
                    else   this.data = {}; //清除全部
                },
                //过期数据清理
                gc:function(maxLife){
                    return;
                }
            }
        }
        //获取或生成sid
        var name = conf.session.name || 'ecSID';
        var sid = '';
        if(req.cookies && req.cookies[name]) sid = req.cookies[name];
        else sid = helper.md5(new Date().getTime().toString()); 
        this.handler.open(sid);
        this.on = true;
        //用cookie保存sid
        res.setCookie(name,sid,conf.session.cookieLifeTime||3600);
        return true;
    },
    //保存session内容(由框架调用)
    _commit:function(){
        conf.log.fwDebug && log.debug('session commit');
        if(this.on){
            if(this.needCommit){
                conf.log.fwDebug && log.debug('session save');
                this.handler.save();
            }
            //满足条件，调用gc
            var gcR = conf.session.gcRatio || (10/100);
            if(Math.random() <= gcR){
                log.info('session gc');
                this.handler.gc(conf.session.gcLifeTime || 24 * 3600);
            }
        }
    },
}


