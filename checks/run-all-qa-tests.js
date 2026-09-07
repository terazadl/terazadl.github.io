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
