import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTicket, fetchTickets } from './api'
import type { Ticket } from './types'

const ticketsKey = ['tickets']

export function useTickets() {
  const queryClient = useQueryClient()

  const query = useQuery({ queryKey: ticketsKey, queryFn: fetchTickets })

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (created) => {
      // Le POST renvoie déjà le ticket construit par le serveur : un second GET serait inutile.
      // Le cache est encore undefined si la mutation aboutit avant la requête initiale.
      queryClient.setQueryData<Ticket[]>(ticketsKey, (old) => (old ? [...old, created] : [created]))
    },
  })

  return {
    isLoading: query.isPending,
    error: query.error?.message ?? null,
    tickets: query.data ?? [],
    isCreating: mutation.isPending,
    createError: mutation.error?.message ?? null,
    createTicket: (title: string, onSuccess?: () => void) => mutation.mutate(title, { onSuccess }),
    clearCreateError: () => mutation.reset(),
    reload: () => {
      void query.refetch()
    },
  }
}
