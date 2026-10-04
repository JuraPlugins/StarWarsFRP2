import React from 'react';
import { Shield, Volume2, VolumeX, Dices, Moon, RefreshCw, Users, ShoppingCart, User, Download, Upload } from 'lucide-react';
import { Character } from '../types/character';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  characters: Character[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onOpenDiceRoller: () => void;
  onOpenRestModal: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  characters,
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  onOpenDiceRoller,
  onOpenRestModal,
  onResetData,
  onExportData,
  onImportData,
}) => {
  return (
    <header className="terminal-header">
      {/* Top Bar with Imperial Crest and Status */}
      <div className="header-top-bar">
        <div className="imperial-brand">
          <div className="imperial-crest-icon">
            <svg viewBox="0 0 100 100" className="crest-svg" fill="currentColor">
              {/* Stylized Imperial Crest */}
              <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4" fill="none" />
              <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M50 4 L50 24 M50 76 L50 96 M4 50 L24 50 M76 50 L96 50" stroke="currentColor" strokeWidth="4" />
              <path d="M17 17 L31 31 M69 69 L83 83 M17 83 L31 69 M69 31 L83 17" stroke="currentColor" strokeWidth="4" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="terminal-code">GALACTIC IMPERIAL SECTOR // ISB-TAC-99</span>
            <h1 className="unit-title">İMPARATORLUK ÖZEL GÖREV GÜCÜ: VORN TİMİ</h1>
            <span className="unit-subtitle">SW5e Taktik Operasyon & Karakter Yönetim Konsolu</span>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="header-quick-tools">
          <button
            className="tool-btn sound-toggle"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              sounds.enabled = !soundEnabled;
              if (!soundEnabled) sounds.playClick();
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>{soundEnabled ? 'SES AÇIK' : 'SES KAPALI'}</span>
          </button>

          <button
            className="tool-btn dice-btn"
            onClick={() => {
              sounds.playDiceRoll();
              onOpenDiceRoller();
            }}
            title="Sanal Zar Masasını Aç"
          >
            <Dices size={18} />
            <span>ZAR MASASI</span>
          </button>

          <button
            className="tool-btn rest-btn"
            onClick={() => {
              sounds.playTech();
              onOpenRestModal();
            }}
            title="Kısa veya Uzun Mola Ver"
          >
            <Moon size={18} />
            <span>MOLA / DİNLENME</span>
          </button>

          <button
            className="tool-btn export-btn"
            onClick={onExportData}
            title="Karakter Verilerini JSON Olarak İndir"
          >
            <Download size={16} />
            <span>DIŞA AKTAR</span>
          </button>

          <label className="tool-btn import-btn" title="Karakter Dosyası Yükle (JSON)">
            <Upload size={16} />
            <span>İÇE AKTAR</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={onImportData}
            />
          </label>

          <button
            className="tool-btn reset-btn"
            onClick={() => {
              if (window.confirm('Tüm karakterler ve veriler başlangıçtaki PDF ayarlarına sıfırlansın mı?')) {
                sounds.playTech();
                onResetData();
              }
            }}
            title="Başlangıç Dosyalarına Sıfırla"
          >
            <RefreshCw size={16} />
            <span>SIFIRLA</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="header-nav">
        <div className="nav-group operatives-group">
          {characters.map((char) => {
            const isActive = activeTab === char.id;
            return (
              <button
                key={char.id}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(char.id);
                }}
              >
                <div className="tab-indicator"></div>
                <User size={16} className="tab-icon" />
                <div className="tab-content">
                  <span className="tab-dossier">{char.dossierNumber}</span>
                  <strong className="tab-name">{char.name}</strong>
                  <span className="tab-meta">{char.class} (Lv {char.level})</span>
                </div>
                <div className="tab-hp-badge" title="Can Puanı">
                  {char.currentHp}/{char.maxHp} HP
                </div>
              </button>
            );
          })}
        </div>

        <div className="nav-group tools-group">
          <button
            className={`nav-tab-btn auxiliary-tab ${activeTab === 'tactical-overview' ? 'active' : ''}`}
            onClick={() => {
              sounds.playClick();
              setActiveTab('tactical-overview');
            }}
          >
            <Users size={16} className="tab-icon" />
            <div className="tab-content">
              <span className="tab-dossier">SİNERJİ & TAKTİK</span>
              <strong className="tab-name">Tim Konsolu</strong>
              <span className="tab-meta">4 Operatif Durumu</span>
            </div>
          </button>

          <button
            className={`nav-tab-btn auxiliary-tab ${activeTab === 'armory-store' ? 'active' : ''}`}
            onClick={() => {
              sounds.playClick();
              setActiveTab('armory-store');
            }}
          >
            <ShoppingCart size={16} className="tab-icon" />
            <div className="tab-content">
              <span className="tab-dossier">SW5e CEPHANELİK</span>
              <strong className="tab-name">Silah & Market</strong>
              <span className="tab-meta">İtem Al & Kuşan</span>
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
};
