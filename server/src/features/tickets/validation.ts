import { z } from 'zod';

// Le paramètre `error` couvre un corps absent et un titre manquant ou non textuel ;
// les contrôles ci-dessous portent leur propre message et l'emportent sur lui.
export const createTicketSchema = z.object(
  {
    title: z
      .string({ error: 'Le titre est obligatoire.' })
      .trim()
      .min(1, 'Le titre est obligatoire.')
      .max(200, 'Le titre ne doit pas dépasser 200 caractères.'),
  },
  { error: 'Le titre est obligatoire.' },
);

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
