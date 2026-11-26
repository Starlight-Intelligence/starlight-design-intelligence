#!/usr/bin/env python3
"""Build a local, read-only logo review from exact source bytes."""
import argparse
import base64
from collections import defaultdict
import hashlib
from io import BytesIO
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw, ImageFont, ImageOps
from playwright.sync_api import sync_playwright

SIZES = (16, 24, 32, 64, 128, 512)
INK = "#070a10"
PAPER = "#efede7"
SVG = "{http://www.w3.org/2000/svg}"


def inspect_svg(data):
    if len(data) > 2_000_000 or re.search(rb"<!DOCTYPE|<!ENTITY", data, re.I):
        raise ValueError("Unsupported SVG document")
    root = ET.fromstring(data)
    if root.tag != SVG + "svg":
        raise ValueError("Expected an SVG root")
    bounds = [float(n) for n in re.split(r"[\s,]+", root.get("viewBox", "").strip()) if n]
    if len(bounds) != 4 or not all(abs(n) <= 100_000 for n in bounds) or min(bounds[2:]) <= 0:
        raise ValueError("Missing or invalid viewBox")
    flags = set()
    ids = set()
    for item in root.iter():
        tag = item.tag.removeprefix(SVG)
        if tag in {"script", "foreignObject", "iframe", "object", "embed", "animate", "set", "style", "image"}:
            raise ValueError(f"Unsupported SVG element {tag}")
        if tag in {"text", "tspan"}:
            flags.add("live type")
        if tag == "filter":
            flags.add("filter")
        if tag in {"linearGradient", "radialGradient"}:
            flags.add("gradient")
        ident = item.get("id")
        if ident in ids:
            raise ValueError("Duplicate SVG id")
        if ident:
            ids.add(ident)
        for key, value in item.attrib.items():
            local = key.rsplit("}", 1)[-1].lower()
            if local.startswith("on") or (
                local in {"href", "src", "base"} and not value.startswith("#")
            ) or re.search(r"url\(\s*[\x22\x27]?(?!#)[^#\x22\x27\s)]", value, re.I):
                raise ValueError("SVG contains external or active content")
    colors = {item.get(key).lower() for item in root.iter() for key in ("fill", "stroke")
              if re.fullmatch(r"#[0-9a-f]{6}", item.get(key, ""), re.I)}
    paths = [item.get("d") for item in root.iter(SVG + "path")]
    return {"viewBox": bounds, "path_count": len(paths), "flags": sorted(flags),
            "solid_colors": sorted(colors)}


def contrast(foreground, background):
    def luminance(color):
        channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        linear = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in channels]
        return sum(x * weight for x, weight in zip(linear, (.2126, .7152, .0722)))
    light, dark = sorted((luminance(foreground), luminance(background)), reverse=True)
    return round((light + .05) / (dark + .05), 2)


def specimen(page, data, size, color):
    payload = base64.b64encode(data).decode()
    page.set_content(f'<style>body{{margin:0}} img{{display:block;color:{color}}}</style>'
                     f'<img alt="" width="{size}" height="{size}" src="data:image/svg+xml;base64,{payload}">')
    return Image.open(BytesIO(page.locator("img").screenshot(omit_background=True))).convert("RGBA")


