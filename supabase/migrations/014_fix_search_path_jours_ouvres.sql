create or replace function public.ajouter_jours_ouvres(date_depart date, nb_jours integer)
returns date
language plpgsql
immutable
set search_path to public
as $function$
declare
  jours_ajoutes integer := 0;
  date_courante date := date_depart;
begin
  while jours_ajoutes < nb_jours loop
    date_courante := date_courante + 1;
    if extract(isodow from date_courante) < 6 then
      jours_ajoutes := jours_ajoutes + 1;
    end if;
  end loop;
  return date_courante;
end;
$function$;
