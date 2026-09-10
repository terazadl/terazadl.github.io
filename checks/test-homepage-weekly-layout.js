'use strict';

/**
 * SUITE-8 · Homepage weekly layout lock (PRD 2026-09-10, US-1 / US-2)
 *
 * Asserts the single-featured-card layout holds at every viewport:
 *  - .weekly-dual-briefs is a single-column grid (no desktop two-up)
 *  - the homepage Japan full card is hidden globally, scoped to
 *    .weekly-dual-briefs so /politics-economy/ keeps both cards
 *  - .weekly-brief-link-row (同步推送) renders at all viewports
 *  - the <=800px media query no longer reintroduces conflicting rules
 *
 * Reads source/_data/styles.styl (source of truth) and, when present,
 * public/css/main.css (compiled output). Run after `hexo generate`.
 */

const fs = require('fs');

const styl = fs.readFileSync('source/_data/styles.styl', 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(`Weekly layout check failed: ${message}`);
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
  /\.weekly-dual-briefs\s+\.weekly-brief-card\.is-japan\s*\{[^}]*display:\s*none/.test(globalStyl),
  'homepage Japan card must be hidden globally, scoped to .weekly-dual-briefs'
);
const hideRules = [...styl.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, selector, body]) =>
    /\.weekly-brief-card\.is-japan/.test(selector) && /display:\s*none/.test(body))
  .map(([, selector]) => selector.trim());
assert(
  hideRules.length > 0 && hideRules.every(selector => selector.includes('.weekly-dual-briefs')),
  `every rule hiding .weekly-brief-card.is-japan must be scoped to .weekly-dual-briefs; found: ${hideRules.join(' | ') || '(none)'}`
);
assert(
  /\.weekly-brief-link-row\s*\{[^}]*display:\s*block/.test(globalStyl),
  '.weekly-brief-link-row must display:block at all viewports'
);

if (fs.existsSync('public/css/main.css')) {
  const compiled = fs.readFileSync('public/css/main.css', 'utf8');
  const globalCss = stripMediaQueries(compiled);
  assert(
    /\.weekly-dual-briefs \.weekly-brief-card\.is-japan\s*\{[^}]*display:\s*none/.test(globalCss),
    'compiled CSS is missing the global scoped Japan-card hide (try hexo clean)'
  );
  assert(
    /\.weekly-brief-link-row\s*\{[^}]*display:\s*block/.test(globalCss),
    'compiled CSS is missing the global 同步推送 row'
  );
  console.log('Weekly layout check passed (source + compiled CSS).');
} else {
  console.log('Weekly layout check passed (source only; run hexo generate for compiled check).');
}
