#!/usr/bin/env python3
"""Import immutable, licensed source files; never run upstream installers."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

SOURCES = [
    dict(id="taste", repository="Leonxlnx/taste-skill", commit="12af471f627f866411b4bd785b19646d3672784c", license="MIT", prefix="skills/taste-skill/", extra=["LICENSE"], stage="taste"),
    dict(id="impeccable", repository="pbakaus/impeccable", commit="df3a4abe7d0840d5f60324812c432e00b66a4e75", license="Apache-2.0", prefix=".agents/skills/impeccable/", extra=["LICENSE", "NOTICE.md"], stage="impeccable"),
    dict(id="playwright", repository="microsoft/playwright-cli", commit="b1a5903c5b633b8c9f843ad7b629c2a78437040c", license="Apache-2.0", prefix="skills/playwright-cli/", extra=["LICENSE", "package.json"], stage="browser"),
    dict(id="awesome", repository="bergside/awesome-design-skills", commit="f631a09b4fcc0166f2e2c1a8c81906ef680c57e8", license="MIT", prefix="skills/", extra=["LICENSE"], stage="references"),
    dict(id="image", repository="lijiejoy/dsh-skill-image2threejs", commit="3cd7373fb3578e3e695ee700c3ff8f086ac5e378", license="MIT", prefix=None, extra=["SKILL.md", "LICENSE", "README.md"], stage="threejs"),
    dict(id="img2threejs", repository="img2threejs/img2threejs", commit="3e7099e1b7fe93e187e06db4bdbe1e1906c21a28", license="Apache-2.0", prefix=None, extra=["SKILL.md", "LICENSE", "README.md", "CHANGELOG.md", "CONTRIBUTING.md", "ROADMAP.md", "scripts/capture_threejs_playwright.py", "scripts/character_audit.sh"], directories=["forge/", "grimoire/", "docs/", "integrations/"], stage="threejs"),
]

def git(checkout, *args):
    return subprocess.check_output(["git", "-C", str(checkout), *args])

def vendor(root, checkout_root):
    final_destination = root / "vendor"
    if final_destination.exists():
        raise ValueError("vendor/ already exists; review updates in a clean worktree")
    staging = tempfile.TemporaryDirectory(prefix="design-sources-", dir=root)
    destination = Path(staging.name) / "vendor"
    records = []
    for source in SOURCES:
        checkout = checkout_root / source["id"]
        if git(checkout, "rev-parse", "HEAD").decode().strip() != source["commit"]:
            raise ValueError(f"{source['id']}: checkout does not match reviewed pin")
        files, excluded = [], []
        entries = git(checkout, "ls-tree", "-rz", source["commit"]).split(b"\0")
        for entry in entries:
            if not entry:
                continue
            meta, raw_path = entry.split(b"\t", 1)
            mode, kind, blob = meta.decode().split()
            path = raw_path.decode()
            prefix = source["prefix"]
            selected = path in source["extra"] or (prefix and path.startswith(prefix)) or any(path.startswith(d) for d in source.get("directories", []))
            if not selected:
                continue
            if Path(path).name == ".DS_Store":
                excluded.append(dict(path=path, reason="workstation metadata is not distributed"))
                continue
            if Path(path).suffix == ".env":
                excluded.append(dict(path=path, reason="environment configuration is not distributed"))
                continue
            if mode not in ("100644", "100755") or kind != "blob":
                raise ValueError(f"unsupported source: {source['id']}/{path}")
            local = path[len(prefix):] if prefix and path.startswith(prefix) else path
            target = destination / source["id"] / local
            data = git(checkout, "show", f"{source['commit']}:{path}")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            target.chmod(0o755 if mode == "100755" else 0o644)
            files.append(dict(path=f"vendor/{source['id']}/{local}", upstream_path=path, sha256=hashlib.sha256(data).hexdigest(), bytes=len(data), mode=mode, blob=blob))
        records.append({k: source[k] for k in ["id", "repository", "commit", "license", "stage"]} | dict(files=files, excluded=excluded))
    lock = dict(schema="starlight.design_skill_sources.v1", captured_on="2026-10-30", screenshot_fifth_identity="unresolved; two candidate implementations retained", sources=records)
    (destination / "source-lock.json").write_text(json.dumps(lock, indent=2) + "\n")
    destination.rename(final_destination)
    staging.cleanup()
    print(f"Vendored {sum(len(s['files']) for s in records)} files from {len(records)} immutable sources")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--checkouts", type=Path, required=True)
    args = parser.parse_args()
    vendor(Path(__file__).resolve().parents[1], args.checkouts.resolve())
