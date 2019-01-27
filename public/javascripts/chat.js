var Chat = function (socket) {
	this.socket = socket;
	this.userList = [];
};

Chat.prototype.sendMessage = function (room, text, chatType) {

	var message = {
		room : room,
		text : text,
		chatType : chatType
	};
	this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function (room) {
	this.socket.emit('join', {
		newRoom : room
	});
};

Chat.prototype.getUserList = function (callback) {
	var _this = this;
	this.socket.emit('getUserList', {}, function (data) {
		_this.userList = data.userList;
		callback && callback(data);
	});
};