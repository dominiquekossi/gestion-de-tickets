import express, {
  type ErrorRequestHandler,
  type Express,
  type Request,
  type Response,
} from 'express';
import { ticketsRouter } from './features/tickets/routes.js';

function statusOf(err: unknown): number {
  if (typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number') {
    return err.status;
  }
  return 500;
}

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.use('/api/tickets', ticketsRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Ressource introuvable.' });
  });

  // express.json() rejette un corps malformé avec le statut 400 : l'annoncer comme
  // une erreur serveur serait faux. Le message reste générique, err.message n'est
  // jamais montré à l'utilisateur.
  const handleError: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = statusOf(err);
    const message =
      status < 500 ? 'Requête invalide.' : 'Une erreur interne est survenue.';

    res.status(status).json({ error: message });
  };

  app.use(handleError);

  return app;
}
