"""Import the approved private shortlist into the website media pipeline.

Source photographs remain untouched in media-inbox. Approved files are copied
to the ignored media-source working directory with safe, story-oriented names.
The normal media optimizer then strips metadata and creates public derivatives.
"""

from __future__ import annotations

import json
import re
import shutil
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageFile, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SHORTLIST = ROOT / "artifacts" / "photo-curation" / "photo-shortlist.json"
SOURCE_DIR = ROOT / "media-source" / "photos"
METADATA = ROOT / "media-source" / "metadata.json"
MEMORIES = ROOT / "src" / "content" / "memories.json"

ImageFile.LOAD_TRUNCATED_IMAGES = True


CANONICAL_IDS = {
    "P0003": "our-first-hello",
    "P0019": "the-days-between",
    "P1507": "our-promise",
    "P1662": "hello-rayden",
    "P2500": "our-japan-chapter",
    "P2558": "tomorrows-together",
}

CHAPTER_DETAILS = {
    "how-we-met": ("Chapter one", "dawn"),
    "falling-in-love": ("Chapter two", "blush"),
    "choosing-each-other": ("Chapter three", "gold"),
    "becoming-a-family": ("Chapter four", "sage"),
    "life-in-japan": ("Chapter five", "wine"),
    "future-dreams": ("Chapter six", "night"),
}

