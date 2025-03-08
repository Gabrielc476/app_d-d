"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Heart,
  HeartCrack,
  Shield,
  Skull,
  Sword,
  Plus,
  Minus,
} from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { useCombatStore } from "@/lib/stores/combatStore";
import { useDiceStore, DiceType } from "@/lib/stores/diceStore";

// Esquema de validação
const damageFormSchema = z.object({
  damageAmount: z.coerce.number().min(0).default(0),
  damageType: z.string().min(1, {
    message: "Selecione um tipo de dano",
  }),
  isHealing: z.boolean().default(false),
  isTempHP: z.boolean().default(false),
  applyResistance: z.boolean().default(false),
  applyVulnerability: z.boolean().default(false),
  description: z.string().optional(),
});

interface DamageFormProps {
  participantId: string;
  combatSessionId: string;
  onComplete: () => void;
}

// Tipos de dano do D&D 5e
const damageTypes = [
  { value: "acid", label: "Ácido" },
  { value: "bludgeoning", label: "Concussão" },
  { value: "cold", label: "Frio" },
  { value: "fire", label: "Fogo" },
  { value: "force", label: "Força" },
  { value: "lightning", label: "Elétrico" },
  { value: "necrotic", label: "Necrótico" },
  { value: "piercing", label: "Perfurante" },
  { value: "poison", label: "Veneno" },
  { value: "psychic", label: "Psíquico" },
  { value: "radiant", label: "Radiante" },
  { value: "slashing", label: "Cortante" },
  { value: "thunder", label: "Trovão" },
  { value: "healing", label: "Cura" },
];

