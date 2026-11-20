// 권 번호를 정해서 명령을 실행한다 (윈도·맥 모두 같게). 사용: node scripts/with-volume.mjs <1|2|3> <명령...>
//   예) node scripts/with-volume.mjs 2 npm run dev   →  package.json 의 "dev:2"
import { spawnSync } from 'node:child_process';
import { VOLUME_IDS } from './volume.mjs';

const [volume, ...command] = process.argv.slice(2);
if (!VOLUME_IDS.includes(volume) || command.length === 0) {
  console.error('사용법: node scripts/with-volume.mjs <1|2|3> <명령...>');
  process.exit(2);
}
const { status } = spawnSync(command.join(' '), { stdio: 'inherit', shell: true, env: { ...process.env, VOLUME: volume } });
process.exit(status ?? 1);
