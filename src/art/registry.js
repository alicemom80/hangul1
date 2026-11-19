// 그림 목록: 이름 → 파일 위치. 그림을 바꿀 때는 public/images 안의 파일만 같은 이름으로 바꾸면 된다.

const BASE = `${import.meta.env.BASE_URL}images/`;

// 그려 둔 캐릭터 (webp): 코코 자세 6개 + 동물 친구 5마리 (코끼리 친구는 코코와 같은 그림)
const CHARACTERS = [
  'elephant', 'giraffe', 'camel', 'squirrel', 'lion', 'hippo',
  'koko-idle', 'koko-hands', 'koko-ask', 'koko-cheer', 'koko-wave', 'koko-sleepy', 'koko-clap', 'koko-listen',
];
const ICONS_SVG = ['play', 'check', 'home', 'close', 'lock', 'back'];
const ICONS_WEBP = ['settings', 'speaker', 'star'];
const BACKGROUNDS = [
  'savanna-base', 'night-base', // 시작·보상·스티커북 / 잠금 화면
  'song-bg', 'menu-bg', 'puzzle-bg', 'sound-bg', 'clap-bg', 'match-bg', 'tag-bg',
];
const PROPS = ['card-back', 'card-front', 'tag', 'sign', 'slot', 'cloud', 'tree', 'bush', 'pond', 'acorn1', 'acorn2', 'note1', 'note2',
  'menu-frame', 'menu-song', 'menu-puzzle', 'menu-sound', 'menu-clap', 'menu-match', 'menu-tag'];

const KINDS = {
  character: { dir: 'characters', names: CHARACTERS, webp: CHARACTERS },
  icon: { dir: 'icons', names: [...ICONS_SVG, ...ICONS_WEBP], webp: ICONS_WEBP },
  background: { dir: 'backgrounds', names: BACKGROUNDS, webp: BACKGROUNDS },
  prop: { dir: 'props', names: PROPS, webp: PROPS },
};

/** 그림 파일 주소. 목록에 없는 이름이면 바로 오류를 내서 오타를 빨리 찾는다. */
export function artUrl(kind, name) {
  const group = KINDS[kind];
  if (!group) throw new Error(`[art] 없는 그림 종류입니다: ${kind}`);
  if (!group.names.includes(name)) throw new Error(`[art] 없는 그림입니다: ${kind}/${name}`);
  return `${BASE}${group.dir}/${name}.${group.webp.includes(name) ? 'webp' : 'svg'}`;
}

/** 모든 그림 주소 */
export const allArtUrls = () =>
  Object.keys(KINDS).flatMap((kind) => KINDS[kind].names.map((name) => artUrl(kind, name)));
