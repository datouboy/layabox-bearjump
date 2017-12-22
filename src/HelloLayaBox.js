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
        //性能统计面板的调用
        //Laya.Stat.show(0,0);

		Laya.stage.alignV = Stage.ALIGN_MIDDLE;
		Laya.stage.alignH = Stage.ALIGN_CENTER;

        Laya.stage.screenAdaptationEnabled = false;

		Laya.stage.scaleMode = "showall";
		Laya.stage.bgColor   = "#79d0f7";

        //加载静态文件资源
        var imgArray = ['end_di.png', 'form_bg.jpg', 'form_restart.png', 'form_submit.png', 'form_title.png', 'game_bg.jpg', 'game_bin.png', 'game_bin2.png', 'game_bin3.png', 'pop_box.png', 'pop_close.png', 'pop_icon.jpg', 'pop_icon_share.png', 'star.png', 'start_bg.jpg', 'start_bin.png', 'start_di.png', 'start_menu.png', 'start_title.png', 'start_tree.png', 'tip_bg.jpg', 'winner_bear.png', 'over_shui.png'];
        var atlasArray = ['bear_jump.atlas', 'bear_jump3.atlas', 'form_bear.atlas', 'start_bear.atlas', 'tips_bear.atlas', 'tips_sea.atlas', 'tips_tipbox.atlas', 'winner_yanhua.atlas'];
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
        //加载音效
        assets.push({
                url: 'res/sounds/tan.mp3',
                type: Loader.SOUND
            });
        //加载
		Laya.loader.load(assets, Handler.create(this, init),  Handler.create(this, onLoading, null, false), Loader.TEXT);
        // 侦听加载失败
		Laya.loader.on(Event.ERROR, this, onError);

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //绘制进度条
        loadBG = new Sprite();
        Laya.stage.addChild(loadBG);
        var path =  [
            ["moveTo", 8, 0], //画笔的起始点，
            ["arcTo", 0, 0, 0, 8, 8], //p1（500,0）为夹角B，（500,30）为端点p2
            ["arcTo", 0, 16, 8, 16, 8],
            ["lineTo", 200, 16],
            ["arcTo", 208, 16, 208, 8, 8],
            ["arcTo", 208, 0, 200, 0, 8],
            ["lineTo", 8, 0]
        ];
        //绘制圆角矩形
        loadBG.graphics.drawPath((pageWidth-208)/2, Math.round(pageHeight/2.5) - 10, path, {fillStyle: "#cbefff"});
        loadTiao = new Sprite();
        Laya.stage.addChild(loadTiao);
        var path =  [
            ["moveTo", 4, 0], //画笔的起始点，
            ["arcTo", 0, 0, 0, 4, 4], //p1（500,0）为夹角B，（500,30）为端点p2
            ["arcTo", 0, 8, 4, 8, 4],
            ["lineTo", 4, 8],
            ["arcTo", 8, 8, 8, 4, 4],
            ["arcTo", 8, 0, 4, 0, 4],
            ["lineTo", 4, 0]
        ];
        loadTiao.graphics.drawPath((pageWidth-208)/2 + 4, Math.round(pageHeight/2.5) - 6, path, {fillStyle: "#4892b3"});

        $('#layaContainer').width(pageWidth);
        $('#layaContainer').height(pageHeight);
        $('body').css({'width':pageWidth, 'height':pageHeight});
        //init();
	})();

    //加载静态资源完成，开始初始化游戏
    function init(){
        console.log('初始化游戏');
        //开始画面
        startPage_s = new startPage();
        Laya.startPage_s = startPage_s;
        //加载胜利弹窗背景
        winnerFormBg = new winnerForm();
        Laya.winnerFormBg = winnerFormBg;
    }

    // 加载进度侦听器
	function onLoading(progress)
	{
        progress = Math.round(progress * 100);
		//console.log("加载进度: " + progress);
        //loadTiao.graphics.clear();
        var OnePercent = (192 - 4)/100;//每百分之一进度的距离
        var addPercent = Math.round(progress * OnePercent);//需要增加的百分比
        /*var path =  [
            ["moveTo", 4, 0], //画笔的起始点，
            ["arcTo", 0, 0, 0, 4, 4], //p1（500,0）为夹角B，（500,30）为端点p2
            ["arcTo", 0, 8, 4, 8, 4],
            ["lineTo", 192, 8],
            ["arcTo", 200, 8, 200, 4, 4],
            ["arcTo", 200, 0, 192, 0, 4],
            ["lineTo", 4, 0]
        ];*/
        var path =  [
            ["moveTo", 4, 0], //画笔的起始点，
            ["arcTo", 0, 0, 0, 4, 4], //p1（500,0）为夹角B，（500,30）为端点p2
            ["arcTo", 0, 8, 4, 8, 4],
            ["lineTo", 4+addPercent, 8],
            ["arcTo", 8+addPercent, 8, 8+addPercent, 4, 4],
            ["arcTo", 8+addPercent, 0, 4+addPercent, 0, 4],
            ["lineTo", 4, 0]
        ];
        loadTiao.graphics.drawPath((pageWidth-208)/2 + 4, Math.round(pageHeight/2.5) - 6, path, {fillStyle: "#4892b3"});
	}

    //打印加载失败日志
	function onError(err)
	{
		console.log("加载失败: " + err);
	}

})();