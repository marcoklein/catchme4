export class Vector {
  constructor(public x: number, public y: number) {}

  static of(x: number, y: number) {
    return new Vector(x, y);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const length = this.length();
    this.x /= length;
    this.y /= length;
    return this;
  }

  multiply(scalar: number) {
    this.x *= scalar;
    this.y * -scalar;
    return this;
  }
}
