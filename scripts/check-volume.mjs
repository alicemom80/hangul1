// 그 권을 만들 준비가 됐는지 점검한다 (npm run check:2 / check:3). 빠진 그림·노래를 알려 준다.
// 사용: node scripts/check-volume.mjs <1|2|3>   (필수가 빠지면 종료 코드 1)
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { VOLUME_IDS, dataFileUrl } from './volume.mjs';

const id = process.argv[2] ?? '1';
if (!VOLUME_IDS.includes(id)) {
  console.error('사용법: node scripts/check-volume.mjs <1|2|3>');
  process.exit(2);
}
const data = await import(dataFileUrl(id).href);
const { ANIMALS, VERSES, LINES, LINE_STARTS, SCENES, VOLUME, initialOf } = data;

const publicPath = (...parts) => fileURLToPath(new URL(`../public/${parts.join('/')}`, import.meta.url));
const KOKO = ['idle', 'hands', 'ask', 'cheer', 'wave', 'sleepy', 'clap', 'listen'].map((n) => `koko-${n}`);

const required = []; // [설명, 있는지, 넣을 곳]
const notes = [];

ANIMALS.forEach((a) => {
  required.push([`동물 그림 ${a.name}`, existsSync(publicPath('images/characters', `${a.key}.webp`)), `public/images/characters/${a.key}.webp`]);
});
KOKO.forEach((k) => required.push([`코코 그림 ${k}`, existsSync(publicPath('images/characters', `${k}.webp`)), `public/images/characters/${k}.webp`]));
required.push([`노래 파일`, existsSync(publicPath('audio', VOLUME.songFile)), `public/audio/${VOLUME.songFile}`]);
required.push([`노래 배경 그림`, existsSync(publicPath('images/backgrounds', `${VOLUME.songBg}.webp`)), `public/images/backgrounds/${VOLUME.songBg}.webp`]);

// 자료 점검
required.push(['절 수 = 동물 수', VERSES.length === ANIMALS.length, 'src/data/zoo' + id + '.js 의 VERSES']);
required.push(['장면 수 = 절 수', SCENES.length === VERSES.length, 'src/data/zoo' + id + '.js 의 SCENES']);
required.push(['절마다 첫소리(t)가 동물 이름의 첫 글자 초성과 같다', VERSES.every((v) => {
  const animal = ANIMALS.find((a) => a.key === v.key);
  return animal && initialOf(animal.first) === v.t;
}), 'src/data/zoo' + id + '.js 의 VERSES']);

// 있으면 좋은 것
if (LINE_STARTS.length === LINES.length) notes.push(`✔ 박자 ${LINES.length}개를 찍어 두었어요`);
else notes.push(`△ 박자(LINE_STARTS)가 ${LINE_STARTS.length}/${LINES.length}개예요. 이대로면 노래 길이에 맞춘 대략의 박자로 나와요 → tools/박자찍기.html 로 찍어서 넣으세요`);
const props = new Set(SCENES.flatMap((s) => [...(s.before ?? []), ...s.props].map(([, name]) => name)));
const missingProps = [...props].filter((p) => !existsSync(publicPath('images/props', `${p}.webp`)));
if (missingProps.length) notes.push(`△ 노래 장면 소품 그림이 없어요 (없으면 그 소품만 안 보여요): ${missingProps.join(', ')}`);
if (!existsSync(publicPath('icons/icon-512.png'))) notes.push('△ 앱 아이콘이 없어요 (public/icons)');

let missing = 0;
console.log(`\n${id}권 (${VOLUME.title} ${VOLUME.subtitle}) 준비 점검\n`);
required.forEach(([label, ok, where]) => {
  console.log(`${ok ? '✔' : '✘'} ${label}${ok ? '' : `  → ${where}`}`);
  if (!ok) missing += 1;
});
console.log('');
notes.forEach((n) => console.log(n));
console.log(missing ? `\n필수 ${missing}가지가 빠졌어요.` : `\n필수 항목은 모두 준비됐어요. ${id === '1' ? 'npm run dev' : `npm run dev:${id}`} 로 확인하세요.`);
process.exit(missing ? 1 : 0);
