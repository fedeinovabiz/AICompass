import type { TranscriptExtractionInput } from '../types';

export function buildTranscriptExtractionPrompt(input: TranscriptExtractionInput): string {
  const participantsStr = input.participants
    .map((p) => `- ${p.name} (${p.role}, área: ${p.area})`)
    .join('\n');

  const questionsStr = input.questions
    .map((q) => `  - ID: ${q.questionId} | Dimensión: ${q.dimension}\n    Pregunta: ${q.questionText}`)
    .join('\n');

  return `Eres un experto en diagnóstico de madurez de inteligencia artificial en organizaciones. Tu tarea es analizar la transcripción de una sesión de entrevista y extraer información estructurada para cada pregunta del cuestionario.

## CONTEXTO DE LA SESIÓN

Tipo de sesión: ${input.sessionType}

Participantes:
${participantsStr}

Notas adicionales del facilitador:
${input.notes || '(Sin notas adicionales)'}

## PREGUNTAS DEL CUESTIONARIO

${questionsStr}

## TRANSCRIPCIÓN DE LA SESIÓN

${input.transcriptText}

## INSTRUCCIONES

Para cada pregunta del cuestionario, debes:
1. Buscar evidencia relevante en la transcripción
2. Generar una respuesta sugerida que sintetice lo expresado por los participantes
3. Asignar un nivel de madurez del 1 al 4 (1=inicial, 2=en desarrollo, 3=avanzado, 4=optimizado)
4. Indicar el nivel de confianza de tu análisis: "alto" (evidencia directa y clara), "medio" (evidencia indirecta o parcial), "bajo" (poca o ninguna evidencia)
5. Incluir citas textuales de la transcripción que sustenten tu análisis

Además, identifica hallazgos emergentes de los siguientes tipos:
- "alignment": alineación entre participantes sobre un tema estratégico de IA
- "misalignment": desacuerdo o visiones opuestas entre participantes
- "champion": persona o área que lidera o impulsa activamente la adopción de IA
- "resistance": persona o área que muestra resistencia o escepticismo ante la IA
- "uncovered-topic": tema relevante que surgió y no estaba cubierto por las preguntas

## FORMATO DE RESPUESTA

Responde EXCLUSIVAMENTE en JSON válido con la siguiente estructura. No incluyas texto fuera del JSON:

{
  "questions": [
    {
      "questionId": "string (ID de la pregunta)",
      "suggestedAnswer": "string (síntesis de lo expresado, en español, 2-4 oraciones)",
      "suggestedLevel": number (1-4),
      "confidence": "alto" | "medio" | "bajo",
      "citations": [
        {
          "text": "string (cita textual de la transcripción)",
          "speakerName": "string (nombre del participante)",
          "speakerRole": "string (rol del participante)",
          "timestamp": "string (opcional, si está disponible en la transcripción)"
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
          "text": "string (cita textual que evidencia el hallazgo)",
          "speakerName": "string",
          "speakerRole": "string"
        }
      ],
      "relatedDimensions": ["string (IDs o nombres de dimensiones relacionadas)"]
    }
  ]
}`;
}
