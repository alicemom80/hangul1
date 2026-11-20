import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { offlineServiceWorker } from './scripts/sw-plugin.mjs';
import { VOLUME_IDS, volumeId, dataFileUrl, volumeMeta, otherVolumeFiles } from './scripts/volume.mjs';

// 여러 앱이 함께 쓰는 코드 폴더 (어린이 앱 개발/공통)
const COMMON_DIR = fileURLToPath(new URL('../공통', import.meta.url));

// 몇 권을 만들지: 환경변수 VOLUME (1·2·3, 없으면 1). 앱 코드의 '@권자료' 가 그 권의 data/zoo<권>.js 가 된다.
const VOLUME = volumeId();
const DATA_URL = dataFileUrl(VOLUME);
const data = Object.fromEntries(await Promise.all(
  VOLUME_IDS.map(async (id) => [id, await import(dataFileUrl(id).href)]),
));
const asInfo = (id) => ({ volume: data[id].VOLUME, animals: data[id].ANIMALS });
const volumeInfo = data[VOLUME].VOLUME;
// 빌드 결과에서 뺄, 다른 권에만 쓰이는 파일
const otherFiles = otherVolumeFiles(asInfo(VOLUME), VOLUME_IDS.filter((id) => id !== VOLUME).map(asInfo));

export default defineConfig({
  // GitHub Pages는 https://계정.github.io/저장소이름/ 아래에서 열리므로 상대 경로로 묶는다.
  base: './',
  resolve: { alias: { '@공통': COMMON_DIR, '@권자료': fileURLToPath(DATA_URL) } },
  // 개발 서버는 기본으로 프로젝트 밖 파일을 못 읽으므로 공통 폴더를 허용한다
  server: { port: 5173, fs: { allow: ['.', COMMON_DIR] } },
  // 빌드할 때 제목·홈 화면 이름을 그 권에 맞추고, 오프라인 저장 파일(sw.js)을 만든다
  plugins: [volumeMeta(volumeInfo, otherFiles), offlineServiceWorker()],
  test: {
    include: ['tests/unit/**/*.test.js'],
  },
});
