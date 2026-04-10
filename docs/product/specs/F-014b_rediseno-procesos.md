# Feature: Herramienta de Rediseño de Procesos (Etapa 4)

## Contexto

Después de que los pilotos de Etapa 3 demuestran que la IA funciona en procesos específicos, la organización necesita identificar MÁS procesos candidatos a automatización y rediseñarlos end-to-end. Solo el 21% de las empresas rediseña workflows — los que lo hacen capturan 3x más valor (McKinsey State of AI 2025).

El facilitador necesita una herramienta para mapear procesos de la organización, evaluarlos por potencial de IA, y diseñar el workflow rediseñado. Esto va más allá del "proceso antes/después" simple del piloto — es un mapeo completo con pasos, actores, tiempos, herramientas, y puntos de decisión.

## Datos

### Entidades nuevas

```
ProcessMap
|- id: uuid (PK)
|- organization_id: FK -> organizations
|- name: string — "Proceso de facturación", "Onboarding de clientes"
|- description: text
|- value_chain_segment: ValueChainSegment
|- current_steps: JSONB — Array de ProcessStep
|- redesigned_steps: JSONB — Array de ProcessStep (nullable, se llena después)
|- implementation_level: ImplementationLevel
|- estimated_hours_saved_weekly: number
|- estimated_impact: string
|- priority_score: number — calculado: impacto / esfuerzo
|- status: 'mapped'|'analyzed'|'redesigned'|'approved'|'implementing'
|- created_at: timestamp

ProcessStep
(dentro del JSONB)
|- order: number
|- description: string
|- actor: string — quién lo hace
|- tool: string — con qué herramienta
|- time_minutes: number — cuánto tarda
|- is_manual: boolean — ¿requiere criterio humano?
|- ai_candidate: boolean — ¿la IA podría hacerlo?
|- ai_action: string — qué haría la IA (nullable)
```

### Relaciones
- Una Organization tiene muchos ProcessMap
- Un ProcessMap puede asociarse a un Pilot (si se convierte en piloto)

## Pantallas

### Pantalla 1: ProcessMapListPage (`/org/:orgId/processes`)

- **Layout**: Header + grid de ProcessMap cards
- **Componentes**:
  - ProcessCard: nombre, segmento de cadena de valor (badge), nivel de implementación (badge color), horas ahorradas, status, priority_score
  - Matriz impacto-esfuerzo: visualización de 4 cuadrantes con los procesos posicionados
  - Filtros: por valueChainSegment, por implementationLevel, por status
- **Estados**:
  - Empty: "No hay procesos mapeados. Usa los hallazgos del diagnóstico para empezar."
  - Loading: skeleton
  - Success: grid + matriz
  - Error: retry
- **Interacciones**:
  - Click en card → ProcessMapDetailPage
  - Botón "Mapear nuevo proceso"
  - Botón "Sugerir procesos con IA" — la IA analiza el diagnóstico y sugiere procesos candidatos

### Pantalla 2: ProcessMapDetailPage (`/org/:orgId/processes/:processId`)

- **Layout**: Header + 2 columnas (proceso actual vs rediseñado)
- **Componentes**:
  - Columna izquierda: "Proceso actual" — lista de pasos con actor, herramienta, tiempo, badge "manual"/"automatizable"
  - Columna derecha: "Proceso rediseñado" — lista de pasos con actor (humano o IA), herramienta, tiempo, badge "eliminado"/"nuevo"/"modificado"
  - Resumen: tiempo total antes vs después, % reducción, pasos eliminados, puntos de validación humana
  - Sección "Convertir en piloto": botón para crear un piloto a partir de este proceso rediseñado (pre-llena los campos del piloto)
- **Interacciones**:
  - Agregar/editar/eliminar pasos en ambas columnas
  - Marcar pasos como "candidato a IA"
  - Botón "Rediseñar con IA": la IA propone el proceso rediseñado basándose en los pasos actuales
  - Botón "Convertir en piloto"

## Lógica de Negocio

- **Validaciones**: Cada paso debe tener descripción y actor. El proceso rediseñado debe tener al menos un punto de validación humana.
- **Cálculos**: `priority_score = estimated_hours_saved_weekly * (implementation_level == 'prompting' ? 3 : implementation_level == 'no-code' ? 2 : 1)`. Tiempo total = suma de time_minutes de todos los pasos. % reducción = (tiempo_antes - tiempo_después) / tiempo_antes * 100.
- **Permisos**: Facilitador crea/edita. Council ve en solo lectura.
- **IA**: El endpoint "Sugerir procesos" analiza el diagnóstico (dimensión Procesos, hallazgos emergentes, respuestas de S2) y propone procesos candidatos. El endpoint "Rediseñar" toma los pasos actuales y propone pasos rediseñados.

## Criterios de Done

- [ ] Se pueden mapear procesos con pasos, actores, tiempos y herramientas
- [ ] El proceso se clasifica por cadena de valor y nivel de implementación
- [ ] Vista side-by-side del proceso actual vs rediseñado
- [ ] La IA sugiere procesos candidatos basándose en el diagnóstico
- [ ] La IA propone rediseño de pasos a partir del proceso actual
- [ ] Se puede convertir un proceso rediseñado en piloto con campos pre-llenados
- [ ] Matriz impacto-esfuerzo visualiza todos los procesos mapeados
- [ ] Funciona en mobile (responsive)
