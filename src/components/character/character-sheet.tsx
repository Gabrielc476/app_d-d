"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Edit,
  Shield,
  Heart,
  Footprints,
  Zap,
  BookOpen,
  Swords,
  Scroll,
  DiceD20,
  User2,
  BookText,
  Archive,
  Feather,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateModifier, formatModifier } from "@/lib/utils";

interface CharacterSheetProps {
  character: any;
}

export function CharacterSheet({ character }: CharacterSheetProps) {
  const [activeTab, setActiveTab] = useState("stats");

  // Calcula porcentagem de vida atual
  const healthPercentage =
    (character.currentHitPoints / character.maxHitPoints) * 100;

  // Determina cor da barra de vida
  const getHealthColor = () => {
    if (healthPercentage <= 25) return "bg-red-500";
    if (healthPercentage <= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Apresenta os modificadores dos atributos
  const abilityModifier = (score: number) => {
    return formatModifier(calculateModifier(score));
  };

  // Bônus de proficiência baseado no nível
  const proficiencyBonus = Math.floor((character.level - 1) / 4) + 2;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {character.name}
          </h1>
          <p className="text-muted-foreground">
            {character.race} {character.class} (Nível {character.level})
            {character.background && ` • ${character.background}`}
          </p>
        </div>
        <Link href={`/characters/${character.id}/edit`}>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        </Link>
      </div>

      {/* Status rápido */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pontos de Vida
            </CardTitle>
            <Heart className="h-4 w-4 text-dnd-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {character.currentHitPoints}/{character.maxHitPoints}
              {character.temporaryHitPoints > 0 && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  (+{character.temporaryHitPoints})
                </span>
              )}
            </div>
            <Progress
              value={healthPercentage}
              className={`h-2 mt-2 ${getHealthColor()}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Classe de Armadura
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{character.armorClass}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Proteção contra ataques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Iniciativa</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatModifier(character.initiativeBonus)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Bônus para ordem de turno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deslocamento</CardTitle>
            <Footprints className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{character.speed}m</div>
            <p className="text-xs text-muted-foreground mt-2">
              Distância por turno
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stats">Atributos</TabsTrigger>
          <TabsTrigger value="combat">Combate</TabsTrigger>
          <TabsTrigger value="spells">Magias</TabsTrigger>
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        {/* Aba de Atributos */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            <Card className="pt-6">
              <CardContent className="text-center">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  FOR
                </span>
                <div className="mt-2 text-3xl font-bold">
                  {character.strength}
                </div>
                <div className="mt-1 text-sm">
                  {abilityModifier(character.strength)}
                </div>
              </CardContent>
            </Card>

            <Card className="pt-6">
              <CardContent className="text-center">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  DES
                </span>
                <div className="mt-2 text-3xl font-bold">
                  {character.dexterity}
                </div>
                <div className="mt-1 text-sm">
                  {abilityModifier(character.dexterity)}
                </div>
              </CardContent>
            </Card>

            <Card className="pt-6">
              <CardContent className="text-center">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  CON
                </span>
                <div className="mt-2 text-3xl font-bold">
                  {character.constitution}
                </div>
                <div className="mt-1 text-sm">
                  {abilityModifier(character.constitution)}
                </div>
              </CardContent>
            </Card>

            <Card className="pt-6">
              <CardContent className="text-center">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  INT
                </span>
                <div className="mt-2 text-3xl font-bold">
                  {character.intelligence}
                </div>
                <div className="mt-1 text-sm">
                  {abilityModifier(character.intelligence)}
                </div>
              </CardContent>
            </Card>

            <Card className="pt-6">
              <CardContent className="text-center">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  SAB
                </span>
                <div className="mt-2 text-3xl font-bold">
                  {character.wisdom}
                </div>
                <div className="mt-1 text-sm">
                  {abilityModifier(character.wisdom)}
                </div>
              </CardContent>
            </Card>

            <Card className="pt-6">
              <CardContent className="text-center">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  CAR
                </span>
                <div className="mt-2 text-3xl font-bold">
                  {character.charisma}
                </div>
                <div className="mt-1 text-sm">
                  {abilityModifier(character.charisma)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Testes de Resistência</CardTitle>
                <CardDescription>
                  Bônus de Proficiência: +{proficiencyBonus}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span>Força</span>
                    <span>{abilityModifier(character.strength)}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Destreza</span>
                    <span>{abilityModifier(character.dexterity)}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Constituição</span>
                    <span>{abilityModifier(character.constitution)}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Inteligência</span>
                    <span>{abilityModifier(character.intelligence)}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Sabedoria</span>
                    <span>{abilityModifier(character.wisdom)}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Carisma</span>
                    <span>{abilityModifier(character.charisma)}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Perícias</CardTitle>
                <CardDescription>
                  Baseadas nos modificadores de atributos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-y-2">
                  <li className="flex items-center justify-between pr-4">
                    <span>Acrobacia (DES)</span>
                    <span>{abilityModifier(character.dexterity)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Arcanismo (INT)</span>
                    <span>{abilityModifier(character.intelligence)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Atletismo (FOR)</span>
                    <span>{abilityModifier(character.strength)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Enganação (CAR)</span>
                    <span>{abilityModifier(character.charisma)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>História (INT)</span>
                    <span>{abilityModifier(character.intelligence)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Intuição (SAB)</span>
                    <span>{abilityModifier(character.wisdom)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Intimidação (CAR)</span>
                    <span>{abilityModifier(character.charisma)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Investigação (INT)</span>
                    <span>{abilityModifier(character.intelligence)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Medicina (SAB)</span>
                    <span>{abilityModifier(character.wisdom)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Natureza (INT)</span>
                    <span>{abilityModifier(character.intelligence)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Percepção (SAB)</span>
                    <span>{abilityModifier(character.wisdom)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Atuação (CAR)</span>
                    <span>{abilityModifier(character.charisma)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Persuasão (CAR)</span>
                    <span>{abilityModifier(character.charisma)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Religião (INT)</span>
                    <span>{abilityModifier(character.intelligence)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Furtividade (DES)</span>
                    <span>{abilityModifier(character.dexterity)}</span>
                  </li>
                  <li className="flex items-center justify-between pr-4">
                    <span>Sobrevivência (SAB)</span>
                    <span>{abilityModifier(character.wisdom)}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Combate */}
        <TabsContent value="combat" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Ataques</CardTitle>
                  <DiceD20 className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 border-b px-4 py-2 font-medium">
                    <div>Nome</div>
                    <div className="text-center">Bônus</div>
                    <div className="text-center">Tipo</div>
                    <div className="text-center">Dano</div>
                  </div>
                  <div className="px-4 py-3 text-sm">
                    <p className="text-center text-muted-foreground">
                      Nenhum ataque adicionado ainda
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Características de Classe
                  </CardTitle>
                  <Swords className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border px-4 py-3">
                  <p className="text-center text-muted-foreground text-sm">
                    Nenhuma característica adicionada ainda
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Equipamentos</CardTitle>
                  <Archive className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 border-b px-4 py-2 font-medium">
                    <div className="col-span-2">Item</div>
                    <div className="text-center">Quantidade</div>
                    <div className="text-center">Peso</div>
                  </div>
                  <div className="px-4 py-3 text-sm">
                    <p className="text-center text-muted-foreground">
                      Nenhum equipamento adicionado ainda
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Magias */}
        <TabsContent value="spells" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Magias Conhecidas</CardTitle>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Grimório e lista de magias disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-md border p-4 text-center">
                    <div className="text-sm font-medium uppercase text-muted-foreground">
                      Espaços de Truque
                    </div>
                    <div className="mt-2 text-xl font-bold">Ilimitado</div>
                  </div>
                  <div className="rounded-md border p-4 text-center">
                    <div className="text-sm font-medium uppercase text-muted-foreground">
                      Espaços de 1º Nível
                    </div>
                    <div className="mt-2 text-xl font-bold">0/0</div>
                  </div>
                  <div className="rounded-md border p-4 text-center">
                    <div className="text-sm font-medium uppercase text-muted-foreground">
                      Espaços de 2º Nível
                    </div>
                    <div className="mt-2 text-xl font-bold">0/0</div>
                  </div>
                  <div className="rounded-md border p-4 text-center">
                    <div className="text-sm font-medium uppercase text-muted-foreground">
                      Espaços de 3º Nível
                    </div>
                    <div className="mt-2 text-xl font-bold">0/0</div>
                  </div>
                </div>

                <div className="rounded-md border mt-6">
                  <div className="border-b px-4 py-2 font-medium">
                    <h3>Lista de Magias</h3>
                  </div>
                  <div className="px-4 py-3 text-sm">
                    <p className="text-center text-muted-foreground">
                      Nenhuma magia adicionada ainda
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Inventário */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Inventário</CardTitle>
                <Archive className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Itens, equipamentos e tesouros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b px-4 py-2 font-medium">
                  <div className="col-span-6">Item</div>
                  <div className="col-span-2 text-center">Quantidade</div>
                  <div className="col-span-2 text-center">Peso</div>
                  <div className="col-span-2 text-center">Valor</div>
                </div>
                <div className="px-4 py-3 text-sm">
                  <p className="text-center text-muted-foreground">
                    Nenhum item adicionado ainda
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Moedas</span>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground block">
                        PC
                      </span>
                      <span>0</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground block">
                        PP
                      </span>
                      <span>0</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground block">
                        PE
                      </span>
                      <span>0</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground block">
                        PO
                      </span>
                      <span>0</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground block">
                        PL
                      </span>
                      <span>0</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Detalhes */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Aparência</CardTitle>
                  <User2 className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {character.appearance ||
                    "Nenhuma descrição de aparência definida."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Antecedentes</CardTitle>
                  <BookText className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Raça:</span>
                    <span className="text-sm ml-2">{character.race}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Classe:</span>
                    <span className="text-sm ml-2">{character.class}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Antecedente:</span>
                    <span className="text-sm ml-2">
                      {character.background || "Não definido"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Alinhamento:</span>
                    <span className="text-sm ml-2">
                      {character.alignment || "Não definido"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">História</CardTitle>
                  <Scroll className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">
                  {character.backstory ||
                    "Nenhuma história definida para este personagem."}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Notas</CardTitle>
                  <Feather className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">
                  {character.notes || "Nenhuma nota adicionada."}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
