"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Users, BookOpen, Sword, Plus, Calendar } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { charactersAPI, campaignsAPI } from "@/lib/api";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    characters: 0,
    campaigns: 0,
    recentCharacters: [],
    recentCampaigns: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [charactersResponse, campaignsResponse] = await Promise.all([
          charactersAPI.getAll(),
          campaignsAPI.getAll(),
        ]);

        setStats({
          characters: charactersResponse.data.length,
          campaigns: campaignsResponse.data.length,
          recentCharacters: charactersResponse.data.slice(0, 3),
          recentCampaigns: campaignsResponse.data.slice(0, 3),
        });
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de Dungeons & Dragons, {session?.user?.name}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personagens</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.characters}</div>
            <p className="text-xs text-muted-foreground">Personagens criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.campaigns}</div>
            <p className="text-xs text-muted-foreground">
              Campanhas ativas e finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próxima Sessão
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Em breve</div>
            <p className="text-xs text-muted-foreground">
              Agendamento de sessões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compêndio</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Acessível</div>
            <p className="text-xs text-muted-foreground">
              Magias, itens e regras
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personagens recentes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Personagens recentes</h2>
          <Link href="/characters">
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.recentCharacters.length > 0 ? (
            stats.recentCharacters.map((character) => (
              <Card key={character.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{character.name}</CardTitle>
                  <CardDescription>
                    {character.race} {character.class} (Nível {character.level})
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    PV: {character.currentHitPoints}/{character.maxHitPoints}
                  </span>
                  <Link href={`/characters/${character.id}`}>
                    <Button size="sm" variant="outline">
                      Ver ficha
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-6 flex flex-col items-center justify-center space-y-4">
              <p className="text-muted-foreground">
                Você ainda não criou nenhum personagem.
              </p>
              <Link href="/characters/new">
                <Button className="bg-dnd-red hover:bg-dnd-darkred">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar personagem
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Campanhas recentes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Campanhas recentes</h2>
          <Link href="/campaigns">
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.recentCampaigns.length > 0 ? (
            stats.recentCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <CardDescription>
                    {campaign.setting || "Cenário personalizado"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {campaign.description || "Sem descrição"}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Status:{" "}
                    {campaign.status === "em_progresso"
                      ? "Em progresso"
                      : campaign.status}
                  </span>
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button size="sm" variant="outline">
                      Ver detalhes
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-6 flex flex-col items-center justify-center space-y-4">
              <p className="text-muted-foreground">
                Você ainda não criou nenhuma campanha.
              </p>
              <Link href="/campaigns/new">
                <Button className="bg-dnd-red hover:bg-dnd-darkred">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar campanha
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
