export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  callTimeoutMs?: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly callTimeoutMs: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 2;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 20000; // 20s recovery window
    this.callTimeoutMs = options.callTimeoutMs ?? 2500; // 2.5s strict API call timeout
  }

  public getState(): CircuitState {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      }
    }
    return this.state;
  }

  public async execute<T>(action: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const currentState = this.getState();
    if (currentState === 'OPEN') {
      throw new Error(`CircuitBreaker OPEN: AI service temporarily unavailable or timing out. Switched to high-speed deterministic heuristics.`);
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort(new Error(`AI Provider timed out after ${this.callTimeoutMs}ms`));
    }, this.callTimeoutMs);

    try {
      const result = await Promise.race([
        action(abortController.signal),
        new Promise<never>((_, reject) => {
          abortController.signal.addEventListener('abort', () => {
            reject(new Error(`AI Provider call timed out after ${this.callTimeoutMs}ms`));
          });
        }),
      ]);

      clearTimeout(timeoutId);
      this.onSuccess();
      return result;
    } catch (err: any) {
      clearTimeout(timeoutId);
      this.onFailure(err);
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(err: any): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  public getStatus() {
    return {
      state: this.getState(),
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      callTimeoutMs: this.callTimeoutMs,
      resetTimeoutMs: this.resetTimeoutMs,
    };
  }

  public reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

export const aiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 2,
  callTimeoutMs: 2500, // 2.5s strict timeout to prevent slow responses
  resetTimeoutMs: 20000,
});
