// @Author: Tim<tim8670@gmail.com>
// dao for mysql

var log   = require('../log');
var util  = require('util');
var mysql = require('mysql');
var conf  = require(__CONFIG);

var pool = mysql.createPool(conf.mysql);

module.exports = {
    //增加一条记录,callback(err, result);
    add:function(tb,data,callback){
        var datas = [];
        for (var k in data){
            datas.push(util.format("`%s`=%s",k,this.escape(data[k])));
        }
        var sql = util.format("insert into `%s` set %s",tb,datas.join());
        this.query(sql,callback);
    },
    //删除记录(wh必须),callback(err,result)
    del:function(tb,wh,callback){
        wh = (typeof wh == 'string') ? wh : _buildWhere(wh);
        if(!wh) callback('SQL Err: can not do delete while "where" empty',null);
        else{
            var sql = util.format("delete from `%s` where %s",tb, wh);
            this.query(sql,callback);
        }
    },
    //更新记录, callback(err,result)
    update:function(tb,data,wh,callback){
        var datas = [];
        for (var k in data){
            datas.push(util.format("`%s`=%s",k,this.escape(data[k])));
        }
        wh = (typeof wh == 'string') ? wh : _buildWhere(wh);
        if(!wh || !datas) callback('SQL Err: can not do update while "where" or "data" empty',null);
        else{
            var sql = util.format("update `%s` set %s where %s",tb, datas.join(), wh);
            this.query(sql,callback);
        }
    },
    //查询数据options={wh, fields, order, limit}， callback(err,rows)
    get:function(tb, options, callback){
        var fields='*',order='',limit='',wh='';
        if(options){
            if(options.fields) fields = options.fields;
            if(options.order)  order  = "order by "+ options.order;
            if(options.limit)  limit  = "limit " + options.limit;
            if(options.wh){
                wh = (typeof options.wh == 'string') ? options.wh : _buildWhere(options.wh);
                if(wh) wh = "where "+ wh;
            }
        }
        var sql = util.format("select %s from `%s` %s %s",fields,tb,wh,order,limit);
        this.query(sql,callback);
    },
    //执行sql语句，callback(err,result),select时，result为rows，其它则为执行结果（包括insertId,）
    query:function(sql,callback){
        log.debug("sql="+sql);
        pool.getConnection(function(err, conn) {
            if(err){
                log.error(err.toString());
                return callback(err,null);
            }
            conn.query(sql,function(err1,result){
                conn.release();
                if(err1){
                    log.error(err1.toString());
                    return callback(err1,null);
                }
                else return callback(null,result);
            });
        });
    },
    //转义处理,
    escape: function(str){
        return pool.escape(str);
    },
    //代理pool
    pool:pool,
};

//私有方法

//构造where子句
//arr = [{res_id:[1,2],group_id:2},{res_type:'xhtml2'}] (res_id in(1,2) and group_id=2) or (res_type='xhtml2')
function _buildWhere(arr){
    if(typeof arr != "object") throw 'SQL Err(01): "wh" param error when build sql';
    var wh = [];
    if(arr.length == undefined) arr = [arr];
    for(var i in arr){
        if(typeof arr[i] != 'object') throw 'SQL Err(02): "wh" param error when build sql';
        var wh1 = [];
        for(var k in arr[i]){
            var str = '';
            if(typeof arr[i][k] == 'object') str = util.format("`%s` in(%s)",k,arr[i][k].join());
            else str = util.format("`%s` = '%s' ", k, arr[i][k]);
            wh1.push(str);
        }
        wh.push(util.format("(%s)", wh1.join(" and ")));
    }
    wh = wh.join(" or ");
    log.debug("wh="+wh);
    return wh;
}