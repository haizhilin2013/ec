// @Author: Tim<tim8670@gmail.com>
// 框架的服务处理，路由分派

var http     = require('http');
var path     = require('path');
var crypto   = require('crypto');
var request  = require('./request');
var response = require('./response');
var log      = require('./log');
var conf     = require(__CONFIG);

exports.start = function() {
    var defaultMethod  = conf.defaultMethod  || 'index';
    var defaultControl = conf.defaultControl || 'index';
    var controlPath    = path.join(conf.appPath, 'controller');
    //请求处理
    function onRequest(req, res) {
        var ts = new Date().getTime();
        conf.log.fwDebug && log.debug('request reach');
        var postData = '';
        req.setEncoding('binary');
        req.on("data", function(postDataChunk) {
            postData += postDataChunk;
        });
        req.on("end", function() {
            conf.log.fwDebug && log.debug('request end,start parse');
            var reqObj = request.parse(req, postData);
            conf.log.fwDebug && log.debug('request parse finish');
            var resObj = response.init();

            //注册响应监听事件
            resObj.emitter.on('res_flush',function(err,data,encode){
                    conf.log.fwDebug && log.debug('res_flush on');
                    require('./session')._commit(); //持久化session数据
                    var len     = data.body ? data.body.length : 0;
                    var header  = data.header ? data.header : {};
                    var body    = data.body ? data.body : '';
                    if(encode != 'binary'){
                        var str = encodeURIComponent(body);
                        len = str.replace(/%[A-F\d]{2}/g, 'U').length; //UTF8字符的真实长度
                        header['Content-Length'] =  len; //encode为binary时不设置，使用chunked方式传输
                    }
                    //todo:gzip压缩

                    res.writeHead(resObj.statusCode,header);
                    reqObj.method != 'HEAD' && len && res.write(body,encode);

                    res.end();
                    conf.log.fwDebug && log.debug('response end');
                    var elapsed = new Date().getTime() - ts; //请求处理时间
                    log.access(reqObj,{status:resObj.statusCode,length:len,elapsed:elapsed});
            });
            
            //todo:支持更多其它的请求方法
            if(!req.method.match(/^(POST|GET|HEAD)$/ig)){ //目前只支持post,get和head方法
                response.showErr(405,'Method Not Allowed');
                return;
            }

            dispatch(reqObj);
            conf.log.fwDebug && log.debug('dispatch finish,waitting res_flush');
        });
    }
    
    //控制器分派
    function dispatch(req){
        conf.log.fwDebug && log.debug('dispatch start');
        var control,res_data ;
        var staticFile = /^(css|png|jpg|gif|ico|html|xml|json|txt)$/ig
        if(conf.static && conf.static.fileMatch) staticFile =  conf.static.fileMatch;
        if(req.fileExt.match(staticFile) && req.method == 'GET'){
            conf.log.fwDebug && log.debug('request for static file');
            control = require('./static');
            control.render();
        }else{
            var controlFile='',method='';
            if(conf.router == 3){
                if(req.pathname == ''){
                    controlFile = req.get.c || '';
                    method  = req.get.m || defaultMethod;
                }
            }
            else{
                var pathname = req.pathname.substring(1);
                pathname = (conf.router == 2) ? pathname.split(".",2) : pathname.split("/",2);
                controlFile = pathname[0];
                method      = pathname[1] || defaultMethod;
            }
            if(!controlFile) controlFile = defaultControl;
            //路由字串简单过滤
            var reg = /^[a-z][a-z0-9_]*$/ig; //字母开头，可包括数字，字母和下划线
            if(!controlFile.match(reg) || !method.match(reg)){
                response.showErr(500, 'Request URI Illegal');
                return;
            }

            try{
                conf.log.fwDebug && log.debug('require controller file: '+controlFile);
                control  = require(path.join(controlPath,controlFile));
            }catch(e){
                response.showErr(404, 'CONTROLLER_NOT_FOUND: '+ controlFile);
                return;
            }
            conf.log.fwDebug && log.debug('check controller method: '+ method);
            var act = eval('control.'+ method);
            if(act == undefined){
                response.showErr(404, 'METHOD_NOT_FOUND: '+method);
                return;
            }
            else{
                //todo:hook pre
                conf.log.fwDebug && log.debug('excute controller method');
                try{
                    act();
                }catch(e){
                    response.showErr(500, e.toString());
                    return;
                }
            }
            
        } 
    }
    
    http.createServer(onRequest).listen(conf.port||80,'0.0.0.0');
    console.log("Server has started.");
}