def optical(image, baseline):
    size = image.width
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if box is None:
        raise ValueError("The SVG rendered no pixels")
    mask = Image.new("L", image.size)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    samples = alpha.tobytes()
    mass = sum(samples)
    weights = mask.tobytes()
    reference = baseline.resize(image.size, Image.Resampling.BOX).getchannel("A").tobytes()
    intersection = sum(min(a, b) for a, b in zip(samples, reference))
    union = sum(max(a, b) for a, b in zip(samples, reference))
    center = [sum((p % size + .5) * a for p, a in enumerate(samples)) / mass,
              sum((p // size + .5) * a for p, a in enumerate(samples)) / mass]
    return {"bounds_px": list(box), "edge_touch": min(box[0], box[1], size-box[2], size-box[3]) == 0,
            "centroid_px": [round(value, 2) for value in center],
            "circle_loss_pct": round(100 * sum(a for a, b in zip(samples, weights) if not b) / mass, 2),
            "alpha_iou_vs_512": round(intersection / union, 3)}


def compose(rows, destination):
    width = 804
    sheet = Image.new("RGB", (width, 122 + 124 * len(rows)), PAPER)
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=15)
    title = ImageFont.load_default(size=33)
    draw.text((26, 21), "Starlight / optical evidence", fill=INK, font=title)
    draw.text((26, 70), "Actual Chromium pixels at 1×  ·  review derivatives", fill=INK, font=font)
    for i, (row, frames) in enumerate(rows):
        y = 110 + i * 124
        draw.line((26, y, width - 26, y), fill="#c9c5bc")
        draw.text((26, y + 14), row["label"], fill=INK, font=font)
        draw.text((26, y + 43), row["id"], fill=INK, font=font)
        for size, x in zip(SIZES[:4], [372, 454, 536, 618]):
            img = frames[size]
            bg = row.get("background", INK)
            draw.rectangle((x, y + 10, x + 74, y + 84), fill=bg)
            sheet.paste(img, (x + (75-size)//2, y + 10 + (75-size)//2), img)
            draw.text((x + 6, y + 89), f"{size}px", fill=INK, font=font)
        img = ImageOps.grayscale(frames[128]).convert("RGBA")
        img.putalpha(frames[128].getchannel("A"))
        img.thumbnail((54, 54))
        bg = row.get("background", INK)
        draw.rectangle((700, y + 10, 774, y + 84), fill=bg)
        sheet.paste(img, (710, y + 20), img)
        draw.text((700, y + 89), "Gray / 54", fill=INK, font=font)
    sheet.save(destination)


def run(manifest, out, chromium):
    inputs = json.loads(manifest.read_text())
    source_dir = manifest.parent.resolve()
    ids = set()
    hashes = defaultdict(list)
    rows = []
    captured = []
    cache = {}
    out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=chromium, args=["--no-sandbox"])
        page = browser.new_page(viewport={"width": 540, "height": 540}, device_scale_factor=1)
        page.route("**/*", lambda route: route.abort())
        for item in inputs:
            path = (source_dir / item["file"]).resolve()
            if not path.is_relative_to(source_dir) or item["id"] in ids:
                raise ValueError(f"Unsafe path or repeated asset ID: {item['id']}")
            ids.add(item["id"])
            data = path.read_bytes()
            digest = hashlib.sha256(data).hexdigest()
            if digest != item["sha256"]:
                raise ValueError(f"Source changed: {item['id']}")
            geometry = inspect_svg(data)
            hashes[digest].append(item["id"])
            if digest not in cache:
                cache[digest] = {size: specimen(page, data, size, INK) for size in SIZES}
            images = cache[digest]
            measurement = {size: optical(img, images[512]) for size, img in images.items()}
            ground_contrast = {color: {"ink": contrast(color, INK), "paper": contrast(color, PAPER)}
                               for color in geometry["solid_colors"]}
            rows.append({**item, **geometry, "bytes": len(data), "native_px": measurement,
                         "opaque_solid_contrast": ground_contrast})
            if item.get("show", True):
                captured.append((item, images))
        browser.close()
    result = {"assets": rows, "exact_copies": [group for group in hashes.values() if len(group) > 1]}
    (out / "inspection.json").write_text(json.dumps(result, indent=2) + "\n")
    compose(captured, out / "favicon-matrix.png")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--chromium", help="Use an existing Chromium binary instead of Playwright’s default")
    args = parser.parse_args()
    result = run(args.manifest, args.output, args.chromium)
    print(f"Verified {len(result['assets'])} SVGs at sizes {SIZES}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
