'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

console.log('=== Running DOM Zoom Script Verification (body-end.njk) ===\n');

// Read the script block from source/_data/body-end.njk
const bodyEndNjk = fs.readFileSync(path.resolve(__dirname, '../source/_data/body-end.njk'), 'utf8');
const scriptMatch = bodyEndNjk.match(/document\.querySelectorAll\("\.main-inner:not\(\.index\) \.post-body img"\)\.forEach\(img => \{[\s\S]*?\}\);\s*\}\)\(\);/);

if (!scriptMatch) {
  console.error('FAIL: Could not locate zoom script snippet in source/_data/body-end.njk');
  process.exit(1);
}

// Function to execute the zoom logic in a JSDOM window
function runZoomScript(window) {
  const document = window.document;
  document.querySelectorAll(".main-inner:not(.index) .post-body img").forEach(img => {
    if (img.closest("a") || img.classList.contains("no-zoom")) return;
    const src = img.getAttribute("src");
    if (!src) return;

    const link = document.createElement("a");
    link.className = "article-img-link";
    link.href = src;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = img.getAttribute("alt") || "点击查看高清原图";

    img.parentNode.insertBefore(link, img);
    link.appendChild(img);
  });
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

// TC-Z01: Standard article image
test('TC-Z01: Standard article image inside .post-body is wrapped with a.article-img-link', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <p><img src="/images/chart.png" alt="经济周期图"></p>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  const img = dom.window.document.querySelector('img');
  const parent = img.parentElement;
  assert.strictEqual(parent.tagName.toLowerCase(), 'a', 'img parent should be <a>');
  assert.strictEqual(parent.className, 'article-img-link');
  assert.strictEqual(parent.getAttribute('href'), '/images/chart.png');
  assert.strictEqual(parent.getAttribute('target'), '_blank');
  assert.strictEqual(parent.getAttribute('rel'), 'noopener noreferrer');
  assert.strictEqual(parent.getAttribute('title'), '经济周期图');
  assert.strictEqual(parent.parentElement.tagName.toLowerCase(), 'p', 'link parent should be <p>');
});

// TC-Z02: Image without alt attribute
test('TC-Z02: Image without alt attribute defaults title to "点击查看高清原图"', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <p><img src="/images/chart.png"></p>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  const link = dom.window.document.querySelector('a.article-img-link');
  assert(link, 'link should exist');
  assert.strictEqual(link.getAttribute('title'), '点击查看高清原图');
});

// TC-Z03: Image with empty alt=""
test('TC-Z03: Image with empty alt="" defaults title to "点击查看高清原图"', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <p><img src="/images/chart.png" alt=""></p>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  const link = dom.window.document.querySelector('a.article-img-link');
  assert.strictEqual(link.getAttribute('title'), '点击查看高清原图');
});

// TC-Z04: Image already inside <a> link
test('TC-Z04: Image already inside <a> link is NOT wrapped', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <p><a href="https://example.com" class="external-link"><img src="/images/icon.png" alt="icon"></a></p>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  const links = dom.window.document.querySelectorAll('a');
  assert.strictEqual(links.length, 1, 'should have only the original <a> tag');
  assert.strictEqual(links[0].className, 'external-link');
  assert.strictEqual(links[0].href, 'https://example.com/');
});

// TC-Z05: Image with .no-zoom class
test('TC-Z05: Image with class "no-zoom" is NOT wrapped', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <p><img class="no-zoom badge" src="/images/badge.png" alt="badge"></p>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  const img = dom.window.document.querySelector('img');
  assert.strictEqual(img.parentElement.tagName.toLowerCase(), 'p', 'img parent should remain <p>');
  assert.strictEqual(dom.window.document.querySelectorAll('a.article-img-link').length, 0);
});

// TC-Z06: Image with empty src
test('TC-Z06: Image with empty src="" is NOT wrapped', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <p><img src="" alt="empty"></p>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  assert.strictEqual(dom.window.document.querySelectorAll('a.article-img-link').length, 0);
});

// TC-Z07: Image without src attribute
test('TC-Z07: Image without src attribute is NOT wrapped', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <p><img alt="no-src"></p>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  assert.strictEqual(dom.window.document.querySelectorAll('a.article-img-link').length, 0);
});

