import type { CrossSessionInput } from '../types';

export function buildCrossSessionPrompt(input: CrossSessionInput): string {
  const sessionsStr = input.sessions
    .map((s, idx) => {
      const questionsStr = s.questions
        .map((q) => `    - [${q.questionId}] Dimensión: ${q.dimension} | Nivel: ${q.level}/4\n      Respuesta: ${q.finalAnswer}`)
        .join('\n');

      const findingsStr = s.findings
        .map((f) => `    - [${f.type}] ${f.description}`)
        .join('\n');

      return `### Sesión ${idx + 1}: ${s.type}\n\n  Preguntas respondidas:\n${questionsStr}\n\n  Hallazgos emergentes:\n${findingsStr}`;
    })
    .join('\n\n');

  return `Eres un experto senior en transformación digital e inteligencia artificial organizacional. Tu tarea es realizar un análisis integrado de múltiples sesiones de diagnóstico de madurez de IA para una organización específica.

## CONTEXTO ORGANIZACIONAL

Organización: ${input.organizationName}
Industria: ${input.industry}

## DATOS DE LAS SESIONES DE DIAGNÓSTICO

${sessionsStr}

## INSTRUCCIONES DE ANÁLISIS

Debes producir un análisis cross-sesión completo con los siguientes componentes:

### 1. Puntuaciones por Dimensión (dimensionScores)
Para cada dimensión identificada en las sesiones:
- Calcular una puntuación agregada (promedio ponderado de niveles, escala 0-100)
- Escribir un resumen ejecutivo de la situación actual en esa dimensión
- Identificar las brechas principales que impiden avanzar al siguiente nivel

### 2. Recomendación de Comité de IA (committeeRecommendation)
Proponer los roles que deberían integrar el Comité de Transformación de IA de la organización:
- Basarse en hallazgos de champions y gaps de liderazgo identificados en las sesiones
- Para cada rol, indicar si hay una persona específica sugerida (basada en los participantes) y justificar
- Incluir al menos: sponsor ejecutivo, líder técnico, representante de negocio, responsable de datos

### 3. Recomendaciones de Deep Dive (deepDiveRecommendations)
Identificar áreas que requieren investigación más profunda:
- Cada recomendación debe tener un disparador claro (hallazgo o evidencia que la motiva)
- Proponer 3-5 preguntas específicas para explorar en una sesión de profundización

### 4. Quick Wins de IA (quickWinSuggestions)
Proponer 3-5 mejoras concretas que la organización puede implementar en menos de 90 días.

Para cada quick win, es OBLIGATORIO especificar:
- **title**: nombre descriptivo de la mejora
- **processBefore**: descripción del proceso actual (sin IA)
- **processAfter**: descripción del proceso mejorado (con IA)
- **suggestedTool**: herramienta o plataforma de IA recomendada (específica, ej: "ChatGPT Enterprise", "Make + Claude API", "Google Looker Studio + Gemini")
- **estimatedImpact**: impacto estimado cuantificable (ej: "Reducción del 40% en tiempo de elaboración de informes")
- **timeline**: tiempo estimado de implementación (ej: "2-3 semanas")
- **valueChainSegment**: segmento de la cadena de valor donde aplica. DEBE ser exactamente uno de:
  - "market-to-lead" (actividades de marketing y generación de demanda)
  - "lead-to-sale" (actividades de ventas y conversión)
  - "sale-to-delivery" (actividades de implementación y entrega)
  - "delivery-to-success" (actividades de soporte y éxito del cliente)
  - "success-to-market" (actividades de retención, expansión y advocacy)
- **implementationLevel**: nivel técnico de implementación. DEBE ser exactamente uno de:
  - "prompting" (uso de IA mediante prompts sin integración técnica, accesible para cualquier usuario)
  - "no-code" (automatización con herramientas visuales como Make, Zapier, n8n, sin programar)
  - "custom" (desarrollo de software personalizado con APIs o modelos propios)
- **diminishingReturns**: descripción de a qué escala o condición este quick win deja de generar valor adicional significativo (ej: "Pierde efectividad cuando el volumen supera 500 documentos/mes, momento en que se requiere una solución custom con procesamiento batch")

## FORMATO DE RESPUESTA

Responde EXCLUSIVAMENTE en JSON válido con la siguiente estructura. No incluyas texto fuera del JSON:

{
  "dimensionScores": {
    "nombre-de-dimension": {
      "score": number (0-100),
      "summary": "string (resumen ejecutivo en español, 3-4 oraciones)",
      "gaps": ["string (descripción de brecha específica)"]
    }
  },
  "committeeRecommendation": {
    "suggestedMembers": [
      {
        "role": "string (nombre del rol en el comité)",
        "suggestedPerson": "string (nombre de persona sugerida, opcional)",
        "justification": "string (justificación basada en hallazgos de las sesiones)"
      }
    ]
  },
  "deepDiveRecommendations": [
    {
      "trigger": "string (hallazgo o evidencia que motiva esta recomendación)",
      "title": "string (título descriptivo del deep dive)",
      "justification": "string (por qué es importante investigar esto más en profundidad)",
      "suggestedQuestions": ["string (pregunta específica para la sesión de profundización)"]
    }
  ],
  "quickWinSuggestions": [
    {
      "title": "string",
      "processBefore": "string (descripción del proceso actual sin IA)",
      "processAfter": "string (descripción del proceso mejorado con IA)",
      "suggestedTool": "string (herramienta específica recomendada)",
      "estimatedImpact": "string (impacto cuantificable)",
      "timeline": "string (tiempo de implementación)",
      "valueChainSegment": "market-to-lead" | "lead-to-sale" | "sale-to-delivery" | "delivery-to-success" | "success-to-market",
      "implementationLevel": "prompting" | "no-code" | "custom",
      "diminishingReturns": "string (descripción de cuándo deja de generar valor adicional)"
    }
  ]
}`;
}
