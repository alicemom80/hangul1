// 노래방: 노래가 나오며 가사가 박자에 맞춰 분홍색으로 차오른다. 글자를 누르면 그 구간만 다시 들려준다.
// 노래가 끝나면 스티커 한 장. 박자(LINE_STARTS)는 사용자가 직접 찍어 확정한 값이다.
import { h, art } from '@공통/widgets/dom.js';
import { VERSES, LINES, LINE_STARTS, LYRIC_END, initialOf } from '../data/zoo1.js';
import { SONG_END } from '../audio/script.js';
import { stopVoice } from '../audio/voice.js';
import { artUrl } from '../art/registry.js';

const SONG_URL = `${import.meta.env.BASE_URL}audio/song.mp3`;
const MAX_LINE_SEC = 4.6;
const LAST_VERSE = VERSES.length - 1;

/** 장면(동물 + 소품) 6개: 노래 절마다 하나씩 */
const scene = (...items) => h('div', { class: 'scene' }, ...items);
const prop = (cls, name, kind = 'prop') => art(kind, name, { class: cls });
const buildScenes = () => [
  scene(prop('ch giraffe', 'giraffe', 'character'), prop('pr tree1', 'tree'), prop('nt n1', 'note1'), prop('nt n2', 'note2')),
  scene(prop('ch camel', 'camel', 'character'), prop('nt n3', 'note1'), prop('nt n4', 'note2')),
  scene(prop('pr tree1', 'tree'), prop('ch squirrel', 'squirrel', 'character'), prop('pr ac1', 'acorn1'), prop('pr ac2', 'acorn2'), prop('nt n1', 'note1')),
  scene(prop('ch lion', 'lion', 'character'), prop('pr bush1', 'bush'), prop('pr bush2', 'bush'), prop('nt n3', 'note2')),
  scene(prop('pr pond', 'pond'), prop('ch hippo', 'hippo', 'character'), prop('nt n2', 'note1'), prop('nt n4', 'note2')),
  scene(prop('nt n1', 'note1'), prop('nt n3', 'note2'), prop('nt n4', 'note1')),
];

