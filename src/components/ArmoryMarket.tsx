import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, Plus, Check, Coins, Shield, Crosshair, Wrench, Sparkles, Trash2 } from 'lucide-react';
import { Character, Item } from '../types/character';
import { SW5E_ITEMS } from '../data/sw5eCompendium';
import { sounds } from '../utils/soundEffects';

interface ArmoryMarketProps {
  characters: Character[];
  onUpdateCharacter: (char: Character) => void;
  onOpenDiceRoller: () => void;
}

export const ArmoryMarket: React.FC<ArmoryMarketProps> = ({
  characters,
  onUpdateCharacter,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0].id);
  const [activeCategory, setActiveCategory] = useState<string>('Hepsi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Custom Item Form State
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<Item['category']>('Blaster');
  const [customCost, setCustomCost] = useState(250);
  const [customWeight, setCustomWeight] = useState(2);
  const [customStats, setCustomStats] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const activeChar = characters.find((c) => c.id === selectedCharId) || characters[0];

  const categories = ['Hepsi', 'Blaster', 'Vibro', 'Zırh', 'Patlayıcı', 'Medikal', 'Tech', 'Sibernetik'];

  const filteredItems = SW5E_ITEMS.filter((item) => {
    const matchesCat = activeCategory === 'Hepsi' || item.category === activeCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.stats && item.stats.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleBuyItem = (item: Item) => {
    if (activeChar.credits < item.cost) {
      alert(`Yetersiz Kredi! ${activeChar.name} bu eşya için ${item.cost} krediye ihtiyaç duyuyor (Mevcut: ${activeChar.credits} Kredi).`);
      return;
    }

    sounds.playTech();

    const newItem: Item = {
      ...item,
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      equipped: true,
      quantity: 1,
    };

    const updatedChar: Character = {
      ...activeChar,
      credits: activeChar.credits - item.cost,
      inventory: [newItem, ...activeChar.inventory],
    };

    onUpdateCharacter(updatedChar);
  };

  const handleToggleEquip = (itemId: string) => {
    sounds.playClick();
    const updatedInventory = activeChar.inventory.map((inv) =>
      inv.id === itemId ? { ...inv, equipped: !inv.equipped } : inv
    );
    onUpdateCharacter({
      ...activeChar,
      inventory: updatedInventory,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!window.confirm('Bu eşyayı envanterden silmek istediğinize emin misiniz?')) return;
    sounds.playClick();
    const updatedInventory = activeChar.inventory.filter((inv) => inv.id !== itemId);
    onUpdateCharacter({
      ...activeChar,
      inventory: updatedInventory,
    });
  };

  const handleAddCredits = (amount: number) => {
    sounds.playTech();
    onUpdateCharacter({
      ...activeChar,
      credits: Math.max(0, activeChar.credits + amount),
    });
  };

  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    sounds.playTech();
    const newItem: Item = {
      id: 'custom-' + Date.now(),
      name: customName,
      category: customCategory,
      cost: customCost,
      weight: customWeight,
      rarity: 'Özel',
      stats: customStats,
      description: customDesc || 'Özel yapım donanım.',
      equipped: true,
      quantity: 1,
    };

    onUpdateCharacter({
      ...activeChar,
      inventory: [newItem, ...activeChar.inventory],
    });

    setShowCustomModal(false);
    setCustomName('');
    setCustomStats('');
    setCustomDesc('');
  };

  return (
    <div className="armory-view">
      {/* Top Banner & Purchaser Switcher */}
      <div className="armory-top-header">
        <div className="armory-brand">
          <ShoppingCart className="text-cyan" size={32} />
          <div>
            <h2 className="section-title">İMPARATORLUK CEPHANELİK VE EKİPMAN VERİTABANI</h2>
            <span className="section-desc">SW5e Silah, Zırh, Mühimmat ve Sibernetik Donanım Marketi</span>
          </div>
        </div>

        {/* Character Selector & Balance */}
        <div className="purchaser-card">
          <div className="purchaser-select-wrap">
            <label className="field-label">ALICI OPERATİF:</label>
            <select
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
              className="dark-select purchaser-select"
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.class})
                </option>
              ))}
            </select>
          </div>

          <div className="credit-balance-box">
            <Coins className="text-amber" size={20} />
            <div className="balance-info">
              <span className="balance-label">Kredi Bakiyesi:</span>
              <strong className="balance-amount">{activeChar.credits.toLocaleString('tr-TR')} ¢</strong>
            </div>
            <div className="quick-credit-btns">
              <button className="add-credit-btn" onClick={() => handleAddCredits(100)} title="+100 Kredi Ekle">
                +100
              </button>
              <button className="add-credit-btn" onClick={() => handleAddCredits(500)} title="+500 Kredi Ekle">
                +500
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Catalog, Right Current Inventory */}
      <div className="armory-grid-layout">
        {/* Left Column: Catalog & Search */}
        <div className="catalog-column">
          <div className="catalog-filter-bar">
            {/* Search Input */}
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="İtem adı, hasar veya özellik ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Custom Item Trigger */}
            <button className="btn-custom-item" onClick={() => setShowCustomModal(true)}>
              <Plus size={16} /> Özel İtem Ekle
            </button>
          </div>

          {/* Categories Pills */}
          <div className="categories-pill-row">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Item Catalog List */}
          <div className="catalog-items-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="catalog-item-card">
                <div className="catalog-item-header">
                  <div className="item-title-box">
                    <span className="item-cat-badge">{item.category}</span>
                    <h4 className="item-name">{item.name}</h4>
                  </div>
                  <div className="item-cost-badge">
                    <Coins size={14} className="text-amber" />
                    <span>{item.cost} ¢</span>
                  </div>
                </div>

                {item.stats && (
                  <div className="item-stats-strip">
                    <Crosshair size={14} className="text-cyan" />
                    <span>{item.stats}</span>
                  </div>
                )}

                <p className="item-desc-text">{item.description}</p>

                <div className="catalog-item-footer">
                  <span className="item-weight-tag">{item.weight} lbs</span>
                  <button
                    className={`btn-buy-item ${activeChar.credits < item.cost ? 'disabled' : ''}`}
                    onClick={() => handleBuyItem(item)}
                    disabled={activeChar.credits < item.cost}
                  >
                    <Plus size={16} /> Satın Al & Kuşan ({item.cost} ¢)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Operative's Current Backpack / Inventory */}
        <div className="inventory-column">
          <div className="inventory-header">
            <h3 className="inv-title">
              {activeChar.name.toUpperCase()} ENVANTERİ ({activeChar.inventory.length})
            </h3>
            <span className="inv-subtitle">
              Taşınan Ağırlık:{' '}
              {activeChar.inventory.reduce((sum, it) => sum + (it.weight || 0) * (it.quantity || 1), 0).toFixed(1)}{' '}
              lbs
            </span>
          </div>

          <div className="inventory-list">
            {activeChar.inventory.length === 0 ? (
              <div className="empty-inv-msg">Envanter boş. Sol taraftan ekipman temin edin.</div>
            ) : (
              activeChar.inventory.map((inv) => (
                <div key={inv.id} className={`inv-entry ${inv.equipped ? 'equipped-entry' : ''}`}>
                  <div className="inv-entry-top">
                    <div className="inv-name-group">
                      <strong className="inv-item-name">{inv.name}</strong>
                      <span className="inv-cat">{inv.category}</span>
                    </div>
                    <div className="inv-actions">
                      <button
                        className={`btn-equip-toggle ${inv.equipped ? 'is-equipped' : ''}`}
                        onClick={() => handleToggleEquip(inv.id)}
                        title={inv.equipped ? 'Kuşanmayı Kaldır' : 'Kuşan'}
                      >
                        {inv.equipped ? 'KUŞANILDI' : 'ÇANTADA'}
                      </button>
                      <button
                        className="btn-del-item"
                        onClick={() => handleDeleteItem(inv.id)}
                        title="Envanterden Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {inv.stats && <div className="inv-stats-text">{inv.stats}</div>}
                  <div className="inv-desc-text">{inv.description}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Custom Item Modal */}
      {showCustomModal && (
        <div className="modal-backdrop" onClick={() => setShowCustomModal(false)}>
          <div className="modal-container custom-item-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">YENİ ÖZEL EKİPMAN OLUŞTUR</h3>
              <button className="modal-close-btn" onClick={() => setShowCustomModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateCustomItem} className="modal-body custom-form">
              <div className="form-group">
                <label>Eşya Adı:</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ağır Plazma Tabancası"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="dark-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kategori:</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as Item['category'])}
                    className="dark-select"
                  >
                    <option value="Blaster">Blaster</option>
                    <option value="Vibro">Vibro Silah</option>
                    <option value="Zırh">Zırh</option>
                    <option value="Patlayıcı">Patlayıcı</option>
                    <option value="Medikal">Medikal</option>
                    <option value="Tech">Tech</option>
                    <option value="Alet">Alet</option>
                    <option value="Sibernetik">Sibernetik</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Değer (Kredi ¢):</label>
                  <input
                    type="number"
                    value={customCost}
                    onChange={(e) => setCustomCost(Number(e.target.value))}
                    className="dark-input"
                  />
                </div>
                <div className="form-group">
                  <label>Ağırlık (lbs):</label>
                  <input
                    type="number"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(Number(e.target.value))}
                    className="dark-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hasar / Zırh / İstatistikler:</label>
                <input
                  type="text"
                  placeholder="Örn: 1d10 + 2 Enerji | Menzil 60/240 ft."
                  value={customStats}
                  onChange={(e) => setCustomStats(e.target.value)}
                  className="dark-input"
                />
              </div>

              <div className="form-group">
                <label>Açıklama / Özellikler:</label>
                <textarea
                  rows={3}
                  placeholder="Eşyanın özel kuralları veya hikayesi..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="dark-textarea"
                />
              </div>

              <div className="wizard-actions">
                <button
                  type="button"
                  className="wizard-btn back-btn"
                  onClick={() => setShowCustomModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="wizard-btn finish-btn">
                  <Sparkles size={16} /> Envantere Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
