import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type StatutCommande, LABEL_STATUT, COULEUR_STATUT } from '@/lib/supabase/statuts-commande'

interface StatutBadgeProps {
  statut: StatutCommande
  className?: string
}

export function StatutBadge({ statut, className }: StatutBadgeProps) {
  return (
    <Badge
      variant={COULEUR_STATUT[statut]}
      className={cn(
        'text-xs font-medium',
        statut === 'annule' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
        statut === 'termine' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
        className
      )}
    >
      {LABEL_STATUT[statut]}
    </Badge>
  )
}
