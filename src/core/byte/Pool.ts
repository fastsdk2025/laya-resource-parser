export class Pool {
  private static _CLSID: number = 0;
  private static POOLSIGN: string = "__InPool";
  private static _poolDic: any = {};

  static getPoolBySign(sign: string): any[] {
    return Pool._poolDic[sign] || (Pool._poolDic[sign] = []);
  }

  static clearBySign(sign: string): void {
    if (Pool._poolDic[sign]) Pool._poolDic[sign].length = 0;
  }

  static recover(sign: string, item: any): void {
    if (item[Pool.POOLSIGN]) return;
    item[Pool.POOLSIGN] = true;
    Pool.getPoolBySign(sign).push(item);
  }


  static recoverByClass(instance: any): void {
    if (instance) {
      var className: string = instance["__className"] || instance.constructor._$gid;
      if (className) Pool.recover(className, instance);
    }
  }

  private static _getClassSign(cla: any): string {
    var className = cla["__className"] || cla["_$gid"];
    if (!className) {
      cla["_$gid"] = className = Pool._CLSID + "";
      Pool._CLSID++;
    }
    return className;
  }

  static createByClass<T>(cls: new () => T): T {
    return Pool.getItemByClass(Pool._getClassSign(cls), cls);
  }

  static getItemByClass<T>(sign: string, cls: new () => T): T {
    if (!Pool._poolDic[sign]) return new cls();

    var pool = Pool.getPoolBySign(sign);
    if (pool.length) {
      var rst = pool.pop();
      rst[Pool.POOLSIGN] = false;
    } else {
      rst = new cls();
    }
    return rst;
  }

  static getItemByCreateFun(sign: string, createFun: Function, caller: any = null): any {
    var pool: any[] = Pool.getPoolBySign(sign);
    var rst: any = pool.length ? pool.pop() : createFun.call(caller);
    rst[Pool.POOLSIGN] = false;
    return rst;
  }

  static getItem(sign: string): any {
    var pool: any[] = Pool.getPoolBySign(sign);
    var rst: any = pool.length ? pool.pop() : null;
    if (rst) {
      rst[Pool.POOLSIGN] = false;
    }
    return rst;
  }

}