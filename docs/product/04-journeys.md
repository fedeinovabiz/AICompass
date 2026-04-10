# User Journeys: AI Compass (solo Must-Have)

---

## F-001 + F-002 + F-003: Diagnóstico completo de una sesión

- **Actor**: Facilitador (InovaBiz)
- **Objetivo**: Obtener diagnóstico validado de una sesión de discovery
- **Precondición**: Organización creada, engagement activo, sesión programada

| Paso | Pantalla | Estado (qué ve) | Acción (qué hace) | Resultado |
|------|----------|------------------|--------------------|-----------|
| 1 | SessionList | Lista de sesiones, S1 en estado "draft" | Click en la sesión ejecutiva | Navega a SessionView |
| 2 | SessionView | Preguntas guía de S1 vacías, sin participantes | Click "+ Agregar participante" | Formulario inline: nombre, rol, área |
| 3 | SessionView | Participantes registrados, preguntas guía | Conduce la sesión, escribe respuestas o toma notas | Notas guardadas con auto-save |
| 4 | SessionView | Sesión con notas, botón "Subir transcripción" | Click "Subir transcripción" | Navega a TranscriptReview |
| 5 | TranscriptReview | Zona de drag & drop vacía | Arrastra archivo .vtt | Preview del texto parseado, conteo de palabras |
| 6 | TranscriptReview | Transcripción cargada, botón "Procesar con IA" | Click "Procesar con IA" | Spinner ~30s con mensaje de progreso |
| 7 | TranscriptReview | Lista de preguntas con sugerencias de la IA | Revisa primera pregunta: ve respuesta, nivel, confianza, citas | Evalúa calidad de la sugerencia |
| 8 | TranscriptReview | QuestionCard con 4 botones de acción | Click "Aprobar" (si correcta) o "Editar" (si necesita ajuste) | Pregunta marcada como validada |

- **Postcondición**: Sesión en estado "validated", respuestas listas para análisis cross-sesión

### Estados alternativos

- **Transcripción corrupta/vacía**: Sistema muestra "No se pudo parsear el archivo. Intente con texto plano." + textarea alternativa
- **IA no responde (timeout 60s)**: "El procesamiento tardó más de lo esperado. ¿Reintentar?" + botón retry
- **Todas las preguntas "no mencionado"**: Warning "Ninguna pregunta fue cubierta por la transcripción. Considere agregar notas del facilitador y reprocesar."
- **Reprocesamiento**: Si ya hay respuestas aprobadas y se sube nueva transcripción, solo se actualizan las pendientes. Las aprobadas no se tocan.

---

## F-004 + F-005: Generar diagnóstico consolidado con Spider Chart

- **Actor**: Facilitador (InovaBiz)
- **Objetivo**: Obtener diagnóstico de madurez consolidado de la organización
- **Precondición**: Las 3 sesiones core (S1 ejecutiva + S2 operativa + S3 técnica) están en estado "validated"

| Paso | Pantalla | Estado (qué ve) | Acción (qué hace) | Resultado |
|------|----------|------------------|--------------------|-----------|
| 1 | MaturityMap | StageMap en Etapa 1, criterio "3 sesiones validadas" cumplido | Click "Generar análisis cross-sesión" | Spinner ~45s, IA procesando |
| 2 | MaturityMap | Spider Chart aparece con 6 dimensiones scored | Revisa scores por dimensión | Ve nivel, resumen y brechas por dimensión |
| 3 | DiagnosticReport | Diagnóstico completo con evidencia por dimensión | Expande cada dimensión para ver citas y gaps | Entiende el estado de la organización |
| 4 | DiagnosticReport | Sección "Quick Wins sugeridos" con nivel de implementación | Revisa cada quick win: proceso antes/después, herramienta, nivel (prompting/no-code/custom) | Selecciona 2-3 para proponer al cliente |
| 5 | DiagnosticReport | Sección "Deep Dives recomendados" | Revisa triggers y justificación | Decide qué deep dives programar |
| 6 | DiagnosticReport | Botón "Publicar para el Comité" | Click "Publicar" (confirma en modal) | Entregable visible para miembros del AI Council |

- **Postcondición**: Organización tiene diagnóstico publicado, maturity scores actualizados, lista para diseñar comité

### Estados alternativos

- **Menos de 3 sesiones validadas**: Botón "Generar análisis" deshabilitado con tooltip "Requiere S1 + S2 + S3 validadas"
- **IA genera scores inconsistentes**: El facilitador puede ajustar manualmente cada score antes de publicar
- **Sin benchmark disponible**: Spider Chart muestra solo la línea de la organización, sin comparación de industria

---

## F-006: Flujo de autenticación y primer acceso

- **Actor**: Facilitador (InovaBiz)
- **Objetivo**: Acceder a la plataforma y llegar al dashboard
- **Precondición**: Cuenta creada por el admin

| Paso | Pantalla | Estado (qué ve) | Acción (qué hace) | Resultado |
|------|----------|------------------|--------------------|-----------|
| 1 | LoginPage | Formulario email + contraseña | Escribe credenciales, click "Ingresar" | Autenticación JWT |
| 2 | Dashboard | Lista de organizaciones (vacía si es primera vez) | Click "Nueva organización" | Modal de creación |
| 3 | Dashboard | Modal con campos: nombre, industria, tamaño, contacto | Llena datos, submit | Organización creada, navega a OrganizationPage |
| 4 | OrganizationPage | Etapa 1, sin sesiones, sin engagement | Click "Iniciar engagement" | Engagement creado, puede crear sesiones |

- **Postcondición**: Facilitador tiene organización y engagement activo, listo para crear primera sesión

### Estados alternativos

- **Credenciales incorrectas**: Mensaje "Credenciales incorrectas" bajo el campo de contraseña, formulario no se limpia
- **Token expirado (durante uso)**: Redirige a /login con mensaje "Su sesión expiró, por favor ingrese nuevamente"
- **Rol council intenta acceder antes de constitución**: Mensaje "Su acceso estará disponible una vez que el comité sea constituido"

---

## Journey end-to-end: Del primer contacto al diagnóstico publicado

- **Actor**: Facilitador (InovaBiz)
- **Objetivo**: Completar Etapa 1 completa para un cliente nuevo
- **Precondición**: Cliente firmó contrato de consultoría

| Paso | Pantalla | Estado | Acción | Resultado |
|------|----------|--------|--------|-----------|
| 1 | Dashboard | Sin organizaciones | Crea organización + engagement | Org en Etapa 1 |
| 2 | SessionList | Sin sesiones | Crea sesión ejecutiva (S1) | S1 con preguntas de Estrategia y Gobernanza |
| 3 | SessionView | S1 con preguntas guía | Conduce sesión, sube transcripción, procesa con IA, valida | S1 validated |
| 4 | SessionList | S1 validated | Repite para S2 (operativa) y S3 (técnica) | S2 y S3 validated |
| 5 | MaturityMap | 3 sesiones validated | Genera análisis cross-sesión | Spider Chart + diagnóstico |
| 6 | DiagnosticReport | Diagnóstico completo | Revisa, ajusta scores si necesario | Diagnóstico listo |
| 7 | DiagnosticReport | Quick wins y deep dives sugeridos | Selecciona, publica para comité | Etapa 1 completa |

- **Postcondición**: Organización lista para avanzar a Etapa 2 (Descubrimiento y Priorización) o directamente a constitución del comité

---

*Generado el 2026-04-10. Producto de InovaBiz.*
