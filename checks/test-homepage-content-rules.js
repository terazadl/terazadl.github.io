'use strict';

/**
 * SUITE-9 · Homepage content rules lock (SITES-40 revision)
 *
 * Rewritten for the weekly takedown and new first screen:
 *  - the homepage links nowhere into the retired weekly surface
 *    (/china-weekly/, /japan-weekly/, /politics-economy/, weekly slugs)
 *  - the first screen has exactly one featured essay card (4-layer:
 *    meta / title / one dek / one CTA, no bullet lists)
 *  - the hero anchors into the featured essay section and the 生活手记
 *    entry links to /life/
 *  - 最新写作 keeps a static no-JS list
 *
 * Run after `hexo generate`.
 */

const fs = require('fs');

function assert(condition, message) {
  if (!condition) throw new Error(`Homepage content rules check failed: ${message}`);
}

const RETIRED_WEEKLY = /political-economy-weekly|\/china-weekly\/|\/japan-weekly\/|\/politics-economy\//;

assert(fs.existsSync('public/index.html'), 'public/index.html missing — run hexo generate first');
const homepage = fs.readFileSync('public/index.html', 'utf8');

// --- Takedown: no path on the homepage leads to the retired weekly surface -
assert(
  !RETIRED_WEEKLY.test(homepage),
  'homepage must not link to any retired weekly URL (SITES-40)'
);

// --- First screen: one featured essay card --------------------------------

const featuredSection = homepage.match(/<section class="weekly-product-section" id="featured-essay"[\s\S]*?<\/section>/);
assert(featuredSection, 'homepage is missing the featured essay section (#featured-essay)');

const featuredCards = [...featuredSection[0].matchAll(/<article class="weekly-brief-card[^"]*"[\s\S]*?<\/article>/g)];
assert(featuredCards.length === 1, `expected exactly one featured card, found ${featuredCards.length}`);
const featuredCard = featuredCards[0][0];
assert(/weekly-brief-card is-essay/.test(featuredCard), 'featured card must use the is-essay variant');
assert(
  featuredCard.includes('/2026/09/counterclockwise-adult-learning-japanese/'),
  'featured card must link to the latest essay'
);
assert(!/<[uo]l[\s>]/.test(featuredCard), 'featured card must not contain bullet lists');
const ctas = featuredCard.match(/research-arrow-link/g) || [];
assert(ctas.length === 1, `featured card must have exactly one CTA, found ${ctas.length}`);
assert(
  /<a href="\/life\/">/.test(featuredSection[0]),
  'featured section must include the 生活手记 entry linking to /life/'
);

// --- Hero anchors the first screen -----------------------------------------

assert(homepage.includes('Living in Tokyo.'), 'hero title is missing');
assert(
  /<a class="research-primary-button" href="#featured-essay">/.test(homepage),
  'hero primary button must anchor to #featured-essay'
);

// --- 最新写作: static no-JS list stays --------------------------------------

const latestSection = homepage.match(/<section class="research-latest"[\s\S]*?<\/section>/);
assert(latestSection, 'homepage is missing the 最新写作 section');
assert(
  /research-latest-row/.test(latestSection[0]),
  '最新写作 static list must contain at least one row'
);

// Card CTA keeps a >=44px tap target.
const styl = fs.readFileSync('source/_data/styles.styl', 'utf8');
assert(
  /\.weekly-brief-footer \.research-arrow-link\s*\{[^}]*min-height:\s*44px/.test(styl),
  'card CTA must keep a 44px tap target'
);

console.log('Homepage content rules passed (takedown clean, featured essay card, latest list intact).');
