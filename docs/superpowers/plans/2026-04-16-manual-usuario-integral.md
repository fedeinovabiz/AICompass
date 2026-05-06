# Manual de Usuario Integral - AICompass

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear un manual de usuario integral que explique no solo CÓMO usar AICompass, sino POR QUÉ cada funcionalidad existe, qué IMPACTO tiene en el negocio, y CUÁNDO usarla correctamente. Orientado a cualquier persona, no solo técnicos.

**Architecture:** Documento Word (.docx) con branding InovaBiz generado con la skill `documentos-inovabiz`. Estructura narrativa organizada por las 5 etapas del framework (no por features técnicas). Cada sección sigue el patrón: Contexto de negocio → Qué hace la funcionalidad → Cómo usarla paso a paso → Impacto esperado → Tips de experto.

**Tech Stack:** Markdown como fuente → conversión a .docx con branding InovaBiz

**Fuentes existentes que se integran:**
- `ai-compass/docs/manual-de-usuario.md` (774 líneas) — pasos técnicos de cada feature
- `ai-compass/docs/aicompass-vision-estrategica.md` (507 líneas) — contexto de negocio y problemática
- `ai-compass/docs/user-journeys.md` (676 líneas) — flujos de usuario y transiciones
- `ai-compass/src/constants/stages.ts` — definición de etapas y criterios
- `ai-compass/src/constants/redFlags.ts` — reglas de alertas
- `ai-compass/src/constants/dimensions.ts` — dimensiones de madurez

---

## Diferencia clave vs manual existente

| Manual actual (referencia técnica) | Manual nuevo (guía integral) |
|---|---|
| "Haz clic en Nueva Sesión" | "Las sesiones de discovery son el corazón del diagnóstico. Sin ellas, cualquier recomendación de IA sería una adivinanza costosa. Así es como funcionan..." |
| Organizado por features (20 secciones) | Organizado por journey de transformación (5 etapas) |
| Dice QUÉ hacer | Explica POR QUÉ hacerlo y QUÉ PASA si no lo haces |
| Sin contexto de negocio | Cada sección abre con el problema que resuelve |
| Sin mejores prácticas | Incluye tips de experto y anti-patrones |
| Lista rutas técnicas (`/org/{orgId}/sessions`) | Describe navegación en lenguaje humano |

---

## Estructura del documento

```
PORTADA
  - AICompass: Manual de Usuario Integral
  - "De diagnóstico a transformación AI-First"
  - Versión, fecha, logo InovaBiz

TABLA DE CONTENIDOS

PARTE I: ANTES DE EMPEZAR
  Cap 1. ¿Qué es AICompass y por qué lo necesitas?
  Cap 2. Primeros pasos: acceso, roles y navegación
  Cap 3. El Framework de 5 Etapas (visión general)
  Cap 4. Las 6 Dimensiones de Madurez (conceptos clave)

PARTE II: ETAPA 1 — DIAGNÓSTICO Y COMITÉ (Semanas 1-3)
  Cap 5. Sesiones de Discovery: la base de todo
  Cap 6. Procesamiento con IA: de transcripciones a insights
  Cap 7. El Mapa de Madurez: entendiendo dónde estás
  Cap 8. Formación del Comité de IA
  Cap 9. Las 8 Decisiones Fundacionales

PARTE III: ETAPA 2 — DESCUBRIMIENTO Y PRIORIZACIÓN (Semanas 3-5)
  Cap 10. Reporte de Diagnóstico y Quick Wins
  Cap 11. Critical User Journeys (CUJ)
  Cap 12. Deep Dives en dimensiones débiles

PARTE IV: ETAPA 3 — PILOTOS Y QUICK WINS (Meses 1-3)
  Cap 13. Creación y diseño de pilotos
  Cap 14. Workflow Design: el antes y después
  Cap 15. Métricas, baseline y tracking de impacto
  Cap 16. Champions y gestión del cambio
  Cap 17. Value Engineering: priorizando con datos
  Cap 18. Decisión del Comité: escalar, iterar o cancelar

PARTE V: ETAPA 4 — ESCALAMIENTO Y REDISEÑO (Meses 3-9)
  Cap 19. Planes de escalamiento
  Cap 20. Mapeo y rediseño de procesos
  Cap 21. Áreas departamentales y mini-assessments

PARTE VI: ETAPA 5 — TRANSFORMACIÓN AI-FIRST (Meses 9-18+)
  Cap 22. Dashboard de Transformación
  Cap 23. Catálogo de herramientas IA
  Cap 24. Evolución de gobernanza

PARTE VII: HERRAMIENTAS TRANSVERSALES
  Cap 25. Red Flags: el sistema de alertas preventivas
  Cap 26. Report Builder: generación de entregables
  Cap 27. Council Dashboard: la vista del comité

APÉNDICES
  A. Glosario de términos
  B. Tabla de referencia rápida por rol
  C. Preguntas frecuentes (FAQ)
  D. Resolución de problemas comunes
```

