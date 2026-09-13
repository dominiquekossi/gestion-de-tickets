import type { Ticket } from './types.js';

const tickets: Ticket[] = [
  {
    id: '6f1c2a7e-3b5d-4c81-9a02-7e4d1f8b6c30',
    title: "Le Festif : mettre à jour l'horaire des billets",
    status: 'closed',
    createdAt: '2026-07-24T11:20:00.000Z',
  },
  {
    id: 'b27d94f1-0e6a-4d33-8c15-52a9f7c4e881',
    title: 'Billets non reçus après le paiement',
    status: 'open',
    createdAt: '2026-09-02T09:14:00.000Z',
  },
  {
    id: 'd3a8e510-9c47-4f2b-b6de-1a0c85f39b74',
    title: 'Ajouter un export CSV de la liste des participants',
    status: 'open',
    createdAt: '2026-09-09T08:05:00.000Z',
  },
];

export function list(): Ticket[] {
  return [...tickets];
}

export function create(title: string): Ticket {
  const ticket: Ticket = {
    id: crypto.randomUUID(),
    title,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  tickets.push(ticket);

  return ticket;
}
