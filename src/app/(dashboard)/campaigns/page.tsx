"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { campaignsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function CampaignsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length > 0) {
      filterCampaigns();
    }
  }, [searchQuery, campaigns]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await campaignsAPI.getAll();
      setCampaigns(response.data);
      setFilteredCampaigns(response.data);
    } catch (error) {
      console.error("Erro ao buscar campanhas:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar campanhas",
        description:
          "Não foi possível carregar suas campanhas. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCampaigns = () => {
    if (!searchQuery) {
      setFilteredCampaigns(campaigns);
      return;
    }

    const filtered = campaigns.filter((campaign) => {
      const query = searchQuery.toLowerCase();

      return (
        campaign.name.toLowerCase().includes(query) ||
        (campaign.setting && campaign.setting.toLowerCase().includes(query)) ||
        (campaign.description &&
          campaign.description.toLowerCase().includes(query))
      );
    });

    setFilteredCampaigns(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterByStatus = (status: string) => {
    if (status === "all") {
      setFilteredCampaigns(campaigns);
      return;
    }

    const filtered = campaigns.filter((campaign) => campaign.status === status);

    setFilteredCampaigns(filtered);
  };

  const handleDelete = () => {
    fetchCampaigns();
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-dnd-red border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Campanhas</h1>
        <p className="text-muted-foreground">
          Gerencie suas campanhas de Dungeons & Dragons.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center space-x-2 md:w-2/3">
          <Input
            placeholder="Buscar campanha..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">
                  Status
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleFilterByStatus("all")}>
                  Todos os status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByStatus("planejamento")}
                >
                  Em Planejamento
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByStatus("em_progresso")}
                >
                  Em Progresso
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByStatus("pausada")}
                >
                  Pausada
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByStatus("concluida")}
                >
                  Concluída
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link href="/campaigns/new">
          <Button className="w-full md:w-auto bg-dnd-red hover:bg-dnd-darkred">
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </Link>
      </div>

      {filteredCampaigns.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Nenhuma campanha encontrada
            </h3>
            <p className="text-sm text-muted-foreground">
              {campaigns.length === 0
                ? "Você ainda não criou nenhuma campanha."
                : "Nenhuma campanha corresponde aos filtros selecionados."}
            </p>
          </div>
          {campaigns.length === 0 && (
            <Link href="/campaigns/new">
              <Button className="bg-dnd-red hover:bg-dnd-darkred">
                <Plus className="mr-2 h-4 w-4" />
                Criar minha primeira campanha
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
