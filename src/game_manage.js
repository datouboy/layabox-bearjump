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

    var pageWidth  = Browser.clientWidth;
    var pageHeight = Browser.clientHeight;

    var gameBins; //浮冰控制
    var firstJump = true;//是否起跳前
    var JumpUpLine   = Math.round(pageHeight * 0.4);//跳跃停止线（北极熊的脚部触线为准）
    var JumpUpHeight = Math.round(pageHeight * 0.5);//北极熊每次跳跃的高度
    var pageBinDown  = 0;//当北极熊的跳跃高度超过停止线时所需的屏幕浮冰下滑值（为了方便，下面叫拉屏）
    var Tween;//初始化自定义Tween算法
    var Tween_t = 0;//跳跃变化时间
    var Tween_d = 60;//跳跃持续时间
    var Tween_c = 0;//跳跃高度的变化量（每次需计算）
    var Bear_Y;//Tween起跳前记录北极熊的Y坐标
    var BinTempArray = [];//Tween冰运动前记录冰的Y坐标

    function gameManage() {
        var _this = this;

        //////////////////////////////////////////////////////////////////////////////
        //跳跃停止线：测试线
        test_sp = new Sprite();
        Laya.stage.addChild(test_sp);
        test_sp.graphics.drawLine(0, JumpUpLine, pageWidth, JumpUpLine, "#ff0000", 5);
        test_sp.zOrder = 9;
        //////////////////////////////////////////////////////////////////////////////

        //Tween自定义算法
        Tween = new tweenFun();
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
        
        //////////////////////////////////////////////////////////////////////////////
        //陀螺仪测试数据
        testInfo = new Text();
        testInfo.fontSize = 12;
        testInfo.color = "#000000";
        testInfo.x = 10;
        testInfo.y = 10;
        Laya.stage.addChild(testInfo);
        //////////////////////////////////////////////////////////////////////////////

        window.addEventListener("deviceorientation", onOrientationChange, false);
    }
    //陀螺仪监听动作执行
    function onOrientationChange(event) {
        //////////////////////////////////////////////////////////////////////////////
        //陀螺仪测试数据
        testInfo.text = 
        "alpha:" + Math.floor(event.alpha) + '\n' +//左右旋转
        "beta :" + Math.floor(event.beta) + '\n' +//前后旋转
        "gamma:" + Math.floor(event.gamma);//扭转设备
        //////////////////////////////////////////////////////////////////////////////

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

    //北极熊首次起跳监听事件
    _proto.jumpStart = function(){
        var _this = this;
        Laya.stage.once(Event.CLICK, this, bearJumpStart);
        function bearJumpStart(){
            firstJump = false;
            _proto.bearJump();
        }
    }

    //北极熊起跳
    /*
        北极熊起跳主要逻辑：
        说明：使用自定义Tween实现跳跃物理抛物线缓动模拟
        1：设置跳跃高度线，跳跃最高不会超过这条高度线
            1.1：未达到高度线的情况下正常跳
            1.2：超过高度线的情况下，执行拉屏
            1.3：起跳前需要先添加浮冰
                1.3.1：浮冰添加逻辑：
                       每次起跳前检查最高一块浮冰的Y轴位置，如果低于设定值，则一次性添加数块浮冰
        2：拉屏后执行逻辑：
            2.1：判断浮冰元素是否下方出界，出界的需要删除元素
        4：到达最高点后执行北极熊下落
            4.1：下落过程中执行碰撞检测，过程中未碰撞到达最低点则游戏失败
    */
    _proto.bearJump = function(){
        var _this = this;
        Bear_Y = tip_bear.y;
        console.log('北极熊起跳');
        //计算跳跃的变化量
        if(tip_bear.y - JumpUpLine >= JumpUpHeight){//未超过跳跃停止线
            Tween_c = JumpUpHeight;
            pageBinDown = 0;
        }else{//超过跳跃停止线
            Tween_c = tip_bear.y - JumpUpLine;
            //当北极熊的跳跃高度超过停止线时所需的屏幕浮冰下滑值
            pageBinDown = JumpUpHeight - (tip_bear.y - JumpUpLine);
            //冰进行Tween拉屏前记录冰的当前位置
            BinTempArray = [];
            gameBins.binStageArray.forEach(function(obj, index) {
                BinTempArray[index] = obj.y;
            }, this);
        }
        Laya.timer.frameLoop(1, this, bearJumpGo);
    }
    //北极熊跳跃动画
    function bearJumpGo(){
        Tween_t += 1;//时间变量，每次跳跃后需要清0
        var bearY = Tween.Cubic.easeOut(Tween_t, 0, Tween_c, Tween_d);
        tip_bear.y = Bear_Y - bearY;
        //同时执行拉屏
        binPageDown();
        if(Tween_t == Tween_d){
            Laya.timer.clear(this, bearJumpGo);
        }
    }
    //拉屏
    function binPageDown(){
        if(pageBinDown > 0){
            gameBins.binStageArray.forEach(function(obj, index) {
                var binY = Tween.Cubic.easeOut(Tween_t, 0, pageBinDown, Tween_d);
                gameBins.binStageArray[index].y = BinTempArray[index] + binY;
            }, this);
        }
    }

})();