export interface Campaign {
  id: string;
  name: string;
  description?: string;
  setting?: string;
  status: CampaignStatus;
  startDate?: Date;
  endDate?: Date;
  level: {
    min: number;
    max: number;
  };
  notes?: string;
  isPrivate: boolean;
  meetingSchedule?: string;
  dungeonMasterId: string;
  dungeonMaster?: {
    id: string;
    username: string;
  };
  Characters?: CampaignCharacter[];
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignStatus =
  | "planejamento"
  | "em_progresso"
  | "concluida"
  | "pausada";

export interface CampaignCharacter {
  id: string;
  campaignId: string;
  characterId: string;
  joinDate: Date;
  status: "ativo" | "inativo" | "morto" | "ausente";
  notes?: string;
  character?: {
    id: string;
    name: string;
    class: string;
    level: number;
    userId: string;
    user?: {
      id: string;
      username: string;
    };
  };
}

export interface CampaignFormData {
  name: string;
  description?: string;
  setting?: string;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  levelMin: number;
  levelMax: number;
  isPrivate: boolean;
  meetingSchedule?: string;
  notes?: string;
}

export interface CampaignSession {
  id: string;
  campaignId: string;
  name: string;
  date: Date;
  duration?: number; // in minutes
  summary?: string;
  notes?: string;
  location?: string;
  status: "planned" | "completed" | "cancelled";
}

export interface CampaignListResponse {
  success: boolean;
  count: number;
  data: Campaign[];
}

export interface CampaignResponse {
  success: boolean;
  data: Campaign;
}

export interface AddCharacterToCampaignRequest {
  campaignId: string;
  characterId: string;
}

export interface UpdateCharacterStatusRequest {
  status?: "ativo" | "inativo" | "morto" | "ausente";
  notes?: string;
}
