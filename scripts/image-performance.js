'use strict';

const fs = require('fs');
const path = require('path');

const dimensionsCache = new Map();

function parseJpegDimensions(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > buffer.length) return null;

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) return null;

    const isStartOfFrame = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
      0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker);
    if (isStartOfFrame && segmentLength >= 7) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3)
      };
    }
    offset += segmentLength;
  }

  return null;
}

function parseWebpDimensions(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF'
    || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;

  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X' && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3)
    };
  }

  const chunkSize = buffer.length >= 20 ? buffer.readUInt32LE(16) : 0;
  const dataOffset = 20;
  if (chunk === 'VP8 ' && chunkSize >= 10 && buffer.length >= dataOffset + 10) {
    const syncCode = [0x9d, 0x01, 0x2a];
    const hasSyncCode = syncCode.every((byte, index) => buffer[dataOffset + 3 + index] === byte);
    if (hasSyncCode) {
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff
      };
    }
  }

  if (chunk === 'VP8L' && chunkSize >= 5 && buffer.length >= dataOffset + 5
    && buffer[dataOffset] === 0x2f) {
    const bits = buffer.readUInt32LE(dataOffset + 1);
    return {
      width: 1 + (bits & 0x3fff),
      height: 1 + ((bits >>> 14) & 0x3fff)
    };
  }

  return null;
}

function readImageDimensions(file) {
  const buffer = fs.readFileSync(file);

  if (buffer.length >= 24
    && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20)
    };
  }

  return parseJpegDimensions(buffer) || parseWebpDimensions(buffer);
}

function imageDimensions(src) {
  const match = String(src || '').match(/^\/images\/(.+)$/i);
  if (!match) return null;

  const file = path.join(hexo.source_dir, 'images', decodeURIComponent(match[1]));
  if (dimensionsCache.has(file)) return dimensionsCache.get(file);

  try {
    const dimensions = readImageDimensions(file);
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

    // Defensive normalization: if an inline style is present without height: auto, ensure height: auto
    // is included so that mobile screens constraining width will not stretch the image vertically.
    if (/\sstyle\s*=/i.test(result)) {
      result = result.replace(/style\s*=\s*["']([^"']*)["']/i, (match, styleVal) => {
        if (!/(?:^|;)\s*height\s*:/i.test(styleVal)) {
          const sep = styleVal.trim().endsWith(';') || styleVal.trim() === '' ? '' : '; ';
          return `style="${styleVal}${sep}height: auto;"`;
        }
        return match;
      });
    }

    return result;
  });
}, 20);
