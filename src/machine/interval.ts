class IntervalTimer {
  private timerId: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private remaining: number = 0;
  private state: 'idle' | 'running' | 'paused' = 'idle';

  constructor(config: {
    id: string;
    callback: () => void;
    interval: number;
  }) {
    this.callback = config.callback;
    this.interval = config.interval;
    this.id = config.id;
  }

  id: string;
  private callback: () => void;
  private interval: number;

  start = () => {
    if (this.state === 'paused') {
      setTimeout(this.timeoutCallback.bind(this), this.remaining);
    } else {
      this.startTime = Date.now();
      this.timerId = setInterval(this.callback, this.interval);
    }
    this.state = 'running';
  };

  pause(): void {
    if (this.state !== 'running') return;

    this.remaining = this.interval - (Date.now() - this.startTime);
    if (this.timerId) clearInterval(this.timerId);
    this.state = 'paused';
  }

  private timeoutCallback(): void {
    if (this.state !== 'paused') return;
    this.callback();

    this.startTime = Date.now();
    this.timerId = setInterval(this.callback, this.interval);
    this.state = 'idle';
  }
}

export type { IntervalTimer };

export const setInterval2 = ({
  callback,
  interval,
  id,
}: {
  callback: () => void;
  interval: number;
  id: string;
}): IntervalTimer => {
  return new IntervalTimer({ id, callback, interval });
};