---

## Plan de implementación por tareas

### Task 1: PARTE I — Antes de Empezar (Capítulos 1-4)

**Files:**
- Create: `ai-compass/docs/manual-usuario-integral.md`
- Reference: `ai-compass/docs/aicompass-vision-estrategica.md`
- Reference: `ai-compass/src/constants/stages.ts`
- Reference: `ai-compass/src/constants/dimensions.ts`

**Contenido detallado de cada capítulo:**

- [ ] **Step 1: Capítulo 1 — ¿Qué es AICompass y por qué lo necesitas?**

Escribir (~600 palabras):
- Párrafo de apertura: el problema que resuelve (72% dice usar IA, solo 15% lo hace estructuradamente)
- Qué es AICompass en una oración (no técnica)
- Los 5 problemas que resuelve (de la visión estratégica, reescritos para el usuario):
  1. Diagnósticos superficiales → Diagnóstico basado en evidencia
  2. Pilotos sin rumbo → Pilotos con métricas y decisiones claras
  3. Gobernanza prematura o ausente → Gobernanza progresiva
  4. Abismo diagnóstico-acción → De hallazgo a piloto en semanas
  5. Dependencia del consultor → Todo el contexto vive en la plataforma
- Para quién es: organizaciones de 50-500+ empleados que quieren pasar de "experimentar con ChatGPT" a "transformar su operación"
- Qué NO es: no es un chatbot, no es un gestor de proyectos, no reemplaza la estrategia humana

- [ ] **Step 2: Capítulo 2 — Primeros pasos**

Escribir (~500 palabras):
- Cómo acceder (URL, navegador recomendado)
- Inicio de sesión paso a paso
- Los 3 roles explicados con analogías de negocio:
  - **Admin/Facilitador**: "El consultor que guía la transformación. Tiene acceso total para crear sesiones, gestionar pilotos y generar reportes."
  - **Miembro del Comité (Council)**: "El ejecutivo que toma decisiones. Ve dashboards, aprueba pilotos y monitorea red flags sin necesidad de operar el sistema."
- Mapa de navegación visual (describir la barra lateral y cómo cambia según la etapa)
- Tip: "El sistema adapta las opciones del menú según la etapa en la que está la organización. No te preocupes si no ves todas las opciones — aparecerán cuando sea el momento correcto."

- [ ] **Step 3: Capítulo 3 — El Framework de 5 Etapas**

Escribir (~800 palabras):
- Explicar la filosofía: "No se puede saltar etapas. Cada una construye sobre la anterior."
- Para cada etapa, una tabla con:
  | Etapa | Nombre | Duración | Qué se logra | Analogía |
  |-------|--------|----------|-------------|----------|
  | 1 | Diagnóstico y Comité | Sem 1-3 | Saber dónde estamos y formar el equipo | "La radiografía antes de la cirugía" |
  | 2 | Descubrimiento | Sem 3-5 | Identificar oportunidades concretas | "Elegir las batallas que vamos a ganar" |
  | 3 | Pilotos | Meses 1-3 | Probar, medir, decidir | "El laboratorio controlado" |
  | 4 | Escalamiento | Meses 3-9 | Llevar lo exitoso a toda la org | "De piloto a producción" |
  | 5 | Transformación | Meses 9-18+ | Operar como organización AI-First | "El nuevo normal" |
