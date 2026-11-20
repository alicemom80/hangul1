// 어느 권(1·2·3권)을 만들지 고른다. 환경변수 VOLUME (없으면 1권).
//   npm run dev:2 / build:2 / dev:3 / build:3  (package.json), 또는 VOLUME=2 npm run build
// vite.config.js 와 node 로 직접 돌리는 스크립트가 함께 쓴다.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const VOLUME_IDS = ['1', '2', '3'];

export function volumeId(env = process.env) {
  const id = env.VOLUME ?? '1';
  if (!VOLUME_IDS.includes(id)) throw new Error(`[volume] VOLUME 은 1, 2, 3 중 하나여야 합니다: ${id}`);
  return id;
}

/** 그 권의 자료 파일 (src/data/zoo<권>.js) */
export const dataFileUrl = (id) => new URL(`../src/data/zoo${id}.js`, import.meta.url);

/** 다른 권에만 쓰이는 파일(노래·노래 배경·동물 그림)의 dist 안 위치 목록 */
export function otherVolumeFiles(current, others) {
  const mine = new Set(current.animals.map((a) => a.key));
  return others.flatMap((o) => [
    `audio/${o.volume.songFile}`,
    `images/backgrounds/${o.volume.songBg}.webp`,
    ...o.animals.filter((a) => !mine.has(a.key)).map((a) => `images/characters/${a.key}.webp`),
  ]).filter((f) => f !== `audio/${current.volume.songFile}` && f !== `images/backgrounds/${current.volume.songBg}.webp`);
}

/**
 * 제목·홈 화면 이름을 그 권에 맞게 바꾸고, 다른 권 전용 파일을 빌드 결과에서 뺀다(용량·오프라인 저장 줄이기).
 * volume 은 자료 파일의 VOLUME 이름표, remove 는 빼 낼 파일 목록(dist 기준).
 */
export function volumeMeta(volume, remove = []) {
  let outDir = 'dist';
  return {
    name: 'volume-meta',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return html
        .replace(/<title>.*<\/title>/, `<title>${volume.title} ${volume.subtitle}</title>`)
        .replace(/(name="apple-mobile-web-app-title" content=")[^"]*"/, `$1${volume.shortName}"`);
    },
    // 홈 화면에 설치할 때 보이는 이름. sw 만드는 플러그인(closeBundle)보다 먼저 끝난다.
    writeBundle() {
      remove.forEach((f) => rmSync(join(outDir, f), { force: true }));
      const file = join(outDir, 'manifest.webmanifest');
      const manifest = JSON.parse(readFileSync(file, 'utf8'));
      writeFileSync(file, `${JSON.stringify({
        ...manifest,
        name: `${volume.title} ${volume.subtitle}`,
        short_name: volume.shortName,
        description: volume.description,
      }, null, 2)}\n`);
    },
  };
}
