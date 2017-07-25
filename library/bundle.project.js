require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"NewScript":[function(require,module,exports){
"use strict";
cc._RF.push(module, '96d42rMMulFsa4kZd83uR5L', 'NewScript');
// Script/NewScript.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function onLoad() {}

});

cc._RF.pop();
},{}],"bulletGroup":[function(require,module,exports){
"use strict";
cc._RF.push(module, '3d2d93zegRMeaoaPHxucDMn', 'bulletGroup');
// Script/bulletGroup.js

'use strict';

//子弹生成位置
var bPosition = cc.Class({
    name: 'bPosition',
    properties: {
        xAxis: {
            default: '',
            tooltip: '初始x轴，相对hero'
        },
        yAxis: {
            default: '',
            tooltip: '初始y轴，相对hero'
        }
    }
});

//不限时长子弹
var bulletInfinite = cc.Class({
    name: 'bulletInfinite',
    properties: {
        name: '',
        freqTime: 0,
        initPollCount: 0,
        prefab: cc.Prefab,
        position: {
            default: [],
            type: bPosition,
            tooltip: '每次多少排子弹'
        }
    }
});

//有限时长子弹组
var bulletFiniteG = cc.Class({
    name: 'bulletFiniteG',
    extends: bulletInfinite,
    properties: {
        finiteTime: 0,
        orginName: ''
    }
});

cc.Class({
    extends: cc.Component,

    properties: function properties() {
        return {
            bulletInfinite: {
                default: null,
                type: bulletInfinite,
                tooltip: '无限时长子弹组'
            },
            bulletFiniteG: {
                default: [],
                type: bulletFiniteG,
                tooltip: '有限时长子弹组'
            },
            hero: cc.Node
        };
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.eState = D.commonInfo.gameState.none;
        //初始化无限子弹组
        D.common.initObjPool(this, this.bulletInfinite);
        //初始化🈶️限子弹组
        D.common.batchInitObjPool(this, this.bulletFiniteG);
    },

    startAction: function startAction() {
        this.eState = D.commonInfo.gameState.start;
        //生成子弹
        this.getNewbullet(this.bulletInfinite);
        this.bICallback = function () {
            this.getNewbullet(this.bulletInfinite);
        }.bind(this);
        this.schedule(this.bICallback, this.bulletInfinite.freqTime);
    },
    pauseAction: function pauseAction() {
        this.enabled = false;
        this.eState = D.commonInfo.gameState.pause;
    },
    resumeAction: function resumeAction() {
        this.enabled = true;
        this.eState = D.commonInfo.gameState.start;
    },
    //换子弹
    changeBullet: function changeBullet(ufoBulletName) {
        this.unschedule(this.bICallback);
        this.unschedule(this.bFCallback);
        for (var bi = 0; bi < this.bulletFiniteG.length; bi++) {

            if (this.bulletFiniteG[bi].orginName == ufoBulletName) {
                this.bFCallback = function (e) {
                    this.getNewbullet(this.bulletFiniteG[e]);
                }.bind(this, bi);
                this.schedule(this.bFCallback, this.bulletFiniteG[bi].freqTime, this.bulletFiniteG[bi].finiteTime);
                var delay = this.bulletFiniteG[bi].freqTime * this.bulletFiniteG[bi].finiteTime;
                this.schedule(this.bICallback, this.bulletInfinite.freqTime, cc.macro.REPEAT_FOREVER, delay);
            }
        }
    },
    //生成子弹
    getNewbullet: function getNewbullet(bulletInfo) {
        var poolName = bulletInfo.name + 'Pool';
        for (var bc = 0; bc < bulletInfo.position.length; bc++) {
            var newNode = D.common.genNewNode(this[poolName], bulletInfo.prefab, this.node);
            var newV2 = this.getBulletPostion(bulletInfo.position[bc]);
            newNode.setPosition(newV2);
            newNode.getComponent('bullet').bulletGroup = this;
        }
    },
    //获取子弹位置
    getBulletPostion: function getBulletPostion(posInfo) {
        var hPos = this.hero.getPosition();
        var newV2_x = hPos.x + eval(posInfo.xAxis);
        var newV2_y = hPos.y + eval(posInfo.yAxis);
        return cc.p(newV2_x, newV2_y);
    },

    //子弹灭亡
    bulletDied: function bulletDied(nodeinfo) {
        //回收节点
        D.common.backObjPool(this, nodeinfo);
    }
});

cc._RF.pop();
},{}],"bullet":[function(require,module,exports){
"use strict";
cc._RF.push(module, '81be82YwS9L1LZYufVXSrCP', 'bullet');
// Script/bullet.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        xSpeed: cc.Integer, //x轴速度
        ySpeed: cc.Integer, //y轴速度
        hpDrop: cc.Integer },

    // use this for initialization
    onLoad: function onLoad() {
        cc.director.getCollisionManager().enabled = true;
    },

    //碰撞检测
    onCollisionEnter: function onCollisionEnter(other, self) {
        this.bulletGroup.bulletDied(self.node);
    },
    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this.bulletGroup.eState != D.commonInfo.gameState.start) {
            return;
        }
        this.node.x += dt * this.xSpeed;
        this.node.y += dt * this.ySpeed;

        if (this.node.y > this.node.parent.height) {
            this.bulletGroup.bulletDied(this.node);
        }
    }

});

cc._RF.pop();
},{}],"common":[function(require,module,exports){
"use strict";
cc._RF.push(module, '67917VzMgFG4LdHbqjwaGkY', 'common');
// Script/common.js

'use strict';

var gameState = cc.Enum({
    none: 0,
    start: 1,
    stop: 2
});

var common = cc.Class({

    extends: cc.Component,

    properties: {},
    statics: {
        gameState: gameState
    },
    // use this for initialization
    onLoad: function onLoad() {
        console.log(D);
        D.commonInfo = common;
        D.common = this;
    },
    //批量初始化对象池 
    batchInitObjPool: function batchInitObjPool(thisO, objArray) {

        for (var i = 0; i < objArray.length; i++) {
            var objinfo = objArray[i];
            this.initObjPool(thisO, objinfo);
        }
    },

    //初始化对象池
    initObjPool: function initObjPool(thisO, objInfo) {

        var name = objInfo.name;
        var poolName = name + 'Pool';
        thisO[poolName] = new cc.NodePool();

        var initPollCount = objInfo.initPollCount;

        for (var ii = 0; ii < initPollCount; ++ii) {
            var nodeO = cc.instantiate(objInfo.prefab); // 创建节点
            thisO[poolName].put(nodeO); // 通过 putInPool 接口放入对象池
        }
    },

    //生成节点
    genNewNode: function genNewNode(pool, prefab, nodeParent) {

        var newNode = null;
        if (pool.size() > 0) {
            // 通过 size 接口判断对象池中是否有空闲的对象
            newNode = pool.get();
        } else {
            // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            newNode = cc.instantiate(prefab);
        }
        nodeParent.addChild(newNode);
        return newNode;
    },
    //放回对象池
    backObjPool: function backObjPool(thisO, nodeinfo) {
        var poolName = nodeinfo.name + 'Pool';
        thisO[poolName].put(nodeinfo);
    },
    //时间格式化
    timeFmt: function timeFmt(time, fmt) {
        //author: meizz 
        var o = {
            "M+": time.getMonth() + 1, //月份 
            "d+": time.getDate(), //日 
            "h+": time.getHours(), //小时 
            "m+": time.getMinutes(), //分 
            "s+": time.getSeconds(), //秒 
            "q+": Math.floor((time.getMonth() + 3) / 3), //季度 
            "S": time.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }return fmt;
    }

});

cc._RF.pop();
},{}],"end":[function(require,module,exports){
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
},{}],"enemyGroup":[function(require,module,exports){
"use strict";
cc._RF.push(module, '703caNdSJBMG5jxYvPFwWvP', 'enemyGroup');
// Script/enemyGroup.js

'use strict';

//敌机组
var enemyG = cc.Class({
    name: 'enemyG',
    properties: {
        name: '',
        freqTime: 0,
        initPollCount: 0,
        prefab: cc.Prefab
    }
});

cc.Class({
    extends: cc.Component,

    properties: function properties() {
        return {
            enemyG: {
                default: [],
                type: enemyG
            },
            main: {
                default: null,
                type: require('main')
            }
        };
    },

    // use this for initialization
    onLoad: function onLoad() {
        //初始化敌机组
        this.eState = D.commonInfo.gameState.none;
        D.common.batchInitObjPool(this, this.enemyG);
    },
    startAction: function startAction() {

        this.eState = D.commonInfo.gameState.start;
        //定时生成敌机
        for (var ei = 0; ei < this.enemyG.length; ++ei) {
            var freqTime = this.enemyG[ei].freqTime;
            var fName = 'callback_' + ei;
            this[fName] = function (e) {
                this.getNewEnemy(this.enemyG[e]);
            }.bind(this, ei);
            this.schedule(this[fName], freqTime);
        }
    },
    //重新开始
    resumeAction: function resumeAction() {
        this.enabled = true;
        this.eState = D.commonInfo.gameState.start;
    },
    //暂停
    pauseAction: function pauseAction() {
        this.enabled = false;
        this.eState = D.commonInfo.gameState.pause;
    },
    //生成敌机
    getNewEnemy: function getNewEnemy(enemyInfo) {
        var poolName = enemyInfo.name + 'Pool';
        var newNode = D.common.genNewNode(this[poolName], enemyInfo.prefab, this.node);
        var newV2 = this.getNewEnemyPositon(newNode);
        newNode.setPosition(newV2);
        newNode.getComponent('enemy').init();
    },
    //敌机随机生成的位置
    getNewEnemyPositon: function getNewEnemyPositon(newEnemy) {
        //位于上方，先不可见
        var randx = cc.randomMinus1To1() * (this.node.parent.width / 2 - newEnemy.width / 2);
        var randy = this.node.parent.height / 2 + newEnemy.height / 2;
        return cc.v2(randx, randy);
    },
    enemyDied: function enemyDied(nodeinfo, score) {
        //回收节点
        D.common.backObjPool(this, nodeinfo);
        //增加分数
        if (parseInt(score) > 0) {
            this.main.gainScore(score);
        }
    },
    getScore: function getScore() {
        return this.main.getScore();
    }
});

cc._RF.pop();
},{"main":"main"}],"enemy":[function(require,module,exports){
"use strict";
cc._RF.push(module, '14abee9CoxCobWl/nmeEUv8', 'enemy');
// Script/enemy.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        xMinSpeed: {
            default: 0,
            type: cc.Integer,
            tooltip: 'x轴最小速度'
        },
        xMaxSpeed: {
            default: 0,
            type: cc.Integer,
            tooltip: 'x轴最大速度'
        },
        yMinSpeed: {
            default: 0,
            type: cc.Integer,
            tooltip: 'y轴最小速度'
        },
        yMaxSpeed: {
            default: 0,
            type: cc.Integer,
            tooltip: 'y轴最大速度'
        },
        initHP: {
            default: 0,
            type: cc.Integer,
            tooltip: '初始生命值'
        },
        initSpriteFrame: {
            default: null,
            type: cc.SpriteFrame,
            tooltip: '初始化的图像'
        },
        score: {
            default: 0,
            type: cc.Integer,
            tooltip: '死后获得的分数'

        },
        enemyDownClip: cc.AudioClip
    },

    // use this for initialization
    onLoad: function onLoad() {
        console.log('enemy onload');
        cc.director.getCollisionManager().enabled = true;

        this.xSpeed = Math.random() * (this.xMaxSpeed - this.xMinSpeed) + this.xMinSpeed;
        this.ySpeed = cc.random0To1() * (this.yMaxSpeed - this.yMinSpeed) + this.yMinSpeed;
        this.enemyGroup = this.node.parent.getComponent('enemyGroup');
    },
    init: function init() {

        if (this.node.group != 'enemy') {
            this.node.group = 'enemy';
        }
        if (this.hP != this.initHP) {
            this.hP = this.initHP;
        }
        var nSprite = this.node.getComponent(cc.Sprite);
        if (nSprite.spriteFrame != this.initSpriteFrame) {
            nSprite.spriteFrame = this.initSpriteFrame;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this.enemyGroup.eState != D.commonInfo.gameState.start) {
            return;
        }
        //分数不同 速度不同
        var scores = this.enemyGroup.getScore();
        if (scores <= 50000) {
            this.node.y += dt * this.ySpeed;
        } else if (scores > 50000 && scores <= 100000) {
            this.node.y += dt * this.ySpeed - 0.5;
        } else if (scores > 100000 && scores <= 150000) {
            this.node.y += dt * this.ySpeed - 1;
        } else if (scores > 150000 && scores <= 200000) {
            this.node.y += dt * this.ySpeed - 1.5;
        } else if (scores > 200000 && scores <= 300000) {
            this.node.y += dt * this.ySpeed - 2;
        } else {
            this.node.y += dt * this.ySpeed - 3;
        }
        this.node.x += dt * this.xSpeed;
        //出屏幕后 回收节点
        if (this.node.y < -this.node.parent.height / 2) {
            this.enemyGroup.enemyDied(this.node, 0);
        }
    },
    //碰撞检测
    onCollisionEnter: function onCollisionEnter(other, self) {
        if (other.node.group != 'bullet') {
            return;
        }
        var bullet = other.node.getComponent('bullet');

        if (this.hP > 0) {
            //防止再次碰撞
            this.hP -= bullet.hpDrop;
        } else {
            return;
        }
        if (this.hP <= 0) {
            this.node.group = 'default'; //不让动画在执行碰撞
            //播放动画
            var anim = this.getComponent(cc.Animation);
            var animName = self.node.name + 'ani';
            anim.play(animName);
            anim.on('finished', this.onFinished, this);
            //播放音效
            cc.audioEngine.playEffect(this.enemyDownClip, false);
        }
    },
    //动画结束后 动画节点回收
    onFinished: function onFinished(event) {
        this.enemyGroup.enemyDied(this.node, this.score);
    }

});

