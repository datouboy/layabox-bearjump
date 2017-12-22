//tips页面
(function(){
    var Sprite  = Laya.Sprite;
	var Stage   = Laya.Stage;
	var Texture = Laya.Texture;
	var Browser = Laya.Browser;
	var Handler = Laya.Handler;
	var WebGL   = Laya.WebGL;
    var Event   = Laya.Event;
    var Text    = Laya.Text;

    var pageWidth  = Browser.clientWidth;
    var pageHeight = Browser.clientHeight;

    function tipsPage() {
        var _this = this;
        _this.tipsBg();
    }

    Laya.class(tipsPage, "tipsPage", Sprite);

    var _proto = tipsPage.prototype;

    //记录北极熊的宽度和高度
    _proto.bearInfo = {}

    _proto.tipsBg = function(){
        var _this = this;

        //加载背景图
        tip_bg = new Sprite();
        tip_bg.loadImage("res/images/tip_bg.jpg", 0, 0, pageWidth, pageHeight);
        Laya.stage.addChild(tip_bg);
        tip_bg.alpha = 0;
        Laya.timer.frameLoop(1, this, tip_bg_show_animate);

        //背景渐现
        function tip_bg_show_animate(e){
            if(tip_bg.alpha < 1){
                tip_bg.alpha += 0.1;
            }else{
                Laya.timer.clear(_this, tip_bg_show_animate);
            }
        }

        //加载海
        //加载图集成功后，执行onLoaded回调方法
        Laya.loader.load("res/atlas/images/tips_sea.atlas", Laya.Handler.create(this, stageAdd_sea_animate));
        //海动画
        function stageAdd_sea_animate(){
            tip_sea = new Laya.Animation();
            tip_sea.loadAnimation("res/ani/Tips_sea.ani");
            Laya.stage.addChild(tip_sea);
            tip_sea.x = 200;
            tip_sea.y = pageHeight;
            tip_sea.scale(0.6,0.6);
            tip_sea.play();
            Laya.timer.frameLoop(1, _this, sea_y);
            
            add_bear();
        }
        //海的延续（补充动画部分）
        tip_sea_box = new Sprite();
        Laya.stage.addChild(tip_sea_box);
        //画矩形
        tip_sea_box.graphics.drawRect(0, pageHeight, pageWidth, pageHeight*1.2, "#79d0f7");
        //提升海高度动画
        function sea_y(e){
            tip_sea.y -= 5;
            tip_sea_box.y -=5;

            if (Math.abs(tip_sea_box.y) >= pageHeight*0.35){
                Laya.timer.clear(_this, sea_y);
                add_tipBox();
            }
        }

        //加载提示框资源
        function add_tipBox(){
            //加载图集
            //加载图集成功后，执行onLoaded回调方法
            Laya.loader.load("res/atlas/images/tips_tipbox.atlas", Laya.Handler.create(this, stageAdd_tipbox_animate));
        }
        //加载提示框
        function stageAdd_tipbox_animate(){
            tip_tipbox = new Laya.Animation();
            tip_tipbox.loadAnimation("res/ani/Tips_tipbox.ani");
            Laya.stage.addChild(tip_tipbox);
            tip_tipbox.scale(0.5,0.5);
            tip_tipbox.play();
            tip_tipbox.y = pageHeight*0.3;
            tip_tipbox.x = ((pageWidth - (388*0.5))/2) + ((388*0.5)*0.5);
        }

        //加载熊图集
        function add_bear(){
            //加载图集
            //加载图集成功后，执行onLoaded回调方法
            //Laya.loader.load("res/atlas/images/tips_bear.atlas", Laya.Handler.create(this, stageAdd_tipbear_animate));
            Laya.loader.load("res/atlas/images/tips_bear.atlas", Laya.Handler.create(this, stageAdd_bear_jump));

            function stageAdd_bear_jump(){
                Laya.loader.load("res/atlas/images/bear_jump.atlas", Laya.Handler.create(this, stageAdd_bear_jump2));
            }

            function stageAdd_bear_jump2(){
                Laya.loader.load("res/atlas/images/bear_jump3.atlas", Laya.Handler.create(this, stageAdd_tipbear_animate));
            }
            
        }
        //加载熊
        function stageAdd_tipbear_animate(){
            tip_bear = new Laya.Animation();
            tip_bear.loadAnimation("res/ani/Tips_bear.ani");
            tip_bear.pivotX = -210*0.5;
            tip_bear.pivotY = 240*0.5;
            Laya.stage.addChild(tip_bear);
            tip_bear.scale(0.6,0.6);
            tip_bear.play();
            tip_bear.y = pageHeight*0.86;
            tip_bear.x = pageWidth;

            tip_bear.zOrder = 4;

            Laya.timer.frameLoop(1, _this, tip_bear_xgo);
        }
        //熊动画
        function tip_bear_xgo(){
            var _this = this;
            tip_bear.x -= 4.5;
            if(tip_bear.x <= pageWidth*0.45){
                Laya.timer.clear(_this, tip_bear_xgo);

                //添加监听事件，全屏点击开始游戏
                //Laya.stage.once(Event.CLICK, _this, tips_startMenu_Click);
                //3、2、1倒计时

                orderNum = new Text();
                orderNum.fontSize = 70;
                orderNum.color = "#ffffff";
                orderNum.alpha = 1;
                Laya.stage.addChild(orderNum);
                orderNum.zOrder = 99;
                orderNum.text = 3;
                orderNum.x = (pageWidth - orderNum.width)/2;
                orderNum.y = pageHeight * 0.45;
                Laya.timer.loop(1, this, countDown);

                var num = 1;
                function countDown(){
                    num ++;
                    if(num >= 0 && num <= 50){
                        orderNum.text = 3;
                    }else if(num > 50 && num <= 100){
                        orderNum.text = 2;
                    }else if(num > 100 && num <= 150){
                        orderNum.text = 1;
                    }else if(num > 150 && num <= 200){
                        orderNum.text = 'Go!';
                        orderNum.x = (pageWidth - orderNum.width)/2;
                    }else if(num >= 200){
                        Laya.timer.clear(this, countDown);
                        orderNum.graphics.clear();
                        tips_startMenu_Click();
                    }
                }

                //获取北极熊的宽高
                var bearInfo = tip_bear.getBounds();
                _proto.bearInfo.width  = bearInfo.width;
                _proto.bearInfo.height = bearInfo.height;
                //console.log(_proto.bearInfo);
            }
        }

        //点击开始游戏
        function tips_startMenu_Click(){
            Laya.timer.frameLoop(1, this, remove_animate);
            //正式开始游戏
        }
        //移除元素动画效果
        function remove_animate(){
            //消除提示框
            tip_tipbox.alpha -= 0.1;
            //提高海的高度至全屏
            tip_sea.y -= 5;
            tip_sea_box.y -= 5;
            start_bin.x -= 1.2;

            if(tip_sea_box.y <= -pageHeight-(pageHeight*0.1)){
                Laya.timer.clear(this, remove_animate);
                //清除Start页面残留的定时循环
                Laya.timer.clearAll(startPage_s);

                //去掉装饰浮冰元素
                start_bin.graphics.clear();
                //去掉海浪元素
                tip_sea.clear();

                //初始化游戏
                gameManages = new gameManage();
                gameManages.initGame();
            }
        }

    }

})();