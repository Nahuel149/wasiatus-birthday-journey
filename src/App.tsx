import { AnimatePresence } from "framer-motion";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Shell } from "./components/Shell";
import { AudioProvider } from "./audio";
import { ProgressProvider } from "./progress";
import { FinalePage } from "./pages/FinalePage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { GalleryPage } from "./pages/GalleryPage";
import { JourneyPage } from "./pages/JourneyPage";
import { LandingPage } from "./pages/LandingPage";
import { LetterPage } from "./pages/LetterPage";
import { MemoryPage } from "./pages/MemoryPage";
import { PlacesPage } from "./pages/PlacesPage";
import { ReasonsPage } from "./pages/ReasonsPage";
import { SlideshowPage } from "./pages/SlideshowPage";
import { TimelinePage } from "./pages/TimelinePage";
import { MusicPage } from "./pages/MusicPage";
import { VideoGalleryPage } from "./pages/VideoGalleryPage";

function AppRoutes() {
  const location = useLocation();
  return (
    <Shell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/journey" element={<JourneyPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/memories/:id" element={<MemoryPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/cinema" element={<SlideshowPage />} />
          <Route path="/films" element={<VideoGalleryPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/treasures" element={<AchievementsPage />} />
          <Route path="/letter" element={<LetterPage />} />
          <Route path="/reasons" element={<ReasonsPage />} />
          <Route path="/finale" element={<FinalePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Shell>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ProgressProvider>
        <AudioProvider>
          <AppRoutes />
        </AudioProvider>
      </ProgressProvider>
    </HashRouter>
  );
}
