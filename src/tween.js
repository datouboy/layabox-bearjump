//Tween算法
(function(){
    var Sprite  = Laya.Sprite;

    function tweenFun() {
        console.log('初始化自定义Tween算法');
    }

    Laya.class(tweenFun, "tweenFun", Sprite);

    var _proto = tweenFun.prototype;

    //Tween算法
    /*
    t: current time（当前时间）；
    b: beginning value（初始值）；
    c: change in value（变化量）；
    d: duration（持续时间）。
    */
    _proto.Linear = function(t,b,c,d){ return c*t/d + b; }
	_proto.Quad = {
		easeIn: function(t,b,c,d){
			return c*(t/=d)*t + b;
		},
		easeOut: function(t,b,c,d){
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOut: function(t,b,c,d){
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * (( t)*(t-2) - 1) + b;
		}
	}
    _proto.Cubic = {//弹性曲线强度1
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    }
    _proto.Quart = {//弹性曲线强度2
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        }
    }
    _proto.Quint = {//弹性曲线强度3
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        }
    }

})();