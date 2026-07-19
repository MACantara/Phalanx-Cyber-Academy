import fs from 'fs';
import path from 'path';

const legacyRoot = path.resolve('app', 'static', 'js', 'simulated-pc', 'levels');
const outRoot = path.resolve('backend', 'app', 'data', 'level_content');

const levelDirs = {
  1: 'level-one',
  2: 'level-two',
  3: 'level-three',
  4: 'level-four',
  5: 'level-five',
};

const dataFiles = {
  1: [['news_articles.json', 'articles']],
  2: [
    ['legitimate_emails.json', 'emails'],
    ['phishing_emails.json', 'emails'],
  ],
  3: [
    ['malware-data.json', 'malware'],
    ['process-data.json', 'processes'],
  ],
  4: [
    ['ctf-file-system.json', 'fileSystem'],
    ['ctf-flags.json', 'flags'],
  ],
  5: [['null-members-dataset.json', 'members']],
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function extractBalanced(source, open, close) {
  const start = source.indexOf(open);
  if (start === -1) return null;
  let depth = 1;
  let i = start + open.length;
  while (i < source.length && depth > 0) {
    if (source.slice(i, i + close.length) === close) {
      depth--;
      if (depth === 0) return source.slice(start + open.length, i);
      i += close.length;
    } else if (source.slice(i, i + open.length) === open) {
      depth++;
      i += open.length;
    } else {
      i++;
    }
  }
  return null;
}

function jsObjectToJson(source) {
  // Strip trailing commas and wrap the object body in parentheses
  // so it is parsed as an object expression rather than a block.
  const cleaned = source.replace(/,\s*([\}\]])/g, '$1');
  return new Function('return ({' + cleaned + '});')();
}

function parseConfig(source) {
  const match = source.match(/export const Level\d+Config\s*=\s*\{/);
  if (!match) throw new Error('Could not find exported LevelConfig object');
  const open = match[0];
  const body = extractBalanced(source, open, '};');
  if (!body) throw new Error('Could not parse LevelConfig object');
  return jsObjectToJson(body);
}

function parseMessages(source) {
  const body = extractBalanced(source, 'this.messages = [', '];');
  if (!body) return [];
  // Source messages use unquoted keys and may contain template literal
  // interpolations, so evaluate as a JS array literal after removing them.
  const cleaned = body
    .replace(/\$\{[^}]*\}/g, '[value]')
    .replace(/,\s*([\}\]])/g, '$1');
  return new Function('return [' + cleaned + '];')();
}

function loadDataFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return [];
  }
}

function collectDialogues(dialogueDir) {
  if (!fs.existsSync(dialogueDir)) return {};
  const dialogues = {};
  for (const file of fs.readdirSync(dialogueDir)) {
    if (!file.endsWith('.js') || file === 'index.js') continue;
    const base = file.replace(/\.js$/, '');
    const key = base.includes('completion') ? 'completion' : 'briefing';
    const source = fs.readFileSync(path.join(dialogueDir, file), 'utf8');
    const messages = parseMessages(source);
    dialogues[key] = { character: 'instructor', messages };
  }
  return dialogues;
}

for (const [levelId, dir] of Object.entries(levelDirs)) {
  const srcDir = path.join(legacyRoot, dir);
  const outDir = path.join(outRoot, `level_${levelId}`);
  ensureDir(outDir);

  // Config
  const configSource = fs.readFileSync(path.join(srcDir, 'level-config.js'), 'utf8');
  const config = parseConfig(configSource);
  fs.writeFileSync(path.join(outDir, 'config.json'), JSON.stringify(config, null, 2));

  // Dialogues
  const dialogueDir = path.join(srcDir, 'dialogues');
  const dialogues = collectDialogues(dialogueDir);
  fs.writeFileSync(path.join(outDir, 'dialogues.json'), JSON.stringify(dialogues, null, 2));

  // Data
  const merged = {};
  const dataFileMapping = dataFiles[levelId] || [];
  for (const [filename, key] of dataFileMapping) {
    const filePath = path.join(srcDir, 'data', filename);
    if (!fs.existsSync(filePath)) continue;
    const raw = loadDataFile(filePath);
    // news_articles.json nests under "articles"; others may be arrays or objects
    const arr = Array.isArray(raw) ? raw : raw[key] || raw;
    if (!Array.isArray(arr)) {
      merged[key] = raw;
    } else {
      merged[key] = (merged[key] || []).concat(arr);
    }
  }
  fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(merged, null, 2));

  console.log(`Migrated level ${levelId}: ${Object.keys(dialogues).length} dialogue(s), data keys: ${Object.keys(merged).join(', ')}`);
}

console.log('Migration complete.');
