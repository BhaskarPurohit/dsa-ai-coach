/**
 * parseSheet.ts
 * Reads DSA patterns Cheat Sheet.xlsx and outputs a structured JSON
 * of all problems grouped by pattern.
 *
 * Run: npx ts-node src/scripts/parseSheet.ts
 * Output: src/scripts/problems-from-sheet.json
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// ─── adjust this path to wherever your file lives ───────────────────────────
const SHEET_PATH = process.env.SHEET_PATH ||
  'C:/Users/bhask/Downloads/DSA patterns Cheat Sheet.xlsx';
// ────────────────────────────────────────────────────────────────────────────

interface SheetProblem {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pattern: string;
  patternId: string;
  order: number;           // position within pattern
  leetcodeLink: string;
  altLinks: string[];
  seeded: boolean;         // true = has full starter code in seedFromSheet.ts
}

/** Convert a pattern display name to a slug */
function toPatternId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Extract difficulty from a title like "Two Sum (easy)" → "easy" */
function extractDifficulty(raw: string): 'easy' | 'medium' | 'hard' {
  const m = raw.match(/\((easy|medium|med|hard)\)/i);
  if (!m) return 'medium'; // default if not specified
  const d = m[1].toLowerCase();
  if (d === 'med') return 'medium';
  return d as 'easy' | 'medium' | 'hard';
}

/** Clean the problem title — remove the trailing (difficulty) tag */
function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*\((easy|medium|med|hard)\)\s*/gi, '')
    .replace(/^\d+\.\s*/, '')      // remove leading "1. "
    .replace(/^Problem Challenge \d+:\s*/i, '')
    .trim();
}

/** Detect if a cell value is a pattern header row */
function isPatternHeader(val: string): string | null {
  if (!val) return null;
  // Formats seen in the sheet:
  //   "1. Pattern: Two Pointers"
  //   "Pattern: Kadane pattern"
  //   "PATTERN: PREFIX SUM"
  //   "HEAP PATTERN"
  //   "Recursion and Backtracking Pattern"
  //   "Tree Pattern"
  //   "7. Pattern: Stack"
  const m1 = val.match(/(?:\d+\.\s*)?Pattern:\s*(.+)/i);
  if (m1) return m1[1].trim();

  const m2 = val.match(/^(.+?)\s+PATTERN$/i);
  if (m2) return m2[1].trim();

  // Exact standalone pattern names seen in the sheet
  const standalone = [
    'Recursion and Backtracking Pattern',
    'Tree Pattern',
  ];
  if (standalone.some(s => val.trim().toLowerCase() === s.toLowerCase())) {
    return val.trim().replace(/\s*Pattern\s*$/i, '').trim();
  }

  return null;
}

function parseSheet(): SheetProblem[] {
  if (!fs.existsSync(SHEET_PATH)) {
    console.error(`❌ File not found: ${SHEET_PATH}`);
    console.error('Set SHEET_PATH env var or place the file at the default path.');
    process.exit(1);
  }

  const wb = XLSX.readFile(SHEET_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: (string | null)[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
  }) as any;

  const problems: SheetProblem[] = [];
  let currentPattern = '';
  let currentPatternId = '';
  let orderInPattern = 0;
  let globalId = 1;

  for (const row of rows) {
    // column B (index 1) has both pattern headers and problem names
    const colB = (row[1] as string | null)?.trim() || '';
    const link1 = (row[2] as string | null)?.trim() || '';
    const link2 = (row[3] as string | null)?.trim() || '';
    const link3 = (row[4] as string | null)?.trim() || '';

    if (!colB) continue;

    // Skip the column header row
    if (colB === 'Question') continue;
    // Skip the Instagram title row
    if (colB.includes('INSTA Channel')) continue;

    const patternName = isPatternHeader(colB);
    if (patternName) {
      currentPattern = patternName;
      currentPatternId = toPatternId(patternName);
      orderInPattern = 0;
      continue;
    }

    if (!currentPattern) continue; // rows before first pattern header

    orderInPattern++;
    const difficulty = extractDifficulty(colB);
    const title = cleanTitle(colB);

    // Skip blank/noise titles
    if (title.length < 3) continue;

    const altLinks = [link2, link3].filter(Boolean).filter(l => !l.includes('Homework'));

    problems.push({
      id: globalId++,
      title,
      difficulty,
      pattern: currentPattern,
      patternId: currentPatternId,
      order: orderInPattern,
      leetcodeLink: link1,
      altLinks,
      seeded: false, // will be flipped to true in seedFromSheet.ts
    });
  }

  return problems;
}

const problems = parseSheet();

// Group by pattern for display
const byPattern: Record<string, SheetProblem[]> = {};
for (const p of problems) {
  if (!byPattern[p.pattern]) byPattern[p.pattern] = [];
  byPattern[p.pattern].push(p);
}

console.log(`\n✅ Parsed ${problems.length} problems across ${Object.keys(byPattern).length} patterns:\n`);
for (const [pattern, probs] of Object.entries(byPattern)) {
  const e = probs.filter(p => p.difficulty === 'easy').length;
  const m = probs.filter(p => p.difficulty === 'medium').length;
  const h = probs.filter(p => p.difficulty === 'hard').length;
  console.log(`  ${pattern.padEnd(40)} ${probs.length} problems  (${e}E ${m}M ${h}H)`);
}

const outPath = path.join(__dirname, 'problems-from-sheet.json');
fs.writeFileSync(outPath, JSON.stringify({ patterns: byPattern, flat: problems }, null, 2));
console.log(`\n📄 Written to: ${outPath}`);
