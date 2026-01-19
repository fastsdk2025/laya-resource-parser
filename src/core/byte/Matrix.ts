import { Point } from "./Point";
import { Pool } from "./Pool";

export class Matrix {
  public static EMPTY: Matrix = new Matrix();
  public static TEMP: Matrix = new Matrix();
  public static _createFun: Function | null = null;
  
  public a: number = 1;
  public b: number = 0;
  public c: number = 0;
  public d: number = 1;
  public tx: number = 0;
  public ty: number = 0;
  private _bTransform: boolean = false;
  
  constructor(
    a: number = 1,
    b: number = 0,
    c: number = 0,
    d: number = 1,
    tx: number = 0,
    ty: number = 0,
    nums: number = 0
  ) {
    if (Matrix._createFun != null) {
      return Matrix._createFun(a, b, c, d, tx, ty, nums);
    }
    
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
    this._checkTransform();
  }
  
  private _checkTransform(): boolean {
    return this._bTransform = (this.a !== 1 || this.b !== 0 || this.c !== 0 || this.d !== 1);
  }
  
  public identity(): Matrix {
    this.a = this.d = 1;
    this.b = this.c = this.tx = this.ty = 0;
    this._bTransform = false;
    return this;
  }
  
  public setTranslate(x: number, y: number): Matrix {
    this.tx = x;
    this.ty = y;
    return this;
  }
  
  public translate(x: number, y: number): Matrix {
    this.tx += x;
    this.ty += y;
    return this;
  }
  
  public scale(sx: number, sy: number): Matrix {
    this.a *= sx;
    this.d *= sy;
    this.c *= sx;
    this.b *= sy;
    this.tx *= sx;
    this.ty *= sy;
    this._bTransform = true;
    return this;
  }
  
  public rotate(angle: number): Matrix {
    const cos: number = Math.cos(angle);
    const sin: number = Math.sin(angle);
    const a1: number = this.a;
    const c1: number = this.c;
    const tx1: number = this.tx;
    this.a = a1 * cos - this.b * sin;
    this.b = a1 * sin + this.b * cos;
    this.c = c1 * cos - this.d * sin;
    this.d = c1 * sin + this.d * cos;
    this.tx = tx1 * cos - this.ty * sin;
    this.ty = tx1 * sin + this.ty * cos;
    this._bTransform = true;
    return this;
  }
  
  public skew(x: number, y: number): Matrix {
    const tanX: number = Math.tan(x);
    const tanY: number = Math.tan(y);
    const a1: number = this.a;
    const b1: number = this.b;
    this.a += tanY * this.c;
    this.b += tanY * this.d;
    this.c += tanX * a1;
    this.d += tanX * b1;
    this._bTransform = true;
    return this;
  }

  public invertTransformPoint(out: Point): Point {
    const a1: number = this.a;
    const b1: number = this.b;
    const c1: number = this.c;
    const d1: number = this.d;
    const tx1: number = this.tx;
    const n: number = a1 * d1 - b1 * c1;

    const a2: number = d1 / n;
    const b2: number = -b1 / n;
    const c2: number = -c1 / n;
    const d2: number = a1 / n;
    const tx2: number = (c1 * this.ty - d1 * tx1) / n;
    const ty2: number = -(a1 * this.ty - b1 * tx1) / n;
    return out.setTo(a2 * out.x + c2 * out.y + tx2, b2 * out.x + d2 * out.y + ty2);
  }
  
  public transformPoint(out: Point): Point {
    return out.setTo(this.a * out.x + this.c * out.y + this.tx, this.b * out.x + this.d * out.y + this.ty);
  }

  public transformPointN(out: Point): Point {
    return out.setTo(this.a * out.x + this.c * out.y /*+ tx*/, this.b * out.x + this.d * out.y /*+ ty*/);
  }

  public getScaleX(): number {
    return this.b === 0 ? this.a : Math.sqrt(this.a * this.a + this.b * this.b);
  }

  public getScaleY(): number {
    return this.c === 0 ? this.d : Math.sqrt(this.c * this.c + this.d * this.d);
  }

  public invert(): Matrix {
    const a1: number = this.a;
    const b1: number = this.b;
    const c1: number = this.c;
    const d1: number = this.d;
    const tx1: number = this.tx;
    const n: number = a1 * d1 - b1 * c1;
    this.a = d1 / n;
    this.b = -b1 / n;
    this.c = -c1 / n;
    this.d = a1 / n;
    this.tx = (c1 * this.ty - d1 * tx1) / n;
    this.ty = -(a1 * this.ty - b1 * tx1) / n;
    return this;
  }

  public setTo(
    a: number,
    b: number,
    c: number,
    d: number,
    tx: number,
    ty: number
  ): Matrix {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
    return this;
  }
  
