// 보상 화면: 놀이 하나를 끝내면 동물 스티커 한 장. ▶를 누르면 메뉴로 (놀이 시간이 다 됐으면 잠금 화면으로).
import { h, art, roundButton } from '@공통/widgets/dom.js';
import { stickerLine } from '../audio/script.js';
import { stopVoice } from '../audio/voice.js';
import { stickerOf } from '@권자료';

export const rewardScreen = {
  showBar: false,
  background: 'savanna-base',
  render(root, app, { sticker, isNew }) {
    const animal = stickerOf(sticker.key);
    const next = () => {
      app.sfx.pop();
      if (app.isTimeOver()) app.lock({ name: 'menu', params: {} });
      else app.go('menu', { ask: true });
    };
    root.append(
      h('div', { class: 'glowbg', 'aria-hidden': 'true' }),
      art('character', 'koko-cheer', { class: 'rw-koko', alt: '' }),
      h('div', { class: 'rw-sticker' },
        art('prop', 'slot', { class: 'rw-slot' }),
        art('character', animal.key, { class: 'rw-animal', alt: animal.name })),
      // 덤 동물은 자음이 없다
      h('p', { class: 'rw-text' }, animal.letter ? h('b', {}, animal.letter) : null, `${animal.letter ? ' ' : ''}${stickerLine(animal.name, isNew)}`),
      roundButton('play', '메뉴로', next),
    );
    app.sfx.yes();
    app.say(stickerLine(animal.name, isNew));
  },
  leave: stopVoice,
};
