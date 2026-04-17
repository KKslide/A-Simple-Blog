type QueryValue = string | number | boolean

export default class utils {
  // 对字符串中的{i}字符进行替换处理
  static format(str: string, ...args: unknown[]) {
    if (typeof str === "undefined" || str == null || str == "" || str == "undefined") {
      return str;
    }
    for (let i = 0; i < args.length; i++) {
      const re = new RegExp("\\{" + i + "\\}", "gm");
      str = str.replace(re, String(args[i]));
    }
    return str;
  }

  // 获取页面链接参数
  static getQuery(url: string, name: string) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const r = url.substr(1).match(reg);
    if (r != null) {
      return r[2];
    }
    return null;
  }
  // 将字面量对象拼接为字符串参数，如 {a:1, b:2} => "a=1&b=2"
  static objectToQueryString(obj: Record<string, QueryValue> | null | undefined): string {
    if (!obj) return "";
    return Object.keys(obj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(obj[key]))}`)
      .join("&");
  }
  // 节流
  static _throttle<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | null = null
    return function (...args: Parameters<T>): void {
      if (!timer) {
        timer = setTimeout(() => {
          fn(...args)
          timer = null
        }, delay)
      }
    }
  }
  // 防抖
  static _debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
    const delayTime = delay || 200;
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function (...args: Parameters<T>): void {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null
        fn(...args)
      }, delayTime)
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
  static exithttp(url: string): boolean {
    if (url.indexOf("http://") > -1 || url.indexOf("https://") > -1) {
      return true;
    } else {
      return false;
    }
  }

  static version() {
    const u = navigator.userAgent;
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
      qq: /\sQQ/i.test(u), //是否QQ
    };
  }

  /** 获得浏览器***/
  static browse(): string {
    const browser: Record<string, boolean | undefined | string> = {};
    const userAgent = navigator.userAgent.toLowerCase();
    let match: RegExpMatchArray | null;

    if ((match = userAgent.match(/msie ([\d.]+)/))) {
      browser.ie = match[1];
    } else if ((match = userAgent.match(/firefox\/([\d.]+)/))) {
      browser.firefox = match[1];
    } else if ((match = userAgent.match(/chrome\/([\d.]+)/))) {
      browser.chrome = match[1];
    } else if ((match = userAgent.match(/opera.([\d.]+)/))) {
      browser.opera = match[1];
    } else if ((match = userAgent.match(/version\/([\d.]+).*safari/))) {
      browser.safari = match[1];
    }

    if (browser.ie) return `IE ${browser.ie}`;
    if (browser.firefox) return `firefox ${browser.firefox}`;
    if (browser.chrome) return `chrome ${browser.chrome}`;
    if (browser.opera) return `opera ${browser.opera}`;
    if (browser.safari) return `safari ${browser.safari}`;

    return "unknown";
  }

  /** 获得操作系统***/
  static clientOs() {
    // 0表示windows,1表示mac,2表示linux
    const isWin = navigator.platform == "Win32" || navigator.platform == "Windows";
    const isMac = navigator.platform == "Mac68K" || navigator.platform == "MacPPC" || navigator.platform == "Macintosh" || navigator.platform == "MacIntel";
    if (isMac) {
      return 1;
    }
    const isUnix = navigator.platform == "X11" && !isWin && !isMac;
    if (isUnix) {
      return 2;
    }
    const isLinux = String(navigator.platform).indexOf("Linux") > -1;
    if (isLinux) {
      return 2;
    }
    if (isWin) {
      return 0;
    }
    return 2;
  }

  // 时间戳转时间
  // static formatDate(d: Date | string = "", fmt: string, isString: boolean = false): string {
  //   let datetime: Date;

  //   if (isString) {
  //     // 将字符串格式的日期转换为 Date
  //     datetime = new Date(Date.parse((d as string).replace(/-/g, "/")));
  //   } else if (d instanceof Date) {
  //     datetime = d;
  //   } else {
  //     // 如果 d 为空或无效，则使用当前时间
  //     datetime = new Date();
  //   }

  //   const o: Record<string, number> = {
  //     "M+": datetime.getMonth() + 1, // 月份
  //     "d+": datetime.getDate(), // 日
  //     "h+": datetime.getHours(), // 小时
  //     "m+": datetime.getMinutes(), // 分
  //     "s+": datetime.getSeconds(), // 秒
  //     "q+": Math.floor((datetime.getMonth() + 3) / 3), // 季度
  //     S: datetime.getMilliseconds(), // 毫秒
  //   };

  //   let formatted = fmt;

  //   // 年份处理
  //   const yearMatch = /(y+)/.exec(fmt);
  //   if (yearMatch && yearMatch[1]) {
  //     formatted = formatted.replace(
  //       yearMatch[1],
  //       (datetime.getFullYear() + "").substr(4 - yearMatch[1].length)
  //     );
  //   }

  //   // 月日时分秒处理
  //   for (const k in o) {
  //     const reg = new RegExp("(" + k + ")");
  //     const match = reg.exec(formatted);
  //     if (match) {
  //       if (match && typeof match[1] === "string") {
  //         formatted = formatted.replace(
  //           match[1],
  //           match[1].length === 1
  //             ? o[k].toString()
  //             : ("00" + o[k]).substr(("" + o[k]).length)
  //         );
  //       }
  //     }
  //   }

  //   return formatted;
  // }

  // 获取总时长
  static formatSeconds(value: number, needSenconds: number) {
    let theTime: number | string = parseInt(String(value / 1000)); // 秒
    let middle: number | string = 0; // 分
    let hour: number | string = 0; // 小时
    if (theTime > 60) {
      middle = parseInt(String(theTime / 60));
      theTime = parseInt(String(theTime % 60));
      if (middle > 60) {
        hour = parseInt(String(middle / 60));
        middle = parseInt(String(middle % 60));
      }
    }
    hour = hour > 9 ? hour : "0" + hour;
    middle = middle > 9 ? middle : "0" + middle;
    theTime = parseInt(String(theTime)) < 10 ? "0" + theTime : theTime;
    return needSenconds ? hour + ":" + middle + ":" + theTime : hour + ":" + middle;
  }

  // 文字转*号
  static plusXing(str: string, frontLen: number, endLen: number): string {
    if (!str) return "";
    str = String(str);
    if (str.length <= frontLen + endLen) return str;
    let len = str.length - frontLen - endLen;
    let xing = "";
    if (Number(len) > 5) len = 5;
    for (let i = 0; i < len; i++) {
      xing += "*";
    }
    return str.substr(0, frontLen) + xing + str.substr(str.length - endLen);
  }

  // 判断是否是数字
  static isNumber(number: string): boolean {
    const re = /^[0-9 Xx]*$/g; // 判断字符串是否为数字     //判断正整数 /^[1-9]+[0-9]*]*$/
    if (!re.test(number)) {
      return false;
    } else {
      return true;
    }
  }

  static isPhoneNumber(value: string): boolean {
    const ret = /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$|16[0-9]{9}$|17[0-9]{9}$|19[0-9]{9}$/;
    if (!ret.test(value)) return false;
    else return true;
  }

  /**
   * 求数组差集的函数, 用法: arrDiff([2,3],[1,2,3,4,5])
   * @param {Array} arr1 数组1 - 短数组
   * @param {Array} arr2 数组2 - 长数组
   * @param {Boolean} similarMatch 相似匹配
   */
  // static arrDiff(arr1: [], arr2: [], similarMatch:boolean) {
  //   const longArr = arr1.length > arr2.length ? arr1 : arr2;
  //   const shortArr = arr1.length > arr2.length ? arr2 : arr1;
  //   return longArr.filter((i) => {
  //     if (similarMatch) {
  //       let j = true;
  //       for (let v = 0; v < shortArr.length; v++) {
  //         // 循环对比长度
  //         if (shortArr[v]) {
  //           j = shortArr[v].length > i.length ? shortArr[v].indexOf(i) < 0 : i.indexOf(shortArr[v]) < 0;
  //           if (!j) {
  //             // 找到一个匹配的退出循环
  //             break;
  //           }
  //         }
  //       }
  //       return j;
  //     } else {
  //       return shortArr.indexOf(i) < 0;
  //     }
  //   });
  // }


  // 递归去除级联选择的最后一层空的children
  static getTreeData(data: Record<string, unknown>[]) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      if (!item) continue
      if (item.children && (item.children as unknown[]).length < 1) {
        // 最后一级没有数据将children变成undefined
        item.children = undefined;
      } else if (item.children) {
        // children不为空时继续调用该方法
        this.getTreeData(item.children as Record<string, unknown>[]);
      }
    }
    return data;
  }

  /**
   * 校验是否为url地址
   * @param {String} str_url 要传入的url参数
   */
  static IsURL(str_url: string): boolean {
    // 校验是否为网络地址
    const strRegex =
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
    const re = new RegExp(strRegex);
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
  static deepClone<T>(obj: T): T {
    // 不是对象或数组, 直接返回
    if (obj === null || typeof obj !== 'object') return obj
    // 数组
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as T
    }
    // 对象
    const target: Record<string, unknown> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as Record<string, unknown>)[key]
        target[key] = this.deepClone(value)
      }
    }
    return target as T;
  }

  /**
   * 特殊字符转Unicode函数
   * @param {String} str 要转换的特殊字符
   */
  static toUnicode(str: string) {
    let value = "";
    for (let i = 0; i < str.length; i++) value += "&#" + str.charCodeAt(i) + ";";
    return value;
  }
}
