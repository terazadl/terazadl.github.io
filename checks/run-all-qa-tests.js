'use strict';

const { execSync } = require('child_process');
const path = require('path');

console.log('===============================================================');
console.log('   QA & TEST AUTOMATION SUITE: feature/mobile-image-viz-fix   ');
console.log('===============================================================\n');

const testSuites = [
  {
    id: 'SUITE-1',
    name: 'Homepage & Core Content Structure Regression Check',
    file: 'checks/check-homepage.js',
    desc: 'Verifies static fallback rendering and content index consistency'
  },
  {
    id: 'SUITE-2',
    name: 'Image Performance Filter Unit Tests (scripts/image-performance.js)',
    file: 'checks/test-unit-image-performance.js',
    desc: 'Verifies img tag mutations, dimension injection, and style normalization'
  },
  {
    id: 'SUITE-3',
    name: 'Static Resource Reference Integrity Check',
    file: 'checks/check-static-resources.js',
    desc: 'Scans all post markdown files to verify referenced image files exist without 404s'
  },
  {
    id: 'SUITE-4',
    name: 'Mobile Responsiveness & Anti-Distortion Verification',
    file: 'checks/test-mobile-anti-distortion.js',
    desc: 'Verifies W3C replaced element sizing, CSS rules, and 0% aspect ratio distortion on mobile'
  },
  {
    id: 'SUITE-5',
    name: 'Native Full-Res Zoom Script DOM Tree Verification',
    file: 'checks/test-body-end-zoom.js',
    desc: 'Verifies body-end.njk lightbox link wrapping behavior across various DOM structures'
  },
  {
    id: 'SUITE-6',
    name: 'Weekly Event Grammar & Watchlist Follow-up Filter Unit Tests',
    file: 'checks/test-weekly-event-grammar.js',
    desc: 'Verifies status capsules, trilingual four-field panels, follow-up four-state mapping, gating, and idempotency'
  },
  {
    id: 'SUITE-7',
    name: 'SEO Regression Check (sitemap, hreflang, meta, navigation, links)',
    file: 'checks/check-seo.js',
    desc: 'Verifies sitemap hygiene, static hreflang alternates, og:url/canonical consistency, noindex on thin tags, same-language prev/next, and link integrity over public/'
  },
  {
    id: 'SUITE-10',
    name: 'Next Reading & Recommendation Integrity Verification',
    file: 'checks/test-next-reading-integrity.js',
    desc: 'Verifies zero self-recommendations, cross-language group exclusions, and 100% valid recommendation links across all posts'
  },
  {
    id: 'SUITE-8',
    name: 'Homepage Weekly Layout Lock (PRD 2026-09-10 US-1/US-2)',
    file: 'checks/test-homepage-weekly-layout.js',
    desc: 'Verifies single featured card at all viewports, scoped Japan-card hide, and always-on 同步推送 row'
  },
  {
    id: 'SUITE-9',
    name: 'Homepage Content Rules Lock (PRD 2026-09-10 US-3/US-4)',
    file: 'checks/test-homepage-content-rules.js',
    desc: 'Verifies latest-writing weekly exclusion (static + generator + front-end) and 4-layer no-bullet weekly cards'
  }
];

let totalSuites = testSuites.length;
let passedSuites = 0;
let failedSuites = 0;
const results = [];

const startTime = Date.now();

for (const suite of testSuites) {
  console.log(`>>> Executing [${suite.id}]: ${suite.name}...`);
  const suiteStart = Date.now();
  try {
    const output = execSync(`node ${suite.file}`, {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const duration = ((Date.now() - suiteStart) / 1000).toFixed(2);
    passedSuites++;
    results.push({
      ...suite,
      status: 'PASS',
      duration: `${duration}s`,
      output: output.trim()
    });
    console.log(`[PASS] ${suite.id} (${duration}s)\n`);
  } catch (err) {
    const duration = ((Date.now() - suiteStart) / 1000).toFixed(2);
    failedSuites++;
    results.push({
      ...suite,
      status: 'FAIL',
      duration: `${duration}s`,
      error: (err.stderr || err.stdout || err.message).trim()
    });
    console.error(`[FAIL] ${suite.id} (${duration}s)`);
    console.error(err.stderr || err.stdout || err.message);
    console.log('\n');
  }
}

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('===============================================================');
console.log('                     TEST EXECUTION SUMMARY                    ');
console.log('===============================================================');
console.log(`Total Suites:     ${totalSuites}`);
console.log(`Passed Suites:    ${passedSuites}`);
console.log(`Failed Suites:    ${failedSuites}`);
console.log(`Overall Status:   ${failedSuites === 0 ? 'ALL TESTS PASSED (100%)' : 'SOME TESTS FAILED'}`);
console.log(`Execution Time:   ${totalDuration}s\n`);

results.forEach(r => {
  console.log(`  [${r.status}] ${r.id.padEnd(8)} ${r.name.padEnd(50)} (${r.duration})`);
});
console.log('===============================================================\n');

if (failedSuites > 0) {
  process.exit(1);
}
