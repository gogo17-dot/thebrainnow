/** Resolve GLB URLs for GitHub Pages flat layout (GLBs at repo root). */
export function modelUrl(filename) {
  return new URL(
    String(filename).split('/').map(encodeURIComponent).join('/'),
    import.meta.url,
  ).href;
}
