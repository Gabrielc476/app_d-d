"use client";

import { useState, useEffect } from "react";
import { Search, Filter, BookOpen, Bookmark } from "lucide-react";

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
import { spellsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function SpellsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [spells, setSpells] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSpells, setFilteredSpells] = useState([]);
  const [filters, setFilters] = useState({
    level: "all",
    school: "all",
    class: "all",
  });

  useEffect(() => {
    fetchSpells();
  }, []);

  useEffect(() => {
    if (spells.length > 0) {
      filterSpells();
    }
  }, [searchQuery, filters, spells]);

  const fetchSpells = async () => {
    try {
      setIsLoading(true);
      const response = await spellsAPI.getAll();
      setSpells(response.data);
      setFilteredSpells(response.data);
    } catch (error) {
      console.error("Erro ao buscar magias:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar magias",
        description:
          "Não foi possível carregar a lista de magias. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSpells = () => {
    let filtered = [...spells];

    // Filtragem por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((spell) => {
        return (
          spell.name.toLowerCase().includes(query) ||
          spell.description.toLowerCase().includes(query)
        );
      });
    }

    // Filtragem por nível
    if (filters.level !== "all") {
      filtered = filtered.filter((spell) => {
        if (filters.level === "0") {
          return spell.level === 0; // Truques
        } else {
          return spell.level === parseInt(filters.level);
        }
      });
    }

    // Filtragem por escola
    if (filters.school !== "all") {
      filtered = filtered.filter(
        (spell) => spell.school.toLowerCase() === filters.school
      );
    }

    // Filtragem por classe
    if (filters.class !== "all") {
      filtered = filtered.filter((spell) =>
        spell.classes.includes(filters.class)
      );
    }

    setFilteredSpells(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (type: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Função para exibir o nível da magia
  const getSpellLevel = (level: number) => {
    if (level === 0) return "Truque";
    return `${level}º nível`;
  };

  // Função para exibir o tempo de conjuração
  const formatCastingTime = (time: string) => {
    return time;
  };

  // Função para exibir a duração
  const formatDuration = (duration: string) => {
    return duration;
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
        <h1 className="text-3xl font-bold tracking-tight">Grimório</h1>
        <p className="text-muted-foreground">
          Pesquise e explore magias de Dungeons & Dragons.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Pesquisar magias..."
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
                <DropdownMenuLabel className="text-xs">Nível</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("level", "all")}
                >
                  Todos os níveis
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("level", "0")}
                >
                  Truques
                </DropdownMenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() =>
                      handleFilterChange("level", level.toString())
                    }
                  >
                    Nível {level}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">
                  Escola
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("school", "all")}
                >
                  Todas as escolas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("school", "abjuracao")}
                >
                  Abjuração
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("school", "adivinhacao")}
                >
                  Adivinhação
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("school", "conjuracao")}
                >
                  Conjuração
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("school", "encantamento")}
                >
                  Encantamento
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("school", "evocacao")}
                >
                  Evocação
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("school", "ilusao")}
                >
                  Ilusão
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("school", "necromancia")}
                >
                  Necromancia
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("school", "transmutacao")}
                >
                  Transmutação
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">
                  Classe
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("class", "all")}
                >
                  Todas as classes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("class", "bardo")}
                >
                  Bardo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("class", "bruxo")}
                >
                  Bruxo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("class", "clerigo")}
                >
                  Clérigo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("class", "druida")}
                >
                  Druida
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("class", "feiticeiro")}
                >
                  Feiticeiro
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("class", "mago")}
                >
                  Mago
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("class", "paladino")}
                >
                  Paladino
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("class", "patrulheiro")}
                >
                  Patrulheiro
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredSpells.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Como não temos dados reais de magias, usaremos exemplos para demonstração */}
          {/* Magia 1 */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Bola de Fogo</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Favoritar</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-red-500 hover:bg-red-600">Evocação</Badge>
                <Badge variant="outline">{getSpellLevel(3)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  Uma chama brilhante surge de seu dedo indicador e voa para um
                  ponto à sua escolha dentro do alcance, explodindo com um
                  rugido em uma explosão de fogo.
                </p>

                <div className="space-y-1 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tempo de Conjuração:
                    </span>
                    <span>1 ação</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Alcance:</span>
                    <span>45 metros</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duração:</span>
                    <span>Instantânea</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Componentes:</span>
                    <span>V, S, M</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>

          {/* Magia 2 */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Curar Ferimentos</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Favoritar</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-blue-500 hover:bg-blue-600">
                  Evocação
                </Badge>
                <Badge variant="outline">{getSpellLevel(1)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  Uma criatura à sua escolha que você possa ver, dentro do
                  alcance, recupera pontos de vida iguais a 1d8 + seu
                  modificador de habilidade de conjuração.
                </p>

                <div className="space-y-1 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tempo de Conjuração:
                    </span>
                    <span>1 ação</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Alcance:</span>
                    <span>Toque</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duração:</span>
                    <span>Instantânea</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Componentes:</span>
                    <span>V, S</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>

          {/* Magia 3 */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Luz</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Favoritar</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                  Evocação
                </Badge>
                <Badge variant="outline">{getSpellLevel(0)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  Você toca um objeto que não tenha mais de 3 metros em qualquer
                  dimensão. Até a magia acabar, o objeto emite luz plena em um
                  raio de 6 metros e luz penumbra por mais 6 metros.
                </p>

                <div className="space-y-1 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tempo de Conjuração:
                    </span>
                    <span>1 ação</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Alcance:</span>
                    <span>Toque</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duração:</span>
                    <span>1 hora</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Componentes:</span>
                    <span>V, M</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Nenhuma magia encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Nenhuma magia corresponde aos filtros selecionados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