cc._RF.pop();
},{}],"globals":[function(require,module,exports){
"use strict";
cc._RF.push(module, '2db22ldw1ZEWKAUUhqzblk7', 'globals');
// Script/globals.js

"use strict";

// declare global variable "D"
window.D = {
    // singletons
    common: null, //公共方法
    commonInfo: null };

cc._RF.pop();
},{}],"hero":[function(require,module,exports){
"use strict";
cc._RF.push(module, '3f0ccHUefxOLK9+K5/zp2v4', 'hero');
// Script/hero.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: function properties() {
        return {
            blowupani: {
                default: null,
                type: cc.Prefab,
                tooltip: '爆炸动画'
            },

            gameOverClip: cc.AudioClip,
            main: {
                default: null,
                type: require('main')
            },
            bulletGroup: {
                default: null,
                type: require('bulletGroup')
            }
        };
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.eState = D.commonInfo.gameState.none;
        cc.director.getCollisionManager().enabled = true;
        this.onDrag();
    },

    //添加拖动监听
    onDrag: function onDrag() {
        this.node.on('touchmove', this.dragMove, this);
    },
    //去掉拖动监听
    offDrag: function offDrag() {
        this.node.off('touchmove', this.dragMove, this);
    },
    //拖动
    dragMove: function dragMove(event) {
        var locationv = event.getLocation();
        var location = this.node.parent.convertToNodeSpaceAR(locationv);
        //飞机不移出屏幕 
        var minX = -this.node.parent.width / 2 + this.node.width / 2;
        var maxX = -minX;
        var minY = -this.node.parent.height / 2 + this.node.height / 2;
        var maxY = -minY;
        if (location.x < minX) {
            location.x = minX;
        }
        if (location.x > maxX) {
            location.x = maxX;
        }
        if (location.y < minY) {
            location.y = minY;
        }
        if (location.y > maxY) {
            location.y = maxY;
        }
        this.node.setPosition(location);
    },
    //碰撞监测
    onCollisionEnter: function onCollisionEnter(other, self) {
        if (other.node.group == 'ufo') {
            if (other.node.name == 'ufoBullet') {
                this.bulletGroup.changeBullet(other.node.name);
            } else if (other.node.name == 'ufoBomb') {
                this.main.getUfoBomb();
            }
        } else if (other.node.group == 'enemy') {
            //播放动画
            var po = this.node.getPosition();
            var blowup = cc.instantiate(this.blowupani);
            this.node.parent.addChild(blowup);
            blowup.setPosition(po);
            var animation = blowup.getComponent(cc.Animation);
            animation.on('finished', this.onFinished, blowup);
            //播放音效
            cc.audioEngine.playEffect(this.gameOverClip, false);
            //清除节点
            this.node.destroy();
            //更新分数 
            this.main.gameOver();
        } else {
            return false;
        }
    },

    onFinished: function onFinished(event) {
        //动画结束后
        this.destroy();
        //cc.director.pause();
    }
});

cc._RF.pop();
},{"bulletGroup":"bulletGroup","main":"main"}],"historyScore":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'c11abrWZANO2aVZSE4dxEvW', 'historyScore');
// Script/historyScore.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab: cc.Prefab,
        scrollContent: cc.Node,
        backGame: cc.Node
    },

    // use this for initialization
    onLoad: function onLoad() {
        var infoData = JSON.parse(cc.sys.localStorage.getItem('score'));

        for (var i = 0; i < infoData.length; ++i) {

            var item = cc.instantiate(this.itemPrefab);

            var data = infoData[i];

            this.scrollContent.addChild(item);

            item.getComponent('scoreItemTemplate').init({

                score: data.score,
                time: data.time

            });
        }
        this.backGame.on('touchstart', this.backGameO, this);
    },
    backGameO: function backGameO() {
        cc.director.loadScene('end');
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();
},{}],"main":[function(require,module,exports){
"use strict";
cc._RF.push(module, '6afa0phF7dPka/zlZtFFHow', 'main');
// Script/main.js

'use strict';

cc.Class({

    extends: cc.Component,

    properties: function properties() {
        return {
            pause: cc.Button,
            btnSprite: {
                default: [],
                type: cc.SpriteFrame,
                tooltip: '暂停按钮不同状态的图片'
            },
            bomb: cc.Node,
            gameMusic: {
                default: null,
                type: cc.AudioSource
            },
            useBombClip: cc.AudioClip,
            enemyGroup: {
                default: null,
                type: require('enemyGroup')
            },
            hero: {
                default: null,
                type: require('hero')
            },
            ufoGroup: {
                default: null,
                type: require('ufoGroup')
            },
            bulletGroup: {
                default: null,
                type: require('bulletGroup')
            },
            scoreDisplay: cc.Label,
            bombNoDisplay: cc.Label
        };
    },

    // use this for initialization
    onLoad: function onLoad() {

        this.score = 0;
        this.bombNo = 0;
        this.scoreDisplay.string = this.score;
        this.bombNoDisplay.string = this.bombNo;
        this.eState = D.commonInfo.gameState.start;

        this.enemyGroup.startAction();
        this.bulletGroup.startAction();
        this.ufoGroup.startAction();
        this.bomb.on('touchstart', this.bombOnclick, this);
        this.gameMusic.play();
    },

    bombOnclick: function bombOnclick() {
        var bombNoLabel = this.bomb.getChildByName('bombNo').getComponent(cc.Label);
        var bombNo = parseInt(bombNoLabel.string);

        if (bombNo > 0) {
            bombNoLabel.string = bombNo - 1;
            this.removeEnemy();
            cc.audioEngine.playEffect(this.useBombClip, false);
        } else {
            console.log('没有子弹');
        }
    },
    // called every frame, uncomment this function to activate update callback
    //update: function (dt) {

    //},

    //暂停按钮点击事件  
    pauseClick: function pauseClick() {
        //暂停 继续

        if (this.eState == D.commonInfo.gameState.pause) {
            this.resumeAction();
            this.eState = D.commonInfo.gameState.start;
        } else if (this.eState == D.commonInfo.gameState.start) {
            this.pauseAction();
            this.eState = D.commonInfo.gameState.pause;
        }
    },
    //游戏继续
    resumeAction: function resumeAction() {
        this.enemyGroup.resumeAction();
        this.bulletGroup.resumeAction();
        this.ufoGroup.resumeAction();
        this.hero.onDrag();
        this.gameMusic.resume();
        this.pause.normalSprite = this.btnSprite[0];
        this.pause.pressedSprite = this.btnSprite[1];
        this.pause.hoverSprite = this.btnSprite[1];
    },
    //游戏暂停
    pauseAction: function pauseAction() {
        this.enemyGroup.pauseAction();
        this.bulletGroup.pauseAction();
        this.hero.offDrag();
        this.gameMusic.pause();
        this.ufoGroup.pauseAction();
        this.pause.normalSprite = this.btnSprite[2];
        this.pause.pressedSprite = this.btnSprite[3];
        this.pause.hoverSprite = this.btnSprite[3];
    },
    //增加分数
    gainScore: function gainScore(scoreno) {
        this.score += scoreno;
        //更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = this.score.toString();
    },
    //get分数
    getScore: function getScore() {
        return parseInt(this.scoreDisplay.string);
    },
    //分数写到本地（ 当前分 最高分 历史记录）
    updateScore: function updateScore() {
        var currentScore = this.scoreDisplay.string;
        var scoreData = {
            'score': currentScore,
            'time': D.common.timeFmt(new Date(), 'yyyy-MM-dd hh:mm:ss')
        };
        var preData = cc.sys.localStorage.getItem('score');
        var preTopScore = cc.sys.localStorage.getItem('topScore');
        if (!preTopScore || parseInt(preTopScore) < parseInt(currentScore)) {
            cc.sys.localStorage.setItem('topScore', currentScore);
        }
        if (!preData) {
            preData = [];
            preData.unshift(scoreData);
        } else {
            preData = JSON.parse(preData);
            if (!(preData instanceof Array)) {
                preData = [];
            }
            preData.unshift(scoreData);
        }
        cc.sys.localStorage.setItem('currentScore', currentScore);
        cc.sys.localStorage.setItem('score', JSON.stringify(preData));
    },
    //炸弹清除敌机
    removeEnemy: function removeEnemy() {
        this.enemyGroup.node.removeAllChildren();
    },
    //接到炸弹
    getUfoBomb: function getUfoBomb() {
        if (parseInt(this.bombNoDisplay.string) < 3) {
            //多于三个炸弹就不累加
            this.bombNoDisplay.string += 1;
        }
    },
    //游戏结束
    gameOver: function gameOver() {
        this.pauseAction();
        this.updateScore();
        cc.director.loadScene('end');
    }
});

cc._RF.pop();
},{"bulletGroup":"bulletGroup","enemyGroup":"enemyGroup","hero":"hero","ufoGroup":"ufoGroup"}],"scoreItemTemplate":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'e7aaajpGBdAAaGaUimU4MnH', 'scoreItemTemplate');
// Script/scoreItemTemplate.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        itemScore: cc.Label,
        itemTime: cc.Label
    },

    // use this for initialization
    onLoad: function onLoad() {},
    init: function init(data) {
        this.itemScore.string = '积分：' + data.score;
        this.itemTime.string = '时间：' + data.time;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();
},{}],"start":[function(require,module,exports){
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
},{}],"ufoGroup":[function(require,module,exports){
"use strict";
cc._RF.push(module, '07c58NeAQVELrP3L2RCOyrA', 'ufoGroup');
// Script/ufoGroup.js

'use strict';

//ufo组
var ufoG = cc.Class({
    name: 'ufoG',
    properties: {
        name: '',
        freqTime: 0,
        prefab: cc.Prefab,
        initPoolCount: 0,
        minDelay: {
            default: 0,
            tooltip: '最小延迟'
        },
        maxDelay: {
            default: 0,
            tooltip: '最大延迟'
        }
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        ufoG: {
            default: [],
            type: ufoG
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.eState = D.commonInfo.gameState.none;
        //console.log(this.ufoG);
        D.common.batchInitObjPool(this, this.ufoG);
    },
    startAction: function startAction() {
        // ufo 
        this.eState = D.commonInfo.gameState.start;
        //定时生成敌机
        for (var ui = 0; ui < this.ufoG.length; ++ui) {
            var freqTime = this.ufoG[ui].freqTime;
            var fName = 'callback_' + ui;
            this[fName] = function (e) {
                this.randNewUfo(this.ufoG[e]);
            }.bind(this, ui);
            this.schedule(this[fName], freqTime);
        }
    },

    //随机时间生成敌机
    randNewUfo: function randNewUfo(ufoInfo) {
        var delay = Math.random() * (ufoInfo.maxDelay - ufoInfo.minDelay) + ufoInfo.minDelay;
        this.scheduleOnce(function (e) {
            this.getNewUfo(e);
        }.bind(this, ufoInfo), delay);
    },
    //生成敌机
    getNewUfo: function getNewUfo(ufoInfo) {
        var poolName = ufoInfo.name + 'Pool';
        var newNode = D.common.genNewNode(this[poolName], ufoInfo.prefab, this.node);
        var newV2 = this.getNewUfoPositon(newNode);
        newNode.setPosition(newV2);
    },
    //敌机随机生成的位置
    getNewUfoPositon: function getNewUfoPositon(newUfo) {
        //位于上方，先不可见
        var randx = cc.randomMinus1To1() * (this.node.parent.width / 2 - newUfo.width / 2);
        var randy = this.node.parent.height / 2 + newUfo.height / 2;
        return cc.v2(randx, randy);
    },
    //重新开始
    resumeAction: function resumeAction() {
        this.enabled = true;
        this.eState = D.commonInfo.gameState.start;
    },
    //暂停
    pauseAction: function pauseAction() {
        this.enabled = false;
        this.eState = D.commonInfo.gameState.pause;
    },
    ufoDied: function ufoDied(nodeinfo) {
        //回收节点
        D.common.backObjPool(this, nodeinfo);
    }
});

cc._RF.pop();
},{}],"ufo":[function(require,module,exports){
"use strict";
cc._RF.push(module, '1e7a0zfIuJA+Kn9DAfY5544', 'ufo');
// Script/ufo.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        xMinSpeed: { //x轴最小速度
            default: 0,
            type: cc.Integer
        },
        xMaxSpeed: { //x轴最大速度
            default: 0,
            type: cc.Integer
        },
        yMinSpeed: {
            default: 0,
            type: cc.Integer
        }, //y轴最小速度

        yMaxSpeed: { //y轴最大速度
            default: 0,
            type: cc.Integer
        },
        getUfoClip: cc.AudioClip
    },

    // use this for initialization
    onLoad: function onLoad() {
        cc.director.getCollisionManager().enabled = true;

        this.xSpeed = Math.random() * (this.xMaxSpeed - this.xMinSpeed) + this.xMinSpeed;
        this.ySpeed = cc.random0To1() * (this.yMaxSpeed - this.yMinSpeed) + this.yMinSpeed;
        this.ufoGroup = this.node.parent.getComponent('ufoGroup');
    },

    //碰撞检测
    onCollisionEnter: function onCollisionEnter(other, self) {
        this.node.destroy();
        //D.game.ufoBomb();
        cc.audioEngine.playEffect(this.getUfoClip, false);
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this.ufoGroup.eState != D.commonInfo.gameState.start) {
            return;
        }
        this.node.x += dt * this.xSpeed;
        this.node.y += dt * this.ySpeed;
        //出屏幕后
        if (this.node.y < -this.node.parent.height / 2) {
            this.ufoGroup.ufoDied(this.node);
        }
    }
});