- Criterios de avance: explicar que el sistema muestra checkmarks verdes y qué significa cada criterio
- Anti-patrón: "El error más común es querer saltar a pilotos sin diagnóstico. Sin evidencia, estarás automatizando los procesos equivocados."

- [ ] **Step 4: Capítulo 4 — Las 6 Dimensiones de Madurez**

Escribir (~600 palabras):
- Explicar por qué 6 y no 3 o 10: "Estas dimensiones cubren todo lo que una organización necesita para que la IA funcione — no solo la tecnología."
- Para cada dimensión:
  - **Estrategia**: "¿La dirección sabe hacia dónde va con IA? Sin visión, cada área hace lo suyo."
  - **Procesos**: "¿Están documentados los procesos? No se puede automatizar lo que no se entiende."
  - **Datos**: "¿Los datos son accesibles y confiables? La IA es tan buena como los datos que le das."
  - **Tecnología**: "¿Tienen la infraestructura? No se necesita lo último, pero sí lo básico."
  - **Cultura**: "¿La gente está lista? El 70% de los fracasos en transformación son por resistencia al cambio."
  - **Gobernanza**: "¿Hay reglas claras? Sin políticas, la IA se convierte en riesgo."
- Escala 1-4 explicada con ejemplos concretos para cada nivel
- El spider chart: qué significa cuando una dimensión está baja

- [ ] **Step 5: Guardar progreso parcial y verificar estructura**

Guardar el archivo markdown con los 4 capítulos.
Verificar que la estructura narrativa fluye y no repite contenido.

---

### Task 2: PARTE II — Etapa 1: Diagnóstico y Comité (Capítulos 5-9)

**Files:**
- Modify: `ai-compass/docs/manual-usuario-integral.md`
- Reference: `ai-compass/docs/manual-de-usuario.md` (secciones 4-8)
- Reference: `ai-compass/src/constants/questions.ts`

- [ ] **Step 1: Capítulo 5 — Sesiones de Discovery**

Escribir (~800 palabras):
- **Por qué importa**: "El 80% de los diagnósticos de IA fallan porque se basan en la intuición del consultor. Las sesiones de discovery capturan la voz real de la organización — desde el CEO hasta el operador."
- **Los 3 tipos de sesión y cuándo usar cada uno**:
  - Ejecutiva: "Para entender la visión y las barreras desde arriba"
  - Operativa: "Para descubrir los procesos reales, no los del manual"
  - Técnica: "Para evaluar la capacidad tecnológica real"
- **Paso a paso**: crear sesión, agregar participantes, tomar notas, responder preguntas
- **Impacto**: "Al completar 3 sesiones (una de cada tipo), tendrás un mapa multidimensional de la organización que ninguna entrevista tradicional puede igualar."
- **Tip de experto**: "No hagas las 3 sesiones el mismo día. La sesión operativa debe hacerse después de la ejecutiva — te permite validar si lo que dice la dirección coincide con la realidad."

- [ ] **Step 2: Capítulo 6 — Procesamiento con IA**

Escribir (~600 palabras):
- **Por qué importa**: "Un facilitador humano puede capturar el 60% de lo que se dice en una sesión. La IA procesa el 100% y detecta patrones que un humano no vería."
- **Cómo funciona**: subir transcripción o pegar texto → la IA genera respuestas sugeridas con citaciones exactas
- **El flujo de validación**: aprobar, editar, rechazar, no mencionada
- **Impacto**: "Cada respuesta viene con la cita textual de quién lo dijo, en qué rol y contexto. Esto convierte opiniones en evidencia auditable."
- **Anti-patrón**: "Nunca apruebes todas las sugerencias de la IA sin leerlas. La IA es un asistente, no un oráculo. Tu juicio como facilitador es insustituible."

- [ ] **Step 3: Capítulo 7 — El Mapa de Madurez**

Escribir (~500 palabras):
- **Por qué importa**: "Sin un diagnóstico cuantificado, la transformación es un acto de fe. El mapa de madurez convierte percepciones subjetivas en datos comparables."
- **Cómo leerlo**: spider chart, barras de progreso, comparación con benchmarks
- **Qué hacer con los resultados**: dimensiones en rojo = deep dives, dimensiones en verde = oportunidades de quick wins
- **Impacto**: "Este mapa es el baseline contra el cual vas a medir todo el progreso. En la Etapa 5, lo compararás con el estado actual para demostrar ROI."

