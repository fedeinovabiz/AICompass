import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import organizationRoutes from './routes/organizations';
import engagementRoutes from './routes/engagements';
import sessionRoutes from './routes/sessions';
import transcriptRoutes from './routes/transcripts';
import committeeRoutes from './routes/committees';
import pilotRoutes from './routes/pilots';
import aiRoutes from './routes/ai';
import redFlagRoutes from './routes/redFlags';
import reportRoutes from './routes/reports';
import benchmarkRoutes from './routes/benchmarks';
import presentationRoutes from './routes/presentations';
import transformationRoutes from './routes/transformation';
import processRoutes from './routes/processes';
import scalingRoutes from './routes/scaling';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-compass-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/engagements', engagementRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/committees', committeeRoutes);
app.use('/api/pilots', pilotRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/red-flags', redFlagRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/benchmarks', benchmarkRoutes);
app.use('/api/presentations', presentationRoutes);
app.use('/api/transformation', transformationRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/scaling', scalingRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`AI Compass API corriendo en puerto ${config.port}`);
});
