#!/usr/bin/env node
/**
 * Apply src/data/retired-projects.csv to project Markdown files.
 * Updates only rows with Status === retired: started, status, and body (## About + optional second section).
 * Preserves existing frontmatter keys when the file already exists.
 * Creates missing slugs with minimal frontmatter (name from slug, generic tagline).
 *
 * Usage:
 *   node scripts/update-retired-projects-from-csv.mjs [path/to.csv]
 * Default: src/data/retired-projects.csv
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const projectsDir = resolve(projectRoot, 'src/content/projects');
const inputPath = resolve(projectRoot, process.argv[2] ?? 'src/data/retired-projects.csv');

const yamlEscape = (s) => {
  if (s == null) return '""';
  const str = String(s);
  if (/[\n":\[\]{}#&*!|>'"%@`]/.test(str) || str.trim() !== str) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return str;
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const t = text.replace(/^\uFEFF/, '');
  while (i < t.length) {
    const c = t[i];
    if (inQuotes) {
      if (c === '"' && t[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (c === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function slugToName(slug) {
  return slug
    .split('-')
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

function mergeFrontmatter(existingFm, started) {
  const lines = existingFm.split('\n');
  const out = [];
  let hasStarted = false;
  let hasStatus = false;
  for (const line of lines) {
    if (/^started:\s*/.test(line)) {
      out.push(`started: ${started}`);
      hasStarted = true;
    } else if (/^status:\s*/.test(line)) {
      out.push('status: retired');
      hasStatus = true;
    } else {
      out.push(line);
    }
  }
  if (!hasStarted) {
    out.push(`started: ${started}`);
  }
  if (!hasStatus) {
    out.push('status: retired');
  }
  return out.join('\n');
}

function buildBody(aboutBody, section2Title, section2Body) {
  const about = (aboutBody ?? '').trim();
  const t2 = (section2Title ?? '').trim();
  const b2 = (section2Body ?? '').trim();
  let body = `## About\n\n${about}`;
  if (t2) {
    body += `\n\n## ${t2}\n\n${b2}`;
  }
  body += '\n';
  return body;
}

if (!existsSync(inputPath)) {
  console.error(`CSV not found: ${inputPath}`);
  process.exit(1);
}

if (!existsSync(projectsDir)) mkdirSync(projectsDir, { recursive: true });

const rows = parseCsv(readFileSync(inputPath, 'utf8'));
if (rows.length < 2) {
  console.error('CSV has no data rows.');
  process.exit(1);
}

const headers = rows[0].map((h) => h.trim());
const idx = (name) => {
  const i = headers.indexOf(name);
  if (i === -1) {
    console.error(`Missing column: ${name}. Found: ${headers.join(', ')}`);
    process.exit(1);
  }
  return i;
};

const iSlug = idx('Slug');
const iStarted = idx('Started');
const iStatus = idx('Status');
const iAbout = idx('AboutBody');
const iSecTitle = idx('Section2Title');
const iSecBody = idx('Section2Body');

let updated = 0;
let created = 0;
let skipped = 0;

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (!row || row.every((c) => !c || !String(c).trim())) {
    skipped++;
    continue;
  }

  const slug = String(row[iSlug] ?? '')
    .trim()
    .toLowerCase();
  const status = String(row[iStatus] ?? '')
    .trim()
    .toLowerCase();
  if (!slug || status !== 'retired') {
    skipped++;
    continue;
  }

  const started = String(row[iStarted] ?? '').trim();
  const aboutBody = row[iAbout] ?? '';
  const section2Title = row[iSecTitle] ?? '';
  const section2Body = row[iSecBody] ?? '';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(started)) {
    console.error(`Invalid Started for ${slug}: "${started}" (use YYYY-MM-DD)`);
    process.exit(1);
  }

  const filepath = resolve(projectsDir, `${slug}.md`);
  const body = buildBody(aboutBody, section2Title, section2Body);

  if (existsSync(filepath)) {
    const raw = readFileSync(filepath, 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) {
      console.error(`Unexpected format (no frontmatter): ${filepath}`);
      process.exit(1);
    }
    const newFm = mergeFrontmatter(m[1], started);
    writeFileSync(filepath, `---\n${newFm}\n---\n\n${body}`, 'utf8');
    updated++;
  } else {
    const name = slugToName(slug);
    const fm = [
      '---',
      `name: ${yamlEscape(name)}`,
      `tagline: ${yamlEscape('Past portfolio entry from the archive.')}`,
      `started: ${started}`,
      'status: retired',
      'featured: false',
      'order: 0',
      '---',
      '',
      body.trimEnd(),
      '',
    ].join('\n');
    writeFileSync(filepath, fm, 'utf8');
    created++;
  }
}

console.log(`Done. Updated ${updated}, created ${created}, skipped ${skipped} rows.`);
