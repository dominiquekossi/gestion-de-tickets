import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
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

// Les mocks du module api sont partagés par tous les tests du fichier : sans remise
// à zéro, un test compterait les appels déclenchés par les précédents.
// `cleanup` est explicite car sans `globals`, Testing Library ne l'enregistre pas
// lui-même : les rendus s'empileraient dans le même document.
beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderApp() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

it('affiche le ticket créé sans recharger la liste', async () => {
  vi.mocked(fetchTickets).mockResolvedValue([existingTicket])
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

it('affiche l’erreur de chargement, puis la liste après une nouvelle tentative', async () => {
  const loadError = "Les tickets n'ont pas pu être affichés. Réessayez."
  vi.mocked(fetchTickets).mockRejectedValueOnce(new Error(loadError))

  const user = userEvent.setup()
  renderApp()

  expect(await screen.findByText(loadError)).toBeInTheDocument()

  vi.mocked(fetchTickets).mockResolvedValue([existingTicket])
  await user.click(screen.getByRole('button', { name: 'Réessayer' }))

  expect(await screen.findByText(existingTicket.title)).toBeInTheDocument()
  expect(screen.queryByText(loadError)).not.toBeInTheDocument()
})

it('conserve la saisie quand la création échoue, et efface l’erreur à la frappe suivante', async () => {
  const createError = "Le ticket n'a pas pu être créé. Réessayez."
  const typed = 'Le paiement par carte échoue'
  vi.mocked(fetchTickets).mockResolvedValue([existingTicket])
  vi.mocked(createTicket).mockRejectedValue(new Error(createError))

  const user = userEvent.setup()
  renderApp()

  expect(await screen.findByText(existingTicket.title)).toBeInTheDocument()

  const input = screen.getByLabelText('Titre du ticket')
  await user.type(input, typed)
  await user.click(screen.getByRole('button', { name: 'Créer le ticket' }))

  expect(await screen.findByText(createError)).toBeInTheDocument()
  expect(input).toHaveValue(typed)

  await user.type(input, ' ')

  expect(screen.queryByText(createError)).not.toBeInTheDocument()
  expect(input).toHaveValue(`${typed} `)
})
