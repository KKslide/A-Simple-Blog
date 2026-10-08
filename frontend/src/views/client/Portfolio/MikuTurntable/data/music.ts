/**
 * 唱片机曲库（静态配置）
 *
 * 本页数据原本来自后端 music 表 / GET /api/user/music-player，
 * 现改为前端静态配置，整个页面自包含、不依赖任何接口。
 *
 * 共 9 首，含完整 LRC 歌词与视觉素材。新增曲目直接往下追加即可。
 */

/** 播放点缀动效：对应三张 APNG 覆盖层，none 表示不展示 */
export type PlayEffect = 'none' | 'sakura' | 'snow' | 'hidden'

export interface MusicItem {
  /** 曲目编号（01-09），同时作为唯一标识 */
  no: string
  title: string
  artist: string
  album: string | null
  /** 语言：zh / en / ja */
  lang: string
  /** 时长（秒） */
  duration: number
  /** 音频外链 */
  url: string
  /** LRC 歌词全文（[mm:ss.xx] 格式，分钟必须两位） */
  lrc: string
  /** 一句话推荐语 */
  desc: string | null
  /** 播放点缀动效 */
  effect: PlayEffect
  /** 宫格立绘 */
  cover: string | null
  /** 宫格唱片图 */
  disc: string | null
  /** 弹窗顶部标题图 */
  titleImage: string | null
  /** 唱机托盘图 */
  tray: string | null
  /** 唱机唱片图（静止态） */
  discStill: string | null
  /** 唱机唱片图（播放态） */
  discPlaying: string | null
}

