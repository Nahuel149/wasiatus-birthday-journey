"""Build a local-only photo curation index and contact sheets.

The script never moves, renames, or deletes source photographs. It writes review
artifacts under artifacts/photo-curation, which is excluded from Git.
"""

from __future__ import annotations

import csv
import hashlib
import json
import math
import re
import sys
from collections import defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "media-inbox" / "photos"
OUTPUT = ROOT / "artifacts" / "photo-curation"
SHEETS = OUTPUT / "sheets"
SUPPORTED = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
THUMB_SIZE = (150, 115)
SHEET_COLUMNS = 8
SHEET_ROWS = 7


@dataclass
class PhotoRecord:
    review_id: str
    filename: str
    path: str
    size_bytes: int
    width: int
    height: int
    captured_at: str | None
    month: str
    sha256: str
    dhash: str
    brightness: float
    contrast: float
    sharpness: float
    quality_score: float
    status: str = "candidate"
    duplicate_of: str | None = None
    near_group: str | None = None


def parse_capture_time(path: Path, image: Image.Image) -> datetime | None:
    try:
        exif = image.getexif()
        for tag in (36867, 36868, 306):
            value = exif.get(tag)
            if value:
                return datetime.strptime(str(value), "%Y:%m:%d %H:%M:%S")
    except (ValueError, TypeError, OverflowError):
        pass

    match = re.match(r"^(\d{13})", path.stem)
    if match:
        try:
            return datetime.fromtimestamp(int(match.group(1)) / 1000, tz=timezone.utc).replace(tzinfo=None)
        except (ValueError, OSError, OverflowError):
            pass

    modified = datetime.fromtimestamp(path.stat().st_mtime)
    return modified if modified.year >= 2000 else None


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def difference_hash(gray: Image.Image) -> str:
    sample = np.asarray(gray.resize((9, 8), Image.Resampling.LANCZOS), dtype=np.int16)
    bits = sample[:, 1:] > sample[:, :-1]
    value = 0
    for bit in bits.flatten():
        value = (value << 1) | int(bit)
    return f"{value:016x}"


def image_metrics(image: Image.Image) -> tuple[float, float, float, float, str]:
    gray = ImageOps.grayscale(image).resize((256, 256), Image.Resampling.LANCZOS)
    pixels = np.asarray(gray, dtype=np.float32)
    brightness = float(pixels.mean())
    contrast = float(pixels.std())
    dx = np.diff(pixels, axis=1)
    dy = np.diff(pixels, axis=0)
    sharpness = float((dx.var() + dy.var()) / 2)
    exposure = max(0.0, 1.0 - abs(brightness - 128.0) / 128.0)
    resolution = min(1.0, math.sqrt(image.width * image.height) / 2200.0)
    sharpness_norm = min(1.0, math.log1p(sharpness) / 7.0)
    contrast_norm = min(1.0, contrast / 64.0)
    score = 100.0 * (0.35 * sharpness_norm + 0.25 * exposure + 0.2 * contrast_norm + 0.2 * resolution)
    return brightness, contrast, sharpness, score, difference_hash(gray)


def hamming(left: str, right: str) -> int:
    return (int(left, 16) ^ int(right, 16)).bit_count()


class UnionFind:
    def __init__(self, size: int) -> None:
        self.parent = list(range(size))

    def find(self, item: int) -> int:
        while self.parent[item] != item:
            self.parent[item] = self.parent[self.parent[item]]
            item = self.parent[item]
        return item

    def union(self, left: int, right: int) -> None:
        left_root, right_root = self.find(left), self.find(right)
        if left_root != right_root:
            self.parent[right_root] = left_root


def review_files() -> list[Path]:
    return sorted(
        (path for path in SOURCE.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED),
        key=lambda path: path.name.lower(),
    )


def build_index(paths: list[Path]) -> tuple[list[PhotoRecord], dict[str, str]]:
    records: list[PhotoRecord] = []
    failures: dict[str, str] = {}
    for index, path in enumerate(paths, start=1):
        try:
            with Image.open(path) as opened:
                captured = parse_capture_time(path, opened)
                image = ImageOps.exif_transpose(opened).convert("RGB")
                brightness, contrast, sharpness, score, dhash = image_metrics(image)
                record = PhotoRecord(
                    review_id=f"P{index:04d}",
                    filename=path.name,
                    path=str(path.relative_to(ROOT)).replace("\\", "/"),
                    size_bytes=path.stat().st_size,
                    width=image.width,
                    height=image.height,
                    captured_at=captured.isoformat(sep=" ", timespec="seconds") if captured else None,
                    month=captured.strftime("%Y-%m") if captured else "unknown",
                    sha256=hash_file(path),
                    dhash=dhash,
                    brightness=round(brightness, 2),
                    contrast=round(contrast, 2),
                    sharpness=round(sharpness, 2),
                    quality_score=round(score, 2),
                )
                if image.width < 640 or image.height < 480:
                    record.status = "low-resolution"
                elif brightness < 20 or brightness > 242:
                    record.status = "exposure-warning"
                records.append(record)
        except Exception as error:  # Keep a complete failure manifest for manual review.
            failures[path.name] = f"{type(error).__name__}: {error}"

        if index % 100 == 0 or index == len(paths):
            print(f"Indexed {index}/{len(paths)}", flush=True)
    return records, failures


