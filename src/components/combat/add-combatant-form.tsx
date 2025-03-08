"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DiceD20, Swords, Shield, Heart, Skull, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useCombatStore } from "@/lib/stores/combatStore";
import { useDiceStore, DiceType } from "@/lib/stores/diceStore";
import { charactersAPI } from "@/lib/api";

// Esquema de validação
const addCombatantSchema = z.object({
  name: z.string().min(1, {
    message: "Nome obrigatório",
  }),
  type: z.enum(["player", "npc", "monster"]),
  armorClass: z.coerce.number().min(1).default(10),
  maxHitPoints: z.coerce.number().min(1).default(10),
  currentHitPoints: z.coerce.number().optional(),
  initiative: z.coerce.number().default(0),
  isVisible: z.boolean().default(true),
});

interface AddCombatantFormProps {
  combatSessionId: string;
  campaignId?: string;
  onComplete: () => void;
}

export function AddCombatantForm({
  combatSessionId,
  campaignId,
  onComplete,
}: AddCombatantFormProps) {
  // States e hooks
  const [activeTab, setActiveTab] = useState("monster");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignCharacters, setCampaignCharacters] = useState<any[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);

  const { addParticipant } = useCombatStore();
  const { rollDice } = useDiceStore();

  // Carregar personagens da campanha (se disponível)
  useEffect(() => {
    if (campaignId && activeTab === "player") {
      fetchCampaignCharacters();
    }
  }, [campaignId, activeTab]);

  const fetchCampaignCharacters = async () => {
    if (!campaignId) return;

    setIsLoadingCharacters(true);

    try {
      // Aqui você deveria chamar a API para buscar os personagens da campanha
      // Por enquanto vamos usar um placeholder
      const response = { data: [] }; // Placeholder
      setCampaignCharacters(response.data);
    } catch (error) {
      console.error("Erro ao buscar personagens da campanha:", error);
    } finally {
      setIsLoadingCharacters(false);
    }
  };

  // Configuração do formulário
  const form = useForm<z.infer<typeof addCombatantSchema>>({
    resolver: zodResolver(addCombatantSchema),
    defaultValues: {
      name: "",
      type:
        activeTab === "player"
          ? "player"
          : activeTab === "npc"
          ? "npc"
          : "monster",
      armorClass: 10,
      maxHitPoints: 10,
      initiative: 0,
      isVisible: true,
    },
  });

  // Atualizar o tipo quando a aba muda
  useEffect(() => {
    form.setValue(
      "type",
      activeTab === "player"
        ? "player"
        : activeTab === "npc"
        ? "npc"
        : "monster"
    );
  }, [activeTab, form]);

  // Handler para rolar iniciativa
  const handleRollInitiative = async () => {
    try {
      const result = await rollDice({
        diceType: "d20" as DiceType,
        diceCount: 1,
        modifier: 0,
        rollType: "initiative",
        rollLabel: "Iniciativa",
      });

      form.setValue("initiative", result.total);
    } catch (error) {
      console.error("Erro ao rolar iniciativa:", error);
    }
  };

  // Handler para selecionar personagem
  const handleSelectCharacter = async (characterId: string) => {
    setSelectedCharacterId(characterId);

    if (!characterId) return;

    try {
      const response = await charactersAPI.getById(characterId);
      const character = response.data;

      form.setValue("name", character.name);
      form.setValue("armorClass", character.armorClass);
      form.setValue("maxHitPoints", character.maxHitPoints);
      form.setValue("currentHitPoints", character.currentHitPoints);

      // Calcular modificador de Destreza para iniciativa
      const dexModifier = Math.floor((character.dexterity - 10) / 2);
      form.setValue("initiative", dexModifier);
    } catch (error) {
      console.error("Erro ao carregar dados do personagem:", error);
    }
  };

  // Handler de envio
  const onSubmit = async (data: z.infer<typeof addCombatantSchema>) => {
    setIsSubmitting(true);

    try {
      // Garantir que currentHitPoints seja igual a maxHitPoints se não for fornecido
      if (!data.currentHitPoints) {
        data.currentHitPoints = data.maxHitPoints;
      }

      // Adicionar o participante
      await addParticipant({
        ...data,
        characterId: activeTab === "player" ? selectedCharacterId : undefined,
      });

      // Fechar o formulário
      onComplete();
    } catch (error) {
      console.error("Erro ao adicionar participante:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="player">Jogador</TabsTrigger>
        <TabsTrigger value="npc">NPC</TabsTrigger>
        <TabsTrigger value="monster">Monstro</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <TabsContent value="player" className="space-y-4">
            {campaignId ? (
              <>
                <FormItem>
                  <FormLabel>Selecione um Personagem</FormLabel>
                  <Select
                    value={selectedCharacterId}
                    onValueChange={handleSelectCharacter}
                    disabled={isLoadingCharacters}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um personagem" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignCharacters.length > 0 ? (
                        campaignCharacters.map((character) => (
                          <SelectItem key={character.id} value={character.id}>
                            {character.name} ({character.class} Nível{" "}
                            {character.level})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          {isLoadingCharacters
                            ? "Carregando..."
                            : "Nenhum personagem disponível"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {campaignCharacters.length === 0 && !isLoadingCharacters && (
                    <FormDescription>
                      Não há personagens disponíveis nesta campanha.
                    </FormDescription>
                  )}
                </FormItem>

                <FormField
                  control={form.control}
                  name="initiative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Iniciativa</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input {...field} type="number" className="flex-1" />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleRollInitiative}
                        >
                          <DiceD20 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <div className="text-center p-4 border rounded-md">
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">Sem campanha associada</h3>
                <p className="text-sm text-muted-foreground">
                  Para adicionar personagens jogadores, crie um combate
                  associado a uma campanha.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="npc" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do NPC</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o nome do NPC" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="armorClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe de Armadura</FormLabel>
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input {...field} type="number" min={1} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxHitPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontos de Vida</FormLabel>
                    <div className="flex items-center">
                      <Heart className="mr-2 h-4 w-4 text-red-500" />
                      <FormControl>
                        <Input {...field} type="number" min={1} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="initiative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Iniciativa</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input {...field} type="number" className="flex-1" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRollInitiative}
                    >
                      <DiceD20 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Visível para Jogadores
                    </FormLabel>
                    <FormDescription>
                      Determina se os jogadores podem ver este NPC no combate
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="monster" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Monstro</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digite o nome do monstro" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="armorClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe de Armadura</FormLabel>
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input {...field} type="number" min={1} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxHitPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontos de Vida</FormLabel>
                    <div className="flex items-center">
                      <Heart className="mr-2 h-4 w-4 text-red-500" />
                      <FormControl>
                        <Input {...field} type="number" min={1} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="initiative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Iniciativa</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input {...field} type="number" className="flex-1" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRollInitiative}
                    >
                      <DiceD20 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Visível para Jogadores
                    </FormLabel>
                    <FormDescription>
                      Determina se os jogadores podem ver este monstro no
                      combate
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={onComplete}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (activeTab === "player" && !selectedCharacterId && campaignId)
              }
              className="bg-dnd-red hover:bg-dnd-darkred"
            >
              {isSubmitting ? "Adicionando..." : "Adicionar Participante"}
            </Button>
          </div>
        </form>
      </Form>
    </Tabs>
  );
}
