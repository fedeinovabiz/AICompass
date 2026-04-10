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

## Won't-Have (fuera de alcance MVP)

### F-014: Etapas 4-5 (Escalamiento y Transformación AI-First)
### F-015: Generación de PPTX avanzado
### F-016: Notificaciones push/email
### F-017: Multi-idioma
### F-018: Benchmark real por industria (requiere datos de múltiples clientes)
### F-019: Integración con herramientas del cliente (Salesforce, Slack, etc.)

---

## Métricas de validación

- Must-Have: 6 features = 33% del total (dentro del límite 30%)
- Should-Have: 4 features
- Could-Have: 3 features
- Won't-Have: 6 features
- Ningún feature individual > 2 semanas

---

*Generado el 2026-04-10. Producto de InovaBiz.*
