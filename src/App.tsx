import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CharacterSheet } from './components/CharacterSheet';
import { TacticalOverview } from './components/TacticalOverview';
import { ArmoryMarket } from './components/ArmoryMarket';
import { DiceRollerModal } from './components/DiceRollerModal';
import { RestModal } from './components/RestModal';
import { LevelUpModal } from './components/LevelUpModal';
import { INITIAL_CHARACTERS } from './data/initialCharacters';
import { Character } from './types/character';
import { DiceRollResult } from './utils/dice';
import { sounds } from './utils/soundEffects';

const STORAGE_KEY = 'sw5e_vorn_characters_v1';
const SOUND_KEY = 'sw5e_sound_enabled';

export const App: React.FC = () => {
  // Load characters from localStorage or default
  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_CHARACTERS;
  });

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('darius-venn');

  // Modals
  const [isDiceModalOpen, setIsDiceModalOpen] = useState<boolean>(false);
  const [isRestModalOpen, setIsRestModalOpen] = useState<boolean>(false);
  const [levelUpChar, setLevelUpChar] = useState<Character | null>(null);

  // Dice Rolls History
  const [rollHistory, setRollHistory] = useState<DiceRollResult[]>([]);

  // Persist characters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [characters]);

  // Persist sound
  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, JSON.stringify(soundEnabled));
      sounds.enabled = soundEnabled;
    } catch (e) {
      console.error(e);
    }
  }, [soundEnabled]);

  const handleUpdateCharacter = (updated: Character) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleUpdateAllCharacters = (updatedList: Character[]) => {
    setCharacters(updatedList);
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCharacters(INITIAL_CHARACTERS);
    setRollHistory([]);
    setActiveTab('darius-venn');
    sounds.playTech();
  };

  const handleExportData = () => {
    sounds.playTech();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(characters, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vorn_timi_yedek_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCharacters(parsed);
          sounds.playLevelUp();
          alert('Vorn Timi karakter dosyası başarıyla yüklendi!');
        } else {
          alert('Geçersiz dosya formatı.');
        }
      } catch {
        alert('JSON dosyası okunurken hata oluştu.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddRollResult = (res: DiceRollResult) => {
    setRollHistory((prev) => [res, ...prev.slice(0, 49)]); // keep last 50
  };

  const activeCharacter = characters.find((c) => c.id === activeTab);

  return (
    <div className="terminal-app-wrapper">
      {/* Background Ambience and Scanlines */}
      <div className="scanline-overlay"></div>
      <div className="vignette-overlay"></div>

      {/* Main Header */}
      <Header
        characters={characters}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenDiceRoller={() => setIsDiceModalOpen(true)}
        onOpenRestModal={() => setIsRestModalOpen(true)}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Content Area */}
      <main className="main-content-viewport">
        {activeTab === 'tactical-overview' ? (
          <TacticalOverview
            characters={characters}
            onSelectCharacter={(charId) => setActiveTab(charId)}
            onUpdateCharacter={handleUpdateCharacter}
            onOpenDiceRoller={() => setIsDiceModalOpen(true)}
          />
        ) : activeTab === 'armory-store' ? (
          <ArmoryMarket
            characters={characters}
            onUpdateCharacter={handleUpdateCharacter}
            onOpenDiceRoller={() => setIsDiceModalOpen(true)}
          />
        ) : activeCharacter ? (
          <CharacterSheet
            key={activeCharacter.id}
            character={activeCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onOpenLevelUp={() => setLevelUpChar(activeCharacter)}
            onAddRollResult={handleAddRollResult}
            onOpenDiceModal={() => setIsDiceModalOpen(true)}
            onOpenArmory={() => setActiveTab('armory-store')}
          />
        ) : (
          <div className="error-fallback">Operatif bulunamadı.</div>
        )}
      </main>

      {/* Dice Roller Modal */}
      <DiceRollerModal
        isOpen={isDiceModalOpen}
        onClose={() => setIsDiceModalOpen(false)}
        activeCharacterName={activeCharacter ? activeCharacter.name : 'Vorn Timi'}
        rollHistory={rollHistory}
        onAddRoll={handleAddRollResult}
        onClearHistory={() => setRollHistory([])}
      />

      {/* Short & Long Rest Modal */}
      <RestModal
        isOpen={isRestModalOpen}
        onClose={() => setIsRestModalOpen(false)}
        characters={characters}
        activeCharId={activeCharacter ? activeCharacter.id : characters[0].id}
        onUpdateCharacter={handleUpdateCharacter}
        onUpdateAllCharacters={handleUpdateAllCharacters}
      />

      {/* Level Up Wizard Modal */}
      {levelUpChar && (
        <LevelUpModal
          isOpen={true}
          onClose={() => setLevelUpChar(null)}
          character={levelUpChar}
          onCompleteLevelUp={(updated) => {
            handleUpdateCharacter(updated);
            setLevelUpChar(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
