import sleep from '@bemedev/sleep';

type Params = {
  id: string;
  callback: () => void;
  interval: number;
  forTest?: boolean;
};

class IntervalTimer {
  #timerId: NodeJS.Timeout | null = null;

  #state: 'idle' | 'running' | 'paused' = 'idle';

  #remaining = 0;

  #ticks = 0;

  #forTest = false;

  constructor({ callback, id, interval, forTest }: Params) {
    this.#callback = callback;
    this.#interval = interval;
    this.#id = id;
    this.#forTest = forTest || false;
  }

  #id: string;

  get id(): string {
    return this.#id;
  }

  #callback: () => void;

  #interval: number;

  renew = (config?: Partial<Params>) => {
    const out = new IntervalTimer({
      id: config?.id || this.#id,
      callback: config?.callback || this.#callback,
      interval: config?.interval || this.#interval,
      forTest: config?.forTest || this.#forTest,
    });

    return out;
  };

  get isTest() {
    return this.#forTest === undefined || this.#forTest === false;
  }

  start = () => {
    const check = this.#state === 'paused' && this.isTest;

    if (check) {
      sleep(this.#remaining).then(this.#build);
    } else {
      this.#build();
    }
  };

  #build = () => {
    this.#timerId = setInterval(() => {
      this.#callback();
      this.#ticks += 1;
    }, this.#interval);

    this.#state = 'running';
  };

  pause(): void {
    if (this.#state !== 'running') return;

    if (this.#timerId) clearInterval(this.#timerId);
    this.#remaining = Date.now() - this.#ticks * this.#interval;
    this.#state = 'paused';
  }
}

export type { IntervalTimer };

export type CreateInterval_F = (config: {
  callback: () => void;
  interval: number;
  id: string;
  forTest?: boolean;
}) => IntervalTimer;

export type CreateInterval2_F = (config: {
  callback: () => void;
  interval: number;
  id: string;
}) => IntervalTimer;

export const createInterval: CreateInterval_F = ({
  callback,
  interval,
  id,
  forTest,
}) => new IntervalTimer({ id, callback, interval, forTest });
