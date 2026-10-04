export type AbilityName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface AbilityScore {
  score: number;
  mod: number;
  saveMod: number;
  saveProficient: boolean;
}

export interface Skill {
  name: string;
  nameTr: string;
  ability: AbilityName;
  proficient: boolean;
  expertise: boolean;
  bonus: number;
}

export interface AttackAction {
  id: string;
  name: string;
  type: 'Ranged' | 'Melee' | 'Tech';
  range: string;
  toHit: number;
  damage: string;
  damageType: string;
  properties?: string;
  notes?: string;
}

export interface SpecialFeature {
  id: string;
  name: string;
  source: string;
  usage?: string;
  maxUses?: number;
  currentUses?: number;
  recharge?: 'Short Rest' | 'Long Rest' | 'Special';
  description: string;
}

export interface Item {
  id: string;
  name: string;
  category: 'Blaster' | 'Vibro' | 'Zırh' | 'Kalkan' | 'Patlayıcı' | 'Medikal' | 'Tech' | 'Alet' | 'Sibernetik' | 'Mod' | 'Force';
  cost: number; // credits
  weight: number; // lbs
  rarity: 'Standart' | 'Premium' | 'Prototip' | 'Askeri' | 'Özel';
  description: string;
  stats?: string;
  equipped?: boolean;
  quantity?: number;
}

export interface ForcePower {
  id: string;
  name: string;
  level: number; // 0 for at-will
  alignment: 'Light' | 'Dark' | 'Universal';
  forceCost: number; // Force points
  castingTime: string;
  range: string;
  duration: string;
  description: string;
}

export interface TechPower {
  id: string;
  name: string;
  level: number; // 0 for at-will / cantrip
  cost: number; // TP cost
  castingTime: string;
  range: string;
  duration: string;
  description: string;
}

export interface Maneuver {
  id: string;
  name: string;
  cost: string; // e.g. "1 Üstünlük Zarı"
  description: string;
}

export interface CompanionDroid {
  name: string;
  model: string;
  ac: number;
  hp: number;
  maxHp: number;
  actions: string[];
  description: string;
}

export interface Character {
  id: string;
  dossierNumber: string;
  name: string;
  title: string;
  quote: string;
  class: string;
  archetype: string;
  level: number;
  species: string;
  background: string;
  role: string;
  proficiencyBonus: number;
  speed: number;
  initiative: number;
  passivePerception: number;
  armorClass: number;
  hitDieType: number; // 8, 10, 12
  currentHitDice: number;
  maxHitDice: number;
  
  // Health
  currentHp: number;
  maxHp: number;
  tempHp: number;
  
  // Currency
  credits: number;

  // Abilities
  abilities: Record<AbilityName, AbilityScore>;
  
  // Skills
  skills: Skill[];

  // Class Resources
  superiorityDice?: {
    current: number;
    max: number;
    die: string; // 'd8'
    dc: number;
    maneuvers: Maneuver[];
  };

  techcasting?: {
    currentTp: number;
    maxTp: number;
    saveDc: number;
    attackBonus: number;
    casterType: 'Half' | 'Full';
    powers: TechPower[];
  };

  secondWindAvailable?: boolean;
  actionSurgeAvailable?: boolean;
  targetAssessed?: string; // Silas hunter's quarry
  companionDroid?: CompanionDroid; // Elias

  // Conditions (Kör, Zehirli, Felçli vb.)
  conditions?: string[];

  // Forcecasting (if force sensitive)
  forcecasting?: {
    currentFp: number;
    maxFp: number;
    saveDc: number;
    attackBonus: number;
    powers: ForcePower[];
  };

  // Operational Mission Notes
  missionNotes?: string;

  // Equipment & Attacks
  attacks: AttackAction[];
  inventory: Item[];
  features: SpecialFeature[];
}