cc._RF.pop();
},{}]},{},["NewScript","bullet","bulletGroup","common","end","enemy","enemyGroup","globals","hero","historyScore","main","scoreItemTemplate","start","ufo","ufoGroup"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9TY3JpcHQvTmV3U2NyaXB0LmpzIiwiYXNzZXRzL1NjcmlwdC9idWxsZXRHcm91cC5qcyIsImFzc2V0cy9TY3JpcHQvYnVsbGV0LmpzIiwiYXNzZXRzL1NjcmlwdC9jb21tb24uanMiLCJhc3NldHMvU2NyaXB0L2VuZC5qcyIsImFzc2V0cy9TY3JpcHQvZW5lbXlHcm91cC5qcyIsImFzc2V0cy9TY3JpcHQvZW5lbXkuanMiLCJhc3NldHMvU2NyaXB0L2dsb2JhbHMuanMiLCJhc3NldHMvU2NyaXB0L2hlcm8uanMiLCJhc3NldHMvU2NyaXB0L2hpc3RvcnlTY29yZS5qcyIsImFzc2V0cy9TY3JpcHQvbWFpbi5qcyIsImFzc2V0cy9TY3JpcHQvc2NvcmVJdGVtVGVtcGxhdGUuanMiLCJhc3NldHMvU2NyaXB0L3N0YXJ0LmpzIiwiYXNzZXRzL1NjcmlwdC91Zm9Hcm91cC5qcyIsImFzc2V0cy9TY3JpcHQvdWZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNJOztBQUVBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFWUTs7QUFhWjtBQUNBOztBQWpCSzs7Ozs7Ozs7OztBQ0FUO0FBQ0E7QUFDSTtBQUNBO0FBQ0k7QUFDSTtBQUNBO0FBRkc7QUFJUDtBQUNJO0FBQ0E7QUFGRztBQUxDO0FBRlM7O0FBY3pCO0FBQ0E7QUFDSTtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUhNO0FBTEY7QUFGYzs7QUFlOUI7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUNJO0FBQ0E7QUFGUTtBQUhhOztBQVM3QjtBQUNJOztBQUVBO0FBQVc7QUFDUDtBQUNJO0FBQ0E7QUFDQTtBQUhZO0FBS2hCO0FBQ0k7QUFDQTtBQUNBO0FBSFc7QUFLZjtBQVhhO0FBQU47O0FBY1g7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSDs7QUFFRDtBQUNJO0FB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Ozs7Ozs7OztBQ0NUO0FBQ0E7QUFDSTtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0E7QUFGSztBQUlUO0FBQ0k7QUFDQTtBQUZLO0FBVEQ7QUFGSTs7QUFrQnBCO0FBQ0k7O0FBRUE7QUFDSTtBQUNJO0FBQ0E7QUFGRTtBQURFOztBQU9aO0FBQ0E7QUFDSTtBQUNBO0FBQ0E7QUFFSDtBQUNEO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDSTtBQUNBO0FBQ0E7QUFBMkI7QUFBZ0M7QUFDM0Q7QUFDSDtBQUNKOztBQUNEO0FBQ0E7QUFDSTtBQUNBO0FBQStCO0FBQW1CO0FBQ3JEO0FBQ0Q7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0g7QUFDRDtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDSDtBQUNEO0FBQ0E7QUFDSTtBQUNBO0FBQ0g7QUFDRDtBQUNBO0FBQ0k7QUFDQTtBQUVIO0FBQ0Q7QUFDSTtBQUNBO0FBQ0g7QUE3REk7Ozs7Ozs7Ozs7QUNwQlQ7QUFDSTs7QUFFQTtBQUNJO0FBQ0k7QUFDQTtBQUZPO0FBSVg7QUFDSTtBQUNBO0FBRk87QUFJWDtBQUNJO0FBQ0E7QUFGTzs7QUFLWDtBQUNJO0FBQ0E7QUFGTztBQUlYO0FBbEJROztBQXFCWjtBQUNBO0FBQ0k7O0FBRUE7QUFDQTtBQUNBO0FBQ0g7O0FBRUQ7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUNIOztBQUVEO0FBQ0E7QUFDSTtBQUNJO0FBQ0g7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0g7QUFDSjtBQW5ESSIsInNvdXJjZXNDb250ZW50IjpbImNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAgIC8vIH0sXG59KTtcbiIsIi8v5a2Q5by555Sf5oiQ5L2N572uXG52YXIgYlBvc2l0aW9uID0gY2MuQ2xhc3Moe1xuICAgIG5hbWU6ICdiUG9zaXRpb24nLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgeEF4aXM6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6JycsXG4gICAgICAgICAgICB0b29sdGlwOiAn5Yid5aeLeOi9tO+8jOebuOWvuWhlcm8nLFxuICAgICAgICB9LFxuICAgICAgICB5QXhpczoge1xuICAgICAgICAgICAgZGVmYXVsdDonJyxcbiAgICAgICAgICAgIHRvb2x0aXA6ICfliJ3lp4t56L2077yM55u45a+5aGVybydcbiAgICAgICAgfSxcbiAgICB9LFxufSk7XG5cbi8v5LiN6ZmQ5pe26ZW/5a2Q5by5XG52YXIgYnVsbGV0SW5maW5pdGUgPSBjYy5DbGFzcyh7XG4gICAgbmFtZTonYnVsbGV0SW5maW5pdGUnLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbmFtZTonJyxcbiAgICAgICAgZnJlcVRpbWU6MCxcbiAgICAgICAgaW5pdFBvbGxDb3VudDowLFxuICAgICAgICBwcmVmYWI6Y2MuUHJlZmFiLFxuICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgZGVmYXVsdDogW10sXG4gICAgICAgICAgICB0eXBlOiBiUG9zaXRpb24sXG4gICAgICAgICAgICB0b29sdGlwOiAn5q+P5qyh5aSa5bCR5o6S5a2Q5by5JyxcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG4vL+aciemZkOaXtumVv+WtkOW8uee7hFxudmFyIGJ1bGxldEZpbml0ZUcgPSBjYy5DbGFzcyh7XG4gICAgbmFtZTonYnVsbGV0RmluaXRlRycsXG4gICAgZXh0ZW5kczpidWxsZXRJbmZpbml0ZSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGZpbml0ZVRpbWU6MCxcbiAgICAgICAgb3JnaW5OYW1lOicnLFxuICAgIH1cbn0pOyBcblxuY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6KCk9PiAoe1xuICAgICAgICBidWxsZXRJbmZpbml0ZToge1xuICAgICAgICAgICAgZGVmYXVsdDpudWxsLFxuICAgICAgICAgICAgdHlwZTogYnVsbGV0SW5maW5pdGUsXG4gICAgICAgICAgICB0b29sdGlwOifml6DpmZDml7bplb/lrZDlvLnnu4QnXG4gICAgICAgIH0sXG4gICAgICAgIGJ1bGxldEZpbml0ZUc6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6W10sXG4gICAgICAgICAgICB0eXBlOiBidWxsZXRGaW5pdGVHLFxuICAgICAgICAgICAgdG9vbHRpcDon5pyJ6ZmQ5pe26ZW/5a2Q5by557uEJ1xuICAgICAgICB9LFxuICAgICAgICBoZXJvOiBjYy5Ob2RlLFxuICAgIH0pLFxuICAgIFxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVTdGF0ZSA9IEQuY29tbW9uSW5mby5nYW1lU3RhdGUubm9uZTtcbiAgICAgICAgLy/liJ3lp4vljJbml6DpmZDlrZDlvLnnu4RcbiAgICAgICAgRC5jb21tb24uaW5pdE9ialBvb2wodGhpcyx0aGlzLmJ1bGxldEluZmluaXRlKTtcbiAgICAgICAgLy/liJ3lp4vljJbwn4i277iP6ZmQ5a2Q5by557uEXG4gICAgICAgIEQuY29tbW9uLmJhdGNoSW5pdE9ialBvb2wodGhpcyx0aGlzLmJ1bGxldEZpbml0ZUcpO1xuICAgIH0sXG4gICAgXG4gICAgc3RhcnRBY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZVN0YXRlID0gRC5jb21tb25JbmZvLmdhbWVTdGF0ZS5zdGFydDtcbiAgICAgICAgLy/nlJ/miJDlrZDlvLlcbiAgICAgICAgdGhpcy5nZXROZXdidWxsZXQodGhpcy5idWxsZXRJbmZpbml0ZSk7XG4gICAgICAgIHRoaXMuYklDYWxsYmFjayA9IGZ1bmN0aW9uKCl7dGhpcy5nZXROZXdidWxsZXQodGhpcy5idWxsZXRJbmZpbml0ZSk7fS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlKHRoaXMuYklDYWxsYmFjaywgdGhpcy5idWxsZXRJbmZpbml0ZS5mcmVxVGltZSk7XG4gICAgICAgIFxuICAgIH0sXG4gICAgcGF1c2VBY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVTdGF0ZSA9IEQuY29tbW9uSW5mby5nYW1lU3RhdGUucGF1c2U7XG4gICAgfSxcbiAgICByZXN1bWVBY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZVN0YXRlID0gRC5jb21tb25JbmZvLmdhbWVTdGF0ZS5zdGFydDtcbiAgICB9LFxuICAgIC8v5o2i5a2Q5by5XG4gICAgY2hhbmdlQnVsbGV0OiBmdW5jdGlvbih1Zm9CdWxsZXROYW1lKXtcbiAgICAgICAgdGhpcy51bnNjaGVkdWxlKHRoaXMuYklDYWxsYmFjayk7XG4gICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLmJGQ2FsbGJhY2spO1xuICAgICAgICBmb3IgKHZhciBiaT0wOyBiaTx0aGlzLmJ1bGxldEZpbml0ZUcubGVuZ3RoOyBiaSsrKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMuYnVsbGV0RmluaXRlR1tiaV0ub3JnaW5OYW1lID09IHVmb0J1bGxldE5hbWUpe1xuICAgICAgICAgICAgICAgIHRoaXMuYkZDYWxsYmFjayA9IGZ1bmN0aW9uKGUpe3RoaXMuZ2V0TmV3YnVsbGV0KHRoaXMuYnVsbGV0RmluaXRlR1tlXSk7fS5iaW5kKHRoaXMsYmkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5iRkNhbGxiYWNrLCB0aGlzLmJ1bGxldEZpbml0ZUdbYmldLmZyZXFUaW1lLHRoaXMuYnVsbGV0RmluaXRlR1tiaV0uZmluaXRlVGltZSk7XG4gICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gdGhpcy5idWxsZXRGaW5pdGVHW2JpXS5mcmVxVGltZSAqIHRoaXMuYnVsbGV0RmluaXRlR1tiaV0uZmluaXRlVGltZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjaGVkdWxlKHRoaXMuYklDYWxsYmFjayx0aGlzLmJ1bGxldEluZmluaXRlLmZyZXFUaW1lLGNjLm1hY3JvLlJFUEVBVF9GT1JFVkVSLGRlbGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/nlJ/miJDlrZDlvLlcbiAgICBnZXROZXdidWxsZXQ6IGZ1bmN0aW9uIChidWxsZXRJbmZvKSB7XG4gICAgICAgIHZhciBwb29sTmFtZSA9IGJ1bGxldEluZm8ubmFtZSArICdQb29sJztcbiAgICAgICAgZm9yICh2YXIgYmM9MDsgYmM8YnVsbGV0SW5mby5wb3NpdGlvbi5sZW5ndGg7IGJjKyspe1xuICAgICAgICAgICAgdmFyIG5ld05vZGUgPSBELmNvbW1vbi5nZW5OZXdOb2RlKHRoaXNbcG9vbE5hbWVdLGJ1bGxldEluZm8ucHJlZmFiLHRoaXMubm9kZSk7XG4gICAgICAgICAgICB2YXIgbmV3VjIgPSB0aGlzLmdldEJ1bGxldFBvc3Rpb24oYnVsbGV0SW5mby5wb3NpdGlvbltiY10pO1xuICAgICAgICAgICAgbmV3Tm9kZS5zZXRQb3NpdGlvbihuZXdWMik7XG4gICAgICAgICAgICBuZXdOb2RlLmdldENvbXBvbmVudCgnYnVsbGV0JykuYnVsbGV0R3JvdXAgPSB0aGlzO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvL+iOt+WPluWtkOW8ueS9jee9rlxuICAgIGdldEJ1bGxldFBvc3Rpb246IGZ1bmN0aW9uKHBvc0luZm8pe1xuICAgICAgICB2YXIgaFBvcyA9IHRoaXMuaGVyby5nZXRQb3NpdGlvbigpO1xuICAgICAgICB2YXIgbmV3VjJfeCA9IGhQb3MueCArIGV2YWwocG9zSW5mby54QXhpcyk7XG4gICAgICAgIHZhciBuZXdWMl95ID0gaFBvcy55ICsgZXZhbChwb3NJbmZvLnlBeGlzKTtcbiAgICAgICAgcmV0dXJuIGNjLnAobmV3VjJfeCwgbmV3VjJfeSk7IFxuICAgIH0sXG5cbiAgICAvL+WtkOW8ueeBreS6oVxuICAgIGJ1bGxldERpZWQ6IGZ1bmN0aW9uKG5vZGVpbmZvKXtcbiAgICAgICAgLy/lm57mlLboioLngrlcbiAgICAgICAgRC5jb21tb24uYmFja09ialBvb2wodGhpcyxub2RlaW5mbyk7XG4gICAgfSxcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxufSk7XG4iLCJjYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuICAgIFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgeFNwZWVkOiBjYy5JbnRlZ2VyLC8veOi9tOmAn+W6plxuICAgICAgICB5U3BlZWQ6IGNjLkludGVnZXIsLy956L206YCf5bqmXG4gICAgICAgIGhwRHJvcDogY2MuSW50ZWdlciwgLy/mjonooYBcbiAgICAgICAgXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkPXRydWU7XG4gICAgfSxcbiAgICBcbiAgICAvL+eisOaSnuajgOa1i1xuICAgIG9uQ29sbGlzaW9uRW50ZXI6IGZ1bmN0aW9uKG90aGVyLHNlbGYpe1xuICAgICAgICB0aGlzLmJ1bGxldEdyb3VwLmJ1bGxldERpZWQoc2VsZi5ub2RlKTtcbiAgICB9LFxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKHRoaXMuYnVsbGV0R3JvdXAuZVN0YXRlICE9IEQuY29tbW9uSW5mby5nYW1lU3RhdGUuc3RhcnQpe1xuICAgICAgICAgICAgcmV0dXJuIDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vZGUueCArPSBkdCp0aGlzLnhTcGVlZDtcbiAgICAgICAgdGhpcy5ub2RlLnkgKz0gZHQqdGhpcy55U3BlZWQ7XG4gICAgICAgIFxuICAgICAgICBpZiAoIHRoaXMubm9kZS55PiB0aGlzLm5vZGUucGFyZW50LmhlaWdodCl7XG4gICAgICAgICAgICB0aGlzLmJ1bGxldEdyb3VwLmJ1bGxldERpZWQodGhpcy5ub2RlKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG59KTtcbiIsInZhciBnYW1lU3RhdGUgPSBjYy5FbnVtKHtcbiAgICBub25lOiAwLFxuICAgIHN0YXJ0OiAxLFxuICAgIHN0b3A6IDIsXG59KTtcblxudmFyIGNvbW1vbiA9IGNjLkNsYXNzKHtcbiAgICBcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIFxuICAgIH0sXG4gICAgc3RhdGljczoge1xuICAgICAgICBnYW1lU3RhdGVcbiAgICB9LFxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhEKTtcbiAgICAgICAgRC5jb21tb25JbmZvID0gY29tbW9uO1xuICAgICAgICBELmNvbW1vbiA9IHRoaXM7XG4gICAgfSxcbiAgICAvL+aJuemHj+WIneWni+WMluWvueixoeaxoCBcbiAgICBiYXRjaEluaXRPYmpQb29sOiBmdW5jdGlvbih0aGlzTywgb2JqQXJyYXkpe1xuICAgICAgICBcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8IG9iakFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgb2JqaW5mbyA9IG9iakFycmF5W2ldO1xuICAgICAgICAgICAgdGhpcy5pbml0T2JqUG9vbCh0aGlzTywgb2JqaW5mbyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8v5Yid5aeL5YyW5a+56LGh5rGgXG4gICAgaW5pdE9ialBvb2w6IGZ1bmN0aW9uKHRoaXNPLG9iakluZm8pe1xuICAgICAgICBcbiAgICAgICAgICAgIHZhciBuYW1lID0gb2JqSW5mby5uYW1lO1xuICAgICAgICAgICAgdmFyIHBvb2xOYW1lID0gbmFtZSsnUG9vbCc7XG4gICAgICAgICAgICB0aGlzT1twb29sTmFtZV0gPSBuZXcgY2MuTm9kZVBvb2woKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGluaXRQb2xsQ291bnQgPSBvYmpJbmZvLmluaXRQb2xsQ291bnQ7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGlpID0gMDsgaWkgPCBpbml0UG9sbENvdW50OyArK2lpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5vZGVPID0gY2MuaW5zdGFudGlhdGUob2JqSW5mby5wcmVmYWIpOyAvLyDliJvlu7roioLngrlcbiAgICAgICAgICAgICAgICB0aGlzT1twb29sTmFtZV0ucHV0KG5vZGVPKTsgLy8g6YCa6L+HIHB1dEluUG9vbCDmjqXlj6PmlL7lhaXlr7nosaHmsaBcbiAgICAgICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8v55Sf5oiQ6IqC54K5XG4gICAgZ2VuTmV3Tm9kZTogZnVuY3Rpb24ocG9vbCxwcmVmYWIsbm9kZVBhcmVudCl7XG5cbiAgICAgICAgbGV0IG5ld05vZGUgPSBudWxsO1xuICAgICAgICBpZiAocG9vbC5zaXplKCkgPiAwKSB7IC8vIOmAmui/hyBzaXplIOaOpeWPo+WIpOaWreWvueixoeaxoOS4reaYr+WQpuacieepuumXsueahOWvueixoVxuICAgICAgICAgICAgbmV3Tm9kZSA9IHBvb2wuZ2V0KCk7XG4gICAgICAgIH0gZWxzZSB7IC8vIOWmguaenOayoeacieepuumXsuWvueixoe+8jOS5n+WwseaYr+WvueixoeaxoOS4reWkh+eUqOWvueixoeS4jeWkn+aXtu+8jOaIkeS7rOWwseeUqCBjYy5pbnN0YW50aWF0ZSDph43mlrDliJvlu7pcbiAgICAgICAgICAgIG5ld05vZGUgPSBjYy5pbnN0YW50aWF0ZShwcmVmYWIpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVQYXJlbnQuYWRkQ2hpbGQobmV3Tm9kZSk7XG4gICAgICAgIHJldHVybiBuZXdOb2RlO1xuICAgIH0sXG4gICAgLy/mlL7lm57lr7nosaHmsaBcbiAgICBiYWNrT2JqUG9vbDogZnVuY3Rpb24odGhpc08sbm9kZWluZm8pe1xuICAgICAgICB2YXIgcG9vbE5hbWUgPSBub2RlaW5mby5uYW1lICsgJ1Bvb2wnO1xuICAgICAgICB0aGlzT1twb29sTmFtZV0ucHV0KG5vZGVpbmZvKTsgXG4gICAgfSxcbiAgICAvL+aXtumXtOagvOW8j+WMllxuICAgIHRpbWVGbXQ6IGZ1bmN0aW9uICh0aW1lLGZtdCkgeyAvL2F1dGhvcjogbWVpenogXG4gICAgICAgIHZhciBvID0ge1xuICAgICAgICAgICAgXCJNK1wiOiB0aW1lLmdldE1vbnRoKCkgKyAxLCAvL+aciOS7vSBcbiAgICAgICAgICAgIFwiZCtcIjogdGltZS5nZXREYXRlKCksIC8v5pelIFxuICAgICAgICAgICAgXCJoK1wiOiB0aW1lLmdldEhvdXJzKCksIC8v5bCP5pe2IFxuICAgICAgICAgICAgXCJtK1wiOiB0aW1lLmdldE1pbnV0ZXMoKSwgLy/liIYgXG4gICAgICAgICAgICBcInMrXCI6IHRpbWUuZ2V0U2Vjb25kcygpLCAvL+enkiBcbiAgICAgICAgICAgIFwicStcIjogTWF0aC5mbG9vcigodGltZS5nZXRNb250aCgpICsgMykgLyAzKSwgLy/lraPluqYgXG4gICAgICAgICAgICBcIlNcIjogdGltZS5nZXRNaWxsaXNlY29uZHMoKSAvL+avq+enkiBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKC8oeSspLy50ZXN0KGZtdCkpIGZtdCA9IGZtdC5yZXBsYWNlKFJlZ0V4cC4kMSwgKHRpbWUuZ2V0RnVsbFllYXIoKSArIFwiXCIpLnN1YnN0cig0IC0gUmVnRXhwLiQxLmxlbmd0aCkpO1xuICAgICAgICBmb3IgKHZhciBrIGluIG8pXG4gICAgICAgIGlmIChuZXcgUmVnRXhwKFwiKFwiICsgayArIFwiKVwiKS50ZXN0KGZtdCkpIGZtdCA9IGZtdC5yZXBsYWNlKFJlZ0V4cC4kMSwgKFJlZ0V4cC4kMS5sZW5ndGggPT0gMSkgPyAob1trXSkgOiAoKFwiMDBcIiArIG9ba10pLnN1YnN0cigoXCJcIiArIG9ba10pLmxlbmd0aCkpKTtcbiAgICAgICAgcmV0dXJuIGZtdDtcbiAgICB9LFxuICAgIFxufSk7XG4iLCJjYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICB0b3BTY29yZTogY2MuTGFiZWwsXG4gICAgICAgIGN1cnJlbnRTY29yZTogY2MuTGFiZWxcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8v6K+75Y+W5pyA6auY5YiG5ZKM6L+Z5qyh55qE5b6X5YiGXG4gICAgICAgIHZhciBfdG9wU2NvcmUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RvcFNjb3JlJyk7XG4gICAgICAgIHRoaXMudG9wU2NvcmUuc3RyaW5nID0gX3RvcFNjb3JlO1xuICAgICAgICB2YXIgX2N1cnJlbnRTY29yZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnY3VycmVudFNjb3JlJyk7XG4gICAgICAgIHRoaXMuY3VycmVudFNjb3JlLnN0cmluZyA9IF9jdXJyZW50U2NvcmU7XG4gICAgICAgIC8v5Y6G5Y+y5b6X5YiGXG4gICAgICAgIGNjLmRpcmVjdG9yLnByZWxvYWRTY2VuZSgnaGlzdG9yeVNjb3JlJyk7XG4gICAgfSxcbiAgICAvL+a4uOaIj+mHjeaWsOi/kOihjFxuICAgIGdhbWVSZXN0YXJ0OiBmdW5jdGlvbigpeyBcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdtYWluJyk7XG4gICAgICAgIC8vY2MuZGlyZWN0b3IucmVzdW1lKCk7XG4gICAgfSxcbiAgICAvLyDpgIDlh7rmuLjmiI9cbiAgICBnYW1lRXhpdDogZnVuY3Rpb24oKXtcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdzdGFydCcpO1xuICAgIH0sXG4gICAgLy/ljoblj7LlvpfliIZcbiAgICBnb3RvSGlzdG9yeVNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdoaXN0b3J5U2NvcmUnKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbn0pO1xuIiwiXG4vL+aVjOacuue7hFxudmFyIGVuZW15RyA9IGNjLkNsYXNzKHtcbiAgICBuYW1lOidlbmVteUcnLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbmFtZTonJyxcbiAgICAgICAgZnJlcVRpbWU6MCxcbiAgICAgICAgaW5pdFBvbGxDb3VudDowLFxuICAgICAgICBwcmVmYWI6Y2MuUHJlZmFiXG4gICAgfVxufSk7XG5cbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOigpPT4oe1xuICAgICAgICBlbmVteUc6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6W10sXG4gICAgICAgICAgICB0eXBlOiBlbmVteUdcbiAgICAgICAgfSxcbiAgICAgICAgbWFpbjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IHJlcXVpcmUoJ21haW4nKSxcbiAgICAgICAgfSxcbiAgICB9KSxcbiAgICBcbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHsgXG4gICAgICAgIC8v5Yid5aeL5YyW5pWM5py657uEXG4gICAgICAgIHRoaXMuZVN0YXRlID0gRC5jb21tb25JbmZvLmdhbWVTdGF0ZS5ub25lO1xuICAgICAgICBELmNvbW1vbi5iYXRjaEluaXRPYmpQb29sKHRoaXMsdGhpcy5lbmVteUcpO1xuICAgIH0sXG4gICAgc3RhcnRBY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmVTdGF0ZSA9IEQuY29tbW9uSW5mby5nYW1lU3RhdGUuc3RhcnQ7XG4gICAgICAgIC8v5a6a5pe255Sf5oiQ5pWM5py6XG4gICAgICAgIGZvciAodmFyIGVpPTA7IGVpPCB0aGlzLmVuZW15Ry5sZW5ndGg7ICsrZWkpe1xuICAgICAgICAgICAgdmFyIGZyZXFUaW1lID0gdGhpcy5lbmVteUdbZWldLmZyZXFUaW1lO1xuICAgICAgICAgICAgdmFyIGZOYW1lID0gJ2NhbGxiYWNrXycrZWk7XG4gICAgICAgICAgICB0aGlzW2ZOYW1lXSA9IGZ1bmN0aW9uKGUpeyB0aGlzLmdldE5ld0VuZW15KHRoaXMuZW5lbXlHW2VdKTsgfS5iaW5kKHRoaXMsIGVpKTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGUodGhpc1tmTmFtZV0sIGZyZXFUaW1lKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/ph43mlrDlvIDlp4tcbiAgICByZXN1bWVBY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZVN0YXRlID0gRC5jb21tb25JbmZvLmdhbWVTdGF0ZS5zdGFydDtcbiAgICB9LFxuICAgIC8v5pqC5YGcXG4gICAgcGF1c2VBY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVTdGF0ZSA9IEQuY29tbW9uSW5mby5nYW1lU3RhdGUucGF1c2U7XG4gICAgICAgIFxuICAgIH0sXG4gICAgLy/nlJ/miJDmlYzmnLpcbiAgICBnZXROZXdFbmVteTogZnVuY3Rpb24oZW5lbXlJbmZvKSB7XG4gICAgICAgIHZhciBwb29sTmFtZSA9IGVuZW15SW5mby5uYW1lICsgJ1Bvb2wnO1xuICAgICAgICB2YXIgbmV3Tm9kZSA9IEQuY29tbW9uLmdlbk5ld05vZGUodGhpc1twb29sTmFtZV0sZW5lbXlJbmZvLnByZWZhYix0aGlzLm5vZGUpO1xuICAgICAgICB2YXIgbmV3VjIgPSB0aGlzLmdldE5ld0VuZW15UG9zaXRvbihuZXdOb2RlKTtcbiAgICAgICAgbmV3Tm9kZS5zZXRQb3NpdGlvbihuZXdWMik7XG4gICAgICAgIG5ld05vZGUuZ2V0Q29tcG9uZW50KCdlbmVteScpLmluaXQoKTtcbiAgICB9LFxuICAgIC8v5pWM5py66ZqP5py655Sf5oiQ55qE5L2N572uXG4gICAgZ2V0TmV3RW5lbXlQb3NpdG9uOiBmdW5jdGlvbihuZXdFbmVteSkge1xuICAgICAgICAvL+S9jeS6juS4iuaWue+8jOWFiOS4jeWPr+ingVxuICAgICAgICB2YXIgcmFuZHggPSBjYy5yYW5kb21NaW51czFUbzEoKSoodGhpcy5ub2RlLnBhcmVudC53aWR0aC8yLW5ld0VuZW15LndpZHRoLzIpO1xuICAgICAgICB2YXIgcmFuZHkgPSB0aGlzLm5vZGUucGFyZW50LmhlaWdodC8yK25ld0VuZW15LmhlaWdodC8yO1xuICAgICAgICByZXR1cm4gY2MudjIocmFuZHgscmFuZHkpO1xuICAgIH0sXG4gICAgZW5lbXlEaWVkOiBmdW5jdGlvbihub2RlaW5mbyxzY29yZSl7XG4gICAgICAgIC8v5Zue5pS26IqC54K5XG4gICAgICAgIEQuY29tbW9uLmJhY2tPYmpQb29sKHRoaXMsbm9kZWluZm8pO1xuICAgICAgICAvL+WinuWKoOWIhuaVsFxuICAgICAgICBpZiAocGFyc2VJbnQoc2NvcmUpPjApe1xuICAgICAgICAgICAgdGhpcy5tYWluLmdhaW5TY29yZShzY29yZSk7XG4gICAgICAgIH0gIFxuICAgIH0sXG4gICAgZ2V0U2NvcmU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm1haW4uZ2V0U2NvcmUoKTtcbiAgICB9LFxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgLy91cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICBcbiAgICAvL30sXG4gICAgXG59KTtcbiIsImNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHhNaW5TcGVlZDoge1xuICAgICAgICAgICAgZGVmYXVsdDowLFxuICAgICAgICAgICAgdHlwZTpjYy5JbnRlZ2VyLFxuICAgICAgICAgICAgdG9vbHRpcDogJ3jovbTmnIDlsI/pgJ/luqYnLFxuICAgICAgICB9LFxuICAgICAgICB4TWF4U3BlZWQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6MCxcbiAgICAgICAgICAgIHR5cGU6Y2MuSW50ZWdlcixcbiAgICAgICAgICAgIHRvb2x0aXA6ICd46L205pyA5aSn6YCf5bqmJyxcbiAgICAgICAgfSxcbiAgICAgICAgeU1pblNwZWVkOiB7XG4gICAgICAgICAgICBkZWZhdWx0OjAsXG4gICAgICAgICAgICB0eXBlOmNjLkludGVnZXIsXG4gICAgICAgICAgICB0b29sdGlwOiAneei9tOacgOWwj+mAn+W6picsXG4gICAgICAgIH0sXG4gICAgICAgIHlNYXhTcGVlZDogeyBcbiAgICAgICAgICAgIGRlZmF1bHQ6MCxcbiAgICAgICAgICAgIHR5cGU6Y2MuSW50ZWdlcixcbiAgICAgICAgICAgIHRvb2x0aXA6ICd56L205pyA5aSn6YCf5bqmJyxcbiAgICAgICAgfSxcbiAgICAgICAgaW5pdEhQOiB7XG4gICAgICAgICAgICBkZWZhdWx0OjAsXG4gICAgICAgICAgICB0eXBlOmNjLkludGVnZXIsXG4gICAgICAgICAgICB0b29sdGlwOiAn5Yid5aeL55Sf5ZG95YC8JyxcbiAgICAgICAgfSwgXG4gICAgICAgIGluaXRTcHJpdGVGcmFtZTp7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuU3ByaXRlRnJhbWUsXG4gICAgICAgICAgICB0b29sdGlwOiAn5Yid5aeL5YyW55qE5Zu+5YOPJ1xuICAgICAgICB9LCBcbiAgICAgICAgc2NvcmU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6MCxcbiAgICAgICAgICAgIHR5cGU6Y2MuSW50ZWdlcixcbiAgICAgICAgICAgIHRvb2x0aXA6ICfmrbvlkI7ojrflvpfnmoTliIbmlbAnXG5cbiAgICAgICAgfSxcbiAgICAgICAgZW5lbXlEb3duQ2xpcDogY2MuQXVkaW9DbGlwXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnZW5lbXkgb25sb2FkJyk7XG4gICAgICAgIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkPXRydWU7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnhTcGVlZCA9IE1hdGgucmFuZG9tKCkqKHRoaXMueE1heFNwZWVkLXRoaXMueE1pblNwZWVkKSArIHRoaXMueE1pblNwZWVkO1xuICAgICAgICB0aGlzLnlTcGVlZCA9IGNjLnJhbmRvbTBUbzEoKSoodGhpcy55TWF4U3BlZWQtdGhpcy55TWluU3BlZWQpICsgdGhpcy55TWluU3BlZWQ7XG4gICAgICAgIHRoaXMuZW5lbXlHcm91cCA9IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KCdlbmVteUdyb3VwJyk7XG4gICAgICAgIFxuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24oKXtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm5vZGUuZ3JvdXAgIT0gJ2VuZW15Jyl7XG4gICAgICAgICAgICB0aGlzLm5vZGUuZ3JvdXAgPSAnZW5lbXknO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmhQICE9IHRoaXMuaW5pdEhQKXtcbiAgICAgICAgICAgIHRoaXMuaFAgPSB0aGlzLmluaXRIUDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgblNwcml0ZSA9IHRoaXMubm9kZS5nZXRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgaWYgKG5TcHJpdGUuc3ByaXRlRnJhbWUgIT0gdGhpcy5pbml0U3ByaXRlRnJhbWUpe1xuICAgICAgICAgICAgblNwcml0ZS5zcHJpdGVGcmFtZSA9IHRoaXMuaW5pdFNwcml0ZUZyYW1lO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICBpZiAodGhpcy5lbmVteUdyb3VwLmVTdGF0ZSAhPSBELmNvbW1vbkluZm8uZ2FtZVN0YXRlLnN0YXJ0KXtcbiAgICAgICAgICAgIHJldHVybiA7XG4gICAgICAgIH1cbiAgICAgICAgLy/liIbmlbDkuI3lkIwg6YCf5bqm5LiN5ZCMXG4gICAgICAgIHZhciBzY29yZXMgPSB0aGlzLmVuZW15R3JvdXAuZ2V0U2NvcmUoKTtcbiAgICAgICAgaWYoc2NvcmVzPD01MDAwMCl7XG4gICAgICAgICAgICB0aGlzLm5vZGUueSArPSBkdCp0aGlzLnlTcGVlZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHNjb3Jlcz41MDAwMCYmc2NvcmVzPD0xMDAwMDApe1xuICAgICAgICAgICAgdGhpcy5ub2RlLnkgKz0gZHQqdGhpcy55U3BlZWQtMC41O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoc2NvcmVzPjEwMDAwMCYmc2NvcmVzPD0xNTAwMDApe1xuICAgICAgICAgICAgdGhpcy5ub2RlLnkgKz0gZHQqdGhpcy55U3BlZWQtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHNjb3Jlcz4xNTAwMDAmJnNjb3Jlczw9MjAwMDAwKXtcbiAgICAgICAgICAgIHRoaXMubm9kZS55ICs9IGR0KnRoaXMueVNwZWVkLTEuNTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHNjb3Jlcz4yMDAwMDAmJnNjb3Jlczw9MzAwMDAwKXtcbiAgICAgICAgICAgIHRoaXMubm9kZS55ICs9IGR0KnRoaXMueVNwZWVkLTI7XG4gICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgIHRoaXMubm9kZS55ICs9IGR0KnRoaXMueVNwZWVkLTM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub2RlLnggKz0gZHQqdGhpcy54U3BlZWQ7XG4gICAgICAgIC8v5Ye65bGP5bmV5ZCOIOWbnuaUtuiKgueCuVxuICAgICAgICBpZiAodGhpcy5ub2RlLnkgPCAtdGhpcy5ub2RlLnBhcmVudC5oZWlnaHQvMil7XG4gICAgICAgICAgICB0aGlzLmVuZW15R3JvdXAuZW5lbXlEaWVkKHRoaXMubm9kZSwwKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/norDmkp7mo4DmtYtcbiAgICBvbkNvbGxpc2lvbkVudGVyOiBmdW5jdGlvbihvdGhlcixzZWxmKXtcbiAgICAgICAgaWYgKG90aGVyLm5vZGUuZ3JvdXAgIT0gJ2J1bGxldCcpe1xuICAgICAgICAgICAgcmV0dXJuIDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYnVsbGV0ID0gb3RoZXIubm9kZS5nZXRDb21wb25lbnQoJ2J1bGxldCcpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuaFA+MCl7Ly/pmLLmraLlho3mrKHnorDmkp5cbiAgICAgICAgICAgIHRoaXMuaFAgLT0gYnVsbGV0LmhwRHJvcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaFAgPD0gMCl7XG4gICAgICAgICAgICB0aGlzLm5vZGUuZ3JvdXAgPSAnZGVmYXVsdCc7IC8v5LiN6K6p5Yqo55S75Zyo5omn6KGM56Kw5pKeXG4gICAgICAgICAgICAvL+aSreaUvuWKqOeUu1xuICAgICAgICAgICAgdmFyIGFuaW0gPSB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pO1xuICAgICAgICAgICAgdmFyIGFuaW1OYW1lID0gc2VsZi5ub2RlLm5hbWUgKyAnYW5pJztcbiAgICAgICAgICAgIGFuaW0ucGxheShhbmltTmFtZSk7XG4gICAgICAgICAgICBhbmltLm9uKCdmaW5pc2hlZCcsICB0aGlzLm9uRmluaXNoZWQsIHRoaXMpO1xuICAgICAgICAgICAgLy/mkq3mlL7pn7PmlYhcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5lbmVteURvd25DbGlwLCBmYWxzZSk7ICBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/liqjnlLvnu5PmnZ/lkI4g5Yqo55S76IqC54K55Zue5pS2XG4gICAgb25GaW5pc2hlZDogZnVuY3Rpb24oZXZlbnQpIHsgXG4gICAgICAgIHRoaXMuZW5lbXlHcm91cC5lbmVteURpZWQodGhpcy5ub2RlLCB0aGlzLnNjb3JlKTtcbiAgICB9LFxuICAgIFxufSk7XG4iLCIvLyBkZWNsYXJlIGdsb2JhbCB2YXJpYWJsZSBcIkRcIlxud2luZG93LkQgPSB7XG4gICAgLy8gc2luZ2xldG9uc1xuICAgIGNvbW1vbjogbnVsbCwgLy/lhazlhbHmlrnms5VcbiAgICBjb21tb25JbmZvOiBudWxsLCAvL+WumuS5ieeahOS4gOS6m+W4uOmHj1xufTsiLCJcbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOigpPT4gKHtcbiAgICAgICAgYmxvd3VwYW5pOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTpjYy5QcmVmYWIsXG4gICAgICAgICAgICB0b29sdGlwOiAn54iG54K45Yqo55S7JyxcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGdhbWVPdmVyQ2xpcDogY2MuQXVkaW9DbGlwLFxuICAgICAgICBtYWluOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogcmVxdWlyZSgnbWFpbicpLFxuICAgICAgICB9LFxuICAgICAgICBidWxsZXRHcm91cDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IHJlcXVpcmUoJ2J1bGxldEdyb3VwJyksXG4gICAgICAgIH1cbiAgICB9KSxcbiAgICBcbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lU3RhdGUgPSBELmNvbW1vbkluZm8uZ2FtZVN0YXRlLm5vbmU7XG4gICAgICAgIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkPXRydWU7XG4gICAgICAgIHRoaXMub25EcmFnKCk7XG4gICAgICAgIFxuICAgIH0sXG5cbiAgICAvL+a3u+WKoOaLluWKqOebkeWQrFxuICAgIG9uRHJhZzogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5ub2RlLm9uKCd0b3VjaG1vdmUnLCB0aGlzLmRyYWdNb3ZlLCB0aGlzKTtcbiAgICB9LFxuICAgIC8v5Y675o6J5ouW5Yqo55uR5ZCsXG4gICAgb2ZmRHJhZzogZnVuY3Rpb24oKXsgXG4gICAgICAgICB0aGlzLm5vZGUub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLmRyYWdNb3ZlLCB0aGlzKTtcbiAgICB9LFxuICAgIC8v5ouW5YqoXG4gICAgZHJhZ01vdmU6IGZ1bmN0aW9uKGV2ZW50KXsgXG4gICAgICAgIHZhciBsb2NhdGlvbnYgPSBldmVudC5nZXRMb2NhdGlvbigpO1xuICAgICAgICB2YXIgbG9jYXRpb24gPSB0aGlzLm5vZGUucGFyZW50LmNvbnZlcnRUb05vZGVTcGFjZUFSKGxvY2F0aW9udik7XG4gICAgICAgIC8v6aOe5py65LiN56e75Ye65bGP5bmVIFxuICAgICAgICB2YXIgbWluWCA9IC10aGlzLm5vZGUucGFyZW50LndpZHRoLzIrdGhpcy5ub2RlLndpZHRoLzI7XG4gICAgICAgIHZhciBtYXhYID0gLW1pblg7XG4gICAgICAgIHZhciBtaW5ZID0gLXRoaXMubm9kZS5wYXJlbnQuaGVpZ2h0LzIrdGhpcy5ub2RlLmhlaWdodC8yO1xuICAgICAgICB2YXIgbWF4WSA9IC1taW5ZO1xuICAgICAgICBpZiAobG9jYXRpb24ueDwgbWluWCl7XG4gICAgICAgICAgICBsb2NhdGlvbi54ID0gbWluWDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG9jYXRpb24ueD5tYXhYKXtcbiAgICAgICAgICAgIGxvY2F0aW9uLnggPSBtYXhYO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2NhdGlvbi55PCBtaW5ZKXtcbiAgICAgICAgICAgIGxvY2F0aW9uLnkgPSBtaW5ZO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2NhdGlvbi55PiBtYXhZKXtcbiAgICAgICAgICAgIGxvY2F0aW9uLnkgPSBtYXhZO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubm9kZS5zZXRQb3NpdGlvbihsb2NhdGlvbik7XG4gICAgfSxcbiAgICAvL+eisOaSnuebkea1i1xuICAgIG9uQ29sbGlzaW9uRW50ZXI6IGZ1bmN0aW9uKG90aGVyLHNlbGYpIHtcbiAgICAgICAgaWYgKG90aGVyLm5vZGUuZ3JvdXAgPT0gJ3Vmbycpe1xuICAgICAgICAgICAgaWYgKG90aGVyLm5vZGUubmFtZSA9PSAndWZvQnVsbGV0Jyl7XG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRHcm91cC5jaGFuZ2VCdWxsZXQob3RoZXIubm9kZS5uYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3RoZXIubm9kZS5uYW1lID09ICd1Zm9Cb21iJyl7XG4gICAgICAgICAgICAgICAgdGhpcy5tYWluLmdldFVmb0JvbWIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvdGhlci5ub2RlLmdyb3VwID09ICdlbmVteScpe1xuICAgICAgICAgICAgLy/mkq3mlL7liqjnlLtcbiAgICAgICAgICAgIHZhciBwbyA9IHRoaXMubm9kZS5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgdmFyIGJsb3d1cCA9IGNjLmluc3RhbnRpYXRlKHRoaXMuYmxvd3VwYW5pKTtcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnQuYWRkQ2hpbGQoYmxvd3VwKTtcbiAgICAgICAgICAgIGJsb3d1cC5zZXRQb3NpdGlvbihwbyk7XG4gICAgICAgICAgICB2YXIgYW5pbWF0aW9uID0gYmxvd3VwLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pO1xuICAgICAgICAgICAgYW5pbWF0aW9uLm9uKCdmaW5pc2hlZCcsICB0aGlzLm9uRmluaXNoZWQsIGJsb3d1cCk7XG4gICAgICAgICAgICAvL+aSreaUvumfs+aViFxuICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLmdhbWVPdmVyQ2xpcCwgZmFsc2UpO1xuICAgICAgICAgICAgLy/muIXpmaToioLngrlcbiAgICAgICAgICAgIHRoaXMubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAvL+abtOaWsOWIhuaVsCBcbiAgICAgICAgICAgIHRoaXMubWFpbi5nYW1lT3ZlcigpOyAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG4gICAgXG4gICAgb25GaW5pc2hlZDogZnVuY3Rpb24oZXZlbnQpIHsgLy/liqjnlLvnu5PmnZ/lkI5cbiAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICAgIC8vY2MuZGlyZWN0b3IucGF1c2UoKTtcbiAgICAgICAgXG4gICAgfSxcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxufSk7XG4iLCJjYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBpdGVtUHJlZmFiOiBjYy5QcmVmYWIsXG4gICAgICAgIHNjcm9sbENvbnRlbnQ6IGNjLk5vZGUsXG4gICAgICAgIGJhY2tHYW1lOiBjYy5Ob2RlXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW5mb0RhdGEgPSBKU09OLnBhcnNlKGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc2NvcmUnKSk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZm9EYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpdGVtID0gY2MuaW5zdGFudGlhdGUodGhpcy5pdGVtUHJlZmFiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGRhdGEgPSBpbmZvRGF0YVtpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zY3JvbGxDb250ZW50LmFkZENoaWxkKGl0ZW0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpdGVtLmdldENvbXBvbmVudCgnc2NvcmVJdGVtVGVtcGxhdGUnKS5pbml0KHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzY29yZTogZGF0YS5zY29yZSxcbiAgICAgICAgICAgICAgICB0aW1lOiBkYXRhLnRpbWUsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJhY2tHYW1lLm9uKCd0b3VjaHN0YXJ0Jyx0aGlzLmJhY2tHYW1lTyx0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH0sXG4gICAgYmFja0dhbWVPOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdlbmQnKTtcbiAgICB9XG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxufSk7XG4iLCJcbmNjLkNsYXNzKHtcbiAgICBcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOigpPT4oe1xuICAgICAgICBwYXVzZTogY2MuQnV0dG9uLFxuICAgICAgICBidG5TcHJpdGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgICAgICAgdHlwZTogY2MuU3ByaXRlRnJhbWUsXG4gICAgICAgICAgICB0b29sdGlwOifmmoLlgZzmjInpkq7kuI3lkIznirbmgIHnmoTlm77niYcnLFxuICAgICAgICB9LFxuICAgICAgICBib21iOiBjYy5Ob2RlLFxuICAgICAgICBnYW1lTXVzaWM6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5BdWRpb1NvdXJjZVxuICAgICAgICB9LFxuICAgICAgICB1c2VCb21iQ2xpcDogY2MuQXVkaW9DbGlwLFxuICAgICAgICBlbmVteUdyb3VwOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogcmVxdWlyZSgnZW5lbXlHcm91cCcpLFxuICAgICAgICB9LFxuICAgICAgICBoZXJvOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogcmVxdWlyZSgnaGVybycpLFxuICAgICAgICB9LCBcbiAgICAgICAgdWZvR3JvdXA6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiByZXF1aXJlKCd1Zm9Hcm91cCcpLFxuICAgICAgICB9LFxuICAgICAgICBidWxsZXRHcm91cDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IHJlcXVpcmUoJ2J1bGxldEdyb3VwJyksXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3JlRGlzcGxheTpjYy5MYWJlbCxcbiAgICAgICAgYm9tYk5vRGlzcGxheTpjYy5MYWJlbCxcbiAgICB9KSxcbiAgICBcbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICB0aGlzLmJvbWJObyA9IDA7XG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9IHRoaXMuc2NvcmU7XG4gICAgICAgIHRoaXMuYm9tYk5vRGlzcGxheS5zdHJpbmcgPSB0aGlzLmJvbWJObztcbiAgICAgICAgdGhpcy5lU3RhdGUgPSBELmNvbW1vbkluZm8uZ2FtZVN0YXRlLnN0YXJ0O1xuXG4gICAgICAgIHRoaXMuZW5lbXlHcm91cC5zdGFydEFjdGlvbigpO1xuICAgICAgICB0aGlzLmJ1bGxldEdyb3VwLnN0YXJ0QWN0aW9uKCk7XG4gICAgICAgIHRoaXMudWZvR3JvdXAuc3RhcnRBY3Rpb24oKTtcbiAgICAgICAgdGhpcy5ib21iLm9uKCd0b3VjaHN0YXJ0Jyx0aGlzLmJvbWJPbmNsaWNrLHRoaXMpO1xuICAgICAgICB0aGlzLmdhbWVNdXNpYy5wbGF5KCk7XG4gICAgfSxcbiAgICBcbiAgICBib21iT25jbGljazogZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGJvbWJOb0xhYmVsID0gdGhpcy5ib21iLmdldENoaWxkQnlOYW1lKCdib21iTm8nKS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICB2YXIgYm9tYk5vID0gcGFyc2VJbnQoYm9tYk5vTGFiZWwuc3RyaW5nKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChib21iTm8+MCl7XG4gICAgICAgICAgICBib21iTm9MYWJlbC5zdHJpbmcgPSBib21iTm8tMTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRW5lbXkoKTtcbiAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy51c2VCb21iQ2xpcCwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+ayoeacieWtkOW8uScpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgXG4gICAgLy99LFxuICAgIFxuICAgIC8v5pqC5YGc5oyJ6ZKu54K55Ye75LqL5Lu2ICBcbiAgICBwYXVzZUNsaWNrOiBmdW5jdGlvbiAoKSB7Ly/mmoLlgZwg57un57utXG4gICAgXG4gICAgICAgIGlmKHRoaXMuZVN0YXRlID09IEQuY29tbW9uSW5mby5nYW1lU3RhdGUucGF1c2Upe1xuICAgICAgICAgICAgdGhpcy5yZXN1bWVBY3Rpb24oKTtcbiAgICAgICAgICAgIHRoaXMuZVN0YXRlID0gRC5jb21tb25JbmZvLmdhbWVTdGF0ZS5zdGFydDtcbiAgICAgICAgfSBlbHNlIGlmKHRoaXMuZVN0YXRlID09IEQuY29tbW9uSW5mby5nYW1lU3RhdGUuc3RhcnQpIHtcbiAgICAgICAgICAgIHRoaXMucGF1c2VBY3Rpb24oKTtcbiAgICAgICAgICAgIHRoaXMuZVN0YXRlID0gRC5jb21tb25JbmZvLmdhbWVTdGF0ZS5wYXVzZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/muLjmiI/nu6fnu61cbiAgICByZXN1bWVBY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZW5lbXlHcm91cC5yZXN1bWVBY3Rpb24oKTtcbiAgICAgICAgdGhpcy5idWxsZXRHcm91cC5yZXN1bWVBY3Rpb24oKTtcbiAgICAgICAgdGhpcy51Zm9Hcm91cC5yZXN1bWVBY3Rpb24oKTtcbiAgICAgICAgdGhpcy5oZXJvLm9uRHJhZygpO1xuICAgICAgICB0aGlzLmdhbWVNdXNpYy5yZXN1bWUoKTtcbiAgICAgICAgdGhpcy5wYXVzZS5ub3JtYWxTcHJpdGUgPSB0aGlzLmJ0blNwcml0ZVswXTtcbiAgICAgICAgdGhpcy5wYXVzZS5wcmVzc2VkU3ByaXRlID0gdGhpcy5idG5TcHJpdGVbMV07XG4gICAgICAgIHRoaXMucGF1c2UuaG92ZXJTcHJpdGUgPSB0aGlzLmJ0blNwcml0ZVsxXTtcbiAgICB9LFxuICAgIC8v5ri45oiP5pqC5YGcXG4gICAgcGF1c2VBY3Rpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZW5lbXlHcm91cC5wYXVzZUFjdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5idWxsZXRHcm91cC5wYXVzZUFjdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5oZXJvLm9mZkRyYWcoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZU11c2ljLnBhdXNlKCk7XG4gICAgICAgICAgICB0aGlzLnVmb0dyb3VwLnBhdXNlQWN0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLnBhdXNlLm5vcm1hbFNwcml0ZSA9IHRoaXMuYnRuU3ByaXRlWzJdO1xuICAgICAgICAgICAgdGhpcy5wYXVzZS5wcmVzc2VkU3ByaXRlID0gdGhpcy5idG5TcHJpdGVbM107XG4gICAgICAgICAgICB0aGlzLnBhdXNlLmhvdmVyU3ByaXRlID0gdGhpcy5idG5TcHJpdGVbM107XG4gICAgICAgICAgICBcbiAgICB9LFxuICAgIC8v5aKe5Yqg5YiG5pWwXG4gICAgZ2FpblNjb3JlOiBmdW5jdGlvbiAoc2NvcmVubykge1xuICAgICAgICB0aGlzLnNjb3JlICs9IHNjb3Jlbm87XG4gICAgICAgIC8v5pu05pawIHNjb3JlRGlzcGxheSBMYWJlbCDnmoTmloflrZdcbiAgICAgICAgdGhpcy5zY29yZURpc3BsYXkuc3RyaW5nID0gdGhpcy5zY29yZS50b1N0cmluZygpO1xuICAgIH0sXG4gICAgLy9nZXTliIbmlbBcbiAgICBnZXRTY29yZTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyk7XG4gICAgfSxcbiAgICAvL+WIhuaVsOWGmeWIsOacrOWcsO+8iCDlvZPliY3liIYg5pyA6auY5YiGIOWOhuWPsuiusOW9le+8iVxuICAgIHVwZGF0ZVNjb3JlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRTY29yZSA9IHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZztcbiAgICAgICAgdmFyIHNjb3JlRGF0YSA9IHtcbiAgICAgICAgICAgICdzY29yZSc6Y3VycmVudFNjb3JlLFxuICAgICAgICAgICAgJ3RpbWUnOiBELmNvbW1vbi50aW1lRm10KG5ldyBEYXRlKCksJ3l5eXktTU0tZGQgaGg6bW06c3MnKSxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHByZURhdGEgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Njb3JlJyk7XG4gICAgICAgIHZhciBwcmVUb3BTY29yZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9wU2NvcmUnKTtcbiAgICAgICAgaWYgKCFwcmVUb3BTY29yZSB8fCBwYXJzZUludChwcmVUb3BTY29yZSkgPCBwYXJzZUludChjdXJyZW50U2NvcmUpKXtcbiAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b3BTY29yZScsIGN1cnJlbnRTY29yZSk7IFxuICAgICAgICB9XG4gICAgICAgIGlmKCFwcmVEYXRhKXtcbiAgICAgICAgICAgIHByZURhdGEgPSBbXTtcbiAgICAgICAgICAgIHByZURhdGEudW5zaGlmdChzY29yZURhdGEpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmVEYXRhID0gSlNPTi5wYXJzZShwcmVEYXRhKTtcblx0ICAgIGlmICghKHByZURhdGEgaW5zdGFuY2VvZiBBcnJheSkpe1xuICAgICAgICAgICAgICAgIHByZURhdGEgPSBbXTsgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmVEYXRhLnVuc2hpZnQoc2NvcmVEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2N1cnJlbnRTY29yZScsIGN1cnJlbnRTY29yZSk7XG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2NvcmUnLCBKU09OLnN0cmluZ2lmeShwcmVEYXRhKSk7XG4gICAgfSxcbiAgICAvL+eCuOW8uea4hemZpOaVjOaculxuICAgIHJlbW92ZUVuZW15OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbmVteUdyb3VwLm5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICB9LFxuICAgIC8v5o6l5Yiw54K45by5XG4gICAgZ2V0VWZvQm9tYjogZnVuY3Rpb24oKSB7IFxuICAgICAgICBpZiAocGFyc2VJbnQodGhpcy5ib21iTm9EaXNwbGF5LnN0cmluZyk8Myl7Ly/lpJrkuo7kuInkuKrngrjlvLnlsLHkuI3ntK/liqBcbiAgICAgICAgICAgIHRoaXMuYm9tYk5vRGlzcGxheS5zdHJpbmcgKz0gMTtcbiAgICAgICAgfSAgIFxuICAgIH0sXG4gICAgLy/muLjmiI/nu5PmnZ9cbiAgICBnYW1lT3ZlcjogZnVuY3Rpb24oKXsgXG4gICAgICAgIHRoaXMucGF1c2VBY3Rpb24oKTtcbiAgICAgICAgdGhpcy51cGRhdGVTY29yZSgpO1xuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ2VuZCcpO1xuICAgIH0sXG59KTtcbiIsImNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGl0ZW1TY29yZTogY2MuTGFiZWwsXG4gICAgICAgIGl0ZW1UaW1lOiBjYy5MYWJlbFxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB0aGlzLml0ZW1TY29yZS5zdHJpbmcgPSAn56ev5YiG77yaJyArIGRhdGEuc2NvcmU7XG4gICAgICAgIHRoaXMuaXRlbVRpbWUuc3RyaW5nID0gJ+aXtumXtO+8micgKyBkYXRhLnRpbWU7XG4gICAgfVxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbn0pO1xuIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgZ2FtZV9sb2FkaW5nOiBjYy5Ob2RlXG4gICAgfSxcbiAgICBcbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBnYW1lbG9hZGluZyA9IHRoaXMuZ2FtZV9sb2FkaW5nLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pO1xuICAgICAgICBnYW1lbG9hZGluZy5wbGF5KCk7XG4gICAgICAgIGNjLmRpcmVjdG9yLnByZWxvYWRTY2VuZSgnbWFpbicpO1xuICAgIH0sXG4gICAgXG4gICAgLy/lvIDlp4vmuLjmiI9cbiAgICBzdGFydEdhbWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSAoJ21haW4nLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbWFpbiBpcyBsb2FkZWQnKTtcbiAgICAgICAgfSkgXG4gICAgfSxcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWVcbiAgICAvL3VwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgLy99LFxufSk7XG4iLCJcbi8vdWZv57uEXG52YXIgdWZvRyA9IGNjLkNsYXNzKHtcbiAgICBuYW1lOid1Zm9HJywgXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBuYW1lOicnLFxuICAgICAgICBmcmVxVGltZTowLFxuICAgICAgICBwcmVmYWI6Y2MuUHJlZmFiLFxuICAgICAgICBpbml0UG9vbENvdW50OjAsXG4gICAgICAgIG1pbkRlbGF5OntcbiAgICAgICAgICAgIGRlZmF1bHQ6MCxcbiAgICAgICAgICAgIHRvb2x0aXA6ICfmnIDlsI/lu7bov58nLFxuICAgICAgICB9LFxuICAgICAgICBtYXhEZWxheTp7XG4gICAgICAgICAgICBkZWZhdWx0OjAsXG4gICAgICAgICAgICB0b29sdGlwOiAn5pyA5aSn5bu26L+fJyxcbiAgICAgICAgfSxcbiAgICB9XG59KTtcblxuY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdWZvRzoge1xuICAgICAgICAgICAgZGVmYXVsdDpbXSxcbiAgICAgICAgICAgIHR5cGU6IHVmb0dcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZVN0YXRlID0gRC5jb21tb25JbmZvLmdhbWVTdGF0ZS5ub25lO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMudWZvRyk7XG4gICAgICAgIEQuY29tbW9uLmJhdGNoSW5pdE9ialBvb2wodGhpcyx0aGlzLnVmb0cpOyAgICAgICAgXG4gICAgICAgIFxuICAgIH0sXG4gICAgc3RhcnRBY3Rpb24oKXtcbiAgICAgICAgLy8gdWZvIFxuICAgICAgICB0aGlzLmVTdGF0ZSA9IEQuY29tbW9uSW5mby5nYW1lU3RhdGUuc3RhcnQ7XG4gICAgICAgIC8v5a6a5pe255Sf5oiQ5pWM5py6XG4gICAgICAgIGZvciAodmFyIHVpPTA7IHVpPCB0aGlzLnVmb0cubGVuZ3RoOyArK3VpKXtcbiAgICAgICAgICAgIHZhciBmcmVxVGltZSA9IHRoaXMudWZvR1t1aV0uZnJlcVRpbWU7XG4gICAgICAgICAgICB2YXIgZk5hbWUgPSAnY2FsbGJhY2tfJyt1aTtcbiAgICAgICAgICAgIHRoaXNbZk5hbWVdID0gZnVuY3Rpb24oZSl7IHRoaXMucmFuZE5ld1Vmbyh0aGlzLnVmb0dbZV0pOyB9LmJpbmQodGhpcywgdWkpO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZSh0aGlzW2ZOYW1lXSwgZnJlcVRpbWUpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvL+maj+acuuaXtumXtOeUn+aIkOaVjOaculxuICAgIHJhbmROZXdVZm86IGZ1bmN0aW9uKHVmb0luZm8pe1xuICAgICAgICB2YXIgZGVsYXkgPSBNYXRoLnJhbmRvbSgpKih1Zm9JbmZvLm1heERlbGF5LXVmb0luZm8ubWluRGVsYXkpICsgdWZvSW5mby5taW5EZWxheTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oZSkge3RoaXMuZ2V0TmV3VWZvKGUpO30uYmluZCh0aGlzLCB1Zm9JbmZvKSwgZGVsYXkpO1xuICAgIH0sXG4gICAgLy/nlJ/miJDmlYzmnLpcbiAgICBnZXROZXdVZm86IGZ1bmN0aW9uKHVmb0luZm8pIHtcbiAgICAgICAgdmFyIHBvb2xOYW1lID0gdWZvSW5mby5uYW1lICsgJ1Bvb2wnO1xuICAgICAgICB2YXIgbmV3Tm9kZSA9IEQuY29tbW9uLmdlbk5ld05vZGUodGhpc1twb29sTmFtZV0sdWZvSW5mby5wcmVmYWIsdGhpcy5ub2RlKTtcbiAgICAgICAgdmFyIG5ld1YyID0gdGhpcy5nZXROZXdVZm9Qb3NpdG9uKG5ld05vZGUpO1xuICAgICAgICBuZXdOb2RlLnNldFBvc2l0aW9uKG5ld1YyKTtcbiAgICB9LFxuICAgIC8v5pWM5py66ZqP5py655Sf5oiQ55qE5L2N572uXG4gICAgZ2V0TmV3VWZvUG9zaXRvbjogZnVuY3Rpb24obmV3VWZvKSB7XG4gICAgICAgIC8v5L2N5LqO5LiK5pa577yM5YWI5LiN5Y+v6KeBXG4gICAgICAgIHZhciByYW5keCA9IGNjLnJhbmRvbU1pbnVzMVRvMSgpKih0aGlzLm5vZGUucGFyZW50LndpZHRoLzItbmV3VWZvLndpZHRoLzIpO1xuICAgICAgICB2YXIgcmFuZHkgPSB0aGlzLm5vZGUucGFyZW50LmhlaWdodC8yK25ld1Vmby5oZWlnaHQvMjtcbiAgICAgICAgcmV0dXJuIGNjLnYyKHJhbmR4LHJhbmR5KTtcbiAgICB9LFxuICAgIC8v6YeN5paw5byA5aeLXG4gICAgcmVzdW1lQWN0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmVTdGF0ZSA9IEQuY29tbW9uSW5mby5nYW1lU3RhdGUuc3RhcnQ7XG4gICAgfSxcbiAgICAvL+aaguWBnFxuICAgIHBhdXNlQWN0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lU3RhdGUgPSBELmNvbW1vbkluZm8uZ2FtZVN0YXRlLnBhdXNlO1xuICAgICAgICBcbiAgICB9LFxuICAgIHVmb0RpZWQ6IGZ1bmN0aW9uKG5vZGVpbmZvKXtcbiAgICAgICAgLy/lm57mlLboioLngrlcbiAgICAgICAgRC5jb21tb24uYmFja09ialBvb2wodGhpcyxub2RlaW5mbyk7XG4gICAgfSxcbn0pO1xuIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgeE1pblNwZWVkOiB7IC8veOi9tOacgOWwj+mAn+W6plxuICAgICAgICAgICAgZGVmYXVsdDowLFxuICAgICAgICAgICAgdHlwZTpjYy5JbnRlZ2VyXG4gICAgICAgIH0sXG4gICAgICAgIHhNYXhTcGVlZDogey8veOi9tOacgOWkp+mAn+W6plxuICAgICAgICAgICAgZGVmYXVsdDowLFxuICAgICAgICAgICAgdHlwZTpjYy5JbnRlZ2VyXG4gICAgICAgIH0sXG4gICAgICAgIHlNaW5TcGVlZDoge1xuICAgICAgICAgICAgZGVmYXVsdDowLFxuICAgICAgICAgICAgdHlwZTpjYy5JbnRlZ2VyXG4gICAgICAgIH0sLy956L205pyA5bCP6YCf5bqmXG4gICAgICAgIFxuICAgICAgICB5TWF4U3BlZWQ6IHsgLy956L205pyA5aSn6YCf5bqmXG4gICAgICAgICAgICBkZWZhdWx0OjAsXG4gICAgICAgICAgICB0eXBlOmNjLkludGVnZXJcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0VWZvQ2xpcDogY2MuQXVkaW9DbGlwLFxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2MuZGlyZWN0b3IuZ2V0Q29sbGlzaW9uTWFuYWdlcigpLmVuYWJsZWQ9dHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMueFNwZWVkID0gTWF0aC5yYW5kb20oKSoodGhpcy54TWF4U3BlZWQtdGhpcy54TWluU3BlZWQpICsgdGhpcy54TWluU3BlZWQ7XG4gICAgICAgIHRoaXMueVNwZWVkID0gY2MucmFuZG9tMFRvMSgpKih0aGlzLnlNYXhTcGVlZC10aGlzLnlNaW5TcGVlZCkgKyB0aGlzLnlNaW5TcGVlZDtcbiAgICAgICAgdGhpcy51Zm9Hcm91cCA9IHRoaXMubm9kZS5wYXJlbnQuZ2V0Q29tcG9uZW50KCd1Zm9Hcm91cCcpO1xuICAgIH0sXG5cbiAgICAvL+eisOaSnuajgOa1i1xuICAgIG9uQ29sbGlzaW9uRW50ZXI6IGZ1bmN0aW9uKG90aGVyLHNlbGYpe1xuICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xuICAgICAgICAvL0QuZ2FtZS51Zm9Cb21iKCk7XG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5nZXRVZm9DbGlwLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKHRoaXMudWZvR3JvdXAuZVN0YXRlICE9IEQuY29tbW9uSW5mby5nYW1lU3RhdGUuc3RhcnQpe1xuICAgICAgICAgICAgcmV0dXJuIDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vZGUueCArPSBkdCp0aGlzLnhTcGVlZDtcbiAgICAgICAgdGhpcy5ub2RlLnkgKz0gZHQqdGhpcy55U3BlZWQ7XG4gICAgICAgIC8v5Ye65bGP5bmV5ZCOXG4gICAgICAgIGlmICh0aGlzLm5vZGUueSA8IC10aGlzLm5vZGUucGFyZW50LmhlaWdodC8yKXtcbiAgICAgICAgICAgIHRoaXMudWZvR3JvdXAudWZvRGllZCh0aGlzLm5vZGUpO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==