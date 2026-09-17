export const metadata = {
  title: "Conditions générales de vente - Vite Gourmand",
  description: "Conditions générales de vente applicables aux commandes de menus événementiels Vite Gourmand.",
};

export default function CgvPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Conditions contractuelles
        </p>
        <h1 className="mt-3 font-heading text-4xl lg:text-5xl">
          Conditions générales de vente
        </h1>
      </div>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">1. Objet</h2>
          <p>
            Les présentes conditions générales de vente (CGV) régissent les
            commandes de menus événementiels passées par un client sur le site
            Vite &amp; Gourmand, exploité par Julie et José Lacombe (voir nos{" "}
            <a href="/mentions-legales" className="text-primary underline-offset-4 hover:underline">
              mentions légales
            </a>
            ). Toute commande implique l&apos;acceptation pleine et entière des
            présentes CGV.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">2. Commande</h2>
          <p>
            La commande d&apos;un menu s&apos;effectue depuis un compte utilisateur, après
            sélection du menu, du nombre de personnes et des informations de
            prestation (date, heure, lieu de livraison). Chaque menu affiche un
            délai de commande minimum (exprimé en jours avant la date de
            prestation) : toute commande soumise après ce délai est refusée par le
            système. La commande ne peut porter sur un nombre de personnes
            inférieur au minimum indiqué pour le menu choisi.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            3. Prix, réduction et livraison
          </h2>
          <p>
            Les prix affichés sont exprimés en euros, toutes taxes comprises, pour
            le nombre minimum de personnes indiqué sur chaque menu. Une réduction
            de 10 % est automatiquement appliquée à toute commande dont le nombre
            de personnes est supérieur ou égal au minimum du menu augmenté de 5
            personnes.
          </p>
          <p className="mt-2">
            Les frais de livraison s&apos;élèvent forfaitairement à 5 € pour toute
            prestation dans la ville de Bordeaux. En dehors de Bordeaux, ce
            forfait est majoré de 0,59 € par kilomètre parcouru depuis notre
            atelier. Le détail du prix (menu et livraison) est présenté avant
            toute validation de commande.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            4. Confirmation et suivi de commande
          </h2>
          <p>
            Chaque commande fait l&apos;objet d&apos;un email de confirmation automatique.
            Elle est ensuite examinée par notre équipe et passe au statut «
            accepté », puis suit les étapes de préparation et de livraison
            jusqu&apos;à son terme. Le client est informé par email à chaque
            changement de statut et peut suivre l&apos;avancement depuis son espace
            personnel.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            5. Modification et annulation
          </h2>
          <p>
            Tant qu&apos;une commande n&apos;a pas été validée par notre équipe (statut «
            accepté »), le client peut la modifier ou l&apos;annuler librement depuis
            son espace personnel, à l&apos;exception du menu commandé, qui ne peut
            être changé.
          </p>
          <p className="mt-2">
            Passé le statut « accepté », toute modification ou annulation ne peut
            être effectuée qu&apos;à l&apos;initiative de notre équipe, après prise de
            contact préalable avec le client par téléphone ou par email, et
            donnera lieu à la communication d&apos;un motif précis.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            6. Matériel prêté
          </h2>
          <p>
            Lorsque la prestation inclut un prêt de matériel (vaisselle,
            mobilier, équipements de service), le client dispose d&apos;un délai de
            10 jours ouvrés à compter de la livraison pour restituer l&apos;intégralité
            du matériel prêté, selon les modalités communiquées par email. Passé
            ce délai, des frais forfaitaires de 600 € seront facturés au client
            au titre du matériel non restitué.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            7. Avis clients
          </h2>
          <p>
            À l&apos;issue d&apos;une prestation terminée, le client est invité par email à
            déposer un avis (note de 1 à 5 accompagnée d&apos;un commentaire). Cet
            avis n&apos;est publié sur notre page d&apos;accueil qu&apos;après validation par
            notre équipe, qui se réserve le droit de refuser un avis manifestement
            abusif, injurieux ou sans rapport avec la prestation.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            8. Droit de rétractation
          </h2>
          <p>
            Conformément à l&apos;article L.221-28 du Code de la consommation, le
            droit de rétractation ne s&apos;applique pas aux prestations de services
            pleinement exécutées à une date déterminée, telles que les prestations
            de traiteur événementiel proposées par Vite &amp; Gourmand.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            9. Données personnelles
          </h2>
          <p>
            Les informations recueillies lors de la commande sont nécessaires au
            traitement de celle-ci et sont traitées conformément à notre politique
            de confidentialité et au RGPD. Voir nos{" "}
            <a href="/mentions-legales" className="text-primary underline-offset-4 hover:underline">
              mentions légales
            </a>{" "}
            pour le détail de vos droits.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl text-foreground">
            10. Droit applicable et litiges
          </h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige,
            le client est invité à contacter notre équipe en priorité via notre
            page de contact afin de rechercher une solution amiable. À défaut
            d&apos;accord, les tribunaux du ressort de Bordeaux seront seuls
            compétents.
          </p>
        </section>
      </div>
    </main>
  );
}
