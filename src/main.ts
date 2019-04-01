interface GameLoopConfig {
  msPerUpdate: number;
  maxFPS: number;
}

type State<T = unknown> = T;

type TickCallback<T> = (delta: number, state: State<T>) => State<T>;
type Subscription<T> = (state: State<T>) => void;

const defaultConfig: GameLoopConfig = {
  msPerUpdate: (1 / 60) * 1000,
  maxFPS: 30
};

export class GameLoop<T> {
  private running = false;

  private callbacks: Array<TickCallback<T>> = [];
  private runOnce: Array<TickCallback<T>> = [];
  private subscriptions: Array<Subscription<T>> = [];

  private lastTick: number | undefined;
  private lastRender: number | undefined;

  private lag = 0;

  constructor(
    private state: State<T>,
    private config: GameLoopConfig = defaultConfig
  ) {}

  public start() {
    this.running = true;
    this.lastTick = Date.now();
    this.runLoop();
  }

  public stop() {
    this.running = false;
  }

  public addCallback(callback: TickCallback<T>) {
    this.callbacks = [...this.callbacks, callback];
  }

  public addRunOnce(callback: TickCallback<T>) {
    this.runOnce = [...this.runOnce, callback];
  }

  public subscribe(callback: Subscription<T>) {
    this.subscriptions = [...this.subscriptions, callback];
  }

  private render(state: State<T>) {
    const now = Date.now();

    if (!this.lastRender) {
      this.lastRender = now;
    }

    const timeSinceLastRender = now - this.lastRender;
    if (timeSinceLastRender >= (1 / this.config.maxFPS) * 1000) {
      this.subscriptions.forEach(subscription => subscription(state));
      this.lastRender = now;
    }
  }

  private runLoop() {
    if (!this.running) {
      return;
    }

    const now = Date.now();
    const delta = this.lastTick ? now - this.lastTick : 0;

    this.lastTick = now;
    this.lag = this.lag + delta;

    while (this.lag >= this.config.msPerUpdate && this.running) {
      this.state = this.callbacks.reduce<State<T>>(
        (state, callback) => callback(this.lag, state) || state,
        this.state
      );

      this.state = this.runOnce.reduce<State<T>>(
        (state, callback) => callback(this.lag, state) || state,
        this.state
      );

      this.runOnce = [];
      this.lag -= this.config.msPerUpdate;
    }

    this.render(this.state);

    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => this.runLoop);
    } else {
      setTimeout(() => this.runLoop(), 0);
    }
  }
}