def mark_exact_duplicates(records: list[PhotoRecord]) -> None:
    groups: dict[str, list[PhotoRecord]] = defaultdict(list)
    for record in records:
        groups[record.sha256].append(record)
    for group in groups.values():
        if len(group) < 2:
            continue
        keeper = max(group, key=lambda item: (item.quality_score, item.width * item.height, -len(item.filename)))
        for record in group:
            if record is not keeper:
                record.status = "exact-duplicate"
                record.duplicate_of = keeper.review_id


def mark_near_groups(records: list[PhotoRecord]) -> None:
    eligible = [record for record in records if record.status != "exact-duplicate"]
    eligible.sort(key=lambda item: item.captured_at or "9999")
    union = UnionFind(len(eligible))

    for left_index, left in enumerate(eligible):
        if not left.captured_at:
            continue
        left_time = datetime.fromisoformat(left.captured_at)
        for right_index in range(left_index + 1, min(left_index + 30, len(eligible))):
            right = eligible[right_index]
            if not right.captured_at:
                continue
            seconds = abs((datetime.fromisoformat(right.captured_at) - left_time).total_seconds())
            if seconds > 180:
                break
            if hamming(left.dhash, right.dhash) <= 8:
                union.union(left_index, right_index)

    grouped: dict[int, list[PhotoRecord]] = defaultdict(list)
    for index, record in enumerate(eligible):
        grouped[union.find(index)].append(record)

    sequence = 0
    for group in grouped.values():
        if len(group) < 2:
            continue
        sequence += 1
        group_id = f"N{sequence:04d}"
        keeper = max(group, key=lambda item: item.quality_score)
        for record in group:
            record.near_group = group_id
            if record is not keeper and record.status == "candidate":
                record.status = "near-duplicate"
                record.duplicate_of = keeper.review_id


def create_thumbnail(record: PhotoRecord) -> Image.Image:
    path = ROOT / record.path
    with Image.open(path) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        return ImageOps.fit(image, THUMB_SIZE, method=Image.Resampling.LANCZOS)


def create_contact_sheets(records: list[PhotoRecord]) -> list[dict[str, object]]:
    candidates = [record for record in records if record.status not in {"exact-duplicate", "near-duplicate"}]
    candidates.sort(key=lambda item: (item.captured_at or "9999", item.filename.lower()))
    per_sheet = SHEET_COLUMNS * SHEET_ROWS
    font = ImageFont.load_default(size=13)
    small_font = ImageFont.load_default(size=10)
    manifests: list[dict[str, object]] = []
    SHEETS.mkdir(parents=True, exist_ok=True)

    for sheet_number, start in enumerate(range(0, len(candidates), per_sheet), start=1):
        batch = candidates[start : start + per_sheet]
        cell_width, cell_height = 170, 160
        canvas = Image.new("RGB", (SHEET_COLUMNS * cell_width, SHEET_ROWS * cell_height), "#f6efe5")
        draw = ImageDraw.Draw(canvas)
        for position, record in enumerate(batch):
            row, column = divmod(position, SHEET_COLUMNS)
            x, y = column * cell_width, row * cell_height
            try:
                thumb = create_thumbnail(record)
                canvas.paste(thumb, (x + 10, y + 7))
            except Exception:
                draw.rectangle((x + 10, y + 7, x + 160, y + 122), fill="#d9cdc2")
            draw.text((x + 10, y + 126), f"{record.review_id}  Q{record.quality_score:.0f}", fill="#572a34", font=font)
            draw.text((x + 10, y + 143), (record.captured_at or "date unknown")[:10], fill="#746965", font=small_font)
        output_path = SHEETS / f"sheet-{sheet_number:03d}.jpg"
        canvas.save(output_path, quality=88, optimize=True)
        manifests.append({
            "sheet": sheet_number,
            "path": str(output_path.relative_to(ROOT)).replace("\\", "/"),
            "review_ids": [record.review_id for record in batch],
        })
        print(f"Created sheet {sheet_number}/{math.ceil(len(candidates) / per_sheet)}", flush=True)
    return manifests


def write_outputs(records: list[PhotoRecord], failures: dict[str, str], sheets: list[dict[str, object]]) -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with (OUTPUT / "photo-index.json").open("w", encoding="utf-8") as handle:
        json.dump({"records": [asdict(record) for record in records], "failures": failures, "sheets": sheets}, handle, indent=2)

    with (OUTPUT / "photo-index.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(asdict(records[0]).keys()) if records else ["review_id"])
        writer.writeheader()
        writer.writerows(asdict(record) for record in records)

    summary = {
        "total_supported": len(records),
        "failed": len(failures),
        "exact_duplicates": sum(record.status == "exact-duplicate" for record in records),
        "near_duplicates": sum(record.status == "near-duplicate" for record in records),
        "review_candidates": sum(record.status not in {"exact-duplicate", "near-duplicate"} for record in records),
        "contact_sheets": len(sheets),
        "months": dict(sorted({month: sum(record.month == month for record in records) for month in {r.month for r in records}}.items())),
    }
    with (OUTPUT / "summary.json").open("w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2)
    print(json.dumps(summary, indent=2), flush=True)


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    paths = review_files()
    if not paths:
        print(f"No supported photographs found in {SOURCE}", file=sys.stderr)
        return 1
    print(f"Found {len(paths)} supported photographs", flush=True)
    records, failures = build_index(paths)
    mark_exact_duplicates(records)
    mark_near_groups(records)
    sheets = create_contact_sheets(records)
    write_outputs(records, failures, sheets)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
