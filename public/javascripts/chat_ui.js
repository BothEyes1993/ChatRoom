$(document).ready(function () {
	var detailChatEle = $('#detailDivChat'), _userMessageList = $('#chatUserMessaList'),messageEle,
	userList,userName,userHistMessageList,userHistMessageMap={};

	//初始化TAB页签切换功能
	$('#chatUlId').unbind('click').on('click', '.chatTabLi', function () {
		var li = $(this),
		tabDivId = li.attr('tabDiv');
		li.addClass('li-active').siblings().removeClass('li-active');
		$('#' + tabDivId).show().siblings('.chat-cont-body').hide();

		//刷新用户(房间)列表
		$('#' + tabDivId).empty();

		function initTabDiv(keyClass, beforCallBack, clickCallBack) {
			//初始化用户或者房间列表
			beforCallBack && beforCallBack();

			//点击用户切换到聊天界面事件
			$(keyClass).unbind('click').on('click', 'li', function () {
				detailChatEle.show().siblings('.chat-Contain-cont').hide();
				//更新聊天标题
				var nameTitle = $(this).find('span').html();
				$('.chat-cont-title .title-cont').html(nameTitle);

				//每个用户聊天界面有差异，点击不同用户追加各自对应的body界面
				messageEle = _userMessageList.find('.chat-cont-messages[username='+nameTitle+']');
				_userMessageList.find('.chat-cont-messages').hide();
				if(messageEle && messageEle.length>0){
					messageEle.show();
				}else{
					messageEle = $('<div class="chat-cont-messages" username="'+nameTitle+'"></div>');
					_userMessageList.append(messageEle);
				}

				//标记聊天界面为一对一还是一对多
				clickCallBack && clickCallBack(nameTitle);
			});
		};

		if (tabDivId == 'userDivId') {
			initTabDiv('.chat-user-list', function () {
				if(userList && userList.length>0){
					var ulEle = $('<ul class="chat-user-list"></ul>');
					$.each(userList,function(i,item){
						if(!item.name || item.name == userName){
							return true;
						}
						ulEle.append('<li><span>'+item.name+'</span></li>');
					});

					$('#' + tabDivId).append(ulEle);

					initHistoryElement();
				}
			}, function (nameTitle) {
			//初始化历史记录
			var hisArr = userHistMessageMap[nameTitle] || [];
			$.each(hisArr,function(i,item){
				messageEle.append('<div class="other-cont">'+item+'</div>');
				messageEle.scrollTop(messageEle.prop('scrollHeight'));
			});

			//看完历史记录再删除
			socket.emit('delUserHistoryMess', {name:nameTitle});
			userHistMessageMap[nameTitle]=[];

			//标记聊天界面为一对一
			detailChatEle.attr('chatType', 'oneTone');
			});
		} else {
			initTabDiv('.chat-room-list', function () {
				$('#' + tabDivId).append('<ul class="chat-room-list">' +
					'<li><span>roomOne</span></li><li><span>roomTwo</span></li></ul>');
			}, function (nameTitle) {

			//标记聊天界面为一对多
			detailChatEle.attr('chatType', 'oneTmore');
			
			//加入房间
			chatApp.changeRoom(nameTitle);
			});
		}

	});

	//回退到列表界面
	$('.title-back').on('click', function () {
		$('#listUrChat').show().siblings('.chat-Contain-cont').hide();
		if(detailChatEle.attr('chatType') == 'oneTone'){
			initHistoryByMap();
		}
	});

	//建立和后台连接
	var socket = io.connect('http://localhost:3000');

	//初始化房间
	var chatApp = new Chat(socket);

	//显示房间变更的结果
	socket.on('joinResult', function (result) {
		messageEle.append(divSystemContentElemen(result.text));
	});

	//显示接受到的消息
/*	socket.on('message', function (message) {debugger
		//来消息时候判断是在列表界面还是聊天界面
		if(detailChatEle.is(':visible') || detailChatEle.attr('chatType') == 'oneTmore'){
			messageEle.append('<div class="other-cont">'+message.text+'</div>');
			messageEle.scrollTop(messageEle.prop('scrollHeight'));
		}else{
			var arr =  userHistMessageMap[message.name] = userHistMessageMap[message.name] || [];
			arr.push(message.text);
			initHistoryByMap();
		}
	});*/
	socket.on('message', function (message) {debugger
		var sendType = message.type, sendUser = message.name, sendMessage = message.text , userStr = messageEle && messageEle.attr('username');

		if(sendType == 'oneTone'){
			if(userStr == sendUser && detailChatEle.is(':visible')){
				messageEle.append('<div class="other-cont">'+sendMessage+'</div>');
				messageEle.scrollTop(messageEle.prop('scrollHeight'));
			}else{
				var arr =  userHistMessageMap[message.name] = userHistMessageMap[message.name] || [];
				arr.push(message.text);
				initHistoryByMap();
			}
		}

		if(sendType == 'oneTmore' && detailChatEle.attr('chatType') == 'oneTmore'){
			messageEle.append('<div class="other-cont">'+sendMessage+'</div>');
			messageEle.scrollTop(messageEle.prop('scrollHeight'));
		}

	});

	$('.user-logout').on('click',function(e){
		location="/";
	});

	//socket.emit('action');表示发送了一个action命令，命令是字符串的，在另一端接收时，可以这么写： socket.on('action',function(){...});
	//初始化房间信息
	socket.emit('initRoomInfo');

	//初始化用户列表
	chatApp.getUserList(function (data) {
		//初始化用户信息
		userName = data.nameMap[socket.id];
		$('.user-name-span').html(userName);

		//初始化用户列表
		userList = data.userList;

		//默认显示用户列表界面
		$('.userTab').click();
	});

	socket.emit('queryUserHistoryMess', {}, function (data) {
		userHistMessageList = data;
		initHistoryElement();
	});

	//提交表单可以发送聊天消息
	$('#send-message').focus();
	$('#send-form').submit(function () {
		processUserInput(chatApp, socket);
		return false;
	});

	function initHistoryElement() {

		if(!isEmpty(userHistMessageMap)){
			initHistoryByMap();
			return;
		}

		if(userHistMessageList && userList && userHistMessageList.length>0 && userList.length>0){
			$.each(userHistMessageList,function(i,item){
				var hisArr = userHistMessageMap[item.sendUser] || [];
				hisArr.push(item.sendUser +' : '+item.messageText);
				userHistMessageMap[item.sendUser] = hisArr;
			});
			initHistoryByMap();
		}
	};

	function initHistoryByMap(){
		$.each($('.chat-user-list li'),function(i,item){
			var spanStr = $(item).find('span').html();
			var hisLengh = userHistMessageMap[spanStr]&&userHistMessageMap[spanStr].length ||0;
			var bStr = $(item).find('b');
			if(hisLengh>0){
				if(bStr && bStr.length>0){
					bStr.html('<b>('+hisLengh+')</b>');
				}else{
					$(item).append('<b>('+hisLengh+')</b>');
				}
			}else{
				bStr.remove();
			}
		});
	};

	function isEmpty(obj){
		if (obj == null) return true;
		if ($.isArray(obj) || typeof obj == "string") return obj.length === 0;
		for (var key in obj){
			if (obj.hasOwnProperty(key)){
				return false;
			}
		}
		return true;
	};

	function divEscapedContentElemen(message, messageFlg) {
		return messageFlg ? $('<div class="myself-cont"></div>').text(message) : $('<div></div>').text(message);
	};

	function divSystemContentElemen(message) {
		return $('<div class="font-center"></div>').html('<i>' + message + '</i>');
	};

	function processUserInput(chatApp, socket) {
		var message = $('#send-message').val(),
		recipientObj = $('.title-cont').text(),
		chatType = detailChatEle.attr('chatType');

		//广播内容
		chatApp.sendMessage(recipientObj, message, chatType);

		//自己发的内容
		messageEle.append(divEscapedContentElemen(userName + " : " + message, true));

		//滚动到最下面
		messageEle.scrollTop(messageEle.prop('scrollHeight'));

		//清空输入框
		$('#send-message').val('');
	};
});
