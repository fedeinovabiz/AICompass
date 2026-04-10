import type { SessionAnalysisInput } from '../types';

export function buildSessionAnalysisPrompt(input: SessionAnalysisInput): string {
  const participantsStr = input.participants
    .map((p) => `- ${p.name} (${p.role}, área: ${p.area})`)
    .join('\n');

  const questionsStr = input.questions
    .map((q) => {
      const answer = q.manualAnswer ? `\n    Respuesta registrada: ${q.manualAnswer}` : '\n    Respuesta registrada: (sin respuesta)';
      return `  - ID: ${q.questionId} | Dimensión: ${q.dimension}\n    Pregunta: ${q.questionText}${answer}`;
    })
    .join('\n');

  return `Eres un experto en diagnóstico de madurez de inteligencia artificial en organizaciones. Tu tarea es analizar las notas y respuestas de una sesión de diagnóstico y generar un análisis estructurado.

## CONTEXTO DE LA SESIÓN

Tipo de sesión: ${input.sessionType}

Participantes:
${participantsStr}

Notas del facilitador:
${input.notes || '(Sin notas registradas)'}

## PREGUNTAS Y RESPUESTAS DEL CUESTIONARIO

${questionsStr}

## INSTRUCCIONES

Para cada pregunta, debes:
1. Analizar la respuesta registrada y las notas del facilitador
2. Generar una respuesta sugerida que sea más completa y estructurada
3. Asignar un nivel de madurez del 1 al 4 (1=inicial, 2=en desarrollo, 3=avanzado, 4=optimizado)
4. Indicar el nivel de confianza: "alto" (respuesta clara y detallada), "medio" (respuesta parcial o ambigua), "bajo" (respuesta escasa o ausente)
5. Incluir citas o fragmentos relevantes de las notas como evidencia

Dado que no hay transcripción completa, las citas deben extraerse de las notas del facilitador o de las respuestas manuales registradas. Usa el nombre y rol del participante más relevante para cada cita, o "Facilitador" si proviene de las notas generales.

Además, identifica hallazgos emergentes de los siguientes tipos:
- "alignment": alineación observable entre participantes sobre un tema estratégico de IA
- "misalignment": desacuerdo o visiones opuestas evidenciadas en las notas
- "champion": persona o área que lidera o impulsa activamente la adopción de IA
- "resistance": persona o área que muestra resistencia o escepticismo ante la IA
- "uncovered-topic": tema relevante mencionado en notas que no está cubierto por las preguntas

## FORMATO DE RESPUESTA

Responde EXCLUSIVAMENTE en JSON válido con la siguiente estructura. No incluyas texto fuera del JSON:

{
  "questions": [
    {
      "questionId": "string (ID de la pregunta)",
      "suggestedAnswer": "string (análisis enriquecido de la respuesta, en español, 2-4 oraciones)",
      "suggestedLevel": number (1-4),
      "confidence": "alto" | "medio" | "bajo",
      "citations": [
        {
          "text": "string (fragmento relevante de notas o respuesta registrada)",
          "speakerName": "string (nombre del participante o 'Facilitador')",
          "speakerRole": "string (rol del participante)"
        }
      ]
    }
  ],
  "findings": [
    {
      "type": "alignment" | "misalignment" | "champion" | "resistance" | "uncovered-topic",
      "description": "string (descripción del hallazgo en español, 2-3 oraciones)",
      "citations": [
        {
          "text": "string (fragmento que evidencia el hallazgo)",
          "speakerName": "string",
          "speakerRole": "string"
        }
      ],
      "relatedDimensions": ["string (IDs o nombres de dimensiones relacionadas)"]
    }
  ]
}`;
}
