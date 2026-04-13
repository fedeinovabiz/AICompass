// ══════════════════════════════════════════════
// AREA MINI-ASSESSMENT PAGE — 12 preguntas rápidas
// ══════════════════════════════════════════════

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAreaStore } from '@/stores/areaStore';
import type { DimensionKey, MaturityLevel, MiniAssessmentAnswer } from '@/types';

interface MiniQuestion {
  dimension: DimensionKey;
  questionIndex: number;
  questionText: string;
  options: { level: MaturityLevel; text: string }[];
}

const MINI_QUESTIONS: MiniQuestion[] = [
  { dimension: 'estrategia', questionIndex: 0, questionText: '¿Existe una visión documentada de IA en el área?',
    options: [
      { level: 1, text: 'No se ha conversado formalmente sobre IA' },
      { level: 2, text: 'Se reconoce la necesidad pero no hay plan' },
      { level: 3, text: 'Hay estrategia documentada con objetivos medibles' },
      { level: 4, text: 'IA está integrada en la estrategia del área' },
    ]},
  { dimension: 'estrategia', questionIndex: 1, questionText: '¿El liderazgo del área participa activamente en iniciativas de IA?',
    options: [
      { level: 1, text: 'No hay involucramiento del liderazgo' },
      { level: 2, text: 'Interés pasivo, sin acciones concretas' },
      { level: 3, text: 'Liderazgo asigna recursos y tiempo' },
      { level: 4, text: 'Liderazgo hace role-modeling activo con IA' },
    ]},
  { dimension: 'procesos', questionIndex: 0, questionText: '¿Los procesos clave del área están documentados?',
    options: [
      { level: 1, text: 'Procesos ad-hoc, no documentados' },
      { level: 2, text: 'Parcialmente documentados' },
      { level: 3, text: 'Documentados y estandarizados' },
      { level: 4, text: 'Rediseñados con IA integrada' },
    ]},
  { dimension: 'procesos', questionIndex: 1, questionText: '¿Se han identificado procesos candidatos a automatización?',
    options: [
      { level: 1, text: 'No se ha evaluado' },
      { level: 2, text: 'Algunas ideas sin priorizar' },
      { level: 3, text: 'Mapa de procesos con priorización' },
      { level: 4, text: 'Pipeline activo de automatización' },
    ]},
  { dimension: 'datos', questionIndex: 0, questionText: '¿Los datos del área son accesibles para herramientas de IA?',
    options: [
      { level: 1, text: 'Datos en silos, inaccesibles' },
      { level: 2, text: 'Algunos datos centralizados' },
      { level: 3, text: 'Datos centralizados con gobernanza básica' },
      { level: 4, text: 'Infraestructura de datos optimizada para IA' },
    ]},
  { dimension: 'datos', questionIndex: 1, questionText: '¿Existe calidad y confiabilidad en los datos del área?',
    options: [
      { level: 1, text: 'Datos inconsistentes y no confiables' },
      { level: 2, text: 'Calidad variable, sin métricas' },
      { level: 3, text: 'Monitoreo de calidad implementado' },
      { level: 4, text: 'Pipelines de calidad automatizados' },
    ]},
  { dimension: 'tecnologia', questionIndex: 0, questionText: '¿Qué herramientas de IA se usan en el área?',
    options: [
      { level: 1, text: 'Solo herramientas de productividad básicas' },
      { level: 2, text: 'Herramientas modernas + algo de cloud' },
      { level: 3, text: 'Plataformas de IA integradas al flujo' },
      { level: 4, text: 'Orquestación de agentes y automatización avanzada' },
    ]},
  { dimension: 'tecnologia', questionIndex: 1, questionText: '¿Hay capacidad de integración entre sistemas del área?',
    options: [
      { level: 1, text: 'Sistemas aislados, sin APIs' },
      { level: 2, text: 'Algunas integraciones manuales' },
      { level: 3, text: 'APIs disponibles, integraciones activas' },
      { level: 4, text: 'Ecosistema conectado con MCPs y agentes' },
    ]},
  { dimension: 'cultura', questionIndex: 0, questionText: '¿Cómo percibe el equipo del área la adopción de IA?',
    options: [
      { level: 1, text: 'Resistencia activa o miedo' },
      { level: 2, text: 'Curiosidad emergente' },
      { level: 3, text: 'Cultura de experimentación' },
      { level: 4, text: 'IA es parte de la identidad del equipo' },
    ]},
  { dimension: 'cultura', questionIndex: 1, questionText: '¿Hay personas en el área que promueven activamente el uso de IA?',
    options: [
      { level: 1, text: 'Nadie lo promueve' },
      { level: 2, text: '1-2 personas exploran por cuenta propia' },
      { level: 3, text: 'Champions identificados con tiempo asignado' },
      { level: 4, text: 'Equipo autoorganizado crea soluciones IA' },
    ]},
  { dimension: 'gobernanza', questionIndex: 0, questionText: '¿Existen políticas de uso de IA en el área?',
    options: [
      { level: 1, text: 'Sin políticas ni lineamientos' },
      { level: 2, text: 'Lineamientos informales' },
      { level: 3, text: 'Políticas formales documentadas' },
      { level: 4, text: 'Gobernanza adaptativa con centro de excelencia' },
    ]},
  { dimension: 'gobernanza', questionIndex: 1, questionText: '¿Se mide el impacto de las iniciativas de IA en el área?',
    options: [
      { level: 1, text: 'No se mide nada' },
      { level: 2, text: 'Métricas anecdóticas' },
      { level: 3, text: 'KPIs definidos con tracking regular' },
      { level: 4, text: 'Dashboard de impacto en tiempo real' },
    ]},
];

