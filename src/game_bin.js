//浮冰添加、运动、消除
(function(){
    var Sprite  = Laya.Sprite;
	var Stage   = Laya.Stage;
	var Texture = Laya.Texture;
	var Browser = Laya.Browser;
	var Handler = Laya.Handler;
	var WebGL   = Laya.WebGL;
    var Event   = Laya.Event;

    var pageWidth  = Browser.clientWidth;
    var pageHeight = Browser.clientHeight;

    function gameBin() {
        var _this = this;
    }

    Laya.class(gameBin, "gameBin", Sprite);

    var _proto = gameBin.prototype;

    //冰数据数组(目前仅首次生成浮冰时使用)
    _proto.binArray = [];
    //冰元素数组
    _proto.binStageArray = [];

    //初始化添加浮冰
    _proto.initBin = function(){
        var _this = this;
        console.log('init bin');

        //生成初始化浮冰数组
        var y = 0;
        for(var i=0; i<=4; i++){
            this.addBinToArray();
        }
        _this.binArray.forEach(function(obj, index) {
            //初始化浮冰的间隔
            y += Math.round(pageHeight * 0.15);
            obj.y += y;
            //添加运动动画所需的Y轴补偿
            obj.y -= Math.round(pageHeight*0.22);

            _this.addBinToStage(index);
            _this.binStageArray[index].alpha = 0;
        }, this);

        //显示初始化后的浮冰
        Laya.timer.frameLoop(1, this, show_bin);
        function show_bin(){
            _this.binStageArray.forEach(function(obj, index) {
                //初始化浮冰的间隔
                obj.alpha += 0.05;
                obj.y += Math.round(pageHeight*0.0025);
            }, this);
            if(_this.binStageArray[_this.binStageArray.length-1].alpha >= 1){
                Laya.timer.clear(_this, show_bin);
                //添加最初站立的浮冰（带圣诞树的）
                //用于后面拉屏使用
                _this.binStageArray.push(start_di);
                //用于后面的碰撞检测去除树
                start_tree.myName = 'tree';
                _this.binStageArray.push(start_tree);
            }
        }
    }

    //添加浮冰数据至数组
    _proto.addBinToArray = function(){
        var _this = this;
        _this.binArray.push({
            //随机生成冰的位置水平
            x:randomNum(0, Math.round(pageWidth * 0.7)),
            y:0,
            scale:1
        });
    }

    //添加浮冰至场景
    _proto.addBinToStage = function(n){
        var _this = this;

        _this.binStageArray[n] = new Sprite();
        _this.binStageArray[n].pivotX = 0;
        _this.binStageArray[n].pivotY = 0;
        _this.binStageArray[n].loadImage("res/images/game_bin.png", _this.binArray[n].x, _this.binArray[n].y, pageWidth*0.3, (pageWidth*0.3)*(112/243));
        Laya.stage.addChild(_this.binStageArray[n]);
    }

    //生成从minNum到maxNum的随机数
    function randomNum(minNum,maxNum){ 
        switch(arguments.length){ 
            case 1: 
                return parseInt(Math.random()*minNum+1,10); 
            break; 
            case 2: 
                return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
            break; 
                default: 
                    return 0; 
                break; 
        } 
    } 


})();