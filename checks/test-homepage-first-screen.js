'use strict';

/**
 * SUITE-8 · Homepage first-screen layout lock (SITES-40)
 *
 * Replaces the weekly-layout lock (retired with the weekly takedown).
 * Asserts the new first screen holds at every viewport:
 *  - the featured essay card stays a single-column grid (no desktop two-up)
 *  - the featured card uses the neutral is-essay accent (weekly is-china /
 *    is-japan accents must not drive the first screen anymore)
 *  - .weekly-brief-link-row (生活手记入口) renders at all viewports
 *
 * Reads source/_data/styles.styl (source of truth) and, when present,
 * public/css/main.css (compiled output). Run after `hexo generate`.
 */

const fs = require('fs');

const styl = fs.readFileSync('source/_data/styles.styl', 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(`First-screen layout check failed: ${message}`);
}

// Strip @media blocks so we only inspect rules that apply at every viewport.
function stripMediaQueries(css) {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const m = css.slice(i).match(/@media[^{]*\{/);
    if (!m) {
      out += css.slice(i);
      break;
    }
    const start = i + m.index;
    out += css.slice(i, start);
    let depth = 1;
    let j = start + m[0].length;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth += 1;
      if (css[j] === '}') depth -= 1;
      j += 1;
    }
    i = j;
  }
  return out;
}

const globalStyl = stripMediaQueries(styl);

assert(
  /\.weekly-dual-briefs\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(globalStyl),
  '.weekly-dual-briefs must be a single-column grid at all viewports'
);
assert(
  !/\.weekly-dual-briefs\s*\{[^}]*repeat\(2/.test(styl),
  '.weekly-dual-briefs must not use a two-column repeat() grid anywhere'
);
assert(
  /\.weekly-brief-card\.is-essay\s*\{[^}]*border-top:\s*4px solid var\(--research-blue\)/.test(globalStyl),
  'featured essay card must carry the neutral is-essay accent at all viewports'
);
assert(
  /\.weekly-brief-link-row\s*\{[^}]*display:\s*block/.test(globalStyl),
  '.weekly-brief-link-row must display:block at all viewports'
);

if (fs.existsSync('public/css/main.css')) {
  const compiled = fs.readFileSync('public/css/main.css', 'utf8');
  const globalCss = stripMediaQueries(compiled);
  assert(
    /\.weekly-brief-card\.is-essay\s*\{[^}]*border-top:\s*4px solid var\(--research-blue\)/.test(globalCss),
    'compiled CSS is missing the is-essay accent (try hexo clean)'
  );
  assert(
    /\.weekly-brief-link-row\s*\{[^}]*display:\s*block/.test(globalCss),
    'compiled CSS is missing the global link row (try hexo clean)'
  );
  console.log('First-screen layout check passed (source + compiled CSS).');
} else {
  console.log('First-screen layout check passed (source only; run hexo generate for compiled check).');
}
