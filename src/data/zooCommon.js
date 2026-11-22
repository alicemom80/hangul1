// 권(1·2·3권)마다 같은 자료 틀. 화면과 상관없는 순수한 자료·계산.
// 권마다 다른 것(동물·가사·박자·장면)은 zoo1.js, zoo2.js, zoo3.js 에 있다.

/** 동물 목록 만들기. first: 이름의 첫 글자(소리 맞히기에서 들려줌), syllables: 글자 하나씩 */
export const makeAnimals = (list) =>
  Object.freeze(list.map((a) => Object.freeze({ ...a, first: a.name[0], syllables: Object.freeze([...a.name]) })));

/**
 * 스티커 목록 = 그 권의 동물(자음 있음) + 덤 동물(stickerExtras.js, 자음 없음). 놀이를 끝낼 때 이 중에서 받는다.
 * 그 권 동물이 앞에 와서 스티커북 첫 쪽에 나온다.
 */
export const makeStickers = (animals, extras) =>
  Object.freeze([...animals, ...extras.map((e) => Object.freeze({ ...e }))]);

/** 놀이 8가지 (메뉴에서 위 줄 왼쪽→오른쪽, 아래 줄 왼쪽→오른쪽) */
export const ACTIVITIES = Object.freeze([
  { key: 'song', name: '노래방' },
  { key: 'puzzle', name: '그림 퍼즐' },
  { key: 'sound', name: '소리 맞히기' },
  { key: 'clap', name: '박수 놀이' },
  { key: 'match', name: '짝 맞추기' },
  { key: 'tag', name: '이름표 붙이기' },
  { key: 'write', name: '글자 쓰기' },
  { key: 'blank', name: '빈칸 채우기' },
]);
export const ACTIVITY_KEYS = Object.freeze(ACTIVITIES.map((a) => a.key));

/** 한글 글자의 초성 번호 (한글이 아니면 -1). ㄱ0 ㄲ1 ㄴ2 ㄷ3 ㄸ4 ㄹ5 ㅁ6 ㅂ7 ㅃ8 ㅅ9 ㅆ10 ㅇ11 ㅈ12 ㅉ13 ㅊ14 ㅋ15 ㅌ16 ㅍ17 ㅎ18 */
export function initialOf(ch) {
  const c = ch.charCodeAt(0) - 0xac00;
  return c >= 0 && c < 11172 ? Math.floor(c / 588) : -1;
}

/** 가사 전체를 줄 단위로 펼친다: [{ words, verse }] */
export const makeLines = (verses) =>
  Object.freeze(verses.flatMap((v, vi) => v.lines.map((words) => Object.freeze({ words, verse: vi }))));

/** 박자(줄 시작 시각)를 아직 안 찍었을 때: 노래 길이에 맞춰 줄을 고르게 나눈 대략의 박자 */
const INTRO_SEC = 6.5;
const OUTRO_SEC = 3;
export function estimateTiming(lineCount, durationSec) {
  const end = Math.max(INTRO_SEC + lineCount, durationSec - OUTRO_SEC);
  const step = (end - INTRO_SEC) / lineCount;
  return { starts: Array.from({ length: lineCount }, (_, i) => +(INTRO_SEC + i * step).toFixed(2)), end };
}

/** 박자 값이 줄 수와 맞게 다 찍혀 있는지 */
export const hasTiming = (starts, lineCount) => starts.length === lineCount;
