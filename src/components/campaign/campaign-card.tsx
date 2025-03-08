"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Edit,
  Trash2,
  Users,
  CalendarDays,
  MapPin,
  Clock,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/components/ui/use-toast";
import { campaignsAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface CampaignCardProps {
  campaign: {
    id: string;
    name: string;
    description?: string;
    setting?: string;
    status: "planejamento" | "em_progresso" | "concluida" | "pausada";
    startDate?: string;
    endDate?: string;
    level?: {
      min: number;
      max: number;
    };
    isPrivate?: boolean;
    meetingSchedule?: string;
    dungeonMasterId: string;
  };
  onDelete?: () => void;
}

export function CampaignCard({ campaign, onDelete }: CampaignCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      await campaignsAPI.delete(campaign.id);

      toast({
        title: "Campanha excluída",
        description: `${campaign.name} foi excluída com sucesso.`,
      });

      if (onDelete) {
        onDelete();
      }
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

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl truncate">{campaign.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Link href={`/campaigns/${campaign.id}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </Link>
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir campanha</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir {campaign.name}? Esta ação
                    não pode ser desfeita.
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
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getStatusColor(campaign.status)}>
            {getStatusLabel(campaign.status)}
          </Badge>
          {campaign.isPrivate && <Badge variant="outline">Privada</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-4">
          {campaign.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {campaign.description}
            </p>
          )}

          <div className="space-y-2">
            {campaign.setting && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{campaign.setting}</span>
              </div>
            )}

            {campaign.level && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>
                  Nível {campaign.level.min}
                  {campaign.level.max !== campaign.level.min &&
                    ` até ${campaign.level.max}`}
                </span>
              </div>
            )}

            {campaign.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>
                  {campaign.status === "planejamento"
                    ? `Início previsto: ${formatDate(campaign.startDate)}`
                    : `Iniciada em: ${formatDate(campaign.startDate)}`}
                </span>
              </div>
            )}

            {campaign.meetingSchedule && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{campaign.meetingSchedule}</span>
              </div>
            )}
          </div>

          {/* Próxima sessão (caso futuro, por enquanto deixaremos um placeholder) */}
          <div className="rounded-md border p-3 mt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Próxima sessão:</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Não agendada</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/campaigns/${campaign.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Ver detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
