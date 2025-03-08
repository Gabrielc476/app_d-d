"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit, Trash2, User, Shield, Swords, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { charactersAPI } from "@/lib/api";
import { formatModifier } from "@/lib/utils";

interface CharacterCardProps {
  character: {
    id: string;
    name: string;
    race: string;
    class: string;
    level: number;
    background?: string;
    alignment?: string;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    maxHitPoints: number;
    currentHitPoints: number;
    temporaryHitPoints?: number;
    armorClass: number;
    initiativeBonus?: number;
    speed?: number;
  };
  onDelete?: () => void;
}

export function CharacterCard({ character, onDelete }: CharacterCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const healthPercentage =
    (character.currentHitPoints / character.maxHitPoints) * 100;

  const getHealthColor = () => {
    if (healthPercentage <= 25) return "bg-red-500";
    if (healthPercentage <= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await charactersAPI.delete(character.id);

      toast({
        title: "Personagem excluído",
        description: `${character.name} foi excluído com sucesso.`,
      });

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Erro ao excluir personagem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o personagem. Tente novamente.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl truncate">{character.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Link href={`/characters/${character.id}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </Link>
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir personagem</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir {character.name}? Esta ação
                    não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Excluindo..." : "Excluir"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
          <span>{character.race}</span>
          <span>•</span>
          <span>
            {character.class} (Nível {character.level})
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-4">
          {/* Pontos de vida */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Pontos de Vida</span>
              <span>
                {character.currentHitPoints}/{character.maxHitPoints}
                {character.temporaryHitPoints
                  ? ` (+${character.temporaryHitPoints})`
                  : ""}
              </span>
            </div>
            <Progress
              value={healthPercentage}
              className={`h-2 ${getHealthColor()}`}
            />
          </div>

          {/* Informações de combate */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center border rounded-md p-2">
              <Shield className="h-4 w-4 mb-1 text-muted-foreground" />
              <span className="text-sm font-medium">
                {character.armorClass}
              </span>
              <span className="text-xs text-muted-foreground">CA</span>
            </div>
            <div className="flex flex-col items-center justify-center border rounded-md p-2">
              <Wand2 className="h-4 w-4 mb-1 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatModifier(character.initiativeBonus || 0)}
              </span>
              <span className="text-xs text-muted-foreground">Init</span>
            </div>
            <div className="flex flex-col items-center justify-center border rounded-md p-2">
              <Swords className="h-4 w-4 mb-1 text-muted-foreground" />
              <span className="text-sm font-medium">
                {character.speed || 30}
              </span>
              <span className="text-xs text-muted-foreground">Veloc</span>
            </div>
          </div>

          {/* Atributos */}
          <div className="grid grid-cols-6 gap-1">
            <div className="flex flex-col items-center border rounded-md p-1">
              <span className="text-xs text-muted-foreground">FOR</span>
              <span className="text-sm font-medium">{character.strength}</span>
              <span className="text-xs">
                {formatModifier(Math.floor((character.strength - 10) / 2))}
              </span>
            </div>
            <div className="flex flex-col items-center border rounded-md p-1">
              <span className="text-xs text-muted-foreground">DES</span>
              <span className="text-sm font-medium">{character.dexterity}</span>
              <span className="text-xs">
                {formatModifier(Math.floor((character.dexterity - 10) / 2))}
              </span>
            </div>
            <div className="flex flex-col items-center border rounded-md p-1">
              <span className="text-xs text-muted-foreground">CON</span>
              <span className="text-sm font-medium">
                {character.constitution}
              </span>
              <span className="text-xs">
                {formatModifier(Math.floor((character.constitution - 10) / 2))}
              </span>
            </div>
            <div className="flex flex-col items-center border rounded-md p-1">
              <span className="text-xs text-muted-foreground">INT</span>
              <span className="text-sm font-medium">
                {character.intelligence}
              </span>
              <span className="text-xs">
                {formatModifier(Math.floor((character.intelligence - 10) / 2))}
              </span>
            </div>
            <div className="flex flex-col items-center border rounded-md p-1">
              <span className="text-xs text-muted-foreground">SAB</span>
              <span className="text-sm font-medium">{character.wisdom}</span>
              <span className="text-xs">
                {formatModifier(Math.floor((character.wisdom - 10) / 2))}
              </span>
            </div>
            <div className="flex flex-col items-center border rounded-md p-1">
              <span className="text-xs text-muted-foreground">CAR</span>
              <span className="text-sm font-medium">{character.charisma}</span>
              <span className="text-xs">
                {formatModifier(Math.floor((character.charisma - 10) / 2))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/characters/${character.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            <User className="mr-2 h-4 w-4" />
            Ver ficha completa
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
