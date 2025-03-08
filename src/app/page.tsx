import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DiceD20, Scroll, Users, Swords } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <DiceD20 className="h-6 w-6 text-dnd-red" />
            <span className="font-bold text-xl">D&D App</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Recursos
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Sobre
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-dnd-red hover:bg-dnd-darkred">
                Registrar
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 border-b">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-dnd-red">
                    Gerencie suas campanhas de D&D
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Crie e gerencie personagens, acompanhe campanhas, acesse
                    compêndios de itens e magias em um só lugar.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-dnd-red hover:bg-dnd-darkred"
                    >
                      Começar agora
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline">
                      Explorar recursos
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-80 lg:h-96 overflow-hidden rounded-lg border bg-background">
                  <div className="absolute inset-0 bg-[url('/images/dnd-background.jpg')] bg-cover bg-center opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <DiceD20 className="h-24 w-24 text-dnd-red animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-dnd-red">
                  Recursos Principais
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Tudo o que você precisa para organizar seus jogos de Dungeons
                  & Dragons
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Scroll className="h-10 w-10 text-dnd-red" />
                </div>
                <h3 className="text-xl font-bold">Personagens</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Crie e gerencie fichas de personagens com atributos,
                  equipamentos, habilidades e magias.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-10 w-10 text-dnd-red" />
                </div>
                <h3 className="text-xl font-bold">Campanhas</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Organize sessões, gerencie encontros e mantenha anotações para
                  suas aventuras.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Swords className="h-10 w-10 text-dnd-red" />
                </div>
                <h3 className="text-xl font-bold">Compêndios</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Acesse informações de itens, magias, classes, raças e outras
                  regras do jogo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-dnd-red">
                  Sobre o D&D App
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Desenvolvido por jogadores para jogadores, nosso aplicativo
                  visa facilitar a organização e gestão de campanhas de Dungeons
                  & Dragons, permitindo que mestres e jogadores foquem no mais
                  importante: a diversão da aventura.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} D&D App. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Termos
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
