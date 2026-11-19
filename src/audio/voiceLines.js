// 음성 목록: 앱이 할 수 있는 모든 말 → 녹음 파일 이름.
// 녹음 파일은 public/audio/voice/<id>.mp3 로 넣는다. 파일이 없으면 브라우저 기본 음성으로 읽는다.
// 사람이 보는 목록: docs/음성 목록.md (npm run voice:list 로 다시 만든다)
import * as S from './script.js';
import { MISSIONS } from '../app/playtime.js';
import { ANIMALS, ACTIVITIES } from '../data/zoo1.js';

const line = (group, id, text) => ({ group, id, text });

function build() {
  return [
    line('시작·메뉴', 'greeting', S.GREETING),
    line('시작·메뉴', 'menu-ask', S.MENU_ASK),
    ...ACTIVITIES.map((a) => line('시작·메뉴', `menu-${a.key}`, a.name)),

    line('노래방', 'song-intro', S.SONG_INTRO),
    line('노래방', 'song-end', S.SONG_END),

    line('그림 퍼즐', 'puzzle-ask', S.PUZZLE_ASK),
    line('그림 퍼즐', 'puzzle-wrong', S.PUZZLE_WRONG),
    ...ANIMALS.map((a) => line('그림 퍼즐', `puzzle-done-${a.key}`, S.puzzleDone(a.name))),

    ...ANIMALS.map((a) => line('소리 맞히기', `sound-ask-${a.key}`, S.soundAsk(a.first))),
    line('소리 맞히기', 'sound-retry', S.SOUND_RETRY),
    ...ANIMALS.map((a) => line('소리 맞히기', `sound-right-${a.key}`, S.soundRight(a.name))),

    ...ANIMALS.map((a) => line('박수 놀이', `clap-ask-${a.key}`, S.clapAsk(a.name))),
    line('박수 놀이', 'clap-hint', S.CLAP_HINT),
    ...ANIMALS.map((a) => line('박수 놀이', `clap-done-${a.key}`, S.clapDone(a.name))),

    line('짝 맞추기', 'match-ask', S.MATCH_ASK),
    line('짝 맞추기', 'match-miss', S.MATCH_MISS),
    ...ANIMALS.map((a) => line('짝 맞추기', `match-found-${a.key}`, S.matchFound(a.name))),

    line('이름표 붙이기', 'tag-ask', S.TAG_ASK),
    line('이름표 붙이기', 'tag-wrong', S.TAG_WRONG),
    ...ANIMALS.map((a) => line('이름표 붙이기', `tag-right-${a.key}`, S.tagRight(a.name))),

    ...ANIMALS.map((a) => line('글자 쓰기', `write-ask-${a.key}`, S.writeAsk(a))),
    line('글자 쓰기', 'write-hint', S.WRITE_HINT),
    ...ANIMALS.map((a) => line('글자 쓰기', `write-done-${a.key}`, S.writeDone(a))),

    line('빈칸 채우기', 'blank-ask', S.BLANK_ASK),
    line('빈칸 채우기', 'blank-wrong', S.BLANK_WRONG),
    ...ANIMALS.map((a) => line('빈칸 채우기', `blank-right-${a.key}`, S.blankRight(a))),

    ...ANIMALS.map((a) => line('동물·스티커', `name-${a.key}`, a.name)),
    ...S.PRAISE.map((p, i) => line('칭찬', `praise-${i + 1}`, p)),
    ...ANIMALS.flatMap((a) => [
      line('동물·스티커', `sticker-${a.key}`, S.stickerLine(a.name, true)),
      line('동물·스티커', `sticker-again-${a.key}`, S.stickerLine(a.name, false)),
    ]),
    ...Array.from({ length: ANIMALS.length + 1 }, (_, n) => line('동물·스티커', `book-${n}`, S.bookCount(n))),
    line('동물·스티커', 'not-met', S.NOT_MET),

    line('시간·잠금', 'warn-1min', S.WARN_TEXT),
    ...MISSIONS.map((m, i) => line('시간·잠금', `lock-${i + 1}`, S.lockLine(m))),
    line('시간·잠금', 'unlock', S.UNLOCK_TEXT),
  ];
}

export const VOICE_LINES = Object.freeze(build().map(Object.freeze));
const ID_BY_TEXT = new Map(VOICE_LINES.map((l) => [l.text, l.id]));

/** 문장 → 녹음 파일 이름 (목록에 없으면 null) */
export const voiceIdOf = (text) => ID_BY_TEXT.get(text) ?? null;
