import fs from 'node:fs';
import path from 'node:path';

const VALID_TYPES = new Set(['post', 'work', 'project', 'library']);
const TODAY = new Date().toISOString().slice(0, 10);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFileIfMissing(targetPath, content) {
  if (fs.existsSync(targetPath)) {
    throw new Error(`File already exists: ${targetPath}`);
  }
  fs.writeFileSync(targetPath, content, 'utf8');
}

const POST_KINDS = new Set(['essay', 'note', 'link']);

function yamlString(value) {
  return JSON.stringify(value);
}

/**
 * Posts are one typed stream: essay (default), note, or link.
 * `--mdx` scaffolds an .mdx file for posts that use components
 * (Prompt, Appendix, Compare, Sidenote…); plain .md otherwise.
 */
function scaffoldPost(slug, title, { kind = 'essay', link, mdx = false } = {}) {
  const ext = mdx ? 'mdx' : 'md';
  const fileName = `${TODAY}-${slug}.${ext}`;
  const targetPath = path.join(process.cwd(), 'src/content/posts', fileName);
  const safeTitle = title ?? (kind === 'note' ? undefined : slug.replace(/-/g, ' '));

  const lines = ['---', `type: ${kind}`];
  if (safeTitle) lines.push(`title: ${yamlString(safeTitle)}`);
  if (kind === 'link') lines.push(`link: ${link}`);
  lines.push(`date: ${TODAY}`, 'tags: []');
  if (kind === 'essay') lines.push('status: working');
  lines.push('draft: true', '---', '');

  const body = {
    essay: mdx
      ? 'Write your essay here. Components are available without imports — see docs/CONTENT_WORKFLOW.md.\n'
      : 'Write your essay here.\n',
    note: 'A short thought.\n',
    link: '> A pull quote from the source.\n\nYour take.\n',
  }[kind];

  writeFileIfMissing(targetPath, lines.join('\n') + '\n' + body);
  return targetPath;
}

function scaffoldWork(slug, title) {
  const safeTitle = title ?? slug.replace(/-/g, ' ');
  const fileName = `${slug}.md`;
  const targetPath = path.join(process.cwd(), 'src/content/work', fileName);
  const content = `---
title: "${safeTitle}"
date: ${TODAY}
draft: true
description: ""
---

Write your case study here.
`;
  writeFileIfMissing(targetPath, content);
  return targetPath;
}

function scaffoldProject(slug, title) {
  const safeName = title ?? slug.replace(/-/g, ' ');
  const fileName = `${slug}.md`;
  const targetPath = path.join(process.cwd(), 'src/content/projects', fileName);
  const content = `---
name: "${safeName}"
tagline: "Add a one-line tagline"
status: active
featured: false
draft: true
---

Write your project details here.
`;
  writeFileIfMissing(targetPath, content);
  return targetPath;
}

const LIBRARY_KINDS = new Set(['book', 'podcast', 'bookmark', 'post', 'interest', 'tool']);

/** Library items live in src/content/library/<kind>-<slug>.md (the prefix keeps URLs unambiguous). */
function scaffoldLibrary(slug, title, { kind, url, by }) {
  const fileName = `${kind}-${slug}.md`;
  const targetPath = path.join(process.cwd(), 'src/content/library', fileName);
  const lines = ['---', `kind: ${kind}`, `title: ${yamlString(title ?? slug.replace(/-/g, ' '))}`];
  if (url) lines.push(`url: ${url}`);
  if (by) lines.push(`by: ${yamlString(by)}`);
  lines.push(`date: ${TODAY}`, 'note: ""');
  if (kind === 'book') lines.push('reading: reading');
  if (kind === 'post') lines.push('post:', '  text: ""', '  handle: "@"', `  postedAt: ${TODAY}`);
  lines.push('draft: true', '---', '');
  writeFileIfMissing(targetPath, lines.join('\n') + '\n');
  return targetPath;
}

function printUsage() {
  console.log(
    [
      'Usage: npm run new:content -- --type <post|work|project> --slug <my-slug> [--title "Readable Title"]',
      '  posts: [--kind essay|note|link] [--link https://…] [--mdx]',
      '  shortcuts: npm run new:essay|new:note|new:link -- --slug … [--title …] [--link …]',
      '  library: npm run new:save -- --kind book|podcast|bookmark|post|interest|tool --slug … [--title …] [--url …] [--by …]',
    ].join('\n'),
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const type = typeof args.type === 'string' ? args.type : '';
  const title = typeof args.title === 'string' ? args.title : undefined;
  const kind = typeof args.kind === 'string' ? args.kind : 'essay';
  const link = typeof args.link === 'string' ? args.link : undefined;
  const mdx = args.mdx === true;
  // Notes can skip --slug: they get a time-stamped one.
  const stamp = new Date().toTimeString().slice(0, 5).replace(':', '');
  const rawSlug =
    typeof args.slug === 'string'
      ? args.slug
      : type === 'post' && kind === 'note'
        ? (title ?? `note-${stamp}`)
        : '';

  if (type === 'library' && !LIBRARY_KINDS.has(kind)) {
    printUsage();
    throw new Error(`Invalid library --kind "${kind}"`);
  }
  if (type === 'post' && !POST_KINDS.has(kind)) {
    printUsage();
    throw new Error(`Invalid --kind "${kind}" (essay, note, or link)`);
  }
  if (type === 'post' && kind === 'link' && !link) {
    printUsage();
    throw new Error('Link posts need --link <url>');
  }

  if (!VALID_TYPES.has(type)) {
    printUsage();
    throw new Error('Invalid or missing --type');
  }

  if (!rawSlug) {
    printUsage();
    throw new Error('Missing --slug');
  }

  const slug = slugify(rawSlug);
  if (!slug) {
    throw new Error(`Slug "${rawSlug}" produced an empty value`);
  }

  ensureDir(path.join(process.cwd(), 'src/content/posts'));
  ensureDir(path.join(process.cwd(), 'src/content/work'));
  ensureDir(path.join(process.cwd(), 'src/content/projects'));
  ensureDir(path.join(process.cwd(), 'src/content/library'));

  let filePath = '';
  if (type === 'post') filePath = scaffoldPost(slug, title, { kind, link, mdx });
  if (type === 'work') filePath = scaffoldWork(slug, title);
  if (type === 'project') filePath = scaffoldProject(slug, title);
  if (type === 'library') {
    const url = typeof args.url === 'string' ? args.url : undefined;
    const by = typeof args.by === 'string' ? args.by : undefined;
    filePath = scaffoldLibrary(slug, title, { kind, url, by });
  }

  console.log(`Created draft: ${filePath}`);
  console.log('When ready to publish, set `draft: false` and deploy.');
}

main();
