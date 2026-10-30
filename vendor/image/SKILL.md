---
name: image2threejs
description: Convert a 2D image into an interactive Three.js 3D scene. Samples the image on a pixel grid, quantizes/reduces colors, then places a colored 3D mesh (box, cylinder, torus, or sphere) at each sampled pixel to build a relief/dot-matrix/pixel-art 3D scene with orbit controls. Use when the user wants to turn a picture, photo, logo, or pixel art into a rotatable 3D Three.js web scene, a 3D dot matrix, a height-mapped relief, or an image-to-3D visualization.
whenToUse: User asks to convert an image/picture/photo/logo into a 3D Three.js scene, 3D pixel art, dot-matrix relief, or an interactive rotatable 3D visualization of an image.
---

# image2threejs — Image to Three.js 3D Scene

Turn a 2D image into an interactive, rotatable Three.js 3D scene by mapping sampled pixels to colored 3D meshes. This skill produces a **single self-contained HTML file** (Three.js loaded via CDN, no build step) the user can open directly in a browser.

Reference implementation: <https://github.com/hannesro/image2threejs> (webpack + RgbQuant demo). This skill generalizes it into a dependency-free, CDN-based, configurable generator.

## What it produces

One HTML file that:
1. Loads the user's image onto an offscreen `<canvas>`.
2. Reads pixel data and samples it on a configurable grid (every Nth pixel).
3. Optionally quantizes colors to a fixed palette (posterize) so similar colors merge.
4. Places a 3D mesh per sampled pixel: x/y from pixel position, z optionally from brightness (height map) or fixed depth.
5. Colors each mesh with the source pixel's color.
6. Adds `OrbitControls`, lights, and a `WebGLRenderer`; auto-fits the camera to the scene.

## Inputs to confirm with the user

Ask only what is not obvious; use sensible defaults otherwise:

| Input | Default | Notes |
|---|---|---|
| image path/URL | (required) | Local file path or URL. For local files opened via `file://`, the image must be same-origin or the user must serve via a tiny static server (see "Serving" below) to avoid canvas taint. |
| sample step | 6 | Sample every Nth pixel in both axes. Smaller = denser/more meshes; larger = sparser. |
| mesh shape | box | One of: box, cylinder, sphere, torus. |
| cell size | 4 | World units per pixel cell (mesh footprint). |
| cell depth | 4 | Mesh height when not using a height map. |
| height map | brightness | `brightness` sets z from pixel luminance (bright = tall); `none` uses fixed cell depth. |
| height scale | 30 | Multiplier for the brightness-derived z. |
| background | #101216 | Scene clear color. |
| quantize colors | 0 | 0 = off; otherwise reduce to N colors (simple posterize). Higher = fewer colors. |
| output file | image2threejs.html | Path to write the generated HTML. |

## Workflow

1. Confirm the image source and any non-default options above.
2. Read the image's dimensions if needed (use `file`/`sips`/`identify` on macOS, or trust the loader in-browser).
3. Generate the HTML using the template below, substituting the chosen options and the image source.
   - For a **local file path**, embed the image as a base64 data URI so the HTML works opened directly (`file://`) without a server and without CORS/taint issues. Read the file and inline it as `data:image/<ext>;base64,...`.
   - For a **URL**, keep it as a remote `src` (ensure CORS allows canvas readback; if not, fetch and inline as base64).
4. Write the HTML to the output file.
5. Tell the user how to open it (see "Serving").

## Generating the HTML

Use this template. Replace the `__OPTIONS__` placeholder object with the resolved options, and `__IMAGE_SRC__` with either a data URI or a URL.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>image2threejs</title>
<style>
  html, body { margin: 0; padding: 0; overflow: hidden; background: #101216; }
  #info { position: fixed; top: 8px; left: 12px; color: #888; font: 12px ui-monospace, monospace; z-index: 10; }
</style>
</head>
<body>
<div id="info">image2threejs — drag to orbit · scroll to zoom</div>
<script type="importmap">
{ "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js", "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/" } }
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const OPTS = __OPTIONS__;            // { sampleStep, shape, cell, depth, heightMap, heightScale, bg, quantize }
const IMAGE_SRC = __IMAGE_SRC__;

const scene = new THREE.Scene();
scene.background = new THREE.Color(OPTS.bg);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 5000);
camera.position.set(0, 0, 600);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(200, 300, 400); scene.add(dir);

function quantize(v, levels) {
  if (!levels || levels <= 0) return v;
  const step = 255 / Math.max(1, levels - 1);
  return Math.round(Math.round(v / step) * step);
}

