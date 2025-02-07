class IntervalTimer {
  private timerId: NodeJS.Timeout | null = null;
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
    this.timerId = setInterval(this.callback, this.interval);
    this.state = 'running';
  };

  pause(): void {
    if (this.state !== 'running') return;

    if (this.timerId) clearInterval(this.timerId);
    this.state = 'paused';
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
