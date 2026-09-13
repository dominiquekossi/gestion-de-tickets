import { TicketForm } from './features/tickets/TicketForm'
import { TicketList } from './features/tickets/TicketList'
import { useTickets } from './features/tickets/useTickets'

function App() {
  const { isLoading, error, tickets, isCreating, createError, createTicket, clearCreateError, reload } =
    useTickets()

  function renderTickets() {
    if (isLoading) {
      return <p>Chargement des tickets…</p>
    }

    if (error) {
      return (
        <>
          <p className="error">{error}</p>
          <button type="button" onClick={reload}>
            Réessayer
          </button>
        </>
      )
    }

    if (tickets.length === 0) {
      return <p>Aucun ticket pour le moment. Créez le premier ci-dessus.</p>
    }

    return <TicketList tickets={tickets} />
  }

  return (
    <main>
      <h1>Gestion de tickets</h1>
      <TicketForm
        onSubmit={createTicket}
        isCreating={isCreating}
        createError={createError}
        clearCreateError={clearCreateError}
      />
      {renderTickets()}
    </main>
  )
}

export default App