export const musicList: MusicItem[] = [
  {
    no: "01",
    title: "伯牙绝弦",
    artist: "王力宏",
    album: "十八般武艺",
    lang: "zh",
    duration: 227,
    url: "https://carddevo.card.fun/6abb7ee84533429d79fdc799",
    lrc: `[00:12.48]知人知面 知己知彼 又知心
[00:14.91]古人說 這就是所謂知音
[00:17.98]相知相惜 相親相愛 也相憶
[00:20.34]朋友 你會不會常把我想起
[00:23.64]何年何月 何日何時 再相聚
[00:25.95]何時能把酒言歡 暢回憶
[00:29.07]很多很多 很深很深的回憶
[00:31.47]很多歌我只想要為你唱起
[00:35.00]春秋時期 遠近知名 伯牙琴藝
[00:37.75]沈魚也出水 馬兒仰秣聆聽
[00:40.75]聆聽寂寞的聲音
[00:43.54]舉世知名不如一個知音
[00:46.18]直到子期聞琴 解開伯牙心境
[00:48.79]高山流水 風景似有靈犀
[00:51.93]高山青 流水靜如鏡
[00:53.83]無言卻勝過有言的天地
[00:56.75]聽宮商角徴羽
[00:59.85]那歌詞未寫上的是弦外的延長音
[01:02.36]斟一杯酒 一抱拳 一句關心
[01:05.46]在千年之後 延續不變的旋律
[01:07.96]當春雪融夏景 秋風為我捎封信
[01:13.75]咚咚咚隆咚鏘 咚咚咚隆咚鏘鏘 (鏘咚)
[01:16.64]又是思念的四季 Sing
[01:19.47]知人知面 知己知彼 又知心
[01:21.84]古人說 這就是所謂知音
[01:24.99]相知相惜 相親相愛 也相憶
[01:27.30]朋友 你會不會常把我想起
[01:30.36]何年何月 何日何時 再相聚
[01:32.91]何時能把酒言歡 暢回憶
[01:36.06]很多很多 很深很深的回憶
[01:38.53]很多歌我只想要為你唱起
[01:51.18]Eh, eh 某年某月某天 伯牙再訪子期
[01:55.90]風景依舊綠 子期卻已歸西
[01:58.86]觸景 觸琴 既傷情
[02:01.69]伯牙絕弦 只因再無知音
[02:04.33]千年過去 當我再度撥弄琴韻
[02:06.94]更多冷箭 更多冷言冷語
[02:10.02]請你聽 請輕輕傾聽
[02:11.94]唱給你永遠不離棄的知音
[02:14.95]聽宮商角徴羽
[02:18.43]那歌詞未寫上的是 Oh-oh-oh-oh
[02:20.50]斟一杯酒 一抱拳 一句關心
[02:23.67]在千年之後 延續不變的旋律
[02:26.03]當春雪融夏景 秋風為我捎封信
[02:31.97]咚咚咚隆咚鏘 咚咚咚隆咚鏘鏘 (鏘咚)
[02:34.73]又是思念的四季 Sing
[02:37.59]知人知面 知己知彼 又知心
[02:40.04]古人說 這就是所謂知音
[02:43.15]相知相惜 相親相愛 也相憶
[02:45.47]朋友 你會不會常把我想起
[02:48.74]何年何月 何日何時 再相聚
[02:51.07]何時能把酒言歡 暢回憶
[02:54.19]很多很多 很深很深的回憶
[02:56.63]很多歌我只想要為你唱起`,
    desc: `以伯牙子期的知音典故入词，中国风里唱的是「举世知名不如一个知音」。`,
    effect: "none",
    cover: "https://jpuboss.janime.cn/6a2675d96b58338796badfdc",
    disc: "https://jpuboss.janime.cn/6aac9d844a49e74c22e7218e",
    titleImage: "https://jpuboss.janime.cn/6a27bf766b58338796badff8",
    tray: "https://jpuboss.janime.cn/6a27ca686b58338796bae020",
    discStill: "https://jpuboss.janime.cn/6a27ca686b58338796bae021",
    discPlaying: "https://jpuboss.janime.cn/6a27d35c6b58338796bae026",
  },
  {
    no: "02",
    title: "abcdefu",
    artist: "GAYLE",
    album: null,
    lang: "en",
    duration: 168,
    url: "https://carddevo.card.fun/6abb7ee84533429d79fdc796",
    lrc: `[00:00.000] 作词 : David Bruce Pittenger/Sara Davis/Taylor Gayle Rutherfurd
[00:00.522] 作曲 : David Bruce Pittenger/Sara Davis/Taylor Gayle Rutherfurd
[00:01.44]Fνck you and your mom and your sister and your job
[00:05.30]And your broke-ass car and that shit you call art
[00:09.29]Fνck you and your friends that I'll never see again
[00:13.21]Everybody but your dog, you can all fνck off
[00:17.98]I swear I meant to mean the best when it ended
[00:22.13]Even tried to bite my tongue when you start shit
[00:25.92]Now you're textin' all my friends asking questions
[00:29.27]They never even liked you in the first place
[00:33.70]Dated a girl that I hate for the attention
[00:37.44]She only made it two days, what a connection
[00:41.37]It's like you'd do anything for my affection
[00:45.03]You're goin' all about it in the worst ways
[00:49.25]I was into you, but I'm over it now
[00:54.32]And I was tryin' to be nice
[00:57.09]But nothing's getting through, so let me spell it out
[01:01.90]A-B-C-D-E, F-U
[01:05.31]And your mom and your sister and your job
[01:08.10]And your broke-ass car and that shit you call art
[01:11.97]Fνck you and your friends that I'll never see again
[01:15.89]Everybody but your dog, you can all fνck off
[01:21.43]Nah, nah, nah, nah, nah, nah, nah
[01:25.16]A-B-C-D-E, F-U
[01:28.73]You said you just needed space and so I gave it
[01:32.41]When I had nothin' to say you couldn't take it
[01:36.25]Told everyone I'm a bitch, so I became it
[01:40.05]Always had to put yourself above me
[01:44.24]I was into you, but I'm over it now
[01:49.11]And I was tryin' to be nice
[01:51.89]But nothing's getting through, so let me spell it out
[01:56.53]A-B-C-D-E, F-U
[01:59.98]And your mom and your sister and your job
[02:02.89]And your craigslist couch and the way your voice sounds
[02:06.74]Fνck you and your friends that I'll never see again
[02:10.71]Everybody but your dog, you can all fνck off
[02:16.09]Nah, nah, nah, nah, nah, nah, nah
[02:19.89]A-B-C-D-E, F-U
[02:23.93]Nah, nah, nah, nah, nah, nah, nah
[02:27.72]A-B-C-D-E, F-U
[02:31.48]And your mom and your sister and your job
[02:34.27]And your broke-ass car and that shit you call art
[02:38.22]Fνck you and your friends that I'll never see again
[02:42.34]Everybody but your dog, you can all fνck off`,
    desc: `分手后最直白的一次宣泄，字母表都能当武器。`,
    effect: "none",
    cover: "https://jpuboss.janime.cn/6a2675d96b58338796badfe1",
    disc: "https://jpuboss.janime.cn/6aac9dea4a49e74c22e72190",
    titleImage: "https://jpuboss.janime.cn/6a27bf766b58338796badffa",
    tray: "https://jpuboss.janime.cn/6a27c78e6b58338796bae001",
    discStill: "https://jpuboss.janime.cn/6a27c78e6b58338796bae002",
    discPlaying: "https://jpuboss.janime.cn/6a27c78e6b58338796bae003",
  },
  {
    no: "03",
    title: "第一天",
    artist: "孙燕姿、阿信",
    album: null,
    lang: "zh",
    duration: 250,
    url: "https://carddevo.card.fun/6abb7ee84533429d79fdc794",
    lrc: `[00:00.08]孙燕姿、阿信 - 第一天
[00:00.32]作词：阿信
[00:00.52]作曲：陈建宁、阿信、孙燕姿
[00:01.03]编曲：五月天、孙燕姿、Fir
[00:25.65]下过雨的
[00:26.96]夏天傍晚我都会期待
[00:30.15]唱歌的蝉
[00:31.84]嘿把星星都吵醒
[00:33.92]月光晒了很凉快
[00:36.59]就是这样
[00:37.91]回忆起来第一次告白
[00:41.19]尴尬的我
[00:42.72]看爱装得很哲学的你
[00:45.35]其实很可爱
[00:47.06]你说活在明天活在期待
[00:49.98]不如活得今天很自在
[00:52.60]我说我懂了会不会太快
[00:55.47]未来第一天要展开
[00:59.07]第一天我存在
[01:01.78]第一次呼吸畅快
[01:04.71]站在地上的脚踝
[01:07.12]因为你而有真实感
[01:09.86]第一天我存在
[01:12.69]第一次能飞起来
[01:15.72]爱是腾空的魔幻
[01:18.09]第一天的纯真色彩它总是
[01:21.53]永远那么灿烂
[01:33.89]你很搞笑
[01:35.20]你很奇怪你头发很乱
[01:38.36]有的时候
[01:39.92]你又突然为我的事情
[01:42.70]变得很勇敢
[01:44.67]这么说来
[01:45.99]很不单纯你陪我看海
[01:49.30]海那么蓝
[01:50.86]我又好像不应该
[01:52.98]把你想得有点坏
[01:55.31]坏的是我发现不知不觉
[01:58.36]不见到你不是很习惯
[02:00.80]你的眼神里好像也期待
[02:03.66]期待不一样的未来
[02:07.25]第一天我存在
[02:09.93]第一次呼吸畅快
[02:12.96]站在地上的脚踝
[02:15.14]因为你而有真实感
[02:18.11]第一天我存在
[02:20.84]第一次能飞起来
[02:23.92]爱是腾空的魔幻
[02:26.09]第一天的纯真色彩它总是
[02:29.75]永远那么灿烂
[02:31.30]蓝色的海
[02:32.81]蓝色的海
[02:34.12]海上的云
[02:35.78]海上的云
[02:36.89]云的那端
[02:38.46]云的那端
[02:39.77]不转弯
[02:40.83]不转弯
[02:42.31]到未来
[02:43.78]到未来
[02:59.47]你说活在明天活在期待
[03:02.29]不如活得今天很自在
[03:04.82]我说我懂了会不会太快
[03:07.69]未来第一天要展开
[03:11.43]第一天我存在
[03:14.01]第一次呼吸畅快
[03:16.99]站在地上的脚踝
[03:19.37]因为你而有真实感
[03:22.20]第一天我存在
[03:24.92]第一次能飞起来
[03:27.96]爱是腾空的魔幻
[03:30.28]第一天的纯真色彩它总是
[03:33.75]永远那么灿烂
[03:36.48]永远那么灿烂
[03:39.26]永远那么灿烂
[03:43.14]First day first day
[03:45.78]first day first day first day
[03:49.77]Today everyday first day
[03:53.81]First day first day
[03:56.63]first day first day first day
[04:00.68]Today everyday first day`,
    desc: `孙燕姿与五月天阿信的合作，唱的是「活在今天」的青春。`,
    effect: "none",
    cover: "https://jpuboss.janime.cn/6a2675d96b58338796badfde",
    disc: "https://jpuboss.janime.cn/6aac9df54a49e74c22e72191",
    titleImage: "https://jpuboss.janime.cn/6a27bf766b58338796badffc",
    tray: "https://jpuboss.janime.cn/6a27c80d6b58338796bae006",
    discStill: "https://jpuboss.janime.cn/6a27c80d6b58338796bae009",
    discPlaying: "https://jpuboss.janime.cn/6a27c80d6b58338796bae007",
  },
  {
    no: "04",
    title: "烟圈",
    artist: "功夫胖KUNGFU-PEN",
    album: null,
    lang: "zh",
    duration: 229,
    url: "https://carddevo.card.fun/6abb7ee84533429d79fdc792",
    lrc: `[00:00.00] 制作人 : “ ”/功夫胖KUNGFU-PEN
[00:01.00] 作曲 : “ ”/功夫胖KUNGFU-PEN
[00:02.00] 作词 : 功夫胖KUNGFU-PEN
[00:03.00] 编曲 : “ ”/梁笑生AIRBUS130
[00:04.00] 混音师 : Jio吉欧/Cook库克
[00:05.00] 母带工程师 : Colin Leonard
[00:06.00] 音频工程 : Jio吉欧/Cook库克
[00:07.00] 演唱 : 功夫胖KUNGFU-PEN
[00:08.00] 录音棚 : 顶穿音频工作室
[00:09.00] 出品 : SupMusic Recording
[00:30.32]我慢慢吐出了烟圈
[00:34.45]想起你的书签留在故事哪一页
[00:41.05]如果思念就像烟圈
[00:45.08]点燃的一瞬间就能看见你的脸
[00:51.66]在我的记忆里 有多少情节我不愿意再记起
[00:55.47]和你分开的那天窗外大雨淅沥沥
[00:58.02]我刻意拉开我们之间的距离
[01:00.63]我知道一切都没有意义
[01:02.84]你不愿承认那些你犯的错 （是我的错）
[01:05.77]我不愿为你而变得成熟 （请原谅我）
[01:08.41]我无法忍受两个人沉默 （该怎么说）
[01:10.78]我不愿承认伤你的是我 （So Sick）
[01:13.42]曾经我们租的房子里面只剩自己
[01:15.56]不再说话可你知道我们知根知底
[01:18.15]我故意没有出发虽然我已经值机
[01:20.84]说实话你现在的他不如我十分之一
[01:23.48]那些安慰的话我听过千遍
[01:25.98]你的世界复杂而我太浅显
[01:28.76]我早搬出了那个记忆斑驳的家
[01:31.57]让往事燃烧吧变成一个烟圈
[01:34.57]我慢慢吐出了烟圈
[01:38.29]想起你的书签留在故事哪一页
[01:45.03]如果思念就像烟圈
[01:48.99]点燃的一瞬间就能看见你的脸
[01:56.36]橘子汽水 香味在空气中
[01:58.76]关于你的线索 留在我专辑中
[02:01.66]离开我的City消失在乌云中
[02:04.14]我双手插在口袋 故意在装轻松
[02:06.82]离开我是不是快乐
[02:09.54]至少你的心情我不用再猜了
[02:12.18]我去了许多地方也没有Get Better
[02:14.65]只是不想一个人在有回忆的地方呆着
[02:17.19]点燃一根烟 吞云吐雾间
[02:18.97]如果关于你的所有故事都能忘记消散如云烟
[02:22.35]浪子回头的路 实在太远
[02:24.66]风吹灭烟头 也吹散了我们的故事线
[02:27.73]烟灰变成白色 白天变成黑
[02:30.27]习惯把你的书签 丢行李箱带着飞
[02:32.91]时间长好了疤 忘记曾经的剧烈
[02:35.53]也许不过淡然一笑 在多年后遇见
[02:41.19]我慢慢吐出了烟圈
[02:45.15]想起你的书签留在故事哪一页
[02:51.58]如果思念就像烟圈
[02:55.57]点燃的一瞬间就能看见你的脸
[03:02.36]我慢慢吐出了烟圈
[03:06.25]想起你的书签留在故事哪一页
[03:13.11]如果思念就像烟圈
[03:17.02]点燃的一瞬间就能看见你的脸`,
    desc: `思念像烟圈，点燃的一瞬间就能看见你的脸。`,
    effect: "none",
    cover: "https://jpuboss.janime.cn/6a2675d96b58338796badfda",
    disc: "https://jpuboss.janime.cn/6aac9e004a49e74c22e72192",
    titleImage: "https://jpuboss.janime.cn/6a27bf766b58338796badff9",
    tray: "https://jpuboss.janime.cn/6a27c8726b58338796bae00c",
    discStill: "https://jpuboss.janime.cn/6a27c8726b58338796bae00b",
    discPlaying: "https://jpuboss.janime.cn/6a27c8726b58338796bae00a",
  },
  {
    no: "05",
    title: "心淡",
    artist: "容祖儿",
    album: null,
    lang: "zh",
    duration: 251,
    url: "https://carddevo.card.fun/6abb7ee84533429d79fdc798",
    lrc: `[00:00.04]容祖儿 - 心淡
[00:01.02]作词：黄伟文
[00:01.93]作曲：徐继宗
[00:08.50]想不起
[00:10.98]怎么会病到不分好歹
[00:14.12]连受苦都甜美
[00:18.67]我每日捱著
[00:19.93]不睬不理
[00:21.75]但却捱不死
[00:25.40]又去痴缠你
[00:30.66]难道终此一生
[00:32.83]都要这么
[00:34.96]不可争一口气
[00:38.65]很谦卑
[00:41.48]只不过是我太过爱你
[00:44.51]连自尊都忘记
[00:48.96]跌到极麻木
[00:50.48]只好相信
[00:52.20]又再爬得起
[00:55.79]就会有转机
[01:01.21]若我不懂憎你
[01:03.54]如何离别你
[01:05.41]亦怕不会飞
[01:10.97]由这一分钟开始计起
[01:13.19]春风秋雨间
[01:14.81]恨我对你以半年时间
[01:16.89]慢慢的心淡
[01:18.82]付清账单
[01:22.46]平静的对你热度退减
[01:26.36]一天一点伤心过
[01:28.08]这一百数十晚
[01:30.05]大概也够我
[01:31.21]送我来回地狱又折返人间
[01:35.63]春天分手
[01:36.74]秋天会习惯
[01:39.52]苦冲开了便淡
[01:58.96]很谦卑
[02:01.49]只不过是我太过爱你
[02:04.58]连自尊都忘记
[02:09.07]跌到极麻木
[02:10.28]只好相信
[02:12.15]又再爬得起
[02:15.85]就会有转机
[02:21.37]若我不懂憎你
[02:23.44]如何离别你
[02:25.37]亦怕不会飞
[02:30.93]由这一分钟开始计起
[02:33.15]春风秋雨间
[02:34.77]限我对你以半年时间
[02:36.84]慢慢的心淡
[02:38.96]付清账单
[02:42.60]平静的对你热度退减
[02:46.45]一天一点伤心过
[02:48.16]这一百数十晚
[02:50.13]大概也够我
[02:51.25]送我来回地狱又折返人间
[02:55.65]春天分手
[02:56.82]秋天会习惯
[02:59.40]苦冲开了便淡
[03:03.09]说甚么再平反
[03:07.46]只怕被迫一起
[03:08.98]更碍眼
[03:10.86]往后这半年间
[03:14.55]只爱自己
[03:15.56]虽说不太习惯
[03:17.04]毕竟有限
[03:18.70]就当过关
[03:24.38]由这一分钟开始计起
[03:26.35]春风秋雨间
[03:28.13]恨我对你以半年时间
[03:30.15]慢慢的心淡
[03:31.98]付清账单
[03:35.92]平静的对你热度退减
[03:39.67]一天一点伤心过
[03:41.34]这一百数十晚
[03:43.41]大概也够我
[03:44.49]送我来回地狱又折返人间
[03:48.75]春天分手
[03:50.06]秋天会习惯
[03:52.75]苦冲开了便淡`,
    desc: `港式情歌的教科书：从死心塌地到「苦冲开了便淡」。`,
    effect: "none",
    cover: "https://jpuboss.janime.cn/6a2675d96b58338796badfe2",
    disc: "https://jpuboss.janime.cn/6aac9e154a49e74c22e72193",
    titleImage: "https://jpuboss.janime.cn/6a27bf766b58338796badff6",
    tray: "https://jpuboss.janime.cn/6a27c8ce6b58338796bae010",
    discStill: "https://jpuboss.janime.cn/6a27c8ce6b58338796bae011",
    discPlaying: "https://jpuboss.janime.cn/6a27c8ce6b58338796bae00f",
  },
  {
    no: "06",
    title: "伟大航道",
    artist: "农夫",
    album: "奇迹",
    lang: "zh",
    duration: 230,
    url: "https://carddevo.card.fun/6abb7ee84533429d79fdc793",
    lrc: `[00:01.47]呢首歌係我特別為你而寫嘅
[00:04.28]可能你而家唔知我講緊咩嘅
[00:07.08]但係到你大個 攞返呢隻歌喺CD機度播
[00:10.02]你會知道我為你做咗啲咩嘢
[00:12.75]細路哥細細個仲細得幾多年
[00:15.16]唔好畀你嘅童年淨係充滿考試同測驗
[00:18.32]望吓個天 咁好天 去吓海邊
[00:21.06]因為到你大個就會忘記乜嘢係大自然
[00:24.84]做學生要爭取時間玩
[00:26.90]有幾多功課做都好閒 唔駛喊
[00:29.66]當你正式上班先知道乜嘢叫慘
[00:32.38]原來做功課好簡單 做人好難
[00:35.35]唔好怪你學校好似好煩嗰幾個先生
[00:38.41]因為冇一個先生係可以煩得過你老闆
[00:41.19]唔好介意 記缺點只係小事
[00:43.90]操行分就係玩緊迷你版嘅辦公室政治
[00:46.99]唔好笑你同學仔因為將來佢可能係
[00:49.85]同你做一世嘅兄弟 啊 順便一提
[00:53.77]千祈唔好食煙
[00:55.55]點解 因為你想像唔到佢有幾難戒
[01:00.20]寫畀你呢隻歌
[01:03.09]將所有我經過 我做錯 咪學我再做錯 因此我
[01:11.71]寫畀你呢隻歌
[01:14.65]想當你跌低過 挫敗過 有力再去突破
[01:22.35]大多幾歲你會想搵返個情侶
[01:24.82]老土啲講一句唔係有心就唔好追佢
[01:27.61]你諗吓佢流嘅眼淚
[01:29.14]傷害佢 將來佢 唔再相信愛
[01:31.76]你仲點過意得去
[01:33.70]愛情係好玩但係唔好玩愛情
[01:36.24]你一個唔小心可能會影響佢一世人
[01:38.93]我係過來人
[01:41.84]我做錯 咪學我 再做錯 因此我
[01:45.22]係噃
[01:46.15]記住飲酒唔好飲咁多 尤其是有杯著曬火一定要朋友幫吓拖
[01:50.94]踎到瞓底都冇乜所謂 最怕起身喺隔籬見到個好似我咁嘅男仔你就知道乜嘢係蝕底
[01:56.96]唔好隨便同人發生關係
[01:59.13]話就話前事不提 都係另一種虛偽
[02:02.09]因為 嗯 我始終認為
[02:05.07]你老公都唔想知道佢有咁多襟兄弟
[02:09.60]寫畀你呢隻歌
[02:12.47]將所有我經過 我做錯 咪學我再做錯 因此我
[02:21.16]寫畀你呢隻歌
[02:24.09]想當你跌低過挫敗過有力再去突破
[02:32.00]講到想講嘅都講過
[02:34.91]需要分享我分享過
[02:36.41]你始終會大個 你始終會離開我
[02:43.00]每人都有名 每人都有姓
[02:45.83]出世嗰一日就係最好嘅身份證明
[02:48.74]每人都有名 每人都有姓
[02:51.65]出世嗰一刻就係上天對你嘅肯定
[02:55.95]寫畀你呢隻歌
[02:58.89]將所有我經過 我做錯 咪學我再做錯 因此我
[03:07.36]寫畀你呢隻歌
[03:10.38]想當你跌低過 挫敗過 有力再去突破
[03:22.07]路從來都係好難行㗎
[03:25.11]但係無論幾難行都好 我一定會喺度陪你
[03:33.74]其實你嚟到呢個世界
[03:35.63]係一個安排
[03:37.83]你會比你想像中 更加偉大`,
    desc: `农夫写给下一代的人生叮咛，粤语说唱里全是过来人的话。`,
    effect: "none",
    cover: "https://jpuboss.janime.cn/6a2675d96b58338796badfdf",
    disc: "https://jpuboss.janime.cn/6aac9e244a49e74c22e72194",
    titleImage: "https://jpuboss.janime.cn/6a27bf766b58338796badffb",
    tray: "https://jpuboss.janime.cn/6a27c9376b58338796bae012",
    discStill: "https://jpuboss.janime.cn/6a28e24c6b58338796bae028",
    discPlaying: "https://jpuboss.janime.cn/6a27c9376b58338796bae014",
  },
  {
    no: "07",
    title: "It's So Easy",
    artist: "Linda Ronstadt",
    album: "Brokeback Mountain Soundtrack",
    lang: "en",
    duration: 147,
    url: "https://carddevo.card.fun/6abb7ee84533429d79fdc797",
    lrc: `[00:09.28]It's so easy to fall in love
[00:13.34]It's so easy to fall in love
[00:17.40]People tell me love's for fools
[00:21.49]Here I go breaking all the rules
[00:24.89]It seems so easy
[00:26.17](It's so easy, it's so easy, it's so easy, it's so easy)
[00:27.52]Yeah, so doggone easy
[00:30.12](It's so easy, it's so easy, it's so easy, it's so easy)
[00:31.65]Oh, it seems so easy
[00:34.13](It's so easy, it's so easy, it's so easy)
[00:35.61]Yeah, where you're concerned my heart can learn, oh
[00:41.63]It's so easy to fall in love
[00:45.50]It's so easy to fall in love
[00:57.62]Look into you heart and see
[01:01.63]What your love book has set aside for me
[01:04.91]It seems so easy
[01:06.21](It's so easy, it's so easy, it's so easy, it's so easy)
[01:07.70]Yeah, so doggone easy
[01:10.26](It's so easy, it's so easy, it's so easy, it's so easy)
[01:11.71]Oh, it seems so easy
[01:14.21](It's so easy, it's so easy, it's so easy)
[01:15.70]Yeah, where you're concerned my heart can learn, oh
[01:21.63]It's so easy to fall in love
[01:25.47]It's so easy to fall in love
[01:45.03]It seems so easy
[01:46.22](It's so easy, it's so easy, it's so easy, it's so easy)
[01:47.72]Oh, so doggone easy
[01:50.24](It's so easy, it's so easy, it's so easy, it's so easy)
[01:51.80]Yeah, it seems so easy
[01:54.24](It's so easy, it's so easy, it's so easy)
[01:55.62]Oh, where you're concerned my heart can learn, oh
[02:01.64]It's so easy to fall in love
[02:05.43]It's so easy to fall in love
[02:09.39]It's so easy to fall in love
[02:13.38]It's so easy to fall in love
[02:17.44]It's so easy to fall in love
[02:21.39]It's so easy to fall in love`,
    desc: `《断背山》原声，一首温柔又怅然的翻唱。`,
    effect: "sakura",
    cover: "https://jpuboss.janime.cn/6ab23dbd4a49e74c22e721c4",
    disc: "https://jpuboss.janime.cn/6aac9e2d4a49e74c22e72195",
    titleImage: "https://jpuboss.janime.cn/6ab23f024a49e74c22e721c7",
    tray: "https://jpuboss.janime.cn/6a2910eb6b58338796bae035",
    discStill: "https://jpuboss.janime.cn/6a2910eb6b58338796bae033",
    discPlaying: "https://jpuboss.janime.cn/6a2910eb6b58338796bae032",
  },
  {
    no: "08",
    title: "如愿",
    artist: "王菲",
    album: "如愿",
    lang: "zh",
    duration: 265,
    url: "https://carddevo.card.fun/6abb7ee84533429d79fdc795",
    lrc: `[00:31.70]你是 遙遙的路
[00:34.98]山野大霧裡的燈
[00:40.02]我是孩童啊 走在你的眼眸
[00:46.15]你是 明月清風
[00:49.54]我是你照拂的夢
[00:54.46]見與不見都一生與你相擁
[01:00.18]而我將 愛你所愛的人間
[01:04.35]願你所願的笑顏
[01:07.89]你的手我蹣跚在牽 請帶我去明天
[01:14.61]如果說 你曾苦過我的甜
[01:18.89]我願活成你的願
[01:22.28]願不枉啊 願勇往啊 這盛世每一天
[02:00.15]你是 歲月長河
[02:03.50]星火燃起的天空
[02:08.51]我是仰望者 就把你唱成歌
[02:14.46]你是我之所來
[02:17.98]也是我心之所歸
[02:22.88]世間所有路都將與你相逢
[02:28.65]而我將 愛你所愛的人間
[02:32.86]願你所願的笑顏
[02:36.29]你的手我蹣跚在牽 請帶我去明天
[02:43.02]如果說 你曾苦過我的甜
[02:47.40]我願活成你的願
[02:50.60]願不枉啊 願勇往啊 這盛世每一天
[02:59.20]山河無恙 煙火尋常
[03:02.86]可是你如願的眺望
[03:06.58]孩子們啊 安睡夢鄉
[03:10.29]像你深愛的那樣
[03:19.21]而我將 夢你所夢的團圓
[03:23.36]願你所願的永遠
[03:27.03]走你所走的長路 這樣的愛你啊
[03:33.59]我也將 見你未見的世界
[03:37.75]寫你未寫的詩篇
[03:41.30]天邊的月 心中的念 你永在我身邊
[03:50.33]與你相約一生清澈
[03:54.62]如你年輕的臉`,
    desc: `王菲的声音一开口就是山河岁月，唱的是「如愿」。`,
    effect: "snow",
    cover: "https://jpuboss.janime.cn/6ab23dfb4a49e74c22e721c5",
    disc: "https://jpuboss.janime.cn/6aac9e374a49e74c22e72196",
    titleImage: "https://jpuboss.janime.cn/6ab23ec54a49e74c22e721c6",
    tray: "https://jpuboss.janime.cn/6a2910446b58338796bae02f",
    discStill: "https://jpuboss.janime.cn/6a2910446b58338796bae031",
    discPlaying: "https://jpuboss.janime.cn/6a2910446b58338796bae030",
  },
  {
    no: "09",
    title: "问爱",
    artist: "Yamy郭颖",
    album: null,
    lang: "zh",
    duration: 182,
    url: "https://carddevo.card.fun/6abb7ee84533429d79fdc79a",
    lrc: `[00:00.00] 作词 : Yamy郭颖
[00:01.00] 作曲 : Yamy郭颖
[00:02.00] 编曲 : 顺德@亿万虎力
[00:03.00] 制作人 : Yamy郭颖/顺德@亿万虎力
[00:04.00] 混音/母带处理 : 顺德@亿万虎力
[00:11.76]问世间
[00:14.74]情为何物
[00:17.54]缘生缘灭
[00:19.78]难舍难分
[00:22.32]一寸光阴一寸金
[00:24.80]逢场过戏瘾
[00:25.22]他朝一别两宽各自行
[00:27.92]荷花易谢
[00:29.93]她不会等
[00:32.46]我修炼五百年 后离开峨眉山
[00:34.56]因为中意hea同姐姐嚟到人世间
[00:34.56]（因为喜欢闲逛就跟着姐姐来到人世间）
[00:37.16]听讲神仙法力无边
[00:39.00]都难过情关
[00:40.46]我哋偏唔信要变个人形cos周围玩
[00:40.46]（我们偏不信要打扮成人的模样到处玩）
[00:42.93]一尾分两肢 团扇执于手
[00:45.68]梳髻涂胭脂 碎步柳腰扭
[00:48.09]白素贞睇中许公子贪佢老实忠厚
[00:48.09]（白素贞相中许公子的老实忠厚）
[00:50.40]但唔知条鱼上钩容易 难甩手
[00:50.40]（但不知道鱼儿上钩容易甩掉难）
[00:53.36]学人讲野学人跳舞我玩得几过瘾
[00:53.36]（模仿人讲话跳舞，我玩得挺过瘾）
[00:55.66]学埋七情六欲我拣多几个吻
[00:55.66]（七情六欲是什么我多练习几个吻看看）
[00:58.27]个日遇到个位 做好事都有佢份
[00:58.27]（那天遇到那位 做好事他也参与了）
[01:00.72]我捻住撩下佢但姐姐话唔好捻
[01:00.72]（我打算撩他但是姐姐让我别想了）
[01:03.41]千奇唔好掂个啲无情感
[01:03.41]（千万不要找那些没有情感的）
[01:05.91]样样都啱心水对象几难揾
[01:05.91]（样样都合心意的对象多难找）
[01:08.43]识讲大话识忍识喊仲要识氹
[01:08.43]（得会撒谎会忍耐会卖惨还得会哄人）
[01:11.20]做人好Q难
[01:11.20]（做人真的好难）
[01:12.29]拍个拖咁多花臣
[01:12.29]（谈个恋爱搞那么多花样）
[01:13.55]问世间
[01:15.95]情为何物
[01:18.81]缘生缘灭
[01:21.60]难舍难分
[01:23.64]一寸光阴一寸金
[01:25.26]逢场过戏瘾
[01:26.63]他朝一别两宽各自行
[01:28.94]荷花易谢
[01:31.13]她不会等
[01:33.68]由细到大我哋都亲密无间
[01:33.68]（从小到大我们都亲密无间）
[01:35.90]就算嗌架最坏第日就会好翻
[01:35.90]（就算吵架最多隔天就会和好）
[01:38.48]但个次为咗个穷书生差啲走散
[01:38.48]（但那次为了个穷书生我们差点一拍两散）
[01:41.11]千年道行佢都肯去牺牲
[01:41.11]（千年道行她都愿意去牺牲）
[01:43.07]份恩情凡人点还
[01:43.07]（这份恩情凡人如何偿还）
[01:44.13]我睇到好多痴情种
[01:44.13]（我看到很多痴情人）
[01:45.38]等唔到答复僵持
[01:45.38]（等不到答复彼此僵持着）
[01:46.73]为一张纸 坐对面两张椅
[01:46.73]（为了一纸协议 闹到坐对立面）
[01:49.23]为一棵树 放弃成个森林无意思
[01:49.23]（为了一棵树放弃整片森林真无趣）
[01:51.66]明知 承诺以后实变苦相思
[01:51.66]（明知道许下承诺也会落得苦相思）
[01:54.34]世人 葫芦
[01:55.70]卖啲乜药我参不透
[01:55.70]（卖的是什么药我无法参透）
[01:56.94]废人 糊涂
[01:58.19]处处留情佢贪不够
[01:58.19]（处处留情他贪得无厌）
[01:59.52]贵人 估到
[02:00.80]温馨提示佢不受
[02:00.80]（温馨提示他也不接受）
[02:02.50]越动情越多愁
[02:02.50]（动情越深烦恼越多）
[02:03.31]边个够足智多谋
[02:03.31]（谁又能把把都足智多谋呢）
[02:04.66]所以都系做返一只妖比较舒服
[02:04.66]（所以还是做回一只妖精比较舒服）
[02:07.20]倾得埋就继续
[02:07.20]（聊得来就继续）
[02:08.55]唔夹就掟煲散局
[02:08.55]（不合适就分手）
[02:09.75]睇佢地勾心斗角乱咁作
[02:09.75]（看他们勾心斗角胡作非为）
[02:11.22]自己又盲目
[02:11.22]（自己也盲目）
[02:12.36]滥爱不如享受孤独
[02:12.36]（与其追求滥竽充数的爱不如享受孤独）
[02:17.49]问世间
[02:19.76]情为何物
[02:22.57]缘生缘灭
[02:24.87]难舍难分
[02:27.45]一寸光阴一寸金
[02:29.90]逢场过戏瘾
[02:30.33]他朝一别两宽各自行
[02:32.77]荷花易谢
[02:34.91]她不会等
[02:38.35]问世间
[02:43.54]观聚散
[02:48.65]结于旦
[02:53.74]了风残`,
    desc: `问世间情为何物，Yamy 用说唱给了一个当代答案。`,
    effect: "hidden",
    cover: "https://jpuboss.janime.cn/6a2675d96b58338796badfdb",
    disc: "https://jpuboss.janime.cn/6aac9e414a49e74c22e72197",
    titleImage: "https://jpuboss.janime.cn/6ab0eb604a49e74c22e721bd",
    tray: "https://jpuboss.janime.cn/6a27c6f36b58338796badffe",
    discStill: "https://jpuboss.janime.cn/6a28e2ac6b58338796bae029",
    discPlaying: "https://jpuboss.janime.cn/6a27c7bb6b58338796bae005",
  },
]

/** 按编号取曲目 */
export function getMusicByNo(no: string): MusicItem | undefined {
  return musicList.find((item) => item.no === no)
}

/**
 * 随机挑一首，作为「打开页面就推荐」的默认曲目
 * （原由后端 GET /api/user/music-player 下发 random_id，现前端自行产生）
 */
export function pickRandomMusic(): MusicItem | undefined {
  if (!musicList.length) return undefined
  return musicList[Math.floor(Math.random() * musicList.length)]
}
