"use strict";
cc._RF.push(module, '280c3rsZJJKnZ9RqbALVwtK', 'start');
// Script/start.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        game_loading: cc.Node
    },

    // use this for initialization
    onLoad: function onLoad() {

        var gameloading = this.game_loading.getComponent(cc.Animation);
        gameloading.play();
        cc.director.preloadScene('main');
    },

    //开始游戏
    startGame: function startGame() {
        cc.director.loadScene('main', function () {
            console.log('main is loaded');
        });
    }
});

cc._RF.pop();