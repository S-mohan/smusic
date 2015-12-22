/**
 * sMusic
 * Author:Smohan
 * Version:1.0.3
 * url: http://www.smohan.net/lab/smusic.html
 * 使用请保留以上信息
 */
!(function(win){
    /**
     * 添加样式
     * @param element
     * @param className
     */
    function addClass(element,className){
        if(hasClass(element,className) == false){
            element.className += ' '+className;
        }
    }
    /**
     * 是否包含样式
     * @param element
     * @param className
     * @returns {boolean}
     */
    function hasClass(element,className){
        return !!element.className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'));
    }
    /**
     * 移除样式
     * @param element
     * @param className
     */
    function removeClass(element,className){
        var currentClass = element.className;
        if(hasClass(element,className)){
            currentClass = currentClass.replace(new RegExp('(\\s|^)'+className+'(\\s|$)'),' ');
            currentClass = currentClass.replace(/(^\s*)|(\s*$)/g,'');
            element.className = currentClass;
        }
    }
    /**
     * 自动添加或删除样式（自动切换）
     * @param element
     * @param className
     */
    function toggleClass(element,className){
        if(hasClass(element,className)){
            removeClass(element,className);
        }else{
            addClass(element,className);
        }
    }
    /**
     * 返回元素节点
     * @param element
     * @returns {HTMLElement}
     */
    function $(element){
        return document.querySelector(element);
    }
    /**
     * 对象扩展
     * @param target
     * @param source
     * @returns {object}
     */
    function extend(target,source){
        for(var p in source){
            if(source.hasOwnProperty(p)){
                target[p] = source[p];
            }
        }
        return target;
    }
    /**
     * 格式化时间
     * @param time
     * @returns {string}
     */
    function calcTime(time){
        var hour,minute,second,timer = '';
        hour = String(parseInt(time/3600,10));
        minute = String(parseInt((time % 3600) / 60 ,10));
        second = String(parseInt(time % 60, 10));
        if(hour != '0'){
            if(hour.length == 1) hour = '0' + hour;
            timer += (hour + ':');
        }
        if(minute.length == 1) minute = '0' + minute;
        timer += (minute + ':');
        if(second.length == 1) second = '0' + second;
        timer += second;
        return timer;
    }
    var bufferTimer = null;

    /**
     * 构造函数
     * @param config
     * @constructor
     */
    function SmohanMusic(config){
        var defaults = this.config;
        this.config = extend(defaults,config);
        this.musicList = this.config.musicList || [];
        this.musicLength = this.musicList.length;
        if(!this.musicLength || !$('body')){
            this.musicDom.listWrap.innerHTML = '<p>暂无播放记录...</p>';
        }
        this.audioDom = null; //audio对象
        this.init();
    }
    SmohanMusic.prototype = {
        config : {
            musicList : [],    //播放列表
            defaultVolume :.7,  //初始化音量 0 - 1.0 之间
            defaultIndex  : 0,  //初始化播放索引
            autoPlay  : false,  //是否自动播放
            defaultMode : 1,     //播放模式
            callback    : function(obj){}  //回调函数，返回当前播放媒体信息
        },
        /**
         * 创建播放列表
         */
        createListDom : function(){
            var i = 0, ul = '<ul>';
            for(i;i<this.musicLength;i++){
                ul += '<li class="f-toe"><strong>'+this.musicList[i]['title']+'</strong> -- <small>'+this.musicList[i]['singer']+'</small></li>';
            }
            ul += '</ul>';
            this.musicDom.listWrap.innerHTML = ul;
        },
        /**
         * 缓冲加载
         */
        setBuffer : function(audio,bufferDom){
            var w = bufferDom.parentNode.offsetWidth;
            bufferTimer = setInterval(function(){
                var buffer = audio.buffered.length;
                if(buffer > 0 && audio.buffered != undefined){
                    var bufferWidth =  (audio.buffered.end(buffer-1) / audio.duration) * w;
                    bufferDom.style.width = bufferWidth + 'px';
                    if(Math.abs(audio.duration - audio.buffered.end(buffer-1)) <1){
                        bufferDom.style.width = w + 'px';
                        clearInterval(bufferTimer);
                    }
                }
            },1000);
        },
        /**
         * 重载播放器
         * @param idx
         */
        resetPlayer : function(idx){
            (idx >= (this.musicLength-1)) && (idx = (this.musicLength-1));
            (idx <= 0) && (idx = 0);
            this.currentMusic = idx;
            var nowMusic = this.musicList[idx],  //获取当前的播放音乐信息
                me = this;
            //过渡函数，用于事件监听和移除，暂时性的解决通过addEventListener添加的事件传递匿名函数无法移除的问题
            var tempBuffer = function(){
                return me.setBuffer(this,me.musicDom.bufferProcess);
            };
            //在canplay事件监听前移除之前的监听
            this.audioDom.removeEventListener('canplay',tempBuffer,false);
            clearInterval(bufferTimer);
            //样式重置（元素属性重新设置）
            this.musicDom.bufferProcess.style.width = 0+'px';
            this.musicDom.curProcess.style.width = 0 + 'px';
            this.audioDom.src = nowMusic.src;
            this.musicDom.cover.innerHTML = '<img src="'+nowMusic.cover+'" title="'+nowMusic.title + ' -- '+ nowMusic.singer + '">';
            this.musicDom.title.innerHTML = '<strong>'+nowMusic.title+'</strong><small>'+nowMusic.singer+'</small>';
            //设置播放列表选中
            var playlist = document.querySelectorAll('.m-music-list-wrap li'), i = 0;
            for(i; i< this.musicLength;i++){
                if(i == idx){
                    addClass(playlist[i],'current');
                }else{
                    removeClass(playlist[i],'current');
                }
            }
            //可以播放时，设置缓冲区，重新监听 canplay  PS：当音频能够播放时，才会触发该事件
            this.audioDom.addEventListener('canplay',tempBuffer,false);
            if(this.config.autoPlay){  //增加是否启动就播放的开关
                this.play();
            }else{
                this.pause();
            }
            var _callback = nowMusic;
            _callback.index = idx;
            typeof this.config.callback == "function" && this.config.callback(_callback);  //将当前播放信息回调
        },
        /**
         * 音量设置
         * @param volume
         */
        setVolume : function(volume){
            var v = this.musicDom.volume,
                h = v.volumeEventer.offsetHeight || 50;  //隐藏元素的高度不好获取，这里设置visible来实现同样的效果
            if(volume <= 0) volume = 0;
            if(volume >= 1) volume = 1;
            this.audioDom.volume = volume;
            var currentHeight = h * volume;
            v.volumeCurrent.style.height = currentHeight + 'px';
            v.volumeCtrlBar.style.bottom = currentHeight + 'px';
            v.volumeProcess.setAttribute('data-volume',volume);
            if(volume == 0){
                //静音
                addClass(v.volumeControl,'muted');
                this.audioDom.muted = true;
            }else{
                removeClass(v.volumeControl,'muted');
                this.audioDom.muted = false;
            }
        },
        /**
         * 初始化播放器
         */
        initPlay : function(){
            var idx = this.config.defaultIndex;
            if(this.playMode == 2){ //随机播放
                idx = this.getRandomIndex();
            }
            this.setVolume(this.config.defaultVolume);
            this.audioDom.load();
            this.resetPlayer(idx);
        },
        /**
         * 播放
         */
        play : function(){
            var ctrl = this.musicDom.button.ctrl;
            this.audioDom.play();
            removeClass(ctrl,'paused');
            addClass(ctrl,'play');
            ctrl.setAttribute('title','暂停');
            removeClass(this.musicDom.cover,'paused');
            addClass(this.musicDom.cover,'play');
        },
        /**
         * 暂停
         */
        pause : function(){
            var ctrl = this.musicDom.button.ctrl;
            this.audioDom.pause();
            removeClass(ctrl,'play');
            addClass(ctrl,'paused');
            ctrl.setAttribute('title','播放');
            removeClass(this.musicDom.cover,'play');
            addClass(this.musicDom.cover,'paused');
        },
        /**
         * 获取不包含当前索引的随机索引
         * @returns {number}
         */
        getRandomIndex : function(){
            var idx = this.currentMusic,len  = this.musicLength, i = 0, temp = [];
            //应该在不包括当前的列表中播放
            for(i;i<len;i++){
                if(i != idx){
                    temp.push(i);
                }
            }
            var random = parseInt(Math.random() * temp.length);
            return temp[random];
        },
        /**
         * 通过播放模式加载歌曲并播放
         * @param type
         */
        playByMode : function(type){
            var modes = this.playMode,
                idx  = this.currentMusic,
                len  = this.musicLength,
                index = idx;
            if(modes == 1){  //列表
                if(type == 'prev'){
                    index = ((idx <= len - 1) && (idx > 0)) ? (idx-1) : (len-1);
                }else if(type == 'next' || type == 'ended'){  //增加一个ended区别单曲循环
                    index = (idx >= len - 1) ? 0 : (idx+1);
                }
            }else if(modes == 2){ //随机
                index = this.getRandomIndex();  //无论上下曲，随机获取一个不是当前播放的索引
            }else if(modes == 3){ //单曲
                if(type == 'prev'){
                    index = ((idx <= len - 1) && (idx > 0)) ? (idx-1) : (len-1);
                }else if(type == 'next'){
                    index = (idx >= len - 1) ? 0 : (idx+1);
                }else{
                    index = idx;
                }
            }
            this.resetPlayer(index);
        },
        /**
         * 一些操作
         */
        action : function(){
            var  me = this, v = this.musicDom.volume, btn = this.musicDom.button;
            //监听timeupdate，设置进度，PS:播放过程中，当前播放位置改变时，会触发该事件
            this.audioDom.addEventListener('timeupdate',function(){
                var audio = this;
                if(!isNaN(audio.duration)){
                    var surplusTime = calcTime(audio.currentTime),
                        totalTime   = calcTime(audio.duration);
                    var currentProcess = (audio.currentTime / audio.duration) * (me.musicDom.bufferProcess.parentNode.offsetWidth);
                    //当前播放时间/总时间 = 播放百分比
                    //播放百分比 * 进度条长度 = 当前播放进度
                    me.musicDom.time.innerHTML = ''+surplusTime+'/'+totalTime+'';
                    me.musicDom.curProcess.style.width = currentProcess + 'px';
                }
            },false);
            //监听 播放结束，PS:当音频播放完毕或者播放结束时会触发ended事件
            this.audioDom.addEventListener('ended',function(){
                me.playByMode('ended');
            },false);
            //显示隐藏音量控制器，静音等操作
            v.volumeControl.addEventListener('click',function(event){
                event = event || window.event;
                event.stopPropagation();
                if(hasClass(v.volumeProcess,'show')){
                    toggleClass(this,'muted');
                    hasClass(this,'muted') ? (me.audioDom.muted = true) : (me.audioDom.muted = false);
                }else{
                    addClass(v.volumeProcess,'show');  //显示
                }
            },false);
            //区域外点击隐藏控制器
            document.addEventListener('click',function(event){
                event = event || window.event;
                event.stopPropagation();
                var target = event.target || event.srcElement;
                if((target.parentNode !== v.volumeProcess) && target.parentNode !== $('.grid-music-container .u-volume')){
                    //当触发事件的元素不在音量元素范围里时关闭
                    removeClass(v.volumeProcess,'show');
                }
            },false);
            //音量控制
            v.volumeEventer.addEventListener('click',function(event){
                event = event || window.event;
                event.stopPropagation();
                var h = this.offsetHeight,
                    y = event.offsetY,  //获取距离父级相对位置
                    volume = (h-y) / h;
                me.setVolume(volume);
            },false);
            //点击列表切歌
            var playlist = document.querySelectorAll('.m-music-list-wrap li'), i = 0;
            for(i; i< this.musicLength;i++){
                !(function(i){
                    playlist[i].addEventListener('click',function(){
                        me.resetPlayer(i);
                    },false);
                }(i));
            }
            //暂停/播放
            btn.ctrl.addEventListener('click',function(){
                if(hasClass(this,'play')){
                    me.pause();
                }else{
                    me.play();
                }
            },false);
            //上一曲
            btn.prev.addEventListener('click',function(){
                me.playByMode('prev');
            },false);
            //下一曲
            btn.next.addEventListener('click',function(){
                me.playByMode('next');
            },false);
            //模式选择
            //列表循环
            btn.listCircular.addEventListener('click',function(){
                addClass(this,'current');
                removeClass(btn.singleCircular,'current');
                removeClass(btn.randomPlay,'current');
                me.playMode = 1;
            });
            //随机播放
            btn.randomPlay.addEventListener('click',function(){
                addClass(this,'current');
                removeClass(btn.singleCircular,'current');
                removeClass(btn.listCircular,'current');
                me.playMode = 2;
            });
            //单曲循环
            btn.singleCircular.addEventListener('click',function(){
                addClass(this,'current');
                removeClass(btn.listCircular,'current');
                removeClass(btn.randomPlay,'current');
                me.playMode = 3;
            });
            //拖动进度条，快进
            var $progress = this.musicDom["curProcess"].parentNode;
            $progress.addEventListener("click",function(e){
                e = e || window.event;
                var left = this.getBoundingClientRect().left,width = this.offsetWidth;
                var progressX = Math.min(width,Math.abs(e.clientX - left)); //防止超出范围
                if(me.audioDom.currentTime && me.audioDom.duration){
                    me.audioDom.currentTime = parseInt((progressX / width) * (me.audioDom.duration)); //重新设置播放进度
                    me.play();
                }    
            });
        },
        /**
         * 初始化播放器
         */
        init : function(){
            //缓存DOM结构
            this.musicDom = {
                music : $('.grid-music-container'),
                cover : $('.grid-music-container .u-cover'),
                title : $('.grid-music-container .u-music-title'),
                curProcess : $('.grid-music-container .current-process'),
                bufferProcess : $('.grid-music-container .buffer-process'),
                time : $('.grid-music-container .u-time'),
                listWrap : $('.grid-music-container .m-music-list-wrap'),
                volume   : {
                    volumeProcess : $('.grid-music-container .volume-process'),
                    volumeCurrent : $('.grid-music-container .volume-current'),
                    volumeCtrlBar : $('.grid-music-container .volume-bar'),
                    volumeEventer : $('.grid-music-container .volume-event'),  //主要作用于绑定事件，扩大了音量的触发范围
                    volumeControl : $('.grid-music-container .volume-control')
                },
                button  : {
                    ctrl : $('.grid-music-container .ctrl-play'),
                    prev : $('.grid-music-container .prev'),
                    next : $('.grid-music-container .next'),
                    listCircular : $('.grid-music-container .mode-list'), //列表循环
                    randomPlay   : $('.grid-music-container .mode-random'), //随机循环
                    singleCircular : $('.grid-music-container .mode-single') //单曲循环
                }
            };
            this.currentMusic = this.config.defaultIndex || 0;
            this.playMode = this.config.defaultMode || 1; //播放模式，默认列表循环
            this.audioDom = document.createElement('audio');
            this.createListDom();
            this.initPlay();
            this.action();
        }
    };
    win = win || window;
    //重新封装，实例化后返回一个全局对象
    win.SMusic = function(options){
        return new SmohanMusic(options);
    };
})(window);
