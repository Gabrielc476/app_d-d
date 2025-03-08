"use client";

import { useState } from "react";
import {
  DiceD20,
  DiceD4,
  DiceD6,
  DiceD8,
  DiceD10,
  DiceD12,
  DiceD100,
  Plus,
  Minus,
  Dice5,
  CircleDashed,
  ShieldPlus,
  AlignVerticalSpaceAround,
  PartyPopper,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { DiceType, useDiceStore } from "@/lib/stores/diceStore";

const diceTypes: { type: DiceType; icon: React.ReactNode; label: string }[] = [
  { type: "d4", icon: <DiceD4 className="h-6 w-6" />, label: "D4" },
  { type: "d6", icon: <DiceD6 className="h-6 w-6" />, label: "D6" },
  { type: "d8", icon: <DiceD8 className="h-6 w-6" />, label: "D8" },
  { type: "d10", icon: <DiceD10 className="h-6 w-6" />, label: "D10" },
  { type: "d12", icon: <DiceD12 className="h-6 w-6" />, label: "D12" },
  { type: "d20", icon: <DiceD20 className="h-6 w-6" />, label: "D20" },
  { type: "d100", icon: <DiceD100 className="h-6 w-6" />, label: "D100" },
];

// Presets para rolagens comuns
const presets = [
  {
    label: "Ataque",
    icon: <Dice5 />,
    roll: { diceType: "d20", diceCount: 1, modifier: 0 },
  },
  {
    label: "Dano",
    icon: <Dice5 />,
    roll: { diceType: "d6", diceCount: 1, modifier: 0 },
  },
  {
    label: "Iniciativa",
    icon: <AlignVerticalSpaceAround />,
    roll: {
      diceType: "d20",
      diceCount: 1,
      modifier: 0,
      rollType: "initiative",
    },
  },
  {
    label: "Salvaguarda",
    icon: <ShieldPlus />,
    roll: { diceType: "d20", diceCount: 1, modifier: 0, rollType: "save" },
  },
  {
    label: "Habilidade",
    icon: <CircleDashed />,
    roll: { diceType: "d20", diceCount: 1, modifier: 0, rollType: "ability" },
  },
  {
    label: "Inspiração",
    icon: <PartyPopper />,
    roll: { diceType: "d20", diceCount: 1, modifier: 0, advantage: true },
  },
];

// Componente para exibir histórico de rolagens
const DiceHistory = () => {
  const history = useDiceStore((state) => state.history);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <DiceD20 className="h-12 w-12 mb-2 opacity-50" />
        <p>Nenhuma rolagem ainda.</p>
        <p className="text-sm">Role os dados para ver o histórico aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
      {history.map((roll) => (
        <div key={roll.id} className="p-3 border rounded-md flex flex-col">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {roll.rollLabel || `${roll.diceCount}${roll.diceType}`}
              {roll.advantage && " (Vantagem)"}
              {roll.disadvantage && " (Desvantagem)"}
            </span>
            <span className="text-lg font-bold text-dnd-red">{roll.total}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{roll.characterName || roll.username}</span>
            <span>
              {roll.results.join(", ")}
              {roll.modifier !== 0 &&
                ` ${roll.modifier > 0 ? "+" : ""}${roll.modifier}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente principal do rolador de dados
export function DiceRoller() {
  // States locais
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDice, setSelectedDice] = useState<DiceType>("d20");
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollLabel, setRollLabel] = useState("");
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [activeTab, setActiveTab] = useState("quick");

  // Estado global de dados
  const { rollDice, isRolling, history } = useDiceStore();

  // Manipuladores de eventos
  const handleDiceSelect = (diceType: DiceType) => {
    setSelectedDice(diceType);
  };

  const handleIncrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number
  ) => {
    setter((prev) => Math.min(prev + 1, value));
  };

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    minValue: number
  ) => {
    setter((prev) => Math.max(prev - 1, minValue));
  };

  const handleAdvantageChange = (checked: boolean) => {
    setAdvantage(checked);
    if (checked) setDisadvantage(false);
  };

  const handleDisadvantageChange = (checked: boolean) => {
    setDisadvantage(checked);
    if (checked) setAdvantage(false);
  };

  const handleRollDice = async () => {
    try {
      await rollDice({
        diceType: selectedDice,
        diceCount,
        modifier,
        rollLabel: rollLabel || undefined,
        advantage,
        disadvantage,
        isPrivate,
      });

      // Não fechar o diálogo após rolar
    } catch (error) {
      console.error("Erro ao rolar dados:", error);
    }
  };

  const handlePresetRoll = async (preset: (typeof presets)[0]) => {
    try {
      await rollDice({
        diceType: preset.roll.diceType as DiceType,
        diceCount: preset.roll.diceCount,
        modifier: preset.roll.modifier,
        rollType: preset.roll.rollType,
        rollLabel: preset.label,
        advantage: preset.roll.advantage || false,
        disadvantage: preset.roll.disadvantage || false,
        isPrivate,
      });
    } catch (error) {
      console.error("Erro ao rolar dados:", error);
    }
  };

  // Renderiza o componente
  return (
    <>
      {/* Botão flutuante para abrir o rolador de dados */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 bg-dnd-red hover:bg-dnd-darkred p-0 shadow-lg"
            >
              <DiceD20 className="h-8 w-8 text-white" />
              <span className="sr-only">Abrir rolador de dados</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rolador de Dados</DialogTitle>
              <DialogDescription>
                Escolha os dados e opções para sua rolagem.
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick">Rápido</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="space-y-4 pt-4">
                {/* Presets para rolagens comuns */}
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="flex flex-col h-16 gap-1"
                      onClick={() => handlePresetRoll(preset)}
                      disabled={isRolling}
                    >
                      {preset.icon}
                      <span className="text-xs">{preset.label}</span>
                    </Button>
                  ))}
                </div>

                {/* Seleção de tipo de dado */}
                <div className="grid grid-cols-7 gap-1">
                  {diceTypes.map((dice) => (
                    <TooltipProvider key={dice.type}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={
                              selectedDice === dice.type ? "default" : "outline"
                            }
                            className={`h-14 p-0 ${
                              selectedDice === dice.type
                                ? "bg-dnd-red hover:bg-dnd-darkred"
                                : ""
                            }`}
                            onClick={() => handleDiceSelect(dice.type)}
                          >
                            {dice.icon}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{dice.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>

                {/* Quantidade e modificador */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dice-count">Quantidade</Label>
                    <div className="flex">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-r-none"
                        onClick={() => handleDecrement(setDiceCount, 1)}
                        disabled={diceCount <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="dice-count"
                        type="number"
                        min={1}
                        max={100}
                        value={diceCount}
                        onChange={(e) =>
                          setDiceCount(parseInt(e.target.value) || 1)
                        }
                        className="rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => handleIncrement(setDiceCount, 100)}
                        disabled={diceCount >= 100}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modifier">Modificador</Label>
                    <div className="flex">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-r-none"
                        onClick={() => handleDecrement(setModifier, -20)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="modifier"
                        type="number"
                        value={modifier}
                        onChange={(e) =>
                          setModifier(parseInt(e.target.value) || 0)
                        }
                        className="rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={() => handleIncrement(setModifier, 20)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Opções adicionais */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roll-label">Descrição (opcional)</Label>
                    <Input
                      id="roll-label"
                      placeholder="Ex: Ataque com Espada Longa"
                      value={rollLabel}
                      onChange={(e) => setRollLabel(e.target.value)}
                    />
                  </div>

                  {selectedDice === "d20" && (
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="advantage"
                          checked={advantage}
                          onCheckedChange={handleAdvantageChange}
                          disabled={disadvantage}
                        />
                        <Label htmlFor="advantage">Vantagem</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="disadvantage"
                          checked={disadvantage}
                          onCheckedChange={handleDisadvantageChange}
                          disabled={advantage}
                        />
                        <Label htmlFor="disadvantage">Desvantagem</Label>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="private"
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                    <Label htmlFor="private">Rolagem privada</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                <DiceHistory />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                onClick={handleRollDice}
                disabled={isRolling}
                className="relative bg-dnd-red hover:bg-dnd-darkred w-full"
              >
                {isRolling ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute"
                    >
                      <DiceD20 className="h-5 w-5" />
                    </motion.div>
                    <span className="opacity-0">Rolando...</span>
                  </>
                ) : (
                  <>
                    <DiceD20 className="mr-2 h-5 w-5" />
                    Rolar {diceCount}
                    {selectedDice}
                    {modifier !== 0 && ` ${modifier > 0 ? "+" : ""}${modifier}`}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Display de resultado flutuante */}
      {isRolling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1, times: [0, 0.5, 1] }}
            className="bg-dnd-red text-white font-bold text-6xl rounded-full h-32 w-32 flex items-center justify-center"
          >
            {history[0]?.total || "..."}
          </motion.div>
        </div>
      )}
    </>
  );
}
