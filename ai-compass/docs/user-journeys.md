# User Journeys - AICompass

Documentacion de todos los recorridos de usuario (journeys) de la plataforma AICompass, organizados por etapa del framework de transformacion.

---

## Tabla de Contenidos

1. [Diagrama de Dependencias](#diagrama-de-dependencias)
2. [Journey: Autenticacion](#journey-1-autenticacion)
3. [Journey: Gestion de Organizaciones](#journey-2-gestion-de-organizaciones)
4. [Journey Etapa 1: Diagnostico](#journey-3-etapa-1---diagnostico)
5. [Journey Etapa 2: Descubrimiento](#journey-4-etapa-2---descubrimiento)
6. [Journey Etapa 3: Pilotos](#journey-5-etapa-3---pilotos)
7. [Journey Etapa 4: Escalamiento](#journey-6-etapa-4---escalamiento)
8. [Journey Etapa 4b: Areas Departamentales](#journey-7-etapa-4b---areas-departamentales)
9. [Journey Etapa 5: Transformacion](#journey-8-etapa-5---transformacion)
10. [Journey: Reportes](#journey-9-reportes-y-entregables)
11. [Journey: Council Dashboard](#journey-10-council-dashboard)
12. [Journey: Red Flags](#journey-11-monitoreo-de-red-flags)
13. [Flujos de Datos Clave](#flujos-de-datos-clave)
14. [Matriz de Roles y Permisos](#matriz-de-roles-y-permisos)
15. [Resumen por Etapa](#resumen-de-journeys-por-etapa)

---

## Diagrama de Dependencias

```
Organization
|
+-- Engagement (1:1)
|   +-- Sessions (1:N)
|   |   +-- Questions (1:N) --> Scores por dimension
|   |   +-- Participants (1:N)
|   |   +-- Findings (1:N)
|   +-- CUJs (1:N)
|
+-- Committee (1:1)
|   +-- Members (1:N)
|   +-- Decisions (1:N)
|   +-- Meetings (1:N)
|
+-- Pilots (1:N)
|   +-- Metrics (1:N) + Baseline
|   +-- Champions (1:N)
|   +-- RoleImpacts (1:N)
|   +-- QuickWins (N:1)
|   +-- CUJ (0:1) ref
|
+-- ScalingPlans (1:N)
|   +-- Pilot (1:1) ref
|   +-- TargetAreas (1:N)
|   +-- Metrics (1:N)
|
+-- ProcessMaps (1:N)
|   +-- CurrentSteps (1:N)
|   +-- RedesignedSteps (1:N)
|
+-- DepartmentAreas (1:N)
|   +-- MiniAssessmentAnswers (1:N)
|
+-- AiTools (1:N)
+-- GovernanceEvolutions (1:N)
+-- RedFlags (1:N)
+-- Deliverables (1:N)
```

---

## Journey 1: Autenticacion

**Punto de entrada:** `/login`
**Punto de salida:** `/dashboard` o `/council`
**Valor:** Acceso seguro con control de acceso basado en roles

### Flujo

```
[Login Page] --> Ingresa email y contrasena
              --> POST /auth/login
              --> Valida credenciales
              --> Almacena JWT en localStorage
              --> Redirige segun rol:
                  - admin/facilitator --> /dashboard
                  - council --> /council
```

### Pasos Detallados

1. El usuario abre la aplicacion y ve la pagina de login.
2. Ingresa su email registrado y contrasena.
3. El sistema valida las credenciales contra la base de datos.
4. Si son correctas, genera un token JWT y lo almacena.
5. Redirige al dashboard segun el rol del usuario.
6. Si las credenciales son incorrectas, muestra mensaje de error.

### Proteccion de Rutas

- Todas las rutas (excepto `/login`) estan protegidas por `ProtectedRoute`.
- Si el token expira, se redirige automaticamente a `/login`.
- Algunas rutas requieren roles especificos (ej: `/council` solo para rol `council`).

---

## Journey 2: Gestion de Organizaciones

**Punto de entrada:** `/dashboard`
**Punto de salida:** `/org/{orgId}` (detalle de organizacion)
**Valor:** Visibilidad del portfolio de clientes y acceso a iniciativas

### Flujo

```
[Dashboard] --> Ver tarjetas de organizaciones
            --> Filtrar por industria/etapa
            --> Click en organizacion --> /org/{orgId}
            --> O crear nueva organizacion:
                --> Modal con datos
                --> POST /organizations
                --> Redirige a /org/{newOrgId}
```

### Pasos Detallados

1. El facilitador accede al dashboard.
2. Ve todas sus organizaciones como tarjetas (admin ve todas).
3. Cada tarjeta muestra: nombre, industria, etapa actual, score, AI Operating Level.
4. Para crear una nueva organizacion:
   a. Clic en "Nueva Organizacion".
   b. Completa formulario: nombre, industria, tamano, contacto.
   c. Crea y es redirigido al detalle.
5. Para navegar a una existente: clic en la tarjeta.

---

## Journey 3: Etapa 1 - Diagnostico

**Punto de entrada:** `/org/{orgId}`
**Punto de salida:** Comite constituido + 3 sesiones validadas
**Valor:** Diagnostico de madurez en IA + gobernanza base establecida

### Sub-Journey 3.1: Vista General de Organizacion

```
[Org Detail] --> Ver StageMap (5 etapas visual)
             --> Ver StageProgress (criterios cumplidos/pendientes)
             --> Ver sesiones recientes
             --> Navegar a acciones segun etapa
```

### Sub-Journey 3.2: Crear y Ejecutar Sesiones

```
[Session List] --> Crear nueva sesion
               --> Seleccionar tipo (ejecutiva/operativa/tecnica/etc)
               --> Seleccionar modalidad (presencial/remota)
               --> Sistema inserta preguntas del catalogo
               --> [Session View]:
                   --> Agregar participantes
                   --> Subir transcripcion O escribir notas
                   --> Procesar con IA
                   --> Validar respuestas sugeridas
                   --> Marcar como completada
```

**Flujo completo de una sesion:**

1. **Crear sesion**: facilitador selecciona tipo y modalidad.
2. **Preparar sesion**: agrega participantes con nombre, rol y area.
3. **Capturar datos** (una de dos opciones):
   - **Opcion A**: Subir transcripcion (archivo .txt, .docx, .pdf o pegar texto).
   - **Opcion B**: Escribir notas manualmente durante la sesion.
4. **Procesar con IA**: clic en "Procesar con IA".
   - El sistema analiza la transcripcion/notas con Google Gemini.
   - Genera respuestas sugeridas, niveles de madurez, confianza y citaciones.
5. **Validar respuestas**: para cada pregunta, el facilitador:
   - Aprueba la respuesta sugerida, o
   - La edita, rechaza o marca como "no mencionada".
6. **Completar sesion**: marca la sesion como validada.

### Sub-Journey 3.3: Evaluar Madurez

```
[Maturity Map] --> Ver Spider Chart (6 dimensiones)
               --> Comparar con benchmarks de industria
               --> Identificar dimensiones en rojo (score 1)
               --> Decidir deep dives necesarios
```

### Sub-Journey 3.4: Disenar Comite de IA

```
[Committee Design] --> Ver 5 roles necesarios
                   --> Asignar miembros a cada rol
                   --> IA sugiere miembros basandose en sesiones
                   --> Guardar borrador
```

### Sub-Journey 3.5: Constituir Comite

```
[Committee Constitution] --> Responder 8 decisiones fundacionales
                         --> Progreso visible (X/8 respondidas)
                         --> Marcar comite como "constituido"
                         --> Habilita avance a Etapa 2
```

### Criterios para Avanzar a Etapa 2

- 3 sesiones validadas (al menos 1 ejecutiva + 1 operativa)
- Comite constituido con roles obligatorios asignados
- 8 decisiones fundacionales documentadas

---

## Journey 4: Etapa 2 - Descubrimiento

**Punto de entrada:** Etapa 1 completada
**Punto de salida:** Quick wins identificados + deep dives completados
**Valor:** Diagnostico completo con oportunidades priorizadas

### Sub-Journey 4.1: Reporte de Diagnostico

```
[Diagnostic Report] --> Analisis cross-sesion automatico
                    --> Scores finales por dimension
                    --> Brechas identificadas con evidencia
                    --> Quick wins sugeridos
                    --> Deep dives recomendados
                    --> Exportar como PDF/HTML
```

**Flujo detallado:**

1. El sistema procesa todas las sesiones validadas con IA.
2. Genera un analisis consolidado:
   - Score final por dimension (1-4).
   - Evidencia: citas directas con speaker, rol y timestamp.
   - Brechas: discrepancias entre sesiones o dimensiones.
3. Recomienda:
   - **Quick wins**: procesos que se pueden automatizar rapidamente.
   - **Deep dives**: sesiones adicionales para dimensiones en rojo.
4. El facilitador revisa y exporta el reporte.

### Sub-Journey 4.2: Mapear Critical User Journeys

```
[CUJ Mapper] --> Crear nuevo CUJ (nombre, actor, objetivo)
             --> Mapear pasos actuales del proceso
             --> Identificar pain points
             --> Marcar candidatos para IA
             --> Guardar CUJ
             --> (Opcional) Vincular a piloto futuro
```

### Criterios para Avanzar a Etapa 3

- Deep dives completados para dimensiones en rojo
- Presentacion final de diagnostico realizada
- 2-3 quick wins diseñados y priorizados

---

## Journey 5: Etapa 3 - Pilotos

**Punto de entrada:** Etapa 2 completada
**Punto de salida:** Al menos 1 piloto con impacto medible + decision de escalamiento
**Valor:** Prueba de concepto validada con metricas reales

### Sub-Journey 5.1: Crear y Disenar Piloto

```
[Pilot List] --> Crear piloto (titulo, proceso, herramienta, champion)
             --> [Pilot Detail]:
                 --> Disenar workflow (antes vs despues)
                 --> Definir baseline de metricas
                 --> Asignar champions
                 --> Documentar impactos de rol
```

**Flujo completo del ciclo de vida de un piloto:**

1. **Crear piloto** (status: `designing`):
   - Titulo, proceso, herramienta, champion.
   - Maximo 5 pilotos activos simultaneamente.

2. **Disenar workflow**:
   - Documentar flujo actual (pasos manuales).
   - Disenar flujo con IA (pasos automatizados).
   - Identificar puntos de validacion humana.

3. **Establecer baseline**:
   - Definir metricas a rastrear (nombre, unidad, valor actual).
   - Tomar snapshot inicial.

4. **Asignar champions**:
   - Designar responsables con horas/semana dedicadas.
   - Definir responsabilidades y canales.

5. **Activar piloto** (status: `active`):
   - Iniciar implementacion con equipo.
   - Comenzar seguimiento de metricas.

6. **Seguimiento periodico**:
   - Registrar metricas semanales/mensuales.
   - Monitorear adopcion (% usuarios, NPS).

7. **Evaluar** (status: `evaluating`):
   - Comparar metricas actuales vs baseline.
   - Documentar impactos en roles.

8. **Decision del comite**:
   - **Escalar**: llevar a mas areas.
   - **Iterar**: ajustar y reevaluar.
   - **Kill**: cancelar si no hay impacto.

### Sub-Journey 5.2: Value Engineering

```
[Value Engineering] --> Ver matriz de todos los pilotos
                   --> Columnas: PnL, effort, risk, time-to-value
                   --> Score automatico por piloto
                   --> Colores: rojo (<40), amarillo (40-70), verde (>70)
                   --> Priorizar pilotos por score
```

### Sub-Journey 5.3: Monitoreo de Red Flags

```
[Red Flag Banner] --> Banner rojo visible si hay flags
                 --> Ver detalles de cada flag
                 --> Resolver con justificacion
                 --> Flags "block" impiden avance de etapa
```

### Criterios para Avanzar a Etapa 4

- 1+ piloto con impacto medible (metricas de adopcion > 0)
- Decision de escalamiento del comite documentada

---

## Journey 6: Etapa 4 - Escalamiento

**Punto de entrada:** Etapa 3 completada
**Punto de salida:** Procesos rediseñados y escalados a multiples areas
**Valor:** Soluciones de IA operando a escala en la organizacion

### Sub-Journey 6.1: Crear Plan de Escalamiento

```
[Scaling Dashboard] --> Seleccionar piloto exitoso (decision = "scale")
                    --> Definir areas objetivo (nombre, equipo, fecha)
                    --> Ingresar total usuarios objetivo
                    --> Crear plan (status: planning)
```

### Sub-Journey 6.2: Ejecutar Escalamiento

```
[Scaling Detail] --> Ver areas objetivo y estados
                --> Activar plan (status: active)
                --> Registrar metricas periodicas por area:
                    --> % adopcion
                    --> Usuarios activos
                    --> Impactos
                    --> Notas
                --> Ver graficos de curva de adopcion
                --> Completar plan cuando todas las areas estan activas
```

### Sub-Journey 6.3: Mapear y Redisenar Procesos

```
[Process Map List] --> Crear mapa de proceso
                   --> [Process Detail]:
                       --> Mapear pasos actuales (ANTES)
                       --> Disenar pasos con IA (DESPUES)
                       --> Estimar horas ahorradas
                       --> Calcular priority score
                       --> Cambiar status:
                           mapped --> analyzed --> redesigned --> approved --> implementing
                       --> (Opcional) "Convertir a Piloto"
```

**Flujo del rediseno de proceso:**

1. **Crear mapa**: nombre, descripcion, segmento de cadena de valor.
2. **Mapear estado actual**: agregar pasos con actor, herramienta, duracion.
3. **Identificar candidatos IA**: marcar pasos manuales automatizables.
4. **Redisenar con IA**: agregar pasos nuevos con herramientas de IA.
5. **Estimar impacto**: horas ahorradas, impacto, priority score.
6. **Aprobar**: comite aprueba el rediseno.
7. **Implementar**: convertir a piloto o implementar directamente.

---

## Journey 7: Etapa 4b - Areas Departamentales

**Punto de entrada:** `/org/{orgId}/areas`
**Punto de salida:** Areas con madurez evaluada individualmente
**Valor:** Evaluacion granular por departamento sin sesiones complejas

### Flujo Completo

```
[Area List] --> Crear area (seleccionar estandar o custom)
            --> Area hereda scores de organizacion
            --> [Area Detail]:
                --> Ver scores heredados
                --> Ver AI Operating Level
                --> (Opcional) Realizar mini-assessment:
                    --> [Mini Assessment]:
                        --> 12 preguntas rapidas (2 por dimension)
                        --> Seleccionar nivel 1-4 por pregunta
                        --> Guardar
                        --> Status: inherited --> mini-assessed
                        --> Scores actualizados para el area
```

### Transiciones de Estado

```
Area creada (inherited) --> Mini-assessment completado (mini-assessed) --> Sesiones completas (full-assessed)
```

---

## Journey 8: Etapa 5 - Transformacion

**Punto de entrada:** `/org/{orgId}/transformation`
**Punto de salida:** Organizacion operando como AI-First
**Valor:** Vision consolidada del estado de transformacion

### Flujo

```
[Transformation Dashboard] --> Ver KPIs:
                               - Procesos rediseñados
                               - Horas liberadas
                               - ROI estimado
                               - Herramientas IA activas
                           --> Ver evolucion de madurez (antes vs ahora)
                           --> Gestionar herramientas IA:
                               --> Agregar herramienta (nombre, categoria, costo)
                               --> Editar status (evaluating --> active --> deprecated)
                               --> Eliminar herramienta
                           --> Registrar evolucion de gobernanza:
                               --> Cambios a decisiones fundacionales
                               --> Quien decidio y cuando
```

---

## Journey 9: Reportes y Entregables

**Punto de entrada:** `/org/{orgId}/reports`
**Punto de salida:** Documento publicado (HTML/PDF/PPTX)
**Valor:** Documentacion ejecutiva profesional

### Flujo

```
[Report Builder] --> Seleccionar tipo de entregable:
                     - Mapa de hallazgos
                     - Propuesta de comite
                     - Acta de constitucion
                     - Diagnostico completo
                     - Ficha quick-win
                     - Presentacion final
                     - Diseno de piloto
                     - Informe quincenal
                     - Evaluacion de piloto
                 --> Editar contenido (Markdown)
                 --> Preview en tiempo real
                 --> Auto-guardado en localStorage
                 --> Publicar entregable
                 --> Exportar (HTML, PDF, PPTX)
```

---

## Journey 10: Council Dashboard

**Punto de entrada:** `/council` (solo rol council)
**Punto de salida:** Vision de oversight sin edicion
**Valor:** Supervision ejecutiva de la transformacion

### Flujo (Solo Lectura)

```
[Council Dashboard] --> Seleccionar organizacion
                   --> Ver:
                       - Etapa actual y progreso
                       - Scores de madurez vs benchmark
                       - Pilotos activos con metricas
                       - Decisiones del comite
                       - Red flags activos
                       - Miembros del comite
                   --> NO puede editar ninguna seccion
```

---

## Journey 11: Monitoreo de Red Flags

**Contexto:** Activo en todas las paginas (componente global en Layout)

### Deteccion Automatica

```
[Sistema] --> Evalua reglas automaticamente:
              - Dimension en rojo sin deep dive
              - Comite incompleto (faltan roles obligatorios)
              - Piloto activo > 4 semanas sin metricas
              - Brecha ejecutivo-operativo detectada
              - Decision fundacional pendiente fuera de plazo
          --> Asigna severidad: warning / alert / block
          --> Muestra banner rojo en header
```

### Resolucion

```
[Red Flag Banner] --> Click para ver detalles
                 --> Para cada flag:
                     --> Leer descripcion y severidad
                     --> Ingresar resolucion (texto)
                     --> (Opcional) Justificacion de override
                     --> Marcar como resuelto
                 --> Si severidad = "block":
                     --> DEBE resolverse antes de avanzar de etapa
```

---

## Flujos de Datos Clave

### Flujo 1: Descubrimiento --> Comite

```
Sesiones (multiples)
    --> IA analiza transcripciones/notas
    --> CrossSessionAnalysis generado
    --> Committee Recommendations extraidas
    --> CommitteeDesign (asignar miembros)
    --> CommitteeConstitution (8 decisiones)
```

### Flujo 2: Quick Win --> Piloto

```
QuickWinSuggestion (del diagnostico)
    --> Piloto creado (designing)
    --> Baseline definida
    --> Metricas rastreadas (active)
    --> Decision del comite (evaluating)
    --> Resultado: scale / iterate / kill
```

### Flujo 3: Piloto --> Escalamiento

```
Piloto exitoso (decision = scale)
    --> ScalingPlan creado
    --> TargetAreas definidas
    --> Rollout progresivo con metricas
    --> TransformationSummary actualizado
```

### Flujo 4: Proceso --> Piloto

```
ProcessMap creado (mapped)
    --> Pasos actuales mapeados
    --> Rediseno con IA (redesigned)
    --> Aprobacion del comite (approved)
    --> "Convertir a Piloto" --> Nuevo Pilot
```

### Flujo 5: Area --> Evaluacion Incremental

```
Area creada (inherited, scores de org)
    --> Mini-Assessment (12 preguntas)
    --> Scores especificos del area
    --> AI Operating Level calculado
    --> Pilotos asociados al area
```

---

## Matriz de Roles y Permisos

| Accion | admin | facilitator | council |
|--------|-------|-------------|---------|
| Ver dashboard | Si | Si (solo sus orgs) | No |
| Crear organizacion | Si | Si | No |
| Editar organizacion | Si | Si | No |
| Crear sesion | Si | Si | No |
| Procesar con IA | Si | Si | No |
| Disenar comite | Si | Si | No |
| Crear piloto | Si | Si | No |
| Ver Council Dashboard | No | No | Si |
| Registrar usuarios | Si | No | No |

---

## Resumen de Journeys por Etapa

| Etapa | Journeys Principales | Entrada | Salida | Valor |
|-------|---------------------|---------|--------|-------|
| **1 - Diagnostico** | Login --> Dashboard --> Sesiones --> Madurez --> Comite Design --> Constitucion | Login | Comite constituido | Diagnostico + gobernanza |
| **2 - Descubrimiento** | Diagnostico Report --> CUJ Mapper --> Quick Wins | Org page | Pilotos priorizados | Oportunidades identificadas |
| **3 - Pilotos** | Crear Piloto --> Disenar --> Metricas --> Decision --> Value Engineering | Pilot list | Piloto validado | Prueba de concepto |
| **4 - Escalamiento** | Scaling Plan --> Process Map --> Rediseno --> Implementacion | Scaling list | Procesos en escala | IA operando a escala |
| **4b - Areas** | Area list --> Mini-assessment --> Detalle | Area list | Scores departamentales | Evaluacion granular |
| **5 - Transformacion** | KPIs --> Herramientas --> Gobernanza --> Evolucion | Transformation page | AI-first model | Vision consolidada |
| **Transversal** | Report Builder --> Council Dashboard --> Red Flags | Cualquier pagina | Entregables y oversight | Documentacion y control |

---

## Procesos Multi-Paso (Wizards)

| Proceso | Pasos | Duracion Tipica |
|---------|-------|-----------------|
| Crear y procesar sesion | 5 pasos (crear --> participantes --> transcripcion --> IA --> validar) | 1-2 horas |
| Disenar piloto completo | 6 secciones (basico --> workflow --> baseline --> champions --> metricas --> decision) | 2-4 semanas |
| Constituir comite | 3 pasos (disenar roles --> asignar miembros --> 8 decisiones) | 1-2 sesiones |
| Mini-assessment de area | 2 pasos (crear area --> 12 preguntas) | 15-30 minutos |
| Plan de escalamiento | 3 pasos (seleccionar piloto --> definir areas --> monitorear metricas) | Semanas-meses |

---

## Transiciones de Estado Globales

```
Organizacion:
  Etapa 1 (Diagnostico)
      --> 3 sesiones validadas
      --> Comite constituido
      --> 8 decisiones documentadas
  Etapa 2 (Descubrimiento)
      --> Deep dives completados
      --> Presentacion final
      --> Quick wins diseñados
  Etapa 3 (Pilotos)
      --> 1+ piloto con impacto
      --> Decision de escalamiento
  Etapa 4 (Escalamiento)
      --> Procesos rediseñados
      --> Scaling activo
  Etapa 5 (Transformacion)
      --> Mejora continua
      --> Gobernanza activa

Sesion:
  draft --> in-progress --> completed --> validated

Piloto:
  designing --> active --> evaluating --> scale / iterate / kill

Proceso:
  mapped --> analyzed --> redesigned --> approved --> implementing

Plan de Escalamiento:
  planning --> active --> completed / paused

Area Departamental:
  inherited --> mini-assessed --> full-assessed

Herramienta IA:
  evaluating --> active --> deprecated
```
