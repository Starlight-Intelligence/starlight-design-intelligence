# dsh-skill-image2threejs

A [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) **skill** that converts a 2D image into an interactive, rotatable **Three.js 3D scene** — sampling the image on a pixel grid and placing a colored 3D mesh at each sampled pixel to build a relief / dot-matrix / pixel-art 3D scene.

一个 DSH **技能**:把 2D 图片转换成可旋转的 Three.js 3D 场景。按像素网格采样图片,在每个采样像素处放置带颜色的 3D 网格,生成浮雕/点阵/像素风 3D 场景。

Reference implementation inspired by [hannesro/image2threejs](https://github.com/hannesro/image2threejs) (webpack + RgbQuant demo). This skill generalizes it into a **single self-contained HTML file** (Three.js via CDN, no build step).

## Install

Requires DSH (DeepSeek Harness). The skill is just a `SKILL.md` discovered from a local skills root.

**Option A — clone directly into the user skills root (recommended):**

```bash
git clone https://github.com/lijiejoy/dsh-skill-image2threejs.git ~/.dsh/skills/image2threejs
```

Restart your DSH session (or let the file watcher refresh the catalog). The skill `image2threejs` will appear in the available skills list.

**Option B — copy the bundle:**

```bash
mkdir -p ~/.dsh/skills
cp -r image2threejs ~/.dsh/skills/   # where image2threejs/ contains SKILL.md
```

> DSH discovers skills one level deep at `<root>/<name>/SKILL.md`. Cloning the whole repo into `~/.dsh/skills/image2threejs` places `SKILL.md` at exactly that path, so it is discovered; the `README.md`/`LICENSE` beside it are ignored by discovery.

**Project-local install** (only this project): clone into `<projectRoot>/.dsh/skills/image2threejs` instead.

## Usage

In a DSH session, just ask, e.g.:

> 把这张图片 logo.png 转成 3D 场景 / convert logo.png to a 3D Three.js scene

DSH matches the request to the `image2threejs` skill and loads its instructions. The agent then generates a single self-contained HTML file (image as inline base64 data URI, Three.js via CDN) you can open directly in a browser — drag to orbit, scroll to zoom.

### Options the skill supports

| Option | Default | Notes |
|---|---|---|
| image path/URL | (required) | Local path or URL; local files are inlined as base64 |
| sampleStep | 6 | Sample every Nth pixel; smaller = denser |
| shape | box | box / cylinder / sphere / torus |
| cell | 4 | World units per pixel cell |
| depth | 4 | Mesh height when heightMap is 'none' |
| heightMap | brightness | 'brightness' (bright = tall) or 'none' |
| heightScale | 30 | Multiplier for brightness-derived z |
| bg | #101216 | Scene clear color |
| quantize | 0 | 0 = off; N = posterize to N colors |

## How it works

1. Load the image onto an offscreen `<canvas>` and read pixel data.
2. Sample on a grid (every `sampleStep` px); optionally posterize colors.
3. Place a 3D mesh per sampled pixel — x/y from pixel position, z from brightness (height map) or fixed depth.
4. Color each mesh with the source pixel color; add OrbitControls + lights; auto-fit the camera.

## Files

- `SKILL.md` — the skill definition (YAML frontmatter + instructions). This is the only file DSH loads.
- `README.md` — this file.
- `LICENSE` — MIT.

## License

MIT © lijiejoy
