'use strict';

const assert = require('assert');
const path = require('path');

// Setup mock hexo environment before loading image-performance.js
const registeredFilters = {};
global.hexo = {
  source_dir: path.resolve(__dirname, '../source'),
  extend: {
    filter: {
      register: (name, fn, priority) => {
        if (!registeredFilters[name]) registeredFilters[name] = [];
        registeredFilters[name].push({ fn, priority });
      }
    }
  }
};

require('../scripts/image-performance.js');

const filter = registeredFilters['after_post_render']?.[0]?.fn;
if (typeof filter !== 'function') {
  console.error('FAIL: after_post_render filter was not registered!');
  process.exit(1);
}

function runFilter(content) {
  const data = { content };
  filter(data);
  return data.content;
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('=== Running Unit Tests: scripts/image-performance.js ===\n');

// 1. Basic behavior without style
test('TC-U01: Basic img tag without style - injects loading=eager, decoding=async, dimensions', () => {
  const input = '<p><img src="/images/fdb.png" alt="金融稳定法"></p>';
  const output = runFilter(input);
  assert(output.includes('loading="eager"'), 'should have loading="eager"');
  assert(output.includes('decoding="async"'), 'should have decoding="async"');
  assert(output.includes('width="968"'), 'should have width="968"');
  assert(output.includes('height="596"'), 'should have height="596"');
  assert(!output.includes('style='), 'should not add style attribute if none was present');
});

// 2. Sequential images loading lazy
test('TC-U02: Multiple images - first is eager, subsequent are lazy', () => {
  const input = '<img src="/images/fdb.png"><img src="/images/fdb.png"><img src="/images/fdb.png">';
  const output = runFilter(input);
  const matches = [...output.matchAll(/loading="([^"]+)"/g)].map(m => m[1]);
  assert.deepStrictEqual(matches, ['eager', 'lazy', 'lazy'], 'first image should be eager, rest lazy');
});

// 3. Empty style attribute
test('TC-U03: Empty style attribute style="" - appends height: auto;', () => {
  const input = '<img src="/images/fdb.png" style="" alt="test">';
  const output = runFilter(input);
  assert(output.includes('style="height: auto;"'), `expected style="height: auto;", got: ${output}`);
});

// 4. Whitespace-only style attribute
test('TC-U04: Whitespace style attribute style="   " - appends height: auto;', () => {
  const input = '<img src="/images/fdb.png" style="   " alt="test">';
  const output = runFilter(input);
  assert(output.includes('style="height: auto;"'), `expected style="height: auto;", got: ${output}`);
});

// 5. Style with max-width without trailing semicolon
test('TC-U05: style="max-width: 100%" (no semicolon) - appends ; height: auto;', () => {
  const input = '<img src="/images/fdb.png" style="max-width: 100%" alt="test">';
  const output = runFilter(input);
  assert(output.includes('style="max-width: 100%; height: auto;"'), `got: ${output}`);
});

// 6. Style with max-width with trailing semicolon
test('TC-U06: style="max-width: 100%;" (with semicolon) - appends height: auto;', () => {
  const input = '<img src="/images/fdb.png" style="max-width: 100%;" alt="test">';
  const output = runFilter(input);
  assert(output.includes('style="max-width: 100%;height: auto;"'), `got: ${output}`);
});

// 7. Style with existing explicit height
test('TC-U07: style="max-width: 100%; height: 300px;" - leaves existing height untouched', () => {
  const input = '<img src="/images/fdb.png" style="max-width: 100%; height: 300px;" alt="test">';
  const output = runFilter(input);
  assert(output.includes('style="max-width: 100%; height: 300px;"'), `should remain unchanged, got: ${output}`);
  assert(!output.includes('height: auto'), 'should not append height: auto if height is specified');
});

// 8. Style with existing height: auto
test('TC-U08: style="max-width: 100%; height: auto;" - leaves height: auto untouched without duplication', () => {
  const input = '<img src="/images/fdb.png" style="max-width: 100%; height: auto;" alt="test">';
  const output = runFilter(input);
  assert.strictEqual(
    (output.match(/height:\s*auto/g) || []).length,
    1,
    'height: auto should appear exactly once'
  );
});

// 9. Style with max-height - appends height: auto (max-height is not height)
test('TC-U09: style="max-height: 400px;" - appends height: auto;', () => {
  const input = '<img src="/images/fdb.png" style="max-height: 400px;" alt="test">';
  const output = runFilter(input);
  assert(output.includes('height: auto;'), `should append height: auto;, got: ${output}`);
  assert(output.includes('max-height: 400px;'), `should preserve max-height: 400px;, got: ${output}`);
});

// 10. Style with min-height - appends height: auto
test('TC-U10: style="min-height: 200px;" - appends height: auto;', () => {
  const input = '<img src="/images/fdb.png" style="min-height: 200px;" alt="test">';
  const output = runFilter(input);
  assert(output.includes('height: auto;'), `should append height: auto;, got: ${output}`);
});

// 11. Style with line-height - appends height: auto (line-height is not height)
test('TC-U11: style="line-height: 1.5;" - appends height: auto;', () => {
  const input = '<img src="/images/fdb.png" style="line-height: 1.5;" alt="test">';
  const output = runFilter(input);
  assert(output.includes('height: auto;'), `should append height: auto;, got: ${output}`);
});

// 12. Single quotes around style attribute
test('TC-U12: Single-quoted style attribute style=\'max-width: 100%\'', () => {
  const input = "<img src='/images/fdb.png' style='max-width: 100%' alt='test'>";
  const output = runFilter(input);
  assert(output.includes('height: auto;'), `should normalize and add height: auto;, got: ${output}`);
});

// 13. Pre-existing loading and decoding attributes are respected
test('TC-U13: Existing loading and decoding attributes are preserved', () => {
  const input = '<img src="/images/fdb.png" loading="lazy" decoding="sync">';
  const output = runFilter(input);
  assert(output.includes('loading="lazy"'), 'should retain existing loading="lazy"');
  assert(output.includes('decoding="sync"'), 'should retain existing decoding="sync"');
});

// 14. Pre-existing width and height are preserved
test('TC-U14: Existing width and height attributes are not overwritten', () => {
  const input = '<img src="/images/fdb.png" width="500" height="300">';
  const output = runFilter(input);
  assert(output.includes('width="500"'), 'should retain width="500"');
  assert(output.includes('height="300"'), 'should retain height="300"');
  assert(!output.includes('width="968"'), 'should not overwrite with 968');
});

// 15. URL-encoded Chinese characters in src
test('TC-U15: URL-encoded image filename correctly resolves dimensions (1179x2409)', () => {
  const input = '<img src="/images/%E5%87%80%E5%80%BC%E5%8F%98%E5%8C%96%E5%9B%BE.jpeg" style="max-width:100%;" alt="净值变化图">';
  const output = runFilter(input);
  assert(output.includes('width="1179"'), `should have width="1179", got: ${output}`);
  assert(output.includes('height="2409"'), `should have height="2409", got: ${output}`);
  assert(output.includes('height: auto;'), `should have height: auto; in style, got: ${output}`);
});

// 16. WebP format dimensions (1000x1792)
test('TC-U16: WebP image format correctly parses dimensions (1000x1792)', () => {
  const input = '<img src="/images/%E7%90%86%E8%B4%A2%E4%BA%A7%E5%93%81%E6%8A%95%E5%85%A5%E8%B5%8E%E5%9B%9E%E5%85%A8%E6%B5%81%E7%A8%8B.webp">';
  const output = runFilter(input);
  assert(output.includes('width="1000"'), `should have width="1000", got: ${output}`);
  assert(output.includes('height="1792"'), `should have height="1792", got: ${output}`);
});

// 17. Graceful handling of non-existent image
test('TC-U17: Non-existent image src does not throw and preserves tag', () => {
  const input = '<img src="/images/non-existent-image-file-12345.png" alt="broken">';
  const output = runFilter(input);
  assert(output.includes('loading="eager"'), 'should still inject loading');
  assert(!output.includes('width='), 'should not inject width for missing image');
});

// 18. External URL image
test('TC-U18: External image URL (https://...) ignores local dimension lookup', () => {
  const input = '<img src="https://example.com/photo.jpg" alt="external">';
  const output = runFilter(input);
  assert(output.includes('loading="eager"'), 'should still inject loading');
  assert(!output.includes('width='), 'should not inject width for external URL');
});

console.log(`\nUnit Tests Summary: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
}
