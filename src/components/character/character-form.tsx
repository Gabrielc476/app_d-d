"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save, DiceD20 } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { charactersAPI } from "@/lib/api";
import { calculateModifier, formatModifier } from "@/lib/utils";

// Lista de classes de D&D 5e
const CLASS_OPTIONS = [
  { value: "barbaro", label: "Bárbaro" },
  { value: "bardo", label: "Bardo" },
  { value: "bruxo", label: "Bruxo" },
  { value: "clerigo", label: "Clérigo" },
  { value: "druida", label: "Druida" },
  { value: "feiticeiro", label: "Feiticeiro" },
  { value: "guardiao", label: "Guardião" },
  { value: "guerreiro", label: "Guerreiro" },
  { value: "ladino", label: "Ladino" },
  { value: "mago", label: "Mago" },
  { value: "monge", label: "Monge" },
  { value: "paladino", label: "Paladino" },
];

// Lista de raças de D&D 5e
const RACE_OPTIONS = [
  { value: "anao", label: "Anão" },
  { value: "draconato", label: "Draconato" },
  { value: "elfo", label: "Elfo" },
  { value: "gnomo", label: "Gnomo" },
  { value: "halfling", label: "Halfling" },
  { value: "humano", label: "Humano" },
  { value: "meio-elfo", label: "Meio-Elfo" },
  { value: "meio-orc", label: "Meio-Orc" },
  { value: "tiefling", label: "Tiefling" },
];

// Lista de antecedentes de D&D 5e
const BACKGROUND_OPTIONS = [
  { value: "acólito", label: "Acólito" },
  { value: "artesão de guilda", label: "Artesão de Guilda" },
  { value: "artista", label: "Artista" },
  { value: "charlatão", label: "Charlatão" },
  { value: "criminoso", label: "Criminoso" },
  { value: "eremita", label: "Eremita" },
  { value: "forasteiro", label: "Forasteiro" },
  { value: "herói do povo", label: "Herói do Povo" },
  { value: "marinheiro", label: "Marinheiro" },
  { value: "nobre", label: "Nobre" },
  { value: "órfão", label: "Órfão" },
  { value: "sábio", label: "Sábio" },
  { value: "soldado", label: "Soldado" },
];

// Lista de alinhamentos de D&D 5e
const ALIGNMENT_OPTIONS = [
  { value: "lawful-good", label: "Leal e Bom" },
  { value: "neutral-good", label: "Neutro e Bom" },
  { value: "chaotic-good", label: "Caótico e Bom" },
  { value: "lawful-neutral", label: "Leal e Neutro" },
  { value: "true-neutral", label: "Neutro" },
  { value: "chaotic-neutral", label: "Caótico e Neutro" },
  { value: "lawful-evil", label: "Leal e Mau" },
  { value: "neutral-evil", label: "Neutro e Mau" },
  { value: "chaotic-evil", label: "Caótico e Mau" },
];

// Validação do formulário com Zod
const characterSchema = z.object({
  name: z.string().min(2, {
    message: "O nome precisa ter pelo menos 2 caracteres.",
  }),
  race: z.string({
    required_error: "Selecione uma raça.",
  }),
  class: z.string({
    required_error: "Selecione uma classe.",
  }),
  level: z.coerce.number().min(1).max(20),
  background: z.string().optional(),
  alignment: z.string().optional(),
  strength: z.coerce.number().min(1).max(30),
  dexterity: z.coerce.number().min(1).max(30),
  constitution: z.coerce.number().min(1).max(30),
  intelligence: z.coerce.number().min(1).max(30),
  wisdom: z.coerce.number().min(1).max(30),
  charisma: z.coerce.number().min(1).max(30),
  maxHitPoints: z.coerce.number().min(1),
  currentHitPoints: z.coerce.number().min(0),
  temporaryHitPoints: z.coerce.number().min(0).default(0),
  armorClass: z.coerce.number().min(1),
  initiativeBonus: z.coerce.number().default(0),
  speed: z.coerce.number().min(1).default(30),
  appearance: z.string().optional(),
  backstory: z.string().optional(),
  notes: z.string().optional(),
});

type CharacterFormValues = z.infer<typeof characterSchema>;

