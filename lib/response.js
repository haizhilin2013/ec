// @Author: Tim<tim8670@gmail.com>
// 响应处理，视图渲染

var fs      = require('fs');
var path    = require('path');
var events  = require('events');
var crypto  = require('crypto');
var log     = require('./log');
var helper  = require('./helper');
var conf    = require(__CONFIG);

var emitter = new events.EventEmitter();

exports.emitter = emitter;

exports.init = function(){
    this.statusCode = 200;
    this.header = {'Content-Type':conf.defaultContentType || 'text/html'};
    this.resData = '';
    
    //显示错误页面
    this.showErr = function(status,msg){
        this.statusCode = status;
        if(!msg){
            this._flush();
        }
        else this._parseTpl(status.toString(),{msg:msg});
        //sleep一下，让res_flush事件有足够时间被捕获
        //for(var t = Date.now();Date.now() - t <= 5000;);
    };
    //设置响应头(相同的会覆盖)
    this.setHeader = function(k,v){
        if(k) this.header[k] = v;
    };
     //设置cookie;sec有效期，为相对于当前时间的秒数
    this.setCookie = function(k,v,sec,options){
        if(k){
            if(undefined == this.header['Set-Cookie']) this.header['Set-Cookie'] = [];
            if(v){
                var cipher  = crypto.createCipher('aes-256-cbc',conf.cookieEncryptKey);
                var crypted = cipher.update(v,'utf8','base64');
                crypted    += cipher.final('base64');
                v = crypted;
            }
            var cookieStr = k + "=" + v;
            if(sec){
                cookieStr += ";Expires="+ helper.getUTCTime(sec);
            }
            if(options){
                if(options.path)    cookieStr += ";Path="  + options.path;
                if(options.domain)  cookieStr += ";Domain="+ options.domain;
                if(options.secure)  cookieStr += ";Secure";
                if(options.httponly)cookieStr += ";HttpOnly";
            }
            this.header['Set-Cookie'].push(cookieStr);
        }
    };
    //渲染模板，如果tpl为null则直接输出data
    this.render= function(tpl,data,encode){
        conf.log.fwDebug && log.debug('res render start');
        if(tpl){
            this._parseTpl(tpl,data,encode);
        }else{ //未设置tpl，直接返回
            this.resData = typeof data == 'string' ? data: JSON.stringify(data);
            this._flush(encode);
        }
    };
    //响应一个302重定向
    this.redirect= function(url){
        this.setHeader('Location',url);
        this.statusCode = 302;
        this._flush();
    };
    
    //////** 私有方法 **/////
    this._flush = function(encode){
        var res =  {body:this.resData,header:this.header};
        conf.log.fwDebug && log.debug('emit res_flush event');
        emitter.emit('res_flush',null,res,encode);
    };
    
    this._parseTpl = function(tplName,data,encode){
        conf.log.fwDebug && log.debug('tpl parse start');
        var _self = this;
        var tplFile = path.join(conf.appPath,'view',tplName);
        if(fs.existsSync(tplFile)){
            try{
                var tpl  = require(conf.tplEngine || "swig");
                if(undefined == tpl.renderFile){
                    throw 'tplEngin error: method renderFile not defined';
                }

                _self.resData = tpl.renderFile(tplFile,data);
                _self._flush(encode);
            }catch(e){
                console.log(e.stack? e.stack : e.toString());
                this.statusCode = 500;
                _self.resData = e.toString();
                _self._flush(encode);
            }
        }else{
            log.error('tpl file not found: '+tplFile);
            if(this.statusCode == 200){
                this.statusCode = 500;
                _self.resData = 'tpl file  not found';
            }else{
                _self.resData = data.msg;
            }
            _self._flush(encode);
        }
    };
    
    return this;
}