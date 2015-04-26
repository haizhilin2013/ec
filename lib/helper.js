// @Author: Tim<tim8670@gmail.com>
// 辅助函数集合
var crypto = require('crypto');

//获取utc时间串，sec为指定与当前时间的秒数差（如果没设置或非数字，则为0）
exports.getUTCTime = function(sec){
     if(isNaN(sec)) {
        sec = 0;
     }
     var d = new Date();
     d.setTime(d.getTime() + sec * 1000);
     return d.toUTCString();
};

//时期格式化,style为格式字串,sec为相对当前时间的秒数，不设置则为当前时间
exports.formatDate = function(style, sec){
    if(isNaN(sec)) {
        sec = 0;
    }
    var date = new Date();
    date.setTime(date.getTime() + sec * 1000);
    var y = date.getFullYear();
    var M = "0" + (date.getMonth() + 1);
    M = M.substring(M.length - 2);
    var d = "0" + date.getDate();
    d = d.substring(d.length - 2);
    var h = "0" + date.getHours();
    h = h.substring(h.length - 2);
    var m = "0" + date.getMinutes();
    m = m.substring(m.length - 2);
    var s = "0" + date.getSeconds();
    s = s.substring(s.length - 2);
    return style.replace('yyyy', y).replace('MM', M).replace('dd', d).replace('hh', h).replace('mm', m).replace('ss', s);
};

//计算字串的md5值
exports.md5 = function(str){
    var md5 = crypto.createHash('md5');
    md5.update(str);
    return md5.digest('hex');
};

//判断一个值是否在指定的数组内
exports.in_array = function(str, arr) {
    for(var v in arr){
        if(str == arr[v]) {
            return true;
        }
    }
	return false;
};

//在arr1而不在arr2
exports.arrayDiff = function(arr1, arr2){
    var tmp=[], diff=[];
    for(var i=0;i<arr1.length;i++){
        tmp[arr1[i]]=true;
    }
    for(var i=0;i<arr2.length;i++){
        if(tmp[arr2[i]]) delete tmp[arr2[i]];
    }
    for(var k in tmp) diff.push(k);
    return diff;
};

//在arr1且在arr2
exports.arrayIntersect = function(arr1, arr2){
    var tmp=[], intersect=[];
    for(var i=0;i<arr1.length;i++){
        tmp[arr1[i]]=true;
    }
    for(var i=0;i<arr2.length;i++){
        if(tmp[arr2[i]]) intersect.push(arr2[i]);
    }
    return intersect;
};
//返回对象的key
exports.arrayKeys = function(obj){
    var keys = [];
    for(var k in obj){
        keys.push(k);
    }
    return keys;
}
//返回数组对象的值列表
exports.arrayValues = function(arr){
    var v = [];
    for(var k in arr) v.push(arr[k]);
    return v;
}