//打开表单填写背景
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

    function winnerForm() {
        var _this = this;
    }

    Laya.class(winnerForm, "winnerForm", Sprite);

    var _proto = winnerForm.prototype;

    //执行打开表单填写背景
    _proto.init = function(){
        var _this = this;

        //加载背景图
        form_bg = new Sprite();
        form_bg.loadImage("res/images/form_bg.jpg", 0, 0, pageWidth, pageHeight);
        Laya.stage.addChild(form_bg);
        form_bg.zOrder = 9;

        //加载title
        form_title = new Sprite();
        form_title.loadImage("res/images/form_title.png", pageWidth * 0.05, pageHeight * 0.08, pageWidth*0.9, (pageWidth*0.9)*(98/648));
        Laya.stage.addChild(form_title);
        form_title.zOrder = 9;

        //加载熊
        //加载图集成功后，执行onLoaded回调方法
        Laya.loader.load("res/atlas/images/form_bear.atlas", Laya.Handler.create(this, stageAdd_formbear_animate));
        //小熊动画
        function stageAdd_formbear_animate(){
            form_bear = new Laya.Animation();
            form_bear.loadAnimation("res/ani/form_bear.ani");
            Laya.stage.addChild(form_bear);
            form_bear.x = pageWidth * 0.16;
            form_bear.y = pageHeight * 0.81;
            form_bear.scale(0.55,0.55);
            form_bear.play();
            form_bear.zOrder = 9;
        }
    }

})();