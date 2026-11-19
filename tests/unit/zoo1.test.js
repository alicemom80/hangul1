import { describe, test, expect } from 'vitest';
import { ANIMALS, VERSES, LINES, LINE_STARTS, ACTIVITIES, initialOf } from '../../src/data/zoo1.js';
import { VOICE_LINES, voiceIdOf } from '../../src/audio/voiceLines.js';
import { artUrl } from '../../src/art/registry.js';
import { coverMap } from '../../src/screens/menu.js';
import { createProgressStore, STORAGE_KEY } from '../../src/storage/progress.js';
import * as S from '../../src/audio/script.js';

describe('1권 자료', () => {
  test('동물 6마리, 놀이 8가지, 가사 24줄과 박자 24개', () => {
    expect(ANIMALS).toHaveLength(6);
    expect(ACTIVITIES).toHaveLength(8);
    expect(LINES).toHaveLength(24);
    expect(LINE_STARTS).toHaveLength(24);
    expect(LINE_STARTS.every((t, i) => i === 0 || t > LINE_STARTS[i - 1])).toBe(true);
  });

  test('절마다 강조할 첫소리가 그 동물 이름의 첫 글자 초성과 같다', () => {
    VERSES.forEach((v) => {
      const animal = ANIMALS.find((a) => a.key === v.key);
      expect(initialOf(animal.first)).toBe(v.t);
    });
  });

  test('동물 그림 파일 이름이 그림 목록에 모두 있다', () => {
    ANIMALS.forEach((a) => expect(() => artUrl('character', a.key)).not.toThrow());
    expect(() => artUrl('character', 'nope')).toThrow();
  });
});

describe('음성 목록', () => {
  test('파일 이름(id)과 문장이 겹치지 않는다', () => {
    expect(new Set(VOICE_LINES.map((l) => l.id)).size).toBe(VOICE_LINES.length);
    expect(new Set(VOICE_LINES.map((l) => l.text)).size).toBe(VOICE_LINES.length);
  });

  test('앱이 하는 동물별 말은 모두 목록에 있다', () => {
    ANIMALS.forEach((a) => {
      [S.soundAsk(a.first), S.soundRight(a.name), S.clapAsk(a.name), S.clapDone(a.name), S.matchFound(a.name),
        S.tagRight(a.name), S.puzzleDone(a.name), S.stickerLine(a.name, true), S.stickerLine(a.name, false), a.name,
      ].forEach((text) => expect(voiceIdOf(text), text).not.toBeNull());
    });
    expect(voiceIdOf(S.MENU_ASK)).not.toBeNull();
    expect(voiceIdOf('목록에 없는 말')).toBeNull();
  });
});

describe('메뉴 그림 좌표', () => {
  test('화면이 그림보다 길쭉하면 위아래가 잘리고, 좌우는 꽉 찬다', () => {
    const { scale, dx, dy } = coverMap(1600, 720);
    expect(scale).toBeCloseTo(1600 / 1536);
    expect(dx).toBeCloseTo(0);
    expect(dy).toBeLessThan(0);
  });
});

describe('진행 기록 저장소', () => {
  const memory = () => {
    const data = new Map();
    return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
  };

  test('저장하고 다시 읽으면 같고, 깨진 값은 기본값으로 돌아간다', () => {
    const storage = memory();
    const store = createProgressStore(storage);
    const p = { ...store.load('2026-10-21'), stickers: ['lion', 'lion', 3] };
    store.save(p);
    expect(store.load('2026-10-21').stickers).toEqual(['lion']);
    storage.setItem(STORAGE_KEY, '{깨짐');
    expect(store.load('2026-10-21').stickers).toEqual([]);
  });

  test('날짜가 바뀌면 오늘 쓴 시간만 새로 시작한다', () => {
    const storage = memory();
    const store = createProgressStore(storage);
    store.save({ ...store.load('2026-10-21'), stickers: ['hippo'], usedMs: 9000, bonusMs: 5 });
    const next = store.load('2026-10-22');
    expect(next).toMatchObject({ stickers: ['hippo'], usedMs: 0, bonusMs: 0, day: '2026-10-22' });
  });
});
