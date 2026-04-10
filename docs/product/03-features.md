# Features: AI Compass — Priorización MoSCoW

## Must-Have (sin esto el MVP no funciona)

### F-001: Conducir sesiones de diagnóstico con preguntas guía

- **Origen**: SOL-01.1
- **Descripción**: El facilitador crea sesiones (ejecutiva, operativa, técnica), las preguntas se cargan del catálogo por tipo de sesión y dimensión, responde pregunta por pregunta. Incluye gestión de participantes (nombre, rol, área). Sin esto no hay diagnóstico.
- **Complejidad técnica**: M
- **Valor para usuario**: H
- **Tiempo estimado**: M (1-2 sem)

### F-002: Procesar transcripciones/notas con IA

- **Origen**: SOL-02.1
- **Descripción**: Subir transcripción (.vtt/.srt/texto) o notas del facilitador. La IA extrae respuestas sugeridas con nivel de madurez (1-4), confianza (alto/medio/bajo) y citas textuales con atribución (nombre, rol, timestamp). Diferenciador core del producto. Soporta reprocesamiento cuando se agrega nueva fuente sin tocar respuestas ya aprobadas.
- **Complejidad técnica**: H
- **Valor para usuario**: H
- **Tiempo estimado**: M (1-2 sem)

### F-003: Validar respuestas sugeridas por la IA

- **Origen**: SOL-02.1
- **Descripción**: Panel donde el facilitador aprueba, edita, rechaza o marca como "no mencionado" cada respuesta. Progreso de validación visible ("X de Y preguntas validadas"). Sin validación humana, el diagnóstico no tiene credibilidad.
- **Complejidad técnica**: M
- **Valor para usuario**: H
- **Tiempo estimado**: M (1-2 sem)

### F-004: Generar diagnóstico consolidado (análisis cross-sesión)

- **Origen**: SOL-01.1 + SOL-02.1
- **Descripción**: Después de validar las 3 sesiones core (S1+S2+S3), la IA genera: scores por dimensión, recomendación de composición del comité, deep dives sugeridos, y quick wins con nivel de implementación (prompting/no-code/custom), segmento de cadena de valor, y análisis de retornos decrecientes. Sin esto no hay entregable final.
- **Complejidad técnica**: H
- **Valor para usuario**: H
- **Tiempo estimado**: M (1-2 sem)

### F-005: Visualizar mapa de madurez (Spider Chart)

- **Origen**: SOL-01.1
- **Descripción**: Radar chart de Recharts con las 6 dimensiones mostrando nivel actual (1-4). Opcionalmente superpone benchmark de industria (línea punteada). Es la "foto" que el facilitador presenta al cliente. Incluye cards por dimensión con score, resumen y brechas.
- **Complejidad técnica**: L
- **Valor para usuario**: H
- **Tiempo estimado**: S (<1 sem)

### F-006: Autenticación y autorización por rol

- **Origen**: Infraestructura
- **Descripción**: Login JWT con 3 roles (admin, facilitator, council). Rutas protegidas por rol. El council no accede hasta que el comité se constituye. Admin crea facilitadores. Sin esto nadie entra a la plataforma.
- **Complejidad técnica**: M
- **Valor para usuario**: M
- **Tiempo estimado**: S (<1 sem)

---

## Should-Have (mejora significativa, no bloqueante)

### F-007: Constituir comité con decisiones fundacionales

- **Origen**: SOL-03.1
- **Descripción**: Registrar miembros del comité con roles (sponsor, líder operativo, representantes). Facilitar las 8 decisiones fundacionales. Formalizar constitución con acta. Al constituir, se crean las cuentas de los miembros del AI Council. Importante pero el facilitador puede hacerlo manualmente las primeras veces.
- **Complejidad técnica**: M
- **Valor para usuario**: H
- **Tiempo estimado**: M (1-2 sem)

### F-008: Tracking de pilotos con baseline, métricas e impacto en roles

- **Origen**: SOL-04.1
- **Descripción**: Dashboard de pilotos con: proceso antes/después, herramienta, equipo, Champion. Baseline obligatorio. Métricas semanales con gráfico de evolución (LineChart). Decisión del comité (escalar/iterar/matar). Incluye sección de impacto en roles: rol afectado, % tiempo liberado, nuevas responsabilidades, incentivo propuesto.
- **Complejidad técnica**: M
- **Valor para usuario**: M
- **Tiempo estimado**: M (1-2 sem)

### F-009: Sistema de Red Flags automático

- **Origen**: SOL-05.1
- **Descripción**: Detección automática de riesgos (sponsor ausente, piloto sin baseline, comité sin líder operativo, etc.). 10 reglas con 3 niveles de severidad (warning, alert, block). Banner visible en el layout para facilitador y AI Council.
- **Complejidad técnica**: M
- **Valor para usuario**: H
- **Tiempo estimado**: S (<1 sem)

### F-010: Recomendación de composición del comité

- **Origen**: SOL-03.1
- **Descripción**: La IA sugiere quiénes deben formar el comité basándose en los hallazgos de las sesiones de discovery (champions identificados, personas mencionadas por rol). El facilitador confirma o ajusta.
- **Complejidad técnica**: L (ya sale del cross-analysis)
- **Valor para usuario**: M
- **Tiempo estimado**: S (<1 sem)

---

## Could-Have (nice-to-have)

### F-011: Generación de reportes PDF/PPTX

- **Origen**: SOL-01.1
- **Descripción**: Generar el deck de presentación final y reportes en formato descargable. PPTX es complejo (>2 sem), PDF es más accesible.
- **Complejidad técnica**: H
- **Valor para usuario**: M
- **Tiempo estimado**: L (>2 sem si incluye PPTX)