- [ ] **Step 4: Capítulo 8 — Formación del Comité de IA**

Escribir (~700 palabras):
- **Por qué importa**: "El predictor #1 de fracaso en transformación IA es la ausencia de gobernanza. El comité no es burocracia — es el grupo que toma decisiones rápidas y coherentes."
- **Los 5 roles explicados con impacto de negocio**:
  - Sponsor: "Sin esta persona, no hay presupuesto ni eliminación de obstáculos."
  - Líder Operativo: "Dedica 30-50% de su tiempo. Si no lo tiene, los pilotos mueren de inanición."
  - Representante de Negocio: "Asegura que la IA resuelva problemas reales, no problemas inventados por IT."
  - Representante de TI: "Evalúa viabilidad técnica antes de que el comité se ilusione."
  - Gestión del Cambio: "La persona que convierte resistentes en aliados."
- **Paso a paso**: diseñar comité, asignar miembros, usar sugerencias de IA
- **Anti-patrón**: "Comités de más de 7 personas se paralizan. El sistema te alertará con un red flag si excedes este número."

- [ ] **Step 5: Capítulo 9 — Las 8 Decisiones Fundacionales**

Escribir (~600 palabras):
- **Por qué importa**: "Estas 8 preguntas son las que separan a las organizaciones que experimentan con IA de las que se transforman. Responderlas crea alineamiento ejecutivo."
- **Las 8 decisiones con ejemplo de respuesta para cada una**:
  1. ¿Qué significa IA para nosotros? → "Herramienta para liberar tiempo en procesos repetitivos"
  2. ¿Qué procesos son elegibles? → "Ventas, operaciones y atención al cliente"
  3. ¿Centralizado o distribuido? → "Centralizado en comité, ejecución por áreas"
  4. ¿Quién decide qué? → "Sponsor aprueba presupuesto, líder operativo decide pilotos"
  5. ¿Cómo priorizamos? → "ROI estimado × facilidad de implementación"
  6. ¿Cómo gestionamos el cambio? → "Champions por área + comunicación quincenal"
  7. ¿Qué ROI esperamos? → "30% reducción en tiempo de procesos target en 6 meses"
  8. ¿Qué viene después de los pilotos? → "Escalar a 3 áreas si se demuestra impacto"
- **Impacto**: "Estas decisiones se revisan en la Etapa 5 como 'Evolución de Gobernanza' — verás cómo evolucionaron con los aprendizajes."

- [ ] **Step 6: Guardar y verificar Parte II**

---

### Task 3: PARTE III — Etapa 2: Descubrimiento y Priorización (Capítulos 10-12)

**Files:**
- Modify: `ai-compass/docs/manual-usuario-integral.md`
- Reference: `ai-compass/docs/manual-de-usuario.md` (secciones 9-10)

- [ ] **Step 1: Capítulo 10 — Reporte de Diagnóstico y Quick Wins**

Escribir (~700 palabras):
- **Por qué importa**: "Este es el momento donde el diagnóstico se convierte en acción. El reporte no es un PDF que se archiva — es la hoja de ruta de los próximos 3-6 meses."
- **Qué contiene**: análisis cross-sesión, scores promedio, brechas, evidencia con citaciones, quick wins sugeridos con antes/después
- **Cómo interpretar los quick wins**: herramienta sugerida, nivel de implementación (prompting vs no-code vs custom), timeline
- **Impacto**: "En una sesión de 2 horas con el comité, presentarás evidencia de dónde están las mayores oportunidades y el comité seleccionará los 2-3 pilotos iniciales."
- **Tip**: "Los quick wins más exitosos son los que combinan alto impacto con baja complejidad. El sistema los ordena por score para ayudarte."

- [ ] **Step 2: Capítulo 11 — Critical User Journeys (CUJ)**

Escribir (~500 palabras):
- **Por qué importa**: "Antes de automatizar una tarea, necesitas entender el journey completo. Un error común es automatizar un paso sin considerar cómo afecta al resto del proceso."
- **Cuándo usarlo**: para pilotos que involucran múltiples pasos o actores
- **Paso a paso**: crear CUJ, mapear pasos con actores y tiempos, identificar pain points, marcar candidatos para IA
- **Impacto**: "El CUJ te ayuda a diseñar pilotos que resuelven el problema completo, no solo un síntoma."

