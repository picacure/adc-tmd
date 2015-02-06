var MSG_TYPE = {
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
};


module.exports = MSG_TYPE;