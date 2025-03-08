import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import socket from "@/lib/socket";

export type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

export interface DiceRoll {
  id: string;
  userId: string;
  username: string;
  characterName?: string;
  diceType: DiceType;
  diceCount: number;
  modifier: number;
  results: number[];
  total: number;
  rollType?: string;
  rollLabel?: string;
  advantage: boolean;
  disadvantage: boolean;
  isPrivate: boolean;
  timestamp: Date;
}

interface DiceState {
  // Estados
  history: DiceRoll[];
  currentCampaignId: string | null;
  isRolling: boolean;

  // Ações
  setCurrentCampaignId: (campaignId: string | null) => void;
  rollDice: (params: {
    diceType: DiceType;
    diceCount: number;
    modifier?: number;
    rollType?: string;
    rollLabel?: string;
    advantage?: boolean;
    disadvantage?: boolean;
    isPrivate?: boolean;
    characterName?: string;
  }) => Promise<DiceRoll>;
  clearHistory: () => void;
  addDiceRoll: (roll: DiceRoll) => void;
}

// Helper para gerar resultados de dados aleatórios
const generateRandomDiceRolls = (
  diceType: DiceType,
  count: number
): number[] => {
  const sides = parseInt(diceType.substring(1));
  const results: number[] = [];

  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }

  return results;
};

// Zustand store para gerenciar estado dos dados
export const useDiceStore = create<DiceState>((set, get) => ({
  history: [],
  currentCampaignId: null,
  isRolling: false,

  // Define a campanha atual
  setCurrentCampaignId: (campaignId) => set({ currentCampaignId: campaignId }),

  // Rola os dados
  rollDice: async (params) => {
    const {
      diceType,
      diceCount,
      modifier = 0,
      rollType,
      rollLabel,
      advantage = false,
      disadvantage = false,
      isPrivate = false,
      characterName,
    } = params;

    // Iniciar animação
    set({ isRolling: true });

    // Gerar um ID temporário para o roll
    const tempId = uuidv4();

    try {
      // Emitir evento para o Socket.IO se estivermos em uma campanha
      if (get().currentCampaignId && socket.connected) {
        // Usar Socket.IO para rolagem em tempo real
        socket.emit("rollDice", {
          campaignId: get().currentCampaignId,
          diceType,
          diceCount,
          modifier,
          rollType,
          rollLabel,
          advantage,
          disadvantage,
          isPrivate,
          characterName,
        });

        // A resposta virá como um evento 'diceRollResult'
        // que é tratado no componente de contexto de socket

        // Simulamos um resultado para retornar imediatamente
        const results = generateRandomDiceRolls(diceType, diceCount);
        const total = results.reduce((sum, val) => sum + val, 0) + modifier;

        const diceRoll: DiceRoll = {
          id: tempId,
          userId: "local",
          username: "Você",
          characterName,
          diceType,
          diceCount,
          modifier,
          results,
          total,
          rollType,
          rollLabel,
          advantage,
          disadvantage,
          isPrivate,
          timestamp: new Date(),
        };

        // Adicionar o roll ao histórico
        set((state) => ({
          history: [diceRoll, ...state.history].slice(0, 50), // Limitar histórico a 50 rolls
        }));

        // Terminar animação após um atraso para dar tempo de ver o resultado
        setTimeout(() => {
          set({ isRolling: false });
        }, 1000);

        return diceRoll;
      } else {
        // Modo offline ou sem campanha - apenas simular localmente
        const results = generateRandomDiceRolls(diceType, diceCount);
        let total = 0;

        if (advantage || disadvantage) {
          // Para vantagem/desvantagem, lançamos dois d20 e pegamos o maior/menor
          if (diceType === "d20" && diceCount === 1) {
            const roll1 = generateRandomDiceRolls(diceType, 1)[0];
            const roll2 = generateRandomDiceRolls(diceType, 1)[0];

            const results = [roll1, roll2];
            total =
              (advantage ? Math.max(roll1, roll2) : Math.min(roll1, roll2)) +
              modifier;
          } else {
            // Sem suporte para vantagem/desvantagem em outros tipos de dados
            total = results.reduce((sum, val) => sum + val, 0) + modifier;
          }
        } else {
          total = results.reduce((sum, val) => sum + val, 0) + modifier;
        }

        const diceRoll: DiceRoll = {
          id: tempId,
          userId: "local",
          username: "Você",
          characterName,
          diceType,
          diceCount,
          modifier,
          results,
          total,
          rollType,
          rollLabel,
          advantage,
          disadvantage,
          isPrivate,
          timestamp: new Date(),
        };

        // Adicionar o roll ao histórico
        set((state) => ({
          history: [diceRoll, ...state.history].slice(0, 50), // Limitar histórico a 50 rolls
        }));

        // Terminar animação após um atraso para dar tempo de ver o resultado
        setTimeout(() => {
          set({ isRolling: false });
        }, 1000);

        return diceRoll;
      }
    } catch (error) {
      console.error("Erro ao rolar dados:", error);
      set({ isRolling: false });
      throw error;
    }
  },

  // Limpar histórico
  clearHistory: () => set({ history: [] }),

  // Adicionar um roll recebido via socket
  addDiceRoll: (roll) =>
    set((state) => ({
      history: [roll, ...state.history].slice(0, 50), // Limitar histórico a 50 rolls
    })),
}));
