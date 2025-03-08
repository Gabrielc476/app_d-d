import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação a todas as requisições
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession();

      if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API de autenticação
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// API de personagens
export const charactersAPI = {
  getAll: async () => {
    const response = await api.get("/characters");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/characters/${id}`);
    return response.data;
  },

  create: async (characterData: any) => {
    const response = await api.post("/characters", characterData);
    return response.data;
  },

  update: async (id: string, characterData: any) => {
    const response = await api.put(`/characters/${id}`, characterData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/characters/${id}`);
    return response.data;
  },
};

// API de campanhas
export const campaignsAPI = {
  getAll: async () => {
    const response = await api.get("/campaigns");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  create: async (campaignData: any) => {
    const response = await api.post("/campaigns", campaignData);
    return response.data;
  },

  update: async (id: string, campaignData: any) => {
    const response = await api.put(`/campaigns/${id}`, campaignData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },

  addCharacter: async (campaignId: string, characterId: string) => {
    const response = await api.post(`/campaigns/${campaignId}/characters`, {
      characterId,
    });
    return response.data;
  },

  removeCharacter: async (campaignId: string, characterId: string) => {
    const response = await api.delete(
      `/campaigns/${campaignId}/characters/${characterId}`
    );
    return response.data;
  },
};

// API de magias
export const spellsAPI = {
  getAll: async (params?: {
    name?: string;
    level?: number;
    class?: string;
  }) => {
    const response = await api.get("/spells", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/spells/${id}`);
    return response.data;
  },
};

// API de itens
export const itemsAPI = {
  getAll: async (params?: {
    name?: string;
    type?: string;
    rarity?: string;
  }) => {
    const response = await api.get("/items", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },
};

// API de rolagem de dados
export const diceAPI = {
  roll: async (rollData: {
    diceType: string;
    diceCount: number;
    modifier?: number;
    rollType?: string;
    rollLabel?: string;
    advantage?: boolean;
    disadvantage?: boolean;
    isPrivate?: boolean;
    campaignId?: string;
    characterName?: string;
  }) => {
    const response = await api.post("/dice", rollData);
    return response.data;
  },

  getHistory: async (limit?: number) => {
    const response = await api.get("/dice/history", { params: { limit } });
    return response.data;
  },

  getCampaignHistory: async (campaignId: string, limit?: number) => {
    const response = await api.get(`/dice/campaign/${campaignId}`, {
      params: { limit },
    });
    return response.data;
  },

  quickRoll: async (rollData: {
    diceType: string;
    diceCount: number;
    modifier?: number;
  }) => {
    const response = await api.post("/dice/quick", rollData);
    return response.data;
  },
};

// API de combate
export const combatAPI = {
  create: async (combatData: {
    campaignId?: string;
    name: string;
    description?: string;
  }) => {
    const response = await api.post("/combat", combatData);
    return response.data;
  },

  getAll: async (campaignId?: string) => {
    const response = await api.get("/combat", { params: { campaignId } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/combat/${id}`);
    return response.data;
  },

  addParticipant: async (
    combatId: string,
    participant: {
      characterId?: string;
      name?: string;
      type?: string;
      armorClass?: number;
      maxHitPoints?: number;
      initiative?: number;
      stats?: any;
      isVisible?: boolean;
    }
  ) => {
    const response = await api.post(
      `/combat/${combatId}/participants`,
      participant
    );
    return response.data;
  },

  updateParticipant: async (
    combatId: string,
    participantId: string,
    updates: any
  ) => {
    const response = await api.put(
      `/combat/${combatId}/participants/${participantId}`,
      updates
    );
    return response.data;
  },

  start: async (combatId: string) => {
    const response = await api.post(`/combat/${combatId}/start`);
    return response.data;
  },

  nextTurn: async (combatId: string) => {
    const response = await api.post(`/combat/${combatId}/next-turn`);
    return response.data;
  },

  toggleStatus: async (combatId: string, action: "pause" | "resume") => {
    const response = await api.post(`/combat/${combatId}/toggle-status`, {
      action,
    });
    return response.data;
  },

  end: async (combatId: string) => {
    const response = await api.post(`/combat/${combatId}/end`);
    return response.data;
  },

  recordAction: async (
    combatId: string,
    action: {
      actorId: string;
      targetId?: string;
      actionType: string;
      actionName: string;
      description?: string;
      rollData?: any;
      damage?: number;
      damageType?: string;
      success?: boolean;
      saveType?: string;
      saveDC?: number;
    }
  ) => {
    const response = await api.post(`/combat/${combatId}/actions`, action);
    return response.data;
  },

  getActions: async (combatId: string, round?: number) => {
    const response = await api.get(`/combat/${combatId}/actions`, {
      params: { round },
    });
    return response.data;
  },
};

export default api;
