import { ContactForm } from "@/components/contact/contact-form";

export const metadata = {
  title: "Contact — Vite Gourmand",
  description:
    "Une question, un événement à organiser ? Contactez Julie et José de Vite Gourmand.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Une question, un projet ?
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">
          Contactez-nous
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Que ce soit pour un renseignement sur nos menus ou l&apos;organisation
          de votre événement, Julie et José vous répondent rapidement.
        </p>
      </div>
      <ContactForm />
    </main>
  );
}
