// 3권 자료: 동물원 친구 7마리(ㄹ ㅇ + 쌍자음 ㄲ ㄸ ㅃ ㅆ ㅉ)와 노래 가사. 화면과 상관없는 순수한 자료.
// 가사는 노래를 만들기 위한 "초안"이다. 노래를 만든 뒤 실제 가사에 맞게 VERSES 를 고치고,
// 박자(LINE_STARTS)는 tools/박자찍기.html 로 찍어서 넣는다. 박자를 비워 두면 노래 길이에 맞춘 대략의 박자로 나온다.
import { makeAnimals, makeLines, ACTIVITIES, ACTIVITY_KEYS, initialOf } from './zooCommon.js';

export { ACTIVITIES, ACTIVITY_KEYS, initialOf };

export const VOLUME = Object.freeze({
  id: 3,
  title: '코끼리와 한글 친구들',
  subtitle: '(자음편 3권)',
  shortName: '한글 친구들 자음편3',
  description: '만 3~4세 아이가 동물 친구들과 자음 소리를 익히는 놀이 (3권)',
  storageKey: 'hangul-consonant-vol3',
  songFile: 'song3.mp3',
  songBg: 'song-bg-3',
});

export const ANIMALS = makeAnimals([
  { key: 'llama', name: '라마', letter: 'ㄹ', letterName: '리을' },
  { key: 'fox', name: '여우', letter: 'ㅇ', letterName: '이응' },
  { key: 'deer', name: '꽃사슴', letter: 'ㄲ', letterName: '쌍기역' },
  { key: 'woodpecker', name: '딱따구리', letter: 'ㄸ', letterName: '쌍디귿' },
  { key: 'cuckoo', name: '뻐꾸기', letter: 'ㅃ', letterName: '쌍비읍' },
  { key: 'bactrian', name: '쌍봉낙타', letter: 'ㅆ', letterName: '쌍시옷' },
  { key: 'starling', name: '찌르레기', letter: 'ㅉ', letterName: '쌍지읒' },
]);

export const animalOf = (key) => ANIMALS.find((a) => a.key === key);
export const MENU_PAGE_SIZE = 6;

/** 노래 가사 초안: 동물 7마리 × 4줄 = 28줄. t = 첫소리 초성 번호 (ㄹ5 ㅇ11 ㄲ1 ㄸ4 ㅃ8 ㅆ10 ㅉ13) */
export const VERSES = Object.freeze([
  { key: 'llama', L: 'ㄹ', t: 5, lines: [['리을', '라마', '라마', '라마', '라마가'], ['룰루랄라', '걸어가요'], ['라라라', '노래하며'], ['라마', '라마', '리을', '리을']] },
  { key: 'fox', L: 'ㅇ', t: 11, lines: [['이응', '여우', '여우', '여우', '여우가'], ['여기저기', '살펴봐요'], ['예쁜', '여우', '꼬리'], ['여우', '여우', '이응', '이응']] },
  { key: 'deer', L: 'ㄲ', t: 1, lines: [['쌍기역', '꽃사슴', '꽃사슴', '꽃사슴이'], ['꽃밭에서', '깡충깡충'], ['꼬불꼬불', '길을', '따라'], ['꽃사슴', '꽃사슴', '쌍기역', '쌍기역']] },
  { key: 'woodpecker', L: 'ㄸ', t: 4, lines: [['쌍디귿', '딱따구리', '딱딱', '딱따구리'], ['딱딱딱', '나무를', '쪼아요'], ['따라따라', '소리가', '나요'], ['딱따구리', '딱따구리', '쌍디귿', '쌍디귿']] },
  { key: 'cuckoo', L: 'ㅃ', t: 8, lines: [['쌍비읍', '뻐꾸기', '뻐꾹', '뻐꾹', '뻐꾸기'], ['뻐꾹뻐꾹', '노래해요'], ['뻐꾹', '뻐꾹', '뻐꾸기', '노래'], ['뻐꾸기', '뻐꾸기', '쌍비읍', '쌍비읍']] },
  { key: 'bactrian', L: 'ㅆ', t: 10, lines: [['쌍시옷', '쌍봉낙타', '쌍봉', '쌍봉낙타'], ['쌍둥이', '혹', '두', '개'], ['낙타', '친구', '쌍봉낙타'], ['쌍봉낙타', '쌍봉낙타', '쌍시옷', '쌍시옷']] },
  { key: 'starling', L: 'ㅉ', t: 13, lines: [['쌍지읒', '찌르레기', '찌르', '찌르레기'], ['찌르르르', '노래해요'], ['짹짹', '짹짹', '찌르레기', '노래'], ['찌르레기', '찌르레기', '쌍지읒', '쌍지읒']] },
]);

/** 줄 시작 시각(초) 28개. 비워 두면(빈 목록) 노래 길이에 맞춰 대략 나눈다. 찍은 뒤 여기에 붙여 넣는다. */
export const LINE_STARTS = Object.freeze([]);
export const LYRIC_END = 0; // 마지막 가사가 끝나는 시각 (박자를 찍을 때 같이 찍는다)

/** 노래 화면의 장면 (설명은 zoo1.js 참고). 소품 그림을 더 만들면 props 에 넣는다. */
export const SCENES = Object.freeze([
  { animal: 'llama', props: [['nt n1', 'note1'], ['nt n2', 'note2']] },
  { animal: 'fox', props: [['nt n3', 'note1'], ['nt n4', 'note2']] },
  { animal: 'deer', props: [['pr fl1', 'flowers'], ['pr fl2', 'flowers'], ['nt n1', 'note2'], ['nt n4', 'note1']] },
  { animal: 'woodpecker', before: [['pr tk1', 'trunk']], props: [['nt n2', 'note1'], ['nt n3', 'note2']] },
  { animal: 'cuckoo', props: [['nt n1', 'note1'], ['nt n4', 'note2']] },
  { animal: 'bactrian', props: [['nt n2', 'note2'], ['nt n3', 'note1']] },
  { animal: 'starling', props: [['nt n1', 'note2'], ['nt n4', 'note1']] },
]);
/** 코코가 가운데 크게 나오는 절 번호 (3권에는 코끼리 절이 없어서 -1) */
export const KOKO_VERSE = -1;

export const LINES = makeLines(VERSES);
