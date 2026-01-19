import { Pool } from "./Pool";

export class Point {
  public static TEMP: Point = new Point();
  public static EMPTY: Point = new Point();
  
  public x: number;
  public y: number;
  
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
  
  public static create(): Point {
    return Pool.getItemByClass("Point", Point)
  }
  
  public setTo(x: number, y: number): Point {
    this.x = x;
    this.y = y;
    return this;
  }
  
  public reset(): Point {
    this.x = this.y = 0;
    return this;
  }
  
  public recover(): void {
    Pool.recover("Point", this.reset());
  }
  
  public distance(x: number, y: number): number {
    return Math.sqrt((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y));
  }
  
  public toString(): string {
    return `${this.x},${this.y}`;
  }
  
  public normalize(): void {
    const d: number = Math.sqrt(this.x * this.x + this.y * this.y);
    if (d > 0) {
      const id: number = 1.0 / d;
      this.x *= id;
      this.y *= id;
    }
  }
  
  public copy(point: Point): Point {
    return this.setTo(point.x, point.y);
  }
}