- [ ] **Step 3: Capítulo 12 — Deep Dives en dimensiones débiles**

Escribir (~400 palabras):
- **Por qué importa**: "Si una dimensión está en rojo (nivel 1), necesitas entender por qué antes de actuar. Un deep dive es una sesión focada en esa dimensión."
- **Cuándo se activan**: automáticamente cuando el diagnóstico muestra dimensiones en nivel 1
- **Cómo funcionan**: sesión tipo "deep-dive" con preguntas específicas de la dimensión
- **Impacto**: "Convierte un score genérico de '1' en un plan de acción específico."

- [ ] **Step 4: Guardar y verificar Parte III**

---

### Task 4: PARTE IV — Etapa 3: Pilotos y Quick Wins (Capítulos 13-18)

**Files:**
- Modify: `ai-compass/docs/manual-usuario-integral.md`
- Reference: `ai-compass/docs/manual-de-usuario.md` (secciones 11-12)

- [ ] **Step 1: Capítulo 13 — Creación y diseño de pilotos**

Escribir (~600 palabras):
- **Por qué importa**: "Un piloto bien diseñado demuestra valor en semanas. Uno mal diseñado consume meses sin conclusiones. La diferencia está en la estructura."
- **Qué define un buen piloto**: título claro, proceso específico, herramienta definida, equipo acotado (5-15 personas), champion asignado
- **Paso a paso**: crear piloto, completar datos, vincular a CUJ (opcional)
- **Los 6 estados del piloto**: diseñando → activo → evaluando → escalar/iterar/cancelar
- **Anti-patrón**: "No lances más de 3 pilotos simultáneos en tu primer intento. El sistema permite hasta 5, pero la atención se diluye."

- [ ] **Step 2: Capítulo 14 — Workflow Design: el antes y después**

Escribir (~500 palabras):
- **Por qué importa**: "Si no documentes el proceso actual, no podrás medir si lo mejoraste. Si no diseñas el proceso nuevo, estás improvisando."
- **Las 5 secciones del workflow design**: flujo antes, flujo después, puntos de validación humana, pasos eliminados, pasos nuevos
- **Impacto**: "Este diseño es tu contrato con el equipo. Todos saben qué cambia y qué se mantiene. Reduce la resistencia al cambio."
- **Tip**: "Siempre incluye al menos un punto de validación humana. La IA sin supervisión genera confianza ciega."

- [ ] **Step 3: Capítulo 15 — Métricas, baseline y tracking**

Escribir (~700 palabras):
- **Por qué importa**: "Sin baseline no hay impacto. Si no mediste cuántas horas tomaba antes, no puedes decir cuánto ahorraste."
- **Definir baseline**: nombre de la métrica, unidad, valor actual
- **Red flag automático**: "El sistema te alertará si activas un piloto sin baseline definido. Es un bloqueante — no puedes continuar sin él."
- **Tracking periódico**: registrar valores cada 1-2 semanas, métricas de adopción (% de usuarios activos)
- **Los gráficos**: línea de tendencia con baseline como referencia, adopción como porcentaje
- **Impacto**: "En 3-4 semanas tendrás datos suficientes para presentar al comité: 'Reducimos X en Y%'. Eso es lo que convierte un experimento en un caso de negocio."

- [ ] **Step 4: Capítulo 16 — Champions y gestión del cambio**

Escribir (~500 palabras):
- **Por qué importa**: "La tecnología no falla — las personas la rechazan. Los champions son tu red de aliados dentro del equipo."
- **Qué hace un champion**: peer training, soporte primer nivel, feedback loop, documentación de prompts
- **Ratio ideal**: 1 champion por cada 50 usuarios
- **Impacto**: "Los pilotos con champions tienen 3x más adopción que los que dependen solo de capacitación formal."

- [ ] **Step 5: Capítulo 17 — Value Engineering**

