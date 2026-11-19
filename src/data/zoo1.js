// 1권 자료: 동물원 친구 6마리와 자음, 노래 가사. 화면과 상관없는 순수한 자료.
// 2권·3권은 같은 모양으로 data/zoo2.js, zoo3.js 를 더하면 된다.

/** letter: 자음, letterName: 자음 이름, first: 이름의 첫 글자(소리 맞히기에서 들려줌) */
export const ANIMALS = Object.freeze([
  { key: 'giraffe', name: '기린', letter: 'ㄱ', letterName: '기역' },
  { key: 'camel', name: '낙타', letter: 'ㄴ', letterName: '니은' },
  { key: 'squirrel', name: '다람쥐', letter: 'ㄷ', letterName: '디귿' },
  { key: 'lion', name: '사자', letter: 'ㅅ', letterName: '시옷' },
  { key: 'hippo', name: '하마', letter: 'ㅎ', letterName: '히읗' },
  { key: 'elephant', name: '코끼리', letter: 'ㅋ', letterName: '키읔' },
].map((a) => Object.freeze({ ...a, first: a.name[0], syllables: Object.freeze([...a.name]) })));

export const animalOf = (key) => ANIMALS.find((a) => a.key === key);

/** 놀이 8가지 (메뉴 첫 쪽 6개: 위 줄 왼쪽→오른쪽, 아래 줄 왼쪽→오른쪽 / 둘째 쪽 2개) */
export const MENU_PAGE_SIZE = 6;
export const ACTIVITIES = Object.freeze([
  { key: 'song', name: '노래방' },
  { key: 'puzzle', name: '그림 퍼즐' },
  { key: 'sound', name: '소리 맞히기' },
  { key: 'clap', name: '박수 놀이' },
  { key: 'match', name: '짝 맞추기' },
  { key: 'tag', name: '이름표 붙이기' },
  { key: 'write', name: '글자 쓰기' }, // 메뉴 둘째 쪽
  { key: 'blank', name: '빈칸 채우기' },
]);
export const ACTIVITY_KEYS = Object.freeze(ACTIVITIES.map((a) => a.key));

/**
 * 노래 가사: 동물 6마리 × 4줄. t는 첫소리를 강조할 글자의 초성 번호(유니코드 초성 순서).
 * ㄱ0 ㄴ2 ㄷ3 ㅅ9 ㅎ18 ㅋ15
 */
export const VERSES = Object.freeze([
  { key: 'giraffe', L: 'ㄱ', t: 0, lines: [['기역', '기린', '기린', '기린', '기린이'], ['기다란', '목', '기린이'], ['고개를', '높이', '들고'], ['기린', '기린', '기역', '기역']] },
  { key: 'camel', L: 'ㄴ', t: 2, lines: [['낙타', '낙타', '낙타', '낙타가'], ['느릿느릿', '걸어가요'], ['나란히', '나란히', '나란히'], ['낙타', '낙타', '니은', '니은']] },
  { key: 'squirrel', L: 'ㄷ', t: 3, lines: [['디귿', '다람쥐', '다람', '다람', '다람쥐'], ['도토리를', '주워요'], ['달콤한', '도토리', '두', '개'], ['다람쥐', '다람쥐', '디귿', '디귿']] },
  { key: 'lion', L: 'ㅅ', t: 9, lines: [['시옷', '사자', '사자', '사자', '사자가'], ['살금살금', '걸어가요'], ['수풀', '속에', '숨었다가'], ['사자', '사자', '시옷', '시옷']] },
  { key: 'hippo', L: 'ㅎ', t: 18, lines: [['하마', '하마', '하마', '하마가'], ['하품을', '크게', '해요'], ['하하하', '웃는', '하마'], ['하마', '하마', '히읗', '히읗']] },
  { key: 'elephant', L: 'ㅋ', t: 15, lines: [['코끼리', '코끼리', '코끼리', '코코랑'], ['커다란', '코로', '쿵쿵쿵'], ['코코는', '코끼리', '친구'], ['코끼리', '코끼리', '키읔', '키읔']] },
]);

/** 줄 시작 시각(초): 사용자가 직접 찍어 확정한 값 24개 */
export const LINE_STARTS = Object.freeze([
  6.48, 9.09, 11.69, 14.29, 16.9, 19.52, 22.14, 24.77, 27.39, 30, 32.6, 35.2,
  37.81, 40.41, 43.02, 45.63, 48.23, 50.85, 53.47, 56.08, 58.7, 61.31, 63.92, 66.52,
]);
export const LYRIC_END = 69.1; // 마지막 가사가 끝나는 시각

/** 한글 글자의 초성 번호 (한글이 아니면 -1) */
export function initialOf(ch) {
  const c = ch.charCodeAt(0) - 0xac00;
  return c >= 0 && c < 11172 ? Math.floor(c / 588) : -1;
}

/** 가사 전체를 줄 단위로 펼친다: [{ words, verse }] */
export const LINES = Object.freeze(VERSES.flatMap((v, vi) => v.lines.map((words) => Object.freeze({ words, verse: vi }))));
