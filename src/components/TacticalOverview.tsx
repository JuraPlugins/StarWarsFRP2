import React, { useState } from 'react';
import { Users, Shield, Zap, Target, Crosshair, Award, Heart, Dices, ChevronRight, AlertCircle, Bot } from 'lucide-react';
import { Character } from '../types/character';
import { sounds } from '../utils/soundEffects';
import { rollD20 } from '../utils/dice';

interface TacticalOverviewProps {
  characters: Character[];
  onSelectCharacter: (charId: string) => void;
  onUpdateCharacter: (char: Character) => void;
  onOpenDiceRoller: () => void;
}

interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  isEnemy?: boolean;
}

export const TacticalOverview: React.FC<TacticalOverviewProps> = ({
  characters,
  onSelectCharacter,
  onUpdateCharacter,
}) => {
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(0);
  const [combatants, setCombatants] = useState<Combatant[]>(() =>
    characters.map((c) => ({
      id: c.id,
      name: c.name,
      initiative: c.initiative + 10,
      hp: c.currentHp,
      maxHp: c.maxHp,
      ac: c.armorClass,
      isEnemy: false,
    }))
  );

  const [enemyName, setEnemyName] = useState('');
  const [enemyHp, setEnemyHp] = useState(20);
  const [enemyAc, setEnemyAc] = useState(13);
  const [enemyInit, setEnemyInit] = useState(10);

  const handleRollAllInitiative = () => {
    sounds.playDiceRoll();
    const updated = combatants.map((comb) => {
      const char = characters.find((c) => c.id === comb.id);
      const initMod = char ? char.initiative : 0;
      const roll = rollD20('İnisiyatif Zarı', comb.name, initMod);
      return {
        ...comb,
        initiative: roll.total,
      };
    });

    updated.sort((a, b) => b.initiative - a.initiative);
    setCombatants(updated);
    setActiveTurnIndex(0);
    setCurrentRound(1);
  };

  const handleNextTurn = () => {
    sounds.playClick();
    if (activeTurnIndex + 1 >= combatants.length) {
      setActiveTurnIndex(0);
      setCurrentRound((r) => r + 1);
    } else {
      setActiveTurnIndex((i) => i + 1);
    }
  };

  const handleAddEnemy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enemyName.trim()) return;

    sounds.playTech();
    const newEnemy: Combatant = {
      id: 'enemy-' + Date.now(),
      name: enemyName,
      initiative: enemyInit,
      hp: enemyHp,
      maxHp: enemyHp,
      ac: enemyAc,
      isEnemy: true,
    };

    const newCombatants = [...combatants, newEnemy].sort((a, b) => b.initiative - a.initiative);
    setCombatants(newCombatants);
    setEnemyName('');
  };

  const handleRemoveCombatant = (id: string) => {
    sounds.playClick();
    setCombatants((prev) => prev.filter((c) => c.id !== id));
  };

  const handleQuickDamage = (char: Character, delta: number) => {
    sounds.playClick();
    const newHp = Math.max(0, Math.min(char.maxHp, char.currentHp + delta));
    onUpdateCharacter({
      ...char,
      currentHp: newHp,
    });
  };

  return (
    <div className="tactical-overview-view">
      {/* Top Banner */}
      <div className="tactical-banner">
        <div className="banner-left">
          <span className="terminal-badge">OPERASYONEL KONSOL // SEKTÖR 7</span>
          <h2 className="tactical-title">TİM DURUMU & TAKTİK DOKTRİNİ</h2>
          <p className="tactical-subtitle">
            İmparatorluk Vorn Timi: Öncü Hücum, Keskin Nişancı Keşfi ve Slicing Entegrasyonu.
          </p>
        </div>

        {/* Global Team Stats */}
        <div className="team-stats-strip">
          <div className="team-stat-box">
            <span className="stat-label">Toplam Tim Sağlığı</span>
            <strong className="stat-val text-green">
              {characters.reduce((sum, c) => sum + c.currentHp, 0)} /{' '}
              {characters.reduce((sum, c) => sum + c.maxHp, 0)} HP
            </strong>
          </div>
          <div className="team-stat-box">
            <span className="stat-label">Ortak Fon</span>
            <strong className="stat-val text-amber">
              {characters.reduce((sum, c) => sum + c.credits, 0).toLocaleString('tr-TR')} ¢
            </strong>
          </div>
          <div className="team-stat-box">
            <span className="stat-label">Operatif Sayısı</span>
            <strong className="stat-val text-cyan">4 Birim + 1 Droid</strong>
          </div>
        </div>
      </div>

      {/* Operative Cards Row */}
      <div className="tactical-cards-grid">
        {characters.map((char) => {
          const hpPercent = Math.max(0, Math.min(100, (char.currentHp / char.maxHp) * 100));
          return (
            <div key={char.id} className="operative-overview-card">
              <div className="card-top">
                <div className="card-identity">
                  <span className="dossier-tag">{char.dossierNumber}</span>
                  <h3 className="op-name">{char.name}</h3>
                  <span className="op-role">{char.role}</span>
                </div>
                <div className="card-level-badge">Lv {char.level}</div>
              </div>

              {/* Health Bar */}
              <div className="op-health-section">
                <div className="health-labels">
                  <span>Can Puanı (HP)</span>
                  <strong>
                    {char.currentHp} / {char.maxHp}
                    {char.tempHp > 0 && <span className="text-cyan"> (+{char.tempHp})</span>}
                  </strong>
                </div>
                <div className="health-progress-bar">
                  <div
                    className={`health-fill ${hpPercent < 30 ? 'critical' : hpPercent < 60 ? 'warning' : 'healthy'}`}
                    style={{ width: `${hpPercent}%` }}
                  ></div>
                </div>
                <div className="quick-hp-adjusters">
                  <button className="hp-adj-btn" onClick={() => handleQuickDamage(char, -5)}>
                    -5
                  </button>
                  <button className="hp-adj-btn" onClick={() => handleQuickDamage(char, -1)}>
                    -1
                  </button>
                  <button className="hp-adj-btn heal" onClick={() => handleQuickDamage(char, +1)}>
                    +1
                  </button>
                  <button className="hp-adj-btn heal" onClick={() => handleQuickDamage(char, +5)}>
                    +5
                  </button>
                </div>
              </div>

              {/* Combat Metrics */}
              <div className="metrics-grid">
                <div className="metric-box">
                  <span className="metric-lbl">AC</span>
                  <strong className="metric-num">{char.armorClass}</strong>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">İnisiyatif</span>
                  <strong className="metric-num">+{char.initiative}</strong>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">Hız</span>
                  <strong className="metric-num">{char.speed} ft</strong>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">Pasif Algı</span>
                  <strong className="metric-num">{char.passivePerception}</strong>
                </div>
              </div>

              {/* Class Specific Highlights */}
              <div className="op-special-badge">
                {char.superiorityDice && (
                  <span>
                    🎲 <strong>{char.superiorityDice.current}/{char.superiorityDice.max}</strong> Üstünlük Zarı (d8)
                  </span>
                )}
                {char.techcasting && (
                  <span>
                    ⚡ <strong>{char.techcasting.currentTp}/{char.techcasting.maxTp}</strong> Tech Noktası (TP)
                  </span>
                )}
                {char.companionDroid && (
                  <span>
                    🤖 <strong>{char.companionDroid.name}</strong> ({char.companionDroid.hp}/{char.companionDroid.maxHp} HP)
                  </span>
                )}
                {char.id === 'joren-kreel' && (
                  <span>
                    💥 <strong>Baskı Ateşi & Gedik Açıcı</strong> (DC 13)
                  </span>
                )}
              </div>

              {/* Direct Dossier Opener */}
              <button className="btn-open-dossier" onClick={() => onSelectCharacter(char.id)}>
                Karakter Sayfasını Yönet <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Left Turn Order / Initiative Tracker, Right Tactical Doctrine */}
      <div className="tactical-split-row">
        {/* Left: Initiative & Combat Turn Tracker */}
        <div className="tactical-panel turn-tracker-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <Dices className="text-cyan" size={20} />
              <h3 className="panel-title">SAVAŞ İNİSİYATİF SIRASI</h3>
            </div>
            <div className="round-badge">TUR {currentRound}</div>
          </div>

          <div className="combat-actions-bar">
            <button className="btn-init-roll" onClick={handleRollAllInitiative}>
              <Dices size={16} /> Tüm Tim İçin Zar At
            </button>
            <button className="btn-next-turn" onClick={handleNextTurn}>
              Sıradaki Eylem <ChevronRight size={16} />
            </button>
          </div>

          <div className="combatants-list">
            {combatants.map((c, index) => {
              const isCurrentTurn = index === activeTurnIndex;
              return (
                <div
                  key={c.id}
                  className={`combatant-row ${isCurrentTurn ? 'active-turn' : ''} ${c.isEnemy ? 'enemy-row' : ''}`}
                >
                  <div className="turn-indicator">
                    {isCurrentTurn ? <span className="pulse-marker">▶</span> : <span>#{index + 1}</span>}
                  </div>
                  <div className="combatant-info">
                    <strong className="combatant-name">
                      {c.name} {c.isEnemy && <span className="enemy-tag">DÜŞMAN</span>}
                    </strong>
                    <span className="combatant-stats">
                      AC: {c.ac} | HP: {c.hp}/{c.maxHp}
                    </span>
                  </div>
                  <div className="combatant-init-badge">
                    <span>İnisiyatif</span>
                    <strong>{c.initiative}</strong>
                  </div>
                  {c.isEnemy && (
                    <button
                      className="btn-remove-enemy"
                      onClick={() => handleRemoveCombatant(c.id)}
                      title="Listeden Çıkar"
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Add Target / Enemy form */}
          <form onSubmit={handleAddEnemy} className="add-enemy-form">
            <input
              type="text"
              placeholder="Düşman adı (Örn: Asi Askeri)"
              value={enemyName}
              onChange={(e) => setEnemyName(e.target.value)}
              className="enemy-input"
            />
            <input
              type="number"
              placeholder="HP"
              value={enemyHp}
              onChange={(e) => setEnemyHp(Number(e.target.value))}
              className="enemy-num-input"
              title="Can Puanı"
            />
            <input
              type="number"
              placeholder="AC"
              value={enemyAc}
              onChange={(e) => setEnemyAc(Number(e.target.value))}
              className="enemy-num-input"
              title="Zırh Sınıfı"
            />
            <button type="submit" className="btn-add-enemy">
              Ekle
            </button>
          </form>
        </div>

        {/* Right: Team Synergy & Tactical Doctrine from PDF */}
        <div className="tactical-panel doctrine-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <Award className="text-amber" size={20} />
              <h3 className="panel-title">TİM SİNERJİSİ & TAKTİKSEL NOTLAR (DOKTRİN)</h3>
            </div>
            <span className="terminal-code">ISB-TACTICAL-DOC</span>
          </div>

          <div className="synergy-cards-container">
            {/* Vanguard / Öncü Hattı */}
            <div className="synergy-card">
              <div className="synergy-card-header">
                <Target className="text-crimson" size={20} />
                <h4 className="synergy-title">1. ÖNCÜ HATTI (BREACH & HAMMER)</h4>
              </div>
              <p className="synergy-desc">
                <strong>Joren Kreel</strong> doğrudan düşman siperlerine Gedik Yükü yerleştirir ve Baskı Ateşi (Suppression Fire - DEX Save DC 13) açarak düşmanları siperden çıkmaya zorlar.
              </p>
              <div className="synergy-action-tag">
                ⚡ <strong>Darius Venn</strong>, Commander's Strike ile Joren veya Silas'a reaksiyonuyla fazladan anlık saldırı hakkı tanır (+1d8 hasar bonusu eklenir).
              </div>
            </div>

            {/* Scout / Gözcü & Sızma */}
            <div className="synergy-card">
              <div className="synergy-card-header">
                <Crosshair className="text-cyan" size={20} />
                <h4 className="synergy-title">2. GÖZCÜ & SIZMA (OVERWATCH & ASSASSIN)</h4>
              </div>
              <p className="synergy-desc">
                <strong>Silas Dorn</strong>, Scout Probe Remote ile ileriyi 300 ft mesafeden canlı termal olarak haritalandırır. Düşman komutanlarını yüksek menzilden Sniper Rifle ve Hunter's Quarry (+1d6) kombinasyonuyla tek atışta indirir.
              </p>
              <div className="synergy-action-tag">
                🎯 Makro Dürbünle gözetlediğinde ilk atışı <strong>Avantajlı</strong> kazanır. Susturuculu tabanca ile DC 10 gizlilik bozulmadan sızılır.
              </div>
            </div>

            {/* Rearguard / Arka Hat Desteği */}
            <div className="synergy-card">
              <div className="synergy-card-header">
                <Bot className="text-green" size={20} />
                <h4 className="synergy-title">3. ARKA HAT DESTEĞİ & SLICING (TECH & MED)</h4>
              </div>
              <p className="synergy-desc">
                <strong>Elias Renn</strong> ve 4 bacaklı <strong>Destek Droidi</strong>, tim üyelerine menzilden Kolto enjekte eder (+1d8+3 HP). Düşman terminallerini hackleyerek kapıları ve taretleri timin kontrolüne geçirir.
              </p>
              <div className="synergy-action-tag">
                🛠️ Droid, müttefiklere bonus eylemle <strong>Help (Avantaj)</strong> sağlar; Elias Overload Defenses ile zırhlı boss ve droidleri kilitler.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
