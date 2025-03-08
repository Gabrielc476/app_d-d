import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { DiceD20 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-4 sm:px-6">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
      >
        <DiceD20 className="mr-2 h-4 w-4" />
        <span>Voltar</span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <DiceD20 className="mx-auto h-10 w-10 text-dnd-red" />
          <h1 className="text-2xl font-semibold tracking-tight text-dnd-red">
            Bem-vindo de volta!
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com seu e-mail e senha para acessar sua conta
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Não tem uma conta ainda?{" "}
          <Link
            href="/register"
            className="underline hover:text-dnd-red underline-offset-4"
          >
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
