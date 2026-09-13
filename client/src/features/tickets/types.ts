export type TicketStatus = 'open' | 'closed'

export type Ticket = {
  id: string
  title: string
  status: TicketStatus
  createdAt: string
}
