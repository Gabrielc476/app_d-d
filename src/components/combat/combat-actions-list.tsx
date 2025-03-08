"use client";

import { useState, useEffect } from "react";
import {
  Sword,
  Wand2,
  Activity,
  Heart,
  Footprints,
  PanelRightClose,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCombatStore, CombatAction } from "@/lib/stores/combatStore";

interface CombatActionsListProps {
  combatSessionId: string;
}

export function CombatActionsList({ combatSessionId }: CombatActionsListProps) {
  const [selectedRound, setSelectedRound] = useState<string>("all");
  const { currentCombat } = useCombatStore();

  // Obter o histórico de ações do combate atual
  const actions = currentCombat?.actions || [];

  // Filtrar ações pelo round selecionado
  const filteredActions =
    selectedRound === "all"
      ? actions
      : actions.filter((action) => action.round === parseInt(selectedRound));

  // Ordenar ações por timestamp (mais recentes primeiro)
  const sortedActions = [...filteredActions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Obter lista de rounds disponíveis
  const availableRounds =
    actions.length > 0
      ? [...new Set(actions.map((action) => action.round))].sort(
          (a, b) => b - a
        )
      : [];

  // Retornar ícone com base no tipo de ação
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "attack":
        return <Sword className="h-4 w-4 text-red-500" />;
      case "spell":
        return <Wand2 className="h-4 w-4 text-blue-500" />;
      case "ability":
        return <Activity className="h-4 w-4 text-purple-500" />;
      case "movement":
        return <Footprints className="h-4 w-4 text-green-500" />;
      case "item":
        return <FolderOpen className="h-4 w-4 text-yellow-500" />;
      default:
        return <PanelRightClose className="h-4 w-4 text-gray-500" />;
    }
  };

  // Formatar timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Renderizar mensagem descritiva da ação
  const renderActionDescription = (action: CombatAction) => {
    const actorName = action.actor?.name || "Alguém";
    const targetName = action.target?.name || "um alvo";

    let description = `${actorName} usou ${action.actionName}`;

    if (action.actionType === "attack" || action.actionType === "spell") {
      if (action.target) {
        description += ` contra ${targetName}`;
      }

      if (typeof action.success === "boolean") {
        description += action.success ? " (Sucesso)" : " (Falha)";
      }

      if (action.damage) {
        description += ` causando ${action.damage} de dano`;
        if (action.damageType) {
          description += ` (${action.damageType})`;
        }
      }
    } else if (
      action.actionType === "ability" &&
      action.damage &&
      action.damageType === "healing"
    ) {
      description += ` curando ${action.damage} pontos de vida`;
      if (action.target) {
        description += ` em ${targetName}`;
      }
    }

    return description;
  };

  if (actions.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md">
        <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <h3 className="font-medium mb-1">Nenhuma ação registrada</h3>
        <p className="text-sm text-muted-foreground">
          Ações de combate aparecerão aqui à medida que forem realizadas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {availableRounds.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Histórico de Ações</h3>
          <Select value={selectedRound} onValueChange={setSelectedRound}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por ronda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as rondas</SelectItem>
              {availableRounds.map((round) => (
                <SelectItem key={round} value={round.toString()}>
                  Ronda {round}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {sortedActions.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader className="p-3 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(action.actionType)}
                      <CardTitle className="text-base">
                        {action.actionName}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Ronda {action.round}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(action.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <p className="text-sm">{renderActionDescription(action)}</p>

                  {action.description && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{action.description}"
                    </p>
                  )}

                  {/* Mostrar detalhes das rolagens quando disponíveis */}
                  {action.rollData && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Rolagem: </span>
                      {Array.isArray(action.rollData.results)
                        ? action.rollData.results.join(", ")
                        : action.rollData.result ||
                          action.rollData.total ||
                          JSON.stringify(action.rollData)}

                      {action.rollData.modifier &&
                        action.rollData.modifier !== 0 && (
                          <span>
                            {" "}
                            {action.rollData.modifier > 0 ? "+" : ""}
                            {action.rollData.modifier}
                          </span>
                        )}

                      {action.rollData.total && (
                        <span className="font-medium">
                          {" "}
                          = {action.rollData.total}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
