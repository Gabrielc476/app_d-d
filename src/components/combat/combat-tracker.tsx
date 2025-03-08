"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Trophy,
  Sword,
  ShieldAlert,
  Heart,
  PlusCircle,
  Play,
  Pause,
  SkipForward,
  StopCircle,
  Skull,
  Target,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddCombatantForm } from "./add-combatant-form";
import { CombatActionsList } from "./combat-actions-list";
import { DamageForm } from "./damage-form";

import {
  useCombatStore,
  CombatSession,
  CombatParticipant,
} from "@/lib/stores/combatStore";
import { useDiceStore, DiceType } from "@/lib/stores/diceStore";

interface CombatTrackerProps {
  initialCombatId?: string;
  campaignId?: string;
}

export function CombatTracker({
  initialCombatId,
  campaignId,
}: CombatTrackerProps) {
  // Estados e hooks
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("participants");

  // Estados para diálogos
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [confirmEndCombatOpen, setConfirmEndCombatOpen] = useState(false);
  const [damageTargetId, setDamageTargetId] = useState<string | null>(null);

  // Store de combate
  const {
    currentCombat,
    isLoading,
    error,
    isJoined,
    loadCombat,
    joinCombatRoom,
    leaveCombatRoom,
    startCombat,
    nextTurn,
    pauseCombat,
    resumeCombat,
    endCombat,
  } = useCombatStore();

  // Store de dados
  const { rollDice } = useDiceStore();

  // Determina se o usuário atual é o mestre do combate
  const isDungeonMaster = currentCombat?.dungeonMasterId === session?.user?.id;

  // Carrega os dados do combate quando o componente é montado
  useEffect(() => {
    if (initialCombatId) {
      loadCombat(initialCombatId);
      joinCombatRoom(initialCombatId);
    }

    return () => {
      leaveCombatRoom();
    };
  }, [initialCombatId, loadCombat, joinCombatRoom, leaveCombatRoom]);

  // Ordena os participantes por iniciativa
  const sortedParticipants = currentCombat?.participants
    ? [...currentCombat.participants].sort((a, b) => a.order - b.order)
    : [];

  // Identifica o participante atual
  const currentParticipant =
    currentCombat?.status === "em_andamento" && sortedParticipants.length > 0
      ? sortedParticipants[currentCombat.currentTurnIndex]
      : null;

  // Handlers para ações de combate
  const handleStartCombat = async () => {
    try {
      await startCombat();
      toast({
        title: "Combate iniciado",
        description:
          "Os participantes foram ordenados por iniciativa e o combate começou.",
      });
    } catch (error) {
      console.error("Erro ao iniciar combate:", error);
      toast({
        variant: "destructive",
        title: "Erro ao iniciar combate",
        description:
          "Não foi possível iniciar o combate. Verifique se há pelo menos um participante.",
      });
    }
  };

  const handleNextTurn = async () => {
    try {
      await nextTurn();
    } catch (error) {
      console.error("Erro ao avançar turno:", error);
      toast({
        variant: "destructive",
        title: "Erro ao avançar turno",
        description: "Não foi possível avançar para o próximo turno.",
      });
    }
  };

  const handleTogglePause = async () => {
    try {
      if (currentCombat?.status === "em_andamento") {
        await pauseCombat();
        toast({
          title: "Combate pausado",
          description: "O combate foi pausado.",
        });
      } else if (currentCombat?.status === "pausado") {
        await resumeCombat();
        toast({
          title: "Combate retomado",
          description: "O combate foi retomado.",
        });
      }
    } catch (error) {
      console.error("Erro ao alternar pausa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar o status do combate.",
      });
    }
  };

  const handleEndCombat = async () => {
    try {
      await endCombat();
      setConfirmEndCombatOpen(false);
      toast({
        title: "Combate finalizado",
        description: "O combate foi finalizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao finalizar combate:", error);
      toast({
        variant: "destructive",
        title: "Erro ao finalizar combate",
        description: "Não foi possível finalizar o combate.",
      });
    }
  };

  // Handler para rolagem de iniciativa
  const handleRollInitiative = async (participant: CombatParticipant) => {
    try {
      // Rola o dado
      const result = await rollDice({
        diceType: "d20" as DiceType,
        diceCount: 1,
        modifier: 0,
        rollType: "initiative",
        rollLabel: `Iniciativa (${participant.name})`,
      });

      // Exibe o toast com o resultado
      toast({
        title: `Iniciativa: ${result.total}`,
        description: `${participant.name} rolou ${result.total} de iniciativa.`,
      });
    } catch (error) {
      console.error("Erro ao rolar iniciativa:", error);
    }
  };

  // Calcula a porcentagem de vida
  const calculateHealthPercentage = (current: number, max: number) => {
    if (max <= 0) return 0;
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  // Determina a cor da barra de vida
  const getHealthColor = (percentage: number) => {
    if (percentage <= 25) return "bg-red-500";
    if (percentage <= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Renderização condicional para estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-dnd-red border-t-transparent" />
      </div>
    );
  }

  // Renderização condicional para erros
  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-950/20 rounded-md text-red-700 dark:text-red-400">
        <h3 className="font-bold">Erro ao carregar combate</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Renderização condicional para quando não há combate
  if (!currentCombat) {
    return (
      <div className="text-center p-8">
        <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">Nenhum combate selecionado</h3>
        <p className="text-muted-foreground mb-4">
          Selecione ou crie um combate para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do combate */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{currentCombat.name}</h2>
            <Badge
              className={
                currentCombat.status === "preparando"
                  ? "bg-blue-500"
                  : currentCombat.status === "em_andamento"
                  ? "bg-green-500"
                  : currentCombat.status === "pausado"
                  ? "bg-yellow-500"
                  : "bg-gray-500"
              }
            >
              {currentCombat.status === "preparando"
                ? "Preparando"
                : currentCombat.status === "em_andamento"
                ? "Em Andamento"
                : currentCombat.status === "pausado"
                ? "Pausado"
                : "Concluído"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentCombat.status !== "preparando" && (
              <span>Ronda: {currentCombat.round}</span>
            )}
            {currentCombat.description && (
              <p className="mt-1">{currentCombat.description}</p>
            )}
          </div>
        </div>

        {/* Controles principais do mestre */}
        {isDungeonMaster && (
          <div className="flex flex-wrap gap-2">
            {currentCombat.status === "preparando" && (
              <Button
                onClick={handleStartCombat}
                className="bg-dnd-red hover:bg-dnd-darkred"
              >
                <Play className="mr-2 h-4 w-4" />
                Iniciar Combate
              </Button>
            )}

            {currentCombat.status === "em_andamento" && (
              <>
                <Button
                  onClick={handleNextTurn}
                  className="bg-dnd-red hover:bg-dnd-darkred"
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Próximo Turno
                </Button>
                <Button onClick={handleTogglePause} variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar
                </Button>
              </>
            )}

            {currentCombat.status === "pausado" && (
              <Button onClick={handleTogglePause} variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Retomar
              </Button>
            )}

            {(currentCombat.status === "em_andamento" ||
              currentCombat.status === "pausado") && (
              <Dialog
                open={confirmEndCombatOpen}
                onOpenChange={setConfirmEndCombatOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <StopCircle className="mr-2 h-4 w-4" />
                    Finalizar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Finalizar Combate</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja finalizar este combate? Esta ação
                      não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmEndCombatOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleEndCombat}>
                      Finalizar Combate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>

      {/* Participante Atual (em destaque) */}
      {currentCombat.status === "em_andamento" && currentParticipant && (
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-2 left-4 transform -translate-x-1/2 -translate-y-full"
          >
            <Trophy className="h-6 w-6 text-yellow-500" />
          </motion.div>
          <Card className="border-2 border-dnd-red">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{currentParticipant.name}</CardTitle>
                  <CardDescription>
                    {currentParticipant.type === "player"
                      ? `Jogador${
                          currentParticipant.character
                            ? ` - ${currentParticipant.character.class} Nível ${currentParticipant.character.level}`
                            : ""
                        }`
                      : currentParticipant.type === "npc"
                      ? "NPC"
                      : "Monstro"}
                  </CardDescription>
                </div>
                <Badge className="bg-dnd-red">Turno Atual</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center">
                    <Heart className="h-5 w-5 text-dnd-red mb-1" />
                    <div className="font-bold">
                      {currentParticipant.currentHitPoints}/
                      {currentParticipant.maxHitPoints}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pontos de Vida
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground mb-1" />
                    <div className="font-bold">
                      {currentParticipant.armorClass}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Classe de Armadura
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Target className="h-5 w-5 text-muted-foreground mb-1" />
                    <div className="font-bold">
                      {currentParticipant.initiative}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Iniciativa
                    </div>
                  </div>
                </div>

                {currentParticipant.conditions &&
                  currentParticipant.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {currentParticipant.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline">
                          {condition.name}
                          {condition.duration && ` (${condition.duration})`}
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>
            </CardContent>

            {isDungeonMaster && (
              <CardFooter className="pt-0 flex gap-2">
                <Dialog
                  open={damageTargetId === currentParticipant.id}
                  onOpenChange={(open) =>
                    setDamageTargetId(open ? currentParticipant.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Sword className="mr-2 h-4 w-4" />
                      Dano
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Aplicar Dano a {currentParticipant.name}
                      </DialogTitle>
                    </DialogHeader>
                    <DamageForm
                      participantId={currentParticipant.id}
                      combatSessionId={currentCombat.id}
                      onComplete={() => setDamageTargetId(null)}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNextTurn()}
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Próximo
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}

      {/* Abas de participantes e ações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>

        {/* Lista de Participantes */}
        <TabsContent value="participants" className="space-y-4 pt-4">
          {isDungeonMaster && currentCombat.status !== "concluido" && (
            <div className="flex justify-end">
              <Dialog
                open={addParticipantOpen}
                onOpenChange={setAddParticipantOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-dnd-red hover:bg-dnd-darkred">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Participante
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Participante</DialogTitle>
                    <DialogDescription>
                      Adicione um personagem, NPC ou monstro ao combate.
                    </DialogDescription>
                  </DialogHeader>
                  <AddCombatantForm
                    combatSessionId={currentCombat.id}
                    campaignId={campaignId}
                    onComplete={() => setAddParticipantOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}

          {sortedParticipants.length > 0 ? (
            <div className="space-y-2">
              {sortedParticipants.map((participant) => {
                const isCurrentTurn =
                  currentCombat.status === "em_andamento" &&
                  currentParticipant?.id === participant.id;

                const healthPercentage = calculateHealthPercentage(
                  participant.currentHitPoints,
                  participant.maxHitPoints
                );

                return (
                  <div
                    key={participant.id}
                    className={`relative border rounded-md transition-all ${
                      isCurrentTurn ? "border-dnd-red" : ""
                    }`}
                  >
                    {isCurrentTurn && (
                      <div className="absolute -top-2 left-4">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="font-medium">{participant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {participant.type === "player"
                              ? `Jogador${
                                  participant.character
                                    ? ` - ${participant.character.class} Nível ${participant.character.level}`
                                    : ""
                                }`
                              : participant.type === "npc"
                              ? "NPC"
                              : "Monstro"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-sm">
                            <span className="font-medium">
                              CA: {participant.armorClass}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">
                              Ini: {participant.initiative}
                            </span>
                          </div>

                          {isDungeonMaster &&
                            currentCombat.status === "preparando" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  handleRollInitiative(participant)
                                }
                              >
                                <DiceD20 className="h-4 w-4" />
                                <span className="sr-only">
                                  Rolar Iniciativa
                                </span>
                              </Button>
                            )}

                          {isDungeonMaster && (
                            <Dialog
                              open={damageTargetId === participant.id}
                              onOpenChange={(open) =>
                                setDamageTargetId(open ? participant.id : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive"
                                >
                                  <Sword className="h-4 w-4" />
                                  <span className="sr-only">Aplicar Dano</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Aplicar Dano a {participant.name}
                                  </DialogTitle>
                                </DialogHeader>
                                <DamageForm
                                  participantId={participant.id}
                                  combatSessionId={currentCombat.id}
                                  onComplete={() => setDamageTargetId(null)}
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>
                            HP: {participant.currentHitPoints}/
                            {participant.maxHitPoints}
                          </span>
                          {participant.temporaryHitPoints > 0 && (
                            <span className="text-blue-500">
                              +{participant.temporaryHitPoints} temp
                            </span>
                          )}
                        </div>
                        <Progress
                          value={healthPercentage}
                          className={`h-2 ${getHealthColor(healthPercentage)}`}
                        />
                      </div>

                      {participant.conditions &&
                        participant.conditions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {participant.conditions.map((condition, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {condition.name}
                                {condition.duration &&
                                  ` (${condition.duration})`}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-6 border rounded-md">
              <Skull className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium mb-1">Nenhum participante</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isDungeonMaster
                  ? "Adicione participantes ao combate para começar."
                  : "O mestre ainda não adicionou participantes a este combate."}
              </p>

              {isDungeonMaster && (
                <Button
                  className="bg-dnd-red hover:bg-dnd-darkred"
                  onClick={() => setAddParticipantOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Participante
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Lista de Ações */}
        <TabsContent value="actions" className="pt-4">
          <CombatActionsList combatSessionId={currentCombat.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
