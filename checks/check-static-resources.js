'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== Running Static Resource Integrity Check ===\n');

const postsDir = path.resolve(__dirname, '../source/_posts');
const imagesDir = path.resolve(__dirname, '../source/images');

if (!fs.existsSync(postsDir)) {
  console.error(`Error: posts directory not found: ${postsDir}`);
  process.exit(1);
}

const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
console.log(`Discovered ${postFiles.length} post files in source/_posts/\n`);

let totalImageRefs = 0;
let brokenRefs = [];
let scannedImages = [];

postFiles.forEach(file => {
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Scan markdown image syntax: ![alt](url)
  const mdMatches = [...content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
  mdMatches.forEach(match => {
    totalImageRefs++;
    scannedImages.push({
      post: file,
      type: 'markdown',
      alt: match[1],
      rawSrc: match[2]
    });
  });

  // 2. Scan HTML img tag syntax: <img ... src="..." ...>
  const htmlMatches = [...content.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)];
  htmlMatches.forEach(match => {
    totalImageRefs++;
    scannedImages.push({
      post: file,
      type: 'html',
      rawSrc: match[1]
    });
  });
});

console.log(`Found ${totalImageRefs} total image references across posts.\n`);

let passed = 0;
let failed = 0;

scannedImages.forEach(img => {
  const rawSrc = img.rawSrc.trim();
  // If it is an external URL
  if (/^https?:\/\//i.test(rawSrc)) {
    console.log(`  ℹ SKIP (External): ${img.post} -> ${rawSrc}`);
    return;
  }

  // Handle local path resolution
  let resolvedFilePath;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawSrc);
  } catch (e) {
    decodedPath = rawSrc;
  }

  if (decodedPath.startsWith('/images/')) {
    const subPath = decodedPath.slice('/images/'.length);
    resolvedFilePath = path.join(imagesDir, subPath);
  } else if (decodedPath.startsWith('images/')) {
    const subPath = decodedPath.slice('images/'.length);
    resolvedFilePath = path.join(imagesDir, subPath);
  } else {
    // Relative to post or root
    resolvedFilePath = path.resolve(postsDir, decodedPath);
  }

  const exists = fs.existsSync(resolvedFilePath);
  if (!exists) {
    failed++;
    brokenRefs.push({
      post: img.post,
      rawSrc: img.rawSrc,
      expectedPath: resolvedFilePath
    });
    console.error(`  ✗ BROKEN: [${img.post}] -> ${img.rawSrc} (File missing at ${resolvedFilePath})`);
  } else {
    const stat = fs.statSync(resolvedFilePath);
    if (stat.size === 0) {
      failed++;
      brokenRefs.push({
        post: img.post,
        rawSrc: img.rawSrc,
        expectedPath: resolvedFilePath,
        reason: 'Empty file (0 bytes)'
      });
      console.error(`  ✗ CORRUPTED (0 bytes): [${img.post}] -> ${img.rawSrc}`);
    } else {
      passed++;
      console.log(`  ✓ OK (${(stat.size / 1024).toFixed(1)} KB): [${img.post}] -> ${img.rawSrc}`);
    }
  }
});

console.log(`\nIntegrity Scan Results: ${passed} Valid, ${failed} Broken (Total scanned: ${totalImageRefs})`);

if (failed > 0) {
  console.error('\nFAIL: Broken images detected!');
  process.exit(1);
} else {
  console.log('\nPASS: All static image references resolve to existing, valid files on disk (0 broken images).');
}
