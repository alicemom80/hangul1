import { describe, test, expect } from 'vitest';
import { finishActivity } from '../../src/app/rewards.js';
import { DEFAULT_PROGRESS, freezeProgress } from '../../src/storage/progress.js';
import { ANIMALS } from '../../src/data/zoo1.js';

const base = (change = {}) => freezeProgress({ ...DEFAULT_PROGRESS, day: '2026-10-21', ...change });

describe('놀이를 끝낼 때 스티커', () => {
  test('아직 없는 동물부터 한 장 받고, 끝낸 놀이에 표시된다', () => {
    const r = finishActivity(base(), 'puzzle', () => 0);
    expect(r.isNew).toBe(true);
    expect(r.progress.stickers).toEqual([r.sticker.key]);
    expect(r.progress.done.puzzle).toBe(true);
  });

  test('이미 모은 동물은 건너뛰고 못 모은 동물만 준다', () => {
    const have = ANIMALS.slice(0, 5).map((a) => a.key);
    const r = finishActivity(base({ stickers: have }), 'song', () => 0.99);
    expect(r.sticker.key).toBe(ANIMALS[5].key);
    expect(r.progress.stickers).toHaveLength(6);
  });

  test('6마리를 다 모았으면 "또" 받는다 (목록은 그대로)', () => {
    const all = ANIMALS.map((a) => a.key);
    const r = finishActivity(base({ stickers: all }), 'tag', () => 0);
    expect(r.isNew).toBe(false);
    expect(r.progress.stickers).toEqual(all);
  });

  test('원래 기록 객체는 바뀌지 않는다', () => {
    const p = base();
    finishActivity(p, 'clap');
    expect(p.stickers).toEqual([]);
    expect(p.done).toEqual({});
  });

  test('없는 놀이 이름이면 바로 오류', () => {
    expect(() => finishActivity(base(), 'nope')).toThrow();
  });
});
