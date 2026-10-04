export interface DiceRollResult {
  id: string;
  timestamp: string;
  rollerName: string;
  label: string;
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  isNat20?: boolean;
  isNat1?: boolean;
  advantageMode?: 'normal' | 'advantage' | 'disadvantage';
  details: string;
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollD20(
  label: string,
  rollerName: string,
  modifier: number = 0,
  mode: 'normal' | 'advantage' | 'disadvantage' = 'normal'
): DiceRollResult {
  const roll1 = rollDie(20);
  const roll2 = rollDie(20);
  let finalD20 = roll1;

  if (mode === 'advantage') {
    finalD20 = Math.max(roll1, roll2);
  } else if (mode === 'disadvantage') {
    finalD20 = Math.min(roll1, roll2);
  }

  const total = finalD20 + modifier;
  const isNat20 = finalD20 === 20;
  const isNat1 = finalD20 === 1;

  let details = `d20 (${finalD20})`;
  if (mode !== 'normal') {
    details = `Zarlar: [${roll1}, ${roll2}] -> Seçilen: ${finalD20}`;
  }
  if (modifier !== 0) {
    details += ` + Mod (${modifier > 0 ? '+' : ''}${modifier}) = ${total}`;
  } else {
    details += ` = ${total}`;
  }

  return {
    id: 'roll-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rollerName,
    label,
    formula: `1d20${modifier >= 0 ? '+' + modifier : modifier}`,
    rolls: mode === 'normal' ? [roll1] : [roll1, roll2],
    modifier,
    total,
    isNat20,
    isNat1,
    advantageMode: mode,
    details,
  };
}

export function rollFormula(
  formula: string,
  label: string,
  rollerName: string
): DiceRollResult {
  // e.g. "1d10 + 3", "2d6", "1d12 + 1d6 + 3"
  // Normalize
  const clean = formula.replace(/\s+/g, '');
  const parts = clean.split(/([+-])/);
  
  let total = 0;
  const allRolls: number[] = [];
  const breakdownParts: string[] = [];

  let currentOp = '+';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === '+' || part === '-') {
      currentOp = part;
      continue;
    }

    if (part.includes('d')) {
      const [countStr, sidesStr] = part.split('d');
      const count = parseInt(countStr || '1', 10);
      const sides = parseInt(sidesStr, 10);
      const subRolls: number[] = [];

      for (let c = 0; c < count; c++) {
        const val = rollDie(sides);
        subRolls.push(val);
        allRolls.push(val);
      }

      const sum = subRolls.reduce((a, b) => a + b, 0);
      if (currentOp === '+') {
        total += sum;
      } else {
        total -= sum;
      }
      breakdownParts.push(`${count}d${sides} [${subRolls.join(', ')}]`);
    } else {
      const val = parseInt(part, 10);
      if (!isNaN(val)) {
        if (currentOp === '+') {
          total += val;
        } else {
          total -= val;
        }
        breakdownParts.push(`${val}`);
      }
    }
  }

  return {
    id: 'roll-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rollerName,
    label,
    formula,
    rolls: allRolls,
    modifier: 0,
    total,
    details: `${breakdownParts.join(' + ')} = ${total}`,
  };
}
