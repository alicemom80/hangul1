// 빈칸 채우기: 동물 이름의 첫 자음이 빈칸. 알맞은 자음을 빈칸에 끌어다 놓거나 톡 눌러서 채운다.
import { h, art } from '@공통/widgets/dom.js';
import { ANIMALS } from '@권자료';
import * as S from '../audio/script.js';
import { defineGame, enableDrag, elementAt, shuffle, el } from './kit.js';

const ROUNDS = ANIMALS.length; // 이 권에서 배운 글자 모두
const CHOICES = 4;
const HINT_AFTER_WRONG = 2;

// 한글 글자를 (초성, 중성, 종성) 호환 자모로 나눈다
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const HORIZONTAL = 'ㅗㅛㅜㅠㅡ'; // 자음이 모음 위에 오는 모음

/** 글자를 (모음, 받침)으로 나눈다. 예: 기→{vowel:'ㅣ', fin:''}, 낙→{vowel:'ㅏ', fin:'ㄱ'} */
export function partsOf(ch) {
  const c = ch.charCodeAt(0) - 0xac00;
  return { vowel: JUNG[Math.floor((c % 588) / 28)], fin: JONG[c % 28] };
}

/** 빈칸이 있는 글자 하나: 빈칸(첫 자음 자리) + 모음(+받침)을 실제 글자 모양대로 놓는다 */
export function blankCell(ch) {
  const { vowel, fin } = partsOf(ch);
  const kind = `${HORIZONTAL.includes(vowel) ? 'h' : 'v'}${fin ? 'f' : ''}`;
  return el('span', `bl-cell ${kind}`,
    el('span', 'bl-box'),
    el('span', 'bl-vow', vowel),
    ...(fin ? [el('span', 'bl-fin', fin)] : []));
}

export const blankScreen = defineGame({
  background: 'sound-bg',
  menuPage: 1,
  build(field, app, ctx) {
    const targets = shuffle(ANIMALS).slice(0, ROUNDS);
    let round = 0;
    let wrong = 0;
    let busy = true;
    let answer = null;

    const stage = el('div', 'bl-stage');
    const choices = el('div', 'bl-choices');
    field.append(stage, choices);

    const cellOf = () => stage.querySelector('.bl-cell');

    async function startRound() {
      answer = targets[round];
      wrong = 0;
      const [first, ...rest] = answer.syllables;
      app.bar.setDots(round, ROUNDS);
      stage.replaceChildren(
        art('character', answer.key, { class: 'bl-pic' }),
        el('div', 'bl-word', blankCell(first), ...rest.map((ch) => el('span', 'bl-syl', ch))),
      );
      const others = shuffle(ANIMALS.filter((a) => a.key !== answer.key)).slice(0, CHOICES - 1);
      choices.replaceChildren(
        ...shuffle([answer, ...others]).map((a) =>
          h('div', { class: 'bl-choice', 'data-key': a.key, 'aria-label': a.letterName }, a.letter)),
      );
      busy = false;
      if (round === 0) await ctx.say(S.BLANK_ASK);
    }

    const choiceOf = (key) => choices.querySelector(`.bl-choice[data-key="${key}"]`);

    async function answerWith(piece) {
      if (busy) return;
      if (piece.dataset.key !== answer.key) {
        wrong += 1; // 감점 없음
        app.sfx.boing();
        piece.classList.add('shake');
        setTimeout(() => piece.classList.remove('shake'), 450);
        if (wrong >= HINT_AFTER_WRONG) choiceOf(answer.key)?.classList.add('hint');
        ctx.say(S.BLANK_WRONG);
        return;
      }
      busy = true;
      cellOf().replaceWith(el('span', 'bl-syl hit', answer.syllables[0])); // 빈칸이 채워진 완성 글자
      piece.classList.add('gone');
      app.sfx.yes();
      round += 1;
      app.bar.setDots(round, ROUNDS);
      if (!(await ctx.say(S.blankRight(answer)))) return;
      if (!(await ctx.wait(500))) return;
      if (round >= ROUNDS) app.finish('blank');
      else startRound();
    }

    const inside = (rect, x, y) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    enableDrag(choices, {
      selector: '.bl-choice',
      onStart: () => busy,
      onDrop: (piece, x, y) => {
        // 빈칸에 놓았거나, 끌지 않고 톡 눌렀으면 답을 낸다
        if (elementAt(x, y, '.bl-box') || inside(piece.getBoundingClientRect(), x, y)) answerWith(piece);
      },
    });

    startRound();
  },
});
