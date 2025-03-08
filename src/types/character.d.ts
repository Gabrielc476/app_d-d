export interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background?: string;
  alignment?: string;
  experience: number;

  // Ability scores
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  // Character stats
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  armorClass: number;
  initiativeBonus: number;
  speed: number;

  // Additional info
  proficiencies?: Proficiencies;
  equipment?: EquipmentItem[];
  spells?: Spell[];
  features?: Feature[];
  appearance?: string;
  backstory?: string;
  notes?: string;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proficiencies {
  savingThrows?: string[];
  skills?: string[];
  languages?: string[];
  tools?: string[];
  armorTypes?: string[];
  weaponTypes?: string[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  weight?: number;
  value?: number;
  equipped?: boolean;
  itemType?: string;
  properties?: any;
}

export interface Feature {
  name: string;
  source: string;
  level: number;
  description: string;
  usages?: {
    count: number;
    maximum: number;
    resetOn: "shortRest" | "longRest" | "daily";
  };
}

export interface CharacterFormData {
  name: string;
  race: string;
  class: string;
  level: number;
  background?: string;
  alignment?: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints?: number;
  armorClass: number;
  initiativeBonus?: number;
  speed?: number;
  appearance?: string;
  backstory?: string;
  notes?: string;
}

export interface CharacterLevelUp {
  id: string;
  experience?: number;
  hitPointsIncrease?: number;
  maxHitPoints?: number;
}

export interface CharacterHitPointsUpdate {
  id: string;
  currentHitPoints?: number;
  temporaryHitPoints?: number;
}

export interface CharacterListResponse {
  success: boolean;
  count: number;
  data: Character[];
}

export interface CharacterResponse {
  success: boolean;
  data: Character;
}
