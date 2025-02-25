import { reduceEvents } from './events';

describe('reduceEvents', () => {
  it('should return true when events is "full"', () => {
    const result = reduceEvents('full', 'event1', 'event2', 'any');
    expect(result).toBe(true);
  });

  it('should return true when all events match', () => {
    const events = [{ event1: ['event2'] }, 'event3'];
    const result = reduceEvents(events, 'event1', 'event2');
    expect(result).toBe(true);
  });

  it('should return false when an event does not match', () => {
    const events = [{ event1: ['event2'] }, 'event3'];
    const result = reduceEvents(events, 'event1', 'event3', 'event4');
    expect(result).toBe(false);
  });

  it('should return false when an event key does not match', () => {
    const events = [{ event1: ['event2'] }, 'event3'];
    const result = reduceEvents(events, 'event4', 'event2');
    expect(result).toBe(false);
  });

  it('should handle string events correctly', () => {
    const events = ['event1', 'event2'];
    const result = reduceEvents(events, 'event1', 'event2');
    expect(result).toBe(true);
  });

  it('should handle mixed string and object events correctly', () => {
    const events = ['event1', { event2: ['event3'] }];
    const result = reduceEvents(events, 'event2', 'event3', 'event1');
    expect(result).toBe(true);
  });
});
