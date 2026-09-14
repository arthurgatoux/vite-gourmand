"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  validerContact,
  type ChampContact,
} from "@/lib/validations/contact";

export function ContactForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [erreursChamps, setErreursChamps] = useState<
    Partial<Record<ChampContact, string>>
  >({});
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurGlobale(null);

    const erreurs = validerContact({ titre, description, email });
    setErreursChamps(erreurs);
    if (Object.keys(erreurs).length > 0) {
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.from("messages_contact").insert({
        titre: titre.trim(),
        description: description.trim(),
        email: email.trim(),
      });
      if (error) throw error;
      setSucces(true);
      setTitre("");
      setDescription("");
      setEmail("");
    } catch (error: unknown) {
      setErreurGlobale(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'envoi de votre message."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (succes) {
    return (
      <div
        className={cn(
          "rounded-2xl border-2 border-accent bg-secondary p-8 text-center",
          className
        )}
        {...props}
        role="status"
      >
        <h2 className="font-heading text-2xl">Message envoyé !</h2>
        <p className="mt-3 text-muted-foreground">
          Merci pour votre message. Julie et José reviendront vers vous par
          email dans les meilleurs délais.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "flex flex-col gap-6 rounded-2xl border border-border bg-background p-8 shadow-card",
        className
      )}
      {...props}
    >
      <div className="grid gap-2">
        <Label htmlFor="titre">Titre</Label>
        <Input
          id="titre"
          type="text"
          required
          aria-invalid={Boolean(erreursChamps.titre)}
          aria-describedby={erreursChamps.titre ? "titre-erreur" : undefined}
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
        />
        {erreursChamps.titre && (
          <p id="titre-erreur" className="text-sm text-red-500">
            {erreursChamps.titre}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Votre message</Label>
        <textarea
          id="description"
          required
          rows={6}
          aria-invalid={Boolean(erreursChamps.description)}
          aria-describedby={
            erreursChamps.description ? "description-erreur" : undefined
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
        {erreursChamps.description && (
          <p id="description-erreur" className="text-sm text-red-500">
            {erreursChamps.description}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Votre email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="m@example.com"
          required
          aria-invalid={Boolean(erreursChamps.email)}
          aria-describedby={erreursChamps.email ? "email-erreur" : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {erreursChamps.email && (
          <p id="email-erreur" className="text-sm text-red-500">
            {erreursChamps.email}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Utilisée uniquement pour vous répondre, jamais partagée.
        </p>
      </div>

      {erreurGlobale && (
        <p className="text-sm text-red-500" role="alert">
          {erreurGlobale}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isLoading}>
        {isLoading ? "Envoi en cours..." : "Envoyer le message"}
      </Button>
    </form>
  );
}
