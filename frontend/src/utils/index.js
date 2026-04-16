/**
 * 日期格式处理 年y 月M 日d
 * 调用方式：new Date().Format('yyyy/M/d hh:mm:ss'))
 */
Date.prototype.Format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  return fmt;
};

export default class utils {
  // 对字符串中的{i}字符进行替换处理
  static format() {
    var str = arguments[0];
    if (typeof str === "undefined" || str == null || str == "" || str == "undefined") {
      return str;
    }
    for (var i = 1; i < arguments.length; i++) {
      var re = new RegExp("\\{" + (i - 1) + "\\}", "gm");
      str = str.replace(re, arguments[i]);
    }
    return str;
  }
  // 判断数据是否为空
  static isNullOrEmpty(sourceValue) {
    if (typeof sourceValue === "undefined" || sourceValue == null || sourceValue == "" || sourceValue == "undefined") {
      return true;
    }
    return false;
  }

  // 获取页面链接参数
  static getQuery(url, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = url.substr(1).match(reg);
    if (r != null) {
      return r[2];
    }
    return null;
  }
  // 将字面量对象拼接为字符串参数，如 {a:1, b:2} => "a=1&b=2"
  static objectToQueryString(obj) {
    if (!obj || typeof obj !== "object") return "";
    return Object.keys(obj)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
      .join("&");
  }
  // 节流
  static throttle(fn, delay) {
    let timer = null
    return function (...args) {
      if (!timer) {
        timer = setTimeout(() => {
          fn(...args)
          timer = null
        }, delay)
      }
    }
  }
  // 防抖
  static _debounce(fn, delay) {
    var delay = delay || 200;
    var timer;
    return function () {
      var th = this;
      var args = arguments;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function () {
        timer = null;
        fn.apply(th, args);
      }, delay);
    };
  }
  // guid随机函数算法
  static guid() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
  }
  // 判断链接是否带有域名,结果返回布尔值
  static exithttp(url) {
    if (url.indexOf("http://") > -1 || url.indexOf("https://") > -1) {
      return true;
    } else {
      return false;
    }
  }

  static version() {
    var u = navigator.userAgent;
    return {
      trident: u.indexOf("Trident") > -1, //IE内核
      presto: u.indexOf("Presto") > -1, //opera内核
      webKit: u.indexOf("AppleWebKit") > -1, //苹果、谷歌内核
      gecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") == -1, //火狐内核
      mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
      android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1, //android终端或者uc浏览器
      iPhone: u.indexOf("iPhone") > -1, //是否为iPhone或者QQHD浏览器
      iPad: u.indexOf("iPad") > -1, //是否iPad
      webApp: u.indexOf("Safari") == -1, //是否web应该程序，没有头部与底部
      weixin: u.indexOf("MicroMessenger") > -1, //是否微信 （2015-01-22新增）
      qq: u.match(/\sQQ/i) == " qq", //是否QQ
    };
  }

  /** 获得浏览器***/
  static browse() {
    var browser = {};
    var userAgent = navigator.userAgent.toLowerCase();
    var s;
    (s = userAgent.match(/msie ([\d.]+)/)) ? (browser.ie = s[1]) : (s = userAgent.match(/firefox\/([\d.]+)/)) ? (browser.firefox = s[1]) : (s = userAgent.match(/chrome\/([\d.]+)/)) ? (browser.chrome = s[1]) : (s = userAgent.match(/opera.([\d.]+)/)) ? (browser.opera = s[1]) : (s = userAgent.match(/version\/([\d.]+).*safari/)) ? (browser.safari = s[1]) : 0;
    var version = "";
    if (browser.ie) {
      version = "IE " + browser.ie;
    } else {
      if (browser.firefox) {
        version = "firefox " + browser.firefox;
      } else {
        if (browser.chrome) {
          version = "chrome " + browser.chrome;
        } else {
          if (browser.opera) {
            version = "opera " + browser.opera;
          } else {
            if (browser.safari) {
              version = "safari " + browser.safari;
            } else {
              version = "unknow";
            }
          }
        }
      }
    }
    return version;
  }

  /** 获得操作系统***/
  static clientOs() {
    // 0表示windows,1表示mac,2表示linux
    var sUserAgent = navigator.userAgent;
    var isWin = navigator.platform == "Win32" || navigator.platform == "Windows";
    var isMac = navigator.platform == "Mac68K" || navigator.platform == "MacPPC" || navigator.platform == "Macintosh" || navigator.platform == "MacIntel";
    if (isMac) {
      return 1;
    }
    var isUnix = navigator.platform == "X11" && !isWin && !isMac;
    if (isUnix) {
      return 2;
    }
    var isLinux = String(navigator.platform).indexOf("Linux") > -1;
    if (isLinux) {
      return 2;
    }
    if (isWin) {
      return 0;
    }
    return 2;
  }
  // 时间戳转时间
  static formatDate(d = "", fmt, isString) {
    var datetime = d;
    if (isString) datetime = new Date(Date.parse(d.replace(/-/g, "/")));
    var o = {
      "M+": datetime.getMonth() + 1, // 月份
      "d+": datetime.getDate(), // 日
      "h+": datetime.getHours(), // 小时
      "m+": datetime.getMinutes(), // 分
      "s+": datetime.getSeconds(), // 秒
      "q+": Math.floor((datetime.getMonth() + 3) / 3), // 季度
      S: datetime.getMilliseconds(), // 毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (datetime.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }
    return fmt;
  }
  // 获取总时长
  static formatSeconds(value, needSenconds) {
    var theTime = parseInt(value / 1000); // 秒
    var middle = 0; // 分
    var hour = 0; // 小时
    var days = 0; // 天数
    if (theTime > 60) {
      middle = parseInt(theTime / 60);
      theTime = parseInt(theTime % 60);
      if (middle > 60) {
        hour = parseInt(middle / 60);
        middle = parseInt(middle % 60);
      }
    }
    hour = hour > 9 ? hour : "0" + hour;
    middle = middle > 9 ? middle : "0" + middle;
    theTime = parseInt(theTime) < 10 ? "0" + theTime : theTime;
    return needSenconds ? hour + ":" + middle + ":" + theTime : hour + ":" + middle;
  }

  // 文字转*号
  static plusXing(str, frontLen, endLen) {
    if (!str) return "";
    str = String(str);
    if (str.length <= frontLen + endLen) return str;
    var len = str.length - frontLen - endLen;
    var xing = "";
    if (Number(len) > 5) len = 5;
    for (var i = 0; i < len; i++) {
      xing += "*";
    }
    return str.substr(0, frontLen) + xing + str.substr(str.length - endLen);
  }

  // 获取每个时间段的时间
  static getsomeDate(type, search = true) {
    var today = new Date();
    var nowDay = today.getDate(); // 当前日
    var nowMonth = today.getMonth(); // 当前月
    var nowYear = today.getFullYear(); // 当前年
    var nowDayOfWeek = today.getDay(); // 今天本周的第几天
    var start = today;
    var end = today;
    switch (type) {
      // /昨日
      case 1:
        today = start = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 1);
        break;
      // /本周
      case 2:
        start = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
        break;
      // /本月
      case 3:
        start = new Date(nowYear, nowMonth, 1);
        break;
      // 本年
      case 4:
        start = new Date(nowYear, 0, 1);
        break;
      // 上月
      case 5:
        start = new Date(Number(this.lastMonthDate()[0]), Number(this.lastMonthDate()[1] - 1), 1);
        end = new Date(Number(this.lastMonthDate()[0]), Number(this.lastMonthDate()[1] - 1), Number(this.lastMonthDate()[2]));
        break;
      // 一年的上半年
      case 6:
        start = new Date(nowYear, 0, 1);
        if (new Date(nowYear, 5, 30).getTime() > new Date().getTime()) {
          end = today;
        } else {
          end = new Date(nowYear, 5, 30);
        }
        break;
      // 今日之前的半年
      case 7:
        start = moment().subtract(6, "month").format("YYYY-MM-DD");
        end = today;
        break;
    }
    if (type == 7) {
      return [start, this.formatDate(end, "yyyy-MM-dd")];
    }
    if (type == 5 || type == 6) {
      return [this.formatDate(start, "yyyy-MM-dd"), this.formatDate(end, "yyyy-MM-dd")];
    } else {
      return [this.formatDate(start, "yyyy-MM-dd"), this.formatDate(today, "yyyy-MM-dd")];
    }
  }
  // 获取上个月
  static lastMonthDate(bool) {
    var Nowdate = new Date();
    var vYear = Nowdate.getFullYear();
    var vMon = Nowdate.getMonth() + 1;
    var vDay = 31;
    // 每个月的最后一天日期（为了使用月份便于查找，数组第一位设为0）
    var daysInMonth = new Array(0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    if (vMon == 1) {
      vYear = Nowdate.getFullYear() - 1;
      vMon = 12;
    } else {
      vMon = vMon - 1;
    }
    // 若是闰年，二月最后一天是29号
    if ((vYear % 4 == 0 && vYear % 100 != 0) || vYear % 400 == 0) {
      daysInMonth[2] = 29;
    }
    if (daysInMonth[vMon] < vDay) {
      vDay = daysInMonth[vMon];
    }
    if (vDay < 10) {
      vDay = "0" + vDay;
    }
    if (vMon < 10) {
      vMon = "0" + vMon;
    }
    var date = [vYear, vMon, vDay];
    return date;
  }
  // 判断是否是数字
  static isNumber(number) {
    var re = /^[0-9 Xx]*$/g; // 判断字符串是否为数字     //判断正整数 /^[1-9]+[0-9]*]*$/
    if (!re.test(number)) {
      return false;
    } else {
      return true;
    }
  }
  static formatVideoSeconds(value) {
    if (value < 0) value = 0;
    var theTime = parseInt(value || 0); // 秒
    var middle = 0; // 分
    var hour = 0; // 小时
    if (theTime > 60) {
      middle = parseInt(theTime / 60);
      theTime = parseInt(theTime % 60);
      if (middle > 60) {
        hour = parseInt(middle / 60);
        middle = parseInt(middle % 60);
      }
    }
    hour = parseInt(hour) < 10 ? "0" + hour : hour;
    middle = parseInt(middle) < 10 ? "0" + middle : middle;
    theTime = parseInt(theTime) < 10 ? "0" + theTime : theTime;
    return hour + ":" + middle + ":" + theTime;
  }
  static isPhoneNumber(value) {
    var ret = /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$|16[0-9]{9}$|17[0-9]{9}$|19[0-9]{9}$/;
    if (!ret.test(value)) return false;
    else return true;
  }
  /**
   * 求数组差集的函数, 用法: arrDiff([2,3],[1,2,3,4,5])
   * @param {Array} arr1 数组1 - 短数组
   * @param {Array} arr2 数组2 - 长数组
   * @param {Boolean} similarMatch 相似匹配
   */
  static arrDiff(arr1, arr2, similarMatch) {
    const longArr = arr1.length > arr2.length ? arr1 : arr2;
    const shortArr = arr1.length > arr2.length ? arr2 : arr1;
    return longArr.filter((i) => {
      if (similarMatch) {
        let j = true;
        for (let v = 0; v < shortArr.length; v++) {
          // 循环对比长度
          if (shortArr[v]) {
            j = shortArr[v].length > i.length ? shortArr[v].indexOf(i) < 0 : i.indexOf(shortArr[v]) < 0;
            if (!j) {
              // 找到一个匹配的退出循环
              break;
            }
          }
        }
        return j;
      } else {
        return shortArr.indexOf(i) < 0;
      }
    });
  }
  // 获取当前日期
  static getDate() {
    var dd = new Date();
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
    var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
    return y + "-" + m + "-" + d;
  }
  // 获取当前时间
  static getTime() {
    var dd = new Date();
    var h = dd.getHours();
    var m = dd.getMinutes();
    var s = dd.getSeconds();
    return h + ":" + m + ":" + s;
  }
  // date 代表指定的日期，格式：2018-09-27
  // day 传-1表始前一天，传1表始后一天
  // JS获取指定日期的前一天，后一天
  static getNextDate(date, day) {
    var dd = new Date(date);
    dd.setDate(dd.getDate() + day);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
    var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
    return y + "-" + m + "-" + d;
  }
  // 递归去除级联选择的最后一层空的children
  static getTreeData(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].children.length < 1) {
        // 最后一级没有数据将children变成undefined
        data[i].children = undefined;
      } else {
        // children不为空时继续调用该方法
        this.getTreeData(data[i].children);
      }
    }
    return data;
  }
  // 第三方嵌套 提交数据给iframe父级页面
  static postMessage(event_type, event_value) {
    if (this.AuthCaller.getUserValue("thirdparty") == 1) {
      // 第三方嵌套系统传递参数跳转页面
      window.parent.postMessage(
        {
          event_type,
          event_value,
        },
        "*"
      );
      return false;
    }
    return true;
  }

  /**
   * 校验是否为url地址
   * @param {String} str_url 要传入的url参数
   */
  static IsURL(str_url) {
    // 校验是否为网络地址
    var strRegex =
      "^((https|http|ftp|rtsp|mms)?://)" +
      "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + //ftp的user@
      "(([0-9]{1,3}.){3}[0-9]{1,3}" + // IP形式的URL- 199.194.52.184
      "|" + // 允许IP和DOMAIN（域名）
      "([0-9a-z_!~*'()-]+.)*" + // 域名- www.
      "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]." + // 二级域名
      "[a-z]{2,6})" + // first level domain- .com or .museum
      "(:[0-9]{1,4})?" + // 端口- :80
      "((/?)|" + // a slash isn't required if there is no file name
      "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
    var re = new RegExp(strRegex);
    if (re.test(str_url)) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * 深拷贝函数
   * @param {Object} obj 传入一个需要深度克隆的对象或数组
   */
  static deepClone(obj) {
    var target = {};
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === "object") {
          target[key] = this.deepClone(obj[key]);
        } else {
          target[key] = obj[key];
        }
      }
    }
    return target;
  }

  /**
   * 特殊字符转Unicode函数
   * @param {String} str 要转换的特殊字符
   */
  static toUnicode(str) {
    var value = "";
    for (var i = 0; i < str.length; i++) value += "&#" + str.charCodeAt(i) + ";";
    return value;
  }
}
