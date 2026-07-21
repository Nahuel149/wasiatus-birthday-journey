import { Check, Feather, Flower2, Frame, Heart, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import letter from "../content/letter.json";
import { useProgress } from "../progress";

const designs = [
  { id: "ivory", name: "Keepsake Ivory", note: "Warm, timeless & golden" },
  { id: "blush", name: "Sakura Blush", note: "Romantic rose & wine" },
  { id: "sage", name: "Quiet Sage", note: "Soft, natural & calm" },
] as const;

const ornaments = [
  { id: "frame", name: "Fine Frame", Icon: Frame },
  { id: "floral", name: "Floral Flourish", Icon: Flower2 },
  { id: "minimal", name: "Pure Type", Icon: Feather },
] as const;

type Design = typeof designs[number]["id"];
type Ornament = typeof ornaments[number]["id"];
type PaperSize = "A4" | "Letter";

export function LetterPage() {
  const { recordActivity } = useProgress();
  const [design, setDesign] = useState<Design>("ivory");
  const [ornament, setOrnament] = useState<Ornament>("frame");
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [showGuidance, setShowGuidance] = useState(false);
  const [includeDedication, setIncludeDedication] = useState(true);

  useEffect(() => recordActivity("letter-read"), [recordActivity]);

  const printLetter = () => {
    recordActivity("letter-printed");
    window.print();
  };

  return (
    <div className="letter-page">
      <style media="print">{`@page { size: ${paperSize}; margin: 14mm; }`}</style>
      <header className="page-intro">
        <p className="eyebrow">Only for you</p>
        <h1>A letter to my wife</h1>
        <p>Choose its keepsake style, then print it or save it as a PDF.</p>
      </header>

      <aside className="letter-customizer" aria-label="Printable letter options">
        <div className="letter-customizer__intro">
          <span><Printer size={18} /></span>
          <div><p className="eyebrow">Print studio</p><h2>Make it feel like yours</h2></div>
          <p>These choices change the preview and printed page. Your browser’s print window also lets you save a PDF.</p>
        </div>

        <fieldset>
          <legend>Paper design</legend>
          <div className="letter-options letter-options--designs">
            {designs.map((option) => (
              <label key={option.id} className={`letter-design-option letter-design-option--${option.id} ${design === option.id ? "is-selected" : ""}`}>
                <input type="radio" name="letter-design" value={option.id} checked={design === option.id} onChange={() => setDesign(option.id)} />
                <span className="letter-design-option__swatch"><i /><i /></span>
                <span><strong>{option.name}</strong><small>{option.note}</small></span>
                {design === option.id && <Check size={16} aria-hidden="true" />}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="letter-customizer__row">
          <fieldset>
            <legend>Decoration</legend>
            <div className="letter-options letter-options--compact">
              {ornaments.map(({ id, name, Icon }) => (
                <label key={id} className={ornament === id ? "is-selected" : ""}>
                  <input type="radio" name="letter-ornament" value={id} checked={ornament === id} onChange={() => setOrnament(id)} />
                  <Icon size={16} /><span>{name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Paper size</legend>
            <div className="letter-options letter-options--compact">
              {(["A4", "Letter"] as const).map((size) => (
                <label key={size} className={paperSize === size ? "is-selected" : ""}>
                  <input type="radio" name="paper-size" value={size} checked={paperSize === size} onChange={() => setPaperSize(size)} />
                  <span>{size === "Letter" ? "US Letter" : "A4"}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="letter-customizer__footer">
          <div className="letter-toggles">
            <label><input type="checkbox" checked={showGuidance} onChange={(event) => setShowGuidance(event.target.checked)} /><span>Show draft-writing guidance</span></label>
            <label><input type="checkbox" checked={includeDedication} onChange={(event) => setIncludeDedication(event.target.checked)} /><span>Include family dedication</span></label>
          </div>
          <button className="letter-print-button" onClick={printLetter}><Printer size={17} /> Print or Save as PDF</button>
        </div>
      </aside>

      <p className="letter-preview-label" aria-live="polite">Previewing {designs.find((item) => item.id === design)?.name}, {ornaments.find((item) => item.id === ornament)?.name}, {paperSize === "Letter" ? "US Letter" : "A4"}</p>

      <motion.article
        className={`letter-paper letter-paper--${design} letter-paper--${ornament}`}
        data-paper-size={paperSize}
        initial={{ opacity: 0, y: 26, rotate: -0.4 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="letter-paper__number" aria-hidden="true" />
        <Heart className="letter-paper__heart" size={18} fill="currentColor" aria-hidden="true" />
        <p className="letter-salutation">{letter.salutation}</p>

        {letter.paragraphs.map((paragraph, index) => (
          paragraph.kind === "guidance"
            ? showGuidance && <p className="letter-placeholder" key={index}>{paragraph.text}</p>
            : <p key={index}>{paragraph.text}</p>
        ))}

        <p className="letter-closing">{letter.closing}</p>
        <p className="letter-signature">{letter.signature}</p>
        {includeDedication && <small>{letter.dedication}</small>}
      </motion.article>
    </div>
  );
}
