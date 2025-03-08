import { create } from "zustand";
import socket from "@/lib/socket";
import { combatAPI } from "@/lib/api";

export type CombatStatus =
  | "preparando"
  | "em_andamento"
  | "pausado"
  | "concluido";
export type ParticipantType = "player" | "npc" | "monster";
export type ActionType =
  | "attack"
  | "spell"
  | "ability"
  | "movement"
  | "item"
  | "other";

export interface Condition {
  name: string;
  duration?: number;
  description?: string;
}

export interface CombatParticipant {
  id: string;
  combatSessionId: string;
  characterId?: string;
  name: string;
  type: ParticipantType;
  initiative: number;
  initiativeRoll?: number;
  armorClass: number;
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  conditions?: Condition[];
  stats?: any;
  isVisible: boolean;
  order: number;
  isActive: boolean;
  notes?: string;
  character?: {
    id: string;
    name: string;
    class: string;
    level: number;
  };
}

export interface CombatAction {
  id: string;
  combatSessionId: string;
  round: number;
  actorId: string;
  targetId?: string;
  actionType: ActionType;
  actionName: string;
  description?: string;
  rollData?: any;
  damage?: number;
  damageType?: string;
  success?: boolean;
  saveType?: string;
  saveDC?: number;
  createdAt: string;
  actor?: CombatParticipant;
  target?: CombatParticipant;
}

export interface CombatSession {
  id: string;
  campaignId?: string;
  name: string;
  description?: string;
  status: CombatStatus;
  round: number;
  currentTurnIndex: number;
  isActive: boolean;
  dungeonMasterId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  participants?: CombatParticipant[];
  actions?: CombatAction[];
  campaign?: {
    id: string;
    name: string;
  };
  dungeonMaster?: {
    id: string;
    username: string;
  };
}

interface CombatState {
  // Estados
  currentCombat: CombatSession | null;
  isLoading: boolean;
  error: string | null;
  isJoined: boolean;

  // Ações
  loadCombat: (combatId: string) => Promise<void>;
  joinCombatRoom: (combatId: string) => void;
  leaveCombatRoom: () => void;
  startCombat: () => Promise<void>;
  nextTurn: () => Promise<void>;
  pauseCombat: () => Promise<void>;
  resumeCombat: () => Promise<void>;
  endCombat: () => Promise<void>;
  addParticipant: (
    participant: Partial<CombatParticipant>
  ) => Promise<CombatParticipant>;
  updateParticipant: (
    participantId: string,
    updates: Partial<CombatParticipant>
  ) => Promise<void>;
  recordAction: (action: Partial<CombatAction>) => Promise<CombatAction>;

  // Atualizações via socket
  updateCombatState: (combat: CombatSession) => void;
  updateParticipantState: (participant: CombatParticipant) => void;
  addActionToHistory: (action: CombatAction) => void;
}

