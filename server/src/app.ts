import express, {
  type ErrorRequestHandler,
  type Express,
  type Request,
  type Response,
} from 'express';

function statusOf(err: unknown): number {
  if (typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number') {
    return err.status;
  }
  return 500;
}

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  // Feature routes are mounted here.

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Ressource introuvable.' });
  });

  // express.json() rejects a malformed body with status 400: reporting that as a
  // server error would be wrong. The message stays generic, err.message is not
  // written for the end user.
  const handleError: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = statusOf(err);
    const message =
      status < 500 ? 'Requête invalide.' : 'Une erreur interne est survenue.';

    res.status(status).json({ error: message });
  };

  app.use(handleError);

  return app;
}
