# ChatRoom
### Node.js+websocket+mongodb实现即时聊天室

A，nodejs简介：Node.js是一个可以让javascript运行在服务器端的平台，它可以让javascript脱离浏览器的束缚运行在一般的服务器下面，你可以用Node.js轻松地进行服务器端应用的开发。Node.js是一个为实时Web应用开发而诞生的平台，它充分考虑了在实时响应和超大规模数据下架构的可扩展性，这使得它摒弃了传统的平台依靠多线程来实现高并发的的设计思路，而采用了单线程，异步式I/O和事件驱动的设计模式。这些特性不仅带来了巨大的性能提升，还减少了多线程程序设计的复杂性，从而提高了开发效率。

B，websocket：websocket协议是html5中的一种新的协议，它实现了浏览器与服务器的全双工通信。传统的我们通过http协议实现即时通讯时是这样做的，首先由浏览器对服务器发出http request（请求），然后服务器响应客户端的浏览器。这种模式所带来的弊端就是浏览器需要不断的向服务器发出请求。但是我们知道http request 的头部（header）非常长，有时客户端请求的只是很小的数据量却要附带这么长的头部信息，这样似乎在浪费网络带宽。而是用websocket协议，这时浏览器和服务器只需要进行一次握手的过程，之后，它们之间便形成了一条快速通道，接着就可以随时互相发送数据。这样不但响应速度快，而且避免了每次都发送请求头。

C，mongodb数据库：mongodb是一个面向文档的非关系型数据库，它具有高性能，易部署，易使用，存储数据方便等优点。它支持的数据结构很松散类似json格式。它也是面向集合的，数据被分组存放在数据集中，每个数据集就是一个集合，每个数据库包含若干个集合。

D，实现和效果：下面要介绍的是使用nodejs实现的即时聊天室，主要用到的是websocket协议，数据库中存放用户民和密码。首先服务器打开一个socket端口3000开始监听客户端的连接，接着客户端浏览器建立socket连接，用户登录时填写用户名和密码，服务器端查询mongodb数据库验证用户名和密码是否正确，用户登录聊天室后可以开始发送消息给其它在线的用户。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190127142140350.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTA2MzMyNjY=,size_16,color_FFFFFF,t_70)

登录之后

![在这里插入图片描述](https://img-blog.csdnimg.cn/2019012714222489.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTA2MzMyNjY=,size_16,color_FFFFFF,t_70)