export const useCombatStore = create<CombatState>((set, get) => ({
  currentCombat: null,
  isLoading: false,
  error: null,
  isJoined: false,

  // Carrega os dados de um combate
  loadCombat: async (combatId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await combatAPI.getById(combatId);
      set({
        currentCombat: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Erro ao carregar combate:", error);
      set({
        error: error.response?.data?.message || "Erro ao carregar combate",
        isLoading: false,
      });
    }
  },

  // Entra na sala de combate via socket
  joinCombatRoom: (combatId) => {
    if (socket.connected) {
      socket.emit("joinCombat", combatId);
      set({ isJoined: true });
    }
  },

  // Sai da sala de combate
  leaveCombatRoom: () => {
    if (get().currentCombat) {
      socket.emit("leaveCombat", get().currentCombat.id);
      set({ isJoined: false });
    }
  },

  // Inicia o combate
  startCombat: async () => {
    const { currentCombat } = get();
    if (!currentCombat) return;

    set({ isLoading: true, error: null });

    try {
      const response = await combatAPI.start(currentCombat.id);
      set({
        currentCombat: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Erro ao iniciar combate:", error);
      set({
        error: error.response?.data?.message || "Erro ao iniciar combate",
        isLoading: false,
      });
    }
  },

  // Avança para o próximo turno
  nextTurn: async () => {
    const { currentCombat } = get();
    if (!currentCombat) return;

    set({ isLoading: true, error: null });

    try {
      const response = await combatAPI.nextTurn(currentCombat.id);
      set({
        currentCombat: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Erro ao avançar turno:", error);
      set({
        error: error.response?.data?.message || "Erro ao avançar turno",
        isLoading: false,
      });
    }
  },

  // Pausa o combate
  pauseCombat: async () => {
    const { currentCombat } = get();
    if (!currentCombat) return;

    set({ isLoading: true, error: null });

    try {
      const response = await combatAPI.toggleStatus(currentCombat.id, "pause");
      set({
        currentCombat: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Erro ao pausar combate:", error);
      set({
        error: error.response?.data?.message || "Erro ao pausar combate",
        isLoading: false,
      });
    }
  },

  // Retoma o combate
  resumeCombat: async () => {
    const { currentCombat } = get();
    if (!currentCombat) return;

    set({ isLoading: true, error: null });

    try {
      const response = await combatAPI.toggleStatus(currentCombat.id, "resume");
      set({
        currentCombat: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Erro ao retomar combate:", error);
      set({
        error: error.response?.data?.message || "Erro ao retomar combate",
        isLoading: false,
      });
    }
  },

  // Finaliza o combate
  endCombat: async () => {
    const { currentCombat } = get();
    if (!currentCombat) return;

    set({ isLoading: true, error: null });

    try {
      const response = await combatAPI.end(currentCombat.id);
      set({
        currentCombat: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Erro ao finalizar combate:", error);
      set({
        error: error.response?.data?.message || "Erro ao finalizar combate",
        isLoading: false,
      });
    }
  },

  // Adiciona um participante ao combate
  addParticipant: async (participant) => {
    const { currentCombat } = get();
    if (!currentCombat) throw new Error("Nenhum combate ativo");

    set({ isLoading: true, error: null });

    try {
      const response = await combatAPI.addParticipant(
        currentCombat.id,
        participant
      );

      // Não atualizamos o estado aqui, pois o socket se encarregará disso
      set({ isLoading: false });

      return response.data;
    } catch (error: any) {
      console.error("Erro ao adicionar participante:", error);
      set({
        error:
          error.response?.data?.message || "Erro ao adicionar participante",
        isLoading: false,
      });
      throw error;
    }
  },

  // Atualiza um participante
  updateParticipant: async (participantId, updates) => {
    const { currentCombat } = get();
    if (!currentCombat) return;

    set({ isLoading: true, error: null });

    try {
      await combatAPI.updateParticipant(
        currentCombat.id,
        participantId,
        updates
      );

      // Não atualizamos o estado aqui, pois o socket se encarregará disso
      set({ isLoading: false });
    } catch (error: any) {
      console.error("Erro ao atualizar participante:", error);
      set({
        error:
          error.response?.data?.message || "Erro ao atualizar participante",
        isLoading: false,
      });
    }
  },

  // Registra uma ação no combate
  recordAction: async (action) => {
    const { currentCombat } = get();
    if (!currentCombat) throw new Error("Nenhum combate ativo");

    set({ isLoading: true, error: null });

    try {
      const response = await combatAPI.recordAction(currentCombat.id, action);

      // Não atualizamos o estado aqui, pois o socket se encarregará disso
      set({ isLoading: false });

      return response.data;
    } catch (error: any) {
      console.error("Erro ao registrar ação:", error);
      set({
        error: error.response?.data?.message || "Erro ao registrar ação",
        isLoading: false,
      });
      throw error;
    }
  },

  // Atualiza o estado do combate (usado pelos eventos de socket)
  updateCombatState: (combat) => {
    const currentCombat = get().currentCombat;

    if (currentCombat && currentCombat.id === combat.id) {
      set({ currentCombat: combat });
    }
  },

  // Atualiza um participante específico
  updateParticipantState: (participant) => {
    const currentCombat = get().currentCombat;

    if (
      currentCombat &&
      currentCombat.participants &&
      participant.combatSessionId === currentCombat.id
    ) {
      const updatedParticipants = currentCombat.participants.map((p) =>
        p.id === participant.id ? participant : p
      );

      set({
        currentCombat: {
          ...currentCombat,
          participants: updatedParticipants,
        },
      });
    }
  },

  // Adiciona uma ação ao histórico
  addActionToHistory: (action) => {
    const currentCombat = get().currentCombat;

    if (currentCombat && action.combatSessionId === currentCombat.id) {
      const actions = currentCombat.actions || [];

      set({
        currentCombat: {
          ...currentCombat,
          actions: [action, ...actions],
        },
      });
    }
  },
}));
