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

    //冰数据数组
    this.binArray = [];
    //冰元素数组
    this.binStageArray = [];

    function gameBin() {
        var _this = this;
    }

    Laya.class(gameBin, "gameBin", Sprite);

    var _proto = gameBin.prototype;

    //初始化添加浮冰
    _proto.initBin = function(){
        var _this = this;
        console.log('init bin');

        //生成初始化浮冰数组
        var y = 0;
        for(var i=0; i<=4; i++){
            this.addBinToArray();
        }
        binArray.forEach(function(obj, index) {
            //初始化浮冰的间隔
            y += Math.round(pageHeight * 0.15);
            obj.y += y;
            //添加运动动画所需的Y轴补偿
            obj.y -= pageHeight*0.22;

            _this.addBinToStage(index);
            binStageArray[index].alpha = 0;
        }, this);

        //显示初始化后的浮冰
        Laya.timer.frameLoop(1, this, show_bin);
        function show_bin(){
            binStageArray.forEach(function(obj, index) {
                //初始化浮冰的间隔
                obj.alpha += 0.05;
                obj.y += pageHeight*0.0025;
            }, this);
            if(binStageArray[binStageArray.length-1].alpha >= 1){
                Laya.timer.clear(_this, show_bin);
            }
        }
    }

    //添加浮冰数据至数组
    _proto.addBinToArray = function(){
        var _this = this;
        binArray.push({
            //随机生成冰的位置水平
            x:randomNum(0, Math.round(pageWidth * 0.7)),
            y:0,
            scale:1
        });
    }

    //添加浮冰至场景
    _proto.addBinToStage = function(n){
        var _this = this;

        binStageArray[n] = new Sprite();
        binStageArray[n].pivotX = 0;
        binStageArray[n].pivotY = 0;
        binStageArray[n].loadImage("res/images/game_bin.png", binArray[n].x, binArray[n].y, pageWidth*0.3, (pageWidth*0.3)*(112/243));
        Laya.stage.addChild( binStageArray[n]);
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