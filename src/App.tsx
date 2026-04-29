import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { AppView, GameSettings, PlayerColor } from './types';
import { DEFAULT_SETTINGS } from './types';
import BackgroundDecor from './components/BackgroundDecor';
import HeaderHUD from './components/HeaderHUD';
import LandingView from './components/views/LandingView';
import ColorSelectionView from './components/views/ColorSelectionView';
import HowToPlayView from './components/views/HowToPlayView';
import ShowCardsView from './components/views/ShowCardsView';
import DeckBuilderView from './components/views/DeckBuilderView';
import SettingsView from './components/views/SettingsView';
import ArenaView from './components/ArenaView';
import { loadPlayerDeckIds } from './game/deckStorage';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  // remount key for ArenaView so a fresh game starts each entry
  const [arenaKey, setArenaKey] = useState(0);

  const goLanding = () => setView('landing');

  const enterArena = (color: PlayerColor) => {
    setSettings((s) => ({ ...s, playerColor: color }));
    setArenaKey((k) => k + 1);
    setView('arena');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e0e0e0] flex flex-col font-sans overflow-hidden selection:bg-cyan-500 selection:text-black">
      <BackgroundDecor />

      <HeaderHUD
        view={view}
        onLogoClick={goLanding}
        color={settings.playerColor}
      />

      <main className="flex-1 z-10 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex-1 flex flex-col">
              <LandingView onNavigate={setView} onExit={() => window.close()} />
            </motion.div>
          )}
          {view === 'colorSelection' && (
            <motion.div key="color" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="flex-1 flex flex-col">
              <ColorSelectionView onChoose={enterArena} onBack={goLanding} />
            </motion.div>
          )}
          {view === 'howToPlay' && (
            <motion.div key="how" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <HowToPlayView onBack={goLanding} />
            </motion.div>
          )}
          {view === 'showCards' && (
            <motion.div key="show" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <ShowCardsView onBack={goLanding} />
            </motion.div>
          )}
          {view === 'deckBuilder' && (
            <motion.div key="deck" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <DeckBuilderView onBack={goLanding} />
            </motion.div>
          )}
          {view === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <SettingsView settings={settings} onChange={setSettings} onBack={goLanding} />
            </motion.div>
          )}
          {view === 'arena' && (
            <motion.div key={`arena-${arenaKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <ArenaView color={settings.playerColor} aiLevel={settings.aiLevel} playerDeckIds={loadPlayerDeckIds()} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
