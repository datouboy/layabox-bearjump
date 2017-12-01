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

	(function(){
		// 不支持WebGL时自动切换至Canvas
		Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);

		Laya.stage.alignV = Stage.ALIGN_MIDDLE;
		Laya.stage.alignH = Stage.ALIGN_CENTER;

		Laya.stage.scaleMode = "showall";
		Laya.stage.bgColor   = "#79d0f7";

        //createLineRun();
        init();
	})();

    function init(){
        //开始画面
        startPage_s = new startPage();
        //加载胜利弹窗背景
        winnerFormBg = new winnerForm();
        Laya.winnerFormBg = winnerFormBg;
    }

})();