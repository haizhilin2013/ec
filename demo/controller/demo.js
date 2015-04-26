// demo 控制器
var ec   = require('ec');
var req  = ec.request;
var log  = ec.log;
var res  = ec.response;
var sess = ec.session;
var helper=ec.helper;
var util = require('util');
var conf = require(__CONFIG);

var User = ec.getModel('user');
var Task = ec.getModel('task');


var errMsg = '';
var status = {
    TODO:    1,
    DONE:   2
};
var code = {
    OK      : 200,
    NOTLOGIN: 401,
    ERR     : 500
};

module.exports = {
    //首页
    index:function(){
        var loginUser =  _getLoginedUser();
        if(!loginUser){
            return res.redirect("/demo/sign_in");
        }else{
            return res.render('index.html', {user: loginUser});
        }
    },
    //用户注册
    sign_up: function(){
        var resData = {};
        if(req.method == 'POST'){
            var name = req.post['name'];
            var pass = req.post['pass'];
            if(!name || name.length< 3 || name.length > 10 ) resData.errMsg = 'name要求3-10位';
            else if(!pass || pass.length < 6) resData.errMsg = 'pass size must be 6+';
            if(resData.errMsg) return res.render('sign_up.html',resData);
            User.add(name,_genPass(name,pass),function(err,result){
                if(!err){
                    var uid = result.insertId;
                    User.get(uid,null,function(err,rows){
                        if(!err){
                             sess.set('user',rows[0]);
                             res.redirect("/demo/");
                        }
                    });
                } else {
                     return res.render('sign_up.html', {errMsg:err});
                }
            });
        }else{
            return res.render('sign_up.html', null);
        }
    },
    //用户登录接口
    sign_in: function(){
        if(req.method != 'POST'){
            return res.render("sign_in.html",null);
        }
        var name = req.post['name'];
        var pass = req.post['pass'];
        if(!name || name.length<3 || !pass || pass.length < 6) return res.render('sign_in.html',{errMsg:"name not found or pass error"});
        var resData = {};
        User.get(null,name,function(err,row){
            if(!err){
                if(row.length < 1 || _genPass(name,pass) != row[0]['pass']){
                    resData = {errMsg:"name not found or pass error"};
                }else{
                    //登录成功
                    delete row[0]['pass'];
                    row[0].img = row[0].img.toString('binary');
                    sess.set('user',row[0]);
                    return res.redirect("/demo/index");
                }
            } else {
                resData = {errMsg: err};
            }
            return res.render('sign_in.html',resData);
        });
    },
    //退出
    sign_out: function(){
        sess.unset();
        return res.redirect('/demo/');
    },
    //显示和设置用户资料(pass,nick,img)
    profile: function(){
        var loginUser =  _getLoginedUser();
        if(!loginUser){
            return res.redirect("/demo/sign_in");
        }
        var resData = {user: loginUser};
        if(req.method == 'POST'){
            var nPass = req.post['pass'];
            var img = req.files['img'];
            var nData = [];
            if(nPass){
                if(nPass.length < 6) errMsg = "new pass length must be 6+";
                else nData.pass = _genPass(loginUser['name'].substr(0,2), nPass);
            }
            if(img['content-type']){
                var allowType = conf.myApp.profileImgType ||  ['image/png','image/x-png','image/jpg','image/jpeg'];
                var maxSize   = conf.myApp.profileImgSize || 10240;
                if(img['size'] > maxSize) resData.errMsg = "img must less than 10k";
                else if(!helper.in_array(img['content-type'],allowType)) resData.errMsg = "ffile type allow:"+allowType.join();
                else{
                    nData.img = new Buffer(img['data']).toString('base64'); 
                }
            }
            if(!resData.errMsg && ( nData['pass'] || nData['img'])){
                User.set(loginUser['uid'], nData, function(err,cb){
                    if(err){
                        resData.errMsg = err;
                    }else{
                        resData.img = loginUser['img'] = nData.img;
                        sess.set('user', loginUser);
                    }
                    return res.render('profile.html',resData);
                });
            } else {
                return res.render('profile.html',resData);
            }
        } else {
            return res.render('profile.html',resData);
        }
    },
    //任务查询
    task_get:function(){
        var loginUser =  _getLoginedUser();
        if(!loginUser) return res.render(null,{code:code.NOTLOGIN, errMsg:'not login'});
        else{
           var status = req.post['status'] || '';
           var page = req.post['page'] || 1;
           Task.get(loginUser['uid'],status,page,_taskCb);
        }
    },
    //添加一项任务
    task_add: function(){
        var loginUser =  _getLoginedUser();
        if(!loginUser) errMsg = "not login";
        else{
            var content = req.post['content'];
            if(!content ||content.length > 50) errMsg = "任务内容长度不能大于50字";
        }
        if(errMsg) {
            return res.render(null,{code:code.ERR, errMsg:errMsg});
        }else{
            var data = {content:content };
            Task.add(loginUser['uid'], data, _taskCb);
        }
    },
    //修改任务（目前只支持状态修改）
    task_upd: function(){
        var loginUser =  _getLoginedUser();
        if(!loginUser) errMsg = "not login";
        else{
            var nStatus = req.post['status'];
            var taskId = req.post['task_id'];
            if(!nStatus || !helper.in_array(nStatus, status)) errMsg = "不支持的状态码";
            else  if(!taskId) errMsg = 'miss param: task_id';
        }
        if(errMsg) {
            return res.render(null,{code:code.ERR, errMsg:errMsg});
        }else{
            var nData = {status: nStatus};
            Task.update(loginUser['uid'], taskId, nData, _taskCb);
        }
    },
    //删除一项任务
    task_del: function(){
        var loginUser =  _getLoginedUser();
        if(!loginUser) errMsg = "not login";
        else{
            var taskId = req.post['task_id'];
            if(!taskId) errMsg = 'miss param: task_id';
        }
        if(errMsg) {
            return res.render(null,{code:code.ERR, errMsg:errMsg});
        }else{
            var uid = loginUser['uid'];
            Task.del(loginUser['uid'],taskId, _taskCb);
        }
    },
};

//##### 私有方法 ######
//任务接口的回调处理
function _taskCb(err, result){
    if(err){
        if(typeof err == 'object'){
            err = err.errno + ":"+err.code;
        }
        return res.render(null,{code:code.ERR,errMsg:err});
    }else{
        return res.render(null,{code:code.OK,data: result});
    }
}
//检查是否已登录，若是，返回登录用户的信息
function _getLoginedUser(){
    return sess.get('user');
}
//生成加密密码
function _genPass(name,pass){
    return helper.md5(util.format("%s_%s", name.substr(0,2), pass)); //取用户名前两位作slat，加密密码
}

//end of controller/demo.js