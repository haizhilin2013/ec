## 安装

如果你看到这篇文档，相信你已经下载了ec框架，如果还没下载，请从github下载
	
	git clone https://github.com/tim1020/ec.git

ec是使用npm方式管理的nodejs包，下载后按以下方式创建你基于ec的项目：

	mkdir ~/myapp		//创建你的web项目路径
	cd ~/myapp			//进入该路径
	npm install ~/ec	//调用npm安装ec(假设ec从github下载后的存放目录是：~/ec)
	cd node_modules/ec/bin
	./appinit			//使用ec自带的命令行工具初始化项目

以上的操作，会生成项目的基本目录结构和demo，目录结构如下(除了静态文件目录可通过配置来指定，其它不允许修改)：

	~/myapp
	  |- node_modules	存放ec框架核心文件(包括文档及依赖的第三方包）
	  	|- ec 			ec框架的npm包
	  |- public			存放静态文件（图片,css等）
	  |- logs			日志存放目录
	  |- controller		存放控制器文件
	  |- model			存放业务逻辑处理文件
	  |- view			存放视图模板
	  |- app.js			应用入口文件
	  |- config.js      应用配置文件



至此，项目初始化完成，你可以用以下方式来启动你的应用

	node app.js


如无意外，你的应用应该已经成功启动，打开浏览器访问一下吧 ``` http://{your host}/demo/`` (ec默认监听80端口)

>要成功运行demo，你可能需要先手动创建并导入数据库和修改配置

>数据库初始化语句在**demo.sql**，创建完成后请删除该文件

接下来，你可以通过 **demo项目** 进一步了解ec框架的工作原理和开发方法

它的控制器文件在 **controller/demo.js**

调用到的业务model为 **model/user.js** 和 **model/task.js**。

## 使用说明

### MVC流程

ec是一个MVC框架,以下是一个web请求的完整处理流程：

	客户端发起请求
	服务端接收请求
	解释请求参数
	路由分派
	控制器处理
	(如有需要，调用相应model处理业务逻辑并获取数据)
	(渲染模板)
	发送响应给客户端

由于ec封装了路由分派处理，所以开发者在使用ec进行开发时，只需要：

+ 添加必须的配置项
+ 编写业务逻辑model
+ 编写页面视图模板
+ 编写控制器，并在控制器中调用相关model处理并获取数据，最后将数据渲染到对应的模板中

> 注： ec的使用规则路由，不需要配置路由表

### 配置文件

如果启动应用过程中有报错，你可能需要修改一下 **config.js** 文件中的内容，该文件为应用及框架的配置文件，使用包的形式定义。

自动生成的配置文件中，配置项基本都是框架所需的内容，当配置文件格式错误或缺失必须的项时，在应用启动中就会报错。

下面是一份默认的配置文件，它包括了框架运行所需的各项配置

(除了appPath和mysql外，其它项框架内均有缺省值，如非必要，可不设置以保持配置文件清爽)：

	//config.js
	module.exports = {
		appPath: __dirname,	    //应用根路径(必须)
	    port: 8080,			    //监听端口，缺省为80
	    router: 1,        		//路由方式：1(/c/m), 2(/c.m), 3(/?c=c&m=m) ,缺省是1
	    tplEngine: "swig",		//模板引擎，缺省使用swig
	    defaultMethod: "index",  //缺省的方法名称
	    defaultControl: "index", //缺省的控制器名称
	    debugMode: true,		  //调试模式，开启时直接在控制台输出调试信息
	    cookieEncryptKey: "<tim>2015",     //加密cookie的密钥，缺省为<tim2015@ec>                             
	    //静态文件配置
	    static:{
	        path:  __dirname+"/public/", //静态文件目录(绝对路径)，缺省为项目根路径下的public目录
	        fileMatch: /^(css|png|jpg|gif|ico|html|xml|json|txt)$/ig, //静态文件匹配规则，可缺省
	        expires:  24 * 3600,                                      //缓存时间, 以s表示，缺省为不缓存
	    },
	    //日志设置
	    log:{
	        fwDebug: true,   //是否输出框架debug日志（同样受level控制）,缺省为false
	        level: 15,       //输出级别，1--access_log  2--error 4--info 8--debug ,7表示1+2+4，缺省为15
	        path: __dirname+"/logs/",     //日志文件保存路径(绝对)，需先创建,缺少为项目根路径下的logs目录
	        cron: "d",                    //日志文件切割方式，d为按天，h为按小时,缺少为d
	    },
	    //session
	    session:{
	        name: "ecSID",		//session的cookie名称，缺省为ecSID;
	        handler: "builtin", //sessionHandler,缺省为框架内置的文件方式 ,自定义时指向所模块引用路径                                 
	        savePath: "/tmp/", //使用缺省handler时的文件保存路径，缺省为/tmp/
	        gcLifeTime: 3600,  //gc前的有效秒数，缺省为1小时
	        gcRatio: 10/100,	 //gc触发机率，缺省为10/100
	        cookieLifeTime: 1000 //sid的生命周期(秒)，缺省为3600。
	    },
	    mysql:{
	        host: "localhost",              //mysql主机设置，
	        port: 3306,						//mysql端口
	        socket: "/tmp/mysql.socket"	    //unix socket方式连接"
	        user: "root",					//用户名
	        password: "",					//密码
	        database: "test",				//数据库名
	        //mysql的配置项可参考felixge/node-mysql的文档
	    }
	};

应用需用到的配置，建议增加一项来设置:

	//config.js
	module.exports = {
		//其它配置

		//app配置
		app:{
			name:""//具体配置项
		}
	}	

然后在应用中，使用以下方式读取配置值

	var conf    = require(__CONFIG);
	var name = conf.app.name;

### 入口文件

入口文件用来启动你的应用，由 **appinit** 时自动生成，一般情况下，你并不需要改动它。

	//app.js(应用入口)

	__CONFIG = __dirname + "/config";
	require('ec').run();

该文件的作用：

+ 定义一个全局变量 **__CONFIG**,并将配置文件的引用路径指向它，方便框架及应用引用。
+ require框架并调用其run方法来启动应用，监听相应的端口。

## 示例简介 ##

本节以框架自带的demo应用来简单介绍一下**controller**及**model**的编写方法

### 编写controller

根椐接口设计来定义controller，并保存在controller目录下（demo编写了一个名叫demo.js的控制方法），所以可使用```/demo/方法名``` 来访问：

	// controller/demo.js
	var ec   = require('ec'); //按需要引用ec提供的API及node提供的相关API
	var req  = ec.request;
	var log  = ec.log;
	var res  = ec.response;
	var sess = ec.session;
	var helper=ec.helper;
	var util = require('util');
	var conf = require(__CONFIG); //引入配置文件

	module.exports = {
		index:function(){ //定义控制方法,该方法使用/demo/index来访问(index为默认方法，访问时可省略为/demo)
			var loginUser =  _getLoginedUser();
			if(!loginUser){
				return res.redirect("/demo/sign_in");
			}else{
				return res.render('index.html', {user: loginUser}); //将用户登录信息渲染到index.html模板并输出
			}
		},
		//其它控制方法
	}

### model的编写及使用 ###

model主要负责业务模型的处理（一般为数据的处理），自带demo中演示了使用task.js来实现任务的增删改查

	// model/task.js
	var ec      = require('ec'); //同样先引入ec模架及用到的node提供的各相关API
	var db      = ec.mysql;
	var helper  = ec.helper;
	var conf    = require(__CONFIG);
	var util    = require('util');
	var table   = "task";

	module.exports ={
		 //添加任务
		add: function(uid, data, cb){ //cb为回调函数，由调用方（一般为controller）实现
			data.uid    = uid;
			data.status = 1;
			data.ctime  =  helper.formatDate("yyyy-MM-dd hh:mm:ss");
			db.add(table, data, cb); //调用ec框架提供mysql.add方法增加数据
		},
		//其它操作
	}


model文件编写完成后，保存在model/task.js下,然后在controller下可以用如下方式调用

	// controller/demo.js
	var ec   = require('ec'); //同样先引入ec模架及用到的node提供的各相关API
	var User = ec.getModel('task'); //引用model,该处为model/task.js
	module.exports = {
		task_add: function(){
			var data = {content:content };
			Task.add(loginUser['uid'], data, function(err,result){ //调用model提供的方法，并定义回调函数来处理结果
				if(err){
				//发生错语，处理
				} else{
					//成功
					//如果要渲染模板，在此处理
				}
			});
			//注意，Tash.add为异步，写在此的代码有可能比回调函数先执行
		},
	}
	

### 编写模板及进行渲染

ec默认使用swig模板引擎，swig的模板语法可参考其[官方说明](http://paularmstrong.github.io/swig/docs/)。

编写好模板后，将模板文件保存在 **view** 目录下，就可以在controller中通过 ```res.render(tplName,data)``` 来渲染。

该方法在渲染后，会将结果通知到 **res_flush** 事件,该事件被触发后，会将结果响应给客户端，完成一次请求处理。所以，请保证在所有业务逻辑处理完成后才调用此方法。

	//模板渲染示例
	var data = {name:"Tim"}; //模板中的变量值
	return res.render('index.html', data); //index.html模板保存在view目录

>如果在res.render中不指定模板名(将该参数设为null)，则不使用模板解释，直接输出 data的值（可用于API服务器,输出json格式、xml等）

## API介绍

要使用ec提供的API,首先要用require引入ec，然后再使用相应的变量来调用。

	var ec 		= require('ec');
	var req 	= ec.request;
	var res 	= ec.response;
	var session = ec.session;
	var log 	= ec.log;
	var db 		= ec.mysql;
	var helper  = ec.helper;

### ec.request(请求处理)

request不提供公开的API方法，但你可以直接使用req对象的以下属性，获取请求内容：

	req.pathname; 	 //请求的路径，如/c/m
	req.contentType; //请求时,静态文件的contentType
	req.header;		 //请求头
	req.method;		 //请求方法(POST,GET)
	req.get;		 //get参数
	req.post;		 //post参数
	req.body;		 //请求的原始body
	req.cookies;	 //请求时的cookies
	req.files;		 //上传的文件


### ec.response(响应控制)

注意： showErr,redirect,render均为触发res_flush事件，请在业务逻辑处理完后才调用。

`showErr(statusCode,msg)`
> 响应一个错误页面，statusCode为http错误码，如404,500；msg为页面提示信息。如果view目录下有相应的错误码命名的模板，则调用模板进行渲染，否则，直接响应msg。

`setHeader(k,v)`
> 设置一个响应头，例：  

	res.setHeader("Server","ec@node");

`setCookie(k,v,expires,options)`
> 设置cookie,k为cookie名称，v为cookie的值，expires为有效时间(秒，不设表示浏览器周期)，options是其它属性，包括path,domain,secure,httponly。expires和options是可选参数，例：  

	res.setCookie('a','efg');
	res.setCookie('b','abd123',3600,{path:"/",domain:"a.com"})

`redirect(url)`
> 响应一个302重定向请求，目标是url.

`render(tpl,data)`
> 生成响应内容，tpl为模板文件名（放在view目录）,如果指定该值，会调用模板引擎进行渲染。如果tpl设为null，则直接响应输出data内容。


### ec.session(会话管理)

`set(key,value)`
> 设置一个session项，如果已存在，会覆盖原值

`get(key)`
> 读取一个session项的值。例:  
	
	var user = session.get('user')s

`getAll()`
> 获取session全部值

`unset(key)`
>销毁session，如果有指定key，只销毁该项，否则销毁整个会话。例：

	sessoin.unset("user")

### ec.log(日志处理)

`debug(msg)`

> 输出debug日志，受conf.log.level控制，例： 
	
	log.debug('app start')**;

`info(msg)`

> 输出info日志,受conf.log.level控制

`error(msg)`

> 输出error日志，受conf.log.level控制

`message(name,msg)`

> 输出名为name的日志  
注意：如果name不是debug,info或error时，此方法不受conf.log.level控制（即不能修改配置来关闭输出），所以请小心使用。

### ec.mysql(dao for mysql)

ec.mysql只对简单常用的数据操作进行了CURD的封装，并提供直接执行SQL语句的方法，如果你要执行复杂的SQL语句，比如连表操作，请使用**db.query(sql,callback)方法**。

**通用说明**

+ callback

ec.mysql提供的方法（除escape外），均采用callback方式返回执行结果,原型是如下：

	function(err,result){
		//当执行出错，以err响应错误信息
		//如果成功，则以result返回结果:
			//add、update、del时,result为affectedRows,add时有insertId,update时有changes。
			//get时,result为结果集
			//query时，视sql语句的操作返回不同的结果
	};	
	

+ where条件

select,update,del都有条件参数wh，该参数支持两种形式配置：
	
	//直接where子句
	var wh = "`uid`=1 and `group_id`=1";
	//对象方式
	var wh1 = [{uid:[1,2],group_id:2},{type:'todo'}];
	//两个同象之间是or,同一对象的各字段是and, 值为数组用in
	//上面例子生成的条件是：(uid in(1,2) and group_id=2) or (type='todo')



`add(table,data,callback)`
> 插入数据，table为操作的表名，data为插入的内容(字段名，字段值)。  

	db.add('test',{name:"Tim",nick:"Tim"},callback);
	//执行的sql语句为: insert into `test` set `name`='Tim',`nick`='Tim';

`del(table,wh,callback)`
> 删除记录,table为表名，wh为条件。  

	db.add('test',"name='Tim'",callback);
	//执行的sql语句为: del from `test` where `name`='Tim';

`update(table,data,wh,callback)`
> 更新记录,table为表名，data为更新的字段及值,wh为条件。  

	db.add('test',"name='Tim sir'","name='Tim'",callback);
	//执行的sql语句为: update `test` set `name`='Tim sir' where `name`='Tim';

`get(table,options,callback)`
>查询数据，table为表名，options为参数对象：
	
	var options = {
		fields:"`uid`,`name`",	//查询的字段，缺省为"*"
		wh: "uid>2",			//where条件,可选
		order: "uid desc",		//order子句,可选
		limit: "0,3"			//limit子句，可选
	};
	db.get("test",options,callback);
	//执行的sql为：select `uid`,`name` from `test` where uid>2 order by uid desc limit 0,3; 
	db.get('test',null,callback); //sql=select * from test;

`query(sql,callback)`
> 执行构造好的sql语句，并将结果通过callback返回。在提供的CURD不能满足需求时，可手工构造SQL语句来提交或获取数据。


`string escape(str)`
> 返回转换过的数据库安全的字符（在自定义sql语句时，可用此方法处理用户输入的内容）



### ec.helper(辅助函数)

`boolean in_array(str,arr)`

>判断str是否存在arr中

`string getUTCTime(sec)`

>生成UTC时间串，可以用sec指定与当前时间相差的秒数（sec为负数时表示当前时间之前）

`string formatDate(style,sec)`

>格式为时间显示，sec为与当前时间的秒数差；style为格式字符串：

>yyyy -- 四位年  
MM	 -- 两位月  
dd 	 -- 两位日  
hh	 -- 两位小时  
mm 	 -- 分钟  
ss   -- 秒  

>helper.formatDate('yyyy-MM-dd/hh.log')会返回类似： 2015-03-23/09.log

`array array_diff(arr1,arr2)`
> 返回在arr1而不在arr2的元素组成的新数组

`array array_intersect(arr1,arr2)`
> 返回在arr1且在arr2的元素组成的新数组。


## 扩展ec

易于扩展是ec的一个重要目标，所以ec在版本之初就留有足够的扩展性，使用者可以利用这些特性构造更适合自己的ec框架。

### 自定义session handler

ec内置了使用文件方式保存的session handler，该处理方式将session的数据内容以文件型式保存在指定目录。

如果你需要使用其它方式（比如希望将会话数据保存在数据库、memcache或redis等），你可以按以下方法实现自定义的session handler.

**1. 编写session handler代码**

	
	//mySessHandler.js
	module.exports =  {
        sid:'',
        data:{},
        //session.start时调用，准备session环境（如设置sid，读取此前的session data）
        open:function(sid){
            this.sid = sid;
            this.data = ""; //实现此功能，根椐sid从db,mc等读取原data内容
        },
        //session.set(k,v)时调用，设置一个会话内容到指定的key（只放在data变量，在session._commit时才会持久保存）
        write:function(k,v){
            this.data[k] = v;
        },
        //session.get(k)和session.getAll()时调用，从data变量读取会话内容
        read:function(k){
            return k ? this.data[k] : this.data;
        },
        //session._commit时调用（框架调用，不开放）,用于将data中的数据持久化保存
        save:function(){
           	//save this.data
        },
        //session.unset()时调用，用于销毁一或多个会话内容（跟write方法一样，在session._commit时才真正销毁）
        destroy:function(k){
            if(k)  this.data[k] = undefined;
            else   this.data = {}; //清除全部
        },
        //session._commit时，有一定几率（conf.session.gcRatio）触发执行，用于清理会话数据库中过期的数据（生成时间大于maxLife,即配置的conf.session.gcLifeTime）
        gc:function(maxLife){
            //清除过期数据;
        }
    }

开发者只需要实现open、save和gc方法即可，write、read、destroy可直接使用上述例子的实现。

编写完成后，将文件保存为 ` ~/myapp/libs/mySessHandler.js `

**2. 修改配置文件，使用自定义handler**

	//config.js
	module.exports = {
		//其它配置
		session:{
			handler: "libs/mySessHandler.js",   //相对于appPath的sessionHandler引用路径
		}
	}


### 使用其它模板引擎

ec缺省使用swig模板引擎，如果你需要在ec中使用你熟识的其它第三方或自行定义的模板引擎，只需在**配置文件**中修改**tplEngine**的值，将它指向你所使用的引擎的require路径即可。

ec中渲染模板的方法原型是: `string renderFile(tplFile,data)`

所以，当你设置使用其它模板引擎时，必须保证引擎有按此原型实现了renderFile方法，即将data内容渲染到模板文件tplFile中，并返回渲染后的内容。

（如果第三方引擎没有实现该方法，你可以自行作简单的二次封装后使用）


> 初始化生成的404,500等错误页面模板是基于swig语法的，如果你修改了模板引擎且语法与swig不一样，请记住要同时 **修改错误页面模板**

### 使用其它数据源

ec目前只内置了for mysql的简单CURD，如果需要使用其它的数据来源(包括memcache、redis、mongodb等)，你可以直接使用自己定义的包或第三方现有的包，ec对此没有限制，不久的将来，ec也会逐步支持主流的文档数据库和memcache协议存取。

## 问题及建议

作者对nodejs的理解很皮毛，该框架只是一个边学边做的半成品，如果你对它感兴趣，想与我取得联系并提出问题和建议等，可通过以下方式找到我。

GMAIL: <tim8670@gmail.com>