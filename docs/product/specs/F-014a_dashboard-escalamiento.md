# Feature: Dashboard de Escalamiento (Etapa 4)

## Contexto

Cuando un piloto de Etapa 3 es aprobado para escalar (decisión del comité = "scale"), la organización necesita expandir esa herramienta/proceso a más equipos y áreas. Actualmente no hay forma de trackear ese rollout ni medir si la adopción a escala funciona tan bien como en el piloto original.

El facilitador de InovaBiz necesita visibilidad de qué pilotos están escalando, a qué áreas, con qué resultados. El comité necesita decidir si seguir expandiendo o pausar.

Fuente: McKinsey Rewired — "death by a thousand pilots" ocurre cuando pilotos exitosos no se escalan. El 67% de las organizaciones permanece en modo piloto sin escalar.

## Datos

### Entidades nuevas

```
ScalingPlan
|- id: uuid (PK)
|- pilot_id: FK -> pilots
|- organization_id: FK -> organizations
|- target_areas: JSONB — Array de { areaName, teamSize, targetDate, status: 'planned'|'in-progress'|'completed'|'paused' }
|- total_target_users: number
|- scaling_start_date: date
|- scaling_status: 'planning'|'active'|'completed'|'paused'
|- created_at: timestamp
|- updated_at: timestamp

ScalingMetricEntry
|- id: uuid (PK)
|- scaling_plan_id: FK -> scaling_plans
|- area_name: string
|- date: date
|- adoption_percentage: number
|- users_active: number
|- impact_metrics: JSONB
|- notes: text
```

### Relaciones
- Un Pilot tiene 0-1 ScalingPlan (solo si decisión = 'scale')
- Un ScalingPlan tiene muchos ScalingMetricEntry (por área, semanal)

## Pantallas

### Pantalla 1: ScalingDashboardPage (`/org/:orgId/scaling`)

- **Layout**: Header con título + organización. Grid de ScalingPlan cards.
- **Componentes**:
  - ScalingPlanCard: título del piloto original, herramienta, áreas target (badges con estado), usuarios totales, progreso general
  - Filtros: por estado (todos, activos, completados, pausados)
- **Estados**:
  - Empty: "No hay pilotos aprobados para escalar. Los pilotos se escalan desde la sección de Pilotos."
  - Loading: skeleton de cards
  - Success: grid de ScalingPlanCards
  - Error: mensaje con retry
- **Interacciones**:
  - Click en card → ScalingPlanDetailPage
  - Botón "Crear plan de escalamiento" (solo si hay pilotos con decisión 'scale' sin plan)

### Pantalla 2: ScalingPlanDetailPage (`/org/:orgId/scaling/:planId`)

- **Layout**: Header con título del piloto + herramienta. 3 secciones.
- **Componentes**:
  - Sección "Áreas target": tabla editable con áreaName, teamSize, targetDate, status. Botón agregar área.
  - Sección "Métricas por área": para cada área, LineChart de adopción vs tiempo. Comparación con el piloto original (línea punteada de referencia).
  - Sección "Decisión": pausar escalamiento, completar, o agregar más áreas.
- **Estados**:
  - Planning: áreas editables, sin métricas aún
  - Active: métricas fluyendo, áreas bloqueadas (solo agregar nuevas)
  - Completed: todo en solo lectura con resumen
- **Interacciones**:
  - Agregar/editar áreas target
  - Registrar métricas semanales por área
  - Cambiar estado del plan

## Lógica de Negocio

- **Validaciones**: Solo pilotos con decisión 'scale' pueden tener plan de escalamiento. Cada área debe tener nombre y tamaño de equipo.
- **Cálculos**: Adopción promedio = promedio de adoption_percentage de todas las áreas activas. Comparación vs piloto original: % de diferencia en adopción y métricas de impacto.
- **Permisos**: Facilitador y admin crean/editan. Council ve en solo lectura.

## Criterios de Done

- [ ] Pilotos con decisión 'scale' muestran botón "Crear plan de escalamiento"
- [ ] Se pueden agregar áreas target con nombre, equipo y fecha
- [ ] Se pueden registrar métricas de adopción semanales por área
- [ ] LineChart muestra evolución por área vs referencia del piloto original
- [ ] Council puede ver el dashboard en solo lectura
- [ ] Red flag se dispara si adopción en área cae bajo 20% después de 4 semanas
