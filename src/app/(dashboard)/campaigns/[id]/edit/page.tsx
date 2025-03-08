"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CampaignForm } from "@/components/campaign/campaign-form";
import { campaignsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface EditCampaignPageProps {
  params: {
    id: string;
  };
}

export default function EditCampaignPage({ params }: EditCampaignPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  const fetchCampaign = async () => {
    try {
      setIsLoading(true);
      const response = await campaignsAPI.getById(params.id);
      setCampaign(response.data);
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
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/campaigns/${params.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para detalhes</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Campanha</h1>
        <div className="w-[150px]" />
      </div>

      <div className="rounded-lg border p-6">
        <CampaignForm initialData={campaign} isEditing={true} />
      </div>
    </div>
  );
}