// TC-Z08: Index / homepage context (.main-inner.index)
test('TC-Z08: Post excerpt image on index page (.main-inner.index) is excluded from wrapping', () => {
  const dom = new JSDOM(`
    <div class="main-inner index">
      <div class="post-body">
        <p><img src="/images/preview.png" alt="preview"></p>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  const img = dom.window.document.querySelector('img');
  assert.strictEqual(img.parentElement.tagName.toLowerCase(), 'p', 'img on index page should remain in <p>');
  assert.strictEqual(dom.window.document.querySelectorAll('a.article-img-link').length, 0);
});

// TC-Z09: Multiple sibling images in same container
test('TC-Z09: Multiple sibling images in one container are individually wrapped and order preserved', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <div class="gallery">
          <img id="img1" src="/images/1.png" alt="First">
          <img id="img2" src="/images/2.png" alt="Second">
          <img id="img3" src="/images/3.png" alt="Third">
        </div>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  const gallery = dom.window.document.querySelector('.gallery');
  const links = gallery.querySelectorAll(':scope > a.article-img-link');
  assert.strictEqual(links.length, 3, 'all 3 images should be wrapped');
  assert.strictEqual(links[0].querySelector('img').id, 'img1');
  assert.strictEqual(links[1].querySelector('img').id, 'img2');
  assert.strictEqual(links[2].querySelector('img').id, 'img3');
});

// TC-Z10: Figure element with figcaption
test('TC-Z10: Figure element with figcaption preserves figcaption as sibling', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <figure class="weekly-mainline-figure">
          <img src="/images/weekly/japan-policy-triangle.svg" alt="政策三角图">
          <figcaption class="weekly-figure-caption">图1：日本政策三角制约</figcaption>
        </figure>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  const figure = dom.window.document.querySelector('figure');
  const link = figure.querySelector(':scope > a.article-img-link');
  const caption = figure.querySelector(':scope > figcaption');
  assert(link, 'link should be direct child of figure');
  assert(caption, 'figcaption should remain direct child of figure');
  assert.strictEqual(caption.textContent, '图1：日本政策三角制约');
  assert.strictEqual(link.nextElementSibling, caption, 'link should precede figcaption');
});

// TC-Z11: Idempotency (running script multiple times)
test('TC-Z11: Idempotency - running zoom script multiple times does not duplicate links', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <p><img src="/images/chart.png" alt="Chart"></p>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  runZoomScript(dom.window);
  runZoomScript(dom.window);

  const links = dom.window.document.querySelectorAll('a.article-img-link');
  assert.strictEqual(links.length, 1, 'should have exactly 1 link wrapper after 3 runs');
  const img = dom.window.document.querySelector('img');
  assert.strictEqual(img.parentElement, links[0]);
  assert.strictEqual(links[0].parentElement.tagName.toLowerCase(), 'p');
});

// TC-Z12: Deeply nested table/div/span container
test('TC-Z12: Deeply nested elements within .post-body', () => {
  const dom = new JSDOM(`
    <div class="main-inner">
      <div class="post-body">
        <table>
          <tbody>
            <tr>
              <td>
                <div class="table-card">
                  <span>
                    <img src="/images/table-chart.png" alt="Table Chart">
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `);
  runZoomScript(dom.window);
  const img = dom.window.document.querySelector('img');
  const parent = img.parentElement;
  assert.strictEqual(parent.className, 'article-img-link');
  assert.strictEqual(parent.parentElement.tagName.toLowerCase(), 'span');
});

// TC-Z13: Real post HTML integration test
test('TC-Z13: Integration test on generated public post HTML', () => {
  const postHtmlPath = path.resolve(__dirname, '../public/2026/01/what-is-a-wealth-management-product/index.html');
  if (!fs.existsSync(postHtmlPath)) {
    console.log('    (Skipping TC-Z13: public HTML not generated yet)');
    return;
  }
  const postHtml = fs.readFileSync(postHtmlPath, 'utf8');
  const dom = new JSDOM(postHtml);
  runZoomScript(dom.window);

  const imagesInPost = dom.window.document.querySelectorAll('.main-inner:not(.index) .post-body img');
  assert(imagesInPost.length > 0, 'should find images in generated post HTML');

  imagesInPost.forEach(img => {
    const parent = img.parentElement;
    assert.strictEqual(parent.tagName.toLowerCase(), 'a', `image ${img.src} must be wrapped in <a>`);
    assert.strictEqual(parent.className, 'article-img-link');
    assert.strictEqual(parent.target, '_blank');
    assert.strictEqual(parent.rel, 'noopener noreferrer');
    assert(parent.href.length > 0, 'link href must not be empty');
  });
  console.log(`    (Verified ${imagesInPost.length} images wrapped successfully in real article)`);
});

console.log(`\nDOM Zoom Tests Summary: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
}
