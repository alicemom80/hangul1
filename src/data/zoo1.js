// 1권 자료: 동물원 친구 6마리와 자음, 노래 가사. 화면과 상관없는 순수한 자료.
// 2권·3권은 같은 모양으로 data/zoo2.js, zoo3.js 에 있다. 앱은 권 번호(VOLUME 환경변수)에 맞는 파일 하나만 쓴다.
import { makeAnimals, makeStickers, makeLines, ACTIVITIES, ACTIVITY_KEYS, initialOf } from './zooCommon.js';
import { STICKER_EXTRAS } from './stickerExtras.js';

export { ACTIVITIES, ACTIVITY_KEYS, initialOf };

/** 이 권의 이름표 (제목·저장 키·노래 파일·노래 배경) */
export const VOLUME = Object.freeze({
  id: 1,
  title: '코끼리와 한글 친구들',
  subtitle: '(자음편)',
  shortName: '한글 친구들 자음편',
  description: '만 3~4세 아이가 동물 친구들과 자음 소리를 익히는 놀이 (1권)',
  storageKey: 'hangul-consonant-vol1',
  songFile: 'song.mp3',
  songBg: 'song-bg',
});

/** letter: 자음, letterName: 자음 이름, first: 이름의 첫 글자(소리 맞히기에서 들려줌) */
export const ANIMALS = makeAnimals([
  { key: 'giraffe', name: '기린', letter: 'ㄱ', letterName: '기역' },
  { key: 'camel', name: '낙타', letter: 'ㄴ', letterName: '니은' },
  { key: 'squirrel', name: '다람쥐', letter: 'ㄷ', letterName: '디귿' },
  { key: 'lion', name: '사자', letter: 'ㅅ', letterName: '시옷' },
  { key: 'hippo', name: '하마', letter: 'ㅎ', letterName: '히읗' },
  { key: 'elephant', name: '코끼리', letter: 'ㅋ', letterName: '키읔' },
]);

export const animalOf = (key) => ANIMALS.find((a) => a.key === key);

/** 스티커 보상으로 받을 수 있는 동물 전체 (이 권 동물 + 덤). 이름은 stickerOf 로 찾는다 */
export const STICKERS = makeStickers(ANIMALS, STICKER_EXTRAS[1]);
export const stickerOf = (key) => STICKERS.find((a) => a.key === key);

/** 메뉴 첫 쪽 크기 (지금 메뉴는 한 쪽에 8개라 쓰이지 않는다) */
export const MENU_PAGE_SIZE = 6;

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

/**
 * 노래 화면의 장면(절마다 하나).
 *  animal: 장면의 동물(그림 이름. 없으면 null), before: 동물 뒤에 깔리는 소품, props: 동물 앞에 놓이는 소품.
 *  소품은 [css 클래스, 소품 그림 이름]. 소품의 자리는 styles/song.css 의 클래스가 정한다. 동물만 두어도 된다.
 */
export const SCENES = Object.freeze([
  { animal: 'giraffe', props: [['pr tree1', 'tree'], ['nt n1', 'note1'], ['nt n2', 'note2']] },
  { animal: 'camel', props: [['nt n3', 'note1'], ['nt n4', 'note2']] },
  { animal: 'squirrel', before: [['pr tree1', 'tree']], props: [['pr ac1', 'acorn1'], ['pr ac2', 'acorn2'], ['nt n1', 'note1']] },
  { animal: 'lion', props: [['pr bush1', 'bush'], ['pr bush2', 'bush'], ['nt n3', 'note2']] },
  { animal: 'hippo', before: [['pr pond', 'pond']], props: [['nt n2', 'note1'], ['nt n4', 'note2']] },
  { animal: null, props: [['nt n1', 'note1'], ['nt n3', 'note2'], ['nt n4', 'note1']] }, // 코코가 주인공인 마지막 절
]);
/** 코코가 가운데 크게 나오는 절 번호 (없으면 -1). 1권은 마지막 절이 코끼리(코코) */
export const KOKO_VERSE = 5;

export const LINES = makeLines(VERSES);
