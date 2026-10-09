#!/usr/bin/env node
// Mesa UI audit: finds hard-coded visual values that should come from src/theme.
// Usage: node .claude/skills/mesa-ui/scripts/audit.mjs [path]   (default: mobile/src)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.argv[2] ?? 'mobile/src';
const SPACING = new Set([0, 4, 8, 12, 16, 20, 24, 32, 40]);
const checks = [
  { id: 'color', label: 'color hex/rgb', re: /#[0-9A-Fa-f]{3,8}\b|rgba?\(/g },
  { id: 'fontSize', label: 'fontSize numérico', re: /fontSize:\s*\d+(\.\d+)?/g },
  { id: 'radius', label: 'borderRadius numérico', re: /border\w*Radius:\s*\d+(\.\d+)?/g },
  { id: 'tinyText', label: 'texto < 12', re: /fontSize:\s*(?:[0-9]|1[01])(?:\.\d+)?\b/g },
  { id: 'noScale', label: 'allowFontScaling={false}', re: /allowFontScaling=\{false\}/g },
  {
    id: 'spacing', label: 'espaciado fuera de escala',
    re: /\b(?:padding|margin|gap|rowGap|columnGap)\w*:\s*(\d+(?:\.\d+)?)/g,
    filter: (m) => !SPACING.has(Number(m[1])),
  },
];

const files = [];
const walk = (p) => {
  const s = statSync(p);
  if (s.isDirectory()) {
    if (/node_modules|[\\/]theme$/.test(p)) return;
    for (const f of readdirSync(p)) walk(join(p, f));
  } else if (/\.(tsx?|jsx?)$/.test(p) && !p.split(sep).includes('theme')) files.push(p);
};
walk(root);

const totals = Object.fromEntries(checks.map((c) => [c.id, 0]));
const rows = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const row = { file: relative(process.cwd(), f), n: 0 };
  for (const c of checks) {
    const hits = [...src.matchAll(c.re)].filter((m) => (c.filter ? c.filter(m) : true)).length;
    row[c.id] = hits; row.n += hits; totals[c.id] += hits;
  }
  if (row.n) rows.push(row);
}
rows.sort((a, b) => b.n - a.n);
console.log(`Archivos analizados: ${files.length} · con avisos: ${rows.length}\n`);
console.log(['avisos', ...checks.map((c) => c.id), 'archivo'].join('\t'));
for (const r of rows.slice(0, 40)) console.log([r.n, ...checks.map((c) => r[c.id]), r.file].join('\t'));
if (rows.length > 40) console.log(`… y ${rows.length - 40} archivos más`);
console.log('\nTotales:');
for (const c of checks) console.log(`  ${c.label}: ${totals[c.id]}`);
