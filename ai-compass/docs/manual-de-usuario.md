# Manual de Usuario - AICompass

Manual paso a paso de todas las funcionalidades de la plataforma AICompass.

---

## Tabla de Contenidos

1. [Autenticación y Acceso](#1-autenticacion-y-acceso)
2. [Dashboard de Organizaciones](#2-dashboard-de-organizaciones)
3. [Detalle de Organización](#3-detalle-de-organizacion)
4. [Sesiones de Discovery](#4-sesiones-de-discovery)
5. [Transcripciones e IA](#5-transcripciones-e-ia)
6. [Mapa de Madurez](#6-mapa-de-madurez)
7. [Comité de IA](#7-comite-de-ia)
8. [Constitución del Comité](#8-constitucion-del-comite)
9. [Reporte de Diagnóstico](#9-reporte-de-diagnostico)
10. [Critical User Journeys (CUJ)](#10-critical-user-journeys-cuj)
11. [Pilotos](#11-pilotos)
12. [Value Engineering](#12-value-engineering)
13. [Escalamiento](#13-escalamiento)
14. [Mapeo de Procesos](#14-mapeo-de-procesos)
15. [Áreas Departamentales](#15-areas-departamentales)
16. [Dashboard de Transformación](#16-dashboard-de-transformacion)
17. [Herramientas de IA](#17-herramientas-de-ia)
18. [Report Builder](#18-report-builder)
19. [Council Dashboard](#19-council-dashboard)
20. [Red Flags y Alertas](#20-red-flags-y-alertas)

---

## 1. Autenticación y Acceso

### 1.1 Iniciar Sesión

**Ruta:** `/login`

1. Abrir la aplicación en el navegador.
2. Ingresar el **email** registrado.
3. Ingresar la **contraseña** (mínimo 6 caracteres).
4. Hacer clic en **"Iniciar Sesión"**.
5. El sistema valida las credenciales y redirige al Dashboard.

### 1.2 Roles de Usuario

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **admin** | Administrador del sistema | Crear usuarios, ver todas las organizaciones, acceso total |
| **facilitator** | Facilitador/Consultor | Crear organizaciones, gestionar sesiones, pilotos y reportes |
| **council** | Consejero/Miembro del comité | Vista de solo lectura del Council Dashboard |

### 1.3 Registrar Nuevos Usuarios (Solo Admin)

1. Solo usuarios con rol **admin** pueden registrar nuevos usuarios.
2. Datos requeridos: email, contraseña, nombre, rol, organización (opcional).

---

## 2. Dashboard de Organizaciones

**Ruta:** `/dashboard`

### 2.1 Ver Organizaciones

1. Al ingresar, se muestra una lista de tarjetas con todas las organizaciones.
2. Cada tarjeta muestra:
   - Nombre de la organización
   - Industria
   - Etapa actual (1 a 5)
   - Score promedio de madurez
   - AI Operating Level

### 2.2 Crear Nueva Organización

1. Hacer clic en el botón **"Nueva Organización"**.
2. Completar el formulario:
   - **Nombre** de la organización
   - **Industria** (ej: tecnología, manufactura, servicios)
   - **Tamaño** (pequeña, mediana, grande)
   - **Nombre de contacto**
   - **Email de contacto**
3. Hacer clic en **"Crear"**.
4. El sistema redirige automáticamente a la página de detalle de la nueva organización.

### 2.3 Navegar a una Organización

- Hacer clic en cualquier tarjeta de organización para ver su detalle.

---

## 3. Detalle de Organización

**Ruta:** `/org/{orgId}`

### 3.1 Vista General

1. Se muestra el **Mapa de Etapas (StageMap)**: una visualización de las 5 etapas del framework.
2. Se muestra el **Progreso de Etapa (StageProgress)**: criterios cumplidos y pendientes para avanzar a la siguiente etapa.
3. Sesiones recientes completadas.

### 3.2 Acciones Disponibles (según etapa)

| Etapa | Acciones Habilitadas |
|-------|---------------------|
| 1 - Diagnóstico | Ver sesiones, ver mapa de madurez |
| 2 - Descubrimiento | Comité, diagnóstico, CUJ |
| 3 - Pilotos | Crear y gestionar pilotos, value engineering |
| 4 - Escalamiento | Planes de escalamiento, mapeo de procesos |
| 5 - Transformación | Dashboard de transformación, herramientas IA |

### 3.3 Criterios para Avanzar de Etapa

- **Etapa 1 a 2:** 3 sesiones validadas + comité constituido + 8 decisiones fundacionales documentadas
- **Etapa 2 a 3:** Deep dives completados + presentación final + 2-3 quick wins diseñados
- **Etapa 3 a 4:** 1+ piloto con impacto medible + decisión de escalamiento del comité
- **Etapa 4 a 5:** Procesos rediseñados en escala, gobernanza activa

---

## 4. Sesiones de Discovery

**Ruta:** `/org/{orgId}/sessions`

### 4.1 Ver Lista de Sesiones

1. Se muestra una lista cronológica de todas las sesiones.
2. Cada sesión muestra: tipo, estado, fecha, cantidad de participantes.
3. Se puede filtrar por tipo y estado.

### 4.2 Crear Nueva Sesion

1. Hacer clic en **"Nueva Sesión"**.
2. Seleccionar el **tipo de sesión**:
   - **Ejecutiva**: preguntas para liderazgo senior
   - **Operativa**: preguntas para mandos medios y operaciones
   - **Técnica**: preguntas para equipo de TI/tecnología
   - **Constitución**: para constituir el comité de IA
   - **Deep Dive**: sesión profunda en dimensión específica
   - **Presentación**: sesión de presentación de resultados
3. Seleccionar la **modalidad** (presencial o remota).
4. Ingresar **título** y **fecha programada**.
5. Hacer clic en **"Crear"**.
6. El sistema inserta automáticamente las preguntas del catálogo según el tipo de sesión.

### 4.3 Editar una Sesión

**Ruta:** `/org/{orgId}/sessions/{sessionId}`

1. **Agregar participantes:**
   - Hacer clic en "Agregar Participante".
   - Ingresar nombre, rol y área.
   - Se pueden eliminar participantes existentes.

2. **Notas de sesión:**
   - Escribir notas en el campo de texto.
   - Las notas se guardan automáticamente (auto-save con debounce de 1.5 segundos).

3. **Responder preguntas:**
   - Cada pregunta se muestra en una tarjeta (QuestionCard).
   - Se puede escribir una respuesta manual en el campo de texto.
   - Las respuestas se agrupan por las 6 dimensiones de madurez.

4. **Validar respuestas:**
   - Después de procesar con IA, cada respuesta puede marcarse como:
     - **Aprobada**: la respuesta sugerida es correcta
     - **Rechazada**: la respuesta no aplica
     - **Editada**: se modifica la respuesta sugerida
     - **No mencionada**: el tema no se trató en la sesión

---

## 5. Transcripciones e IA

### 5.1 Subir Transcripción

1. En la vista de sesión, buscar la sección **"Transcripción"**.
2. Se puede:
   - **Subir un archivo** (formatos: .txt, .docx, .pdf)
   - **Pegar texto** directamente en el campo
3. El sistema procesa el texto y lo almacena.

### 5.2 Procesar Sesión con IA

1. Hacer clic en el botón **"Procesar con IA"**.
2. El sistema envía la transcripción (o notas) al servicio de IA (Google Gemini).
3. La IA genera para cada pregunta:
   - **Respuesta sugerida**: texto con la respuesta extraída
   - **Nivel de madurez sugerido**: 1 a 4
   - **Confianza**: alta, media o baja
   - **Citaciones**: citas directas con speaker, rol y timestamp
4. Las respuestas sugeridas aparecen en cada QuestionCard.
5. El facilitador debe **validar** cada respuesta (ver sección 4.3).

---

## 6. Mapa de Madurez

**Ruta:** `/org/{orgId}/maturity`

### 6.1 Visualizar Scores

1. Se muestra un **Spider Chart** (gráfico radar) con las 6 dimensiones:
   - Estrategia
   - Procesos
   - Datos
   - Tecnología
   - Cultura
   - Gobernanza
2. Cada dimensión tiene un score de 1 a 4.
3. Se comparan los scores con **benchmarks de industria** y tamaño.

### 6.2 Estados del Mapa

| Estado | Significado |
|--------|-------------|
| Sin datos | No hay sesiones validadas aún |
| Parcial | Algunas dimensiones tienen score |
| Completo | Todas las dimensiones evaluadas |

### 6.3 Actualizar Scores

- Los scores se actualizan automáticamente al validar sesiones.
- Un admin puede editar scores manualmente (1-4) por dimensión.

---

## 7. Comité de IA

**Ruta:** `/org/{orgId}/committee/design`

### 7.1 Diseñar el Comité

1. El sistema muestra **5 roles** necesarios:
   - **Sponsor** (obligatorio): líder ejecutivo que respalda la iniciativa
   - **Líder Operativo** (obligatorio): responsable de ejecución diaria
   - **Representante de Negocio** (opcional): voz de las áreas de negocio
   - **Representante de TI** (opcional): perspectiva técnica
   - **Gestión del Cambio** (opcional): facilitador de adopción

2. Para cada rol:
   - Ingresar **nombre** del miembro
   - Ingresar **email**
   - Ingresar **área** organizacional

3. La IA puede sugerir miembros basándose en el análisis de sesiones.

### 7.2 Acciones

- **Agregar miembro**: seleccionar rol, completar datos, guardar.
- **Eliminar miembro**: botón de eliminar en la tarjeta del miembro.
- **Guardar borrador**: guarda sin marcar como constituido.

---

## 8. Constitución del Comité

**Ruta:** `/org/{orgId}/committee/constitution`

### 8.1 Decisiones Fundacionales

El comité debe responder **8 decisiones** que guían toda la transformación:

| # | Decisión | Descripción |
|---|----------|-------------|
| 1 | Definición de IA | Qué significa IA para la organización |
| 2 | Scope | Cuáles procesos son elegibles para IA |
| 3 | Enfoque | Centralizadas vs distribuidas las iniciativas |
| 4 | Gobernanza | Quién decide en el comité sobre qué |
| 5 | Priorización | Criterios para seleccionar quick wins |
| 6 | Change Management | Modelo de adopción del cambio |
| 7 | ROI esperado | Targets financieros de la transformación |
| 8 | Escalamiento | Plan post-pilotos |

### 8.2 Responder Decisiones

1. Cada decisión se muestra en una tarjeta (DecisionCard).
2. Seleccionar o escribir la respuesta según el tipo.
3. Al guardar, se registra la fecha de la decisión (`decided_at`).
4. Se muestra el progreso de decisiones respondidas.

### 8.3 Constituir el Comité

- Cuando las 8 decisiones están respondidas, se puede marcar el comité como **"Constituido"**.
- Esto es un requisito para avanzar de etapa.

---

## 9. Reporte de Diagnóstico

**Ruta:** `/org/{orgId}/diagnostic`

### 9.1 Generar Diagnóstico

1. El sistema ejecuta un **análisis cross-sesión** (todas las sesiones validadas).
2. Se genera automáticamente:
   - **Scores promedio** por dimensión
   - **Brechas identificadas** entre dimensiones
   - **Evidencia** (citas directas de sesiones con speaker, rol y timestamp)
   - **Quick wins sugeridos** (antes/después, herramienta, esfuerzo, timeline)
   - **Deep dives recomendados** (triggers por dimensión)

### 9.2 Navegar el Reporte

1. **Scores por dimensión**: paneles expandibles con summary, gaps y evidencia.
2. **Quick wins**: lista de oportunidades rápidas con:
   - Proceso actual vs proceso con IA
   - Herramienta sugerida
   - Nivel de implementación
   - Timeline estimado
3. **Deep dives**: recomendaciones de sesiones adicionales si alguna dimension esta en rojo.

### 9.3 Exportar

- Boton para **descargar/imprimir** el reporte como PDF o HTML.

---

## 10. Critical User Journeys (CUJ)

**Ruta:** `/org/{orgId}/cujs/new` o `/org/{orgId}/cujs/{cujId}`

### 10.1 Crear un CUJ

1. Hacer clic en **"Nuevo CUJ"**.
2. Completar:
   - **Nombre** (ej: "Proceso de aprobacion de gastos")
   - **Actor** (ej: "Gerente de area")
   - **Objetivo** (ej: "Aprobar gasto en tiempo minimo")

### 10.2 Mapear Pasos

1. Para cada paso del journey:
   - **Descripcion** del paso
   - **Actor** responsable
   - **Herramienta actual** utilizada
   - **Tiempo estimado** (en minutos)
   - **Pain point** (punto de dolor)
   - **Candidato para agente IA** (si/no)
2. Se pueden agregar, eliminar y reordenar pasos.

### 10.3 Guardar CUJ

- Hacer clic en **"Guardar"** para persistir el CUJ.
- Los CUJ pueden vincularse a pilotos posteriormente.

---

## 11. Pilotos

**Ruta:** `/org/{orgId}/pilots`

### 11.1 Crear un Piloto

1. Hacer clic en **"Nuevo Piloto"**.
2. Completar el formulario:
   - **Titulo** del piloto
   - **Descripcion del proceso** actual
   - **Herramienta** de IA a usar
   - **Tamano del equipo**
   - **Nombre del champion** (responsable)
   - **Email del champion**
   - (Opcional) Area departamental, CUJ vinculado
3. Hacer clic en **"Crear"**. El piloto se crea con estado `designing`.

**Restriccion:** maximo 5 pilotos activos simultaneamente.

### 11.2 Detalle del Piloto

**Ruta:** `/org/{orgId}/pilots/{pilotId}`

El detalle tiene **6 secciones**:

#### a) Diseno de Workflow

1. **Flujo antes**: describir pasos manuales actuales.
2. **Flujo despues**: describir pasos con IA integrada.
3. **Puntos de validacion humana**: donde interviene una persona.
4. **Pasos eliminados**: que se elimina.
5. **Nuevos pasos**: que se agrega.

#### b) Baseline (Metricas Iniciales)

1. Definir metricas a rastrear:
   - Nombre (ej: "Horas por aprobacion")
   - Unidad (horas, porcentaje, cantidad)
   - Valor actual (baseline)
2. El sistema toma un snapshot de estos valores iniciales.

#### c) Champions

1. Listar los champions asignados al piloto.
2. Para cada champion:
   - Nombre y area
   - Responsabilidades especificas
   - Horas/semana dedicadas
   - Canal de comunicacion

#### d) Impacto en Roles

1. Para cada rol afectado por el piloto:
   - Nombre del rol
   - Porcentaje de tiempo liberado
   - Nuevas responsabilidades asignadas
   - Incentivos propuestos

#### e) Seguimiento de Metricas

1. Ingresar mediciones periodicas (semanal/mensual):
   - Valores actualizados de metricas
   - Metricas de adopcion: porcentaje de usuarios activos, frecuencia de uso, NPS
   - Notas de campo

#### f) Decision del Comite

1. Despues de la evaluacion (2-8 semanas), el comite decide:
   - **Escalar**: llevar a mas areas
   - **Iterar**: ajustar y volver a evaluar
   - **Kill**: cancelar el piloto
2. Documentar justificacion de la decision.

### 11.3 Estados del Piloto

```
designing --> active --> evaluating --> scale / iterate / kill
```

---

## 12. Value Engineering

**Ruta:** `/org/{orgId}/value-engineering`

### 12.1 Matriz de Priorizacion

1. Se muestra una tabla con todos los pilotos.
2. Columnas:
   - **Titulo** del piloto
   - **PnL**: impacto financiero estimado ($ ahorrados o ingresos)
   - **Effort**: esfuerzo de implementacion (S / M / L / XL)
   - **Risk**: nivel de riesgo (bajo / medio / alto)
   - **Time-to-Value**: tiempo para ver resultados (< 4 semanas / 4-12 semanas / > 12 semanas)
   - **Score**: calculado automaticamente

### 12.2 Calculo del Score

Formula: `40% PnL + 25% effort (inverso) + 20% risk (inverso) + 15% time-to-value (inverso)`

### 12.3 Codigo de Colores

| Score | Color | Significado |
|-------|-------|-------------|
| < 40 | Rojo | Baja prioridad |
| 40-70 | Amarillo | Prioridad media |
| > 70 | Verde | Alta prioridad |

### 12.4 Editar Valores

- Los valores de PnL, effort, risk y time-to-value se editan desde el detalle del piloto.

---

## 13. Escalamiento

**Ruta:** `/org/{orgId}/scaling`

### 13.1 Crear Plan de Escalamiento

1. Hacer clic en **"Nuevo Plan"**.
2. Seleccionar el **piloto a escalar** (solo pilotos con decision "scale").
3. Definir **areas objetivo** (departamentos/equipos):
   - Nombre del area
   - Tamano del equipo
   - Fecha objetivo
4. Ingresar **total de usuarios objetivo**.
5. Hacer clic en **"Crear"**. Estado inicial: `planning`.

### 13.2 Detalle del Plan

**Ruta:** `/org/{orgId}/scaling/{planId}`

1. Ver informacion del piloto base.
2. Ver areas objetivo y sus estados individuales.
3. Registrar metricas periodicas:
   - Porcentaje de adopcion
   - Usuarios activos
   - Impactos logrados
   - Notas
4. El sistema genera graficos de curva de adopcion (recharts).

### 13.3 Estados del Plan

```
planning --> active --> completed
                   --> paused
```

---

## 14. Mapeo de Procesos

**Ruta:** `/org/{orgId}/processes`

### 14.1 Crear Mapa de Proceso

1. Hacer clic en **"Nuevo Proceso"**.
2. Completar:
   - **Nombre** del proceso
   - **Descripcion**
   - **Segmento de cadena de valor**: market-to-lead, lead-to-sale, order-to-cash, etc.
   - **Nivel de implementacion**: prompting, no-code, custom

### 14.2 Mapear Pasos Actuales

**Ruta:** `/org/{orgId}/processes/{processId}`

1. En la columna izquierda (**ANTES**), agregar pasos:
   - Descripcion del paso
   - Actor responsable
   - Herramienta utilizada
   - Duracion (minutos)
   - Es manual (si/no)
   - Candidato para IA (si/no)

### 14.3 Disenar Proceso con IA

1. En la columna derecha (**DESPUES**), agregar pasos rediseñados:
   - Nuevos pasos con herramientas de IA
   - Acciones candidatas de IA

### 14.4 Estimaciones

1. **Horas ahorradas por semana**: calculadas automaticamente.
2. **Impacto estimado**: descripcion textual del impacto.
3. **Priority score**: calculado como `horas * multiplicador segun nivel`.

### 14.5 Convertir a Piloto

- Boton **"Convertir a Piloto"** para crear un piloto directamente desde el proceso mapeado.

### 14.6 Estados del Proceso

```
mapped --> analyzed --> redesigned --> approved --> implementing
```

---

## 15. Areas Departamentales

**Ruta:** `/org/{orgId}/areas`

### 15.1 Crear Area

1. Hacer clic en **"Agregar Area"**.
2. Seleccionar un area estandar predefinida:
   - Finanzas, Marketing, Ventas, Recursos Humanos, Operaciones, TI, Legal, Atencion al Cliente, Supply Chain, I+D
3. O crear un area personalizada con nombre custom.
4. El area hereda los scores de madurez de la organizacion como baseline.

### 15.2 Ver Detalle del Area

**Ruta:** `/org/{orgId}/areas/{areaId}`

1. Spider chart con scores de madurez (heredados o especificos).
2. AI Operating Level del area.
3. Pilotos en implementacion asociados al area.
4. Estado del assessment.

### 15.3 Mini-Assessment del Area

**Ruta:** `/org/{orgId}/areas/{areaId}/mini-assessment`

1. Se presentan **12 preguntas rapidas** (2 por dimension):
   - **Estrategia**: vision documentada, liderazgo
   - **Procesos**: documentacion, automatizacion
   - **Datos**: accesibilidad, calidad
   - **Tecnologia**: herramientas, integraciones
   - **Cultura**: percepcion de IA
   - **Gobernanza**: politicas, controles
2. Para cada pregunta, seleccionar el nivel (1-4).
3. Hacer clic en **"Guardar"**.
4. El estado del area cambia de `inherited` a `mini-assessed`.

### 15.4 Estados del Assessment

| Estado | Significado |
|--------|-------------|
| inherited | Scores heredados de la organizacion |
| mini-assessed | Assessment rapido completado |
| full-assessed | Evaluacion completa (con sesiones) |

---

## 16. Dashboard de Transformacion

**Ruta:** `/org/{orgId}/transformation`

### 16.1 KPIs Principales

Se muestran tarjetas con metricas clave:

| KPI | Descripcion |
|-----|-------------|
| Procesos rediseñados | Total de procesos en estado approved/implementing |
| Horas liberadas | Suma de horas ahorradas por semana |
| ROI estimado | (horas * $25) - (costo mensual herramientas * 3) |
| Herramientas IA | Cantidad de herramientas activas |

### 16.2 Evolucion de Madurez

- Grafico comparativo: scores iniciales vs actuales por dimension.

### 16.3 Evolucion de Gobernanza

- Registrar cambios a las decisiones fundacionales a medida que la organizacion evoluciona.
- Campos: numero de decision original, fecha, descripcion del cambio, quien decidio.

---

## 17. Herramientas de IA

Gestionadas desde el Dashboard de Transformacion.

### 17.1 Agregar Herramienta

1. Hacer clic en **"Agregar Herramienta"**.
2. Completar:
   - **Nombre** (ej: ChatGPT, Copilot, Make)
   - **Categoria**: LLM, no-code, custom, analytics, otro
   - **Licencias**: cantidad
   - **Costo mensual** ($)
   - **Equipos usando**: lista de equipos
3. Estado inicial: `evaluating`.

### 17.2 Gestionar Herramientas

- **Editar**: cambiar nombre, licencias, costo, estado.
- **Eliminar**: remover herramienta del listado.
- **Estados**: evaluating --> active --> deprecated

---

## 18. Report Builder

**Ruta:** `/org/{orgId}/reports`

### 18.1 Tipos de Entregables

| Tipo | Descripcion |
|------|-------------|
| Mapa de hallazgos | Resumen de findings de sesiones |
| Propuesta de comite | Documento con miembros y roles sugeridos |
| Acta de constitucion | Registro de decisiones fundacionales |
| Diagnostico completo | Reporte integral de madurez |
| Ficha quick-win | Detalle de un quick win especifico |
| Presentacion final | Presentacion ejecutiva de resultados |
| Diseno de piloto | Documento de diseno de piloto |
| Informe quincenal | Reporte de progreso periodico |
| Evaluacion de piloto | Resultados de un piloto completo |

### 18.2 Crear Reporte

1. Seleccionar el tipo de entregable.
2. Editar contenido en el editor (soporta Markdown: h1-h3, listas, negritas).
3. Preview en tiempo real lado a lado.
4. Los cambios se guardan automaticamente en localStorage.
5. Hacer clic en **"Publicar"** para marcar como publicado.

### 18.3 Exportar

- Opciones de formato: HTML, PDF, PPTX (PowerPoint).
- La exportacion a PowerPoint genera slides automaticamente con findings y KPIs.

---

## 19. Council Dashboard

**Ruta:** `/council`

**Acceso:** Solo usuarios con rol `council`.

### 19.1 Vista de Solo Lectura

El Council Dashboard permite a los consejeros visualizar (sin editar):

1. **Organizacion**: etapa actual, datos generales.
2. **Madurez**: scores por dimension con comparativa benchmark.
3. **Pilotos**: pilotos activos con metricas de progreso.
4. **Comite**: miembros y decisiones fundacionales.
5. **Red Flags**: alertas activas que requieren atencion.
6. **Reportes**: acceso a reportes ejecutivos generados.

---

## 20. Red Flags y Alertas

### 20.1 Sistema de Deteccion

El sistema evalua automaticamente reglas para detectar problemas:

| Red Flag | Severidad | Descripcion |
|----------|-----------|-------------|
| Dimension en rojo sin plan | alert | Score = 1 en alguna dimension sin deep dive |
| Comite incompleto | warning | Faltan roles obligatorios (sponsor o lider) |
| Piloto sin metricas | warning | Piloto activo > 4 semanas sin mediciones |
| Brecha ejecutivo-operativo | alert | Discrepancia entre sesiones ejecutiva y operativa |
| Decision fundacional pendiente | warning | Decisiones sin responder despues del plazo |

### 20.2 Severidades

| Nivel | Significado |
|-------|-------------|
| **warning** | Alerta informativa, no bloquea |
| **alert** | Requiere atencion pronta |
| **block** | Bloquea avance de etapa, debe resolverse |

### 20.3 Resolver un Red Flag

1. Se muestra un **banner rojo** en la parte superior si hay flags activos.
2. Hacer clic en el banner para ver detalles.
3. Para resolver:
   - Ingresar **resolucion** (texto explicativo).
   - (Opcional) **Justificacion de override** si se resuelve sin accion.
   - Hacer clic en **"Resolver"**.

---

## Apendice A: Dimensiones de Madurez

| Dimension | Que Evalua |
|-----------|-----------|
| Estrategia | Vision, objetivos, liderazgo en IA |
| Procesos | Documentacion, automatizacion, eficiencia |
| Datos | Accesibilidad, calidad, gobernanza de datos |
| Tecnologia | Herramientas, infraestructura, integraciones |
| Cultura | Percepcion, disposicion al cambio, capacitacion |
| Gobernanza | Politicas, controles, compliance |

Cada dimension se evalua en una escala de **1 a 4**:
- **1 - Inicial**: sin iniciativas formales
- **2 - En desarrollo**: iniciativas aisladas
- **3 - Definido**: procesos estandarizados
- **4 - Optimizado**: mejora continua y gobernanza activa

## Apendice B: AI Operating Level

| Nivel | Descripcion |
|-------|-------------|
| 1 - Sin IA | No hay uso de IA en la organizacion |
| 2 - Prompting simple | Uso basico de LLMs para tareas puntuales |
| 3 - No-code integrado | Herramientas no-code con IA integrada en procesos |
| 4 - Custom agents | Agentes personalizados con gobernanza completa |

## Apendice C: Tablas de Datos Principales

| Tabla | Contenido |
|-------|-----------|
| users | Usuarios y autenticacion |
| organizations | Organizaciones cliente |
| engagements | Relacion facilitador-organizacion |
| sessions | Sesiones de discovery |
| session_questions | Preguntas y respuestas por sesion |
| committees | Comites de IA |
| committee_members | Miembros del comite |
| foundational_decisions | Decisiones del comite |
| pilots | Pilotos de IA |
| pilot_metrics | Metricas de seguimiento de pilotos |
| scaling_plans | Planes de escalamiento |
| process_maps | Mapeos de procesos |
| department_areas | Areas departamentales |
| ai_tools | Herramientas de IA adoptadas |
| red_flags | Alertas detectadas |
| cujs | Critical User Journeys |
| cross_session_analyses | Resultados de analisis IA |
