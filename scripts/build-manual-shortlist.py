"""Create the manually reviewed photo shortlist and visual proof sheets.

The IDs below were chosen after inspecting the generated contact sheets.  This
script only writes private review artifacts; it never changes source media or
copies anything into the public website.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFile, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CURATION = ROOT / "artifacts" / "photo-curation"
SOURCE_INDEX = CURATION / "priority-review.json"
OUTPUT_JSON = CURATION / "photo-shortlist.json"
OUTPUT_MD = CURATION / "photo-shortlist.md"
SHEETS = CURATION / "shortlist-sheets"

ImageFile.LOAD_TRUNCATED_IMAGES = True


CORE = {
    "P0003": ("our-beginnings", "An early portrait together; warm, direct, and unmistakably yours."),
    "P0009": ("our-beginnings", "An easy outdoor couple selfie that feels natural rather than posed."),
    "P0019": ("our-beginnings", "A joyful restaurant selfie from the early chapter of the relationship."),
    "P0053": ("her-portrait", "A beautiful portrait of Wasiatus in traditional dress."),
    "P0058": ("adventures", "A travel memory that places both of you inside the wider story."),
    "P0067": ("adventures", "A strong full-body couple photograph with a sense of place."),
    "P0080": ("playful-love", "A playful close couple moment with personality."),
    "P1151": ("playful-love", "A funny, affectionate winter moment that feels candid."),
    "P1241": ("quiet-love", "A calm seaside couple portrait, useful as a reflective transition."),
    "P2907": ("our-beginnings", "A clear, bright couple portrait with both faces visible."),
    "P1286": ("everyday-life", "A mirror photo that makes the story feel lived-in and real."),
    "P1328": ("becoming-family", "The first ultrasound image: a major emotional turning point."),
    "P1352": ("becoming-family", "A later ultrasound image that continues the family timeline."),
    "P1507": ("quiet-love", "A tender, peaceful cuddle that reflects everyday closeness."),
    "P1595": ("newborn-days", "A father kissing the newborn during a difficult, real little moment."),
    "P1662": ("newborn-days", "Mother and baby touching faces; one of the strongest intimate family frames."),
    "P1689": ("newborn-days", "Wasiatus holding the baby close with both faces readable."),
    "P2771": ("newborn-days", "Father and baby forehead-to-forehead, gentle and emotionally direct."),
    "P1836": ("becoming-family", "A family print/polaroid that visually says: now we are three."),
    "P1855": ("motherhood", "Wasiatus seated with the baby, relaxed and quietly proud."),
    "P1949": ("little-joys", "A bright baby smile with strong eye contact."),
    "P2011": ("family-memories", "A photo-booth style family memory that feels playful and celebratory."),
    "P2022": ("motherhood", "Mother holding the baby close; soft and protective."),
    "P2308": ("fatherhood", "Father holding the baby upright, both looking toward the camera."),
    "P2339": ("family-adventures", "Wasiatus and the baby outdoors, smiling beside a meaningful destination."),
    "P2359": ("fatherhood", "A close father-and-child portrait with a protective feeling."),
    "P2500": ("family-adventures", "All three together during an outing; a strong family-story anchor."),
    "P2565": ("family-adventures", "A clear outdoor family portrait with warmth and context."),
    "P1639": ("home-together", "The family asleep together: peaceful, vulnerable, and deeply lived-in."),
    "P1826": ("home-together", "A soft family cuddle at home, ideal for the closing chapter."),
    "P2558": ("growing-together", "Wasiatus holding the older child outdoors; affectionate and current."),
    "P2560": ("growing-together", "A close mother-and-child frame showing the newest chapter."),
    "P2562": ("little-joys", "A joyful recent child portrait—an uplifting final image."),
}


GALLERY = {
    "P0759": ("our-beginnings", "Early couple day out."),
    "P0760": ("our-beginnings", "Alternate early couple expression."),
    "P0903": ("our-beginnings", "Bright early restaurant selfie."),
    "P0979": ("her-portrait", "Candid Wasiatus at the table."),
    "P0987": ("her-portrait", "Playful portrait of Wasiatus."),
    "P1091": ("everyday-life", "A masked train ride together."),
    "P0046": ("playful-love", "A candid look exchanged between you."),
    "P0073": ("adventures", "Relaxed travel-group memory."),
    "P1164": ("her-portrait", "Wasiatus smiling on the water."),
    "P1370": ("adventures", "Couple selfie during a trip."),
    "P1427": ("her-portrait", "Winter portrait with personality."),
    "P0123": ("newborn-days", "Newborn sleeping in the stroller."),
    "P0147": ("little-joys", "One of the earliest big baby smiles."),
    "P1669": ("newborn-days", "Parent and baby resting close together."),
    "P1712": ("little-joys", "Alert baby portrait with eye contact."),
    "P1726": ("little-joys", "A funny wide-eyed baby expression."),
    "P1734": ("little-joys", "A memorable newborn yawn."),
    "P1762": ("fatherhood", "Baby resting on father’s head."),
    "P1843": ("little-joys", "Baby wearing oversized headphones."),
    "P1851": ("little-joys", "Soft close-up smile."),
    "P1881": ("newborn-days", "Peaceful sleeping baby."),
    "P1884": ("family-adventures", "A content stroller outing."),
    "P1896": ("little-joys", "Baby dressed warmly and looking at the camera."),
    "P2646": ("fatherhood", "Father and baby in a casual home selfie."),
    "P2024": ("motherhood", "Baby resting securely against mother."),
    "P2883": ("quiet-love", "A newer couple selfie with both faces close."),
    "P2251": ("fatherhood", "Father lying beside the smiling baby."),
    "P2286": ("motherhood", "Mother and baby during feeding time."),
    "P2317": ("little-joys", "Baby laughing in the seat."),
    "P2360": ("fatherhood", "Night-time father-and-child close-up."),
    "P2408": ("little-joys", "Baby wearing glasses—a funny character moment."),
    "P2444": ("celebrations", "A candle/birthday moment with father and child."),
    "P2563": ("fatherhood", "Baby asleep against father during an outdoor day."),
    "P2637": ("family-adventures", "Night family selfie beside the lit tower."),
    "P0092": ("little-joys", "Tiny sunglasses and a wonderfully serious expression."),
    "P0128": ("family-adventures", "Family outdoors in winter."),
    "P0140": ("family-adventures", "Alternate winter family outing."),
    "P1572": ("growing-together", "Recent child portrait with direct eye contact."),
    "P1598": ("growing-together", "Recent standing portrait showing how much the child has grown."),
    "P1684": ("her-portrait", "A funny, expressive recent portrait of Wasiatus."),
}


def thumbnail(path: Path, size: tuple[int, int]) -> Image.Image:
    with Image.open(path) as opened:
        opened.draft("RGB", (size[0] * 2, size[1] * 2))
        image = ImageOps.exif_transpose(opened).convert("RGB")
        return ImageOps.fit(image, size, method=Image.Resampling.LANCZOS)


def create_sheets(records: list[dict]) -> list[str]:
    SHEETS.mkdir(parents=True, exist_ok=True)
    for old in SHEETS.glob("shortlist-*.jpg"):
        old.unlink()
    columns, rows = 6, 5
    per_sheet = columns * rows
    font = ImageFont.load_default(size=14)
    small = ImageFont.load_default(size=11)
    outputs: list[str] = []
    for sheet_number, start in enumerate(range(0, len(records), per_sheet), start=1):
        batch = records[start : start + per_sheet]
        canvas = Image.new("RGB", (columns * 230, rows * 205), "#f6efe5")
        draw = ImageDraw.Draw(canvas)
        for position, record in enumerate(batch):
            row, column = divmod(position, columns)
            x, y = column * 230, row * 205
            canvas.paste(thumbnail(ROOT / record["path"], (210, 154)), (x + 10, y + 7))
            draw.text((x + 10, y + 166), f"{record['review_id']}  {record['tier']}", fill="#572a34", font=font)
            draw.text((x + 10, y + 185), record["story_role"], fill="#746965", font=small)
        path = SHEETS / f"shortlist-{sheet_number:02d}.jpg"
        canvas.save(path, quality=91, optimize=True)
        outputs.append(str(path.relative_to(ROOT)).replace("\\", "/"))
    return outputs


def main() -> int:
    data = json.loads(SOURCE_INDEX.read_text(encoding="utf-8"))
    by_id = {record["review_id"]: record for record in data["records"]}
    selected: list[dict] = []
    missing: list[str] = []
    for tier, mapping in (("core", CORE), ("gallery", GALLERY)):
        for review_id, (role, reason) in mapping.items():
            if review_id not in by_id:
                missing.append(review_id)
                continue
            record = dict(by_id[review_id])
            record.update({"tier": tier, "story_role": role, "curation_reason": reason})
            selected.append(record)
    if missing:
        raise RuntimeError(f"Missing review IDs: {', '.join(missing)}")

    sheets = create_sheets(selected)
    result = {
        "status": "awaiting-owner-approval",
        "source_files_changed": False,
        "public_site_files_changed": False,
        "counts": {"core": len(CORE), "gallery": len(GALLERY), "total": len(selected)},
        "records": selected,
        "proof_sheets": sheets,
    }
    OUTPUT_JSON.write_text(json.dumps(result, indent=2), encoding="utf-8")

    lines = [
        "# Photo shortlist — awaiting approval",
        "",
        "No source files were moved, renamed, deleted, or copied into the public site.",
        "",
        f"- Core story: {len(CORE)} photos",
        f"- Optional gallery: {len(GALLERY)} photos",
        f"- Total reviewed shortlist: {len(selected)} photos",
        "",
        "## Core story",
        "",
        "| ID | Date | Story role | Source filename | Why it matters |",
        "|---|---|---|---|---|",
    ]
    for record in selected:
        if record["tier"] != "core":
            continue
        lines.append(
            f"| {record['review_id']} | {(record.get('captured_at') or 'unknown')[:10]} | "
            f"{record['story_role']} | `{record['filename']}` | {record['curation_reason']} |"
        )
    lines.extend(
        [
            "",
            "## Optional gallery",
            "",
            "| ID | Date | Story role | Source filename | Why it matters |",
            "|---|---|---|---|---|",
        ]
    )
    for record in selected:
        if record["tier"] != "gallery":
            continue
        lines.append(
            f"| {record['review_id']} | {(record.get('captured_at') or 'unknown')[:10]} | "
            f"{record['story_role']} | `{record['filename']}` | {record['curation_reason']} |"
        )
    OUTPUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(result["counts"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
