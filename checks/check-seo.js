'use strict';

// SEO regression checks over the generated site in public/. Guards the
// 2026-09 SEO pass:
//   1. sitemap: hubs included, all locs resolve to files, no noindex URLs,
//      every post advertised
//   2. hreflang: complete static alternate sets on every translation group,
//      identical (bidirectional) across versions, no client-side injection
//   3. og:url equals canonical, og:image present, meta description present
//   4. single-post tag archives are noindex and stay out of the sitemap
//   5. prev/next navigation stays within the same language and chronology
//   6. short English weekly titles, branded hub titles
//   7. one Atom feed only, feed URLs resolve
//   8. every internal link resolves to a generated file
// Run `npm run build` first: checks read public/, not source/.

const fs = require('fs');
const path = require('path');

const PUBLIC = 'public';
const SITE = 'https://terazadl.github.io';
const HREFLANG_OF = { EN: 'en', ZH: 'zh-CN', JA: 'ja' };
const HTML_LANG_OF = { EN: 'en', ZH: 'zh-CN', JA: 'ja' };

const failures = [];
const stats = {};

function fail(message) {
  if (failures.length < 40) failures.push(message);
}

function readPublic(...segments) {
  return fs.readFileSync(path.join(PUBLIC, ...segments), 'utf8');
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// Normalize any URL or path to a comparable key: strip site base, queries,
// anchors, index.html and trailing slashes, then percent-decode.
function urlKey(url) {
  let target = String(url || '').replace(SITE, '');
  target = target.split('#')[0].split('?')[0];
  try {
    target = decodeURIComponent(target);
  } catch (_) { /* keep raw on malformed encoding */ }
  return target.replace(/\/index\.html$/, '').replace(/^\/+|\/+$/g, '');
}

function urlToFile(url) {
  const key = urlKey(url);
  if (key === '') return path.join(PUBLIC, 'index.html');
  if (/\.(html|xml|css|js|png|jpe?g|webp|ico|svg|txt|webmanifest)$/i.test(key)) {
    return path.join(PUBLIC, key);
  }
  return path.join(PUBLIC, key, 'index.html');
}

function fileExists(url) {
  stats.fileChecks = (stats.fileChecks || 0) + 1;
  return fs.existsSync(urlToFile(url));
}

// ---------------------------------------------------------------------------
// Load the content index (single source of truth for posts and translation
// groups) and the full list of generated HTML files.
// ---------------------------------------------------------------------------

const indexSource = readPublic('js', 'content-index.js');
const payloadMatch = indexSource.match(/= (.*);\s*$/s);
if (!payloadMatch) throw new Error('SEO check: content index payload not found. Run `npm run build` first.');
const contentIndex = JSON.parse(payloadMatch[1]);
const entries = contentIndex.entries;
const multiLangGroups = contentIndex.groups.filter(group => group.languages.length >= 2);

const htmlFiles = walk(PUBLIC).filter(file => file.endsWith('.html'));
const htmlFor = new Map();
for (const file of htmlFiles) {
  htmlFor.set(urlKey(path.relative(PUBLIC, file)), fs.readFileSync(file, 'utf8'));
}
const entryByPath = new Map(entries.map(entry => [urlKey(entry.path), entry]));

console.log(`SEO check: ${entries.length} posts, ${multiLangGroups.length} translation groups, ${htmlFiles.length} HTML files.`);

// ---------------------------------------------------------------------------
// 1. Sitemap
// ---------------------------------------------------------------------------

const sitemap = readPublic('sitemap.xml');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const locKeys = new Set(locs.map(urlKey));
stats.sitemapUrls = locs.length;

if (locs.length < 60) fail(`sitemap has only ${locs.length} URLs (expected at least 60)`);
for (const hub of ['/essays/', '/writing/', '/categories/', '/tags/', '/about/', '/japan-weekly/', '/china-weekly/', '/']) {
  if (!locKeys.has(urlKey(hub))) fail(`sitemap is missing hub: ${hub}`);
}
for (const loc of locs) {
  if (!fileExists(loc)) fail(`sitemap loc does not resolve to a file: ${loc}`);
  const html = fs.readFileSync(urlToFile(loc), 'utf8');
  if (/name="robots" content="noindex/.test(html)) fail(`sitemap contains noindex page: ${loc}`);
}
if ((sitemap.match(/<lastmod>/g) || []).length !== locs.length) fail('sitemap lastmod count does not match URL count');
for (const entry of entries) {
  if (!locKeys.has(urlKey(entry.path))) fail(`sitemap is missing post: ${entry.path}`);
}
if (fs.existsSync(path.join(PUBLIC, 'feed.xml'))) fail('feed.xml is still generated (should be atom.xml only)');
if (!fs.existsSync(path.join(PUBLIC, 'atom.xml'))) fail('atom.xml is missing');

// ---------------------------------------------------------------------------
// 2. hreflang alternates
// ---------------------------------------------------------------------------

stats.hreflangGroups = multiLangGroups.length;
for (const group of multiLangGroups) {
  const serializedSets = new Set();
  for (const language of group.languages) {
    const key = urlKey(language.path);
    const html = htmlFor.get(key);
    if (!html) {
      fail(`group ${group.key}: missing page for ${language.path}`);
      continue;
    }
    const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)]
      .map(match => [match[1], match[2]]);
    const map = new Map(alternates);

    if (alternates.length !== group.languages.length + 1) {
      fail(`${language.path}: expected ${group.languages.length + 1} alternate links, found ${alternates.length}`);
    }
    for (const other of group.languages) {
      const expected = HREFLANG_OF[other.code];
      const href = map.get(expected);
      if (!href) fail(`${language.path}: hreflang ${expected} missing`);
      else if (urlKey(href) !== urlKey(other.path)) {
        fail(`${language.path}: hreflang ${expected} points to ${href}, expected ${other.path}`);
      }
    }
    if (!map.has('x-default')) fail(`${language.path}: x-default missing`);
    serializedSets.add(alternates.map(([code, href]) => `${code}=${urlKey(href)}`).sort().join('|'));
  }
  if (serializedSets.size !== 1) fail(`group ${group.key}: hreflang sets differ between language versions`);
}

