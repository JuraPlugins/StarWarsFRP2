import React, { useState } from 'react';
import { X, Dices, RotateCcw, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DiceRollResult, rollDie, rollD20, rollFormula } from '../utils/dice';
import { sounds } from '../utils/soundEffects';

interface DiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCharacterName: string;
  rollHistory: DiceRollResult[];
  onAddRoll: (result: DiceRollResult) => void;
  onClearHistory: () => void;
}

export const DiceRollerModal: React.FC<DiceRollerModalProps> = ({
  isOpen,
  onClose,
  activeCharacterName,
  rollHistory,
  onAddRoll,
  onClearHistory,
}) => {
  const [advantageMode, setAdvantageMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [customFormula, setCustomFormula] = useState('');
  const [modifier, setModifier] = useState<number>(0);
  const [latestRoll, setLatestRoll] = useState<DiceRollResult | null>(null);

  if (!isOpen) return null;

  const handleRollD20 = () => {
    sounds.playDiceRoll();
    const result = rollD20('Serbest d20 Zarı', activeCharacterName, modifier, advantageMode);
    setLatestRoll(result);
    onAddRoll(result);
    if (result.isNat20) sounds.playLevelUp();
  };

  const handleRollDie = (sides: number) => {
    sounds.playDiceRoll();
    const val = rollDie(sides);
    const total = val + modifier;
    const result: DiceRollResult = {
      id: 'roll-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rollerName: activeCharacterName,
      label: `d${sides} Zarı`,
      formula: `1d${sides}${modifier !== 0 ? (modifier > 0 ? '+' + modifier : modifier) : ''}`,
      rolls: [val],
      modifier,
      total,
      details: `d${sides} [${val}] ${modifier !== 0 ? (modifier > 0 ? '+ ' + modifier : '- ' + Math.abs(modifier)) : ''} = ${total}`,
    };
    setLatestRoll(result);
    onAddRoll(result);
  };

  const handleCustomRoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormula.trim()) return;
    sounds.playDiceRoll();
    try {
      const result = rollFormula(customFormula, 'Özel Formül', activeCharacterName);
      setLatestRoll(result);
      onAddRoll(result);
    } catch {
      alert('Geçersiz zar formülü. Örnek: 2d8 + 3, 1d12 + 2d6');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container holographic-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Dices className="modal-icon text-cyan" />
            <div>
              <h2 className="modal-title">HOLONET TAKTİK ZAR SİSTEMİ</h2>
              <span className="modal-subtitle">Operatör: {activeCharacterName}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body dice-modal-grid">
          {/* Left: Interactive Dice Controls */}
          <div className="dice-controls-panel">
            {/* Advantage Mode Selectors */}
            <div className="control-section">
              <label className="section-label">D20 MODU (AVANTAJ / DEZAVANTAJ)</label>
              <div className="button-group advantage-group">
                <button
                  type="button"
                  className={`btn-mode ${advantageMode === 'advantage' ? 'active-adv' : ''}`}
                  onClick={() => setAdvantageMode('advantage')}
                >
                  🟢 AVANTAJ
                </button>
                <button
                  type="button"
                  className={`btn-mode ${advantageMode === 'normal' ? 'active-norm' : ''}`}
                  onClick={() => setAdvantageMode('normal')}
                >
                  ⚪ NORMAL
                </button>
                <button
                  type="button"
                  className={`btn-mode ${advantageMode === 'disadvantage' ? 'active-dis' : ''}`}
                  onClick={() => setAdvantageMode('disadvantage')}
                >
                  🔴 DEZAVANTAJ
                </button>
              </div>
            </div>

            {/* Modifier selector */}
            <div className="control-section">
              <label className="section-label">STAT / EK MODİFİKASYON</label>
              <div className="modifier-stepper">
                <button className="step-btn" onClick={() => setModifier((m) => m - 1)}>
                  -1
                </button>
                <span className="mod-display">{modifier >= 0 ? `+${modifier}` : modifier}</span>
                <button className="step-btn" onClick={() => setModifier((m) => m + 1)}>
                  +1
                </button>
                <button className="step-btn reset-step" onClick={() => setModifier(0)}>
                  Sıfırla
                </button>
              </div>
            </div>

            {/* Quick d20 Action */}
            <div className="control-section main-d20-section">
              <button className="big-d20-roll-btn" onClick={handleRollD20}>
                <Dices size={28} />
                <div className="btn-text-block">
                  <span className="d20-bold">d20 KONTROLÜ AT</span>
                  <span className="d20-sub">
                    {advantageMode.toUpperCase()} | Mod: {modifier >= 0 ? `+${modifier}` : modifier}
                  </span>
                </div>
              </button>
            </div>

            {/* Quick Standard Dice */}
            <div className="control-section">
              <label className="section-label">STANDART ZARLAR</label>
              <div className="quick-dice-grid">
                {[4, 6, 8, 10, 12, 100].map((sides) => (
                  <button key={sides} className="quick-die-btn" onClick={() => handleRollDie(sides)}>
                    d{sides}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Formula */}
            <div className="control-section">
              <label className="section-label">ÖZEL ZAR FORMÜLÜ</label>
              <form onSubmit={handleCustomRoll} className="formula-form">
                <input
                  type="text"
                  placeholder="Örn: 2d8 + 3, 1d12 + 1d6"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  className="formula-input"
                />
                <button type="submit" className="formula-submit-btn">
                  At
                </button>
              </form>
            </div>
          </div>

          {/* Right: Latest Result & History Log */}
          <div className="dice-results-panel">
            {/* Highlighted Latest Result */}
            {latestRoll && (
              <div
                className={`latest-result-card ${
                  latestRoll.isNat20 ? 'crit-success' : latestRoll.isNat1 ? 'crit-fail' : ''
                }`}
              >
                <div className="latest-header">
                  <span className="latest-label">{latestRoll.label}</span>
                  <span className="latest-time">{latestRoll.timestamp}</span>
                </div>
                <div className="latest-total-display">
                  <span className="huge-total">{latestRoll.total}</span>
                  {latestRoll.isNat20 && (
                    <span className="crit-badge success">
                      <Sparkles size={16} /> KRİTİK BAŞARI (NAT 20)!
                    </span>
                  )}
                  {latestRoll.isNat1 && (
                    <span className="crit-badge failure">
                      <AlertTriangle size={16} /> KRİTİK BAŞARISIZLIK (NAT 1)!
                    </span>
                  )}
                </div>
                <div className="latest-details">{latestRoll.details}</div>
              </div>
            )}

            {/* History Feed */}
            <div className="history-header-row">
              <span className="history-title">SON ATILAN ZARLAR ({rollHistory.length})</span>
              {rollHistory.length > 0 && (
                <button className="clear-history-btn" onClick={onClearHistory}>
                  <RotateCcw size={12} /> Temizle
                </button>
              )}
            </div>

            <div className="history-feed">
              {rollHistory.length === 0 ? (
                <div className="empty-history">Henüz zar atılmadı. Bir zar seçip atın.</div>
              ) : (
                rollHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`history-item ${item.isNat20 ? 'item-nat20' : item.isNat1 ? 'item-nat1' : ''}`}
                  >
                    <div className="history-item-top">
                      <strong className="item-label">{item.label}</strong>
                      <span className="item-roller">{item.rollerName}</span>
                      <span className="item-time">{item.timestamp}</span>
                    </div>
                    <div className="history-item-bottom">
                      <span className="item-details">{item.details}</span>
                      <strong className="item-total-badge">{item.total}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
