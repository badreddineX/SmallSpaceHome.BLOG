import { imageSize } from 'image-size';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = join(fileURLToPath(import.meta.url), '../../../public');
const cache = new Map();

function getDimensions(src) {
  if (cache.has(src)) return cache.get(src);
  try {
    const filePath = join(publicDir, src);
    const result = imageSize(readFileSync(filePath));
    const dims = { width: result.width, height: result.height };
    cache.set(src, dims);
    return dims;
  } catch {
    cache.set(src, null);
    return null;
  }
}

/** @type {import('satteri').HastPluginDefinition} */
const imageDimensionsPlugin = {
  name: 'rehype-image-dimensions',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      if (node.properties?.width && node.properties?.height) return;
      const src = node.properties?.src;
      if (!src || !src.startsWith('/')) return;
      const dims = getDimensions(src);
      if (!dims) return;
      if (!node.properties.width) ctx.setProperty(node, 'width', dims.width);
      if (!node.properties.height) ctx.setProperty(node, 'height', dims.height);
      if (!node.properties.loading) ctx.setProperty(node, 'loading', 'lazy');
      if (!node.properties.decoding) ctx.setProperty(node, 'decoding', 'async');
    },
  },
};

export default imageDimensionsPlugin;
