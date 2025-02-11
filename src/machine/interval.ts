import sleep from '@bemedev/sleep';

type Params = {
  id: string;
  callback: () => void;
  interval: number;
  forTest?: boolean;
};

class IntervalTimer {
  #timerId: NodeJS.Timeout | undefined = undefined;

  #state: 'idle' | 'active' | 'paused' = 'idle';

  #remaining = 0;
  #startTime!: number;

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
    return this.#forTest === undefined || this.#forTest === true;
  }

  get canStart() {
    return this.#state === 'idle' || this.#state === 'paused';
  }

  get state() {
    return this.#state;
  }

  start = () => {
    if (this.canStart) {
      const check = this.#state === 'paused' && !this.isTest;

      if (check) sleep(this.#remaining).then(this.#build);
      else this.#build();
    }
  };

  #build = () => {
    const callback = () => {
      this.#callback();
      ++this.#ticks;
    };

    this.#timerId = setInterval(callback, this.#interval);

    this.#startTime = Date.now();
    this.#ticks = 0;
    this.#state = 'active';
  };

  pause(): void {
    if (this.#state !== 'active') return;

    if (this.#timerId) clearInterval(this.#timerId);
    this.#remaining =
      Date.now() - this.#ticks * this.#interval - this.#startTime;

    this.#state = 'paused';
  }

  [Symbol.asyncDispose] = () => {
    if (this.#timerId) clearInterval(this.#timerId);
  };

  [Symbol.dispose] = () => {
    if (this.#timerId) clearInterval(this.#timerId);
  };
}

export type { IntervalTimer as IntervalTimer };

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