export function DamageForm({
  participantId,
  combatSessionId,
  onComplete,
}: DamageFormProps) {
  // States e hooks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentCombat, updateParticipant, recordAction } = useCombatStore();
  const { rollDice } = useDiceStore();

  // Busca o participante
  const participant = currentCombat?.participants?.find(
    (p) => p.id === participantId
  );

  // Configuração do formulário
  const form = useForm<z.infer<typeof damageFormSchema>>({
    resolver: zodResolver(damageFormSchema),
    defaultValues: {
      damageAmount: 0,
      damageType: "slashing",
      isHealing: false,
      isTempHP: false,
      applyResistance: false,
      applyVulnerability: false,
      description: "",
    },
  });

  // Observa mudanças no isHealing
  const isHealing = form.watch("isHealing");
  const isTempHP = form.watch("isTempHP");

  // Atualiza o tipo de dano quando isHealing muda
  useEffect(() => {
    if (isHealing) {
      form.setValue("damageType", "healing");
      form.setValue("applyResistance", false);
      form.setValue("applyVulnerability", false);
    } else if (form.getValues("damageType") === "healing") {
      form.setValue("damageType", "slashing");
    }
  }, [isHealing, form]);

  // Atualiza tempHP e resistência quando isTempHP muda
  useEffect(() => {
    if (isTempHP) {
      form.setValue("isHealing", true);
      form.setValue("applyResistance", false);
      form.setValue("applyVulnerability", false);
    }
  }, [isTempHP, form]);

  // Handler para rolar dados de dano
  const handleRollDamage = async (diceType: DiceType, diceCount: number) => {
    try {
      const result = await rollDice({
        diceType,
        diceCount,
        modifier: 0,
        rollType: "damage",
        rollLabel: "Rolagem de Dano",
      });

      form.setValue("damageAmount", result.total);
    } catch (error) {
      console.error("Erro ao rolar dano:", error);
    }
  };

  // Handler para incrementar/decrementar
  const handleIncrement = (amount: number) => {
    const currentValue = form.getValues("damageAmount") || 0;
    form.setValue("damageAmount", currentValue + amount);
  };

  // Handler de envio
  const onSubmit = async (data: z.infer<typeof damageFormSchema>) => {
    if (!participant) return;

    setIsSubmitting(true);

    try {
      let finalAmount = data.damageAmount;

      // Aplicar resistência/vulnerabilidade
      if (!data.isHealing) {
        if (data.applyResistance) {
          finalAmount = Math.floor(finalAmount / 2);
        } else if (data.applyVulnerability) {
          finalAmount = finalAmount * 2;
        }
      }

      // Calcular novos valores de HP
      let newCurrentHP = participant.currentHitPoints;
      let newTempHP = participant.temporaryHitPoints || 0;

      if (data.isHealing) {
        if (data.isTempHP) {
          // Dar HP temporário
          newTempHP = Math.max(newTempHP, finalAmount);
        } else {
          // Curar HP normal
          newCurrentHP = Math.min(
            participant.maxHitPoints,
            newCurrentHP + finalAmount
          );
        }
      } else {
        // Aplicar dano
        // Primeiro, aplicar ao HP temporário
        if (newTempHP > 0) {
          if (newTempHP >= finalAmount) {
            newTempHP -= finalAmount;
            finalAmount = 0;
          } else {
            finalAmount -= newTempHP;
            newTempHP = 0;
          }
        }

        // Depois, aplicar ao HP normal
        newCurrentHP = Math.max(0, newCurrentHP - finalAmount);
      }

      // Atualizar o participante
      await updateParticipant(participantId, {
        currentHitPoints: newCurrentHP,
        temporaryHitPoints: newTempHP,
      });

      // Registrar a ação
      await recordAction({
        actorId: participantId, // Auto-dano/cura
        actionType: data.isHealing ? "ability" : "attack",
        actionName: data.isHealing
          ? data.isTempHP
            ? "Pontos de Vida Temporários"
            : "Cura"
          : "Dano",
        description: data.description || undefined,
        damage: finalAmount,
        damageType: data.damageType,
      });

      // Fechar o formulário
      onComplete();
    } catch (error) {
      console.error("Erro ao aplicar dano/cura:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!participant) {
    return <div>Participante não encontrado</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="isHealing"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  {field.value ? (
                    <Heart className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <HeartCrack className="mr-2 h-4 w-4 text-red-500" />
                  )}
                  {field.value ? "Curar" : "Causar Dano"}
                </FormLabel>
                <FormDescription>
                  {field.value
                    ? "Restaurar pontos de vida ao invés de causar dano"
                    : "Reduzir pontos de vida"}
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

        {isHealing && (
          <FormField
            control={form.control}
            name="isTempHP"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-blue-500" />
                    Pontos de Vida Temporários
                  </FormLabel>
                  <FormDescription>
                    Conceder PV temporários ao invés de curar
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
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="damageAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isHealing
                    ? isTempHP
                      ? "PV Temporários"
                      : "Quantidade de Cura"
                    : "Quantidade de Dano"}
                </FormLabel>
                <div className="flex">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => handleIncrement(-1)}
                    disabled={field.value <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      className="rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => handleIncrement(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="damageType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isHealing && !isTempHP}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de dano" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {damageTypes.map(
                      (type) =>
                        // Se for cura, mostrar apenas o tipo "healing"
                        (!isHealing ||
                          type.value === "healing" ||
                          isTempHP) && (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!isHealing && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="applyResistance"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Resistência</FormLabel>
                    <FormDescription>Reduz o dano pela metade</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("applyVulnerability", false);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applyVulnerability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Vulnerabilidade</FormLabel>
                    <FormDescription>Dobra o dano recebido</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("applyResistance", false);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Dano de queda, Cura por poção, etc."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Atalhos de rolagem de dados */}
        <div className="pt-2">
          <div className="mb-2 text-sm font-medium">Rolar Dano:</div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRollDamage("d4", 1)}
            >
              1d4
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRollDamage("d6", 1)}
            >
              1d6
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRollDamage("d8", 1)}
            >
              1d8
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRollDamage("d10", 1)}
            >
              1d10
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRollDamage("d12", 1)}
            >
              1d12
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRollDamage("d6", 2)}
            >
              2d6
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRollDamage("d8", 2)}
            >
              2d8
            </Button>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`${
              isHealing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubmitting
              ? "Processando..."
              : isHealing
              ? isTempHP
                ? "Aplicar PV Temporários"
                : "Curar"
              : "Aplicar Dano"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
