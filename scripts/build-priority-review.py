"""Build a smaller, emotion-first photo review set.

This pass is deliberately conservative: it keeps at least one representative
photograph from every photographed day, gives extra weight to visible faces,
and uses perceptual diversity to avoid filling the review with one burst.  It
does not move, rename, delete, or rewrite any source media.
"""

from __future__ import annotations

import hashlib
import json
import math
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFile, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "media-inbox" / "photos"
OUTPUT = ROOT / "artifacts" / "photo-curation"
INDEX_PATH = OUTPUT / "photo-index.json"
SHEETS = OUTPUT / "priority-sheets"
SUPPORTED = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
THUMB_SIZE = (180, 132)
SHEET_COLUMNS = 7
SHEET_ROWS = 6
FACE_CASCADE = cv2.CascadeClassifier(
    str(Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml")
)

ImageFile.LOAD_TRUNCATED_IMAGES = True


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


def hamming(left: str, right: str) -> int:
    return (int(left, 16) ^ int(right, 16)).bit_count()


def parse_capture_time(path: Path, image: Image.Image) -> datetime | None:
    try:
        exif = image.getexif()
        for tag in (36867, 36868, 306):
            value = exif.get(tag)
            if value:
                return datetime.strptime(str(value), "%Y:%m:%d %H:%M:%S")
    except (ValueError, TypeError, OverflowError):
        pass
    modified = datetime.fromtimestamp(path.stat().st_mtime)
    return modified if modified.year >= 2000 else None


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


def recover_valid_failures(data: dict) -> tuple[list[dict], dict[str, list[str]]]:
    all_paths = sorted(
        (path for path in SOURCE.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED),
        key=lambda path: path.name.lower(),
    )
    id_by_name = {path.name: f"P{index:04d}" for index, path in enumerate(all_paths, start=1)}
    existing_hashes = {record["sha256"] for record in data["records"]}
    recovered: list[dict] = []
    classified: dict[str, list[str]] = defaultdict(list)

    for filename in data.get("failures", {}):
        path = SOURCE / filename
        if not path.exists():
            classified["missing"].append(filename)
            continue
        if path.stat().st_size == 0:
            classified["empty"].append(filename)
            continue
        with path.open("rb") as handle:
            signature = handle.read(16)
        if len(signature) >= 8 and signature[4:8] == b"ftyp":
            classified["quicktime-video-mislabeled-as-jpg"].append(filename)
            continue
        try:
            digest = hash_file(path)
            if digest in existing_hashes:
                classified["exact-duplicate"].append(filename)
                continue
            with Image.open(path) as opened:
                captured = parse_capture_time(path, opened)
                image = ImageOps.exif_transpose(opened).convert("RGB")
                brightness, contrast, sharpness, quality, dhash = image_metrics(image)
            recovered.append(
                {
                    "review_id": id_by_name[filename],
                    "filename": filename,
                    "path": str(path.relative_to(ROOT)).replace("\\", "/"),
                    "size_bytes": path.stat().st_size,
                    "width": image.width,
                    "height": image.height,
                    "captured_at": captured.isoformat(sep=" ", timespec="seconds") if captured else None,
                    "month": captured.strftime("%Y-%m") if captured else "unknown",
                    "sha256": digest,
                    "dhash": dhash,
                    "brightness": round(brightness, 2),
                    "contrast": round(contrast, 2),
                    "sharpness": round(sharpness, 2),
                    "quality_score": round(quality, 2),
                    "status": "recovered-truncated",
                    "duplicate_of": None,
                    "near_group": None,
                }
            )
            existing_hashes.add(digest)
        except Exception:
            classified["unreadable"].append(filename)

    return recovered, dict(sorted(classified.items()))


def face_metrics(path: Path) -> tuple[int, float]:
    with Image.open(path) as opened:
        # JPEG draft decoding avoids expanding multi-megapixel originals merely
        # to detect faces in a small review thumbnail.
        opened.draft("RGB", (480, 480))
        image = ImageOps.exif_transpose(opened).convert("RGB")
    width, height = image.size
    scale = min(1.0, 360.0 / max(width, height))
    if scale < 1.0:
        image = image.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS)
    rgb = np.asarray(image)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    min_side = max(18, min(gray.shape[:2]) // 18)
    faces = FACE_CASCADE.detectMultiScale(
        gray, scaleFactor=1.24, minNeighbors=4, minSize=(min_side, min_side)
    )
    image_area = float(gray.shape[0] * gray.shape[1])
    face_area = sum(int(w) * int(h) for _, _, w, h in faces)
    return len(faces), min(1.0, face_area / image_area)


def priority_score(record: dict) -> float:
    quality = float(record["quality_score"]) / 100.0
    count = min(int(record["face_count"]), 4) / 4.0
    area = min(float(record["face_area_ratio"]) / 0.18, 1.0)
    # Faces are an emotional signal, not a hard requirement; landscapes remain
    # eligible as representatives of a day or meaningful place.
    face_signal = 0.55 * count + 0.45 * area
    return round(100.0 * (0.46 * quality + 0.54 * face_signal), 2)


def choose_diverse(records: list[dict], count: int) -> list[dict]:
    remaining = sorted(records, key=lambda item: item["priority_score"], reverse=True)
    selected: list[dict] = []
    while remaining and len(selected) < count:
        if not selected:
            chosen = remaining.pop(0)
        else:
            chosen = max(
                remaining,
                key=lambda item: (
                    item["priority_score"]
                    + min(hamming(item["dhash"], kept["dhash"]) for kept in selected) * 1.05
                ),
            )
            remaining.remove(chosen)
        selected.append(chosen)
    return selected


def select_daily_representatives(records: list[dict]) -> list[dict]:
    by_day: dict[str, list[dict]] = defaultdict(list)
    for record in records:
        key = record["captured_at"][:10] if record.get("captured_at") else "unknown"
        by_day[key].append(record)

    selected: list[dict] = []
    for day, group in sorted(by_day.items()):
        count = 1 + (len(group) > 12) + (len(group) > 40)
        for record in choose_diverse(group, count):
            record["review_day"] = day
            record["day_photo_count"] = len(group)
            record["selection_reason"] = "face-and-quality representative with burst diversity"
            selected.append(record)
    return sorted(selected, key=lambda item: (item.get("captured_at") or "9999", item["filename"].lower()))


def make_thumbnail(record: dict) -> Image.Image:
    with Image.open(ROOT / record["path"]) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        return ImageOps.fit(image, THUMB_SIZE, method=Image.Resampling.LANCZOS)


def create_sheets(records: list[dict]) -> list[dict]:
    SHEETS.mkdir(parents=True, exist_ok=True)
    for old_sheet in SHEETS.glob("priority-*.jpg"):
        old_sheet.unlink()
    per_sheet = SHEET_COLUMNS * SHEET_ROWS
    font = ImageFont.load_default(size=13)
    small_font = ImageFont.load_default(size=10)
    manifests: list[dict] = []
    total = math.ceil(len(records) / per_sheet)

    for sheet_number, start in enumerate(range(0, len(records), per_sheet), start=1):
        batch = records[start : start + per_sheet]
        cell_width, cell_height = 200, 178
        canvas = Image.new("RGB", (SHEET_COLUMNS * cell_width, SHEET_ROWS * cell_height), "#f6efe5")
        draw = ImageDraw.Draw(canvas)
        for position, record in enumerate(batch):
            row, column = divmod(position, SHEET_COLUMNS)
            x, y = column * cell_width, row * cell_height
            try:
                canvas.paste(make_thumbnail(record), (x + 10, y + 7))
            except Exception:
                draw.rectangle((x + 10, y + 7, x + 190, y + 139), fill="#d9cdc2")
            draw.text(
                (x + 10, y + 143),
                f"{record['review_id']}  E{record['priority_score']:.0f}  faces:{record['face_count']}",
                fill="#572a34",
                font=font,
            )
            draw.text((x + 10, y + 160), record["review_day"], fill="#746965", font=small_font)
        output_path = SHEETS / f"priority-{sheet_number:03d}.jpg"
        canvas.save(output_path, quality=90, optimize=True)
        manifests.append(
            {
                "sheet": sheet_number,
                "path": str(output_path.relative_to(ROOT)).replace("\\", "/"),
                "review_ids": [record["review_id"] for record in batch],
            }
        )
        print(f"Created priority sheet {sheet_number}/{total}", flush=True)
    return manifests


def main() -> int:
    data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    recovered, failure_classes = recover_valid_failures(data)
    records = [
        dict(record)
        for record in data["records"]
        if record["status"] not in {"exact-duplicate", "near-duplicate"}
    ]
    records.extend(recovered)
    print(f"Recovered {len(recovered)} truncated photographs", flush=True)

    for index, record in enumerate(records, start=1):
        count, area = face_metrics(ROOT / record["path"])
        record["face_count"] = count
        record["face_area_ratio"] = round(area, 5)
        record["priority_score"] = priority_score(record)
        if index % 100 == 0 or index == len(records):
            print(f"Face-ranked {index}/{len(records)}", flush=True)

    selected = select_daily_representatives(records)
    sheets = create_sheets(selected)
    output = {
        "method": {
            "source_files_changed": False,
            "kept_at_least_one_per_photographed_day": True,
            "daily_limit": "1 normally, 2 above 12 photos, 3 above 40 photos",
            "ranking": "visible faces + technical quality + perceptual diversity",
            "note": "This is a review set, not the final public selection.",
        },
        "summary": {
            "eligible_photos": len(records),
            "recovered_truncated_photos": len(recovered),
            "priority_review_photos": len(selected),
            "priority_sheets": len(sheets),
            "remaining_failure_classes": {key: len(value) for key, value in failure_classes.items()},
        },
        "remaining_failures": failure_classes,
        "records": selected,
        "sheets": sheets,
    }
    (OUTPUT / "priority-review.json").write_text(json.dumps(output, indent=2), encoding="utf-8")
    (OUTPUT / "priority-summary.json").write_text(json.dumps(output["summary"], indent=2), encoding="utf-8")
    print(json.dumps(output["summary"], indent=2), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
