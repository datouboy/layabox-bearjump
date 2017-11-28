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
    var MovingSpeed  = 0.3;//北极熊左右移动速度（越大越快）
    var JumpUpLine   = Math.round(pageHeight * 0.4);//跳跃停止线（北极熊的脚部触线为准）
    var JumpUpHeight = Math.round(pageHeight * 0.5);//北极熊每次跳跃的高度
    var pageBinDown  = 0;//当北极熊的跳跃高度超过停止线时所需的屏幕浮冰下滑值（为了方便，下面叫拉屏）
    var Tween;//初始化自定义Tween算法
    var Tween_t = 0;//跳跃变化时间
    var Tween_d = 40;//跳跃持续时间
    var Tween_c = 0;//跳跃高度的变化量（每次需计算）
    var Bear_Y;//Tween起跳前记录北极熊的Y坐标
    var BinTempArray = [];//Tween冰运动前记录冰的Y坐标
    //碰撞检测所需的参数
    var Bear_BoxInfo = {}//记录北极熊碰撞Box的信息
    var Bin_TempInfo = [];//记录拉屏后浮冰的X、Y轴位置信息

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
        //获取北极熊的参数
        Bear_BoxInfo.w = tipsPages.bearInfo.width * 0.4;
        Bear_BoxInfo.h = 30;
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

        //判断左右和扭转值，取大的值发送给北极熊移动
        if(event.alpha >=0 && event.alpha <180){//向左倾斜
            var alpha = event.alpha;
        }else{//向右倾斜
            var alpha = Math.abs(alpha-360);
        }
        var gamma = Math.abs(event.gamma);

        if(alpha >= gamma){
            _proto.bearXMove(event.alpha, 'alpha');
        }else{
            _proto.bearXMove(event.gamma, 'gamma');
        }

    }

    //北极熊X方向移动
    _proto.bearXMove = function(xMove, type){
        //tip_bear
        if(type == 'alpha'){
            if(xMove >=0 && xMove <180){//向左倾斜
                var xAdd = -(xMove * MovingSpeed);
            }else{//向右倾斜
                var xAdd = Math.abs(xMove-360) * MovingSpeed;
            }
        }else{
            var xAdd = xMove * MovingSpeed;
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
            _this.bearJump();
        }
    }

    //北极熊跳跃
    /*
        北极熊起跳主要逻辑：
        说明：使用自定义Tween实现跳跃物理抛物线缓动模拟
        1：设置跳跃高度线，跳跃最高不会超过这条高度线
            1.1：未达到高度线的情况下正常跳
            1.2：超过高度线的情况下，执行拉屏
            1.3：起跳前需要先添加浮冰
                1.3.1：浮冰添加逻辑：
                       每次起跳前检查最高一块浮冰的Y轴位置，如果低于设定值，则一次性添加数块浮冰
            1.4：起跳前初始化参数
        2：拉屏后执行逻辑：
            2.1：判断浮冰元素是否下方出界，出界的需要删除元素
        4：到达最高点后执行北极熊下落
            4.1：下落过程中执行碰撞检测，过程中未碰撞到达最低点则游戏失败
    */
    _proto.bearJump = function(){
        var _this = this;
        //添加浮冰
        gameBins.addNewBin();
        //初始化参数
        Bear_Y = tip_bear.y;
        Tween_t = 0;
        console.log('北极熊跳跃执行');
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
        Laya.timer.frameLoop(1, this, bearJumpGoUp);
    }
    //北极熊跳跃（跳起部分）
    function bearJumpGoUp(){
        Tween_t += 1;//时间变量，每次跳跃后需要清0
        var bearY = Tween.Quad.easeOut(Tween_t, 0, Tween_c, Tween_d);
        tip_bear.y = Bear_Y - bearY;
        //同时执行拉屏
        binPageDown();
        if(Tween_t == Tween_d){
            Laya.timer.clear(this, bearJumpGoUp);
            Tween_t = 0;
            //北极熊跳跃（下降部分）
            /*
                Tween动画前的数据准备
                1,计算北极熊下降所需的变化量
                2,北极熊的Y轴位置
            */
            Tween_c = pageHeight - tip_bear.y;
            Bear_Y = tip_bear.y;
            Laya.timer.frameLoop(1, this, bearJumpGoDown);

            //获取浮冰的位置信息（定位点位于浮冰左下角）
            /*
                不清楚为什么LyayBox这里直接获取元素的x和y轴的位置信息错误，需要用getBounds方法才能获取正确的值
            */
            Bin_TempInfo = [];
            gameBins.binStageArray.forEach(function(obj, index) {
                Bin_TempInfo[index] = obj.getBounds();
                Bin_TempInfo[index].y += Bin_TempInfo[index].height;
                //计算浮冰盒子大小（此处大小并非浮冰元素实际大小，是截取浮冰中间区域的大小，以实现在显示效果上，需要北极熊双脚踩到浮冰才行）
                //获取最终用于碰撞检测的盒子大小
                Bin_TempInfo[index].boxInfo = returnBearBoxInfo(Bin_TempInfo[index]);
            }, this);
        }

        //计算浮冰盒子大小（浮冰XY原点是左下角）
        function returnBearBoxInfo(obj){
            var binInfo = {}
            binInfo.w = obj.width * 0.6;
            binInfo.h = 35;
            binInfo.x = obj.x + (obj.width * 0.2);
            binInfo.y = obj.y - ((obj.height-35)/2);
            return binInfo;
        }
    }
    //拉屏
    function binPageDown(){
        //判断是否需要拉屏
        if(pageBinDown > 0){
            gameBins.binStageArray.forEach(function(obj, index) {
                var binY = Tween.Cubic.easeOut(Tween_t, 0, pageBinDown, Tween_d);
                gameBins.binStageArray[index].y = BinTempArray[index] + binY;
            }, this);
        }
    }
    //北极熊跳跃（下降部分）
    function bearJumpGoDown(){
        Tween_t += 1;//时间变量，每次跳跃后需要清0
        var bearY = Tween.Quad.easeIn(Tween_t, 0, Tween_c, Tween_d);
        tip_bear.y = Bear_Y + bearY;
        //下落时执行碰撞检测
        collisionDetection(this);
        if(Tween_t == Tween_d){
            Laya.timer.clear(this, bearJumpGoDown);
            Tween_t = 0;
            console.log('游戏失败');
        }
    }
    //北极熊碰撞检测
    /*
        设北极熊脚步区域为一个方盒子空间
        设每个浮冰的中间区域为一个方盒空间
        去掉高于脚部的浮冰
        循环检测方盒是否有重叠

        方盒重叠逻辑
        设A方盒 B方盒
        对比方盒的宽高，设置小方盒为B，大方盒为A
        只需要对比宽度即可
        B方盒4个角位置依次比对
        大于等于X小于、等于X+Width
        Y轴同理
    */
    function collisionDetection(_bearJumpGoDown_this){
        //性能优化、减少计算次数
        //if(Tween_t % 2 == 0){
        var collisionOK = false;
        gameBins.binStageArray.forEach(function(obj, index) {
            //剔除圣诞树
            if(!isExitsVariable(obj.myName)){
                //剔除高于北极熊脚步的浮冰
                if(Bin_TempInfo[index].boxInfo.y > tip_bear.y + Bear_BoxInfo.h){
                    //console.log('计算：');
                    //boxContrast(Bin_TempInfo[index].boxInfo, );
                    if(!collisionOK){
                        var collisionOK_c = collisionReturn(Bin_TempInfo[index].boxInfo, returnBearBox(tip_bear));
                        if(collisionOK_c){
                            collisionOK = true;
                        }
                    }
                }
            }
        }, this);
        if(collisionOK){
            console.log('检测到碰撞');
            //中断北极熊下落循环
            Laya.timer.clear(_bearJumpGoDown_this, bearJumpGoDown);
            Tween_t = 0;
            _proto.bearJump();
        }
        //}

        //碰撞比对，返回碰撞结果
        function collisionReturn(boxA, boxB){
            //对比方盒的宽高，返回的对象小方盒为boxB，大方盒为boxA
            var box = boxContrast(boxA, boxB);
            //触碰检测
            /*
                相当于判断B方盒4个直角点是否在A盒子的所在区域内
                B方盒4个角位置依次比对A方盒所在区域
                大于等于X小于、等于X+Width
                Y轴同理
            */
            //获取小盒子的4个直角位置的坐标点
            var spotArray = [];
            spotArray.push({x:box.boxB.x, y:box.boxB.y});
            spotArray.push({x:box.boxB.x + box.boxB.w, y:box.boxB.y});
            spotArray.push({x:box.boxB.x + box.boxB.w, y:box.boxB.y - box.boxB.h});
            spotArray.push({x:box.boxB.x, y:box.boxB.y - box.boxB.h});

            var returnVal = false;
            for(var i=0; i<=spotArray.length-1; i++){
                if(boxCollisionReturn(box.boxA, spotArray[i])){
                    returnVal = true;
                    break;
                }
            }
            return returnVal;

            //单个点的检测，检测点的XY坐标是否在盒子内
            function boxCollisionReturn(box, spot){
                ////////////////////////////////////////////////////////////////
                //测试轨迹显示
                //画矩形
                /*
                var qqsp = new Sprite();//冰
                Laya.stage.addChild(qqsp);
                qqsp.graphics.drawRect(box.x, box.y-box.h, box.w, box.h, "#ffff00");
                qqsp.zOrder = 10;

                var qqsp2 = new Sprite();//熊
                Laya.stage.addChild(qqsp2);
                qqsp2.graphics.drawRect(spot.x, spot.y, 5, 5, "#ff0000");
                qqsp2.zOrder = 11;
                */
                ///////////////////////////////////////////////////////////////
                
                if(spot.x >= box.x && spot.x <= box.x+box.w && box.y-box.h-5 <= spot.y && box.y >= spot.y){
                    return true;
                }else{
                    return false;
                }
            }
        }

        //对比方盒的宽高，设置小方盒为B，大方盒为A
        function boxContrast(boxA, boxB){
            var boxObj = {}
            if (boxA.w >= boxB.w){
                boxObj.boxA = boxA;
                boxObj.boxB = boxB;
            }else{
                boxObj.boxA = boxB;
                boxObj.boxB = boxA;
            }
            return boxObj;
        }

        //返回北极熊的碰撞盒子信息
        function returnBearBox(bearInfo){
            var BearBox = {
                w : Bear_BoxInfo.w,
                h : Bear_BoxInfo.h,
                x : bearInfo.x + 10,
                y : bearInfo.y,
            }
            return BearBox;
        }
    }

    //判断变量是否存在
    function isExitsVariable(variableName) {
        try {
            if (typeof(variableName) == "undefined") {
                return false;
            } else {
                return true;
            }
        } catch(e) {}
        return false;
    }

})();