'use strict';

/**
 * SUITE-9 · Homepage content rules lock (PRD 2026-09-10, US-3 / US-4)
 *
 *  - US-3: 「最新写作」must never list weekly brief posts — the static
 *    no-JS list in public/index.html, the build-time generator, and the
 *    front-end filter in body-end.njk all exclude weekly groups.
 *  - US-4: weekly brief cards stay 4-layer (meta / title / one dek / one
 *    CTA) with no bullet lists, in source and in the built page.
 *
 * Run after `hexo generate`.
 */

const fs = require('fs');

function assert(condition, message) {
  if (!condition) throw new Error(`Homepage content rules check failed: ${message}`);
}

const WEEKLY_KEY = /political-economy-weekly/;

// --- US-3: latest list excludes weekly posts -------------------------------

const generator = fs.readFileSync('scripts/content-index.js', 'utf8');
assert(
  /homepageLatestList[\s\S]*?\.filter\(group => !weeklyVariant\(group\)\)/.test(generator),
  'scripts/content-index.js homepageLatestList must filter out weekly groups'
);

const bodyEnd = fs.readFileSync('source/_data/body-end.njk', 'utf8');
assert(
  /\.filter\(group => !group\.key\.startsWith\("china-political-economy-weekly"\)[\s\S]*?japan-political-economy-weekly/.test(bodyEnd),
  'front-end latest filter in body-end.njk must exclude china/japan weekly groups'
);

assert(fs.existsSync('public/index.html'), 'public/index.html missing — run hexo generate first');
const homepage = fs.readFileSync('public/index.html', 'utf8');

const latestSection = homepage.match(/<section class="research-latest"[\s\S]*?<\/section>/);
assert(latestSection, 'homepage is missing the 最新写作 section');
assert(
  !WEEKLY_KEY.test(latestSection[0]),
  '最新写作 static list must not link to any weekly brief (US-3)'
);
assert(
  /research-latest-row/.test(latestSection[0]),
  '最新写作 static list must contain at least one non-weekly row (US-3, AC-3.3)'
);

// --- US-4: weekly cards stay 4-layer, no bullets ---------------------------

const homepageCards = [...homepage.matchAll(/<article class="weekly-brief-card[^"]*"[\s\S]*?<\/article>/g)];
// >= 1: the Japan card is currently kept in the DOM and hidden by CSS, but a
// future template-level removal must not break this check.
assert(homepageCards.length >= 1, 'expected at least the featured weekly card on the homepage');
homepageCards.forEach((card, index) => {
  assert(
    !/<[uo]l[\s>]/.test(card[0]),
    `weekly brief card #${index + 1} must not contain bullet lists (US-4, AC-4.1)`
  );
  const ctas = card[0].match(/research-arrow-link/g) || [];
  assert(
    ctas.length === 1,
    `weekly brief card #${index + 1} must have exactly one CTA, found ${ctas.length} (US-4, AC-4.2)`
  );
});

// Card CTA keeps a >=44px tap target (US-2, AC-2.3).
const styl = fs.readFileSync('source/_data/styles.styl', 'utf8');
assert(
  /\.weekly-brief-footer \.research-arrow-link\s*\{[^}]*min-height:\s*44px/.test(styl),
  'card CTA must keep a 44px tap target'
);

console.log(`Homepage content rules passed (${homepageCards.length} weekly cards checked, latest list clean).`);
