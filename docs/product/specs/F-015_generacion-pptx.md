# Feature: Generar Presentación PPTX del Diagnóstico

## Contexto

La Presentación Final es el entregable de mayor impacto comercial de AI Compass. Es el deck que el facilitador presenta al comité en la sesión presencial de Etapa 2. Actualmente, el facilitador tiene que crear esta presentación manualmente en PowerPoint, copiando datos del diagnóstico.

Este feature genera automáticamente un PPTX profesional con branding InovaBiz a partir de los datos del diagnóstico, el análisis cross-sesión, y los quick wins. El facilitador descarga el archivo y puede editarlo antes de presentar.

## Datos

### Datos existentes utilizados
- `organizations.maturity_scores` — scores por dimensión para el spider chart
- `cross_session_analyses.dimension_scores` — resúmenes, gaps, evidencia por dimensión
- `cross_session_analyses.quick_win_suggestions` — quick wins con before/after
- `cross_session_analyses.deep_dive_recommendations` — deep dives recomendados
- `cross_session_analyses.committee_recommendation` — composición del comité sugerida
- `emergent_findings` — champions, resistencias, brechas
- `sessions` + `session_questions` — evidencia y citas

### Sin entidades nuevas
El PPTX se genera on-the-fly desde datos existentes.

## Estructura del PPTX (15 slides)

### Slide 1: Portada
- Logo InovaBiz (esquina superior izquierda)
- Logo/nombre del cliente (centrado o esquina superior derecha)
- Título: "Diagnóstico de Madurez en IA"
- Subtítulo: nombre de la organización
- Fecha
- Fondo: color oscuro corporativo InovaBiz

### Slide 2: Contexto
- Título: "¿Por qué estamos aquí?"
- Datos clave: industria, tamaño, etapa actual
- Texto breve del contexto del engagement

### Slide 3: Metodología
- Título: "¿Qué hicimos?"
- Frameworks de referencia (logos/nombres): Anthropic, McKinsey, Microsoft, Google Cloud
- Sesiones realizadas: cantidad, tipos, participantes totales
- Sistema de triple input: preguntas + notas + transcripciones

### Slide 4: Spider Chart
- Título: "Mapa de madurez actual"
- Imagen del radar chart con 6 dimensiones (generada como imagen SVG o PNG server-side)
- Score promedio destacado
- Benchmark de industria si disponible

### Slides 5-10: Una slide por dimensión
- Título: nombre de la dimensión
- Score (badge grande con color)
- Resumen (2-3 oraciones)
- Brechas detectadas (bullets)
- Evidencia/cita destacada (quote box con nombre y rol del speaker)

### Slide 11: Brechas críticas
- Título: "Desalineaciones importantes"
- Lista de hallazgos tipo "misalignment" con citas
- Comparación visión ejecutiva vs realidad operativa

### Slide 12: Mapa de personas
- Título: "Champions y resistencias"
- Champions identificados con nombre, rol, cita
- Resistencias identificadas con descripción y recomendación

### Slide 13: Roadmap de madurez
- Título: "¿Dónde están hoy y dónde pueden llegar?"
- Timeline visual: estado actual → 6 meses → 12 meses → 18 meses
- Niveles de madurez proyectados por dimensión

### Slide 14: Quick Wins recomendados
- Título: "Pilotos propuestos"
- Por cada quick win: título, proceso antes/después, herramienta, nivel de implementación (badge), timeline

### Slide 15: Próximos pasos
- Título: "¿Qué necesitamos del comité?"
- Acciones concretas con responsable
- Fecha propuesta de próxima reunión
- Información de contacto InovaBiz

## Implementación técnica

### Backend: Endpoint de generación

`GET /api/reports/organization/:orgId/presentation.pptx`

Usar librería `pptxgenjs` (NPM) para generar el PPTX en el backend:

```bash
cd backend && npm install pptxgenjs
```

El endpoint:
1. Carga todos los datos necesarios de la BD
2. Crea un PptxGenJS instance con master slide layout
3. Genera cada slide según la estructura
4. Para el Spider Chart: generar una imagen SVG server-side o usar una representación tabular
5. Retorna el archivo como `application/vnd.openxmlformats-officedocument.presentationml.presentation`

### Branding InovaBiz
- Color primario: #1e3a5f (azul oscuro)
- Color secundario: #3b82f6 (azul brillante)
- Color acento: #22c55e (verde)
- Tipografía: Inter o sistema
- Fondo de slides de contenido: #f8fafc (gris claro)
- Fondo de portada: #0f172a (slate-900)
- Texto primario: #1e293b
- Texto secundario: #64748b

### Frontend: Botón de descarga

En DiagnosticReportPage, agregar botón "Descargar PPTX" junto al botón "Descargar Reporte" existente. El botón abre:
```
window.open(`${BASE_URL}/reports/organization/${orgId}/presentation.pptx`)
```

## Lógica de Negocio

- **Validaciones**: Solo generar si hay cross_session_analysis completado. Mostrar error si no hay diagnóstico.
- **Permisos**: Solo facilitador y admin pueden descargar. El PPTX no se comparte directamente con council — el facilitador lo presenta.
- **Generación**: On-the-fly, no se almacena en BD. Cada descarga genera un PPTX fresco con datos actuales.

## Criterios de Done

- [ ] El PPTX se genera y descarga correctamente desde el browser
- [ ] Las 15 slides están presentes con contenido real del diagnóstico
- [ ] El Spider Chart está representado visualmente (imagen o tabla)
- [ ] Cada slide de dimensión tiene score, resumen, gaps y evidencia
- [ ] Quick wins tienen proceso antes/después y nivel de implementación
- [ ] El branding InovaBiz es profesional (colores, tipografía, logos)
- [ ] El archivo se abre correctamente en PowerPoint, Google Slides y Keynote
- [ ] El facilitador puede editar el PPTX después de descargarlo
