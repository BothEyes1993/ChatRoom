console.log("chatServer pageBegin");
var socketio = require('socket.io');
var io;
var nickNames = {};
var currentRoom = {};
var onlineUserMap = {};
var mongoSer;
var currentUser;

exports.initUser = function (user) {
	currentUser = user;
};

//对外提供的初始化方法
exports.listen = function (server, mongoServer) {
	console.log("chatServer init");
	
	//初始化mogo和当前用户
	mongoSer = mongoServer;

	//启动socket.io服务搭建在现有的server上
	io = socketio.listen(server);

	//连接事件
	io.sockets.on('connection', function (socket) {
		console.log("chatServer connection Beg");

		socket.on('initRoomInfo', function (data, fn) {
			//关联用户名称
			assignGuestName(socket, nickNames);

			//处理用户消息和聊天室的创建变更
			handleMessageBroadcasting(socket, nickNames);
			handleRoomJoining(socket);

			//用户断开后，清楚逻辑
			//handleClientDisconnection(socket, nickNames);

			//获取用户列表
			handleUserListFun(socket);
		});

		//用户发出请求时，返回占用的聊天室列表
		/*socket.on('rooms', function () {
		console.log("get rooms list");
		socket.emit('rooms', io.sockets.adapter.rooms);
		});
		*/
	});
};

function assignGuestName(socket, nickNames) {
		//把用户名称和链接ID关联起来
		nickNames[socket.id] = currentUser.name;
		onlineUserMap[currentUser.name] = socket;
		console.log("fenpei guest Name : " + currentUser.name);
};


	function handleMessageBroadcasting(socket) {
		socket.on('message', function (message) {
			console.log("handleMessageBroadcasting:" + nickNames[socket.id] + ': ' + message.text);

			var chatType = message.chatType,
			recipientObj = message.room,
			messageText = message.text;

			console.log("chatType:" + chatType);
			console.log("recipientObj:" + recipientObj);

			if (chatType == 'oneTone') {
			//判断收信人是否在线？在线回复 : 不在线消息存入数据库

				if (onlineUserMap && onlineUserMap[recipientObj]) {
					console.log("handleMessageBroadcasting:send- " + nickNames[socket.id]);
					console.log("handleMessageBroadcasting:recip- " + recipientObj);
					onlineUserMap[recipientObj].emit('message', {
						text : nickNames[socket.id] + ': ' + messageText,
						name : nickNames[socket.id],
						type : chatType
					});
				} else {
					//保存历史记录
					var historyObj = {
						recipientUser : recipientObj,
						sendUser : nickNames[socket.id],
						messageText : messageText,
						sendDateTime : new Date().getTime()
					};
					console.log("history:::" + recipientObj+"--"+ nickNames[socket.id]+"--"+ messageText+"--"+ new Date().getTime());
					mongoSer.setMessageHistory(historyObj,function(doc){

					});
				}
			} else if (chatType == 'oneTmore') {
				socket.broadcast.to(recipientObj).emit('message', {
					text : nickNames[socket.id] + ': ' + messageText,
					name : nickNames[socket.id],
					type : chatType
				});
			}
		});
	};


	function handleRoomJoining(socket) {
		socket.on('join', function (room) {
		//socket.join('room name')可用于客户端进入房间，socket.leave('room name')用于离开房间
		console.log("handleRoomJoining:" + room.newRoom);

		//socket.leave(room);
		var room = room.newRoom;
		//让用户进入房间
		socket.join(room);
		//记录用户的当前房间
		currentRoom[socket.id] = room;

		console.log(nickNames[socket.id] + " join the room:" + room);

		//返回让用户知道进了新房间
		io.sockets.in(room).emit('joinResult', {
			text : nickNames[socket.id] + ' has joined ' + room + '.'
		});

		//确定有哪些用户在房间里面
		var usersInRoom = io.sockets.adapter.rooms[room];
		//如果不止一个用户在里面，汇总下房间所有成员
		console.dir(nickNames);
		if (usersInRoom.length > 1) {
			var usersInRoomSummary = 'Users currently in' + room + ' : ';
			for (var index in usersInRoom.sockets) {
				console.log("index: " + index);
				var userSocketId = index;
				console.log("userSocketId: " + userSocketId);
				console.log("socket.id: " + socket.id);
				if (userSocketId != socket.id) {
					usersInRoomSummary += nickNames[userSocketId];
				}
			}
			usersInRoomSummary += '.';
			socket.emit('joinResult', {
				text : usersInRoomSummary
			});
		}
	});
	};


	function handleClientDisconnection(socket) {
		socket.on('disconnect', function () {
			console.log("handleClientDisconnection:" + nickNames[socket.id]);
			delete nickNames[socket.id];
		});
	};

	function handleUserListFun(socket) {
		socket.on('getUserList', function (data, fn) {
			mongoSer.userList(function(users){
				fn({
					userList : users,
					nameMap : nickNames
				});
			});
		});

		socket.on('queryUserHistoryMess', function (data, fn) {
			mongoSer.queryUserHistoryMess({name:currentUser.name},function(historys){
				fn(historys);
			});
		});

		socket.on('delUserHistoryMess', function (data, fn) {
			mongoSer.delMessageHistory(data);
		});
	};

