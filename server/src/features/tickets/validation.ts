import { z } from 'zod';

// The unified `error` covers an absent body and a missing or non-string title;
// the checks below carry their own message and take precedence over it.
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
