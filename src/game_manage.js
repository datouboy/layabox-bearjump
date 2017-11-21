//开始页面
(function(){
    var Sprite  = Laya.Sprite;
	var Stage   = Laya.Stage;
    var Text    = Laya.Text;
	var Texture = Laya.Texture;
	var Browser = Laya.Browser;
	var Handler = Laya.Handler;
	var WebGL   = Laya.WebGL;
    var Event   = Laya.Event;
    var Gyroscope    = Laya.Gyroscope;

    var pageWidth  = Browser.clientWidth;
    var pageHeight = Browser.clientHeight;

    var gameBins; //浮冰控制
    var firstJump = true;//是否起跳前

    function gameManage() {
        var _this = this;

        //初始化浮冰（浮冰添加、运动、消除）
        gameBins = new gameBin();
    }

    Laya.class(gameManage, "gameManage", Sprite);

    var _proto = gameManage.prototype;

    //初始化游戏
    _proto.initGame = function(){
        var _this = this;
        console.log('game Init');

        //加载游戏背景
        this.addGameBg();
        //加载初始化浮冰
        gameBins.initBin();
        //陀螺仪监听
        this.eventGyroscope();
        //加载一次性的屏幕点击事件，点击后北极熊起跳
        this.jumpStart();
    }

    //加载游戏背景
    _proto.addGameBg = function(){
        var _this = this;

        game_bg = new Sprite();
        game_bg.loadImage("res/images/game_bg.jpg", 0, 0, pageWidth, pageHeight);
        Laya.stage.addChild(game_bg);
        game_bg.alpha = 0;
        Laya.timer.frameLoop(1, this, game_bg_show);

        //背景运动状态
        var bgAnimateTrue = true;
        var bgAnimate = 1;

        //背景渐现
        function game_bg_show(){
            if(game_bg.alpha < 1){
                game_bg.alpha += 0.07;
            }else{
                Laya.timer.clear(_this, game_bg_show);
                Laya.timer.frameLoop(1, this, game_bg_animate);
            }
        }

        //背景微动
        function game_bg_animate(){
            if(bgAnimate <= 1){
                bgAnimateTrue = true;
            }else if(bgAnimate >= 1.04){
                bgAnimateTrue = false;
            }

            if(bgAnimateTrue){
                bgAnimate += 0.0002;
                game_bg.y -= 0.02;
            }else{
                bgAnimate -= 0.0002;
                game_bg.y += 0.02;
            }
            
            game_bg.scale(1,bgAnimate);
        }
    }

    //陀螺仪监听
    _proto.eventGyroscope = function(){
        var _this = this;
        
        testInfo = new Text();
        testInfo.fontSize = 12;
        testInfo.color = "#000000";
        testInfo.x = 10;
        testInfo.y = 10;
        Laya.stage.addChild(testInfo);

        window.addEventListener("deviceorientation", onOrientationChange, false);
    }
    //陀螺仪监听动作执行
    function onOrientationChange(event) {
        testInfo.text = 
        "alpha:" + Math.floor(event.alpha) + '\n' +//左右旋转
        "beta :" + Math.floor(event.beta) + '\n' +//前后旋转
        "gamma:" + Math.floor(event.gamma);//扭转设备

        _proto.bearXMove(event.alpha);
    }

    //北极熊X方向移动
    _proto.bearXMove = function(alpha){
        //tip_bear
        if(alpha >=0 && alpha <180){//向左倾斜
            var xAdd = -(alpha * 0.3);
        }else{//向右倾斜
            var xAdd = Math.abs(alpha-360) * 0.3;
        }

        //是否起跳前，起跳前只能在浮冰范围移动，起跳后可全屏移动
        if(firstJump){//起跳前
            //设置左右边界
            if(tip_bear.x <= pageWidth*0.25){
                if(xAdd < 0){
                    xAdd = 0;
                }
            }else if(tip_bear.x >= pageWidth*0.65){
                if(xAdd > 0){
                    xAdd = 0;
                }
            }
        }else{//起跳后
            //设置左右边界
            if(tip_bear.x <= 0){
                if(xAdd < 0){
                    xAdd = 0;
                }
            }else if(tip_bear.x >= pageWidth-(210*0.35)){
                if(xAdd > 0){
                    xAdd = 0;
                }
            }
        }
        tip_bear.x += xAdd;
    }

    //北极熊起跳监听事件
    _proto.jumpStart = function(){
        var _this = this;
        Laya.stage.once(Event.CLICK, this, bearJumpStart);
    }
    function bearJumpStart(){
        console.log(1);
    }


})();