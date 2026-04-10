// ══════════════════════════════════════════════
// BENCHMARKS ROUTE — Benchmark de madurez por industria (F-018)
// ══════════════════════════════════════════════

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getMany } from '../db';

const router = Router();
router.use(authMiddleware);

interface BenchmarkRow {
  industry: string;
  size_category: string;
  dimension: string;
  avg_score: string;
  sample_size: number;
  source: string;
}

// Mapea el campo `size` de la organización a una size_category de la tabla
function mapSizeCategory(size: string): string {
  if (!size) return '51-200';
  const lower = size.toLowerCase();
  if (lower.includes('1-50') || /\b[1-4]?\d\b/.test(lower)) {
    // Rangos hasta 50
    const nums = lower.match(/\d+/g)?.map(Number) ?? [];
    if (nums.length > 0 && Math.max(...nums) <= 50) return '1-50';
  }
  if (lower.includes('201-500') || lower.includes('250') || lower.includes('300')) return '201-500';
  if (lower.includes('51-200') || lower.includes('100') || lower.includes('120') || lower.includes('150')) return '51-200';
  const nums = lower.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length > 0) {
    const max = Math.max(...nums);
    if (max <= 50) return '1-50';
    if (max <= 200) return '51-200';
    if (max <= 500) return '201-500';
    return '501+';
  }
  return '51-200';
}

// GET /benchmarks?industry=Tecnología&size=51-200
router.get('/', async (req, res, next) => {
  try {
    const industry = (req.query.industry as string) || 'Otros';
    const size = (req.query.size as string) || '';
    const sizeCategory = mapSizeCategory(size);

    let rows = await getMany<BenchmarkRow>(
      'SELECT * FROM industry_benchmarks WHERE industry = $1 AND size_category = $2',
      [industry, sizeCategory],
    );

    // Fallback a "Otros" si no hay match exacto
    if (rows.length === 0) {
      rows = await getMany<BenchmarkRow>(
        'SELECT * FROM industry_benchmarks WHERE industry = $1 AND size_category = $2',
        ['Otros', sizeCategory],
      );
    }

    const scores: Record<string, number> = {};
    let sampleSize = 1;
    let source = 'framework';

    for (const row of rows) {
      scores[row.dimension] = parseFloat(row.avg_score);
      sampleSize = row.sample_size;
      source = row.source;
    }

    res.json({
      industry: rows[0]?.industry ?? industry,
      sizeCategory,
      scores,
      sampleSize,
      source,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
