import type { Ticket } from './types'

// Relative on purpose: the Vite dev server proxies /api to the Express server.
const API_URL = '/api/tickets'

function userMessageFrom(body: unknown): string | null {
  if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
    return body.error
  }
  return null
}

// `genericMessage` is the fallback shown whenever the server has no message meant
// for the user: a 5xx, an unreadable body, or a fetch that never got a response.
async function request<T>(init: RequestInit | undefined, genericMessage: string): Promise<T> {
  let response: Response

  try {
    response = await fetch(API_URL, init)
  } catch {
    throw new Error(genericMessage)
  }

  if (response.ok) {
    try {
      return (await response.json()) as T
    } catch {
      throw new Error(genericMessage)
    }
  }

  if (response.status >= 500) {
    throw new Error(genericMessage)
  }

  const body: unknown = await response.json().catch(() => null)

  throw new Error(userMessageFrom(body) ?? genericMessage)
}

export function fetchTickets(): Promise<Ticket[]> {
  return request<Ticket[]>(undefined, "Les tickets n'ont pas pu être affichés. Réessayez.")
}

export function createTicket(title: string): Promise<Ticket> {
  return request<Ticket>(
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    },
    "Le ticket n'a pas pu être créé. Réessayez.",
  )
}
