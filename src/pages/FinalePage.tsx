import { ArrowLeft, Gift, Heart, LockKeyhole, PartyPopper, RotateCcw, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { AmbientEffects } from "../components/AmbientEffects";
import { useProgress } from "../progress";

const confetti = Array.from({ length: 26 }, (_, index) => ({
  x: `${7 + ((index * 37) % 88)}%`,
  delay: (index % 9) * 0.08,
  rotate: (index * 47) % 180,
  color: ["#c8a45d", "#b96b78", "#f4d6dc", "#fff8e8"][index % 4],
}));

export function FinalePage() {
  const { journeyComplete, progressPercent, resetProgress } = useProgress();
  const reducedMotion = useReducedMotion();

  if (!journeyComplete) {
    return (
      <div className="locked-page">
        <div className="locked-page__seal"><LockKeyhole size={26} /></div>
        <p className="eyebrow">The final envelope</p>
        <h1>One surprise is still sealed.</h1>
        <p>Explore every chapter of the journey and this final page will open for you.</p>
        <div className="locked-progress"><span style={{ width: `${progressPercent}%` }} /></div>
        <strong>{progressPercent}% of the story visited</strong>
        <Link to="/journey" className="primary-cta"><ArrowLeft size={18} /> Return to our journey</Link>
      </div>
    );
  }

  return (
    <section className="finale">
      <AmbientEffects />
      {!reducedMotion && (
        <div className="confetti" aria-hidden="true">
          {confetti.map((piece, index) => (
            <motion.i
              key={index}
              style={{ left: piece.x, background: piece.color }}
              initial={{ y: -40, opacity: 0, rotate: piece.rotate }}
              animate={{ y: "105vh", opacity: [0, 1, 1, 0], rotate: piece.rotate + 540 }}
              transition={{ duration: 4.5 + (index % 4), delay: piece.delay, ease: "linear" }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="finale__content"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="finale__icon"><PartyPopper size={24} /></div>
        <p className="eyebrow"><Sparkles size={14} /> One more thing</p>
        <h1>Happy 35th Birthday,<br /><em>My Boobie.</em></h1>
        <div className="finale__rule"><span /><Heart size={17} fill="currentColor" /><span /></div>
        <p>Thank you for choosing me every day.</p>
        <p>I love you forever. ❤️</p>
        <p className="finale__signature">Love, Nahuel</p>
        <small>And Rayden—our favorite chapter of all.</small>
        <button className="finale__replay" onClick={resetProgress}><RotateCcw size={15} /> Seal the surprise and replay</button>
      </motion.div>
      <Gift className="finale__gift" size={18} />
    </section>
  );
}
