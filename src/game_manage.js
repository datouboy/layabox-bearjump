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
    var SoundManager = Laya.SoundManager;

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
    var Bin_type = 'default';//踩到浮冰的类型，用于计算下一次起跳的高度

    var JumpNum = 0;//北极熊跳跃次数
    var IsAddEndBin = false;//是否已添加终点浮冰
    var GameIsWin = false;//游戏是否已经赢了

    var EndBinInfo_Winner;//游戏胜利后，获取最后终点浮冰的位置

    var popBG_Black;//弹框半透明黑框

    var starObjArray = [];//跳跃动画五角星元素
    var lapingY = 0;//拉屏的实时Y，用来给五角星计算跳动下移的补偿
    var bearSwitch_i = 0;//北极熊跳跃的贴图切换

    function gameManage() {
        var _this = this;

        //////////////////////////////////////////////////////////////////////////////
        //跳跃停止线：测试线
        /*
        test_sp = new Sprite();
        Laya.stage.addChild(test_sp);
        test_sp.graphics.drawLine(0, JumpUpLine, pageWidth, JumpUpLine, "#ff0000", 5);
        test_sp.zOrder = 9;
        */
        //////////////////////////////////////////////////////////////////////////////

        //Tween自定义算法
        Tween = new tweenFun();
        //初始化浮冰（浮冰添加、运动、消除）
        gameBins = new gameBin();
        //获取北极熊的参数（碰撞检测方块大小）
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
        /*/陀螺仪测试数据
        testInfo = new Text();
        testInfo.fontSize = 12;
        testInfo.color = "#000000";
        testInfo.x = 10;
        testInfo.y = 10;
        testInfo.alpha = 0.5;
        Laya.stage.addChild(testInfo);
        testInfo.zOrder = 99;
        /////////////////////////////////////////////////////////////////////////////*/

        window.addEventListener("deviceorientation", onOrientationChange, false);
    }
    //陀螺仪监听动作执行
    function onOrientationChange(event) {
        //////////////////////////////////////////////////////////////////////////////
        //陀螺仪测试数据
        /*
        var isIphoneT = 'no';
        if(isIphone()){
            isIphoneT = 'yes';
        }
        testInfo.text = 
        "alpha:" + Math.floor(event.alpha) + '\n' +//左右旋转
        "beta :" + Math.floor(event.beta) + '\n' +//前后旋转
        "gamma:" + Math.floor(event.gamma) + '\n' +//扭转设备
        "Jump Num:" + JumpNum + '\n' +
        "is Iphone:" + isIphoneT
        */
        //////////////////////////////////////////////////////////////////////////////

        //判断左右和扭转值，取大的值发送给北极熊移动
        if(event.alpha >=0 && event.alpha <180){//向左倾斜
            var alpha = event.alpha;
        }else{//向右倾斜
            var alpha = Math.abs(alpha-360);
        }
        var gamma = Math.abs(event.gamma);

        if(alpha >= gamma && isIphone()){
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
        //计算北极熊跳跃次数
        JumpNum ++;
        //当跳跃次数超过50次，加载终点浮冰
        if(JumpNum >= 20){
            if(!IsAddEndBin){
                gameBins.addNewBin(JumpNum);
                gameBins.addEndBinToStage();
                IsAddEndBin = true;
            }
        }
        //添加浮冰
        if(!IsAddEndBin){
            gameBins.addNewBin(JumpNum);
        }
        //初始化参数
        Bear_Y = tip_bear.y;
        Tween_t = 0;
        console.log('北极熊跳跃执行');
        //计算跳跃的变化量
        //跳跃变化量根据冰块类型做改变
        if(Bin_type == 'default'){
            JumpUpHeight = Math.round(pageHeight * 0.5);
        }else if(Bin_type == 'super_1'){
            //带可乐的浮冰(瓶盖)，切换北极熊造型
            //_this.bearJumpAnimationSwitch();
            JumpUpHeight = Math.round(pageHeight * 0.7);
        }else if(Bin_type == 'super_2'){
            //带可乐的浮冰（一瓶可乐），切换北极熊造型
            //_this.bearJumpAnimationSwitch();
            JumpUpHeight = Math.round(pageHeight * 0.9);
        }
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

                //最后的终点浮冰需要盒子高度单独处理一下
                if(isExitsVariable(obj.myName)){
                    if(obj.myName == 'end'){
                        Bin_TempInfo[index].boxInfo.y += (Bin_TempInfo[index].height*0.15);
                    }
                }
            }, this);
        }

        //计算浮冰盒子大小（浮冰XY原点是左下角）
        function returnBearBoxInfo(obj){
            var binInfo = {}
            binInfo.w = obj.width * 0.6;
            binInfo.h = 35;
            binInfo.x = obj.x + (obj.width * 0.2);
            if(!isExitsVariable(obj.myName)){
                binInfo.y = obj.y;
            }else{
                binInfo.y = obj.y - ((obj.height-35)/2);
            }
            
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
                if(index == 0){
                    lapingY = binY;
                }
            }, this);
        }
    }
    //北极熊跳跃（下降部分）
    function bearJumpGoDown(){
        Tween_t += 1;//时间变量，每次跳跃后需要清0
        var old_y = tip_bear.y;
        var bearY = Tween.Quad.easeIn(Tween_t, 0, Tween_c, Tween_d);
        tip_bear.y = Bear_Y + bearY;
        //下落时执行碰撞检测
        collisionDetection(this, old_y, tip_bear.y);
        if(Tween_t == Tween_d){
            Laya.timer.clear(this, bearJumpGoDown);
            Tween_t = 0;
            //console.log('游戏失败');
            _proto.gameOver();
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
    function collisionDetection(_bearJumpGoDown_this, old_y, new_y){
        //console.log(old_y, new_y);
        //用于计算两个落点直接的补偿
        old_y = Math.round(old_y);
        new_y = Math.round(new_y);
        //性能优化、减少计算次数
        var collisionOK = false;
        var okObj = null;
        //踩冰动画时间
        var stepIceTime = 0;
        gameBins.binStageArray.forEach(function(obj, index) {
            //判断是否是到了终点
            if(isExitsVariable(obj.myName)){
                if(obj.myName == 'end'){
                    var collisionOK_end = collisionReturn(Bin_TempInfo[index].boxInfo, returnBearBox(tip_bear));
                    if(collisionOK_end){
                        //游戏结束
                        collisionOK = true;
                        GameIsWin = true;
                        //游戏胜利
                        _proto.gameWinner(Bin_TempInfo[index]);
                    }
                }
            }
            //剔除圣诞树
            if(!isExitsVariable(obj.myName)){
                //剔除高于北极熊脚步的浮冰
                if(Bin_TempInfo[index].boxInfo.y > tip_bear.y + Bear_BoxInfo.h && Bin_TempInfo[index].boxInfo.y < pageHeight + 50){
                    //console.log('计算：');
                    //boxContrast(Bin_TempInfo[index].boxInfo, );
                    if(!collisionOK){
                        var collisionOK_c = collisionReturn(Bin_TempInfo[index].boxInfo, returnBearBox(tip_bear));
                        if(collisionOK_c){
                            collisionOK = true;
                            okObj = obj;
                        }
                    }
                }
            }
        }, this);
        if(collisionOK){
            console.log('检测到碰撞');
            //写入本次踩到浮冰的类型
            if(okObj != null){
                if(isExitsVariable(okObj.binType)){
                    Bin_type = okObj.binType;
                    //播放音效
                    onPlaySound();
                }
            }

            //中断北极熊下落循环
            Laya.timer.clear(_bearJumpGoDown_this, bearJumpGoDown);
            Tween_t = 0;
            if(!GameIsWin){
                //执行踩冰动画，并起跳北极熊
                stepIceTime = 0;
                Laya.timer.frameLoop(1, this, stepIceAnimation);
                //切换北极熊造型
                _proto.bearJumpAnimationSwitchByN(0);
                //跳起时的特效(闪耀的五角星)
                if(Bin_type == 'default'){
                    _proto.bearJumpAnimation('default');
                }else{
                    _proto.bearJumpAnimation('super');
                }
                
            }
        }

        //踩冰动画
        function stepIceAnimation(){
            stepIceTime ++;
            if(okObj != null){
                if(stepIceTime <= 4){
                    okObj.y += 3.5;
                    tip_bear.y += 3.5;
                }else if(stepIceTime > 4 && stepIceTime <= 8){
                    okObj.y -= 3.5;
                    tip_bear.y -= 3.5;
                }else{
                    Laya.timer.clear(this, stepIceAnimation);
                    //换回北极熊造型
                    if(Bin_type == 'super_2'){
                        _proto.bearJumpAnimationSwitchByN(2);
                    }else{
                        _proto.bearJumpAnimationSwitchByN(1);
                    }
                    //北极熊再次跳起
                    _proto.bearJump();
                }
            }
        }

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
                qqsp2.graphics.drawRect(spot.x, spot.y, 2, 2, "#ff0000");
                qqsp2.zOrder = 11;
                //*/
                
                ///////////////////////////////////////////////////////////////
                
                if(spot.x >= box.x && spot.x <= box.x+box.w && box.y-box.h-13 <= spot.y && box.y >= spot.y){
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

        //播放弹跳音效
        function onPlaySound(){
            if(musicOnOff){
                SoundManager.playSound("res/sounds/tan.mp3", 1);
            }
        }
    }

    //游戏胜利
    _proto.gameWinner = function(endBinObj){
        var _this = this;
        //移除陀螺仪监听事件
        window.removeEventListener("deviceorientation", onOrientationChange, false);
        //游戏胜利的画面执行
        //修正北极熊的位置，让北极熊到终点的中间
        tip_bear.y = endBinObj.y - (endBinObj.height*0.22);
        //tip_bear.x = pageWidth * 0.4;
        Laya.timer.frameLoop(1, _this, tip_bear_xgo);
        //切换北极熊造型
        _this.bearJumpAnimationSwitchByN(0);
        //熊动画
        function tip_bear_xgo(){
            tip_bear.x = Math.round(tip_bear.x);
            var endX = Math.round(pageWidth * 0.4);
            if(tip_bear.x > endX){
                tip_bear.x --;
            }else if(tip_bear.x < endX){
                tip_bear.x ++;
            }else if(tip_bear.x == endX){
                Laya.timer.clear(this, tip_bear_xgo);
                //加载背景图
                tip_sea_box.graphics.clear();
                tip_bg = new Sprite();
                tip_bg.loadImage("res/images/tip_bg.jpg", 0, 0, pageWidth, pageHeight);
                Laya.stage.addChild(tip_bg);
                tip_bg.zOrder = -1;
                EndBinInfo_Winner = gameBins.binStageArray[gameBins.binStageArray.length-1].getBounds();
                Laya.timer.frameLoop(1, _this, winnerShow);

                //换熊的图片
                Laya.loader.load("res/atlas/images/winner_bear.atlas", Laya.Handler.create(this, stageAdd_winner_bear));

                function stageAdd_winner_bear(){
                    winner_bear = new Laya.Animation();
                    winner_bear.loadAnimation("res/ani/winner_bear.ani");
                    Laya.stage.addChild(winner_bear);
                    //winner_bear.pivotX = pageWidth*0.45;
                    //winner_bear.pivotY = tip_bear.y - endBinObj.height*0.39;
                    winner_bear.scale(0.6,0.6);
                    winner_bear.y = tip_bear.y - endBinObj.height*0.17;
                    winner_bear.x = pageWidth*0.55;
                    winner_bear.zOrder = 4;
                    winner_bear.play();
                    tip_bear.clear();
                }
                /*
                winner_bear = new Sprite();
                winner_bear.loadImage("res/images/winner_bear.png",  pageWidth*0.45, tip_bear.y - endBinObj.height*0.39 , pageWidth*0.25, (pageWidth*0.25)*(234/167));
                Laya.stage.addChild(winner_bear);
                winner_bear.zOrder = 4;
                tip_bear.clear();
                */
            }
        }

        //胜利动画
        function winnerShow(){
            //console.log(gameBins.binStageArray[gameBins.binStageArray.length-1]);
            game_bg.y += 4;
            if (game_bg.y >= EndBinInfo_Winner.y + (EndBinInfo_Winner.height * 0.6)){
                Laya.timer.clear(this, winnerShow);

                //加载放烟花
                Laya.loader.load("res/atlas/images/winner_yanhua.atlas", Laya.Handler.create(this, yanhuaPlay));
                //放烟花动画
                function yanhuaPlay(){
                    end_yanhua_1 = new Laya.Animation();
                    end_yanhua_1.loadAnimation("res/ani/winner_yanhua.ani");
                    Laya.stage.addChild(end_yanhua_1);
                    end_yanhua_1.x = pageWidth * 0.65;
                    end_yanhua_1.y = pageHeight * 0.15;
                    end_yanhua_1.scale(0.7,0.7);
                    end_yanhua_1.play();
                    end_yanhua_1.zOrder = 2;

                    end_yanhua_2 = new Laya.Animation();
                    end_yanhua_2.loadAnimation("res/ani/winner_yanhua.ani");
                    Laya.stage.addChild(end_yanhua_2);
                    end_yanhua_2.x = pageWidth * 0.4;
                    end_yanhua_2.y = pageHeight * 0.17;
                    end_yanhua_2.scale(0.5,0.5);
                    end_yanhua_2.play();
                    end_yanhua_2.zOrder = 2;

                    end_yanhua_3 = new Laya.Animation();
                    end_yanhua_3.loadAnimation("res/ani/winner_yanhua.ani");
                    Laya.stage.addChild(end_yanhua_3);
                    end_yanhua_3.x = pageWidth * 0.85;
                    end_yanhua_3.y = pageHeight * 0.23;
                    end_yanhua_3.scale(0.4,0.4);
                    end_yanhua_3.play();
                    end_yanhua_3.zOrder = 2;

                    //加载弹窗背景
                    popBG_Black = new Sprite();
                    Laya.stage.addChild(popBG_Black);
                    popBG_Black.graphics.drawRect(0, 0, pageWidth, pageHeight, "#000000");
                    popBG_Black.alpha = 0;
                    popBG_Black.zOrder = 9;
                    Laya.timer.frameLoop(1, _this, popBG_BlackShow);
                }
            }
        }
        //半透明黑背景
        function popBG_BlackShow(){
            popBG_Black.alpha += 0.005;
            if(popBG_Black.alpha >= 0.5){
                Laya.timer.clear(this, popBG_BlackShow);
                //写着html上的中奖接口
                winningSearch();
            }
        }
    }

    //游戏失败
    _proto.gameOver = function(){
        var _this = this;
        //移除陀螺仪监听事件
        window.removeEventListener("deviceorientation", onOrientationChange, false);
        //落水动画
        over_shui = new Sprite();
        over_shui.loadImage("res/images/over_shui.png", tip_bear.x-pageWidth*0.105, pageHeight-(pageHeight*0.18)+60, pageWidth*0.4, pageWidth*0.4*(3/4));
        Laya.stage.addChild(over_shui);
        over_shui.pivot(0, 0);
        over_shui.zOrder = 9;
        over_shui.alpha = 0;
        Laya.timer.frameLoop(1, _this, gameOverShui);
        var tempTime = 0;
        function gameOverShui(){
            over_shui.y -= 6;
            tip_bear.y += 13;
            tip_bear.alpha -= 0.1;
            over_shui.alpha += 0.1;
            if(tempTime >= 10){
                Laya.timer.clear(this, gameOverShui);
                //打开弹窗
                openPop();
            }
            tempTime ++;
        }
        //加载弹窗背景
        function openPop(){
            popBG_Black = new Sprite();
            Laya.stage.addChild(popBG_Black);
            popBG_Black.graphics.drawRect(0, 0, pageWidth, pageHeight, "#000000");
            popBG_Black.alpha = 0;
            popBG_Black.zOrder = 9;
            Laya.timer.frameLoop(1, _this, popBG_BlackShow);
        }
        //半透明黑背景
        function popBG_BlackShow(){
            popBG_Black.alpha += 0.01;
            if(popBG_Black.alpha >= 0.5){
                Laya.timer.clear(this, popBG_BlackShow);
                $('#gameover_box').show();
                $('#gameover_box').css({'top':(pageHeight - $('#gameover_box').height())/2 + 'px'});
            }
        }
    }

    //北极熊跳跃动画（闪耀的五角星）
    _proto.bearJumpAnimation = function(type){
        if(type == 'default'){
            var starWidth = 6;
            var starAlpha = 0.6;
        }else{
            var starWidth = 9;
            var starAlpha = 1;
        }
        var _this = this;
        starObjArray = [];
        //设置五角星圆心
        /*
            计算圆心坐标时候的奇怪问题！！！
            这里的坐标有点奇怪，莫名奇妙的翻倍了，百思不得其解，只能暂时先除2来解决，还不清楚具体原因
        */
        //console.log(tipsPages);tipsPages.bearInfo.width
        var oPoint = {
            ox : tip_bear.x/2 + tipsPages.bearInfo.width*0.13,
            oy : tip_bear.y/2 - tipsPages.bearInfo.height*0.1,
        }
        //console.log(tip_bear.width);
        //生成每个五角星的最终坐标点，生成10个10五角星
        var endPointArray = getPoint(pageWidth * 0.15, oPoint.ox, oPoint.oy, 10);
        var initObj = [];//每个五角星的所需运动值
        endPointArray.forEach(function(obj, index) {
            starObjArray[index] = new Sprite();
            starObjArray[index].pivotX = 0;
            starObjArray[index].pivotY = 0;
            starObjArray[index].loadImage("res/images/star.png", oPoint.ox, oPoint.oy, starWidth, starWidth);
            Laya.stage.addChild(starObjArray[index]);
            starObjArray[index].zOrder = 9;
            starObjArray[index].alpha = 0;
            initObj[index] = {
                x_move : obj.x-oPoint.ox,
                y_move : obj.y-oPoint.oy
            }
        }, this);
        //动画
        var a_t = 0;
        var a_d = 36;
        Laya.timer.frameLoop(1, _this, starShow);
        function starShow(){
            a_t += 1;
            starObjArray.forEach(function(obj, index) {
                if (a_t > 10){
                    obj.alpha = starAlpha;
                }
                obj.x = Tween.Quad.easeIn(a_t, oPoint.ox, initObj[index].x_move, a_d);
                obj.y = Tween.Quad.easeIn(a_t, oPoint.oy, initObj[index].y_move, a_d) + lapingY;
            }, this);
            if(a_t == a_d){
                Laya.timer.clear(_this, starShow);
                //删除所有五角星元素
                delStar();
            }
        }
        //删除所有五角星元素
        function delStar(){
            starObjArray.forEach(function(obj, index) {
                starObjArray[index].graphics.clear();
            }, this);
        }
    }

    //跳跃中北极熊的动画切换
    _proto.bearJumpAnimationSwitch = function(){
        var aniArray = ["res/ani/Tips_bear.ani", "res/ani/bear_jump.ani", "res/ani/Start_bear.ani"];
        bearSwitch_i++;
        if(bearSwitch_i > aniArray.length-1){
            bearSwitch_i = 0;
        }
        tip_bear.clear();
        tip_bear.loadAnimation(aniArray[bearSwitch_i]);
        Laya.stage.addChild(tip_bear);
        tip_bear.play();
    }

    //跳跃中北极熊的动画切换
    _proto.bearJumpAnimationSwitchByN = function(n){
        var aniArray = ["res/ani/Tips_bear.ani", "res/ani/bear_jump.ani", "res/ani/bear_jump3.ani", "res/ani/Start_bear.ani"];
        tip_bear.clear();
        tip_bear.loadAnimation(aniArray[n]);
        Laya.stage.addChild(tip_bear);
        tip_bear.play();
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

    /*
    * 求圆周上等分点的坐标
    * ox,oy为圆心坐标
    * r为半径
    * count为等分个数
    */
    function getPoint(r, ox, oy, count){
        var point = []; //结果
        var radians = (Math.PI / 180) * Math.round(360 / count), //弧度
            i = 0;
        for(; i < count; i++){
            var x = ox + r * Math.sin(radians * i),
                y = oy + r * Math.cos(radians * i);

            point.unshift({x:x,y:y}); //为保持数据顺时针
        }
        return point;
    }

    //判断是否是iphone
    function isIphone(){
        if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
            return true;
        }else{
            return false;
        }
    };

})();