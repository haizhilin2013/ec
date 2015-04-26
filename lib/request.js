// @Author: Tim<tim8670@gmail.com>
// 请求内容解释处理

var url     = require('url');
var crypto  = require('crypto');
var path    = require('path');
var querystring = require("querystring");
var mime    = require('./mime');
var log     = require('./log');
var conf    = require(__CONFIG);
var fs = require('fs');

module.exports = {
    parse: function(req,body){
        var pathname      = url.parse(req.url).pathname.replace(/\.\./g, "").replace(/\/+/g,'/'); //去掉..及多余的/
        var ext           = path.extname(pathname).toLowerCase();
        this.fileExt      = ext ? ext.slice(1) : 'unknown';
        this.contentType  = mime[this.fileExt]; //所请求的请态文件的content-type
        this.post = {};
        this.files = {};
        this.body = body;
        var rContentType = '';
        var boundary = '';
        if(req.method == 'POST' && req.headers['content-type']){
            var ct = req.headers['content-type'].split(";");
            rContentType = ct[0].trim();
            if(rContentType == 'multipart/form-data'){
                try{
                    boundary = ct[1].split("=");
                    boundary = "--"+ boundary[1].trim();
                    this._parseMultipart(boundary);
                }catch(e){
                    log.error('parse multi part fail:'+ e.toString());
                }
            }
            else {
                this.post = querystring.parse(this.body);
            }
        }        
       
        this.pathname     = pathname;
        this.header       = req.headers;
        this.method       = req.method;
        this.get          = url.parse(req.url,true).query;
        this.cookies      = this._readCookie();

        return {
            //todo: xss过滤
            pathname:       this.pathname,
            contentType :   this.contentType,
            fileExt:        this.fileExt,
            method:         this.method,
            header:         this.header,
            get:            this.get,
            body:           this.body,
            post:           this.post,
            cookies:        this.cookies,
            files:          this.files
        }
    },
   
    _readCookie: function(){
        var cookies = {};
        if(this.header.cookie){
            this.header.cookie.split(";").forEach(function(val){
                val     = val.trim();       //不能直接用querystring.parse,它解出来的会把+变成空格
                var idx = val.indexOf('='); //base64后有多个"="，不能直接split
                cookies[val.substr(0,idx)] = val.substr(idx+1);
            });
        }
        if(cookies && conf.cookieEncryptKey){
            try{
                for(var k in cookies){
                    var val = cookies[k];
                    var decipher = crypto.createDecipher('aes-256-cbc',conf.cookieEncryptKey);
                    var dec      = decipher.update(val,'base64','utf8');
                    dec         += decipher.final('utf8');
                    cookies[k]   = dec;
                }
            }catch(e){
                log.error('cookie decrypt fail:'+e.toString());
            }
        }
        return cookies;
    },
    //解释multipart内容
    _parseMultipart: function(boundary){
        var _self = this;
        var fields = this.body.split(boundary);
        fields.forEach(function(v){
            v = v.trim();
            if(v){
                var idx   = v.indexOf("\r\n");
                var line1 = v.substr(0,idx); //取第一行，来解释字段名和文件名
                var tmp   = querystring.parse(line1,";");
                if(tmp[' name']){ //有' name'字段的内容才有效
                    var k = tmp[' name'].replace(/\"/g,"");
                    if(tmp[' filename'] != undefined){ //有' filename'是文件域
                        var fname =  tmp[' filename'].replace(/\"/g,"");
                        var file={};
                        if(fname){
                            var line2 = '';
                            var idx1 = v.indexOf('\r\n',idx+2);//找第二行(conten-type)
                            if(idx1 == -1) line2 = v.substr(idx+2);
                            else line2 = v.substr(idx+2,idx1-idx);
                            file['content-type'] = line2.split(":")[1].trim();
                            if(idx1 > 0){
                                file['data']    = new Buffer(v.substr(idx1+4),'binary');
                                file['size']    = file['data'].length;
                            }
                        }
                        //存入files
                        _self.files[k] = file;
                    }else{ //无filename，存入post
                        _self.post[k] = v.substr(idx+4);
                    }
                }
            }
        });
    }
    
}