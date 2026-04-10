# Feature: Dashboard de Transformación (Etapa 5)

## Contexto

Cuando una organización llega a Etapa 5, necesita una vista consolidada de todo el recorrido: desde el diagnóstico inicial hasta el estado actual de transformación. El comité y el facilitador necesitan ver el progreso acumulado, el ROI total, y cómo ha evolucionado la madurez.

Este NO es un módulo complejo de Centro de Excelencia — es una vista consolidada que agrega datos que ya existen en la plataforma.

## Datos

### Entidades nuevas

```
AIToolCatalog
|- id: uuid (PK)
|- organization_id: FK -> organizations
|- name: string — "ChatGPT Team", "Copilot", "Make"
|- category: 'llm'|'no-code'|'custom'|'analytics'|'other'
|- licenses: number
|- monthly_cost: number
|- teams_using: JSONB — Array de strings
|- status: 'active'|'evaluating'|'deprecated'
|- added_at: timestamp

GovernanceEvolution
|- id: uuid (PK)
|- organization_id: FK -> organizations
|- original_decision_number: number — referencia a decisión fundacional
|- evolution_date: date
|- change_description: text — "Se amplió la política de datos para incluir IA generativa interna"
|- decided_by: string
```

### Datos derivados (sin tabla nueva)
- Total procesos rediseñados: COUNT de ProcessMap con status 'implementing' o 'approved'
- Horas liberadas totales: SUM de estimated_hours_saved_weekly de pilotos escalados * semanas activas
- ROI consolidado: cálculo desde pilot metrics vs costos de herramientas
- Evolución del spider chart: comparar maturity_scores actual vs primer cross_session_analysis

## Pantallas

### Pantalla 1: TransformationDashboardPage (`/org/:orgId/transformation`)

- **Layout**: Header + 4 secciones con KPIs y detalle
- **Componentes**:
  - **KPI Cards (fila superior)**: Total procesos rediseñados, Horas liberadas/semana, ROI estimado, Herramientas IA adoptadas
  - **Evolución de madurez**: 2 Spider Charts superpuestos — "Día 1" (primer diagnóstico) vs "Hoy" (scores actuales). Muestra la progresión visual.
  - **Catálogo de herramientas IA**: tabla con nombre, categoría (badge), licencias, costo mensual, equipos, estado. Botón agregar herramienta.
  - **Evolución de gobernanza**: timeline de cambios a las decisiones fundacionales. Muestra la decisión original y las evoluciones.
  - **Historial de etapas**: timeline visual de cuándo la organización avanzó de cada etapa, con duración en cada una.
- **Estados**:
  - Empty: "Esta vista se llena a medida que la organización avanza por las etapas."
  - Loading: skeleton
  - Success: dashboard completo con datos acumulados
- **Interacciones**:
  - Agregar/editar herramientas IA al catálogo
  - Registrar evolución de decisiones fundacionales
  - Exportar resumen como PDF (reutilizar endpoint de reportes)

## Lógica de Negocio

- **Validaciones**: El catálogo de herramientas requiere nombre y categoría. Las evoluciones de gobernanza requieren descripción y fecha.
- **Cálculos**:
  - ROI = (horas_liberadas_semanales * costo_hora_promedio * semanas) - (costo_mensual_herramientas * meses)
  - Evolución de madurez: diff entre scores del primer cross_session_analysis y maturity_scores actual
- **Permisos**: Facilitador edita. Council ve todo en solo lectura.

## Criterios de Done

- [ ] KPI cards muestran datos acumulados reales (procesos, horas, ROI, herramientas)
- [ ] Spider Chart dual muestra "Día 1" vs "Hoy" con diferencia visual clara
- [ ] Catálogo de herramientas IA es editable con CRUD completo
- [ ] Evolución de gobernanza muestra timeline de cambios a decisiones fundacionales
- [ ] Timeline de etapas muestra historial con duraciones
- [ ] Council puede ver todo en solo lectura
- [ ] Se puede exportar resumen como PDF/HTML
