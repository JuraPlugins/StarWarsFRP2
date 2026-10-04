import React, { useState } from 'react';
import { X, Award, Sparkles, ArrowRight, ShieldCheck, Zap, Plus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character, AbilityName, TechPower, Maneuver, Skill } from '../types/character';
import { SW5E_FEATS, SW5E_TECH_POWERS, SW5E_MANEUVERS, Feat } from '../data/sw5eCompendium';
import { sounds } from '../utils/soundEffects';
import { rollDie } from '../utils/dice';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onCompleteLevelUp: (updated: Character) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  character,
  onCompleteLevelUp,
}) => {
  const nextLevel = character.level + 1;
  const conMod = character.abilities.CON.mod;
  const avgHpGain = Math.max(1, (character.hitDieType === 10 ? 6 : 5) + conMod);

  // States
  const [step, setStep] = useState<number>(1);
  const [hpMethod, setHpMethod] = useState<'fixed' | 'rolled'>('fixed');
  const [rolledHp, setRolledHp] = useState<number | null>(null);
  
  // ASI or Feat
  const [progressionType, setProgressionType] = useState<'asi' | 'feat'>('asi');
  const [asiChoice1, setAsiChoice1] = useState<AbilityName>('STR');
  const [asiChoice2, setAsiChoice2] = useState<AbilityName>('CON');
  const [asiSingleStat, setAsiSingleStat] = useState<AbilityName | null>(null); // if +2
  const [selectedFeat, setSelectedFeat] = useState<Feat | null>(null);

  // New Powers / Maneuvers / Skills
  const [selectedTechPower, setSelectedTechPower] = useState<TechPower | null>(null);
  const [selectedManeuver, setSelectedManeuver] = useState<Maneuver | null>(null);
  const [selectedNewSkill, setSelectedNewSkill] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRollHp = () => {
    sounds.playDiceRoll();
    const roll = rollDie(character.hitDieType);
    const gained = Math.max(1, roll + conMod);
    setRolledHp(gained);
  };

  const finalHpGain = hpMethod === 'rolled' && rolledHp !== null ? rolledHp : avgHpGain;

  const handleFinish = () => {
    sounds.playLevelUp();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Determine new PB
    const newPb = nextLevel >= 5 ? 3 : 2;

    // Clone abilities
    const updatedAbilities = { ...character.abilities };
    if (progressionType === 'asi') {
      if (asiSingleStat) {
        const oldScore = updatedAbilities[asiSingleStat].score;
        const newScore = oldScore + 2;
        const newMod = Math.floor((newScore - 10) / 2);
        updatedAbilities[asiSingleStat] = {
          ...updatedAbilities[asiSingleStat],
          score: newScore,
          mod: newMod,
          saveMod: newMod + (updatedAbilities[asiSingleStat].saveProficient ? newPb : 0),
        };
      } else {
        [asiChoice1, asiChoice2].forEach((stat) => {
          const oldScore = updatedAbilities[stat].score;
          const newScore = oldScore + 1;
          const newMod = Math.floor((newScore - 10) / 2);
          updatedAbilities[stat] = {
            ...updatedAbilities[stat],
            score: newScore,
            mod: newMod,
            saveMod: newMod + (updatedAbilities[stat].saveProficient ? newPb : 0),
          };
        });
      }
    }

    // Recompute all saves with new PB if changed
    (Object.keys(updatedAbilities) as AbilityName[]).forEach((abKey) => {
      const isProf = updatedAbilities[abKey].saveProficient;
      const mod = updatedAbilities[abKey].mod;
      updatedAbilities[abKey].saveMod = mod + (isProf ? newPb : 0);
    });

    // Clone & update skills
    const updatedSkills: Skill[] = character.skills.map((sk) => {
      const isNewlyProf = sk.name === selectedNewSkill;
      const isProf = sk.proficient || isNewlyProf;
      const isExp = sk.expertise;
      const abMod = updatedAbilities[sk.ability].mod;
      const bonus = abMod + (isExp ? newPb * 2 : isProf ? newPb : 0);
      return {
        ...sk,
        proficient: isProf,
        bonus,
      };
    });

    // Update class features
    const updatedFeatures = [...character.features];
    if (progressionType === 'feat' && selectedFeat) {
      updatedFeatures.push({
        id: 'feat-' + selectedFeat.id,
        name: selectedFeat.name,
        source: `Seviye ${nextLevel} Seçimi`,
        description: selectedFeat.description,
      });
    }

    if (nextLevel === 5 && character.class.includes('Savaşçı')) {
      updatedFeatures.push({
        id: 'feat-extra-attack',
        name: 'Ekstra Saldırı (Extra Attack)',
        source: 'Savaşçı Seviye 5',
        description: 'Sıranızda Saldırı (Attack) eylemi yaptığınızda bir yerine iki kez saldırabilirsiniz.',
      });
    }

    // Update Techcasting
    let updatedTech = character.techcasting;
    if (updatedTech) {
      const additionalTp = updatedTech.casterType === 'Full' ? 4 : 2;
      const newMaxTp = updatedTech.maxTp + additionalTp;
      const intMod = updatedAbilities.INT.mod;
      const newDc = 8 + newPb + intMod;
      const newAtkBonus = newPb + intMod;
      const powers = [...updatedTech.powers];
      if (selectedTechPower && !powers.some((p) => p.id === selectedTechPower.id)) {
        powers.push(selectedTechPower);
      }
      updatedTech = {
        ...updatedTech,
        maxTp: newMaxTp,
        currentTp: newMaxTp,
        saveDc: newDc,
        attackBonus: newAtkBonus,
        powers,
      };
    }

    // Update Superiority Dice
    let updatedSup = character.superiorityDice;
    if (updatedSup) {
      const maneuvers = [...updatedSup.maneuvers];
      if (selectedManeuver && !maneuvers.some((m) => m.id === selectedManeuver.id)) {
        maneuvers.push(selectedManeuver);
      }
      const dexMod = updatedAbilities.DEX.mod;
      updatedSup = {
        ...updatedSup,
        max: nextLevel >= 5 ? updatedSup.max + 1 : updatedSup.max,
        current: nextLevel >= 5 ? updatedSup.max + 1 : updatedSup.max,
        dc: 8 + newPb + dexMod,
        maneuvers,
      };
    }

    // Update attacks (recalculate toHit if PB or DEX/STR changed)
    const updatedAttacks = character.attacks.map((atk) => {
      const dexMod = updatedAbilities.DEX.mod;
      const strMod = updatedAbilities.STR.mod;
      let newToHit = atk.toHit;
      if (atk.name.includes('Tüfeği') || atk.name.includes('Blaster') || atk.name.includes('Pistol')) {
        // Ranged blaster
        newToHit = dexMod + newPb + (character.archetype.includes('Tactician') ? 2 : 0);
      } else if (atk.name.includes('Vibro') || atk.name.includes('Kılıç')) {
        newToHit = Math.max(dexMod, strMod) + newPb;
      }
      return {
        ...atk,
        toHit: newToHit,
      };
    });

    const updatedChar: Character = {
      ...character,
      level: nextLevel,
      maxHp: character.maxHp + finalHpGain,
      currentHp: character.currentHp + finalHpGain,
      maxHitDice: character.maxHitDice + 1,
      currentHitDice: character.currentHitDice + 1,
      proficiencyBonus: newPb,
      abilities: updatedAbilities,
      skills: updatedSkills,
      features: updatedFeatures,
      techcasting: updatedTech,
      superiorityDice: updatedSup,
      attacks: updatedAttacks,
    };

    onCompleteLevelUp(updatedChar);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container levelup-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Award className="modal-icon text-cyan" />
            <div>
              <h2 className="modal-title">SEVİYE ATLAMA TERFİ SİSTEMİ</h2>
              <span className="modal-subtitle">
                {character.name} — Seviye {character.level} ➔ <strong>Seviye {nextLevel}</strong>
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Wizard Steps Navigation */}
        <div className="wizard-step-indicator">
          <div className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <span>1. Can Puanı (HP)</span>
          </div>
          <div className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <span>2. Stat Artışı / Feat</span>
          </div>
          <div className={`step-dot ${step === 3 ? 'active' : ''}`}>
            <span>3. Güçler & Onay</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body levelup-body">
          {/* STEP 1: HP INCREASE */}
          {step === 1 && (
            <div className="step-container">
              <h3 className="step-title">1. ADIM: CAN PUANI ARTIŞI</h3>
              <p className="step-desc">
                {character.class} sınıfı için can zarı <strong>1d{character.hitDieType}</strong> + Dayanıklılık (CON:{' '}
                {conMod >= 0 ? `+${conMod}` : conMod}) modifikasyonudur.
              </p>

              <div className="hp-choice-grid">
                <div
                  className={`hp-choice-card ${hpMethod === 'fixed' ? 'selected' : ''}`}
                  onClick={() => setHpMethod('fixed')}
                >
                  <div className="choice-header">
                    <strong>Sabit Ortalama (Güvenli)</strong>
                    <ShieldCheck className="text-cyan" />
                  </div>
                  <div className="huge-gain-number">+{avgHpGain} HP</div>
                  <p className="choice-subtext">Ortalama değer garanti edilir (Risk yok).</p>
                </div>

                <div
                  className={`hp-choice-card ${hpMethod === 'rolled' ? 'selected' : ''}`}
                  onClick={() => setHpMethod('rolled')}
                >
                  <div className="choice-header">
                    <strong>Zar At (1d{character.hitDieType})</strong>
                    <Zap className="text-amber" />
                  </div>
                  <div className="huge-gain-number">
                    {rolledHp !== null ? `+${rolledHp} HP` : `? HP`}
                  </div>
                  <button
                    type="button"
                    className="btn-roll-hp"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHpMethod('rolled');
                      handleRollHp();
                    }}
                  >
                    {rolledHp !== null ? 'Tekrar At' : 'Şimdi Zarı At'}
                  </button>
                </div>
              </div>

              <div className="step-summary-banner">
                Yeni Maksimum HP:{' '}
                <strong>
                  {character.maxHp} + {finalHpGain} = {character.maxHp + finalHpGain} HP
                </strong>
              </div>

              <div className="wizard-actions">
                <button className="wizard-btn next-btn" onClick={() => setStep(2)}>
                  İlerle: Stat Artışı <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ASI OR FEAT */}
          {step === 2 && (
            <div className="step-container">
              <h3 className="step-title">2. ADIM: GELİŞİM (STAT ARTIŞI VEYA YETENEK / FEAT)</h3>
              <p className="step-desc">
                Yetenek puanlarınızı güçlendirin veya özel bir SW5e Feat (Yetenek) seçin.
              </p>

              <div className="progression-tabs">
                <button
                  type="button"
                  className={`prog-tab ${progressionType === 'asi' ? 'active' : ''}`}
                  onClick={() => setProgressionType('asi')}
                >
                  Yetenek Puanı Artışı (ASI)
                </button>
                <button
                  type="button"
                  className={`prog-tab ${progressionType === 'feat' ? 'active' : ''}`}
                  onClick={() => setProgressionType('feat')}
                >
                  Özel Yetenek (Feat) Seç
                </button>
              </div>

              {progressionType === 'asi' ? (
                <div className="asi-builder">
                  <div className="asi-mode-selector">
                    <button
                      type="button"
                      className={`btn-submode ${!asiSingleStat ? 'active' : ''}`}
                      onClick={() => setAsiSingleStat(null)}
                    >
                      İki Farklı Stat +1 Artır
                    </button>
                    <button
                      type="button"
                      className={`btn-submode ${asiSingleStat ? 'active' : ''}`}
                      onClick={() => setAsiSingleStat('STR')}
                    >
                      Tek Bir Stat +2 Artır
                    </button>
                  </div>

                  {asiSingleStat ? (
                    <div className="stat-select-row">
                      <label>+2 Verilecek Stat:</label>
                      <select
                        value={asiSingleStat}
                        onChange={(e) => setAsiSingleStat(e.target.value as AbilityName)}
                        className="dark-select"
                      >
                        {(Object.keys(character.abilities) as AbilityName[]).map((st) => (
                          <option key={st} value={st}>
                            {st} (Mevcut: {character.abilities[st].score}) ➔{' '}
                            {character.abilities[st].score + 2}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="stat-double-select">
                      <div className="stat-select-col">
                        <label>1. Stat (+1):</label>
                        <select
                          value={asiChoice1}
                          onChange={(e) => setAsiChoice1(e.target.value as AbilityName)}
                          className="dark-select"
                        >
                          {(Object.keys(character.abilities) as AbilityName[]).map((st) => (
                            <option key={st} value={st}>
                              {st} (Mevcut: {character.abilities[st].score}) ➔{' '}
                              {character.abilities[st].score + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="stat-select-col">
                        <label>2. Stat (+1):</label>
                        <select
                          value={asiChoice2}
                          onChange={(e) => setAsiChoice2(e.target.value as AbilityName)}
                          className="dark-select"
                        >
                          {(Object.keys(character.abilities) as AbilityName[]).map((st) => (
                            <option key={st} value={st}>
                              {st} (Mevcut: {character.abilities[st].score}) ➔{' '}
                              {character.abilities[st].score + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="feat-selection-list">
                  {SW5E_FEATS.map((feat) => {
                    const isSelected = selectedFeat?.id === feat.id;
                    return (
                      <div
                        key={feat.id}
                        className={`feat-card ${isSelected ? 'feat-selected' : ''}`}
                        onClick={() => setSelectedFeat(feat)}
                      >
                        <div className="feat-header">
                          <div className="feat-name-wrap">
                            <strong>{feat.name}</strong>
                            <span className="feat-badge">{feat.category}</span>
                          </div>
                          {isSelected && <Check className="text-cyan" size={18} />}
                        </div>
                        <p className="feat-benefit">{feat.benefitSummary}</p>
                        <p className="feat-desc">{feat.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="wizard-actions">
                <button className="wizard-btn back-btn" onClick={() => setStep(1)}>
                  Geri
                </button>
                <button className="wizard-btn next-btn" onClick={() => setStep(3)}>
                  İlerle: Güç & Onay <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: NEW POWERS & CONFIRMATION */}
          {step === 3 && (
            <div className="step-container">
              <h3 className="step-title">3. ADIM: EK YETENEKLER & ONAY</h3>

              {/* If Techcaster (Scout or Engineer) */}
              {character.techcasting && (
                <div className="power-learning-section">
                  <h4 className="sub-heading">YENİ BİR TECH PROGRAMI ÖĞREN:</h4>
                  <div className="power-choice-grid">
                    {SW5E_TECH_POWERS.map((pow) => {
                      const isSelected = selectedTechPower?.id === pow.id;
                      return (
                        <div
                          key={pow.id}
                          className={`power-select-card ${isSelected ? 'power-selected' : ''}`}
                          onClick={() => setSelectedTechPower(pow)}
                        >
                          <div className="power-select-top">
                            <strong>{pow.name}</strong>
                            <span className="tp-cost">Seviye {pow.level} ({pow.cost} TP)</span>
                          </div>
                          <p className="power-select-desc">{pow.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* If Tactician Fighter */}
              {character.superiorityDice && (
                <div className="power-learning-section">
                  <h4 className="sub-heading">YENİ BİR MANEVRA ÖĞREN:</h4>
                  <div className="power-choice-grid">
                    {SW5E_MANEUVERS.map((man) => {
                      const isSelected = selectedManeuver?.id === man.id;
                      return (
                        <div
                          key={man.id}
                          className={`power-select-card ${isSelected ? 'power-selected' : ''}`}
                          onClick={() => setSelectedManeuver(man)}
                        >
                          <div className="power-select-top">
                            <strong>{man.name}</strong>
                            <span className="tp-cost">{man.cost}</span>
                          </div>
                          <p className="power-select-desc">{man.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add New Skill Proficiency */}
              <div className="power-learning-section">
                <h4 className="sub-heading">EK BİR BECERİ YETKİNLİĞİ KAZAN (İSTEĞE BAĞLI):</h4>
                <select
                  value={selectedNewSkill || ''}
                  onChange={(e) => setSelectedNewSkill(e.target.value || null)}
                  className="dark-select full-width-select"
                >
                  <option value="">-- Beceri Seçimi Yapılmadı --</option>
                  {character.skills
                    .filter((s) => !s.proficient)
                    .map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.nameTr} ({s.ability})
                      </option>
                    ))}
                </select>
              </div>

              {/* Final Summary Card */}
              <div className="final-summary-card">
                <h4 className="summary-title">TERFİ ÖZETİ:</h4>
                <ul className="summary-list">
                  <li>
                    Seviye: <strong>{nextLevel}</strong>
                  </li>
                  <li>
                    Can Puanı Artışı: <strong>+{finalHpGain} HP</strong> (Yeni Max:{' '}
                    {character.maxHp + finalHpGain})
                  </li>
                  <li>
                    Yeterlilik Bonusu (PB):{' '}
                    <strong>+{nextLevel >= 5 ? 3 : 2}</strong>
                  </li>
                  {progressionType === 'asi' ? (
                    <li>
                      Stat Artışı:{' '}
                      {asiSingleStat
                        ? `${asiSingleStat} +2`
                        : `${asiChoice1} +1 & ${asiChoice2} +1`}
                    </li>
                  ) : (
                    <li>
                      Seçilen Feat: <strong>{selectedFeat?.name || 'Seçilmedi'}</strong>
                    </li>
                  )}
                  {selectedTechPower && (
                    <li>
                      Yeni Tech Programı: <strong>{selectedTechPower.name}</strong>
                    </li>
                  )}
                  {selectedManeuver && (
                    <li>
                      Yeni Manevra: <strong>{selectedManeuver.name}</strong>
                    </li>
                  )}
                  {selectedNewSkill && (
                    <li>
                      Yeni Beceri Yetkinliği: <strong>{selectedNewSkill}</strong>
                    </li>
                  )}
                </ul>
              </div>

              <div className="wizard-actions">
                <button className="wizard-btn back-btn" onClick={() => setStep(2)}>
                  Geri
                </button>
                <button className="wizard-btn finish-btn" onClick={handleFinish}>
                  <Sparkles size={18} /> Terfiyi Tamamla ve Uygula
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
