/**
 * setupDB.ts
 * Master setup script — run this once to get the full DB ready.
 *
 * Steps:
 *   1. Parse Excel → problems-from-sheet.json
 *   2. Seed MongoDB with all problems from sheet
 *   3. Create Weaviate schema + seed pattern knowledge
 *
 * Run: npx ts-node src/scripts/setupDB.ts
 *      or: npm run setup:db
 *
 * Prerequisites:
 *   - docker compose up -d   (MongoDB + Weaviate must be running)
 *   - SHEET_PATH env set, or file at default location
 */

import { execSync } from 'child_process';
import * as path from 'path';

const SCRIPTS_DIR = __dirname;

function run(label: string, script: string) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`▶  ${label}`);
  console.log('─'.repeat(60));
  try {
    execSync(
      `npx ts-node "${path.join(SCRIPTS_DIR, script)}"`,
      { stdio: 'inherit', env: process.env }
    );
  } catch (err: any) {
    console.error(`\n❌ Step failed: ${label}`);
    console.error(err.message);
    process.exit(1);
  }
}

console.log('');
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║         DSA AI Coach — Database Setup                ║');
console.log('╚══════════════════════════════════════════════════════╝');

run('Step 1/3: Parse Excel → problems-from-sheet.json', 'parseSheet.ts');
run('Step 2/3: Seed MongoDB problems',                  'seedFromSheet.ts');
run('Step 3/3: Setup Weaviate schema + pattern RAG',    'setupWeaviate.ts');

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║  ✅  Setup complete! Start the backend with:         ║');
console.log('║     cd backend && npm run dev                        ║');
console.log('╚══════════════════════════════════════════════════════╝\n');
