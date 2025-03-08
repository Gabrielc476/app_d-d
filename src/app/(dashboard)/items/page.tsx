"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Sword, Bookmark, Shield, Potion } from "lucide-react";

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
import { itemsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

export default function ItemsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    rarity: "all",
    attunement: "all",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      filterItems();
    }
  }, [searchQuery, filters, items]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await itemsAPI.getAll();
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar itens",
        description:
          "Não foi possível carregar a lista de itens. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    // Filtragem por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      });
    }

    // Filtragem por tipo
    if (filters.type !== "all") {
      filtered = filtered.filter(
        (item) => item.type.toLowerCase() === filters.type
      );
    }

    // Filtragem por raridade
    if (filters.rarity !== "all") {
      filtered = filtered.filter(
        (item) => item.rarity.toLowerCase() === filters.rarity
      );
    }

    // Filtragem por sintonização
    if (filters.attunement !== "all") {
      const requiresAttunement = filters.attunement === "yes";
      filtered = filtered.filter(
        (item) => item.requiresAttunement === requiresAttunement
      );
    }

    setFilteredItems(filtered);
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

  // Função para exibir a raridade do item
  const getRarityBadge = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "comum":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Comum</Badge>;
      case "incomum":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Incomum</Badge>
        );
      case "raro":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Raro</Badge>;
      case "muito raro":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">
            Muito Raro
          </Badge>
        );
      case "lendário":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">Lendário</Badge>
        );
      case "artefato":
        return <Badge className="bg-red-500 hover:bg-red-600">Artefato</Badge>;
      default:
        return <Badge variant="outline">{rarity}</Badge>;
    }
  };

  // Função para obter o ícone baseado no tipo de item
  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "arma":
        return <Sword className="h-5 w-5 text-muted-foreground" />;
      case "armadura":
        return <Shield className="h-5 w-5 text-muted-foreground" />;
      case "poção":
        return <Potion className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
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
        <h1 className="text-3xl font-bold tracking-tight">
          Itens & Equipamentos
        </h1>
        <p className="text-muted-foreground">
          Pesquise e explore itens, armas, armaduras e objetos mágicos de
          Dungeons & Dragons.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Pesquisar itens..."
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
                <DropdownMenuLabel className="text-xs">Tipo</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "all")}
                >
                  Todos os tipos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "arma")}
                >
                  Armas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "armadura")}
                >
                  Armaduras
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "poção")}
                >
                  Poções
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "anel")}
                >
                  Anéis
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "pergaminho")}
                >
                  Pergaminhos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "varinha")}
                >
                  Varinhas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "equipamento")}
                >
                  Equipamentos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("type", "item_maravilhoso")}
                >
                  Itens Maravilhosos
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">
                  Raridade
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("rarity", "all")}
                >
                  Todas as raridades
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("rarity", "comum")}
                >
                  Comum
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("rarity", "incomum")}
                >
                  Incomum
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("rarity", "raro")}
                >
                  Raro
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("rarity", "muito raro")}
                >
                  Muito Raro
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("rarity", "lendário")}
                >
                  Lendário
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("rarity", "artefato")}
                >
                  Artefato
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">
                  Sintonização
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("attunement", "all")}
                >
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("attunement", "yes")}
                >
                  Requer Sintonização
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("attunement", "no")}
                >
                  Não Requer Sintonização
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Como não temos dados reais de itens, usaremos exemplos para demonstração */}
          {/* Item 1 */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Espada Longa +1</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Favoritar</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {getRarityBadge("incomum")}
                <Badge variant="outline">Arma</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  Você recebe um bônus de +1 nas jogadas de ataque e dano feitas
                  com esta arma mágica.
                </p>

                <div className="space-y-1 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>Arma (Espada Longa)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dano:</span>
                    <span>1d8+1 cortante</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Propriedades:</span>
                    <span>Pesada, Versátil (1d10)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span>{formatCurrency(1000)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <Sword className="mr-2 h-4 w-4" />
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>

          {/* Item 2 */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Poção de Cura</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Favoritar</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {getRarityBadge("comum")}
                <Badge variant="outline">Poção</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  Um personagem que beber o fluido mágico vermelho desta poção
                  recupera 2d4+2 pontos de vida. Beber ou administrar uma poção
                  exige uma ação.
                </p>

                <div className="space-y-1 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>Poção</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Peso:</span>
                    <span>0,5 kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sintonização:</span>
                    <span>Não</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span>{formatCurrency(50)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <Potion className="mr-2 h-4 w-4" />
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>

          {/* Item 3 */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Cota de Malha Élfica</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Favoritar</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {getRarityBadge("raro")}
                <Badge variant="outline">Armadura</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  Esta cota de malha não impõe desvantagem em testes de Destreza
                  (Furtividade). Se você não possuir proficiência com armaduras
                  médias, você pode usar esta armadura.
                </p>

                <div className="space-y-1 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>Armadura (Média)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">CA:</span>
                    <span>14 + Mod. Des. (máx. +2)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Força Mínima:</span>
                    <span>Nenhuma</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span>{formatCurrency(4500)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
          <Sword className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Nenhum item encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Nenhum item corresponde aos filtros selecionados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
