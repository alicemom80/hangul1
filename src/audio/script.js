// 앱이 하는 말(대사) 모음. 화면은 여기 있는 문장만 쓰고, 음성 목록(voiceLines.js)도 여기서 만든다.
// 문장을 바꾸면 음성 목록과 녹음 파일도 같이 바꿔야 한다 (npm run voice:list 로 목록 다시 만들기).

// 시작·메뉴
export const GREETING = '안녕! 나는 코코야. 같이 한글 놀이하자!';
export const MENU_ASK = '어떤 놀이를 할까?';

// 노래방
export const SONG_INTRO = '노래를 따라 불러 보자!';
export const SONG_END = '노래 잘 불렀어!';

// 그림 퍼즐
export const PUZZLE_ASK = '그림 조각을 끌어서 제자리에 놓아 줘!';
export const PUZZLE_WRONG = '여기가 아니야. 다른 곳에 놓아 볼까?';
export const puzzleDone = (name) => `${name}! 그림을 완성했어!`;

// 소리 맞히기
export const soundAsk = (first) => `${first}! ${first} 소리가 나는 친구는 누구일까?`;
export const SOUND_RETRY = '다시 한번 들어 보자!';
export const soundRight = (name) => `${name}! 맞아!`;

// 박수 놀이
export const clapAsk = (name) => `${name}! 같이 박수를 쳐 보자!`;
export const CLAP_HINT = '코코를 톡톡 눌러서 박수를 쳐 봐!';
export const clapDone = (name) => `${name}! 박수 짝짝짝! 잘했어!`;

// 짝 맞추기
export const MATCH_ASK = '똑같은 그림을 찾아 보자!';
export const MATCH_MISS = '아니야. 다시 찾아 보자!';
export const matchFound = (name) => `${name}! 짝을 찾았어!`;

// 이름표 붙이기
export const TAG_ASK = '이름표를 알맞은 친구에게 붙여 줘!';
export const TAG_WRONG = '다른 친구일까? 다시 해 보자!';
export const tagRight = (name) => `${name}! 이름표를 붙였어!`;

// 글자 쓰기
export const writeAsk = (animal) => `${animal.name}! ${animal.letterName}을 손가락으로 따라 써 보자!`;
export const WRITE_HINT = '흐린 글자를 따라 그려 봐!';
export const writeDone = (animal) => `${animal.letterName}! 정말 잘 썼어!`;

// 빈칸 채우기
export const BLANK_ASK = '빈칸에 들어갈 글자를 찾아 줘!';
export const BLANK_WRONG = '다른 글자일까? 다시 찾아 보자!';
export const blankRight = (animal) => `${animal.name}! ${animal.letterName}이 맞아!`;

// 칭찬 (놀이 끝)
export const PRAISE = Object.freeze(['잘했어!', '멋져!', '와, 대단해!', '최고야!']);

// 보상·스티커북
export const stickerLine = (name, isNew) => (isNew ? `${name} 스티커를 받았어!` : `${name} 스티커를 또 받았어!`);
export const bookCount = (n) => (n === 0 ? '아직 스티커가 없어. 놀이를 하면 받을 수 있어!' : `스티커를 ${n}장 모았어!`);
export const NOT_MET = '아직 못 만난 친구야!';

// 놀이 시간·잠금
export const WARN_TEXT = '1분 남았어! 이번 놀이까지만 하자.';
export const LOCK_TEXT = '코코가 졸려요. 내일 또 놀자!';
export const lockLine = (mission) => `${LOCK_TEXT} ${mission}`;
export const UNLOCK_TEXT = '다시 놀자!';
