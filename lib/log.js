// @Author: Tim<tim8670@gmail.com>
// 日志记录

var fs     = require('fs');
var util   = require('util');
var path   = require('path');
var helper = require('./helper');
var conf   = require(__CONFIG);

var level = {'access':1,'error':2,'info':4,'debug':8}; //日志级别定义

exports.message = function(lvName,msg){
    if(checkLevel(lvName)){
        var time  = helper.formatDate('[yyyy-MM-dd hh:mm:ss]');
        var data = util.format("%s -- ",time, msg,"\n");
        if(conf.debugMode){
            console.log(lvName,"=> ",data);
        }
        else{
            var fName = getFileName(lvName);
            fs.appendFile(fName, data,function(err){if(err){console.log('append log file error')}});
        }
    }
}
exports.debug = function(msg){
    this.message('debug',msg);
}
exports.info = function(msg){
    this.message('info',msg);
}
exports.error = function(msg){
    this.message('error',msg);
}

exports.access = function(req,res){
    var referer = req.header.referer || "-";
    var ua  = req.header['user-agent'] || "-"
    var msg = util.format("%s %s %d %d %d %s %s", req.method, req.pathname, res.status, res.length, res.elapsed, referer, ua);
    this.message('access',msg);
}

//私有方法
//检查日志级别，当前级别通过时返回true,表示需要记录
function checkLevel(lvName){
    var cLv = level[lvName] || 0;
    var confLevel = (conf.log && conf.log.level) ? conf.log.level : 15;
    return (confLevel & cLv) > 0;
}
//日志文件名
function getFileName(lvName){
    var cron = (conf.log && conf.log.cron) ? conf.log.cron : 'd';
    var logPath = (conf.log && conf.log.path) ? conf.log.path : conf.appPath + "/logs/";
    var fname = helper.formatDate('yyyyMMdd.log');
    if(cron == 'h'){
        fname = helper.formatDate('yyyyMMddhh.log');
    }
    return path.join(logPath,lvName+"_"+fname);
}