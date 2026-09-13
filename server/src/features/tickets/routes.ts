import { Router } from 'express';
import { create, list } from './store.js';
import { createTicketSchema } from './validation.js';

export const ticketsRouter = Router();

ticketsRouter.get('/', (_req, res) => {
  res.status(200).json(list());
});

ticketsRouter.post('/', (req, res) => {
  const result = createTicketSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0].message });
    return;
  }

  res.status(201).json(create(result.data.title));
});
