/**
 * High-performance spatial hash grid for 500+ monsters at 60fps.
 * Uses integer cell keys and reusable bucket arrays to avoid GC pressure.
 */
export class SpatialGrid {
  private readonly cellSize: number;
  private readonly buckets = new Map<number, number[]>();
  private readonly usedKeys: number[] = [];
  private readonly queryResult: number[] = [];

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  private hash(cx: number, cy: number): number {
    // Pack two 16-bit signed ints into a single safe integer key
    return ((cx + 32768) << 16) | ((cy + 32768) & 0xffff);
  }

  public clear(): void {
    for (let i = 0; i < this.usedKeys.length; i++) {
      const bucket = this.buckets.get(this.usedKeys[i]);
      if (bucket) bucket.length = 0;
    }
    this.usedKeys.length = 0;
  }

  public insert(index: number, x: number, y: number): void {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const key = this.hash(cx, cy);
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = [];
      this.buckets.set(key, bucket);
    }
    if (bucket.length === 0) {
      this.usedKeys.push(key);
    }
    bucket.push(index);
  }

  /**
   * Returns a shared array reference of candidate indices in the AABB around (x, y).
   * Note: Do not hold references across consecutive calls.
   */
  public query(x: number, y: number, radius: number): number[] {
    this.queryResult.length = 0;
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const bucket = this.buckets.get(this.hash(cx, cy));
        if (!bucket || bucket.length === 0) continue;
        for (let i = 0; i < bucket.length; i++) {
          this.queryResult.push(bucket[i]);
        }
      }
    }
    return this.queryResult;
  }
}
