"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { campaignsAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface CampaignDetailsPageProps {
  params: {
    id: string;
  };
}

export default function CampaignDetailsPage({
  params,
}: CampaignDetailsPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<any>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  const fetchCampaign = async () => {
    try {
      setIsLoading(true);
      const response = await campaignsAPI.getById(params.id);
      setCampaign(response.data);

      // Em uma implementação real, também buscaríamos os personagens associados à campanha
      // Por enquanto, vamos criar um array vazio
      setCharacters([]);
    } catch (error) {
      console.error("Erro ao buscar detalhes da campanha:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar campanha",
        description:
          "Não foi possível encontrar esta campanha. Verifique se o ID está correto.",
      });
      router.push("/campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planejamento":
        return "Em Planejamento";
      case "em_progresso":
        return "Em Progresso";
      case "concluida":
        return "Concluída";
      case "pausada":
        return "Pausada";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planejamento":
        return "bg-blue-500 hover:bg-blue-600";
      case "em_progresso":
        return "bg-green-500 hover:bg-green-600";
      case "concluida":
        return "bg-purple-500 hover:bg-purple-600";
      case "pausada":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await campaignsAPI.delete(params.id);

      toast({
        title: "Campanha excluída",
        description: `${campaign.name} foi excluída com sucesso.`,
      });

      router.push("/campaigns");
    } catch (error) {
      console.error("Erro ao excluir campanha:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir a campanha. Tente novamente.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-dnd-red" />
          <p className="text-sm text-muted-foreground">
            Carregando campanha...
          </p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/campaigns")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para campanhas</span>
        </Button>

        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-xl font-semibold">Campanha não encontrada</h3>
          <p className="text-sm text-muted-foreground">
            A campanha que você está procurando não existe ou foi excluída.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/campaigns")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline-block">Voltar</span>
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {campaign.name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={getStatusColor(campaign.status)}>
                {getStatusLabel(campaign.status)}
              </Badge>
              {campaign.isPrivate && <Badge variant="outline">Privada</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/campaigns/${params.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
          </Link>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir campanha</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir {campaign.name}? Esta ação não
                  pode ser desfeita.
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="characters">Personagens</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
        </TabsList>

        {/* Aba Visão Geral */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* Informações gerais */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Sobre a Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.description ? (
                  <p>{campaign.description}</p>
                ) : (
                  <p className="text-muted-foreground">
                    Nenhuma descrição disponível.
                  </p>
                )}

                <div className="space-y-2">
                  {campaign.setting && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>Cenário: {campaign.setting}</span>
                    </div>
                  )}

                  {campaign.level && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>
                        Nível: {campaign.level.min}
                        {campaign.level.max !== campaign.level.min &&
                          ` até ${campaign.level.max}`}
                      </span>
                    </div>
                  )}

                  {campaign.startDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>
                        {campaign.status === "planejamento"
                          ? `Início previsto: ${formatDate(campaign.startDate)}`
                          : `Iniciada em: ${formatDate(campaign.startDate)}`}
                      </span>
                    </div>
                  )}

                  {campaign.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>
                        {campaign.status === "concluida"
                          ? `Finalizada em: ${formatDate(campaign.endDate)}`
                          : `Fim previsto: ${formatDate(campaign.endDate)}`}
                      </span>
                    </div>
                  )}

                  {campaign.meetingSchedule && (
                    <div className="flex items-center gap-2 text-sm mt-4 pt-4 border-t">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="font-medium">Agendamento:</span>
                        <span className="ml-2">{campaign.meetingSchedule}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Próxima Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Não agendada</h3>
                    <p className="text-sm text-muted-foreground">
                      Nenhuma sessão agendada no momento.
                    </p>
                  </div>
                  <Button
                    className="mt-4 bg-dnd-red hover:bg-dnd-darkred"
                    disabled
                  >
                    Agendar Sessão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notas */}
          {campaign.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">{campaign.notes}</div>
              </CardContent>
            </Card>
          )}

          {/* Alertas e informações importantes (Dummy para demonstração) */}
          <Card className="border-yellow-500 dark:border-yellow-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-500 dark:text-yellow-400 text-xl">
                Informações para Mestres
              </CardTitle>
              <CardDescription>Dicas e lembretes importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Certifique-se de convidar os jogadores para a campanha</li>
                <li>
                  Complete as informações de personagens não-jogadores (NPCs)
                </li>
                <li>
                  Adicione mapas e recursos importantes na aba de Detalhes
                </li>
                <li>Mantenha as datas das sessões atualizadas no calendário</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Personagens */}
        <TabsContent value="characters" className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Personagens da Campanha</h2>
            <Button className="bg-dnd-red hover:bg-dnd-darkred" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Personagem
            </Button>
          </div>

          {characters.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Aqui entrariam os cards de personagem */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  Nenhum personagem adicionado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Adicione personagens à sua campanha para começar a jogar.
                </p>
              </div>
              <Button className="mt-4 bg-dnd-red hover:bg-dnd-darkred" disabled>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Personagem
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Aba Sessões */}
        <TabsContent value="sessions" className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Histórico de Sessões</h2>
            <Button className="bg-dnd-red hover:bg-dnd-darkred" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Nova Sessão
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                Nenhuma sessão registrada
              </h3>
              <p className="text-sm text-muted-foreground">
                Comece registrando sua primeira sessão.
              </p>
            </div>
            <Button className="mt-4 bg-dnd-red hover:bg-dnd-darkred" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Nova Sessão
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
