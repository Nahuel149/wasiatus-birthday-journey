import { motion, useReducedMotion } from "framer-motion";

const motes = [
  { left: "9%", top: "24%", delay: 0, size: 4 },
  { left: "18%", top: "72%", delay: 1.2, size: 7 },
  { left: "32%", top: "15%", delay: 2.4, size: 3 },
  { left: "54%", top: "80%", delay: 0.7, size: 5 },
  { left: "72%", top: "18%", delay: 1.8, size: 6 },
  { left: "88%", top: "62%", delay: 2.9, size: 4 },
];

export function AmbientEffects() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient__orb ambient__orb--one" />
      <div className="ambient__orb ambient__orb--two" />
      {!reducedMotion &&
        motes.map((mote, index) => (
          <motion.span
            className="ambient__mote"
            key={index}
            style={{ left: mote.left, top: mote.top, width: mote.size, height: mote.size }}
            animate={{ y: [0, -18, 0], opacity: [0.18, 0.7, 0.18] }}
            transition={{ duration: 5 + index * 0.7, repeat: Infinity, delay: mote.delay }}
          />
        ))}
    </div>
  );
}
