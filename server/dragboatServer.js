var express = require("express"),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server)
    ;

server.listen(8181);

io.configure(function () {
    io.set('log level', 0);
    io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile']);
    /*
    io.set('transports', ['websocket',
                            'xhr-polling',
                            'htmlfile',
                            'jsonp-polling',
                            'flashsocket']);
    */
});

app.get('/', function (req, res) {

});

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};
Array.prototype.remByVal = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

var pcSocket,
    MSG_TYPE = {
        M_CONNECT_REQ: 'M_CONNECT_REQ',
        M_CONNECT_RES: 'M_CONNECT_RES',
        M_TOKEN_INVALID: 'M_TOKEN_INVALID',
        M_TOKEN_OK: 'M_TOKEN_OK',
        M_SHAKE_INIT: 'M_SHAKE_INIT',     //PC通知M端开始摇晃.
        M_SHAKE_REQ: 'M_SHAKE_REQ',
        M_SHAKE_RES: 'M_SHAKE_RES',
        M_REPLAY: 'M_REPLAY',

        PC_CONNECT_REQ: 'PC_CONNECT_REQ',  //PC连接请求.
        PC_M_CONNECT_RES: 'PC_M_CONNECT_RES',         //M端接入.
        PC_M_ALL_CONNECT_RES: 'PC_M_ALL_CONNECT_RES',         //所有 M端接入.

        PC_M_SHAKE_START_TIP: 'PC_M_SHAKE_START_TIP',   //通知所有M端开始摇晃.

        PC_SHAKE_RES: 'PC_SHAKE_RES',

        PC_REPLAY: 'PC_REPLAY'  //重玩
    }
    ;

var MSocket = [],
    TokenArr = []
    ;

io.sockets.on('connection', function (socket) {

    //PC端接入.
    socket.on(MSG_TYPE.PC_CONNECT_REQ, function (data) {
        console.log('PC端接入');
        TokenArr = data.Token;
        pcSocket = socket;
    });

    //M端接入.
    socket.on(MSG_TYPE.M_CONNECT_REQ, function (data) {
        console.log('M端接入');
        //确认token串.
        if (TokenArr.contains(data.Token)) {
            MSocket.push(socket);
            socket.emit(MSG_TYPE.M_TOKEN_OK, {});

            TokenArr.remByVal(data.Token);

            if (pcSocket) {
                //部分接入.
                pcSocket.emit(MSG_TYPE.PC_M_CONNECT_RES, data);

                //全部接入.
                if (TokenArr.length == 0) {
                    console.log('全部接入');
                    pcSocket.emit(MSG_TYPE.PC_M_ALL_CONNECT_RES, data);
                }

                console.log(TokenArr.length);
            }
        }
        //失效Token.
        else {
            socket.emit(MSG_TYPE.M_TOKEN_INVALID, {});
        }
    });

    //发送消息给所有M端，开始摇晃.
    socket.on(MSG_TYPE.PC_M_SHAKE_START_TIP, function (data) {
        console.log('发送消息给所有M端，开始摇晃');
        if (MSocket.length > 0) {
            for (var i = 0, len = MSocket.length; i < len; i++) {
                MSocket[i].emit(MSG_TYPE.M_SHAKE_INIT, {});
            }
        }
    });

    //重玩.
    socket.on(MSG_TYPE.PC_REPLAY, function (data) {
        if (MSocket.length > 0) {
            for (var i = 0, len = MSocket.length; i < len; i++) {
                MSocket[i].emit(MSG_TYPE.M_REPLAY, data);
            }

            console.log(data);
            MSocket = [];
        }
    });

    //M端晃动数据.
    socket.on(MSG_TYPE.M_SHAKE_REQ, function (data) {
        console.log(socket);
        if (pcSocket) {
            pcSocket.emit(MSG_TYPE.PC_SHAKE_RES, data);
        }
    });
});

//for(var i = 0; i < MSocket.length; i++){
//
//    MSocket[i].on(MSG_TYPE.M_SHAKE_REQ, function (data) {
//
//        if(pcSocket){
//            pcSocket.emit(MSG_TYPE.PC_SHAKE_RES, data);
//        }
//    });
//}

