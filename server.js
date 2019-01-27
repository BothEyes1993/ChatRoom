console.log("Server pageBegin");
var express = require('express'), path = require('path'), app = express.createServer('localhost').listen(3000);

//聊天室单独服务
var chatServer = require('./lib/chat_server');

//数据库服务
var mongoServer = require('./lib/mongo');


//界面404
function send404(response) {
	response.writeHead(404, {
		'Content-Type' : 'text/plain'
	});
	response.write('Error 404:resource not found.');
	response.end();
}

//express基本配置
app.configure(function () {
	app.use(express.bodyParser()); //添加解释文档的中间件
	//app.use(express.methodOverride);
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public'))); //指定静态文件目录
});

//初始化登陆
app.get('/', function (req, res) {
	res.sendfile('public/login.html', {
		root : __dirname
	});
});

//进入主界面
app.post('/login', function (req, res) {
	var user = {
		name : req.body.name,
		password : req.body.password
	};
	console.dir(user);
	
	mongoServer.checkUser(user,function(){
		//聊天室服务初始化
		console.log("chatServer load");
		chatServer.initUser(user);

		//界面初始化
		res.sendfile('public/index.html', {
			root : __dirname
		});
	},function(){
		//用户名密码错误
		console.log("username or password Error");
	})

});

chatServer.listen(app, mongoServer);