import { describe, test, expect } from 'vitest';
import { compensation } from '../../src/app/textScale.js';

describe('기기 글자 크기 되돌리기', () => {
  test('커지지 않았으면 1 (오차는 무시)', () => {
    expect(compensation(100, 100)).toBe(1);
    expect(compensation(103, 100)).toBe(1);
  });

  test('1.4배로 커졌으면 1/1.4 로 되돌린다', () => {
    expect(compensation(140, 100)).toBeCloseTo(0.714, 3);
  });

  test('작아졌으면 키워서 되돌린다', () => {
    expect(compensation(80, 100)).toBeCloseTo(1.25, 3);
  });

  test('재지 못했거나 엉뚱한 값이면 1', () => {
    expect(compensation(0, 100)).toBe(1);
    expect(compensation(100, 0)).toBe(1);
    expect(compensation(NaN, 100)).toBe(1);
    expect(compensation(500, 100)).toBe(1);
  });
});