interface CharacterFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function CharacterForm({
  initialData,
  isEditing = false,
}: CharacterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Configuração do formulário
  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: initialData || {
      name: "",
      race: "",
      class: "",
      level: 1,
      background: "",
      alignment: "",
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      maxHitPoints: 10,
      currentHitPoints: 10,
      temporaryHitPoints: 0,
      armorClass: 10,
      initiativeBonus: 0,
      speed: 30,
      appearance: "",
      backstory: "",
      notes: "",
    },
  });

  // Atualiza o valor de iniciativeBonus quando dexterity muda
  const dexterity = form.watch("dexterity");

  useEffect(() => {
    const dexMod = calculateModifier(dexterity);
    form.setValue("initiativeBonus", dexMod);
  }, [dexterity, form]);

  // Função para lidar com o envio do formulário
  async function onSubmit(data: CharacterFormValues) {
    setIsSubmitting(true);

    try {
      if (isEditing && initialData) {
        // Atualizar personagem existente
        await charactersAPI.update(initialData.id, data);

        toast({
          title: "Personagem atualizado",
          description: `${data.name} foi atualizado com sucesso.`,
        });
      } else {
        // Criar novo personagem
        await charactersAPI.create(data);

        toast({
          title: "Personagem criado",
          description: `${data.name} foi criado com sucesso.`,
        });
      }

      // Redirecionar para a lista de personagens
      router.push("/characters");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar personagem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o personagem. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Função de rolagem de dados para atributos
  function rollAbility() {
    // Simula 4d6, descarta o menor valor
    const rolls = Array.from(
      { length: 4 },
      () => Math.floor(Math.random() * 6) + 1
    );
    rolls.sort((a, b) => a - b); // Ordena os valores
    rolls.shift(); // Remove o menor valor
    return rolls.reduce((sum, roll) => sum + roll, 0); // Soma os 3 maiores valores
  }

  function rollAllAbilities() {
    form.setValue("strength", rollAbility());
    form.setValue("dexterity", rollAbility());
    form.setValue("constitution", rollAbility());
    form.setValue("intelligence", rollAbility());
    form.setValue("wisdom", rollAbility());
    form.setValue("charisma", rollAbility());
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="abilities">Atributos</TabsTrigger>
            <TabsTrigger value="combat">Combate</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>

          {/* Aba Básico */}
          <TabsContent value="basic" className="space-y-6 pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Personagem</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raça</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma raça" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RACE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma classe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLASS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="background"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Antecedente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um antecedente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BACKGROUND_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alignment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alinhamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um alinhamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALIGNMENT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Aba Atributos */}
          <TabsContent value="abilities" className="space-y-6 pt-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={rollAllAbilities}
                className="flex items-center gap-2"
              >
                <DiceD20 className="h-4 w-4" />
                <span>Rolar atributos</span>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="strength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Força</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        <Input type="number" min={1} max={30} {...field} />
                        <div className="mt-1 text-sm text-muted-foreground">
                          Mod: {formatModifier(calculateModifier(field.value))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dexterity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destreza</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        <Input type="number" min={1} max={30} {...field} />
                        <div className="mt-1 text-sm text-muted-foreground">
                          Mod: {formatModifier(calculateModifier(field.value))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="constitution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Constituição</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        <Input type="number" min={1} max={30} {...field} />
                        <div className="mt-1 text-sm text-muted-foreground">
                          Mod: {formatModifier(calculateModifier(field.value))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intelligence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inteligência</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        <Input type="number" min={1} max={30} {...field} />
                        <div className="mt-1 text-sm text-muted-foreground">
                          Mod: {formatModifier(calculateModifier(field.value))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wisdom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sabedoria</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        <Input type="number" min={1} max={30} {...field} />
                        <div className="mt-1 text-sm text-muted-foreground">
                          Mod: {formatModifier(calculateModifier(field.value))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="charisma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carisma</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center">
                        <Input type="number" min={1} max={30} {...field} />
                        <div className="mt-1 text-sm text-muted-foreground">
                          Mod: {formatModifier(calculateModifier(field.value))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Aba Combate */}
          <TabsContent value="combat" className="space-y-6 pt-4">
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="maxHitPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontos de Vida Máximos</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentHitPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontos de Vida Atuais</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temporaryHitPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontos de Vida Temporários</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="armorClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe de Armadura</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initiativeBonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bônus de Iniciativa</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Baseado no modificador de Destreza
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="speed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deslocamento</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Aba Detalhes */}
          <TabsContent value="details" className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="appearance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aparência</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a aparência do seu personagem..."
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backstory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>História</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conte a história do seu personagem..."
                      className="h-36 resize-none"
                      {...field}
                    />
                  </FormControl>
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
                      placeholder="Adicione notas adicionais..."
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/characters")}
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
