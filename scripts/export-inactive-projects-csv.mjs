#!/usr/bin/env node
/**
 * Emit a CSV of paused/retired projects for bulk editing:
 * Slug,Started,Status,AboutBody,Section2Title,Section2Body
 *
 * Usage: node scripts/export-inactive-projects-csv.mjs [out.csv]
 * Default: src/data/inactive-projects-content.csv
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const projectsDir = resolve(root, 'src/content/projects');
const outPath = resolve(root, process.argv[2] ?? 'src/data/inactive-projects-content.csv');

function parseFrontmatterAndBody(raw) {
  if (!raw.startsWith('---\n')) return { started: '', status: 'active', body: raw };
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return { started: '', status: 'active', body: raw };
  const fm = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const startedM = fm.match(/^started:\s*(.+)$/m);
  const statusM = fm.match(/^status:\s*(.+)$/m);
  return {
    started: (startedM?.[1] ?? '').trim(),
    status: (statusM?.[1] ?? 'active').trim(),
    body,
  };
}

/** Split markdown body into first ## block and optional second ## block */
function splitSections(body) {
  const lines = body.replace(/^\uFEFF/, '').split('\n');
  const sections = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const hm = line.match(/^##\s+(.+)\s*$/);
    if (hm) {
      const title = hm[1].trim();
      i++;
      const contentLines = [];
      while (i < lines.length && !/^##\s/.test(lines[i])) {
        contentLines.push(lines[i]);
        i++;
      }
      const content = contentLines.join('\n').replace(/\n+$/, '');
      sections.push({ title, content });
      continue;
    }
    i++;
  }
  const about = sections.find((s) => /^about$/i.test(s.title)) ?? sections[0];
  const second = sections.find((s) => s !== about);
  return {
    aboutBody: about?.content?.trim() ?? '',
    section2Title: second?.title?.trim() ?? '',
    section2Body: second?.content?.trim() ?? '',
  };
}

function csvEscape(field) {
  const s = field == null ? '' : String(field);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const files = readdirSync(projectsDir).filter((f) => f.endsWith('.md'));
const rows = [['Slug', 'Started', 'Status', 'AboutBody', 'Section2Title', 'Section2Body']];

for (const file of files.sort()) {
  const slug = file.replace(/\.md$/, '');
  const raw = readFileSync(resolve(projectsDir, file), 'utf8');
  const { started, status, body } = parseFrontmatterAndBody(raw);
  if (status !== 'paused' && status !== 'retired') continue;
  const { aboutBody, section2Title, section2Body } = splitSections(body);

  rows.push([
    slug,
    started,
    status,
    aboutBody,
    section2Title,
    section2Body,
  ]);
}

const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n';
const outDir = dirname(outPath);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, csv, 'utf8');
console.log(`Wrote ${rows.length - 1} rows to ${outPath}`);
