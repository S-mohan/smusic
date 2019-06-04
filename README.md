# Smusic

一款基于HTML5、Css3的列表式音乐播放器，包含列表，音量，进度，时间，歌词展示以及播放模式等功能，不依赖任何库


> html5音乐列表播放器<br>Author:Smohan<br>Version:2.0.1<br>url: [https://smohan.net/lab/smusic](https://smohan.net/lab/smusic)


![smuic](https://img.smohan.net/article/9615e13fcf51eae18dc4d40afaa9e0ab.jpg 'smusic')


### [项目地址][1]

### [DEMO][2]


### 使用方式

#### (c)npm install

#### gulp compile

#### gulp build

#### 使用

在`<head>`中加入

```html
<link rel="stylesheet" href="../build/smusic.min.css">
```

在 `<body>`中 创建DOM(SMUSIC容器)

```html
<body>
	...
	<div id="my-music"></div>
	...
</body>
```

创建musicList文件或者数组,歌曲列表格式如下
```javascript
var songList = [
	{
		title : '成都',
		singer : '赵雷',
		audio : 'http://m2.music.126.net/4gwWNLUdEZuPCKGUWWu_rw==/18720284975304502.mp3',
		thumbnail : 'http://p1.music.126.net/34YW1QtKxJ_3YnX9ZzKhzw==/2946691234868155.jpg',
		lyric : './data/chengdu.lrc'
	}
]
```

在`</body>`前加入JS
```html
<script src="./songList.js"></script>
<script src="../build/smusic.min.js"></script>
<script>
	var smusic = SMusic(songList, {
		container : document.getElementById('my-music')
	});
	smusic.init()
</script>
```

> 歌词需要服务器环境支持, 可以启动[http-server](https://github.com/indexzero/http-server)创建一个简单的服务器环境



### Options

```javascript
{
	//放置Smusic的DOM容器
	container: doc.body,
	//初始化播放索引
	playIndex: 0,
	//初始化播放模式 (1 : 列表循环  2 : 随机播放  3 : 单曲循环)
	playMode: 1,
	//初始化音量 (0 - 1之间)
	volume: .5,
	//自动播放
	autoPlay: true,
	//默认显示面板
	panel: 'list' //['list' 列表面板, 'lyric' 歌词面板]
}
```

### API

```javascript
//初始化播放器
init()

/**
* 获取当前播放的歌曲信息
* @returns {*}
*/
getCurrentInfo()

/**
* 设置播放模式
* @param mode (1, 2, 3)
*/
setMode(mode = 1)

/**
* 设置音量
* @param volume ( 0 <= volume <= 1)
*/
setVolume(volume = .5)

/**
* 向列表中追加音乐
* @param music
* @param callback
*/
addSong(music = {}, callback = noop)

//刷新播放列表
refreshList()

/**
* 下一首
* @param callback
*/
next(callback)

/**
* 上一首
* @param callback
*/
prev(callback)

/**
* 播放
* @param callback
*/
play(callback)

/**
* 暂停
* @param callback
*/
pause(callback)
```

### 更新记录

版本：```2.0.1```
代码重构(es6,scss,gulp等)，新增向列表追加歌曲(addSong)、上一曲(next)、下一曲(prev)等对外接口，优化拖拽、歌词等功能，优化界面

版本：```2.0.0```
增加歌词展示功能

版本：```1.0.3```
增加拖动进度条，调整播放进度功能

版本：```1.0.2```
新增```defaultMode```属性，控制初始化播放模式，新增```callback```回调方法，用于获取当前播放媒体文件信息

版本：```1.0.1```
增加了是否自动播放的配置项开关 ```autoPlay```,灵活配置播放器启动时是否自动播放


[1]: https://smohan.net/lab/smusic
[2]: https://s-mohan.github.io/demo/smusic/index.html
