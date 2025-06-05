/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @param format 格式化模板，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  
  const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
  
  return format
    .replace('YYYY', `${year}`)
    .replace('MM', pad(month))
    .replace('DD', pad(day))
    .replace('HH', pad(hours))
    .replace('mm', pad(minutes))
    .replace('ss', pad(seconds));
};

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (obj instanceof Object) {
    const copy = {} as Record<string, any>;
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as Record<string, any>)[key]);
    });
    return copy as T;
  }
  
  return obj;
};

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间，默认为300ms
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number = 300): ((...args: Parameters<T>) => void) => {
  let timer: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    if (timer) {
      clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param delay 延迟时间，默认为300ms
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(fn: T, delay: number = 300): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  
  return function(this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
};

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * 将对象转换为查询字符串
 * @param params 参数对象
 * @returns 查询字符串
 */
export const objectToQueryString = (params: Record<string, any>): string => {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * 从查询字符串解析参数
 * @param queryString 查询字符串
 * @returns 参数对象
 */
export const queryStringToObject = (queryString: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const queries = queryString.replace(/^\?/, '').split('&');
  
  queries.forEach(query => {
    const [key, value] = query.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });
  
  return params;
};

/**
 * 将数组转换为树形结构
 * @param items 数组
 * @param id ID字段名
 * @param parentId 父ID字段名
 * @param childrenKey 子节点字段名
 * @returns 树形结构
 */
export const arrayToTree = <T extends Record<string, any>>(
  items: T[],
  id: string = 'id',
  parentId: string = 'parentId',
  childrenKey: string = 'children'
): T[] => {
  const itemMap: Record<string, T> = {};
  const roots: T[] = [];
  
  // 创建一个临时的映射表
  items.forEach(item => {
    itemMap[item[id]] = { ...item, [childrenKey]: [] };
  });
  
  // 将每个项目添加到其父项的子项数组中
  items.forEach(item => {
    const parentIdValue = item[parentId];
    
    if (parentIdValue && itemMap[parentIdValue]) {
      itemMap[parentIdValue][childrenKey].push(itemMap[item[id]]);
    } else {
      roots.push(itemMap[item[id]]);
    }
  });
  
  return roots;
};
