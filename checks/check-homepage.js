'use strict';

const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const indexSource = fs.readFileSync('public/js/content-index.js', 'utf8');
const payload = indexSource.match(/= (.*);\s*$/s);

if (!payload) throw new Error('Homepage check: content index payload not found.');

const contentIndex = JSON.parse(payload[1]);
const groups = contentIndex.groups.filter(group => group.category !== 'Notes').slice(0, 3);
const entries = new Map(contentIndex.entries.map(entry => [entry.path, entry]));
const indexScript = html.indexOf('<script src="/js/content-index.js');
const staticHtml = indexScript >= 0 ? html.slice(0, indexScript) : html;

if (groups.length < 3) {
  throw new Error('Homepage check: fewer than three research groups found.');
}

groups.forEach(group => {
  const preferred = group.languages.find(language => language.code === 'ZH')
    || group.languages.find(language => language.code === 'EN')
    || group.languages[0];
  const entry = entries.get(preferred.path);
  const title = entry?.cardTitle || entry?.title || group.title;

  if (!staticHtml.includes(group.date) || !staticHtml.includes(title)) {
    throw new Error(`Homepage check: static fallback is missing ${group.date} ${title}`);
  }
});

console.log(`Homepage check passed: ${groups.map(group => group.date).join(', ')}`);