export default function AreaMiniAssessmentPage() {
  const { orgId, areaId } = useParams<{ orgId: string; areaId: string }>();
  const navigate = useNavigate();
  const { submitMiniAssessment, isLoading } = useAreaStore();
  const [answers, setAnswers] = useState<Record<number, MaturityLevel>>({});

  function handleSelect(questionIdx: number, level: MaturityLevel) {
    setAnswers(prev => ({ ...prev, [questionIdx]: level }));
  }

  async function handleSubmit() {
    if (!areaId) return;

    const formatted: MiniAssessmentAnswer[] = MINI_QUESTIONS.map((q, idx) => ({
      dimension: q.dimension,
      questionIndex: q.questionIndex,
      questionText: q.questionText,
      answer: q.options.find(o => o.level === answers[idx])?.text ?? '',
      suggestedLevel: answers[idx] ?? 1,
    }));

    await submitMiniAssessment(areaId, formatted);
    navigate(`/org/${orgId}/areas/${areaId}`);
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = MINI_QUESTIONS.length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(`/org/${orgId}/areas/${areaId}`)} className="text-sm text-slate-400 hover:text-white mb-4 block">
        Volver al área
      </button>

      <h1 className="text-2xl font-bold text-white mb-2">Mini-assessment del área</h1>
      <p className="text-slate-400 text-sm mb-6">
        12 preguntas para obtener un diagnóstico rápido. Responde según la realidad actual del área.
        <span className="ml-2 text-white font-medium">{answeredCount}/{totalCount}</span>
      </p>

      <div className="space-y-6">
        {MINI_QUESTIONS.map((q, idx) => (
          <div key={idx} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-white font-medium mb-1">{idx + 1}. {q.questionText}</p>
            <p className="text-xs text-slate-500 mb-3 capitalize">{q.dimension}</p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => handleSelect(idx, opt.level)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    answers[idx] === opt.level
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <span className="font-medium mr-2">Nivel {opt.level}:</span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={answeredCount < totalCount || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar mini-assessment'}
        </button>
      </div>
    </div>
  );
}
