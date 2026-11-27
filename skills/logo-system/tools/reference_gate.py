#!/usr/bin/env python3
"""Verify the actual visual inputs of an identity production pass."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import sys
from io import BytesIO
from PIL import Image
from xml.etree import ElementTree


def verify(job, root, trusted=None):
    for key in ("brand", "tier", "visual_reviewer"):
        if not isinstance(job.get(key), str) or not job[key].strip():
            raise ValueError(f"Missing {key}")
    if job.get("stage") not in {"generation", "comparison"}:
        raise ValueError("Choose generation or comparison")
    geometry = job.get("geometry_invariants")
    if not isinstance(geometry, list) or not geometry or not all(isinstance(v, str) and v.strip() for v in geometry):
        raise ValueError("Record the observed geometry invariants")
    anchors = job.get("anchors")
    if not isinstance(anchors, list) or not anchors:
        raise ValueError("Recover and view the historical anchor first")

    def digest(source):
        path = (root / source).resolve()
        if not path.is_relative_to(root.resolve()) or not path.is_file():
            raise ValueError("Reference must resolve to a file inside the packet")
        data = path.read_bytes()
        raster = data.startswith((b"\x89PNG\r\n\x1a\n", b"\xff\xd8\xff", b"GIF87a", b"GIF89a")) or (data[:4] == b"RIFF" and data[8:12] == b"WEBP")
        if raster:
            with Image.open(BytesIO(data)) as im:
                im.verify()
            with Image.open(BytesIO(data)) as im:
                im.load()
        else:
            try:
                svg = ElementTree.fromstring(data)
            except ElementTree.ParseError as error:
                raise ValueError("Unsupported or invalid visual reference") from error
            if svg.tag.rsplit("}", 1)[-1] != "svg":
                raise ValueError("Reference is not SVG")
        return sha256(data).hexdigest()

    if job["stage"] == "generation" and trusted is None:
        raise ValueError("For generation, pass a separate verified source manifest with --catalog")
    anchor_hashes = set()
    for anchor in anchors:
        observed = digest(anchor["file"])
        if anchor["sha256"] != observed or not anchor.get("source"):
            raise ValueError("Anchor evidence does not match its bytes")
        if trusted is not None and trusted.get(anchor["source"]) != observed:
            raise ValueError("Reference differs from the independent source manifest")
        if anchor.get("source_class") not in {"source-file", "rendition", "reconstruction"}:
            raise ValueError("State the source class for every anchor")
        anchor_hashes.add(observed)
    inputs = job.get("conditioned_files")
    if not isinstance(inputs, list) or not inputs:
        raise ValueError("The production pass has no visual inputs")
    actual = {digest(path) for path in inputs}
    if actual != anchor_hashes:
        raise ValueError("The reviewed source set and actual production inputs differ")
    if job.get("stage") == "comparison":
        critique = job.get("independent_critique") or {}
        def normalize(value):
            return " ".join(value.split()).casefold() if isinstance(value, str) else ""
        if not normalize(critique.get("reviewer")) or normalize(critique["reviewer"]) == normalize(job["visual_reviewer"]) or not normalize(critique.get("finding")):
            raise ValueError("An independent comparison with a concrete finding is required")
    return {"status": "reference-inputs-verified", "sha256": sorted(anchor_hashes),
            "source_manifest": "matched" if trusted is not None else "unverified",
            "renderer_delivery": "requires-independent-receipt", "founder_approval": "not-evaluated"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("packet", type=Path)
    parser.add_argument("--catalog", type=Path, help="Independently retrieved source-URI to SHA-256 JSON object")
    args = parser.parse_args()
    try:
        trusted = json.loads(args.catalog.read_text()) if args.catalog else None
        if trusted is not None and not isinstance(trusted, dict):
            raise ValueError("Source manifest must map source URIs to SHA-256")
        print(json.dumps(verify(json.loads(args.packet.read_text()), args.packet.parent, trusted)))
    except (OSError, ValueError, KeyError, TypeError) as error:
        sys.exit(f"Reference check failed: {error}")
