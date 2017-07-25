"use strict";
cc._RF.push(module, 'c597br4kitB+7t22tMQBl2k', 'end');
// Script/end.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        topScore: cc.Label,
        currentScore: cc.Label
    },

    // use this for initialization
    onLoad: function onLoad() {
        //读取最高分和这次的得分
        var _topScore = cc.sys.localStorage.getItem('topScore');
        this.topScore.string = _topScore;
        var _currentScore = cc.sys.localStorage.getItem('currentScore');
        this.currentScore.string = _currentScore;
        //历史得分
        cc.director.preloadScene('historyScore');
    },
    //游戏重新运行
    gameRestart: function gameRestart() {
        cc.director.loadScene('main');
        //cc.director.resume();
    },
    // 退出游戏
    gameExit: function gameExit() {
        cc.director.loadScene('start');
    },
    //历史得分
    gotoHistoryScore: function gotoHistoryScore() {
        cc.director.loadScene('historyScore');
    }

});

cc._RF.pop();