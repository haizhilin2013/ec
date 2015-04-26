// @Author: Tim<tim8670@gmail.com>

var path	= require('path');
var server	= require("./server");
var conf    = require(__CONFIG);

exports.run = function(){
    var result = _checkConfig();
    if(result != true){
        console.log("Config Err: "+ result);
        process.exit(1);
    }

    server.start();
};

exports.request  = require('./request');
exports.log      = require('./log');
exports.response = require('./response');
exports.session  = require('./session');
exports.helper   = require('./helper');
exports.mysql    = require('./db/mysql');
exports.getModel = function(model){
    var modelFile = path.join(conf.appPath,'model',model);
    return  require(modelFile);
};

//确认必须的conf项是否设置
function _checkConfig(){
    if(!conf.log)    conf.log    = {};
    if(!conf.static) conf.static = {};
    if(!conf.session)conf.session= {};
    if(!conf.mysql)  conf.mysql  = {};

    if(!conf.cookieEncryptKey) conf.cookieEncryptKey = "<tim2015@ec>";
    
    if(!conf.appPath)   return "Config Err: miss appPath";
    else return true;
}