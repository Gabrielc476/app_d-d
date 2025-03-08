"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CharacterSheet } from "@/components/character/character-sheet";
import { charactersAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface CharacterDetailsPageProps {
  params: {
    id: string;
  };
}

export default function CharacterDetailsPage({
  params,
}: CharacterDetailsPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCharacter();
  }, [params.id]);

  const fetchCharacter = async () => {
    try {
      setIsLoading(true);
      const response = await charactersAPI.getById(params.id);
      setCharacter(response.data);
    } catch (error) {
      console.error("Erro ao buscar detalhes do personagem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar personagem",
        description:
          "Não foi possível encontrar este personagem. Verifique se o ID está correto.",
      });
      router.push("/characters");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-dnd-red" />
          <p className="text-sm text-muted-foreground">
            Carregando personagem...
          </p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/characters")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para personagens</span>
        </Button>

        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-xl font-semibold">Personagem não encontrado</h3>
          <p className="text-sm text-muted-foreground">
            O personagem que você está procurando não existe ou foi excluído.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/characters")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar para personagens</span>
      </Button>

      <CharacterSheet character={character} />
    </div>
  );
}
