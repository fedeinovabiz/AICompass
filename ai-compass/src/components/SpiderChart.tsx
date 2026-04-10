// ══════════════════════════════════════════════
// SPIDER CHART — Radar de madurez por dimensión
// ══════════════════════════════════════════════

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DimensionKey } from '@/types';
import { DIMENSIONS } from '@/constants/dimensions';

interface SpiderChartProps {
  scores: Partial<Record<DimensionKey, number | null>>;
  benchmark?: Partial<Record<DimensionKey, number>>;
}

interface RadarDataPoint {
  dimension: string;
  organizacion: number;
  benchmark?: number;
}

export default function SpiderChart({ scores, benchmark }: SpiderChartProps) {
  const data: RadarDataPoint[] = DIMENSIONS.map((dim) => {
    const point: RadarDataPoint = {
      dimension: dim.name,
      organizacion: scores[dim.key] ?? 0,
    };
    if (benchmark !== undefined) {
      point.benchmark = benchmark[dim.key] ?? 0;
    }
    return point;
  });

  const hasBenchmark = benchmark !== undefined;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 4]}
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          name="Organización"
          dataKey="organizacion"
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.3}
        />
        {hasBenchmark && (
          <Radar
            name="Benchmark"
            dataKey="benchmark"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.1}
            strokeDasharray="5 5"
          />
        )}
        <Legend
          wrapperStyle={{ color: '#94a3b8', fontSize: 13 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
