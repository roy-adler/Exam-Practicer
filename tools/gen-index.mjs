// tools/gen-index.mjs
import { promises as fs } from 'node:fs';
import path from 'node:path';

const dir = path.resolve('exam-questions');
const out = path.join(dir, 'index.json');

async function main() {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => null);
  if (!entries) throw new Error(`Directory not found: ${dir}`);

  const files = entries
    .filter(e => e.isFile() && e.name.endsWith('.json') && e.name !== 'index.json')
    .map(e => e.name)
    .sort();

  await fs.writeFile(out, JSON.stringify(files, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${out} with ${files.length} files`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
