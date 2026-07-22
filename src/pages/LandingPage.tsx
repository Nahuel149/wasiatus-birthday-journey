import { ArrowDown, Heart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { AmbientEffects } from "../components/AmbientEffects";

const ease = [0.22, 1, 0.36, 1] as const;

export function LandingPage() {
  const reducedMotion = useReducedMotion();
  const reveal = (delay: number) => ({
    initial: reducedMotion ? {} : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <section className="landing">
      <AmbientEffects />
      <div className="landing__frame" aria-hidden="true" />
      <motion.div className="landing__monogram" {...reveal(0.1)}>
        <Heart size={14} fill="currentColor" />
        <span>NaWaRay</span>
      </motion.div>

      <div className="landing__content">
        <motion.p className="eyebrow" {...reveal(0.15)}>
          A birthday letter in six chapters
        </motion.p>
        <motion.h1 {...reveal(0.28)}>
          Happy <em>35th</em>
          <span>Birthday</span>
        </motion.h1>
        <motion.div className="landing__dedication" {...reveal(0.42)}>
          <span />
          <p>To my beautiful wife, <strong>Wasiatus Sadiyah</strong></p>
          <span />
        </motion.div>
        <motion.p className="landing__subtitle" {...reveal(0.54)}>
          This is the story of us.
        </motion.p>
        <motion.div
          initial={reducedMotion ? {} : { y: 24 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, delay: 0.68, ease }}
        >
          <Link to="/journey" className="primary-cta">
            <span>Begin our journey</span>
            <ArrowDown size={18} />
          </Link>
        </motion.div>
      </div>

      <motion.p className="landing__signature" {...reveal(0.9)}>
        From Nahuel, with all my love.
      </motion.p>
    </section>
  );
}