export const songScreen = {
  showBar: false,
  background: 'song-bg',

  render(root, app) {
    const au = new Audio(SONG_URL);
    au.preload = 'auto';
    let raf = 0;
    let alive = true;
    let pieceEnd = null;
    let lineIdx = -2;
    let verseIdx = -1;
    let sylEls = [];
    let sylT = [];

    const scenes = buildScenes();
    const koko = art('character', 'koko-idle', { class: 'koko' });
    const big = h('div', { class: 'big' }, 'ㄱ');
    const cur = h('div', { class: 'cur' });
    const nxt = h('div', { class: 'nxt' });
    const vb = h('div', { class: 'vb' });
    const pp = h('button', { class: 'rb pp', 'aria-label': '재생 멈춤' }, '⏸');
    const home = h('button', { class: 'rb homeb', 'aria-label': '놀이 고르기' }, art('icon', 'home', { class: 'ico' }));
    const field = h('div', { class: 'field song' },
      h('div', { class: 'scenes' }, ...scenes), koko, big, vb, h('div', { class: 'lyric' }, cur, nxt), pp, home);
    root.append(field);

    const play = () => au.play().catch(() => {});
    const lineRange = (i) => {
      const s = LINE_STARTS[i];
      const next = i + 1 < LINE_STARTS.length ? LINE_STARTS[i + 1] : LYRIC_END;
      return [s, Math.min(s + MAX_LINE_SEC, Math.max(s + 1, next - 0.25))];
    };
    const findLine = (t) => LINE_STARTS.reduce((r, s, i) => (s <= t ? i : r), -1);

    function playPiece(a, b) {
      au.currentTime = a;
      pieceEnd = b;
      play();
    }

    function buildLine(i) {
      cur.replaceChildren();
      sylEls = [];
      sylT = [];
      if (i < 0 || i >= LINES.length) {
        nxt.textContent = '';
        return;
      }
      const { words, verse } = LINES[i];
      const { t: target, L } = VERSES[verse];
      const count = words.join('').length;
      const [s, e] = lineRange(i);
      const seg = (e - s) / count;
      cur.style.setProperty('--fs', `calc(var(--u)*${Math.min(7.2, +(80 / (count * 1.06 + (words.length - 1) * 0.45)).toFixed(2))})`);
      let k = 0;
      words.forEach((w) => {
        const word = h('div', { class: 'word' });
        [...w].forEach((ch) => {
          const isTarget = initialOf(ch) === target;
          const a = s + k * seg;
          const b = a + seg;
          sylT.push([a, b, isTarget]);
          const sy = h('span', { class: 'sy' }, isTarget ? h('i', {}, L) : null, h('span', { class: 'b' }, ch), h('span', { class: 'f' }, ch));
          sy.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); playPiece(a, b); });
          sylEls.push(sy);
          word.append(sy);
          k += 1;
        });
        cur.append(word);
      });
      nxt.textContent = i + 1 < LINES.length ? LINES[i + 1].words.join(' ') : '';
    }

    function setVerse(v) {
      if (v === verseIdx) return;
      verseIdx = v;
      [...vb.children].forEach((b, k) => b.classList.toggle('on', k === v));
      scenes.forEach((sc, k) => sc.classList.toggle('on', k === v));
      big.textContent = VERSES[v].L;
      const hero = v === LAST_VERSE;
      koko.classList.toggle('hero', hero);
      koko.src = artUrl('character', hero ? 'koko-cheer' : 'koko-idle');
    }

    VERSES.forEach((v, vi) => {
      vb.append(h('button', {
        class: 'vbtn',
        onpointerdown: (ev) => {
          ev.stopPropagation();
          au.currentTime = Math.max(0, LINE_STARTS[vi * 4] - 0.05);
          pieceEnd = null;
          play();
        },
      }, v.L));
    });

    function frame() {
      if (!alive) return;
      const t = au.currentTime;
      if (pieceEnd !== null && t >= pieceEnd) {
        au.pause();
        pieceEnd = null;
      }
      const li = findLine(t);
      const show = li < 0 ? 0 : li;
      if (show !== lineIdx) {
        lineIdx = show;
        buildLine(show);
      }
      setVerse(LINES[show].verse);
      let hit = false;
      sylEls.forEach((sy, k) => {
        const [a, b, isTarget] = sylT[k];
        const p = li < 0 ? 0 : Math.max(0, Math.min(1, (t - a) / (b - a)));
        sy.querySelector('.f').style.width = `${p * 100}%`;
        const active = li >= 0 && t >= a && t < b;
        sy.classList.toggle('act', active);
        if (active && isTarget) hit = true;
      });
      big.classList.toggle('on', hit);
      raf = requestAnimationFrame(frame);
    }

    const syncPlayButton = () => { pp.textContent = au.paused ? '▶' : '⏸'; };
    au.addEventListener('play', syncPlayButton);
    au.addEventListener('pause', syncPlayButton);
    au.addEventListener('ended', async () => {
      if (!alive) return;
      app.sfx.yes();
      await app.say(SONG_END);
      if (alive) app.finish('song');
    });
    pp.addEventListener('pointerdown', () => {
      if (au.paused) { pieceEnd = null; play(); } else au.pause();
    });
    home.addEventListener('pointerdown', () => app.go('menu'));

    app.startSound();
    au.currentTime = 0;
    play().then?.(syncPlayButton);
    frame();

    this.stop = () => {
      alive = false;
      cancelAnimationFrame(raf);
      au.pause();
      au.removeAttribute('src');
      au.load();
    };
  },

  leave() {
    this.stop?.();
    this.stop = null;
    stopVoice();
  },
};
