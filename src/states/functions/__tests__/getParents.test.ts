import { getParents } from '../getParents';

describe('getParents', () => {
  test('should return correct parents for top level state', () => {
    const result = getParents('/state1');
    expect(result).toEqual(['/', '/state1']);
  });

  test('should return correct parents for second level state', () => {
    const result = getParents('/state1/state2');
    // Parents include: root, the path itself, and intermediate paths
    expect(result).toStrictEqual(['/', '/state1/state2', '/state1']);
  });

  test('should return correct parents for deeply nested state', () => {
    const result = getParents('/state1/state2/state3/state4');
    expect(result).toEqual([
      '/',
      '/state1/state2/state3/state4',
      '/state1/state2/state3',
      '/state1/state2',
      '/state1',
    ]);
  });

  test('should handle empty parts correctly', () => {
    const result = getParents('/state1//state3');
    expect(result).toEqual([
      '/',
      '/state1//state3',
      '/state1/',
      '/state1',
    ]);
  });

  test('should handle path starting with delimiter correctly', () => {
    const result = getParents('/');
    expect(result).toEqual(['/']);
  });

  test('should handle consecutive delimiters correctly', () => {
    const result = getParents('//state1');
    expect(result).toEqual(['/', '//state1']);
  });

  test('should handle path ending with delimiter correctly', () => {
    const result = getParents('/state1/');
    expect(result).toEqual(['/', '/state1/', '/state1']);
  });
});
