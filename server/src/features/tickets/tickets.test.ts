import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';

// Le store est un tableau de module partagé par tous les tests : on vérifie
// la présence et la forme, jamais l'égalité stricte de la liste entière.
const app = createApp();

describe('API des tickets', () => {
  it('GET renvoie la liste des tickets', async () => {
    const response = await request(app).get('/api/tickets');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(3);

    for (const ticket of response.body) {
      expect(ticket).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        status: expect.stringMatching(/^(open|closed)$/),
        createdAt: expect.any(String),
      });
    }
  });

  it('POST crée un ticket, que le GET suivant contient', async () => {
    const title = 'Le paiement par carte échoue';

    const created = await request(app).post('/api/tickets').send({ title });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      id: expect.any(String),
      title,
      status: 'open',
      createdAt: expect.any(String),
    });

    const list = await request(app).get('/api/tickets');

    expect(list.status).toBe(200);
    expect(list.body).toContainEqual(created.body);
  });

  it('POST refuse un corps sans titre', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Le titre est obligatoire.' });
  });

  it("POST refuse un titre composé uniquement d'espaces", async () => {
    const response = await request(app).post('/api/tickets').send({ title: '   ' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Le titre est obligatoire.' });
  });

  it('POST refuse un titre de plus de 200 caractères', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({ title: 'a'.repeat(201) });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Le titre ne doit pas dépasser 200 caractères.' });
  });

  it('une route inconnue renvoie 404 et un corps { error }', async () => {
    const response = await request(app).get('/api/inconnu');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: expect.any(String) });
  });

  // Verrouille le fait que le middleware d'erreur respecte err.status : express.json()
  // rejette ce corps avec 400, le signaler en 500 serait faux.
  it('un corps JSON malformé renvoie 400 et non 500', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Content-Type', 'application/json')
      .send('{"title":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
  });
});
