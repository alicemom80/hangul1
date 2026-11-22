// 1·2·3권 자료가 같은 틀을 지키는지, 권을 나누는 계산이 맞는지 확인한다.
import { describe, test, expect } from 'vitest';
import * as vol1 from '../../src/data/zoo1.js';
import * as vol2 from '../../src/data/zoo2.js';
import * as vol3 from '../../src/data/zoo3.js';
import { estimateTiming, hasTiming, initialOf } from '../../src/data/zooCommon.js';
import { splitEven } from '../../src/games/tag.js';
import { artUrl } from '../../src/art/registry.js';
import { existsSync } from 'node:fs';

const VOLUMES = [['1권', vol1, 6], ['2권', vol2, 6], ['3권', vol3, 7]];

describe.each(VOLUMES)('%s 자료', (_name, vol, count) => {
  test(`동물 ${count}마리, 절·장면 수가 같고 key 가 겹치지 않는다`, () => {
    expect(vol.ANIMALS).toHaveLength(count);
    expect(vol.VERSES).toHaveLength(count);
    expect(vol.SCENES).toHaveLength(count);
    expect(new Set(vol.ANIMALS.map((a) => a.key)).size).toBe(count);
    expect(new Set(vol.ANIMALS.map((a) => a.letter)).size).toBe(count);
  });

  test('절 순서가 동물 순서와 같고, 첫소리(t)가 동물 이름 첫 글자의 초성과 같다', () => {
    vol.VERSES.forEach((v, i) => {
      const animal = vol.ANIMALS[i];
      expect(v.key).toBe(animal.key);
      expect(v.L).toBe(animal.letter);
      expect(initialOf(animal.first)).toBe(v.t);
    });
  });

  test('절마다 4줄이고 마지막 줄은 자음 이름으로 끝난다', () => {
    vol.VERSES.forEach((v, i) => {
      expect(v.lines).toHaveLength(4);
      expect(v.lines[3].at(-1)).toBe(vol.ANIMALS[i].letterName);
    });
    expect(vol.LINES).toHaveLength(count * 4);
  });

  test('2·3권 가사 초안은 첫 줄을 "자음 이름"으로 시작한다', () => {
    if (vol.VOLUME.id === 1) return; // 1권은 절마다 첫 줄이 조금씩 다르다
    vol.VERSES.forEach((v, i) => expect(v.lines[0][0]).toBe(vol.ANIMALS[i].letterName));
  });

  test('가사 한 줄이 너무 길지 않다 (글자 14개 이하)', () => {
    vol.LINES.forEach((l) => expect(l.words.join('').length, l.words.join(' ')).toBeLessThanOrEqual(14));
  });

  test('장면의 동물은 그 절의 동물 (코코 절은 null)', () => {
    vol.SCENES.forEach((s, i) => {
      if (s.animal !== null) expect(s.animal).toBe(vol.ANIMALS[i].key);
    });
  });

  test('이름표: 저장 키와 노래 파일 모양', () => {
    expect(vol.VOLUME.storageKey).toMatch(/^hangul-consonant-vol\d$/);
    expect(vol.VOLUME.songFile).toMatch(/\.mp3$/);
    expect(vol.VOLUME.songBg).toMatch(/^song-bg/);
  });

  test('박자는 비어 있거나(대략 박자) 줄 수와 같고, 있으면 늘어난다', () => {
    const starts = vol.LINE_STARTS;
    expect(starts.length === 0 || starts.length === vol.LINES.length).toBe(true);
    starts.forEach((t, i) => i && expect(t).toBeGreaterThan(starts[i - 1]));
  });
});

test('권마다 저장 키·노래 파일·노래 배경이 서로 다르다', () => {
  const vols = [vol1, vol2, vol3].map((v) => v.VOLUME);
  ['storageKey', 'songFile', 'songBg'].forEach((k) => expect(new Set(vols.map((v) => v[k])).size).toBe(3));
});

test('1·2·3권 동물 key 가 서로 겹치지 않는다 (그림 파일 이름이 겹치지 않게)', () => {
  const keys = [vol1, vol2, vol3].flatMap((v) => v.ANIMALS.map((a) => a.key));
  expect(new Set(keys).size).toBe(keys.length);
});

test('놀이 배경 그림 이름이 모두 그림 목록에 있다 (목록이 잘못 줄어들지 않게)', () => {
  ['savanna-base', 'night-base', 'menu-bg', 'puzzle-bg', 'sound-bg', 'clap-bg', 'match-bg', 'tag-bg', vol1.VOLUME.songBg]
    .forEach((name) => expect(() => artUrl('background', name), name).not.toThrow());
});

describe('박자를 안 찍었을 때의 대략 박자', () => {
  test('노래 길이 안에서 고르게 나뉘고 줄 수만큼 나온다', () => {
    const { starts, end } = estimateTiming(24, 70);
    expect(starts).toHaveLength(24);
    expect(starts[0]).toBeCloseTo(6.5);
    expect(end).toBeCloseTo(67);
    starts.forEach((t, i) => i && expect(t).toBeGreaterThan(starts[i - 1]));
    expect(starts.at(-1)).toBeLessThan(end);
  });
  test('hasTiming: 줄 수와 같을 때만 참', () => {
    expect(hasTiming([1, 2], 2)).toBe(true);
    expect(hasTiming([], 24)).toBe(false);
  });
});

describe('이름표 붙이기 판 나누기', () => {
  test('6마리는 3+3, 7마리는 3+2+2, 한 판은 3마리를 넘지 않는다', () => {
    expect(splitEven([1, 2, 3, 4, 5, 6], 3).map((g) => g.length)).toEqual([3, 3]);
    expect(splitEven([1, 2, 3, 4, 5, 6, 7], 3).map((g) => g.length)).toEqual([3, 2, 2]);
    expect(splitEven([1, 2], 3).map((g) => g.length)).toEqual([2]);
  });
  test('섞지 않고 순서대로 다 담는다', () => {
    expect(splitEven([1, 2, 3, 4, 5, 6, 7], 3).flat()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('스티커 동물 (이 권 동물 + 덤)', () => {
  const stickersOf = (v) => v.STICKERS.map((a) => a.key);

  test('이 권 동물이 앞에 오고, 덤 동물에는 이름이 있다', () => {
    [vol1, vol2, vol3].forEach((v) => {
      expect(stickersOf(v).slice(0, v.ANIMALS.length)).toEqual(v.ANIMALS.map((a) => a.key));
      v.STICKERS.forEach((a) => expect(a.name, a.key).toMatch(/\S/));
      expect(new Set(stickersOf(v)).size).toBe(v.STICKERS.length);
    });
  });

  test('1·2·3권 스티커가 서로 겹치지 않는다 (같은 동물이 두 권에 들어가지 않게)', () => {
    const all = [vol1, vol2, vol3].flatMap(stickersOf);
    expect(new Set(all).size).toBe(all.length);
  });

  test('권마다 30마리 이상이고 서로 비슷한 수로 나뉜다', () => {
    const sizes = [vol1, vol2, vol3].map((v) => v.STICKERS.length);
    sizes.forEach((n) => expect(n).toBeGreaterThanOrEqual(30));
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(2);
  });

  test('스티커마다 그림 파일(public/images/characters/<key>.webp)이 있다', () => {
    [vol1, vol2, vol3].flatMap((v) => v.STICKERS).forEach((a) =>
      expect(existsSync(new URL(`../../public/images/characters/${a.key}.webp`, import.meta.url)), a.key).toBe(true));
  });
});