ROLE_DETAILS = {
    "our-beginnings": {
        "chapter": "how-we-met", "category": "Our story", "location": "Wherever we were together",
        "people": ["Wasiatus", "Nahuel"], "titles": ["Where our story began", "An early favorite", "The beginning of us", "Already feeling like home"],
        "summary": "Before all the chapters that followed, there was the simple happiness of being side by side.",
        "story": "These early photographs hold the beginning without needing to explain everything. I see two people still discovering how much their lives were about to change.",
        "quote": "The beginning was beautiful because it led me to you.",
    },
    "her-portrait": {
        "chapter": "falling-in-love", "category": "Wasiatus", "location": "A moment worth keeping",
        "people": ["Wasiatus"], "titles": ["Her beautiful light", "That face I love", "Wasiatus, wonderfully herself", "A portrait of my favorite person"],
        "summary": "A glimpse of the woman whose warmth, humor, and strength hold this whole story together.",
        "story": "I love photographs where you are simply yourself. They remind me that beauty is not only a perfect pose; it is your expressions, your humor, and the life behind your eyes.",
        "quote": "Every version of you is one I am grateful to know.",
    },
    "adventures": {
        "chapter": "life-in-japan", "category": "Adventures", "location": "One of our adventures",
        "people": ["Wasiatus", "Nahuel"], "titles": ["Side by side, somewhere new", "Another place, the same us", "The road was better together", "A view I shared with you"],
        "summary": "The destination was beautiful, but sharing it with you is what made it ours.",
        "story": "There are places I remember because they were impressive, and places I remember because you were beside me. The second kind always stays with me longer.",
        "quote": "Everywhere felt closer to home when I could find your hand.",
    },
    "playful-love": {
        "chapter": "falling-in-love", "category": "Everyday love", "location": "Inside one of our ordinary days",
        "people": ["Wasiatus", "Nahuel"], "titles": ["The look only we understand", "Our kind of silly", "Laughing through the ordinary", "A little moment, completely us"],
        "summary": "Love also lives in funny faces, private jokes, and the moments that refuse to be serious.",
        "story": "Some of my favorite memories are not grand or carefully planned. They are the seconds when we made each other laugh and the rest of the world became background noise.",
        "quote": "You make ordinary life feel lighter.",
    },
    "quiet-love": {
        "chapter": "choosing-each-other", "category": "Everyday love", "location": "Together",
        "people": ["Wasiatus", "Nahuel"], "titles": ["Peace beside you", "The quiet kind of love", "Close enough to breathe", "Home in one small frame"],
        "summary": "Not every love story needs noise. Sometimes it is simply the peace of being close.",
        "story": "This is the love I want to protect: being listened to, trusting each other, growing with maturity, and finding peace together even when life is complicated.",
        "quote": "My favorite peace has always been beside you.",
    },
    "everyday-life": {
        "chapter": "choosing-each-other", "category": "Everyday love", "location": "Our everyday life",
        "people": ["Wasiatus", "Nahuel"], "titles": ["The ordinary days", "A life that feels real", "Just us, as we are"],
        "summary": "The unpolished everyday moments became the life I would choose again.",
        "story": "Love grew inside routines: morning notes, shared lunches, checking in, listening, and continuing to care even on tiring days. That ordinary persistence is part of our promise too.",
        "quote": "The life between milestones is the life I love with you.",
    },
    "becoming-family": {
        "chapter": "becoming-a-family", "category": "Family", "location": "The moment our world grew",
        "people": ["Wasiatus", "Nahuel", "Rayden"], "titles": ["And then there were three", "The first picture of our future", "Love learned a new name", "Our family beginning"],
        "summary": "A small image carried the enormous promise that our world was about to grow.",
        "story": "Before we could hold Rayden, we already carried dreams, worries, and a love bigger than we knew how to describe. These images mark the quiet beginning of becoming a family.",
        "quote": "Before we met you, we were already waiting with love.",
    },
    "newborn-days": {
        "chapter": "becoming-a-family", "category": "Family", "location": "Our first days together",
        "people": ["Wasiatus", "Nahuel", "Rayden"], "titles": ["So tiny, already everything", "Our first days as three", "Learning every little sound", "Love in its newest form", "The smallest center of our world"],
        "summary": "Tired eyes, tiny hands, and the overwhelming tenderness of our first days as a family.",
        "story": "Those first days were not polished. They were feeding, worrying, learning, staying awake, and loving more fiercely than ever. I watched your strength become tenderness again and again.",
        "quote": "Our love grew hands small enough to hold one finger.",
    },
    "motherhood": {
        "chapter": "becoming-a-family", "category": "Motherhood", "location": "Wherever Rayden needed you",
        "people": ["Wasiatus", "Rayden"], "titles": ["The way you hold our world", "Safe in Mama's arms", "Your strength became tenderness", "Love, carried close"],
        "summary": "Watching you care for Rayden revealed another beautiful kind of strength in you.",
        "story": "I see the patience, attention, and persistence motherhood asks from you. I see how you listen, protect, comfort, and keep going. Rayden is lucky to know the safety of your arms.",
        "quote": "In your arms, our little world learned what safe means.",
    },
    "fatherhood": {
        "chapter": "becoming-a-family", "category": "Fatherhood", "location": "Our family days",
        "people": ["Nahuel", "Rayden"], "titles": ["Learning love all over again", "Father and child", "A new way to hold the future", "Close to Papa", "The two of us"],
        "summary": "Rayden gave me a new way to understand responsibility, tenderness, and the future.",
        "story": "Holding Rayden made the future feel real in a completely new way. These moments belong to our story because you and I are building this family together, one ordinary day at a time.",
        "quote": "You gave me the family I want to keep becoming worthy of.",
    },
    "little-joys": {
        "chapter": "becoming-a-family", "category": "Rayden", "location": "The center of our attention",
        "people": ["Rayden"], "titles": ["That little smile", "A face we could watch forever", "Tiny expression, enormous joy", "The laugh that changed the room", "Those curious eyes", "Our favorite little character"],
        "summary": "One tiny expression was enough to change the mood of the whole room.",
        "story": "Every new expression became an event: a smile, a yawn, a serious stare, a ridiculous little face. These are the details that made the tiring days feel precious.",
        "quote": "The smallest person brought the biggest joy.",
    },
    "family-memories": {
        "chapter": "becoming-a-family", "category": "Family", "location": "Together as three",
        "people": ["Wasiatus", "Nahuel", "Rayden"], "titles": ["Now we are three", "Our family in one frame", "The picture that says everything"],
        "summary": "Three faces, one growing story, and a memory that already feels like a keepsake.",
        "story": "A family is built through thousands of small acts of care. This photograph gathers those invisible moments into one frame: the three of us, learning and growing together.",
        "quote": "This is us—imperfect, growing, and full of love.",
    },
    "family-adventures": {
        "chapter": "life-in-japan", "category": "Family adventures", "location": "Japan · out in the world together",
        "people": ["Wasiatus", "Nahuel", "Rayden"], "titles": ["Three hearts, one adventure", "Showing you our world", "A family day out", "Wherever the three of us go", "A new view together"],
        "summary": "A simple outing became another page in the life our family is building together.",
        "story": "The world looks new when we experience it as a family. Even a small outing becomes a memory because Rayden is discovering it and you are there beside us.",
        "quote": "Home came with us wherever the three of us went.",
    },
    "home-together": {
        "chapter": "future-dreams", "category": "Home together", "location": "Home",
        "people": ["Wasiatus", "Nahuel", "Rayden"], "titles": ["Home was all of us", "The peace we built", "Close, safe, together"],
        "summary": "The quietest family moments are sometimes the clearest picture of everything we hoped for.",
        "story": "This is the peaceful life I want to keep building with you: a home where we listen, trust, mature, forgive, and wake up ready to care for one another again.",
        "quote": "Peace is not a place. It is the life we protect together.",
    },
    "growing-together": {
        "chapter": "future-dreams", "category": "Growing together", "location": "Today",
        "people": ["Wasiatus", "Nahuel", "Rayden"], "titles": ["Look how far we have come", "Growing beside you", "The newest chapter", "Today, together"],
        "summary": "The baby in our arms is growing, and so are we—still learning how to be a family together.",
        "story": "These recent photographs remind me that time is moving quickly. I want to notice it, to be present for it, and to keep choosing a mature and peaceful life with you through every new stage.",
        "quote": "The future is already arriving in the person Rayden is becoming.",
    },
    "celebrations": {
        "chapter": "future-dreams", "category": "Celebrations", "location": "A day worth celebrating",
        "people": ["Wasiatus", "Nahuel", "Rayden"], "titles": ["A little candle, a lot of love", "Another reason to celebrate", "Make a wish with us"],
        "summary": "A candle, a family, and another small reason to be grateful for this life.",
        "story": "Birthdays matter because the people around the candle matter. I hope our years ahead hold many more wishes, many more photographs, and many peaceful celebrations together.",
        "quote": "May every new year find us still choosing joy together.",
    },
}


