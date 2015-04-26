// @Author: Tim<tim8670@gmail.com>
// 静态文件服务

var fs     = require('fs');
var path   = require('path');
var req    = require('./request');
var res    = require('./response');
var log    = require('./log');
var helper = require('./helper');
var conf    = require(__CONFIG);

module.exports ={
    render: function(){
        var staticPath = (conf.static && conf.static.path) ? conf.static.path : conf.appPath + "/public/";
        var fileName = path.join(staticPath, req.pathname);
        //todo:range协议
        //todo:pathname安全判断
        if(!fs.existsSync(fileName)){
            res.showErr(404,req.pathname);
        }else{
            var stat = fs.statSync(fileName);
            var lastModified = stat.mtime.toUTCString();                             
            if(req.header['if-modified-since'] && lastModified == req.header['if-modified-since']){
                res.showErr(304);
            }else{
                res.setHeader("Last-Modified", lastModified);
                res.setHeader('Content-Type',req.contentType);
                if(conf.static && conf.static.expires){
                    res.setHeader('Expires',helper.getUTCTime(conf.static.expires));
                    res.setHeader("Cache-Control", "max-age=" + conf.static.expires);
                }
                var data = fs.readFileSync(fileName,'binary');
                res.render(null,data,'binary');
            }
        }
    }
}