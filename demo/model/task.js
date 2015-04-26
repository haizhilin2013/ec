// task model

var ec      = require('ec');
var db      = ec.mysql;
var helper  = ec.helper;
var conf    = require(__CONFIG);
var util    = require('util');
var table   = "task";

module.exports ={
    //获取任务列表
    get: function(uid, status, page, cb){
        var wh = {uid:uid};
        if(status) wh.status = status;
        var options = {
            order:"id desc",
            wh: wh,
            fields:"id,status,content,DATE_FORMAT(ctime,'%Y-%m-%d %H:%i:%s') ctime"
        };
        if(page){
            nums = conf.myApp.pageNum || 8; //每页条数
            var offset = (page - 1) * nums;
            options.limit = util.format("%d,%d", offset, nums);
            //判断是否最后一页
        }
        var sql = util.format("SELECT `status`,count(id) nums FROM task  where uid=%d group by `status`",uid);
        db.query(sql,function(err,data){
            if(err) return cb(err);
            var resData = {nums:data};
            db.get(table, options, function(err1,data1){
                if(err1) return cb(err1);
                resData.task = data1
                return cb(null,resData);
            });
        });
    },
    //添加任务
    add: function(uid, data, cb){
        data.uid    = uid;
        data.status = 1;
        data.ctime  =  helper.formatDate("yyyy-MM-dd hh:mm:ss");
        db.add(table, data, cb);
    },
    //修改任务
    update: function(uid, taskId, nData, cb){
        var data = {};
        db.update(table, nData, {uid:uid, id: taskId}, cb);
    },
    //移除一项任务
    del: function(uid,taskId,cb){
        db.del(table, {uid:uid, id:taskId}, cb);
    }
};
//end of model/task.js