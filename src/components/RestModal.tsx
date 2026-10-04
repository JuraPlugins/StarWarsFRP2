import React, { useState } from 'react';
import { X, Moon, Sun, Heart, Sparkles } from 'lucide-react';
import { Character } from '../types/character';
import { sounds } from '../utils/soundEffects';
import { rollDie } from '../utils/dice';

interface RestModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  activeCharId: string;
  onUpdateCharacter: (updated: Character) => void;
  onUpdateAllCharacters: (updatedList: Character[]) => void;
}

export const RestModal: React.FC<RestModalProps> = ({
  isOpen,
  onClose,
  characters,
  activeCharId,
  onUpdateCharacter,
  onUpdateAllCharacters,
}) => {
  const [restScope, setRestScope] = useState<'single' | 'team'>('single');
  const [restLog, setRestLog] = useState<string>('');

  if (!isOpen) return null;

  const activeChar = characters.find((c) => c.id === activeCharId) || characters[0];

  // KISA MOLA
  const handleShortRest = () => {
    sounds.playHeal();
    if (restScope === 'single') {
      let hpGained = 0;
      let newHitDice = activeChar.currentHitDice;

      if (newHitDice > 0 && activeChar.currentHp < activeChar.maxHp) {
        const dieRoll = rollDie(activeChar.hitDieType);
        const conMod = activeChar.abilities.CON.mod;
        hpGained = Math.max(1, dieRoll + conMod);
        newHitDice -= 1;
      }

      const updated: Character = {
        ...activeChar,
        currentHp: Math.min(activeChar.maxHp, activeChar.currentHp + hpGained),
        currentHitDice: newHitDice,
        secondWindAvailable: true,
        actionSurgeAvailable: true,
        superiorityDice: activeChar.superiorityDice
          ? { ...activeChar.superiorityDice, current: activeChar.superiorityDice.max }
          : undefined,
        techcasting: activeChar.techcasting
          ? {
              ...activeChar.techcasting,
              currentTp: Math.min(
                activeChar.techcasting.maxTp,
                activeChar.techcasting.currentTp + Math.ceil(activeChar.techcasting.maxTp / 3)
              ),
            }
          : undefined,
      };

      onUpdateCharacter(updated);
      setRestLog(
        `${activeChar.name} kısa mola verdi! ${
          hpGained > 0 ? `1 Hit Die harcanarak +${hpGained} HP kazanıldı.` : 'Mevcut HP zaten tamdı.'
        } Savaşçı yetenekleri ve manevralar yenilendi.`
      );
    } else {
      // Tüm tim kısa mola verir
      const updatedList = characters.map((char) => {
        let hpGained = 0;
        let newHitDice = char.currentHitDice;
        if (newHitDice > 0 && char.currentHp < char.maxHp) {
          const dieRoll = rollDie(char.hitDieType);
          hpGained = Math.max(1, dieRoll + char.abilities.CON.mod);
          newHitDice -= 1;
        }

        return {
          ...char,
          currentHp: Math.min(char.maxHp, char.currentHp + hpGained),
          currentHitDice: newHitDice,
          secondWindAvailable: true,
          actionSurgeAvailable: true,
          superiorityDice: char.superiorityDice
            ? { ...char.superiorityDice, current: char.superiorityDice.max }
            : undefined,
          techcasting: char.techcasting
            ? {
                ...char.techcasting,
                currentTp: Math.min(
                  char.techcasting.maxTp,
                  char.techcasting.currentTp + Math.ceil(char.techcasting.maxTp / 3)
                ),
              }
            : undefined,
        };
      });

      onUpdateAllCharacters(updatedList);
      setRestLog('Tüm Vorn Timi kısa mola verdi! Taktiksel yetenekler ve harcanan zarlar yenilendi.');
    }
  };

  // UZUN MOLA (LONG REST)
  const handleLongRest = () => {
    sounds.playHeal();
    if (restScope === 'single') {
      const updated: Character = {
        ...activeChar,
        currentHp: activeChar.maxHp,
        tempHp: 0,
        currentHitDice: activeChar.maxHitDice,
        secondWindAvailable: true,
        actionSurgeAvailable: true,
        superiorityDice: activeChar.superiorityDice
          ? { ...activeChar.superiorityDice, current: activeChar.superiorityDice.max }
          : undefined,
        techcasting: activeChar.techcasting
          ? { ...activeChar.techcasting, currentTp: activeChar.techcasting.maxTp }
          : undefined,
        companionDroid: activeChar.companionDroid
          ? { ...activeChar.companionDroid, hp: activeChar.companionDroid.maxHp }
          : undefined,
      };

      onUpdateCharacter(updated);
      setRestLog(`${activeChar.name} 8 saatlik tam Uzun Mola tamamladı! HP, Hit Dice ve tüm Tech/Manevralar %100 yenilendi.`);
    } else {
      const updatedList = characters.map((char) => ({
        ...char,
        currentHp: char.maxHp,
        tempHp: 0,
        currentHitDice: char.maxHitDice,
        secondWindAvailable: true,
        actionSurgeAvailable: true,
        superiorityDice: char.superiorityDice
          ? { ...char.superiorityDice, current: char.superiorityDice.max }
          : undefined,
        techcasting: char.techcasting
          ? { ...char.techcasting, currentTp: char.techcasting.maxTp }
          : undefined,
        companionDroid: char.companionDroid
          ? { ...char.companionDroid, hp: char.companionDroid.maxHp }
          : undefined,
      }));

      onUpdateAllCharacters(updatedList);
      setRestLog('Vorn Timi tam operasyonel uzun mola gerçekleştirdi! Tüm birimlerin kalkan, sağlık ve cephaneleri tazelendi.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container rest-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Moon className="modal-icon text-amber" />
            <div>
              <h2 className="modal-title">GÜVENLİ SIĞINAK DİNLENME PROTOKOLÜ</h2>
              <span className="modal-subtitle">Kısa ve Uzun Mola Yönetimi</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body rest-modal-body">
          {/* Scope Selector */}
          <div className="rest-scope-selector">
            <span className="section-label">UYGULANACAK BİRİM:</span>
            <div className="button-group">
              <button
                type="button"
                className={`btn-mode ${restScope === 'single' ? 'active-norm' : ''}`}
                onClick={() => setRestScope('single')}
              >
                SADECE {activeChar.name.toUpperCase()}
              </button>
              <button
                type="button"
                className={`btn-mode ${restScope === 'team' ? 'active-adv' : ''}`}
                onClick={() => setRestScope('team')}
              >
                TÜM VORN TİMİ (4 OPERATİF)
              </button>
            </div>
          </div>

          {/* Rest Options Cards */}
          <div className="rest-options-grid">
            {/* Short Rest Card */}
            <div className="rest-card short-rest-card">
              <div className="rest-card-icon-wrap">
                <Sun className="rest-type-icon text-amber" size={28} />
              </div>
              <h3 className="rest-card-title">KISA MOLA (1 SAAT)</h3>
              <p className="rest-card-desc">
                Operatifler yaralarını sarar ve silah bataryalarını soğutur.
              </p>
              <ul className="rest-benefits-list">
                <li>1 Hit Die (Can Zarı) harcayarak HP yeniler.</li>
                <li>Second Wind ve Action Surge yeteneklerini yeniler.</li>
                <li>Taktisyen Üstünlük Zarlarını (Superiority Dice) tazeler.</li>
                <li>Tech Noktalarının 1/3'ünü şarj eder.</li>
              </ul>
              <button className="btn-action-rest short-btn" onClick={handleShortRest}>
                <Sparkles size={16} /> Kısa Mola Uygula
              </button>
            </div>

            {/* Long Rest Card */}
            <div className="rest-card long-rest-card">
              <div className="rest-card-icon-wrap">
                <Moon className="rest-type-icon text-cyan" size={28} />
              </div>
              <h3 className="rest-card-title">UZUN MOLA (8 SAAT)</h3>
              <p className="rest-card-desc">
                İmparatorluk üssünde veya güvenli bir mekanda tam uyku ve bakım.
              </p>
              <ul className="rest-benefits-list">
                <li>Tüm Can Puanı (HP) maksimuma çıkar.</li>
                <li>Tüm Hit Dice zarları geri kazanılır.</li>
                <li>Tüm Tech Noktaları (TP) tam kapasiteye ulaşır.</li>
                <li>Destek Droidi tamir edilir ve kalkanlar sıfırlanır.</li>
              </ul>
              <button className="btn-action-rest long-btn" onClick={handleLongRest}>
                <Heart size={16} /> Uzun Mola Uygula
              </button>
            </div>
          </div>

          {/* Feedback log */}
          {restLog && (
            <div className="rest-log-alert">
              <Sparkles size={18} className="text-cyan" />
              <span>{restLog}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
