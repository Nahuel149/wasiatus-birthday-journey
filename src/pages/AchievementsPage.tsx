import { BookOpen, Film, Heart, Images, LockKeyhole, MapPinned, Music2, Sparkles, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { HIDDEN_HEART_COUNT, useProgress } from "../progress";
import type { AchievementStatus } from "../types";

const icons = {
  spark: Sparkles,
  heart: Heart,
  book: BookOpen,
  star: Star,
  map: MapPinned,
  film: Film,
  gallery: Images,
  music: Music2,
};

function AchievementCard({ achievement, index }: { achievement: AchievementStatus; index: number }) {
  const Icon = icons[achievement.icon];
  const percent = Math.min(100, Math.round((achievement.current / achievement.target) * 100));
  return (
    <motion.article
      className={`achievement-card ${achievement.unlocked ? "is-unlocked" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * .06, duration: .5 }}
    >
      <div className="achievement-card__seal">
        {achievement.unlocked ? <Icon size={23} fill={achievement.icon === "heart" ? "currentColor" : "none"} /> : <LockKeyhole size={19} />}
      </div>
      <p className="eyebrow">{achievement.unlocked ? "Unlocked" : `${achievement.current} / ${achievement.target}`}</p>
      <h2>{achievement.title}</h2>
      <p>{achievement.unlocked ? achievement.unlockedCopy : achievement.description}</p>
      <div className="achievement-card__progress" aria-label={`${percent}% complete`}><span style={{ width: `${percent}%` }} /></div>
      {achievement.unlocked && <span className="achievement-card__stamp">kept</span>}
    </motion.article>
  );
}

export function AchievementsPage() {
  const { achievements, unlockedAchievementCount, foundHearts } = useProgress();
  const allUnlocked = unlockedAchievementCount === achievements.length;

  return (
    <div className="achievements-page">
      <header className="page-intro page-intro--split">
        <div><p className="eyebrow">Small treasures along the way</p><h1>Our keepsake cabinet</h1></div>
        <p>Nothing here blocks the story. These are simply little traces of where you wandered, what you opened, and the love you noticed.</p>
      </header>

      <section className="keepsake-summary">
        <div className="keepsake-summary__trophy"><Trophy size={27} /></div>
        <div><strong>{unlockedAchievementCount}</strong><span>of {achievements.length} keepsakes</span></div>
        <div><strong>{foundHearts.size}</strong><span>of {HIDDEN_HEART_COUNT} hidden hearts</span></div>
        <p>{allUnlocked ? "You found every little treasure we left for you." : "The loveliest discoveries are never rushed."}</p>
      </section>

      <div className="achievements-grid">
        {achievements.map((achievement, index) => <AchievementCard key={achievement.id} achievement={achievement} index={index} />)}
      </div>

      <aside className="treasure-hint">
        <Heart size={18} fill="currentColor" />
        <p><strong>A tiny hint:</strong> the six hidden hearts live inside the six journey chapters. They are subtle, but every one is keyboard accessible.</p>
      </aside>
    </div>
  );
}
