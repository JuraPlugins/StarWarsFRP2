import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Zap,
  Crosshair,
  Award,
  Sparkles,
  Dices,
  RefreshCw,
  Plus,
  Minus,
  Coins,
  Bot,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  Radio,
  FileText
} from 'lucide-react';
import { Character, AbilityName, Skill, AttackAction } from '../types/character';
import { SW5E_CONDITIONS } from '../data/sw5eCompendium';
import { sounds } from '../utils/soundEffects';
import { rollD20, rollFormula, DiceRollResult } from '../utils/dice';

interface CharacterSheetProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onOpenLevelUp: () => void;
  onAddRollResult: (res: DiceRollResult) => void;
  onOpenDiceModal: () => void;
  onOpenArmory: () => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onUpdateCharacter,
  onOpenLevelUp,
  onAddRollResult,
  onOpenDiceModal,
  onOpenArmory,
}) => {
  const [activeTab, setActiveTab] = useState<'attacks' | 'skills' | 'features' | 'inventory' | 'notes'>('attacks');
  const [targetNameInput, setTargetNameInput] = useState(character.targetAssessed || '');
  const [selectedConditionToAdd, setSelectedConditionToAdd] = useState<string>('');

  const activeConditions = character.conditions || [];

  const handleToggleCondition = (condId: string) => {
    sounds.playClick();
    const current = character.conditions || [];
    const updated = current.includes(condId)
      ? current.filter((c) => c !== condId)
      : [...current, condId];
    onUpdateCharacter({
      ...character,
      conditions: updated,
    });
  };

  // Quick HP Change
  const modifyHp = (amount: number) => {
    sounds.playClick();
    const newHp = Math.max(0, Math.min(character.maxHp, character.currentHp + amount));
    onUpdateCharacter({
      ...character,
      currentHp: newHp,
    });
  };

  // Roll d20 Ability Check or Save
  const handleRollAbility = (stat: AbilityName, isSave: boolean) => {
    sounds.playDiceRoll();
    const mod = isSave ? character.abilities[stat].saveMod : character.abilities[stat].mod;
    const label = `${stat} ${isSave ? 'Kurtarma Atışı (Save)' : 'Yetenek Kontrolü'}`;
    const result = rollD20(label, character.name, mod);
    onAddRollResult(result);
    if (result.isNat20) sounds.playLevelUp();
  };

  // Roll Skill Check
  const handleRollSkill = (skill: Skill) => {
    sounds.playDiceRoll();
    const label = `${skill.nameTr} Kontrolü`;
    const result = rollD20(label, character.name, skill.bonus);
    onAddRollResult(result);
    if (result.isNat20) sounds.playLevelUp();
  };

  // Roll Attack To Hit
  const handleRollAttackHit = (atk: AttackAction) => {
    sounds.playBlaster();
    const label = `${atk.name} [İsabet Saldırısı]`;
    const result = rollD20(label, character.name, atk.toHit);
    onAddRollResult(result);
    if (result.isNat20) sounds.playLevelUp();
  };

  // Roll Attack Damage
  const handleRollAttackDamage = (atk: AttackAction) => {
    sounds.playBlaster();
    let formula = atk.damage;
    let label = `${atk.name} [Hasar]`;

    // Silas Hunter's Quarry bonus damage if target is active
    if (character.id === 'silas-dorn' && character.targetAssessed && character.targetAssessed !== 'Hedef Yok') {
      formula += ' + 1d6';
      label += " (Hunter's Quarry +1d6 dahil)";
    }

    const result = rollFormula(formula, label, character.name);
    onAddRollResult(result);
  };

  // Second Wind action
  const handleUseSecondWind = () => {
    if (!character.secondWindAvailable) return;
    sounds.playHeal();
    const roll = rollFormula(`1d10 + ${character.level}`, 'Toparlanma (Second Wind)', character.name);
    onAddRollResult(roll);

    const healedHp = Math.min(character.maxHp, character.currentHp + roll.total);
    onUpdateCharacter({
      ...character,
      currentHp: healedHp,
      secondWindAvailable: false,
    });
  };

  // Spend Superiority Die (Darius)
  const handleSpendSuperiorityDie = (maneuverName?: string) => {
    if (!character.superiorityDice || character.superiorityDice.current <= 0) return;
    sounds.playDiceRoll();
    const roll = rollFormula('1d8', `Üstünlük Zarı (${maneuverName || 'Manevra'})`, character.name);
    onAddRollResult(roll);

    onUpdateCharacter({
      ...character,
      superiorityDice: {
        ...character.superiorityDice,
        current: character.superiorityDice.current - 1,
      },
    });
  };

  // Restore Superiority Die
  const handleRestoreSuperiorityDie = () => {
    if (!character.superiorityDice || character.superiorityDice.current >= character.superiorityDice.max) return;
    sounds.playClick();
    onUpdateCharacter({
      ...character,
      superiorityDice: {
        ...character.superiorityDice,
        current: character.superiorityDice.current + 1,
      },
    });
  };

  // Spend Tech Points (Scout / Engineer)
  const handleSpendTp = (amount: number, powerName: string) => {
    if (!character.techcasting || character.techcasting.currentTp < amount) {
      alert('Yetersiz Tech Noktası (TP)!');
      return;
    }
    sounds.playTech();
    onUpdateCharacter({
      ...character,
      techcasting: {
        ...character.techcasting,
        currentTp: character.techcasting.currentTp - amount,
      },
    });
    // Log
    onAddRollResult({
      id: 'tp-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rollerName: character.name,
      label: `Tech Gücü: ${powerName}`,
      formula: `-${amount} TP`,
      rolls: [],
      modifier: 0,
      total: character.techcasting.currentTp - amount,
      details: `${amount} TP harcandı. Kalan TP: ${character.techcasting.currentTp - amount}/${character.techcasting.maxTp}`,
    });
  };

  // Modify Droid HP (Elias)
  const modifyDroidHp = (amount: number) => {
    if (!character.companionDroid) return;
    sounds.playClick();
    const newHp = Math.max(0, Math.min(character.companionDroid.maxHp, character.companionDroid.hp + amount));
    onUpdateCharacter({
      ...character,
      companionDroid: {
        ...character.companionDroid,
        hp: newHp,
      },
    });
  };

  const hpPercent = Math.max(0, Math.min(100, (character.currentHp / character.maxHp) * 100));

  return (
    <div className="character-sheet-container">
      {/* Operative Header Banner */}
      <div className="char-banner-card">
        <div className="banner-profile">
          <div className="avatar-hex">
            <span className="hex-initials">{character.name.slice(0, 2).toUpperCase()}</span>
            <div className="hex-pulse"></div>
          </div>

          <div className="profile-text">
            <div className="profile-tag-row">
              <span className="tag-dossier">{character.dossierNumber}</span>
              <span className="tag-role">{character.role}</span>
              <span className="tag-species">{character.species}</span>
            </div>
            <h2 className="profile-name">{character.name}</h2>
            <div className="profile-meta-line">
              <strong className="class-badge">
                {character.class} — {character.archetype}
              </strong>
              <span className="background-badge">Geçmiş: {character.background}</span>
              <span className="pb-badge">Yeterlilik Bonusu (PB): +{character.proficiencyBonus}</span>
            </div>
            <p className="profile-quote">"{character.quote}"</p>
          </div>
        </div>

        {/* Level Up & Credits Hub */}
        <div className="banner-controls">
          <div className="credits-display-card">
            <Coins className="text-amber" size={18} />
            <div className="credits-info">
              <span className="lbl">KREDİ BAKİYESİ</span>
              <strong className="amt">{character.credits.toLocaleString('tr-TR')} ¢</strong>
            </div>
          </div>

          <button className="btn-level-up-glow" onClick={onOpenLevelUp}>
            <Sparkles size={18} />
            <div className="btn-text">
              <span className="lvl-sub">TERFİ ET</span>
              <span className="lvl-main">SEVİYE {character.level + 1}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Primary Defense & Vitality Bar */}
      <div className="vitality-defense-bar">
        {/* Can Puanı (HP) Hub */}
        <div className="v-card hp-card">
          <div className="v-card-top">
            <div className="v-card-title">
              <Heart className="text-crimson" size={18} />
              <span>CAN PUANI (HP)</span>
            </div>
            <span className="hp-ratio">
              {character.currentHp} / {character.maxHp}
            </span>
          </div>

          <div className="hp-progress-track">
            <div
              className={`hp-progress-fill ${hpPercent < 30 ? 'critical' : hpPercent < 60 ? 'warning' : 'healthy'}`}
              style={{ width: `${hpPercent}%` }}
            ></div>
          </div>

          <div className="hp-button-row">
            <button className="hp-quick-btn dmg" onClick={() => modifyHp(-5)}>
              -5
            </button>
            <button className="hp-quick-btn dmg" onClick={() => modifyHp(-1)}>
              -1
            </button>
            <input
              type="number"
              className="hp-direct-input"
              value={character.currentHp}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateCharacter({
                  ...character,
                  currentHp: Math.max(0, Math.min(character.maxHp, val)),
                });
              }}
            />
            <button className="hp-quick-btn heal" onClick={() => modifyHp(1)}>
              +1
            </button>
            <button className="hp-quick-btn heal" onClick={() => modifyHp(5)}>
              +5
            </button>
          </div>
        </div>

        {/* Temp HP */}
        <div className="v-card temp-hp-card">
          <span className="v-label">GEÇİCİ CAN (TEMP)</span>
          <div className="temp-hp-row">
            <Shield size={18} className="text-cyan" />
            <input
              type="number"
              min={0}
              className="temp-hp-input"
              value={character.tempHp}
              onChange={(e) => {
                onUpdateCharacter({
                  ...character,
                  tempHp: Math.max(0, Number(e.target.value)),
                });
              }}
            />
          </div>
          <span className="v-desc">Hasar önce buradan düşer</span>
        </div>

        {/* Armor Class (AC) */}
        <div className="v-card stat-bubble-card">
          <span className="v-label">ZIRH SINIFI (AC)</span>
          <div className="bubble-value-wrap">
            <Shield className="bubble-icon text-cyan" size={24} />
            <span className="bubble-number">{character.armorClass}</span>
          </div>
          <span className="v-desc">Muharebe Zırhı Koruması</span>
        </div>

        {/* Initiative */}
        <div
          className="v-card stat-bubble-card clickable-bubble"
          onClick={() => {
            sounds.playDiceRoll();
            const res = rollD20('İnisiyatif Atışı', character.name, character.initiative);
            onAddRollResult(res);
          }}
          title="İnisiyatif Zarı Atmak İçin Tıkla"
        >
          <span className="v-label">İNİSİYATİF</span>
          <div className="bubble-value-wrap">
            <Crosshair className="bubble-icon text-amber" size={24} />
            <span className="bubble-number">+{character.initiative}</span>
          </div>
          <span className="v-desc">Tıkla: d20 Zar At</span>
        </div>

        {/* Speed */}
        <div className="v-card stat-bubble-card">
          <span className="v-label">HAREKET HIZI</span>
          <div className="bubble-value-wrap">
            <Zap className="bubble-icon text-green" size={24} />
            <span className="bubble-number">{character.speed} ft</span>
          </div>
          <span className="v-desc">{Math.round(character.speed / 5)} kare / tur</span>
        </div>

        {/* Hit Dice */}
        <div className="v-card stat-bubble-card">
          <span className="v-label">CAN ZARI (HIT DICE)</span>
          <div className="bubble-value-wrap">
            <Dices className="bubble-icon text-cyan" size={24} />
            <span className="bubble-number">
              {character.currentHitDice}/{character.maxHitDice}
            </span>
          </div>
          <div className="hit-dice-actions">
            <span className="dice-type-tag">d{character.hitDieType}</span>
            <button
              className="btn-spend-hd"
              disabled={character.currentHitDice <= 0}
              onClick={() => {
                if (character.currentHitDice <= 0) return;
                sounds.playDiceRoll();
                const roll = rollFormula(
                  `1d${character.hitDieType} + ${character.abilities.CON.mod}`,
                  'Can Zarı Harcama (Hit Die)',
                  character.name
                );
                onAddRollResult(roll);
                const gained = Math.max(1, roll.total);
                onUpdateCharacter({
                  ...character,
                  currentHp: Math.min(character.maxHp, character.currentHp + gained),
                  currentHitDice: character.currentHitDice - 1,
                });
              }}
              title="1 Hit Die Harca & HP Yenile"
            >
              Harca (+HP)
            </button>
          </div>
        </div>
      </div>

      {/* SW5E Active Conditions Bar */}
      <div className="conditions-bar">
        <div className="conditions-label-wrap">
          <AlertCircle size={16} className="text-amber" />
          <span className="conditions-title">AKTİF SAVAŞ DURUMLARI (CONDITIONS):</span>
        </div>

        <div className="conditions-tags-row">
          {activeConditions.length === 0 ? (
            <span className="no-conditions-tag">Temiz (Aktif Durum Etkisi Yok)</span>
          ) : (
            activeConditions.map((condId) => {
              const condInfo = SW5E_CONDITIONS.find((c) => c.id === condId);
              return (
                <div
                  key={condId}
                  className="condition-active-badge"
                  style={{ borderColor: condInfo?.color || '#ff2a4b' }}
                  title={condInfo?.description}
                >
                  <span className="cond-dot" style={{ backgroundColor: condInfo?.color || '#ff2a4b' }}></span>
                  <strong>{condInfo?.nameTr || condId}</strong>
                  <button
                    className="btn-remove-cond"
                    onClick={() => handleToggleCondition(condId)}
                    title="Durumu Kaldır"
                  >
                    &times;
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="add-condition-dropdown-wrap">
          <select
            value={selectedConditionToAdd}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                handleToggleCondition(val);
                setSelectedConditionToAdd('');
              }
            }}
            className="dark-select condition-select"
          >
            <option value="">+ Durum Ekle / Kaldır...</option>
            {SW5E_CONDITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameTr} {activeConditions.includes(c.id) ? '✓ (Aktif)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Specific Interactive Resource Strip */}
      <div className="class-resource-strip">
        {/* Darius Venn: Tactician Superiority Dice */}
        {character.superiorityDice && (
          <div className="class-box tactician-box">
            <div className="box-header">
              <div className="box-title-group">
                <Dices className="text-cyan" size={20} />
                <strong>TAKTIKSEL ÜSTÜNLÜK ZARLARI (TACTICAL SUPERIORITY)</strong>
              </div>
              <span className="dc-badge">Manevra DC: {character.superiorityDice.dc}</span>
            </div>

            <div className="dice-slots-row">
              <span className="slots-label">
                Mevcut Zarlar ({character.superiorityDice.current} / {character.superiorityDice.max} adet d8):
              </span>
              <div className="dice-slot-tokens">
                {Array.from({ length: character.superiorityDice.max }).map((_, idx) => {
                  const isAvailable = idx < (character.superiorityDice?.current || 0);
                  return (
                    <button
                      key={idx}
                      className={`die-token ${isAvailable ? 'available' : 'spent'}`}
                      onClick={() => {
                        if (isAvailable) handleSpendSuperiorityDie();
                        else handleRestoreSuperiorityDie();
                      }}
                      title={isAvailable ? '1 d8 Harca' : '1 d8 Yenile'}
                    >
                      d8
                    </button>
                  );
                })}
              </div>
              <button
                className="btn-quick-spend"
                onClick={() => handleSpendSuperiorityDie()}
                disabled={character.superiorityDice.current <= 0}
              >
                1 d8 Manevra Zarı At
              </button>
            </div>

            {/* Maneuvers quick cards */}
            <div className="maneuvers-quick-grid">
              {character.superiorityDice.maneuvers.map((m) => (
                <div key={m.id} className="maneuver-item-card">
                  <div className="m-card-top">
                    <strong className="m-name">{m.name}</strong>
                    <button
                      className="m-spend-btn"
                      onClick={() => handleSpendSuperiorityDie(m.name)}
                      disabled={character.superiorityDice?.current === 0}
                    >
                      Kullan (-1d8)
                    </button>
                  </div>
                  <p className="m-desc">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Joren Kreel: Assault Specialist Doctrine */}
        {character.id === 'joren-kreel' && (
          <div className="class-box assault-box">
            <div className="box-header">
              <div className="box-title-group">
                <Flame className="text-crimson" size={20} />
                <strong>AĞIR HÜCUM DOKTRİNİ (ASSAULT MASTERY)</strong>
              </div>
              <span className="dc-badge">Baskı Ateşi Save DC: 13</span>
            </div>

            <div className="assault-features-grid">
              <div className="assault-card">
                <strong className="card-lbl">💥 Baskı Ateşi (Suppression Fire)</strong>
                <p className="card-sub">
                  Hedefin 10 ft'lik alanına yaylım ateşi açar. Rakipler <strong>DEX Save (DC 13)</strong> atar;
                  başarısız olanlar sonraki turlarının sonuna kadar dezavantajla saldırır.
                </p>
              </div>
              <div className="assault-card">
                <strong className="card-lbl">🔨 Gedik Açıcı (Breacher)</strong>
                <p className="card-sub">
                  Kapılara, zırhlı geçitlere ve siper nesnelerine verilen tüm hasar <strong>iki kat kritik</strong>{' '}
                  sayılır.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Silas Dorn: Hunter / Techcasting & Hunter's Quarry */}
        {character.id === 'silas-dorn' && (
          <div className="class-box scout-box">
            <div className="box-header">
              <div className="box-title-group">
                <Crosshair className="text-cyan" size={20} />
                <strong>HEDEF İŞARETLEME & TECHCASTING (SCOUT)</strong>
              </div>
              <div className="badge-group">
                <span className="dc-badge">Tech DC: {character.techcasting?.saveDc}</span>
                <span className="dc-badge">Tech Atak: +{character.techcasting?.attackBonus}</span>
              </div>
            </div>

            <div className="scout-quarry-bar">
              <div className="quarry-input-wrap">
                <label className="quarry-label">🎯 İŞARETLİ HEDEF (HUNTER'S QUARRY):</label>
                <input
                  type="text"
                  placeholder="Hedef adı yazın (Örn: Asi Çavuşu)"
                  value={targetNameInput}
                  onChange={(e) => {
                    setTargetNameInput(e.target.value);
                    onUpdateCharacter({
                      ...character,
                      targetAssessed: e.target.value,
                    });
                  }}
                  className="quarry-input"
                />
              </div>
              <div className="quarry-active-indicator">
                {targetNameInput && targetNameInput !== 'Hedef Yok' ? (
                  <span className="quarry-bonus text-cyan">⚡ Her vuruşta ekstra +1d6 hasar aktif!</span>
                ) : (
                  <span className="quarry-bonus text-muted">Hedef işaretlenmedi.</span>
                )}
              </div>
            </div>

            {/* TP Tokens */}
            {character.techcasting && (
              <div className="tp-tokens-row">
                <span className="tp-label">
                  Tech Noktaları ({character.techcasting.currentTp}/{character.techcasting.maxTp} TP):
                </span>
                <div className="tp-slots">
                  {Array.from({ length: character.techcasting.maxTp }).map((_, idx) => {
                    const isAvailable = idx < (character.techcasting?.currentTp || 0);
                    return (
                      <span
                        key={idx}
                        className={`tp-token ${isAvailable ? 'tp-active' : 'tp-empty'}`}
                        onClick={() => {
                          if (isAvailable) handleSpendTp(1, 'Tech Point');
                        }}
                      >
                        ⚡
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Elias Renn: Engineer Techcasting & Companion Support Droid */}
        {character.id === 'elias-renn' && character.companionDroid && (
          <div className="class-box engineer-box">
            <div className="box-header">
              <div className="box-title-group">
                <Bot className="text-cyan" size={20} />
                <strong>DESTEK DROİDİ & FULL CASTER TEKNOLOJİ</strong>
              </div>
              <div className="badge-group">
                <span className="dc-badge">Tech DC: {character.techcasting?.saveDc}</span>
                <span className="dc-badge">Tech Atak: +{character.techcasting?.attackBonus}</span>
              </div>
            </div>

            {/* Support Droid HUD */}
            <div className="droid-hud-card">
              <div className="droid-info-row">
                <div className="droid-name-block">
                  <strong>🤖 {character.companionDroid.name}</strong>
                  <span className="droid-model">{character.companionDroid.model}</span>
                </div>
                <div className="droid-vitals">
                  <span>AC: {character.companionDroid.ac}</span>
                  <div className="droid-hp-wrap">
                    <span>
                      HP: {character.companionDroid.hp}/{character.companionDroid.maxHp}
                    </span>
                    <button className="droid-hp-btn" onClick={() => modifyDroidHp(-1)}>
                      -1
                    </button>
                    <button className="droid-hp-btn" onClick={() => modifyDroidHp(1)}>
                      +1
                    </button>
                  </div>
                </div>
              </div>
              <div className="droid-actions-list">
                {character.companionDroid.actions.map((act, i) => (
                  <div key={i} className="droid-action-tag">
                    {act}
                  </div>
                ))}
              </div>
            </div>

            {/* TP Tokens */}
            {character.techcasting && (
              <div className="tp-tokens-row">
                <span className="tp-label">
                  Mühendis Tech Noktaları ({character.techcasting.currentTp}/{character.techcasting.maxTp} TP):
                </span>
                <div className="tp-slots">
                  {Array.from({ length: character.techcasting.maxTp }).map((_, idx) => {
                    const isAvailable = idx < (character.techcasting?.currentTp || 0);
                    return (
                      <span
                        key={idx}
                        className={`tp-token ${isAvailable ? 'tp-active' : 'tp-empty'}`}
                        onClick={() => {
                          if (isAvailable) handleSpendTp(1, 'Tech Point');
                        }}
                      >
                        ⚡
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Short Rest Recharges: Second Wind & Action Surge */}
        <div className="recharge-abilities-row">
          {character.secondWindAvailable !== undefined && (
            <div className="recharge-badge-card">
              <div className="recharge-info">
                <strong>Toparlanma (Second Wind)</strong>
                <span>Bonus Action: 1d10 + {character.level} HP Yeniler (1/Mola)</span>
              </div>
              <button
                className={`btn-recharge ${character.secondWindAvailable ? 'btn-available' : 'btn-used'}`}
                onClick={handleUseSecondWind}
                disabled={!character.secondWindAvailable}
              >
                {character.secondWindAvailable ? 'Kullan (+HP Yenile)' : 'Kullanıldı (Mola Gerekli)'}
              </button>
            </div>
          )}

          {character.actionSurgeAvailable !== undefined && (
            <div className="recharge-badge-card">
              <div className="recharge-info">
                <strong>Eylem Patlaması (Action Surge)</strong>
                <span>Fazladan bir tam Action kazanır (1/Mola)</span>
              </div>
              <button
                className={`btn-recharge ${character.actionSurgeAvailable ? 'btn-available' : 'btn-used'}`}
                onClick={() => {
                  sounds.playTech();
                  onUpdateCharacter({ ...character, actionSurgeAvailable: false });
                }}
                disabled={!character.actionSurgeAvailable}
              >
                {character.actionSurgeAvailable ? 'Hemen Eylemi Kullan' : 'Kullanıldı (Mola Gerekli)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Split: Left Abilities & Saves, Right Tabs (Attacks, Skills, Tech/Features, Inventory) */}
      <div className="character-main-grid">
        {/* Left Column: Ability Scores & Saves */}
        <div className="abilities-column">
          <div className="panel-title-strip">
            <Award size={16} className="text-cyan" />
            <span>YETENEK PUANLARI & SAVELER</span>
          </div>

          <div className="ability-scores-stack">
            {(Object.keys(character.abilities) as AbilityName[]).map((st) => {
              const ab = character.abilities[st];
              return (
                <div key={st} className="ability-card">
                  <div className="ability-header">
                    <span className="ability-code">{st}</span>
                    <strong className="ability-raw">{ab.score}</strong>
                  </div>

                  <div className="ability-actions-row">
                    {/* Stat Check Button */}
                    <button
                      className="btn-roll-stat"
                      onClick={() => handleRollAbility(st, false)}
                      title={`${st} Yetenek Kontrolü At`}
                    >
                      <span className="btn-label">Mod</span>
                      <strong className="btn-val">{ab.mod >= 0 ? `+${ab.mod}` : ab.mod}</strong>
                    </button>

                    {/* Saving Throw Button */}
                    <button
                      className={`btn-roll-save ${ab.saveProficient ? 'save-prof' : ''}`}
                      onClick={() => handleRollAbility(st, true)}
                      title={`${st} Kurtarma Atışı (Save) At`}
                    >
                      <span className="btn-label">
                        Save {ab.saveProficient && <span className="prof-star">★</span>}
                      </span>
                      <strong className="btn-val">{ab.saveMod >= 0 ? `+${ab.saveMod}` : ab.saveMod}</strong>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="passive-perception-box">
            <span>PASİF ALGI (PERCEPTION):</span>
            <strong>{character.passivePerception}</strong>
          </div>
        </div>

        {/* Right Column: Interactive Tabs */}
        <div className="tabbed-content-column">
          <div className="sub-tab-nav">
            <button
              className={`sub-tab-btn ${activeTab === 'attacks' ? 'active' : ''}`}
              onClick={() => setActiveTab('attacks')}
            >
              <Crosshair size={16} /> Saldırılar & Silahlar ({character.attacks.length})
            </button>
            <button
              className={`sub-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <Award size={16} /> Beceriler (Skills)
            </button>
            <button
              className={`sub-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <Zap size={16} /> Özellikler & Tech ({character.features.length})
            </button>
            <button
              className={`sub-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <Shield size={16} /> Ekipman & Envanter ({character.inventory.length})
            </button>
            <button
              className={`sub-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <FileText size={16} /> Görev Notları & İstihbarat
            </button>
          </div>

          {/* TAB 1: ATTACKS & COMBAT */}
          {activeTab === 'attacks' && (
            <div className="tab-pane attacks-pane">
              <div className="attacks-grid">
                {character.attacks.map((atk) => (
                  <div key={atk.id} className="attack-card">
                    <div className="atk-header">
                      <div>
                        <h4 className="atk-name">{atk.name}</h4>
                        <span className="atk-range">{atk.range} | {atk.damageType}</span>
                      </div>
                      <span className="atk-type-badge">{atk.type}</span>
                    </div>

                    <div className="atk-actions-row">
                      <button className="btn-roll-atk-hit" onClick={() => handleRollAttackHit(atk)}>
                        <Crosshair size={16} /> İsabet: +{atk.toHit}
                      </button>
                      <button className="btn-roll-atk-dmg" onClick={() => handleRollAttackDamage(atk)}>
                        <Flame size={16} /> Hasar: {atk.damage}
                      </button>
                    </div>

                    {atk.notes && <p className="atk-notes">{atk.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS LIST */}
          {activeTab === 'skills' && (
            <div className="tab-pane skills-pane">
              <div className="skills-table-grid">
                {character.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className={`skill-row ${skill.expertise ? 'is-expertise' : skill.proficient ? 'is-proficient' : ''}`}
                    onClick={() => handleRollSkill(skill)}
                    title="Beceri Kontrolü İçin Zar At"
                  >
                    <div className="skill-indicator-col">
                      {skill.expertise ? (
                        <span className="star-exp" title="Çift Yetkinlik (Expertise)">
                          ★★
                        </span>
                      ) : skill.proficient ? (
                        <span className="star-prof" title="Yetkin (Proficient)">
                          ★
                        </span>
                      ) : (
                        <span className="star-empty">○</span>
                      )}
                    </div>
                    <div className="skill-name-col">
                      <strong className="skill-name">{skill.nameTr}</strong>
                    </div>
                    <div className="skill-bonus-col">
                      <span className="bonus-badge">
                        {skill.bonus >= 0 ? `+${skill.bonus}` : skill.bonus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FEATURES & TECH POWERS */}
          {activeTab === 'features' && (
            <div className="tab-pane features-pane">
              {/* Tech Powers (if character has techcasting) */}
              {character.techcasting && (
                <div className="tech-powers-section">
                  <h4 className="tech-section-title">
                    ⚡ AKTİF PROGRAMLAR & TECH POWERS ({character.techcasting.powers.length})
                  </h4>
                  <div className="powers-grid">
                    {character.techcasting.powers.map((pow) => (
                      <div key={pow.id} className="tech-power-card">
                        <div className="power-card-top">
                          <strong className="power-title">{pow.name}</strong>
                          <button
                            className="btn-cast-power"
                            onClick={() => handleSpendTp(pow.cost, pow.name)}
                            disabled={(character.techcasting?.currentTp || 0) < pow.cost}
                          >
                            Çalıştır ({pow.cost > 0 ? `${pow.cost} TP` : 'At-Will / 0 TP'})
                          </button>
                        </div>
                        <div className="power-meta-tags">
                          <span>Menzil: {pow.range}</span>
                          <span>Süre: {pow.duration}</span>
                          <span>Eylem: {pow.castingTime}</span>
                        </div>
                        <p className="power-desc">{pow.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Class & Archetype Features */}
              <div className="features-list-section">
                <h4 className="tech-section-title">🛡️ SINIF & ARKETİP ÖZELLİKLERİ</h4>
                <div className="features-grid">
                  {character.features.map((feat) => (
                    <div key={feat.id} className="feature-card">
                      <div className="feat-card-top">
                        <strong className="feat-title">{feat.name}</strong>
                        <span className="feat-source">{feat.source}</span>
                      </div>
                      <p className="feat-text">{feat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY & GEAR */}
          {activeTab === 'inventory' && (
            <div className="tab-pane inventory-pane">
              <div className="inv-top-bar">
                <span>
                  Toplam Eşya: <strong>{character.inventory.length}</strong> | Toplam Ağırlık:{' '}
                  <strong>
                    {character.inventory
                      .reduce((sum, it) => sum + (it.weight || 0) * (it.quantity || 1), 0)
                      .toFixed(1)}{' '}
                    lbs
                  </strong>
                </span>
                <button className="btn-open-market-shortcut" onClick={onOpenArmory}>
                  + Cephanelikten İtem Satın Al
                </button>
              </div>

              <div className="inventory-items-grid">
                {character.inventory.map((item) => (
                  <div key={item.id} className={`gear-card ${item.equipped ? 'is-equipped' : ''}`}>
                    <div className="gear-card-top">
                      <strong className="gear-name">{item.name}</strong>
                      <span className={`gear-status-tag ${item.equipped ? 'status-equipped' : 'status-pack'}`}>
                        {item.equipped ? 'KUŞANILDI' : 'ÇANTADA'}
                      </span>
                    </div>

                    <div className="gear-meta-strip">
                      <span className="gear-cat">{item.category}</span>
                      <span className="gear-wt">{item.weight} lbs</span>
                      <span className="gear-cost">{item.cost} ¢</span>
                    </div>

                    {item.stats && <div className="gear-stats-row">{item.stats}</div>}
                    <p className="gear-desc">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MISSION NOTES & INTEL */}
          {activeTab === 'notes' && (
            <div className="tab-pane notes-pane">
              <div className="notes-header">
                <div className="notes-title-group">
                  <FileText className="text-cyan" size={20} />
                  <h4 className="tech-section-title">İMPARATORLUK SAHA İSTİHBARAT VE GÖREV KAYITLARI</h4>
                </div>
                <span className="terminal-code">ŞİFRELİ DATAPAD NOT DEFTERİ</span>
              </div>
              <textarea
                className="mission-notes-textarea"
                rows={12}
                placeholder="Operasyon hedefleri, şifreli frekanslar, ödül avı koordinatları, ele geçirilen düşman belgeleri..."
                value={character.missionNotes || ''}
                onChange={(e) => {
                  onUpdateCharacter({
                    ...character,
                    missionNotes: e.target.value,
                  });
                }}
              />
              <div className="notes-footer-bar">
                <span className="text-muted">Notlar otomatik olarak tarayıcı yerel hafızasına kaydedilir.</span>
                <button
                  type="button"
                  className="quick-note-template-btn"
                  onClick={() => {
                    const template = `\n--- [YENİ İSTİHBARAT: ${new Date().toLocaleTimeString('tr-TR')}] ---\n• Hedef:\n• Konum:\n• Güvenlik Kodu:\n• Tehdit Seviyesi:\n`;
                    onUpdateCharacter({
                      ...character,
                      missionNotes: (character.missionNotes || '') + template,
                    });
                  }}
                >
                  + Taktik Şablon Ekle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
