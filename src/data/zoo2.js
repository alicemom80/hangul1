// 2권 자료: 동물원 친구 6마리(ㅁ ㅂ ㅈ ㅊ ㅌ ㅍ)와 노래 가사. 화면과 상관없는 순수한 자료.
// 가사(VERSES)와 박자(LINE_STARTS, LYRIC_END)는 실제 노래(song2.mp3)에 맞춘 값이다. 박자는 tools/박자찍기.html 로 찍었다.
import { makeAnimals, makeLines, ACTIVITIES, ACTIVITY_KEYS, initialOf } from './zooCommon.js';

export { ACTIVITIES, ACTIVITY_KEYS, initialOf };

export const VOLUME = Object.freeze({
  id: 2,
  title: '코끼리와 한글 친구들',
  subtitle: '(자음편 2권)',
  shortName: '한글 친구들 자음편2',
  description: '만 3~4세 아이가 동물 친구들과 자음 소리를 익히는 놀이 (2권)',
  storageKey: 'hangul-consonant-vol2',
  songFile: 'song2.mp3',
  songBg: 'song-bg-2',
});

export const ANIMALS = makeAnimals([
  { key: 'meerkat', name: '미어캣', letter: 'ㅁ', letterName: '미음' },
  { key: 'bear', name: '반달곰', letter: 'ㅂ', letterName: '비읍' },
  { key: 'pony', name: '조랑말', letter: 'ㅈ', letterName: '지읒' },
  { key: 'cheetah', name: '치타', letter: 'ㅊ', letterName: '치읓' },
  { key: 'ostrich', name: '타조', letter: 'ㅌ', letterName: '티읕' },
  { key: 'penguin', name: '펭귄', letter: 'ㅍ', letterName: '피읖' },
]);

export const animalOf = (key) => ANIMALS.find((a) => a.key === key);
export const MENU_PAGE_SIZE = 6;

/** 노래 가사 초안: 동물 6마리 × 4줄. t = 첫소리 초성 번호 (ㅁ6 ㅂ7 ㅈ12 ㅊ14 ㅌ16 ㅍ17) */
export const VERSES = Object.freeze([
  { key: 'meerkat', L: 'ㅁ', t: 6, lines: [['미음', '미어캣', '미어', '미어', '미어캣'], ['멀리멀리', '바라봐요'], ['말똥말똥', '눈을', '뜨고'], ['미어캣', '미어캣', '미음', '미음']] },
  { key: 'bear', L: 'ㅂ', t: 7, lines: [['비읍', '반달곰', '반달', '반달', '반달곰'], ['반짝반짝', '가슴', '반달'], ['부지런히', '밥을', '먹어요'], ['반달곰', '반달곰', '비읍', '비읍']] },
  { key: 'pony', L: 'ㅈ', t: 12, lines: [['지읒', '조랑말', '조랑', '조랑', '조랑말'], ['저벅저벅', '걸어가요'], ['조심조심', '지나가요'], ['조랑말', '조랑말', '지읒', '지읒']] },
  { key: 'cheetah', L: 'ㅊ', t: 14, lines: [['치읓', '치타', '치타', '치타', '치타', '치타가'], ['착착착', '빨리', '달려요'], ['찬바람', '가르며', '쌩쌩'], ['치타', '치타', '치읓', '치읓']] },
  { key: 'ostrich', L: 'ㅌ', t: 16, lines: [['티읕', '타조', '타조', '타조', '타조', '타조가'], ['터벅터벅', '걸어가요'], ['튼튼한', '다리로', '타닥타닥'], ['타조', '타조', '티읕', '티읕']] },
  { key: 'penguin', L: 'ㅍ', t: 17, lines: [['피읖', '펭귄', '펭귄', '펭귄', '펭귄', '펭귄이'], ['펄쩍펄쩍', '뛰어요'], ['푸른', '바다에', '퐁당'], ['펭귄', '펭귄', '피읖', '피읖']] },
]);

/** 줄 시작 시각(초) 24개. 비워 두면(빈 목록) 노래 길이에 맞춰 대략 나눈다. 찍은 뒤 여기에 붙여 넣는다. */
export const LINE_STARTS = Object.freeze([
  8.86, 12.54, 16.24, 19.45, 23.63, 27.32, 30.97, 34.03, 38.34, 42.04, 45.75, 48.96,
  53.05, 56.83, 60.54, 63.70, 67.90, 71.64, 75.34, 78.49, 82.72, 86.44, 90.10, 93.34,
]);
export const LYRIC_END = 97.54; // 마지막 가사가 끝나는 시각 (박자를 찍을 때 같이 찍는다)

/** 노래 화면의 장면 (설명은 zoo1.js 참고). 소품 그림을 더 만들면 props 에 넣는다. */
export const SCENES = Object.freeze([
  { animal: 'meerkat', props: [['pr rk1', 'rock'], ['nt n1', 'note1'], ['nt n2', 'note2']] },
  { animal: 'bear', props: [['pr hp1', 'honeypot'], ['nt n3', 'note1'], ['nt n4', 'note2']] },
  { animal: 'pony', before: [['pr fe1', 'fence']], props: [['nt n1', 'note2'], ['nt n4', 'note1']] },
  { animal: 'cheetah', props: [['pr fl1', 'flowers'], ['nt n2', 'note1'], ['nt n3', 'note2']] },
  { animal: 'ostrich', props: [['nt n1', 'note1'], ['nt n4', 'note2']] },
  { animal: 'penguin', props: [['pr ib1', 'iceberg'], ['nt n2', 'note2'], ['nt n3', 'note1']] },
]);
/** 코코가 가운데 크게 나오는 절 번호 (2권에는 코끼리 절이 없어서 -1) */
export const KOKO_VERSE = -1;

export const LINES = makeLines(VERSES);
