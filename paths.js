/**
 * Resolve asset URLs for local dev and GitHub Pages subpaths.
 */
const ROOT = new URL('../', import.meta.url);

export function modelUrl(filename) {
  const encoded = String(filename)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return new URL(`public/brainstem_glb/${encoded}`, ROOT).href;
}
