import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Merci pour votre inscription !
              </CardTitle>
              <CardDescription>
                Verifiez votre boite mail pour confirmer votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Votre compte a bien ete cree avec le role utilisateur. Verifiez
                votre boite mail et cliquez sur le lien de confirmation avant
                de vous connecter.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
