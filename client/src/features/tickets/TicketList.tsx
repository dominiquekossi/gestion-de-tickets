import type { Ticket, TicketStatus } from './types'

// Traduction d'affichage seulement : les données conservent 'open' et 'closed'.
const statusLabels: Record<TicketStatus, string> = {
  open: 'Ouvert',
  closed: 'Fermé',
}

type TicketListProps = {
  tickets: Ticket[]
}

export function TicketList({ tickets }: TicketListProps) {
  return (
    <ul>
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          {ticket.title}
          <span className="ticket-meta">
            {statusLabels[ticket.status]} — {new Date(ticket.createdAt).toLocaleDateString('fr-CA')}
          </span>
        </li>
      ))}
    </ul>
  )
}
