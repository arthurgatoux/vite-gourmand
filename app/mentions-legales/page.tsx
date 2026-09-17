export const metadata = {
  title: "Mentions légales - Vite Gourmand",
  description: "Informations légales relatives à l'éditeur du site Vite Gourmand.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Informations légales
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">Mentions légales</h1>
      </div>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">1. Éditeur du site</h2>
          <p>
            Le présent site est édité par la société Vite &amp; Gourmand, entreprise
            individuelle de traiteur événementiel dirigée par Julie et José Lacombe.
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>Forme juridique : Entreprise individuelle</li>
            <li>Siège social : 14 rue des Récollets, 33000 Bordeaux, France</li>
            <li>SIRET : 812 345 678 00023</li>
            <li>Numéro de TVA intracommunautaire : FR32 812345678</li>
            <li>Directeur de la publication : Julie Lacombe</li>
            <li>
              Contact : via le{" "}
              <a href="/contact" className="text-primary underline-offset-4 hover:underline">
                formulaire de contact
              </a>{" "}
              du site
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">2. Hébergement</h2>
          <p>
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
            États-Unis. Les données relationnelles et l&apos;authentification des comptes
            sont hébergées par Supabase (région Union Européenne, Irlande). Les données
            statistiques agrégées sont hébergées par MongoDB Atlas (région Union
            Européenne).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            3. Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble des contenus présents sur ce site (textes, photographies,
            logos, mise en page) est la propriété exclusive de Vite &amp; Gourmand, sauf
            mention contraire. Toute reproduction, représentation ou diffusion, totale
            ou partielle, sans autorisation préalable écrite, est interdite et pourrait
            constituer une contrefaçon au sens des articles L.335-2 et suivants du Code
            de la propriété intellectuelle.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            4. Données personnelles
          </h2>
          <p>
            Le traitement des données personnelles collectées sur ce site (création de
            compte, commande, formulaire de contact, avis client) est décrit en détail
            dans notre politique de confidentialité, conforme au Règlement Général sur
            la Protection des Données (RGPD). Conformément à la loi Informatique et
            Libertés et au RGPD, vous disposez d&apos;un droit d&apos;accès, de
            rectification, d&apos;effacement, de portabilité et d&apos;opposition sur vos
            données, exerçable depuis votre espace utilisateur ou via notre page de
            contact.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            5. Cookies et mesures d&apos;audience
          </h2>
          <p>
            Le site utilise uniquement des cookies strictement nécessaires à son
            fonctionnement (maintien de la session de connexion). Aucun cookie
            publicitaire ou de mesure d&apos;audience tiers n&apos;est déposé sans votre
            consentement préalable.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            6. Droit applicable et litiges
          </h2>
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de
            litige et à défaut d&apos;accord amiable, les tribunaux du ressort de
            Bordeaux seront seuls compétents.
          </p>
        </section>
      </div>
    </main>
  );
}
