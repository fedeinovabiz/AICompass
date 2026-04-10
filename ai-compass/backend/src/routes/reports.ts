import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getOne } from '../db';

const router = Router();
router.use(authMiddleware);

// GET /organization/:orgId/diagnostic-report
// Retorna un HTML autocontenido del diagnóstico completo
router.get('/organization/:orgId/diagnostic-report', async (req, res, next) => {
  try {
    const orgId = req.params.orgId;

    // Cargar organización
    const org = await getOne<Record<string, unknown>>('SELECT * FROM organizations WHERE id = $1', [orgId]);
    if (!org) { res.status(404).json({ message: 'Organización no encontrada' }); return; }

    // Cargar cross-analysis más reciente
    const analysis = await getOne<Record<string, unknown>>(
      'SELECT * FROM cross_session_analyses WHERE organization_id = $1 ORDER BY generated_at DESC LIMIT 1',
      [orgId],
    );

    const scores = (org.maturity_scores ?? {}) as Record<string, number>;
    const dimensionScores = analysis
      ? (analysis.dimension_scores ?? {}) as Record<string, { score: number; summary: string; gaps: string[] }>
      : {};
    const quickWins = analysis
      ? (analysis.quick_win_suggestions ?? []) as Array<{
          title: string;
          processBefore: string;
          processAfter: string;
          suggestedTool: string;
          implementationLevel: string;
          valueChainSegment: string;
          timeline: string;
        }>
      : [];
    const deepDives = analysis
      ? (analysis.deep_dive_recommendations ?? []) as Array<{
          title: string;
          justification: string;
          trigger: string;
        }>
      : [];

    const dimensionNames: Record<string, string> = {
      estrategia: 'Estrategia e IA',
      procesos: 'Procesos',
      datos: 'Datos',
      tecnologia: 'Tecnología',
      cultura: 'Cultura y Personas',
      gobernanza: 'Gobernanza',
    };

    const levelColors: Record<string, string> = {
      prompting: '#22c55e',
      'no-code': '#eab308',
      custom: '#ef4444',
    };

    const scoreValues = Object.values(scores).filter((v) => v !== null) as number[];
    const avgScore =
      scoreValues.length > 0
        ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1)
        : 'N/A';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Diagnóstico de Madurez en IA — ${org.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; max-width: 900px; margin: auto; }
    h1 { font-size: 28px; color: #0f172a; margin-bottom: 4px; }
    h2 { font-size: 20px; color: #334155; margin: 32px 0 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
    h3 { font-size: 16px; color: #475569; margin: 16px 0 8px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .meta { display: flex; gap: 24px; margin-bottom: 24px; }
    .meta-item { background: #f1f5f9; padding: 16px; border-radius: 8px; flex: 1; text-align: center; }
    .meta-item .value { font-size: 32px; font-weight: 700; }
    .meta-item .label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .dimension { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .dimension .score { display: inline-block; width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 50%; color: white; font-weight: 700; font-size: 14px; margin-right: 8px; }
    .score-1 { background: #ef4444; } .score-2 { background: #f59e0b; } .score-3 { background: #3b82f6; } .score-4 { background: #22c55e; }
    .gaps { margin-top: 8px; }
    .gaps li { font-size: 13px; color: #64748b; margin-left: 20px; }
    .qw-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .qw-card h4 { font-size: 15px; margin-bottom: 8px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; color: white; }
    .before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 8px 0; }
    .before-after div { font-size: 13px; }
    .before-after .label { font-weight: 600; font-size: 11px; text-transform: uppercase; color: #64748b; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Diagnóstico de Madurez en IA</h1>
  <p class="subtitle">${org.name} — ${org.industry} — ${org.size}</p>

  <div class="meta">
    <div class="meta-item">
      <div class="value">${avgScore}</div>
      <div class="label">Promedio General / 4.0</div>
    </div>
    <div class="meta-item">
      <div class="value">${Object.values(scores).filter((v) => v === 1).length}</div>
      <div class="label">Dimensiones en Rojo</div>
    </div>
    <div class="meta-item">
      <div class="value">${Object.values(scores).filter((v) => (v as number) >= 3).length}</div>
      <div class="label">Dimensiones Fuertes</div>
    </div>
  </div>

  <h2>Madurez por Dimensión</h2>
  ${Object.entries(scores).map(([key, score]) => {
    const dimAnalysis = dimensionScores[key];
    return `<div class="dimension">
      <span class="score score-${score}">${score}</span>
      <strong>${dimensionNames[key] ?? key}</strong>
      ${dimAnalysis ? `<p style="font-size:13px;color:#475569;margin-top:8px">${dimAnalysis.summary}</p>` : ''}
      ${dimAnalysis && dimAnalysis.gaps && dimAnalysis.gaps.length > 0 ? `<ul class="gaps">${dimAnalysis.gaps.map((g: string) => `<li>${g}</li>`).join('')}</ul>` : ''}
    </div>`;
  }).join('')}

  ${quickWins.length > 0 ? `
  <h2>Quick Wins Recomendados</h2>
  ${quickWins.map((qw) => `<div class="qw-card">
    <h4>${qw.title}</h4>
    <span class="badge" style="background:${levelColors[qw.implementationLevel] ?? '#6b7280'}">${qw.implementationLevel}</span>
    <span class="badge" style="background:#6366f1">${qw.valueChainSegment}</span>
    <span style="font-size:12px;color:#64748b;margin-left:8px">${qw.timeline}</span>
    <div class="before-after">
      <div><div class="label">Antes</div>${qw.processBefore}</div>
      <div><div class="label">Después</div>${qw.processAfter}</div>
    </div>
    <div style="font-size:12px;color:#64748b">Herramienta: ${qw.suggestedTool}</div>
  </div>`).join('')}` : ''}

  ${deepDives.length > 0 ? `
  <h2>Deep Dives Recomendados</h2>
  ${deepDives.map((dd) => `<div class="dimension">
    <strong>${dd.title}</strong>
    <span class="badge" style="background:#dc2626;margin-left:8px">${dd.trigger}</span>
    <p style="font-size:13px;color:#475569;margin-top:8px">${dd.justification}</p>
  </div>`).join('')}` : ''}

  <div class="footer">
    Generado por AI Compass — InovaBiz — ${new Date().toLocaleDateString('es-AR')}
    <br>Para imprimir como PDF: Ctrl+P → Guardar como PDF
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    next(err);
  }
});

export default router;
