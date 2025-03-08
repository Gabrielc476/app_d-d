import { CharacterForm } from "@/components/character/character-form";

export default function NewCharacterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Personagem</h1>
        <p className="text-muted-foreground">
          Preencha o formulário abaixo para criar um novo personagem.
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <CharacterForm />
      </div>
    </div>
  );
}