### F-012: Editor de entregables (ReportBuilder)

- **Origen**: SOL-01.1
- **Descripción**: Editor markdown con preview para que el facilitador edite y publique entregables. Auto-guardado. Flujo de aprobación (borrador -> revisión -> publicado).
- **Complejidad técnica**: M
- **Valor para usuario**: L
- **Tiempo estimado**: M (1-2 sem)

### F-013: Dashboard del AI Council (vista council member)

- **Origen**: SOL-03.1
- **Descripción**: Vista acotada para miembros del comité: mapa de madurez, pilotos, decisiones. Todo en modo lectura excepto participación en decisiones.
- **Complejidad técnica**: L
- **Valor para usuario**: M
- **Tiempo estimado**: S (<1 sem)

---

## Fase 2 — Should-Have (post-MVP, ahora planificados)

### F-014a: Dashboard de escalamiento (Etapa 4)

- **Origen**: Etapa 4 del journey — "Escalar lo exitoso"
- **Descripción**: Cuando un piloto se aprueba para escalar (decisión del comité = "scale"), el facilitador necesita trackear el rollout a más equipos/áreas. Dashboard con: pilotos aprobados para escalar, áreas/equipos target, métricas de adopción a escala (no solo el equipo piloto original), decisiones go/no-go por área, timeline de rollout.
- **Complejidad técnica**: M
- **Valor para usuario**: H
- **Tiempo estimado**: M (1-2 sem)

### F-014b: Herramienta de rediseño de procesos (Etapa 4)

- **Origen**: Etapa 4 del journey — "Rediseñar flujos"
- **Descripción**: Herramienta para mapear procesos end-to-end de la organización y evaluar candidatos a automatización con IA. El facilitador usa los hallazgos del diagnóstico y los resultados de pilotos para identificar más procesos. Para cada proceso: mapeo visual (pasos, actores, tiempo, herramientas), clasificación por nivel de implementación (prompting/no-code/custom), estimación de impacto, priorización con matriz impacto-esfuerzo. La IA sugiere procesos candidatos basándose en los dolores documentados.
- **Complejidad técnica**: H
- **Valor para usuario**: H
- **Tiempo estimado**: M (1-2 sem)

### F-014c: Dashboard de transformación (Etapa 5)

- **Origen**: Etapa 5 del journey — "Transformación AI-First"
- **Descripción**: Vista consolidada del estado de transformación de la organización. KPIs acumulados: total de procesos rediseñados, horas liberadas acumuladas, ROI consolidado de todos los pilotos, evolución del spider chart en el tiempo (comparar scores de hoy vs primer diagnóstico). Catálogo de herramientas IA adoptadas (inventario: herramienta, licencias, equipos que la usan, costo mensual). Evolución de las 8 decisiones fundacionales (¿cambiaron? ¿hay nuevas decisiones?). Gobernanza adaptativa: estado de cumplimiento de políticas.
- **Complejidad técnica**: M
- **Valor para usuario**: M
- **Tiempo estimado**: M (1-2 sem)

### F-015: Generar presentación PPTX del diagnóstico

- **Origen**: Entregable de Etapa 2 — Presentación Final (deck ejecutivo para sesión presencial)
- **Descripción**: Generar un archivo PPTX profesional con branding InovaBiz a partir del diagnóstico completado. El deck sigue la estructura de 15 slides de la spec: (1) Portada con logos, (2) Contexto, (3) Metodología, (4) Spider Chart, (5-10) Una slide por dimensión con hallazgo + evidencia + nivel, (11) Brechas críticas, (12) Mapa de personas (Champions/resistencias), (13) Roadmap de madurez, (14) Quick Wins recomendados, (15) Próximos pasos. Branding: colores corporativos InovaBiz, tipografía Inter/sistema, layouts profesionales diferenciados por tipo de slide. El facilitador puede descargar el PPTX y editarlo antes de presentar.
- **Complejidad técnica**: H
- **Valor para usuario**: H
- **Tiempo estimado**: M (1-2 sem)

### F-018: Benchmark de madurez por industria

- **Origen**: Spider Chart del diagnóstico — línea de comparación
- **Descripción**: Superponer en el Spider Chart una línea punteada de "benchmark de industria" que muestre el promedio de organizaciones similares. Fuente inicial: datos hardcodeados basados en frameworks de referencia (McKinsey State of AI: madurez RAI promedio 2.3/4, Microsoft: 40-50% en nivel 100). A medida que InovaBiz acumula diagnósticos de clientes reales, los datos se enriquecen automáticamente (cada diagnóstico completado alimenta el benchmark anonimizado). Granularidad: por industria + tamaño de empresa. El facilitador ve "su cliente vs el promedio de empresas de Tecnología de 50-200 empleados". Genera flywheel de valor: más clientes → mejor benchmark → más valor → más clientes.
- **Complejidad técnica**: M
- **Valor para usuario**: H
- **Tiempo estimado**: M (1-2 sem)

---

## Won't-Have (fuera de alcance actual)

### F-016: Notificaciones push/email
### F-017: Multi-idioma
### F-019: Integración con herramientas del cliente (Salesforce, Slack, etc.)

---

## Métricas de validación

- Must-Have (MVP): 6 features (F-001 a F-006) — implementados
- Should-Have (MVP): 4 features (F-007 a F-010) — implementados
- Could-Have (MVP): 3 features (F-011 a F-013) — implementados
- Should-Have (Fase 2): 5 features (F-014a, F-014b, F-014c, F-015, F-018) — planificados
- Won't-Have: 3 features
- Ningún feature individual > 2 semanas

---

*Generado el 2026-04-10. Actualizado el 2026-04-10 con Fase 2 (F-014, F-015, F-018). Producto de InovaBiz.*
