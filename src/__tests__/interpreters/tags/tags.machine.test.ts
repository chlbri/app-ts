import { constructTests } from '#fixtures';
import { interpret } from '#interpreter';
import { machine } from './tags.machine';

describe('Machine Tag Interpreter', () => {
  const service = interpret(machine);

  const { start, useStateValue, useNext, usePrev, useTags } =
    constructTests(service, ({ sender }) => ({
      useNext: sender('NEXT'),
      usePrev: sender('PREV'),
    }));

  it(...start());
  it(...useStateValue('idle'));
  it(...useTags('idle'));
  it(...useNext());
  it(...useStateValue('working'));
  it(...useTags('working', 'busy'));
  it(...usePrev());
  it(...useStateValue('idle'));
  it(...useTags('idle'));
  it(...useNext());
  it(...useStateValue('working'));
  it(...useTags('working', 'busy'));
  it(...useNext());
  it(...useStateValue('final'));
  it(...useTags());
});
