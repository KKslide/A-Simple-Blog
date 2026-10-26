/**
 * 餐饮油烟大管家 - 工具函数
 * 从原项目 JS 迁移, 类型保持宽松.
 */

const deepClone = function (target: any): any {
  let result: any
  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      result = []
      for (const i in target) {
        result.push(deepClone(target[i]))
      }
    } else if (target === null) {
      result = null
    } else if (target.constructor === RegExp) {
      result = target
    } else {
      result = {}
      for (const i in target) {
        result[i] = deepClone(target[i])
      }
    }
  } else {
    result = target
  }
  return result
}

/**
 * 日期格式化, 调用方式 dateFormat('YYYY-mm-dd HH:MM', new Date())
 * @param fmt 日期格式
 * @param date 时间戳或日期
 */
const dateFormat = function (fmt: string, date?: number | string | Date): string {
  const _date = date ? new Date(date) : new Date()
  let ret: RegExpExecArray | null
  const opt: Record<string, string> = {
    'Y+': _date.getFullYear().toString(),
    'm+': (_date.getMonth() + 1).toString(),
    'd+': _date.getDate().toString(),
    'H+': _date.getHours().toString(),
    'M+': _date.getMinutes().toString(),
    'S+': _date.getSeconds().toString(),
  }
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'))
    }
  }
  return fmt
}

/** 设置 cookie */
function setCookie(name: string, value: string, exdays?: number): void {
  let cookie = name + '=' + value + ';'
  if (exdays) {
    const d = new Date()
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
    const expires = 'expires=' + d.toUTCString()
    cookie = cookie + ' ' + expires
  }
  document.cookie = cookie
}

/** 获取 cookie */
function getCookie(cname: string): string {
  const name = cname + '='
  const cookie = document.cookie.split(';')
  for (let i = 0, len = cookie.length; i < len; i++) {
    const c = cookie[i].trim()
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

/** 返回时间戳对应的日期时间 (YYYY-MM-DD HH:mm) */
const myCreateDateTime = function createDateTime(time?: number | string | null): string {
  if (time == undefined || time == '' || time == 0) {
    return ''
  }

  const date = new Date(Number(time) * 1000)
  const y = date.getFullYear()
  let m: number | string = date.getMonth() + 1
  m = m < 10 ? '0' + m : m

  let d: number | string = date.getDate()
  d = d < 10 ? '0' + d : d

  let h: number | string = date.getHours()
  h = h < 10 ? '0' + h : h

  let M: number | string = date.getMinutes()
  M = M < 10 ? '0' + M : M

  return y + '-' + m + '-' + d + ' ' + h + ':' + M
}

/** 返回时间戳对应的日期 (YYYY-MM-DD) */
const myCreateDate = function createDate(time?: number | string | null): string {
  if (time == undefined || time == '' || time == 0) {
    return ''
  }

  const date = new Date(Number(time) * 1000)
  const y = date.getFullYear()
  let m: number | string = date.getMonth() + 1
  m = m < 10 ? '0' + m : m

  let d: number | string = date.getDate()
  d = d < 10 ? '0' + d : d

  return y + '-' + m + '-' + d
}

/** 防抖 */
const debounce = function (fn: (...args: any[]) => void, delay?: number): (...args: any[]) => void {
  const _delay = delay || 200
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }
    const th = this
    timer = setTimeout(() => {
      timer = null
      fn.apply(th, args)
    }, _delay)
  }
}

export { deepClone, dateFormat, setCookie, getCookie, myCreateDateTime, myCreateDate, debounce }