Escribir (~500 palabras):
- **Por qué importa**: "No todos los pilotos valen la pena. Value engineering te ayuda a invertir donde el retorno es mayor."
- **Las 4 variables**: P&L (impacto financiero), Effort (esfuerzo), Risk (riesgo), Time-to-Value (tiempo)
- **El score**: fórmula explicada en lenguaje simple ("Cuánto ganas vs cuánto cuesta vs cuánto riesgo vs cuánto tardas")
- **Código de colores**: rojo (<40), amarillo (40-70), verde (>70)
- **Impacto**: "Presenta la matriz al comité para que las decisiones de inversión sean basadas en datos, no en quién grita más fuerte."

- [ ] **Step 6: Capítulo 18 — Decisión del Comité**

Escribir (~500 palabras):
- **Por qué importa**: "Un piloto sin decisión es peor que un piloto cancelado. La indecisión genera confusión, desmotivación y pérdida de momentum."
- **Las 3 opciones**: escalar (llevar a más áreas), iterar (ajustar y re-evaluar), cancelar (liberar recursos)
- **Cuándo decidir**: después de 4-8 semanas con datos de tracking
- **Impacto**: "Esta decisión documentada es el puente entre Etapa 3 y Etapa 4. Sin ella, no se puede avanzar."
- **Red flag**: "Si pasan más de 8 semanas sin decisión, el sistema genera una alerta bloqueante."

- [ ] **Step 7: Guardar y verificar Parte IV**

---

### Task 5: PARTE V — Etapa 4: Escalamiento (Capítulos 19-21)

**Files:**
- Modify: `ai-compass/docs/manual-usuario-integral.md`
- Reference: `ai-compass/docs/manual-de-usuario.md` (secciones 13-15)

- [ ] **Step 1: Capítulo 19 — Planes de escalamiento**

Escribir (~600 palabras):
- **Por qué importa**: "Escalar no es 'hacer lo mismo pero más grande'. Cada área tiene contexto diferente. Un plan de escalamiento define quién, cuándo y cómo."
- **Qué incluye**: piloto base, áreas objetivo (nombre, tamaño, fecha), usuarios totales
- **Métricas de escalamiento**: adopción por área, usuarios activos, impacto por área
- **Los estados**: planning → active → completed / paused
- **Impacto**: "El sistema te muestra la curva de adopción por área. Si un área se estanca, lo detectas antes de que sea un problema."

- [ ] **Step 2: Capítulo 20 — Mapeo y rediseño de procesos**

Escribir (~600 palabras):
- **Por qué importa**: "En Etapa 4, ya no estás probando — estás rediseñando procesos completos. El mapeo asegura que no automatices el pasado."
- **Columna ANTES y DESPUÉS**: pasos, actores, herramientas, tiempos, candidatos IA
- **Niveles de implementación**: prompting (más simple), no-code (intermedio), custom (más complejo)
- **Métricas automáticas**: horas ahorradas/semana, priority score
- **Convertir a piloto**: "Si diseñas un proceso nuevo, puedes convertirlo directamente en un piloto."
- **Anti-patrón**: "El red flag 'Automatizando el pasado' se activa cuando marcas un piloto como digitalización directa sin rediseño. Siempre pregúntate: ¿se puede lograr el resultado de otra forma?"

- [ ] **Step 3: Capítulo 21 — Áreas departamentales y mini-assessments**

Escribir (~500 palabras):
- **Por qué importa**: "Los scores organizacionales son promedios. Un área puede estar en nivel 4 mientras otra está en nivel 1. Sin assessments por área, escalas a ciegas."
- **Cómo funciona**: crear área → hereda scores → hacer mini-assessment (12 preguntas rápidas, 2 por dimensión)
- **Los 3 estados**: heredado, mini-assessed, full-assessed
- **Red flag**: "Si tienes 2+ pilotos activos en un área con scores heredados, el sistema te avisa. Haz el mini-assessment."
- **Impacto**: "En 15 minutos de mini-assessment, sabrás si esa área está lista para escalar o necesita preparación adicional."

- [ ] **Step 4: Guardar y verificar Parte V**

---

### Task 6: PARTE VI — Etapa 5: Transformación AI-First (Capítulos 22-24)

**Files:**
- Modify: `ai-compass/docs/manual-usuario-integral.md`
- Reference: `ai-compass/docs/manual-de-usuario.md` (secciones 16-17)

