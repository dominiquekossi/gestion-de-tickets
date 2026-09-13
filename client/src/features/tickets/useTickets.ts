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
      // The POST already returns the ticket built by the server, so no refetch.
      // The cache is still undefined if the mutation resolves before the first query.
      queryClient.setQueryData<Ticket[]>(ticketsKey, (old) => (old ? [...old, created] : [created]))
    },
  })

  return {
    isLoading: query.isPending,
    error: query.error?.message ?? null,
    tickets: query.data ?? [],
    isCreating: mutation.isPending,
    createError: mutation.error?.message ?? null,
    createTicket: (title: string) => mutation.mutate(title),
    reload: () => {
      void query.refetch()
    },
  }
}
