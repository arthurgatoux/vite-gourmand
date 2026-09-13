import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CommandeSuccesPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-24">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Commande confirmee !</CardTitle>
          <CardDescription>
            Un email de confirmation vient de vous etre envoye
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            Merci pour votre commande. Julie et Jose reviendront vers vous
            rapidement pour finaliser les details de votre evenement.
          </p>
          <Button asChild>
            <Link href="/menus">Decouvrir d&apos;autres menus</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
