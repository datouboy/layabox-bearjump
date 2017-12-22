//开始页面
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

    //标题运动方向
    var start_title_runTurn = true;
    //浮冰运动方向
    var start_bin_runTurn = true;
    //树的放大比计算基数
    var start_tree_big = 1;

    //弹窗背景
    var popBG_Black;

    function startPage() {
        var _this = this;
        _this.startInit();
    }

    Laya.class(startPage, "startPage", Sprite);

    var _proto = startPage.prototype;

    //开始画面
    _proto.startInit = function(){
        var _this = this;

        //加载背景图
        start_bg = new Sprite();
        start_bg.loadImage("res/images/start_bg.jpg", 0, 0, pageWidth, pageHeight);
        Laya.stage.addChild(start_bg);

        //加载起跳点冰块
        start_di = new Sprite();
        start_di.loadImage("res/images/start_di.png", pageWidth*0.235, pageHeight*0.7, pageWidth*0.8, (pageWidth*0.8)*(357/639));
        start_di.binType = 'default';
        Laya.stage.addChild(start_di);

        //加载标题
        start_title = new Sprite();
        start_title.loadImage("res/images/start_title.png", pageWidth*0.12, pageHeight*0.1, pageWidth*0.8, (pageWidth*0.8)*(461/617));
        Laya.stage.addChild(start_title);
        start_title.pivot(0, 0);
        Laya.timer.frameLoop(1, this, stageAdd_start_animate);

        //加载浮冰
        start_bin = new Sprite();
        start_bin.loadImage("res/images/start_bin.png", pageWidth*0.01, pageHeight*0.76, pageWidth*0.2, (pageWidth*0.2)*(63/158));
        Laya.stage.addChild(start_bin);
        start_bin.pivot(0, 0);
        Laya.timer.frameLoop(1, this, stageAdd_bin_animate);

        //加载树
        start_tree = new Sprite();
        start_tree.loadImage("res/images/start_tree.png", pageWidth*0.7, pageHeight*0.5, pageWidth*0.5, (pageWidth*0.5)*(454/389));
        Laya.stage.addChild(start_tree);
        start_bin.pivot(0, 0);
        Laya.timer.frameLoop(1, this, stageAdd_tree_animate);

        //加载按钮
        start_startMenu = new Sprite();
        start_startMenu.loadImage("res/images/start_menu.png");
        start_startMenu.x = pageWidth*0.3;
        start_startMenu.y = pageHeight*0.5;
        start_startMenu.scaleX = (pageWidth*0.4)/295;
        start_startMenu.scaleY = (pageWidth*0.4)/295;
        Laya.stage.addChild(start_startMenu);
        //监听事件，此侦听事件响应一次后则自动移除侦听
        start_startMenu.once(Event.CLICK, this, onGameStartClick);

        //加载活动规则按钮
        start_tgMenu = new Sprite();
        start_tgMenu.loadImage("res/images/tg_text.png");
        start_tgMenu.x = pageWidth*0.04;
        start_tgMenu.y = pageHeight*0.95;
        start_tgMenu.scaleX = (pageWidth*0.2)/110;
        start_tgMenu.scaleY = (pageWidth*0.2)/110;
        Laya.stage.addChild(start_tgMenu);
        //监听事件
        start_tgMenu.on(Event.CLICK, this, onTgOpen);

        //加载熊
        //加载图集成功后，执行onLoaded回调方法
        Laya.loader.load("res/atlas/images/start_bear.atlas", Laya.Handler.create(this, stageAdd_bear_animate));
        //小熊动画
        function stageAdd_bear_animate(){
            start_bear = new Laya.Animation();
            start_bear.loadAnimation("res/ani/Start_bear.ani");
            Laya.stage.addChild(start_bear);
            start_bear.x = pageWidth * 0.6;
            start_bear.y = pageHeight * 0.77;
            start_bear.scale(0.55,0.55);
            start_bear.play();
        }
    }

    //标题动画
    function stageAdd_start_animate(e){
        //这里的start_title.y是个相对值，从0开始计算的
        if(start_title.y <= 0){
            start_title_runTurn = true;
        }else if(start_title.y >= pageHeight*0.03){
            start_title_runTurn = false;
        }
        if(start_title_runTurn){
            start_title.y += 0.1;
        }else{
            start_title.y -= 0.1;
        }
    }
    //浮冰动画
    function stageAdd_bin_animate(e){
        //这里的start_title.y是个相对值，从0开始计算的
        if(start_bin.y <= 0){
            start_bin_runTurn = true;
        }else if(start_bin.y >= pageHeight*0.01){
            start_bin_runTurn = false;
        }
        if(start_bin_runTurn){
            start_bin.y += 0.05;
        }else{
            start_bin.y -= 0.05;
        }
    }
    //树动画
    function stageAdd_tree_animate(e){
        if(start_bin_runTurn){
            start_tree_big += 0.0002;
            start_tree.scale(1,start_tree_big);
            start_tree.y -= 0.12;
        }else{
            start_tree_big -= 0.0002;
            start_tree.scale(1,start_tree_big);
            start_tree.y += 0.12;
        }
    }
    //开始游戏点击事件
    function onGameStartClick(e){
        //清除动画
        Laya.timer.clear(this, start_title);
        Laya.timer.clear(this, start_startMenu);
        Laya.timer.clear(this, start_bear);
        //加载删除动画
        Laya.timer.frameLoop(1, this, startAllImgDel);
    }
    //开始页面元素移除
    function startAllImgDel(e){
        start_title.y -= 10;
        start_startMenu.y += 15;
        start_bear.x += 6;
        if(start_bear.x > 480){
            //删除元素
            start_title.graphics.clear();
            start_startMenu.graphics.clear();
            start_tgMenu.graphics.clear();
            start_bear.clear();

            //删除按钮监听
            start_tgMenu.off(Event.CLICK, this, onTgOpen);

            //加载tips页面
            tipsPages = new tipsPage();

            //设置元素层级
            start_di.zOrder = 2;
            start_bin.zOrder = 2;
            start_tree.zOrder = 3;

            //删除循环
            Laya.timer.clear(this, startAllImgDel);
        }
    }
    //打开活动规则
    function onTgOpen(e){
        var _this = this;
        openPop();
        $('#box_tg').show();
		$('#box_tg').css({'top':(pageHeight - $('#box_tg').height())/2 + 'px'});

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
            popBG_Black.alpha += 0.05;
            if(popBG_Black.alpha >= 0.5){
                Laya.timer.clear(this, popBG_BlackShow);
            }
        }
    }
    //关闭弹窗背景
    _proto.closePop = function(){
        var _this = this;
        popBG_Black.graphics.clear();
    }

})();