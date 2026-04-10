# Contexto: AI Compass MVP

## Decisiones del usuario

- **Constantes compartidas:** Duplicar en backend/src/constants/ (opción B). Sin monorepo ni paquete shared por ahora.
- **Proveedor de IA:** Solo Gemini para MVP. Arquitectura multi-proveedor lista para Claude/OpenAI después.
- **Frontend:** Sub-plan detallado por cada página/componente con specs de props, store, comportamiento y estados UI.
- **PostgreSQL:** Disponible local, crear la base de datos `ai_compass` como parte del setup.
- **Alcance:** MVP completo de golpe. Validación intermedia por bloques (olas).
- **Priorización MoSCoW:** Must-Have (F-001 a F-006) primero, Should-Have (F-007 a F-010) en paralelo, Could-Have post-MVP.
- **Arquitectura:** 14 módulos en 5 olas, máximo 4 agentes paralelos.

## Decisiones inferidas del codebase

- Proyecto greenfield. No hay codebase existente.
- La spec define 6 dimensiones, 5 etapas, 3 roles, 20 preguntas guía (18 originales + 2 nuevas), 8 decisiones fundacionales, 10 reglas de red flags.
- Stack: React 19 + Vite + Tailwind + Zustand + Recharts (frontend), Express + PostgreSQL + JWT (backend).

## Conceptos incorporados del video Second Brain Enterprise

1. **3 niveles de implementación de IA:** prompting / no-code / custom — aplicado a Quick Wins
2. **Cadena de valor del cliente:** market-to-lead / lead-to-sale / sale-to-delivery / delivery-to-success / success-to-market — aplicado a Quick Wins y procesos
3. **Retornos decrecientes:** No todo lo que puede automatizarse debería automatizarse a escala ilimitada
4. **Remoto vs presencial:** Filtro rápido para leverage de IA (pregunta S2-PRO-04)
5. **Transformación de roles:** Cuando IA libera >30% del tiempo, el rol cambia y necesita incentivos (sección en pilotos)

## Mejoras al plan original

- ESLint strict + Prettier al scaffolding (M01)
- Error handler global al backend (M02)
- Constantes duplicadas en backend (M04)
- 2 preguntas nuevas en S2: S2-PRO-04 (remoto/presencial) y S2-PRO-05 (niveles de dificultad IA)
- 3 campos nuevos en Quick Wins: valueChainSegment, implementationLevel, diminishingReturns
- Sección "Impacto en roles" en pilotos (roleImpacts)
- Tasks 10-15 partidos en sub-tasks granulares con specs detalladas
- Stubs de rutas en App.tsx desde M08 para evitar conflictos de merge
- Product Discovery formalizado en 4 niveles

## Fuera de alcance

- Etapas 4-5 del journey (Escalamiento y Transformación)
- Providers de Claude y OpenAI (solo comentarios en registry)
- Generación de PPTX (Could-Have F-011)
- Editor de entregables (Could-Have F-012)
- Dashboard específico del Council (Could-Have F-013)
- Notificaciones push/email
- Deploy a producción
- Benchmark real por industria
- Multi-idioma

## Documentos de referencia

- Spec v2: `superpowers/specs/2026-04-10-ai-compass-design-v2.md`
- Plan maestro: `superpowers/plans/2026-04-10-ai-compass-master-plan.md`
- Plan original: `superpowers/plans/2026-04-10-ai-compass-implementation.md`
- Product Discovery: `docs/product/01-framing.md` a `docs/product/04-journeys.md`
- Features MoSCoW: `docs/product/03-features.md`