def slugify(value: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def memory_id(record: dict) -> str:
    if record["review_id"] in CANONICAL_IDS:
        return CANONICAL_IDS[record["review_id"]]
    return f"{slugify(record['story_role'])}-{record['review_id'].lower()}"


def build_memory(record: dict, role_index: int) -> dict:
    details = ROLE_DETAILS[record["story_role"]]
    item_id = memory_id(record)
    chapter_id = details["chapter"]
    _eyebrow, mood = CHAPTER_DETAILS[chapter_id]
    title = details["titles"][role_index % len(details["titles"])]
    tier = record["tier"]
    tags = [record["story_role"].replace("-", " "), tier]
    story = details["story"] if tier == "core" else "A real moment from the family story we keep building together."
    return {
        "id": item_id,
        "chapterId": chapter_id,
        "eyebrow": "Our story",
        "title": title,
        "date": (record.get("captured_at") or "Date unknown")[:10],
        "location": details["location"],
        "people": details["people"],
        "category": details["category"],
        "tags": tags,
        "summary": details["summary"],
        "story": [story],
        "mood": mood,
        "favorite": tier == "core",
        "quote": details["quote"],
    }


def main() -> int:
    shortlist = json.loads(SHORTLIST.read_text(encoding="utf-8"))
    records = shortlist["records"]
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    role_counts: dict[str, int] = defaultdict(int)
    metadata: dict[str, dict[str, str]] = {}
    memories: list[dict] = []

    for record in records:
        item_id = memory_id(record)
        source = ROOT / record["path"]
        extension = ".jpg" if record.get("status") == "recovered-truncated" else source.suffix.lower()
        destination = SOURCE_DIR / f"{item_id}{extension}"
        if record.get("status") == "recovered-truncated":
            # Repair only the approved working copy so the public optimizer can
            # decode it reliably. The original inbox photograph is untouched.
            with Image.open(source) as opened:
                repaired = ImageOps.exif_transpose(opened).convert("RGB")
                repaired.save(destination, format="JPEG", quality=95, optimize=True)
        else:
            shutil.copy2(source, destination)

        role = record["story_role"]
        memory = build_memory(record, role_counts[role])
        role_counts[role] += 1
        memories.append(memory)

        people = memory["people"]
        if people == ["Wasiatus"]:
            subject = "Wasiatus"
        elif people == ["Rayden"]:
            subject = "Rayden"
        else:
            subject = " and ".join(people)
        metadata[item_id] = {
            "alt": f"{subject} in a family photograph from {memory['date']}"
        }

    memories.sort(key=lambda item: (item["date"], item["id"]))
    METADATA.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    MEMORIES.write_text(json.dumps(memories, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "copied_sources": len(records),
        "core_memories": sum(record["tier"] == "core" for record in records),
        "gallery_memories": sum(record["tier"] == "gallery" for record in records),
        "canonical_chapter_photos": CANONICAL_IDS,
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
