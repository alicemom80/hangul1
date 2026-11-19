// 소리 맞히기: 동물 이름의 첫 글자 소리를 듣고, 그 소리로 시작하는 동물 그림을 고른다.
import { h, art } from '@공통/widgets/dom.js';
import { ANIMALS } from '../data/zoo1.js';
import * as S from '../audio/script.js';
import { defineGame, shuffle, el } from './kit.js';

const ROUNDS = 5;
const CHOICES = 3;
const HINT_AFTER_WRONG = 2;

export const soundScreen = defineGame({
  background: 'sound-bg',
  build(field, app, ctx) {
    const targets = shuffle(ANIMALS).slice(0, ROUNDS);
    let round = 0;
    let wrong = 0;
    let busy = true;
    let answer = null;

    const cards = el('div', 'sd-cards');
    const replay = h(
      'button',
      { class: 'sd-ear press', 'aria-label': '소리 다시 듣기', onclick: () => { if (answer) ctx.say(S.soundAsk(answer.first)); } },
      art('icon', 'speaker', { class: 'ico' }),
    );
    field.append(art('character', 'koko-listen', { class: 'sd-koko' }), replay, cards);

    function startRound() {
      answer = targets[round];
      wrong = 0;
      const others = shuffle(ANIMALS.filter((a) => a.key !== answer.key)).slice(0, CHOICES - 1);
      app.bar.setDots(round, ROUNDS);
      cards.replaceChildren(
        ...shuffle([answer, ...others]).map((a) =>
          h('button', { class: 'sd-card press', 'data-key': a.key, 'aria-label': a.name, onclick: () => pick(a) }, art('character', a.key, { class: 'pic' }), h('span', { class: 'lbl' }, a.name))),
      );
      busy = false;
      ctx.say(S.soundAsk(answer.first));
    }

    async function pick(animal) {
      if (busy) return;
      const card = cards.querySelector(`[data-key="${animal.key}"]`);
      if (animal.key !== answer.key) {
        wrong += 1; // 감점 없음: 다시 들려주고, 두 번 틀리면 정답이 반짝인다
        app.sfx.boing();
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 450);
        if (wrong >= HINT_AFTER_WRONG) cards.querySelector(`[data-key="${answer.key}"]`)?.classList.add('hint');
        ctx.say(S.SOUND_RETRY).then((ok) => ok && ctx.say(S.soundAsk(answer.first)));
        return;
      }
      busy = true;
      card.classList.add('right');
      app.sfx.yes();
      round += 1;
      app.bar.setDots(round, ROUNDS);
      if (!(await ctx.say(S.soundRight(animal.name)))) return;
      if (!(await ctx.wait(400))) return;
      if (round >= ROUNDS) app.finish('sound');
      else startRound();
    }

    startRound();
  },
});
