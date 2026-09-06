'use strict';

const path = require('path');
const { execFileSync } = require('child_process');

const dimensionsCache = new Map();

function imageDimensions(src) {
  const match = String(src || '').match(/^\/images\/(.+)$/i);
  if (!match) return null;

  const file = path.join(hexo.source_dir, 'images', decodeURIComponent(match[1]));
  if (dimensionsCache.has(file)) return dimensionsCache.get(file);

  try {
    const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    const values = [...output.matchAll(/pixel(?:Width|Height):\s+(\d+)/g)].map(match => Number(match[1]));
    const dimensions = values.length === 2 ? { width: values[0], height: values[1] } : null;
    dimensionsCache.set(file, dimensions);
    return dimensions;
  } catch (_) {
    dimensionsCache.set(file, null);
    return null;
  }
}

function addAttribute(tag, name, value) {
  if (new RegExp(`\\s${name}\\s*=`, 'i').test(tag)) return tag;
  return tag.replace(/<img\b/i, `<img ${name}="${value}"`);
}

// Keep article images browser-native and dependency-free. The first image may
// be part of the opening context, while later images can wait until needed.
hexo.extend.filter.register('after_post_render', data => {
  if (!data.content) return;

  let imageIndex = 0;
  data.content = data.content.replace(/<img\b[^>]*>/gi, image => {
    imageIndex += 1;
    const loading = imageIndex === 1 ? 'eager' : 'lazy';
    let result = image;

    if (!/\sloading\s*=/i.test(result)) {
      result = result.replace(/<img\b/i, `<img loading="${loading}"`);
    }
    if (!/\sdecoding\s*=/i.test(result)) {
      result = result.replace(/<img\b/i, '<img decoding="async"');
    }

    const src = result.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
    const dimensions = imageDimensions(src);
    if (dimensions) {
      result = addAttribute(result, 'width', dimensions.width);
      result = addAttribute(result, 'height', dimensions.height);
    }

    return result;
  });
}, 20);
