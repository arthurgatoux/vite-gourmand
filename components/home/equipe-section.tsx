export function EquipeSection() {
  const engagements = [
    {
      titre: "La qualite des produits",
      description:
        "Des ingredients frais, locaux et rigoureusement selectionnes au fil des saisons.",
    },
    {
      titre: "L'experience evenementielle",
      description:
        "25 ans de maitrise, du diner intime aux receptions de grande ampleur.",
    },
    {
      titre: "Le sur-mesure",
      description:
        "Un menu, une scenographie et un service penses pour votre histoire.",
    },
  ];

  return (
    <section aria-labelledby="equipe-heading" className="w-full bg-secondary py-20">
      <div className="mx-auto max-w-5xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Une histoire de goût
          </p>
          <h2 id="equipe-heading" className="mt-2 text-3xl font-heading">
            Julie &amp; Jose, une passion partagee depuis 25 ans
          </h2>
          <p className="mt-4 text-muted-foreground">
            A Bordeaux, notre maison imagine des receptions qui ressemblent a
            celles et ceux qui les celebrent. Julie orchestre chaque detail,
            Jose compose une cuisine sincere, inspiree des saisons et de notre
            terroir.
          </p>
          <p className="mt-4 font-heading text-xl italic text-primary">
            &laquo; Recevoir, c&apos;est creer un souvenir autour d&apos;une table. &raquo;
          </p>
        </div>

        <ul className="mt-14 grid gap-8 sm:grid-cols-3">
          {engagements.map((item) => (
            <li key={item.titre} className="text-center">
              <h3 className="font-heading text-lg text-primary">{item.titre}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
