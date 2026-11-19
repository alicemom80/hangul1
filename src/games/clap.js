// 박수 놀이: 동물 이름을 글자(박)마다 한 번씩 박수. 코코를 톡 누르면 짝! 하고 글자가 켜진다.
import { h, art } from '@공통/widgets/dom.js';
import { ANIMALS } from '../data/zoo1.js';
import * as S from '../audio/script.js';
import { defineGame, shuffle, el } from './kit.js';

const ROUNDS = 4;
const HINT_AFTER_MS = 6000;

export const clapScreen = defineGame({
  background: 'clap-bg',
  build(field, app, ctx) {
    const targets = shuffle(ANIMALS).slice(0, ROUNDS);
    let round = 0;
    let claps = 0;
    let busy = true;
    let current = null;

    const animalBox = el('div', 'cl-animal');
    const syllables = el('div', 'cl-syllables');
    const koko = h('button', { class: 'cl-koko', 'aria-label': '박수 치기', onpointerdown: clap }, art('character', 'koko-clap'));
    const bubble = h('div', { class: 'cl-bubble', role: 'status' });
    field.append(animalBox, syllables, bubble, koko);

    async function startRound() {
      current = targets[round];
      claps = 0;
      app.bar.setDots(round, ROUNDS);
      animalBox.replaceChildren(art('character', current.key));
      syllables.replaceChildren(...current.syllables.map((s) => el('span', 'cl-syl', s)));
      bubble.replaceChildren(
        h('b', {}, current.name), '! 코코를 톡톡 눌러서', h('br'), `글자마다 한 번씩 박수를 쳐 봐! (${current.syllables.length}번)`);
      busy = true;
      if (!(await ctx.say(S.clapAsk(current.name)))) return;
      busy = false;
      const mine = round;
      setTimeout(() => {
        if (ctx.alive() && round === mine && claps === 0) ctx.say(S.CLAP_HINT);
      }, HINT_AFTER_MS);
    }

    async function clap() {
      if (busy) return;
      app.sfx.clap();
      koko.classList.remove('hit');
      void koko.offsetWidth; // 같은 애니메이션을 다시 처음부터
      koko.classList.add('hit');
      syllables.children[claps]?.classList.add('on');
      claps += 1;
      if (claps < current.syllables.length) return;

      busy = true;
      app.sfx.yes();
      round += 1;
      app.bar.setDots(round, ROUNDS);
      if (!(await ctx.say(S.clapDone(current.name)))) return;
      if (!(await ctx.wait(400))) return;
      if (round >= ROUNDS) app.finish('clap');
      else startRound();
    }

    startRound();
  },
});