// The old client-side injection must be gone from every page.
for (const [key, html] of htmlFor) {
  if (html.includes('alternate.hreflang')) fail(`${key}: client-side hreflang injection still present`);
}

// ---------------------------------------------------------------------------
// 3. Page-level meta: og:url == canonical, og:image, description, html lang
// ---------------------------------------------------------------------------

for (const [key, html] of htmlFor) {
  if (key === '404' || key === '404.html') continue; // handcrafted minimal page, correctly noindexed
  const isRedirectStub = /http-equiv="refresh"/.test(html);
  if (isRedirectStub) {
    const stubCanonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    if (stubCanonical && !fileExists(stubCanonical[1])) {
      fail(`redirect stub ${key} points to a missing target: ${stubCanonical[1]}`);
    }
    continue;
  }
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/);
  if (!canonical) {
    fail(`${key}: canonical missing`);
  } else if (!ogUrl) {
    fail(`${key}: og:url missing`);
  } else if (urlKey(ogUrl[1]) !== urlKey(canonical[1])) {
    fail(`${key}: og:url (${ogUrl[1]}) does not match canonical (${canonical[1]})`);
  }
  if (!/<meta property="og:image" content="/.test(html)) fail(`${key}: og:image missing`);
  if (!/<meta name="description" content="[^"]{10,}/.test(html)) fail(`${key}: meta description missing or too short`);
}

for (const entry of entries) {
  const html = htmlFor.get(urlKey(entry.path));
  if (!html) continue;
  const htmlLang = html.match(/<html lang="([^"]+)"/);
  const expected = HTML_LANG_OF[entry.langCode];
  if (!htmlLang) fail(`${entry.path}: html lang attribute missing`);
  else if (htmlLang[1] !== expected) fail(`${entry.path}: html lang is ${htmlLang[1]}, expected ${expected}`);
  if (!html.includes('"@type": "BlogPosting"')) fail(`${entry.path}: BlogPosting JSON-LD missing`);
}

// ---------------------------------------------------------------------------
// 4. Thin tag archives: noindex and excluded from the sitemap
// ---------------------------------------------------------------------------

