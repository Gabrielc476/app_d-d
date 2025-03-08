import { CampaignForm } from "@/components/campaign/campaign-form";

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Campanha</h1>
        <p className="text-muted-foreground">
          Preencha o formulário abaixo para criar uma nova campanha.
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <CampaignForm />
      </div>
    </div>
  );
}
