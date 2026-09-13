import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from '../../App'
import { createTicket, fetchTickets } from './api'
import type { Ticket } from './types'

vi.mock('./api', () => ({
  fetchTickets: vi.fn(),
  createTicket: vi.fn(),
}))

const existingTicket: Ticket = {
  id: '6f1c2a7e-3b5d-4c81-9a02-7e4d1f8b6c30',
  title: 'Billets non reçus après le paiement',
  status: 'open',
  createdAt: '2026-09-02T09:14:00.000Z',
}

const createdTicket: Ticket = {
  id: 'b27d94f1-0e6a-4d33-8c15-52a9f7c4e881',
  title: 'Le paiement par carte échoue',
  status: 'open',
  createdAt: '2026-09-13T10:00:00.000Z',
}

function renderApp() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

it('affiche le ticket créé sans recharger la liste', async () => {
  vi.mocked(fetchTickets).mockResolvedValueOnce([existingTicket])
  vi.mocked(createTicket).mockResolvedValue(createdTicket)

  const user = userEvent.setup()
  renderApp()

  expect(await screen.findByText(existingTicket.title)).toBeInTheDocument()

  await user.type(screen.getByLabelText('Titre du ticket'), createdTicket.title)
  await user.click(screen.getByRole('button', { name: 'Créer le ticket' }))

  expect(await screen.findByText(createdTicket.title)).toBeInTheDocument()

  // Le cache est mis à jour par setQueryData : aucune seconde requête de liste.
  expect(fetchTickets).toHaveBeenCalledTimes(1)
})
