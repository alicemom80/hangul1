// 놀이 고르기: 나무 버튼 8개를 4칸 × 2줄로 놓는다. 버튼 그림은 props/menu-*.webp (글자 쓰기·빈칸 채우기는 빈 틀 위에 그림을 얹는다).
import { h, art } from '@공통/widgets/dom.js';
import { ACTIVITIES } from '@권자료';
import { MENU_ASK } from '../audio/script.js';

const IMAGE = { w: 1536, h: 1024 };

/** 그림을 stage에 cover로 놓았을 때 그림 좌표 → 화면 좌표 (배경 그림을 꽉 채워 놓는 계산) */
export function coverMap(stageW, stageH, image = IMAGE) {
  const scale = Math.max(stageW / image.w, stageH / image.h);
  return { scale, dx: (stageW - image.w * scale) / 2, dy: (stageH - image.h * scale) / 2 };
}

const PENCIL = `<svg class="card-pencil" viewBox="0 0 60 120" aria-hidden="true">
  <polygon points="12,100 48,100 30,118" fill="#f6d9a8" stroke="#3a2a1c" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="25,111 35,111 30,118" fill="#3a2a1c"/>
  <rect x="12" y="22" width="36" height="78" fill="#ff9a3c" stroke="#3a2a1c" stroke-width="3" stroke-linejoin="round"/>
  <rect x="12" y="10" width="36" height="12" fill="#f2c0c0" stroke="#3a2a1c" stroke-width="3"/>
  <rect x="12" y="2" width="36" height="8" rx="3" fill="#c9ccd4" stroke="#3a2a1c" stroke-width="3"/>
</svg>`;

/** 그림에 없는 두 놀이의 버튼 속 그림 */
const EXTRA_ART = {
  write: () => {
    const wrap = h('div', { class: 'card-art' });
    wrap.innerHTML = PENCIL;
    wrap.append(h('span', { class: 'card-letter' }, 'ㄱ'));
    return wrap;
  },
  blank: () => h('div', { class: 'card-art' }, h('span', { class: 'card-blank' }), h('span', { class: 'card-vowel' }, 'ㅏ')),
};

export const menuScreen = {
  showBar: true,
  background: 'savanna-base',
  render(root, app, params = {}) {
    const cards = ACTIVITIES.map((a) => {
      const extra = EXTRA_ART[a.key];
      return h(
        'button',
        { class: `menu-card press${app.progress.done[a.key] ? ' done' : ''}`, 'aria-label': a.name, onclick: () => { app.sfx.pop(); app.go(a.key); } },
        art('prop', extra ? 'menu-frame' : `menu-${a.key}`),
        extra ? extra() : null,
        app.progress.done[a.key] ? art('icon', 'star', { class: 'menu-star' }) : null,
        h('span', { class: 'menu-name' }, a.name),
      );
    });
    root.append(h('div', { class: 'menu-grid' }, ...cards));
    if (params.ask) app.say(MENU_ASK);
  },
};