- [ ] **Step 1: Capítulo 22 — Dashboard de Transformación**

Escribir (~600 palabras):
- **Por qué importa**: "Este dashboard es tu reporte ejecutivo permanente. Resume todo el viaje en 4 KPIs y una comparación de madurez."
- **Los 4 KPIs**: procesos rediseñados, horas liberadas, ROI estimado, herramientas IA activas
- **Evolución de madurez**: comparación spider chart inicial vs actual
- **Impacto**: "Cuando presentes al board directivo, este dashboard es todo lo que necesitas. Muestra de dónde vinimos y dónde estamos."

- [ ] **Step 2: Capítulo 23 — Catálogo de herramientas IA**

Escribir (~400 palabras):
- **Por qué importa**: "Sin un inventario centralizado, cada área adopta herramientas sin coordinación. Eso genera duplicación de costos y riesgo de seguridad."
- **Qué registrar**: nombre, categoría (LLM, no-code, custom, analytics), licencias, costo mensual, equipos usando
- **Estados**: evaluando → activa → deprecada
- **Impacto**: "Visibilidad total del gasto en IA y quién usa qué. Evita el 'shadow AI'."

- [ ] **Step 3: Capítulo 24 — Evolución de gobernanza**

Escribir (~400 palabras):
- **Por qué importa**: "Las reglas que definiste en la Etapa 1 evolucionan con los aprendizajes. Documentar esos cambios muestra madurez organizacional."
- **Cómo funciona**: seleccionar decisión fundacional original, registrar el cambio, quién lo decidió
- **Ejemplo real**: "Decisión #3 pasó de 'No usar datos con IA externa' a 'Datos de clientes permitidos en ChatGPT Team (instancia privada)' — porque aprendimos que es seguro."
- **Impacto**: "Esta sección demuestra al board que la gobernanza no es estática — evoluciona con la organización."

- [ ] **Step 4: Guardar y verificar Parte VI**

---

### Task 7: PARTE VII — Herramientas Transversales (Capítulos 25-27)

**Files:**
- Modify: `ai-compass/docs/manual-usuario-integral.md`
- Reference: `ai-compass/docs/manual-de-usuario.md` (secciones 18-20)
- Reference: `ai-compass/backend/src/constants/redFlags.ts`

- [ ] **Step 1: Capítulo 25 — Red Flags: el sistema de alertas preventivas**

Escribir (~800 palabras):
- **Por qué importa**: "Los red flags son el sistema inmune de tu transformación. Detectan problemas antes de que se conviertan en fracasos."
- **Los 3 niveles de severidad con ejemplos reales**:
  - **Warning (amarillo)**: "Piloto sin CUJ mapeado — no bloquea pero recomienda acción"
  - **Alert (naranja)**: "Adopción < 30% después de 4 semanas — requiere atención urgente"
  - **Block (rojo)**: "Sin sponsor ejecutivo — bloquea el avance hasta resolverse"
- **Los red flags más importantes por etapa** (tabla resumen de los 17 red flags)
- **Cómo resolver**: ingresar resolución, o hacer override con justificación (solo para warnings/alerts)
- **Impacto**: "Las organizaciones que atienden red flags en las primeras 48 horas tienen 5x más probabilidad de éxito en sus pilotos."

- [ ] **Step 2: Capítulo 26 — Report Builder**

Escribir (~500 palabras):
- **Por qué importa**: "Los entregables son la moneda de comunicación con el comité y los stakeholders. Un reporte bien estructurado convierte datos en decisiones."
- **Los 9 tipos de entregable** con cuándo usar cada uno
- **Cómo funciona**: editor markdown con preview, auto-guardado, publicación
- **Exportación**: HTML, PDF, PowerPoint
- **Tip**: "Usa el tipo 'Evaluación de piloto' antes de cada reunión del comité. Resume métricas, adopción y recomendación en un formato ejecutivo."

- [ ] **Step 3: Capítulo 27 — Council Dashboard**

Escribir (~400 palabras):
- **Por qué importa**: "Los miembros del comité necesitan visibilidad sin complejidad. El Council Dashboard les da exactamente eso."
- **Qué ven**: organización, madurez, pilotos activos, comité, red flags, reportes
- **Es de solo lectura**: no pueden modificar datos
- **Impacto**: "El comité puede revisar el estado en 5 minutos antes de cada reunión. No necesitan que el facilitador les prepare un resumen."

