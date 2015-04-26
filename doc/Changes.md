# Changes

本文档记录每一次版本更新的变更情况，包括：新增特性，bugfix，代码优化等

## v1.0.0 (2015-03-22) 初始版本

* 三种路由规则可配 /c/m ,/c.m, /?c=c&m=m），即 访问/c/m时，自动路由到controler下的c.js并执行m方法
* req对象二次封装：在controller中可直接使用该对象获取各种请求内容，包括 post,get,cookie
* req对象支持mulitpart的解释（即支持post上传文件的解释，可直接用req.files获取上传文件内容）
* res对象，包括setCookie,showErr和模板处理render
* 可以自定义模板引擎，只需引擎实现renderFile(tplFile,data)方法来渲染模板。
* 会话话管理session，实现了set,get,getAll,unset方法，支持自定义session handler
* mysql的dao封装
* 日志处理log，支持分级，支持设置控制台输出或文件输出，可单独关闭框架debuglog，内置accesslog输出
* 静态文件服务(支持304)
* 辅助函数(helper),支持in_array,formatDate,getUTCTime,md5等方法