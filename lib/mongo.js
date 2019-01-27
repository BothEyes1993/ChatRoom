var mongoose = require('mongoose');

//链接数据库
mongoose.connect('mongodb://localhost/accounts');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

//链接后的回调
db.once('open', function () {
	console.log('mongoose opened!');

	var user = new mongoose.Schema({
		name : {type : String},
		password : {type : String}
	});

	var history = new mongoose.Schema({
		recipientUser : {type : String},
		sendUser : {type : String},
		messageText : {type : String},
		sendDateTime : {type : String}
	});

//拿到model后可以对表进行操作
var User = mongoose.model('accounts', user);
var History = mongoose.model('historyList', history);

//对外提供查询方法
exports.checkUser = function (user,successCal,errorCal) {
	User.findOne({
		name : user.name,
		password : user.password
	}, function (err, doc) {
		callBackFun(doc,successCal,errorCal);
	});
};

exports.userList = function (successCal,errorCal) {
	User.find({},{name:1,password:1,_id:0}, function (err, doc) {
		callBackFun(doc,successCal,errorCal);
	});
};

exports.setMessageHistory = function (history,successCal,errorCal) {
	var his = new History(history);
	console.log("setMessageHistory:::" + history.recipientUser+"--"+ history.sendUser+"--"+ history.messageText+"--"+ history.sendDateTime);
	his.save(function (err, doc) {
		callBackFun(doc,successCal,errorCal);
	});
};

exports.queryUserHistoryMess = function (user,successCal,errorCal) {
	console.log('queryUserHistoryMess:'+user.name);
	History.find({recipientUser:user.name}, function (err, doc) {
		console.dir('doc : '+doc);
		console.dir('err : '+err);
		callBackFun(doc,successCal,errorCal);
	});
};

exports.delMessageHistory = function (user,successCal,errorCal) {
	console.log('delMessageHistory:'+user.name);
	History.remove({sendUser:user.name}, function (err, doc) {
		callBackFun(doc,successCal,errorCal);
	});
};

exports.addUser = function (user) {
	var lisi = new User({
		name : user.name,
		password : user.password
	});
	lisi.save(function (err, doc) {
		callBackFun(doc);
	});
};

});

function callBackFun(doc,successCal,errorCal){
	if (doc){
		console.dir('doc : '+doc);
		successCal && successCal(doc);
	}else{
		errorCal && errorCal();
	}
};