- [ ] **Step 4: Guardar y verificar Parte VII**

---

### Task 8: Apéndices y cierre

**Files:**
- Modify: `ai-compass/docs/manual-usuario-integral.md`

- [ ] **Step 1: Apéndice A — Glosario de términos**

Escribir (~30 términos):
- AICompass, AI Operating Level, Baseline, Benchmark, Champion, Comité de IA, CUJ, Dashboard, Decisiones Fundacionales, Deep Dive, Dimensión de Madurez, Engagement, Escalamiento, Facilitador, Gobernanza, Quick Win, Red Flag, ROI, Score, Sesión de Discovery, Spider Chart, Sponsor, Stage Map, Tracking, Transcripción, Value Engineering, Workflow Design

- [ ] **Step 2: Apéndice B — Tabla de referencia rápida por rol**

Tabla de 3 columnas:
| Acción | Facilitador | Council |
|--------|-------------|---------|
| Ver dashboard | Sí | Sí (solo su org) |
| Crear sesiones | Sí | No |
| Aprobar respuestas IA | Sí | No |
| ... (completar ~20 acciones) |

- [ ] **Step 3: Apéndice C — Preguntas frecuentes (FAQ)**

Escribir ~15 preguntas frecuentes:
- "¿Puedo volver a una etapa anterior?"
- "¿Qué pasa si la IA genera una respuesta incorrecta?"
- "¿Cuántos pilotos puedo tener al mismo tiempo?"
- "¿Puedo editar los scores de madurez manualmente?"
- "¿Qué pasa si el sponsor cambia de posición?"
- etc.

- [ ] **Step 4: Apéndice D — Resolución de problemas comunes**

Escribir ~10 problemas con solución:
- "La sesión no muestra respuestas de IA" → Verificar que se subió transcripción y se hizo clic en Procesar
- "No puedo avanzar de etapa" → Revisar criterios pendientes y red flags bloqueantes
- "El piloto muestra red flag de baseline" → Definir métricas antes de activar
- etc.

- [ ] **Step 5: Guardar versión final completa**

- [ ] **Step 6: Commit**

```bash
git add ai-compass/docs/manual-usuario-integral.md
git commit -m "docs: manual de usuario integral con contexto de negocio e impacto"
```

---

### Task 9: Generar documento Word con branding InovaBiz

**Files:**
- Reference: `ai-compass/docs/manual-usuario-integral.md`
- Create: `ai-compass/docs/Manual-de-Usuario-AICompass.docx`

- [ ] **Step 1: Usar skill documentos-inovabiz para generar el .docx**

Invocar la skill `documentos-inovabiz` con el contenido del manual para generar un documento Word profesional con:
- Portada oscura con branding InovaBiz
- Tabla de contenidos
- Headers y footers corporativos
- Tablas estilizadas
- Tipografía profesional

- [ ] **Step 2: Verificar el documento generado**

- [ ] **Step 3: Commit final**

```bash
git add ai-compass/docs/Manual-de-Usuario-AICompass.docx
git commit -m "docs: manual de usuario integral en formato Word con branding InovaBiz"
```

---

## Estimación

| Task | Contenido | Palabras aprox |
|------|-----------|---------------|
| 1 | Parte I: Antes de empezar (Cap 1-4) | ~2,500 |
| 2 | Parte II: Etapa 1 (Cap 5-9) | ~3,200 |
| 3 | Parte III: Etapa 2 (Cap 10-12) | ~1,600 |
| 4 | Parte IV: Etapa 3 (Cap 13-18) | ~3,300 |
| 5 | Parte V: Etapa 4 (Cap 19-21) | ~1,700 |
| 6 | Parte VI: Etapa 5 (Cap 22-24) | ~1,400 |
| 7 | Parte VII: Transversales (Cap 25-27) | ~1,700 |
| 8 | Apéndices | ~2,000 |
| 9 | Generación Word | — |
| **Total** | **27 capítulos + 4 apéndices** | **~17,400 palabras (~45 páginas)** |
