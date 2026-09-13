-- Ticket E6 : Validation ou refus des avis clients
-- CDC (page 8) : "L'employe peut egalement valider les avis recus par les
-- utilisateurs afin qu'ils soient visibles sur la page d'accueil. Il peut
-- egalement en refuser."

create policy employe_admin_lisent_tous_avis
on public.avis
for select
to authenticated
using (public.est_employe_ou_admin());

create policy employe_admin_valident_avis
on public.avis
for update
to authenticated
using (public.est_employe_ou_admin())
with check (public.est_employe_ou_admin());
