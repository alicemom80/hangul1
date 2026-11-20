import { describe, test, expect } from 'vitest';
import { STROKES, strokesOf } from '../../src/data/strokes.js';
import { ANIMALS as ANIMALS1 } from '../../src/data/zoo1.js';
import { ANIMALS as ANIMALS2 } from '../../src/data/zoo2.js';
import { ANIMALS as ANIMALS3 } from '../../src/data/zoo3.js';
import { buildPath } from '../../src/games/lineTrace.js';

describe('자음 획 자료', () => {
  test('1·2·3권 동물의 자음이 모두 있고, 획마다 점이 2개 이상이며 길이가 있다', () => {
    [...ANIMALS1, ...ANIMALS2, ...ANIMALS3].forEach((a) => {
      const strokes = strokesOf(a.letter);
      expect(strokes.length, a.letter).toBeGreaterThan(0);
      strokes.forEach((s) => expect(buildPath(s).length, a.letter).toBeGreaterThan(10));
    });
  });

  test('획 수: 1권 ㄱ1 ㄴ1 ㄷ2 ㅅ2 ㅎ3 ㅋ2 / 2권 ㅁ3 ㅂ4 ㅈ3 ㅊ4 ㅌ3 ㅍ4 / 3권 ㄹ1 ㅇ1 ㄲ2 ㄸ4 ㅃ8 ㅆ4 ㅉ6', () => {
    expect(Object.fromEntries(Object.entries(STROKES).map(([k, v]) => [k, v.length]))).toEqual({
      'ㄱ': 1, 'ㄴ': 1, 'ㄷ': 2, 'ㅅ': 2, 'ㅎ': 3, 'ㅋ': 2,
      'ㅁ': 3, 'ㅂ': 4, 'ㅈ': 3, 'ㅊ': 4, 'ㅌ': 3, 'ㅍ': 4,
      'ㄹ': 1, 'ㅇ': 1, 'ㄲ': 2, 'ㄸ': 4, 'ㅃ': 8, 'ㅆ': 4, 'ㅉ': 6,
    });
  });

  test('모든 점이 100×100 칸 안에 있다', () => {
    Object.entries(STROKES).forEach(([letter, strokes]) =>
      strokes.flat().forEach(([x, y]) => {
        expect(x, letter).toBeGreaterThanOrEqual(0);
        expect(x, letter).toBeLessThanOrEqual(100);
        expect(y, letter).toBeGreaterThanOrEqual(0);
        expect(y, letter).toBeLessThanOrEqual(100);
      }));
  });

  test('없는 글자는 오류', () => {
    expect(() => strokesOf('ㅏ')).toThrow();
  });
});
