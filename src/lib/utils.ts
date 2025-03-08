import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "Data não disponível";

  const dateObject = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObject);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
}

// Funções específicas para D&D
export function calculateModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function calculateProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

export function getAbilityScoreLabels() {
  return {
    strength: "Força",
    dexterity: "Destreza",
    constitution: "Constituição",
    intelligence: "Inteligência",
    wisdom: "Sabedoria",
    charisma: "Carisma",
  };
}

export function getSkillToAbilityMap() {
  return {
    acrobatics: "dexterity",
    animalHandling: "wisdom",
    arcana: "intelligence",
    athletics: "strength",
    deception: "charisma",
    history: "intelligence",
    insight: "wisdom",
    intimidation: "charisma",
    investigation: "intelligence",
    medicine: "wisdom",
    nature: "intelligence",
    perception: "wisdom",
    performance: "charisma",
    persuasion: "charisma",
    religion: "intelligence",
    sleightOfHand: "dexterity",
    stealth: "dexterity",
    survival: "wisdom",
  };
}

export function getSkillLabels() {
  return {
    acrobatics: "Acrobacia",
    animalHandling: "Adestrar Animais",
    arcana: "Arcanismo",
    athletics: "Atletismo",
    deception: "Enganação",
    history: "História",
    insight: "Intuição",
    intimidation: "Intimidação",
    investigation: "Investigação",
    medicine: "Medicina",
    nature: "Natureza",
    perception: "Percepção",
    performance: "Atuação",
    persuasion: "Persuasão",
    religion: "Religião",
    sleightOfHand: "Prestidigitação",
    stealth: "Furtividade",
    survival: "Sobrevivência",
  };
}
