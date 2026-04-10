// ══════════════════════════════════════════════
// PRESENTATIONS ROUTE — Generación de PPTX con pptxgenjs
// ══════════════════════════════════════════════

import { Router } from 'express';
import PptxGenJS from 'pptxgenjs';
import { authMiddleware } from '../middleware/auth';
import { getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// ── Constantes de branding InovaBiz ──────────────────────────

const COLORS = {
  fondoOscuro: '0f172a',
  fondoClaro: 'f8fafc',
  azulPrimario: '1e3a5f',
  azulBrillante: '3b82f6',
  verde: '22c55e',
  rojo: 'ef4444',
  amarillo: 'f59e0b',
  textoOscuro: '1e293b',
  textoGris: '64748b',
  blanco: 'FFFFFF',
  grisClaro: 'cbd5e1',
};

const DIMENSION_NAMES: Record<string, string> = {
  estrategia: 'Estrategia e IA',
  procesos: 'Procesos',
  datos: 'Datos',
  tecnologia: 'Tecnología',
  cultura: 'Cultura y Personas',
  gobernanza: 'Gobernanza',
};

const DIMENSION_KEYS = ['estrategia', 'procesos', 'datos', 'tecnologia', 'cultura', 'gobernanza'];

function scoreColor(score: number): string {
  if (score === 1) return COLORS.rojo;
  if (score === 2) return COLORS.amarillo;
  if (score === 3) return COLORS.azulBrillante;
  return COLORS.verde;
}

// ── Tipos auxiliares ──────────────────────────────────────────

interface DimensionScore {
  score: number;
  summary?: string;
  gaps?: string[];
}

interface QuickWin {
  title?: string;
  processBefore?: string;
  processAfter?: string;
  suggestedTool?: string;
  implementationLevel?: string;
  valueChainSegment?: string;
}

// ── GET /organization/:orgId/diagnostic.pptx ─────────────────

router.get('/organization/:orgId/diagnostic.pptx', async (req, res, next) => {
  try {
    const { orgId } = req.params;

    // 1. Cargar organización
    const org = await getOne<Record<string, unknown>>(
      'SELECT * FROM organizations WHERE id = $1',
      [orgId],
    );
    if (!org) {
      res.status(404).json({ message: 'Organización no encontrada' });
      return;
    }

    // 2. Cargar cross_session_analysis más reciente
    const analysis = await getOne<Record<string, unknown>>(
      'SELECT * FROM cross_session_analyses WHERE organization_id = $1 ORDER BY generated_at DESC LIMIT 1',
      [orgId],
    );
    if (!analysis) {
      res.status(400).json({ message: 'Se necesita un análisis cross-sesión completado' });
      return;
    }

    // 3. Cargar hallazgos emergentes de todas las sesiones
    const emergentFindings = await getMany<Record<string, unknown>>(
      `SELECT ef.* FROM emergent_findings ef
       JOIN sessions s ON ef.session_id = s.id
       JOIN engagements e ON s.engagement_id = e.id
       WHERE e.organization_id = $1`,
      [orgId],
    );

    // ── Extraer datos del analysis ──────────────────────────

    const maturityScores = (org.maturity_scores ?? {}) as Record<string, number>;
    const dimensionScores = (analysis.dimension_scores ?? {}) as Record<string, DimensionScore>;
    const quickWins = (analysis.quick_win_suggestions ?? []) as QuickWin[];

    const scoreValues = Object.values(maturityScores).filter((v) => typeof v === 'number') as number[];
    const promedio = scoreValues.length > 0
      ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
      : null;
    const dimensionesEnRojo = Object.entries(maturityScores)
      .filter(([, v]) => v === 1)
      .map(([k]) => DIMENSION_NAMES[k] ?? k);
    const dimensionesFuertes = Object.entries(maturityScores)
      .filter(([, v]) => (v as number) >= 3)
      .map(([k]) => DIMENSION_NAMES[k] ?? k);

    const fechaActual = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const orgName = String(org.name ?? 'Organización');

    // ── Iniciar pptxgenjs ───────────────────────────────────

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"

    // ──────────────────────────────────────────────────────────
    // SLIDE 1: Portada
    // ──────────────────────────────────────────────────────────
    {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.fondoOscuro };

      slide.addText('Diagnóstico de Madurez en IA', {
        x: 1,
        y: 2.2,
        w: 11.33,
        h: 0.9,
        fontSize: 36,
        bold: true,
        color: COLORS.blanco,
        align: 'center',
      });

      slide.addText(orgName, {
        x: 1,
        y: 3.3,
        w: 11.33,
        h: 0.6,
        fontSize: 22,
        color: COLORS.grisClaro,
        align: 'center',
      });

      slide.addText(`InovaBiz — ${fechaActual}`, {
        x: 1,
        y: 6.5,
        w: 11.33,
        h: 0.4,
        fontSize: 13,
        color: COLORS.textoGris,
        align: 'center',
      });

      // Línea decorativa
      slide.addShape(pptx.ShapeType.rect, {
        x: 4.5,
        y: 4.1,
        w: 4.33,
        h: 0.06,
        fill: { color: COLORS.azulBrillante },
        line: { color: COLORS.azulBrillante },
      });
    }

    // ──────────────────────────────────────────────────────────
    // SLIDE 2: Resumen Ejecutivo
    // ──────────────────────────────────────────────────────────
    {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.fondoClaro };

      slide.addText('Resumen Ejecutivo', {
        x: 0.5,
        y: 0.3,
        w: 12,
        h: 0.6,
        fontSize: 26,
        bold: true,
        color: COLORS.azulPrimario,
      });

      // Línea separadora
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.0,
        w: 12.33,
        h: 0.04,
        fill: { color: COLORS.grisClaro },
        line: { color: COLORS.grisClaro },
      });

      // KPI 1: Promedio General
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.5,
        w: 3.8,
        h: 2.5,
        fill: { color: COLORS.azulPrimario },
        line: { color: COLORS.azulPrimario },
        rectRadius: 0.1,
      });
      slide.addText(promedio !== null ? promedio.toFixed(1) : '—', {
        x: 0.5,
        y: 2.0,
        w: 3.8,
        h: 0.9,
        fontSize: 48,
        bold: true,
        color: COLORS.blanco,
        align: 'center',
      });
      slide.addText('Promedio General / 4.0', {
        x: 0.5,
        y: 3.0,
        w: 3.8,
        h: 0.5,
        fontSize: 13,
        color: COLORS.grisClaro,
        align: 'center',
      });

      // KPI 2: Dimensiones en Rojo
      slide.addShape(pptx.ShapeType.rect, {
        x: 4.8,
        y: 1.5,
        w: 3.8,
        h: 2.5,
        fill: { color: COLORS.rojo },
        line: { color: COLORS.rojo },
        rectRadius: 0.1,
      });
      slide.addText(String(dimensionesEnRojo.length), {
        x: 4.8,
        y: 2.0,
        w: 3.8,
        h: 0.9,
        fontSize: 48,
        bold: true,
        color: COLORS.blanco,
        align: 'center',
      });
      slide.addText('Dimensiones en Rojo', {
        x: 4.8,
        y: 3.0,
        w: 3.8,
        h: 0.5,
        fontSize: 13,
        color: COLORS.blanco,
        align: 'center',
      });

      // KPI 3: Dimensiones Fuertes
      slide.addShape(pptx.ShapeType.rect, {
        x: 9.1,
        y: 1.5,
        w: 3.8,
        h: 2.5,
        fill: { color: COLORS.verde },
        line: { color: COLORS.verde },
        rectRadius: 0.1,
      });
      slide.addText(String(dimensionesFuertes.length), {
        x: 9.1,
        y: 2.0,
        w: 3.8,
        h: 0.9,
        fontSize: 48,
        bold: true,
        color: COLORS.blanco,
        align: 'center',
      });
      slide.addText('Dimensiones Fuertes', {
        x: 9.1,
        y: 3.0,
        w: 3.8,
        h: 0.5,
        fontSize: 13,
        color: COLORS.blanco,
        align: 'center',
      });

      // Scores por dimensión (tabla compacta)
      if (scoreValues.length > 0) {
        slide.addText('Scores por dimensión:', {
          x: 0.5,
          y: 4.3,
          w: 5,
          h: 0.35,
          fontSize: 12,
          bold: true,
          color: COLORS.textoOscuro,
        });

        const tableRows: PptxGenJS.TableRow[] = [
          [
            { text: 'Dimensión', options: { bold: true, color: COLORS.blanco, fill: { color: COLORS.azulPrimario } } },
            { text: 'Score', options: { bold: true, color: COLORS.blanco, fill: { color: COLORS.azulPrimario }, align: 'center' } },
          ],
          ...DIMENSION_KEYS
            .filter((k) => maturityScores[k] !== undefined)
            .map((k) => [
              { text: DIMENSION_NAMES[k] ?? k, options: { color: COLORS.textoOscuro } },
              {
                text: String(maturityScores[k]),
                options: {
                  align: 'center' as const,
                  bold: true,
                  color: scoreColor(maturityScores[k]),
                },
              },
            ]),
        ];

        slide.addTable(tableRows, {
          x: 0.5,
          y: 4.7,
          w: 6,
          colW: [4.5, 1.5],
          fontSize: 12,
          border: { type: 'solid', pt: 1, color: COLORS.grisClaro },
          fill: { color: COLORS.fondoClaro },
        });
      }

      // Hallazgos emergentes count
      if (emergentFindings.length > 0) {
        slide.addText(`${emergentFindings.length} hallazgo${emergentFindings.length !== 1 ? 's' : ''} emergente${emergentFindings.length !== 1 ? 's' : ''} identificado${emergentFindings.length !== 1 ? 's' : ''} en las sesiones`, {
          x: 7,
          y: 4.7,
          w: 6,
          h: 0.4,
          fontSize: 12,
          color: COLORS.textoGris,
          italic: true,
        });
      }
    }

    // ──────────────────────────────────────────────────────────
    // SLIDE 3: Metodología
    // ──────────────────────────────────────────────────────────
    {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.fondoClaro };

      slide.addText('Metodología', {
        x: 0.5,
        y: 0.3,
        w: 12,
        h: 0.6,
        fontSize: 26,
        bold: true,
        color: COLORS.azulPrimario,
      });

      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.0,
        w: 12.33,
        h: 0.04,
        fill: { color: COLORS.grisClaro },
        line: { color: COLORS.grisClaro },
      });

      const bullets = [
        '6 dimensiones de madurez evaluadas',
        '3 sesiones de diagnóstico (ejecutiva, operativa, técnica)',
        'Procesamiento con IA (análisis cross-sesión)',
        'Validación por facilitador certificado',
      ];

      bullets.forEach((text, idx) => {
        slide.addShape(pptx.ShapeType.rect, {
          x: 0.5,
          y: 1.4 + idx * 0.85,
          w: 0.06,
          h: 0.4,
          fill: { color: COLORS.azulBrillante },
          line: { color: COLORS.azulBrillante },
        });
        slide.addText(text, {
          x: 0.8,
          y: 1.4 + idx * 0.85,
          w: 11,
          h: 0.4,
          fontSize: 15,
          color: COLORS.textoOscuro,
        });
      });

      slide.addText('Frameworks de referencia:', {
        x: 0.5,
        y: 5.0,
        w: 6,
        h: 0.4,
        fontSize: 13,
        bold: true,
        color: COLORS.azulPrimario,
      });

      slide.addText('McKinsey · Microsoft · Google Cloud · Anthropic', {
        x: 0.5,
        y: 5.5,
        w: 12,
        h: 0.4,
        fontSize: 14,
        color: COLORS.textoGris,
        italic: true,
      });
    }

    // ──────────────────────────────────────────────────────────
    // SLIDES 4-9: Una por dimensión
    // ──────────────────────────────────────────────────────────
    for (const dimKey of DIMENSION_KEYS) {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.fondoClaro };

      const dimName = DIMENSION_NAMES[dimKey] ?? dimKey;
      const dimScore = maturityScores[dimKey] ?? null;
      const dimAnalysis = dimensionScores[dimKey] ?? null;

      // Título
      slide.addText(dimName, {
        x: 0.5,
        y: 0.3,
        w: 10,
        h: 0.6,
        fontSize: 26,
        bold: true,
        color: COLORS.azulPrimario,
      });

      // Score grande
      if (dimScore !== null) {
        const color = scoreColor(dimScore);
        slide.addShape(pptx.ShapeType.ellipse, {
          x: 11.3,
          y: 0.15,
          w: 1.6,
          h: 1.2,
          fill: { color },
          line: { color },
        });
        slide.addText(String(dimScore), {
          x: 11.3,
          y: 0.2,
          w: 1.6,
          h: 1.0,
          fontSize: 40,
          bold: true,
          color: COLORS.blanco,
          align: 'center',
          valign: 'middle',
        });
        slide.addText('/4', {
          x: 11.3,
          y: 1.1,
          w: 1.6,
          h: 0.3,
          fontSize: 12,
          color: COLORS.textoGris,
          align: 'center',
        });
      }

      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.05,
        w: 12.33,
        h: 0.04,
        fill: { color: COLORS.grisClaro },
        line: { color: COLORS.grisClaro },
      });

      let yPos = 1.3;

      // Resumen
      if (dimAnalysis?.summary) {
        slide.addText(dimAnalysis.summary, {
          x: 0.5,
          y: yPos,
          w: 12,
          h: 1.0,
          fontSize: 13,
          color: COLORS.textoOscuro,
          wrap: true,
        });
        yPos += 1.2;
      } else {
        slide.addText('Sin análisis detallado disponible para esta dimensión.', {
          x: 0.5,
          y: yPos,
          w: 12,
          h: 0.4,
          fontSize: 13,
          color: COLORS.textoGris,
          italic: true,
        });
        yPos += 0.7;
      }

      // Brechas
      const gaps = dimAnalysis?.gaps ?? [];
      if (gaps.length > 0) {
        slide.addText('Brechas identificadas:', {
          x: 0.5,
          y: yPos,
          w: 6,
          h: 0.4,
          fontSize: 13,
          bold: true,
          color: COLORS.rojo,
        });
        yPos += 0.45;

        gaps.slice(0, 5).forEach((gap) => {
          slide.addShape(pptx.ShapeType.rect, {
            x: 0.5,
            y: yPos + 0.1,
            w: 0.06,
            h: 0.25,
            fill: { color: COLORS.rojo },
            line: { color: COLORS.rojo },
          });
          slide.addText(gap, {
            x: 0.75,
            y: yPos,
            w: 11.8,
            h: 0.4,
            fontSize: 12,
            color: COLORS.textoOscuro,
            wrap: true,
          });
          yPos += 0.5;
        });
      }

      // Etiqueta de nivel
      const levelLabel: Record<number, string> = {
        1: 'Nivel 1 — Inicial',
        2: 'Nivel 2 — En desarrollo',
        3: 'Nivel 3 — Definido',
        4: 'Nivel 4 — Optimizado',
      };
      if (dimScore !== null && levelLabel[dimScore]) {
        slide.addText(levelLabel[dimScore], {
          x: 0.5,
          y: 6.8,
          w: 6,
          h: 0.4,
          fontSize: 11,
          color: scoreColor(dimScore),
          bold: true,
          italic: true,
        });
      }
    }

    // ──────────────────────────────────────────────────────────
    // SLIDE 10: Quick Wins
    // ──────────────────────────────────────────────────────────
    {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.fondoClaro };

      slide.addText('Quick Wins Recomendados', {
        x: 0.5,
        y: 0.3,
        w: 12,
        h: 0.6,
        fontSize: 26,
        bold: true,
        color: COLORS.azulPrimario,
      });

      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.0,
        w: 12.33,
        h: 0.04,
        fill: { color: COLORS.grisClaro },
        line: { color: COLORS.grisClaro },
      });

      const topWins = quickWins.slice(0, 3);

      if (topWins.length === 0) {
        slide.addText('No hay quick wins disponibles en este análisis.', {
          x: 0.5,
          y: 2.0,
          w: 12,
          h: 0.5,
          fontSize: 14,
          color: COLORS.textoGris,
          italic: true,
        });
      } else {
        const tableRows: PptxGenJS.TableRow[] = [
          [
            { text: 'Quick Win', options: { bold: true, color: COLORS.blanco, fill: { color: COLORS.azulPrimario } } },
            { text: 'Antes', options: { bold: true, color: COLORS.blanco, fill: { color: COLORS.azulPrimario } } },
            { text: 'Después', options: { bold: true, color: COLORS.blanco, fill: { color: COLORS.azulPrimario } } },
            { text: 'Herramienta', options: { bold: true, color: COLORS.blanco, fill: { color: COLORS.azulPrimario } } },
            { text: 'Nivel', options: { bold: true, color: COLORS.blanco, fill: { color: COLORS.azulPrimario }, align: 'center' } },
          ],
          ...topWins.map((qw) => [
            { text: qw.title ?? '', options: { bold: true, color: COLORS.textoOscuro } },
            { text: qw.processBefore ?? '', options: { color: COLORS.textoOscuro, fontSize: 10 } },
            { text: qw.processAfter ?? '', options: { color: COLORS.textoOscuro, fontSize: 10 } },
            { text: qw.suggestedTool ?? '', options: { color: COLORS.azulBrillante, fontSize: 10 } },
            { text: qw.implementationLevel ?? '', options: { align: 'center' as const, fontSize: 10, color: COLORS.textoGris } },
          ]),
        ];

        slide.addTable(tableRows, {
          x: 0.3,
          y: 1.2,
          w: 12.7,
          colW: [2.8, 2.5, 2.5, 2.5, 1.4],
          fontSize: 11,
          border: { type: 'solid', pt: 1, color: COLORS.grisClaro },
          fill: { color: COLORS.fondoClaro },
          rowH: 0.9,
        });
      }
    }

    // ──────────────────────────────────────────────────────────
    // SLIDE 11: Próximos Pasos
    // ──────────────────────────────────────────────────────────
    {
      const slide = pptx.addSlide();
      slide.background = { color: COLORS.fondoClaro };

      slide.addText('¿Qué sigue?', {
        x: 0.5,
        y: 0.3,
        w: 12,
        h: 0.6,
        fontSize: 26,
        bold: true,
        color: COLORS.azulPrimario,
      });

      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.0,
        w: 12.33,
        h: 0.04,
        fill: { color: COLORS.grisClaro },
        line: { color: COLORS.grisClaro },
      });

      const proximosPasos = [
        'Constituir comité de IA con roles definidos',
        'Seleccionar 2-3 pilotos de alto impacto y bajo riesgo',
        'Definir baseline y métricas de éxito por piloto',
        'Reunión quincenal del comité para seguimiento',
      ];

      proximosPasos.forEach((paso, idx) => {
        // Número del paso
        slide.addShape(pptx.ShapeType.ellipse, {
          x: 0.5,
          y: 1.3 + idx * 1.0,
          w: 0.5,
          h: 0.5,
          fill: { color: COLORS.azulBrillante },
          line: { color: COLORS.azulBrillante },
        });
        slide.addText(String(idx + 1), {
          x: 0.5,
          y: 1.3 + idx * 1.0,
          w: 0.5,
          h: 0.5,
          fontSize: 14,
          bold: true,
          color: COLORS.blanco,
          align: 'center',
          valign: 'middle',
        });
        slide.addText(paso, {
          x: 1.2,
          y: 1.35 + idx * 1.0,
          w: 11,
          h: 0.4,
          fontSize: 15,
          color: COLORS.textoOscuro,
        });
      });

      // Contacto
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 6.2,
        w: 12.33,
        h: 0.04,
        fill: { color: COLORS.grisClaro },
        line: { color: COLORS.grisClaro },
      });
      slide.addText('Contacto: InovaBiz — federico@inovabiz.com', {
        x: 0.5,
        y: 6.4,
        w: 12,
        h: 0.4,
        fontSize: 12,
        color: COLORS.textoGris,
        align: 'center',
      });
    }

    // ── Generar y enviar el buffer ──────────────────────────

    const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="diagnostico-${orgName}.pptx"`,
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

export default router;
