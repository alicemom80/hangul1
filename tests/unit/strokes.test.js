import { describe, test, expect } from 'vitest';
import { STROKES, strokesOf } from '../../src/data/strokes.js';
import { ANIMALS } from '../../src/data/zoo1.js';
import { buildPath } from '../../src/games/lineTrace.js';

describe('자음 획 자료', () => {
  test('1권 동물의 자음이 모두 있고, 획마다 점이 2개 이상이며 길이가 있다', () => {
    ANIMALS.forEach((a) => {
      const strokes = strokesOf(a.letter);
      expect(strokes.length).toBeGreaterThan(0);
      strokes.forEach((s) => expect(buildPath(s).length).toBeGreaterThan(10));
    });
  });
  test('획 수: ㄱ1 ㄴ1 ㄷ2 ㅅ2 ㅎ3 ㅋ2', () => {
    expect(Object.fromEntries(Object.entries(STROKES).map(([k, v]) => [k, v.length]))).toEqual({ 'ㄱ': 1, 'ㄴ': 1, 'ㄷ': 2, 'ㅅ': 2, 'ㅎ': 3, 'ㅋ': 2 });
  });
  test('없는 글자는 오류', () => {
    expect(() => strokesOf('ㅁ')).toThrow();
  });
});
