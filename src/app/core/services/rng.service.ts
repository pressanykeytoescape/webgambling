import { Injectable } from '@angular/core';

/**
 * A simple deterministic pseudo random number generator.  The default
 * implementation uses the Mulberry32 algorithm.  A seed can be provided
 * on construction for deterministic test runs.  Consumers can call
 * `next()` to retrieve a float in the range [0,1).
 */
@Injectable({ providedIn: 'root' })
export class RngService {
  private state: number;

  constructor() {
    // Initialize with a time-based seed by default.  Tests can set
    // `state` directly for deterministic behaviour.
    this.state = Date.now() % 0xffffffff;
  }

  /**
   * Set the internal seed for deterministic behaviour.  Values are clamped
   * to a 32‑bit integer.
   */
  seed(seed: number): void {
    this.state = seed >>> 0;
  }

  /**
   * Return the next pseudo random float in [0, 1).
   */
  next(): number {
    // mulberry32 algorithm
    this.state += 0x6d2b79f5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return result;
  }
}