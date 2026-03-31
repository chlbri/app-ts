export const START_ORDERED_FNS = [
  'collectChildren',
  'throwing1',
  'startStatus',
  'flush',
  'startInitialEntries',
  'startChildren',
  'throwing2',
] as const;

export const NEXT_ORDERED_FNS = [
  'collectChildren',
  'incrementSelfTransitions',
  'pauseActivities',
  'performActivities',
  'pauseChildren',
  'stopChildren',
  'startChildren',
  'resumeChildren',
  'performAbortablePromises',
] as const;

export const PAUSE_ORDERED_FNS = [
  'pauseAllActivities',
  'abortPromises',
  'makeBusy',
  'closeSubscribers',
  'pauseChildren',
  'pauseTimeoutActions',
] as const;

export const RESUME_ORDERED_FNS = [
  'performActivities',
  'makeBusy',
  'openSubscribers',
  'resumeTimeoutActions',
  'resumeChildren',
] as const;

export const STOP_ORDERED_FNS = [
  'pause',
  'makeBusy',
  'unsubscribeSubscribers',
  'stopChildren',
  'disposeIntervals',
  'stopTimeoutActions',
  'stopSchedulers',
] as const;
