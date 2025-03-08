"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Shield, Calendar } from "lucide-react";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { combatAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

interface CombatSession {
  id: string;
  name: string;
  description?: string;
  status: "preparando" | "em_andamento" | "pausado" | "concluido";
  round: number;
  createdAt: string;
  updatedAt: string;
  campaignId?: string;
  campaign?: {
    id: string;
    name: string;
  };
}

export default function CombatPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [combatSessions, setCombatSessions] = useState<CombatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSessions, setFilteredSessions] = useState<CombatSession[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchCombatSessions();
  }, []);

  useEffect(() => {
    if (combatSessions.length > 0) {
      filterSessions();
    }
  }, [searchQuery, filterStatus, combatSessions]);

  const fetchCombatSessions = async () => {
    try {
      setIsLoading(true);
      const response = await combatAPI.getAll();
      setCombatSessions(response.data);
      setFilteredSessions(response.data);
    } catch (error) {
      console.error("Erro ao buscar sessões de combate:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar combates",
        description:
          "Não foi possível carregar as sessões de combate. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...combatSessions];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.name.toLowerCase().includes(query) ||
          (session.description &&
            session.description.toLowerCase().includes(query)) ||
          (session.campaign &&
            session.campaign.name.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((session) => session.status === filterStatus);
    }

    setFilteredSessions(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "preparando":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Preparando</Badge>
        );
      case "em_andamento":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Em Andamento
          </Badge>
        );
      case "pausado":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pausado</Badge>
        );
      case "concluido":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">Concluído</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Combate</h1>
        <p className="text-muted-foreground">
          Gerencie sessões de combate para suas campanhas.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center space-x-2 md:w-2/3">
          <Input
            placeholder="Buscar combate..."
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
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  Todos os status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("preparando")}>
                  Preparando
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterStatus("em_andamento")}
                >
                  Em Andamento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pausado")}>
                  Pausado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("concluido")}>
                  Concluído
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link href="/combat/new">
          <Button className="w-full md:w-auto bg-dnd-red hover:bg-dnd-darkred">
            <Plus className="mr-2 h-4 w-4" />
            Novo Combate
          </Button>
        </Link>
      </div>

      {filteredSessions.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl truncate">
                    {session.name}
                  </CardTitle>
                  {getStatusBadge(session.status)}
                </div>
                {session.campaign && (
                  <CardDescription className="truncate">
                    Campanha: {session.campaign.name}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {session.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {session.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Criado em: {formatDate(new Date(session.createdAt))}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href={`/combat/${session.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    {session.status === "preparando" ||
                    session.status === "concluido"
                      ? "Ver Detalhes"
                      : "Continuar Combate"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Nenhuma sessão de combate encontrada
            </h3>
            <p className="text-sm text-muted-foreground">
              {combatSessions.length === 0
                ? "Você ainda não criou nenhuma sessão de combate."
                : "Nenhuma sessão corresponde aos filtros selecionados."}
            </p>
          </div>
          {combatSessions.length === 0 && (
            <Link href="/combat/new">
              <Button className="bg-dnd-red hover:bg-dnd-darkred">
                <Plus className="mr-2 h-4 w-4" />
                Criar primeiro combate
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
