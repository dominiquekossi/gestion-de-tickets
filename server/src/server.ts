import { createApp } from './app.js';

const PORT = 3000;

createApp().listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
