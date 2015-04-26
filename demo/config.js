//应用的配置

module.exports = {
    appPath : __dirname,
    debugMode: true,
    port: 80,
    //日志设置
    log:{
        fwDebug: false,                                      //是否输出框架debug日志
        level: 15,                                           //输出级别，1--access_log  2--error 4--info 8--debug ,可组合多个级别，比如设为7表示1+2+4
    },
    mysql:{
        host: "localhost",                                 //mysql主机设置，可使用socketPath来设置unix socket方式连接
        port: 3306,
        user: "root",
        password: "",
        database: "ec_demo",
    },
    //应用配置
    myApp:{
        pageNum: 8,
        profileImgType:  ['image/png','image/x-png','image/jpg','image/jpeg'],
        profileImgSize:  10 * 1024
    }
};
