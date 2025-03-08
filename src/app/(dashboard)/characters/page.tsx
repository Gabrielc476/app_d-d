"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, User } from "lucide-react";

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
import { CharacterCard } from "@/components/character/character-card";
import { charactersAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function CharactersPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [characters, setCharacters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCharacters, setFilteredCharacters] = useState([]);

  useEffect(() => {
    fetchCharacters();
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      filterCharacters();
    }
  }, [searchQuery, characters]);

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      const response = await charactersAPI.getAll();
      setCharacters(response.data);
      setFilteredCharacters(response.data);
    } catch (error) {
      console.error("Erro ao buscar personagens:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar personagens",
        description:
          "Não foi possível carregar seus personagens. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCharacters = () => {
    if (!searchQuery) {
      setFilteredCharacters(characters);
      return;
    }

    const filtered = characters.filter((character) => {
      const query = searchQuery.toLowerCase();

      return (
        character.name.toLowerCase().includes(query) ||
        character.race.toLowerCase().includes(query) ||
        character.class.toLowerCase().includes(query) ||
        (character.background &&
          character.background.toLowerCase().includes(query))
      );
    });

    setFilteredCharacters(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterByLevel = (level: string) => {
    if (level === "all") {
      setFilteredCharacters(characters);
      return;
    }

    const [min, max] = level.split("-").map(Number);

    const filtered = characters.filter((character) => {
      if (max) {
        return character.level >= min && character.level <= max;
      }
      return character.level === min;
    });

    setFilteredCharacters(filtered);
  };

  const handleFilterByClass = (characterClass: string) => {
    if (characterClass === "all") {
      setFilteredCharacters(characters);
      return;
    }

    const filtered = characters.filter(
      (character) =>
        character.class.toLowerCase() === characterClass.toLowerCase()
    );

    setFilteredCharacters(filtered);
  };

  const handleDelete = () => {
    fetchCharacters();
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
        <h1 className="text-3xl font-bold tracking-tight">Meus Personagens</h1>
        <p className="text-muted-foreground">
          Gerencie seus personagens de Dungeons & Dragons.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center space-x-2 md:w-2/3">
          <Input
            placeholder="Buscar personagem..."
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
                <DropdownMenuItem onClick={() => handleFilterByLevel("all")}>
                  Todos os níveis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByLevel("1-5")}>
                  Nível 1-5
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByLevel("6-10")}>
                  Nível 6-10
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByLevel("11-15")}>
                  Nível 11-15
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByLevel("16-20")}>
                  Nível 16-20
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">
                  Classe
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleFilterByClass("all")}>
                  Todas as classes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByClass("barbaro")}
                >
                  Bárbaro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByClass("bardo")}>
                  Bardo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByClass("clerigo")}
                >
                  Clérigo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByClass("druida")}>
                  Druida
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByClass("guerreiro")}
                >
                  Guerreiro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByClass("monge")}>
                  Monge
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByClass("paladino")}
                >
                  Paladino
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByClass("ladino")}>
                  Ladino
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByClass("mago")}>
                  Mago
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByClass("feiticeiro")}
                >
                  Feiticeiro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterByClass("bruxo")}>
                  Bruxo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterByClass("guardiao")}
                >
                  Guardião
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link href="/characters/new">
          <Button className="w-full md:w-auto bg-dnd-red hover:bg-dnd-darkred">
            <Plus className="mr-2 h-4 w-4" />
            Novo Personagem
          </Button>
        </Link>
      </div>

      {filteredCharacters.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
          <User className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Nenhum personagem encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              {characters.length === 0
                ? "Você ainda não criou nenhum personagem."
                : "Nenhum personagem corresponde aos filtros selecionados."}
            </p>
          </div>
          {characters.length === 0 && (
            <Link href="/characters/new">
              <Button className="bg-dnd-red hover:bg-dnd-darkred">
                <Plus className="mr-2 h-4 w-4" />
                Criar meu primeiro personagem
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
