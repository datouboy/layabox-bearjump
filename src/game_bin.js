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

    //添加浮冰至场景(首次)
    _proto.addBinToStage = function(n){
        var _this = this;

        _this.binStageArray[n] = new Sprite();
        _this.binStageArray[n].binType = getBinType();
        _this.binStageArray[n].pivotX = 0;
        _this.binStageArray[n].pivotY = 0;
        if(_this.binStageArray[n].binType == 'super_1'){
            _this.binStageArray[n].loadImage("res/images/game_bin2.png", _this.binArray[n].x, _this.binArray[n].y, pageWidth*0.3, (pageWidth*0.3)*(112/243));
        }else if(_this.binStageArray[n].binType == 'super_2'){
            _this.binStageArray[n].loadImage("res/images/game_bin3.png", _this.binArray[n].x, _this.binArray[n].y, pageWidth*0.3, (pageWidth*0.3)*(200/243));
        }else{
            _this.binStageArray[n].loadImage("res/images/game_bin.png", _this.binArray[n].x, _this.binArray[n].y, pageWidth*0.3, (pageWidth*0.3)*(112/243));
        }
        Laya.stage.addChild(_this.binStageArray[n]);
    }

    //游戏中添加浮冰
    _proto.addNewBin = function(JumpNum){
        var _this = this;
        //console.log('添加浮冰');
        var smallBin_Y = pageHeight;//获取最高浮冰的高度
        _this.binStageArray.forEach(function(obj, index) {
            var obj_y = obj.getBounds().y;
            if(obj_y < smallBin_Y){
                smallBin_Y = obj_y;
            }
        }, this);

        //最高浮冰的Y轴大于-100时，添加浮冰
        //添加浮冰的Y轴基数是Y轴位置最高的浮冰
        if(smallBin_Y > -300){
            //生成初始化浮冰数组
            _this.binArray = [];
            var y = 0;
            for(var i=0; i<=10; i++){
                _this.addBinToArray();
            }

            var n = _this.binStageArray.length;
            var jiange = Math.round(pageHeight * 0.15);//浮冰间隔
            var jiange_buchang = JumpNum * 3;//浮冰间隔补偿(每次跳跃后增加浮冰的间隔)
            jiange = jiange + jiange_buchang;
            _this.binArray.forEach(function(obj, index) {
                //初始化浮冰的间隔
                smallBin_Y = smallBin_Y - jiange;
                obj.y = smallBin_Y;
                var tn = n + index;
                _this.addBinToStageFun(tn, obj);
            }, this);
            //console.log(_this.binStageArray);
        }
    }

    //添加浮冰至场景
    _proto.addBinToStageFun = function(n, obj){
        var _this = this;

        _this.binStageArray[n] = new Sprite();
        _this.binStageArray[n].binType = getBinType();
        _this.binStageArray[n].pivotX = 0;
        _this.binStageArray[n].pivotY = 0;
        if(_this.binStageArray[n].binType == 'super_1'){
            _this.binStageArray[n].loadImage("res/images/game_bin2.png", obj.x, obj.y, pageWidth*0.3, (pageWidth*0.3)*(112/243));
        }else if(_this.binStageArray[n].binType == 'super_2'){
            _this.binStageArray[n].loadImage("res/images/game_bin3.png", obj.x, obj.y, pageWidth*0.3, (pageWidth*0.3)*(200/243));
        }else{
            _this.binStageArray[n].loadImage("res/images/game_bin.png", obj.x, obj.y, pageWidth*0.3, (pageWidth*0.3)*(112/243));
        }
        Laya.stage.addChild(_this.binStageArray[n]);
    }

    //添加终点浮冰至场景
    _proto.addEndBinToStage = function(){
        var _this = this;
        //alert('结束');
        var smallBin_Y = pageHeight;//获取最高浮冰的高度
        _this.binStageArray.forEach(function(obj, index) {
            var obj_y = obj.getBounds().y;
            if(obj_y < smallBin_Y){
                smallBin_Y = obj_y;
            }
        }, this);

        //console.log(smallBin_Y);

        var n = _this.binStageArray.length;
        _this.binStageArray[n] = new Sprite();
        _this.binStageArray[n].pivotX = 0;
        _this.binStageArray[n].pivotY = 0;//-(pageWidth*0.85)*(584/632);
        _this.binStageArray[n].loadImage("res/images/end_di.png", 0, smallBin_Y - (Math.round(pageHeight * 0.25)*2), pageWidth*0.85, (pageWidth*0.85)*(584/632));
        Laya.stage.addChild(_this.binStageArray[n]);
        _this.binStageArray[n].binType = 'default';
        _this.binStageArray[n].myName = 'end';
    }

    //随机输出浮冰的类型
    function getBinType(){
        var rNum = randomNum(0,8);
        if(rNum == 5){
            return 'super_1';//有可乐的浮冰1
        }else if(rNum == 4){
            return 'super_2';//有可乐的浮冰2
        }else{
            return 'default';//默认的浮冰
        }
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