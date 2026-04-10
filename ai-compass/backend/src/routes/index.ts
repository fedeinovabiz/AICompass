import organizationsRouter from './organizations';
import engagementsRouter from './engagements';
import sessionsRouter from './sessions';
import transcriptsRouter from './transcripts';
import committeesRouter from './committees';
import pilotsRouter from './pilots';
import scalingRouter from './scaling';

export interface RouteConfig {
  path: string;
  router: ReturnType<typeof import('express').Router>;
}

export const routes: RouteConfig[] = [
  { path: '/api/organizations', router: organizationsRouter },
  { path: '/api/engagements', router: engagementsRouter },
  { path: '/api/sessions', router: sessionsRouter },
  { path: '/api/transcripts', router: transcriptsRouter },
  { path: '/api/committees', router: committeesRouter },
  { path: '/api/pilots', router: pilotsRouter },
  { path: '/api/scaling', router: scalingRouter },
];

export default routes;