const tagPages = [...htmlFor].filter(([key]) => /^tags\/[^/]+$/.test(key));
let noindexTags = 0;
for (const [key, html] of tagPages) {
  const noindex = /name="robots" content="noindex/.test(html);
  const inSitemap = locKeys.has(key);
  if (noindex) noindexTags += 1;
  if (noindex && inSitemap) fail(`thin tag page is both noindex and in the sitemap: ${key}`);
  if (!noindex && !inSitemap) fail(`indexable tag page missing from sitemap: ${key}`);
}
stats.tagPages = tagPages.length;
stats.noindexTags = noindexTags;
if (noindexTags === 0) fail('no single-post tag archives were noindexed (expected around 25)');
if (noindexTags === tagPages.length) fail('every tag page was noindexed (multi-post tags must stay indexable)');

// ---------------------------------------------------------------------------
// 5. prev/next navigation: same language, correct chronology, targets exist
// ---------------------------------------------------------------------------

for (const entry of entries) {
  const html = htmlFor.get(urlKey(entry.path));
  if (!html) continue;
  for (const direction of ['prev', 'next']) {
    const link = html.match(new RegExp(`href="([^"]*)" rel="${direction}"`));
    if (!link) continue;
    if (!fileExists(link[1])) {
      fail(`${entry.path}: ${direction} target missing: ${link[1]}`);
      continue;
    }
    const target = entryByPath.get(urlKey(link[1]));
    if (!target) {
      fail(`${entry.path}: ${direction} target is not a post: ${link[1]}`);
      continue;
    }
    if (target.langCode !== entry.langCode) {
      fail(`${entry.path}: ${direction} links to a ${target.langCode} article: ${link[1]}`);
    }
    if (direction === 'prev' && String(target.date) > String(entry.date)) {
      fail(`${entry.path}: prev article is newer (${target.date} > ${entry.date})`);
    }
    if (direction === 'next' && String(target.date) < String(entry.date)) {
      fail(`${entry.path}: next article is older (${target.date} < ${entry.date})`);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Titles
// ---------------------------------------------------------------------------

for (const entry of entries) {
  if (entry.langCode === 'EN' && entry.title.length > 75) {
    fail(`English title longer than 75 characters (${entry.title.length}): ${entry.title}`);
  }
}
const essaysTitle = htmlFor.get('essays');
const writingTitle = htmlFor.get('writing');
if (!essaysTitle || !essaysTitle.includes('<title>Essays | Lei Deng')) fail('essays hub title is not branded');
if (!writingTitle || !writingTitle.includes('<title>Writing | Lei Deng')) fail('writing hub title is not branded');

// ---------------------------------------------------------------------------
// 7. Feed
// ---------------------------------------------------------------------------

const atom = readPublic('atom.xml');
const atomEntries = (atom.match(/<entry>/g) || []).length;
stats.atomEntries = atomEntries;
if (atomEntries < 20) fail(`atom.xml has only ${atomEntries} entries`);
for (const match of atom.matchAll(/<id>([^<]+)<\/id>/g)) {
  if (!fileExists(match[1])) fail(`atom entry id does not resolve: ${match[1]}`);
}
if (!atom.includes('Japan Weekly: Rate-Hike Signals Meet Fiscal Costs')) {
  fail('atom.xml does not contain the new short English weekly titles');
}

// ---------------------------------------------------------------------------
// 8. robots.txt + site-wide internal link integrity
// ---------------------------------------------------------------------------

const robots = readPublic('robots.txt');
if (!/Sitemap: https:\/\/terazadl\.github\.io\/sitemap\.xml/.test(robots)) fail('robots.txt does not declare the sitemap');

const seenHrefs = new Set();
for (const [key, html] of htmlFor) {
  if (/http-equiv="refresh"/.test(html)) continue;
  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1];
    if (seenHrefs.has(href)) continue;
    seenHrefs.add(href);
    if (!fileExists(href)) fail(`${key}: broken internal link ${href}`);
  }
}
stats.internalLinks = seenHrefs.size;

// ---------------------------------------------------------------------------

if (failures.length) {
  console.error(`SEO check FAILED: ${failures.length} problem(s)`);
  for (const message of failures) console.error(`  - ${message}`);
  process.exit(1);
}

console.log('SEO check passed:', JSON.stringify(stats));