const img = new Image();
img.crossOrigin = 'anonymous';
img.onload = () => {
  const w = img.naturalWidth, h = img.naturalHeight;
  const cvs = document.createElement('canvas');
  cvs.width = w; cvs.height = h;
  const ctx = cvs.getContext('2d');
  ctx.drawImage(img, 0, 0);
  let data;
  try { data = ctx.getImageData(0, 0, w, h).data; }
  catch (e) { document.getElementById('info').textContent = 'Canvas read blocked (CORS). Inline the image as a data URI instead.'; return; }

  const step = OPTS.sampleStep, cell = OPTS.cell, depth = OPTS.depth;
  const cols = Math.floor(w / step), rows = Math.floor(h / step);
  const group = new THREE.Group();

  // shared geometry per shape; per-mesh material (vertexColors not needed since color per mesh)
  const geo = ({
    box: () => new THREE.BoxGeometry(cell, cell, depth),
    cylinder: () => new THREE.CylinderGeometry(cell / 2, cell / 2, depth, 12),
    sphere: () => new THREE.SphereGeometry(cell / 2, 12, 10),
    torus: () => new THREE.TorusGeometry(cell / 2, cell / 5, 8, 14),
  }[OPTS.shape] || (() => new THREE.BoxGeometry(cell, cell, depth)))();
  geo.translate(0, 0, depth / 2); // sit on z=0 plane, extrude upward

  const offsetX = -(cols * cell) / 2, offsetY = (rows * cell) / 2;
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const px = gx * step, py = gy * step;
      const i = (py * w + px) * 4;
      let r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 8) continue;
      r = quantize(r, OPTS.quantize); g = quantize(g, OPTS.quantize); b = quantize(b, OPTS.quantize);
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const z = OPTS.heightMap === 'brightness' ? lum * OPTS.heightScale : 0;
      const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(r / 255, g / 255, b / 255) });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(offsetX + gx * cell + cell / 2, offsetY - gy * cell - cell / 2, z);
      group.add(mesh);
    }
  }
  scene.add(group);

  // fit camera to scene
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());
  controls.target.copy(center);
  camera.position.copy(center).add(new THREE.Vector3(0, -size * 0.6, size));
  camera.near = size / 100; camera.far = size * 100; camera.updateProjectionMatrix();
  controls.update();

  animate();
};
img.onerror = () => { document.getElementById('info').textContent = 'Failed to load image: ' + IMAGE_SRC; };
img.src = IMAGE_SRC;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
</script>
</body>
</html>
```

### Inlining a local image as base64

When the user gives a local path, inline it so the HTML opens cleanly from `file://`:

```bash
# macOS: detect type and emit a data URI
b64=$(base64 -i "$IMG_PATH")
ext="${IMG_PATH##*.}"; ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
case "$ext" in
  jpg|jpeg) mime="image/jpeg";; png) mime="image/png";; gif) mime="image/gif";; webp) mime="image/webp";; bmp) mime="image/bmp";; *) mime="image/png";;
esac
echo "data:$mime;base64,$b64"
```

Then set `__IMAGE_SRC__` to that data URI string (quoted). Large images → large HTML; recommend downsampling the source first (`sips -Z 512 img.png` on macOS) when the user wants a lighter file.

### Substituting placeholders

- `__OPTIONS__` → a JSON object literal, e.g. `{ sampleStep: 6, shape: 'box', cell: 4, depth: 4, heightMap: 'brightness', heightScale: 30, bg: '#101216', quantize: 0 }`.
- `__IMAGE_SRC__` → a quoted string: a data URI or a URL.

## Serving / opening

- **Inlined data URI:** just double-click the HTML or run `open image2threejs.html` (macOS). No server needed.
- **Remote URL with CORS issues:** serve locally: `python3 -m http.server 8000` then open `http://localhost:8000/image2threejs.html`, and make sure the image URL permits CORS (or switch to the inlined data URI approach).

## Tuning tips to share with the user

- Too many meshes (slow)? Increase `sampleStep` or downsample the source image.
- Want a flat dot-matrix look? Set `heightMap: 'none'`.
- Want a relief/terrain look? Use `heightMap: 'brightness'` with a higher `heightScale`, shape `box`.
- Want posterized pixel art? Set `quantize` to 4–8.
- Mesh count = floor(w/step) * floor(h/step). Keep it under ~60k for smooth orbiting.

## Notes

- This skill generates a static viewer; it does not modify the original image.
- For very large images, prefer downsampling before generating to keep the HTML small and the mesh count sane.
- The reference repo uses RgbQuant + Floyd–Steinberg dithering; this template uses simple per-channel posterize to stay dependency-free. If the user wants dithering, mention they can swap in an rgbquant step, but the default is intentionally minimal.
