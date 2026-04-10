import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-compass-api' });
});

// Las rutas se registran aquí (M05, M06, M07 las agregan)

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`AI Compass API corriendo en puerto ${config.port}`);
});
