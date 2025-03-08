"use client";

import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import socket from "@/lib/socket";
import { useDiceStore, DiceRoll } from "@/lib/stores/diceStore";
import {
  useCombatStore,
  CombatSession,
  CombatParticipant,
  CombatAction,
} from "@/lib/stores/combatStore";

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { data: session } = useSession();
  const { toast } = useToast();

  // Stores
  const addDiceRoll = useDiceStore((state) => state.addDiceRoll);
  const { updateCombatState, updateParticipantState, addActionToHistory } =
    useCombatStore();

  // Conectar ao socket quando autenticado
  useEffect(() => {
    if (session?.user?.accessToken) {
      // Configurar autenticação para o socket
      socket.auth = { token: session.user.accessToken };

      // Conectar ao socket
      socket.connect();

      // Handler para conexão bem-sucedida
      const handleConnect = () => {
        console.log("Conectado ao socket!");
      };

      // Handler para erros de conexão
      const handleConnectError = (err: Error) => {
        console.error("Erro de conexão socket:", err.message);
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor em tempo real.",
        });
      };

      // Handler para receber resultados de dados
      const handleDiceRollResult = (data: DiceRoll) => {
        // Adicionar o resultado ao estado
        addDiceRoll(data);

        // Exibir toast para rolagens de outros usuários
        if (data.userId !== "local" && data.userId !== session.user.id) {
          toast({
            title: `${data.username} rolou ${data.diceCount}${data.diceType}`,
            description: `Resultado: ${data.total}`,
          });
        }
      };

      // Handlers para eventos de combate
      const handleCombatStarted = (data: { combatSession: CombatSession }) => {
        updateCombatState(data.combatSession);
        toast({
          title: "Combate iniciado",
          description: `Ronda 1 - Ordem de iniciativa definida`,
        });
      };

      const handleTurnAdvanced = (data: {
        combatSession: CombatSession;
        newRound: boolean;
      }) => {
        updateCombatState(data.combatSession);

        if (data.newRound) {
          toast({
            title: `Ronda ${data.combatSession.round}`,
            description: "Nova ronda de combate iniciada",
          });
        }
      };

      const handleCombatStatusChanged = (data: {
        combatSessionId: string;
        status: string;
      }) => {
        // Aqui devemos carregar todo o combate novamente para obter o estado atualizado
        // Isso será tratado pelo componente da sessão de combate
        toast({
          title: "Status de combate alterado",
          description: `O combate foi ${
            data.status === "pausado" ? "pausado" : "retomado"
          }`,
        });
      };

      const handleCombatEnded = (data: { combatSessionId: string }) => {
        toast({
          title: "Combate finalizado",
          description: "Esta sessão de combate foi encerrada",
        });
      };

      const handleParticipantAdded = (data: {
        combatSessionId: string;
        participant: CombatParticipant;
      }) => {
        updateParticipantState(data.participant);

        toast({
          title: "Novo participante",
          description: `${data.participant.name} entrou no combate`,
        });
      };

      const handleParticipantUpdated = (data: {
        combatSessionId: string;
        participant: CombatParticipant;
      }) => {
        updateParticipantState(data.participant);
      };

      const handleActionRecorded = (data: {
        combatSessionId: string;
        action: CombatAction;
      }) => {
        addActionToHistory(data.action);

        // Exibir toast para ações de ataque, magia, etc.
        if (["attack", "spell", "ability"].includes(data.action.actionType)) {
          const actionName = data.action.actionName;
          const actorName = data.action.actor?.name || "Alguém";
          const targetName = data.action.target?.name || "um alvo";

          let description = `${actorName} usou ${actionName}`;
          if (data.action.damage) {
            description += ` causando ${data.action.damage} de dano`;
            if (data.action.damageType) {
              description += ` (${data.action.damageType})`;
            }
          }

          if (data.action.targetId) {
            description += ` em ${targetName}`;
          }

          toast({
            title: `Ação em combate`,
            description,
          });
        }
      };

      // Registrar handlers
      socket.on("connect", handleConnect);
      socket.on("connect_error", handleConnectError);
      socket.on("diceRollResult", handleDiceRollResult);
      socket.on("combatStarted", handleCombatStarted);
      socket.on("turnAdvanced", handleTurnAdvanced);
      socket.on("combatStatusChanged", handleCombatStatusChanged);
      socket.on("combatEnded", handleCombatEnded);
      socket.on("participantAdded", handleParticipantAdded);
      socket.on("participantUpdated", handleParticipantUpdated);
      socket.on("actionRecorded", handleActionRecorded);

      // Cleanup
      return () => {
        socket.off("connect", handleConnect);
        socket.off("connect_error", handleConnectError);
        socket.off("diceRollResult", handleDiceRollResult);
        socket.off("combatStarted", handleCombatStarted);
        socket.off("turnAdvanced", handleTurnAdvanced);
        socket.off("combatStatusChanged", handleCombatStatusChanged);
        socket.off("combatEnded", handleCombatEnded);
        socket.off("participantAdded", handleParticipantAdded);
        socket.off("participantUpdated", handleParticipantUpdated);
        socket.off("actionRecorded", handleActionRecorded);

        socket.disconnect();
      };
    }
  }, [
    session,
    addDiceRoll,
    updateCombatState,
    updateParticipantState,
    addActionToHistory,
    toast,
  ]);

  return <>{children}</>;
}
