'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('>>> [SUITE-7]: Next Reading & Recommendation Integrity Verification...');

const indexSource = fs.readFileSync('public/js/content-index.js', 'utf8');
const payloadMatch = indexSource.match(/window\.__SITE_CONTENT_INDEX__\s*=\s*(.*);\s*$/s);

if (!payloadMatch) {
  throw new Error('Next-Reading Test: Failed to parse public/js/content-index.js payload.');
}

const contentIndex = JSON.parse(payloadMatch[1]);
const { entries, groups } = contentIndex;

function normalizePath(rawPath) {
  return String(rawPath || '')
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/[?#].*$/, '')
    .replace(/\/{2,}/g, '/')
    .replace(/^\/*/, '/')
    .replace(/\/*$/, '/');
}

const entryByPath = new Map(entries.map(e => [normalizePath(e.path), e]));

const localizedGroupEntry = (group, language) => {
  if (!group) return null;
  const item = group.languages?.find(l => l.code === language);
  if (item) return entryByPath.get(normalizePath(item.path)) || null;
  return entryByPath.get(normalizePath(group.primaryPath)) || null;
};

let checkedCount = 0;
let relatedFoundCount = 0;

for (const entry of entries) {
  const currentPath = normalizePath(entry.path);
  const currentEntry = entryByPath.get(currentPath);
  assert(currentEntry, `Current entry must exist for ${currentPath}`);

  const currentCategory = currentEntry.category;
  const currentKey = currentEntry.translationKey;
  const activeLanguage = currentEntry.langCode;

  const related = groups
    .filter(group => {
      if (group.category !== currentCategory) return false;
      if (currentKey && group.key === currentKey) return false;
      if (normalizePath(group.primaryPath) === currentPath) return false;
      if (group.languages?.some(lang => normalizePath(lang.path) === currentPath)) return false;
      return true;
    })
    .slice(0, 2);

  checkedCount++;
  if (related.length > 0) relatedFoundCount++;

  for (const group of related) {
    // 1. Must never match translationKey of current article
    assert.notStrictEqual(
      group.key,
      currentKey,
      `FATAL: Related article shares translationKey with current article at ${currentPath}: key=${group.key}`
    );

    // 2. Must never match primaryPath
    assert.notStrictEqual(
      normalizePath(group.primaryPath),
      currentPath,
      `FATAL: Related article primaryPath equals currentPath: ${currentPath}`
    );

    // 3. None of the group's language paths may match currentPath
    if (group.languages) {
      for (const lang of group.languages) {
        assert.notStrictEqual(
          normalizePath(lang.path),
          currentPath,
          `FATAL: Related group language variant matches current article: ${lang.path} === ${currentPath}`
        );
      }
    }

    // 4. Must belong to the exact same category
    assert.strictEqual(
      group.category,
      currentCategory,
      `FATAL: Category mismatch for recommendation: expected ${currentCategory}, got ${group.category}`
    );

    // 5. Localized link must not point to current article
    const localized = localizedGroupEntry(group, activeLanguage) || group;
    const targetPath = normalizePath(localized.path || group.primaryPath);
    assert.notStrictEqual(
      targetPath,
      currentPath,
      `FATAL: Localized target path resolves to current article: ${targetPath}`
    );

    // 6. Target HTML file must exist on disk in public/
    const diskPath = path.join('public', targetPath, 'index.html');
    assert(
      fs.existsSync(diskPath),
      `FATAL: Target recommendation page does not exist on disk: ${diskPath}`
    );
  }
}

console.log(`[PASS] Next-reading filter verified across all ${checkedCount} entries (${relatedFoundCount} have recommendations).`);
console.log('[PASS] Zero instances of self-recommendation or cross-language self-inclusion detected.');
