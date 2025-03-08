"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save, Users, Calendar } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { campaignsAPI } from "@/lib/api";

// Validação do formulário com Zod
const campaignSchema = z.object({
  name: z.string().min(2, {
    message: "O nome precisa ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  setting: z.string().optional(),
  status: z.enum(["planejamento", "em_progresso", "concluida", "pausada"], {
    required_error: "Selecione um status",
  }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  levelMin: z.coerce.number().min(1).max(20).default(1),
  levelMax: z.coerce.number().min(1).max(20).default(20),
  isPrivate: z.boolean().default(false),
  meetingSchedule: z.string().optional(),
  notes: z.string().optional(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function CampaignForm({
  initialData,
  isEditing = false,
}: CampaignFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepara os dados iniciais
  const defaultValues: CampaignFormValues = {
    name: "",
    description: "",
    setting: "",
    status: "planejamento",
    startDate: "",
    endDate: "",
    levelMin: 1,
    levelMax: 20,
    isPrivate: false,
    meetingSchedule: "",
    notes: "",
  };

  // Se estiver editando, ajusta os valores iniciais
  if (isEditing && initialData) {
    defaultValues.name = initialData.name;
    defaultValues.description = initialData.description || "";
    defaultValues.setting = initialData.setting || "";
    defaultValues.status = initialData.status;
    defaultValues.startDate = initialData.startDate
      ? new Date(initialData.startDate).toISOString().slice(0, 10)
      : "";
    defaultValues.endDate = initialData.endDate
      ? new Date(initialData.endDate).toISOString().slice(0, 10)
      : "";
    defaultValues.levelMin = initialData.level?.min || 1;
    defaultValues.levelMax = initialData.level?.max || 20;
    defaultValues.isPrivate = initialData.isPrivate || false;
    defaultValues.meetingSchedule = initialData.meetingSchedule || "";
    defaultValues.notes = initialData.notes || "";
  }

  // Configuração do formulário
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues,
  });

  // Função para lidar com o envio do formulário
  async function onSubmit(data: CampaignFormValues) {
    setIsSubmitting(true);

    try {
      // Transformar dados para o formato esperado pela API
      const campaignData = {
        name: data.name,
        description: data.description,
        setting: data.setting,
        status: data.status,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : undefined,
        endDate: data.endDate
          ? new Date(data.endDate).toISOString()
          : undefined,
        level: {
          min: data.levelMin,
          max: data.levelMax,
        },
        isPrivate: data.isPrivate,
        meetingSchedule: data.meetingSchedule,
        notes: data.notes,
      };

      if (isEditing && initialData) {
        // Atualizar campanha existente
        await campaignsAPI.update(initialData.id, campaignData);

        toast({
          title: "Campanha atualizada",
          description: `${data.name} foi atualizada com sucesso.`,
        });
      } else {
        // Criar nova campanha
        await campaignsAPI.create(campaignData);

        toast({
          title: "Campanha criada",
          description: `${data.name} foi criada com sucesso.`,
        });
      }

      // Redirecionar para a lista de campanhas
      router.push("/campaigns");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar a campanha. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Campanha</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: A Maldição de Strahd" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="setting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cenário</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: Forgotten Realms, Eberron, etc."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva brevemente sua campanha..."
                  className="h-24 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planejamento">
                      Em Planejamento
                    </SelectItem>
                    <SelectItem value="em_progresso">Em Progresso</SelectItem>
                    <SelectItem value="pausada">Pausada</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Campanha Privada</FormLabel>
                  <FormDescription>
                    Visível apenas para jogadores convidados
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Encerramento</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="levelMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível Mínimo</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={20} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="levelMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível Máximo</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={20} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="meetingSchedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agendamento</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Todas as quartas, 19h-22h" />
              </FormControl>
              <FormDescription>
                Quando sua campanha normalmente acontece
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Outras informações relevantes..."
                  className="h-24 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/campaigns")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-dnd-red hover:bg-dnd-darkred"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Atualizando..." : "Criando..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Atualizar" : "Criar"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
