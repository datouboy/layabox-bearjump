(function(){
	var Sprite  = Laya.Sprite;
	var Stage   = Laya.Stage;
	var Texture = Laya.Texture;
	var Browser = Laya.Browser;
	var Handler = Laya.Handler;
	var WebGL   = Laya.WebGL;
    var Event   = Laya.Event;
    var Loader  = Laya.Loader;

    var pageWidth  = Browser.clientWidth;
    var pageHeight = Browser.clientHeight;

    //标题运动方向
    var start_title_runTurn = true;
    //浮冰运动方向
    var start_bin_runTurn = true;
    //树的放大比计算基数
    var start_tree_big = 1;

	(function(){
		// 不支持WebGL时自动切换至Canvas
		Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);

		Laya.stage.alignV = Stage.ALIGN_MIDDLE;
		Laya.stage.alignH = Stage.ALIGN_CENTER;

		Laya.stage.scaleMode = "showall";
		Laya.stage.bgColor   = "#79d0f7";

        //加载静态文件资源
        var imgArray = ['end_di.png', 'form_bg.jpg', 'form_restart.png', 'form_submit.png', 'form_title.png', 'game_bg.jpg', 'game_bin.png', 'game_bin2.png', 'game_bin3.png', 'pop_box.png', 'pop_close.png', 'pop_icon.jpg', 'pop_icon_share.png', 'star.png', 'start_bg.jpg', 'start_bin.png', 'start_di.png', 'start_menu.png', 'start_title.png', 'start_tree.png', 'tip_bg.jpg', 'winner_bear.png'];
        var atlasArray = ['bear_jump.atlas', 'form_bear.atlas', 'start_bear.atlas', 'tips_bear.atlas', 'tips_sea.atlas', 'tips_tipbox.atlas', 'winner_yanhua.atlas'];
        var assets = [];
        //图片
        imgArray.forEach(function(val) {
            assets.push({
                url: 'res/images/' + val,
                type: Loader.IMAGE
            });
        }, this);
        //动画图集
        atlasArray.forEach(function(val) {
            assets.push({
                url: 'res/atlas/images/' + val,
                type: Loader.ATLAS
            });
        }, this);
		Laya.loader.load(assets, Handler.create(this, init),  Handler.create(this, onLoading, null, false), Loader.TEXT);
        // 侦听加载失败
		Laya.loader.on(Event.ERROR, this, onError);
        //init();
	})();

    //加载静态资源完成，开始初始化游戏
    function init(){
        console.log('初始化游戏');
        //开始画面
        startPage_s = new startPage();
        //加载胜利弹窗背景
        winnerFormBg = new winnerForm();
        Laya.winnerFormBg = winnerFormBg;
    }

    // 加载进度侦听器
	function onLoading(progress)
	{
        progress = Math.round(progress * 100);
		console.log("加载进度: " + progress);
	}

    //打印加载失败日志
	function onError(err)
	{
		console.log("加载失败: " + err);
	}

})();