import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { DiceD20 } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 sm:px-6">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
      >
        <DiceD20 className="mr-2 h-4 w-4" />
        <span>Voltar</span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <DiceD20 className="mx-auto h-10 w-10 text-dnd-red" />
          <h1 className="text-2xl font-semibold tracking-tight text-dnd-red">
            Crie sua conta
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha os campos abaixo para se registrar
          </p>
        </div>
        <RegisterForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="underline hover:text-dnd-red underline-offset-4"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