  public concat(matrix: Matrix): Matrix {
    const a: number = this.a;
    const c: number = this.c;
    const tx: number = this.tx;
    this.a = a * matrix.a + this.b * matrix.c;
    this.b = a * matrix.b + this.b * matrix.d;
    this.c = c * matrix.a + this.d * matrix.c;
    this.d = c * matrix.b + this.d * matrix.d;
    this.tx = tx * matrix.a + this.ty * matrix.c + matrix.tx;
    this.ty = tx * matrix.b + this.ty * matrix.d + matrix.ty;
    return this;
  }

  public static mul(m1: Matrix, m2: Matrix, out: Matrix): Matrix {
    const aa: number = m1.a, ab: number = m1.b, ac: number = m1.c, ad: number = m1.d, atx: number = m1.tx, aty: number = m1.ty;
    const ba: number = m2.a, bb: number = m2.b, bc: number = m2.c, bd: number = m2.d, btx: number = m2.tx, bty: number = m2.ty;
    if (bb !== 0 || bc !== 0) {
      out.a = aa * ba + ab * bc;
      out.b = aa * bb + ab * bd;
      out.c = ac * ba + ad * bc;
      out.d = ac * bb + ad * bd;
      out.tx = ba * atx + bc * aty + btx;
      out.ty = bb * atx + bd * aty + bty;
    } else {
      out.a = aa * ba;
      out.b = ab * bd;
      out.c = ac * ba;
      out.d = ad * bd;
      out.tx = ba * atx + btx;
      out.ty = bd * aty + bty;
    }
    return out;
  }

  public static mul16(m1: Matrix, m2: Matrix, out: any[]): any[] {
    const aa: number = m1.a, ab: number = m1.b, ac: number = m1.c, ad: number = m1.d, atx: number = m1.tx, aty: number = m1.ty;
    const ba: number = m2.a, bb: number = m2.b, bc: number = m2.c, bd: number = m2.d, btx: number = m2.tx, bty: number = m2.ty;
    if (bb !== 0 || bc !== 0) {
      out[0] = aa * ba + ab * bc;
      out[1] = aa * bb + ab * bd;
      out[4] = ac * ba + ad * bc;
      out[5] = ac * bb + ad * bd;
      out[12] = ba * atx + bc * aty + btx;
      out[13] = bb * atx + bd * aty + bty;
    } else {
      out[0] = aa * ba;
      out[1] = ab * bd;
      out[4] = ac * ba;
      out[5] = ad * bd;
      out[12] = ba * atx + btx;
      out[13] = bd * aty + bty;
    }
    return out;
  }

  public scaleEx(x: number, y: number): void {
    const ba: number = this.a;
    const bb: number = this.b;
    const bc: number = this.c;
    const bd: number = this.d;
    if (bb !== 0 || bc !== 0) {
      this.a = x * ba;
      this.b = x * bb;
      this.c = y * bc;
      this.d = y * bd;
    } else {
      this.a = x * ba;
      this.b = 0 * bd;
      this.c = 0 * ba;
      this.d = y * bd;
    }
    this._bTransform = true;
  }

  public rotateEx(angle: number): void {
    const cos: number = Math.cos(angle);
    const sin: number = Math.sin(angle);
    const ba: number = this.a;
    const bb: number = this.b;
    const bc: number = this.c;
    const bd: number = this.d;
    if (bb !== 0 || bc !== 0) {
      this.a = cos * ba + sin * bc;
      this.b = cos * bb + sin * bd;
      this.c = -sin * ba + cos * bc;
      this.d = -sin * bb + cos * bd;
    } else {
      this.a = cos * ba;
      this.b = sin * bd;
      this.c = -sin * ba;
      this.d = cos * bd;
    }
    this._bTransform = true;
  }
  
  public clone(): Matrix {
    const dec: Matrix = Matrix.create();
    dec.a = this.a;
    dec.b = this.b;
    dec.c = this.c;
    dec.d = this.d;
    dec.tx = this.tx;
    dec.ty = this.ty;
    dec._bTransform = this._bTransform;
    return dec;
  }

  public copyTo(dec: Matrix): Matrix {
    dec.a = this.a;
    dec.b = this.b;
    dec.c = this.c;
    dec.d = this.d;
    dec.tx = this.tx;
    dec.ty = this.ty;
    dec._bTransform = this._bTransform;
    return dec;
  }
  
  public toString(): string {
    return this.a + "," + this.b + "," + this.c + "," + this.d + "," + this.tx + "," + this.ty;
  }
  
  public destroy(): void {
    this.recover();
  }

  public recover(): void {
    Pool.recover("Matrix", this.identity());
  }
  
  public static create(): Matrix {
    return Pool.getItemByClass("Matrix", Matrix)
  }
}