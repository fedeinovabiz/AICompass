# AI Compass — Análisis de Gaps contra Frameworks de Referencia

## Metodología

Se evaluaron 6 frameworks contra la spec v2 de AI Compass:
1. McKinsey State of AI + Rewired Framework (200+ transformaciones)
2. McKinsey AI Trust Maturity Model (500 organizaciones, 2026)
3. Microsoft Agentic AI Maturity Model (5 niveles) + Copilot Adoption Playbook
4. Google Cloud AI Adoption Framework (4 pilares x 3 fases x 6 temas)
5. Alianzas Accenture-Anthropic + PwC-Anthropic (industrias reguladas)
6. Collective Academy — Optimizar-Acelerar-Transformar (Pato Bichara)

Cada concepto se clasifica como:
- **CUBIERTO**: Nuestra spec ya lo aborda bien
- **PARCIAL**: Lo toca pero necesita profundización
- **GAP**: No lo aborda y vale la pena incorporar
- **NO APLICA**: No relevante para nuestro alcance/público objetivo

---

## 1. ANÁLISIS DIMENSIÓN POR DIMENSIÓN

### Nuestras 6 dimensiones vs. los frameworks

| Nuestra dimensión | McKinsey Rewired | Microsoft (5 pilares) | Google Cloud (4 pilares) | Gap |
|---|---|---|---|---|
| Estrategia | Roadmap de valor | Estrategia IA y alineación | - (implícito) | CUBIERTO |
| Procesos | Adopción y scaling | Transformación de procesos | Procesos | CUBIERTO |
| Datos | Data embedida | Tecnología y datos | Datos | CUBIERTO |
| Tecnología | Entorno tecnológico | Tecnología y datos | Tecnología | CUBIERTO |
| Cultura | Bench de talento | Cultura, roles e incentivos | Personas | PARCIAL |
| Gobernanza | - (parte de operating model) | Gobernanza IA y seguridad | - (tema Secure) | PARCIAL |

### Dimensiones que OTROS frameworks tienen y NOSOTROS NO:

| Concepto | Framework | Relevancia para AI Compass | Veredicto |
|---|---|---|---|
| **Operating Model** | McKinsey Rewired (pilar dedicado) | ALTA — cómo se organiza la empresa para IA no es solo "procesos" | **GAP** |
| **Talento / Skills** | Rewired, Microsoft, Google | ALTA — separado de "Cultura". Skills gap es la barrera #1 (60% McKinsey) | **GAP** |
| **Trust / IA Responsable** | McKinsey AI Trust (modelo completo de 5 dimensiones) | MEDIA — nuestra Gobernanza lo cubre parcialmente pero no explícitamente | **PARCIAL** |
| **Seguridad** | Microsoft (pilar dedicado), Accenture-Anthropic | MEDIA — para industrias reguladas es crítico, pero nuestro público inicial no lo requiere tanto | **NO APLICA MVP** |

---

## 2. GAPS CRÍTICOS ENCONTRADOS (vale la pena incorporar)

### GAP 1: Rediseño de Workflows — El diferenciador #1 de éxito

**Fuente**: McKinsey State of AI 2025
**Hallazgo**: Solo 21% de empresas usando IA generativa han rediseñado workflows. Los "high performers" (6% con >5% EBIT) lo hacen al 55%. **El rediseño de workflows tiene el mayor efecto en captura de valor.**

**Estado en nuestra spec**: No lo abordamos. Nuestras sesiones diagnostican madurez y nuestros pilotos miden impacto, pero NO guiamos al cliente a rediseñar sus workflows. Los quick wins dicen "proceso antes/después" pero no hay una metodología de rediseño.

**Recomendación**: Agregar al flujo de Etapa 2-3 un paso explícito de **"Rediseño de Workflow"** antes de cada piloto. El facilitador, usando los hallazgos del diagnóstico, ayuda a mapear el workflow actual y diseñar el workflow con IA integrada. Esto es lo que separa "agregar IA como capa" de "integrar IA en el flujo".

**Impacto en spec**: Agregar al diseño de piloto una sección "Workflow antes/después" con pasos detallados, no solo descripción narrativa.

**Prioridad**: ALTA

---

### GAP 2: Champions / Red de adopción interna

**Fuente**: Microsoft Copilot Adoption Playbook
**Hallazgo**: Los Champions son el canal más efectivo para adopción peer-to-peer. Equipos con champions activos muestran +30% más adopción. Ratio recomendado: 1 champion por 50 usuarios.

**Estado en nuestra spec**: Identificamos "Champions" como hallazgo emergente de la IA (personas que ya usan IA por cuenta propia), pero NO los activamos como red de adopción. Son un dato del diagnóstico, no una palanca de la implementación.

**Recomendación**: En Etapa 3 (Pilotos), agregar una sección de **"Red de Champions"**: identificar champions del diagnóstico, asignarles rol formal en el piloto, crear canal de comunicación, sesiones semanales de "show & tell". Esto convierte un hallazgo diagnóstico en una palanca operativa.

**Impacto en spec**: Nuevo concepto en la entidad Piloto: `champions: ChampionAssignment[]` con nombre, área, responsabilidades.

**Prioridad**: ALTA

---

### GAP 3: Métricas de adopción vs. métricas de impacto

**Fuente**: McKinsey State of AI + Microsoft Copilot Playbook
**Hallazgo**: Menos del 20% implementa KPIs bien definidos para IA. Las empresas que rastrean KPIs son 3x más propensas a ver beneficio financiero. Microsoft distingue 4 capas: adopción, profundidad de uso, impacto empresarial, salud organizacional.

**Estado en nuestra spec**: Nuestros pilotos miden métricas de impacto (baseline vs actual), pero NO medimos adopción de la herramienta dentro del equipo piloto. Si 10 personas tienen Copilot pero solo 3 lo usan, el piloto "falla" y no sabemos por qué.

**Recomendación**: Agregar al tracking de pilotos un campo `adoptionMetrics`:
- % de equipo usando la herramienta activamente (semanal)
- Frecuencia de uso (diario/semanal/esporádico)
- Usuarios habituales vs novatos
- NPS del equipo piloto

**Impacto en spec**: 4 campos nuevos en el tracking semanal de pilotos.

**Prioridad**: ALTA

---

### GAP 4: Patrones de fracaso documentados

**Fuente**: Microsoft (8 patrones), McKinsey (7 patrones)
**Hallazgo**: Hay patrones recurrentes y predecibles de fracaso. Los más relevantes para nuestro contexto:
- **"The 20% Stall"**: Adopción llega a 20-25% y se detiene (falta de hero scenarios relevantes)
- **"Death by a Thousand Pilots"**: Muchos pilotos, ninguno escala (McKinsey)
- **"Missing Process Redesign"**: Agregar IA sin cambiar procesos (McKinsey)
- **"Shadow AI"**: Gobernanza restrictiva empuja al uso de herramientas no corporativas
- **"Sponsor ausente"**: Ya cubierto en nuestros Red Flags

**Estado en nuestra spec**: Nuestros Red Flags cubren algunos (sponsor ausente, piloto estancado, adopción baja), pero NO tenemos los patrones de fracaso documentados como herramienta educativa para el facilitador.

**Recomendación**: Agregar una constante `FAILURE_PATTERNS` con los patrones más relevantes. El facilitador los presenta al comité como "antipatrones a evitar". Esto educa al cliente y justifica las prácticas que proponemos.

**Impacto en spec**: Nueva constante educativa, no afecta modelo de datos. Se puede mostrar en la presentación final.

**Prioridad**: MEDIA

---

### GAP 5: Gobernanza progresiva con niveles explícitos

**Fuente**: Microsoft (5 niveles de gobernanza), McKinsey AI Trust (4 niveles)
**Hallazgo**: Microsoft define gobernanza progresiva con niveles explícitos: sin gobernanza (L100) -> básica documentada (L200) -> formal con modelo definido (L300) -> automatizada basada en riesgo (L400) -> predictiva (L500). McKinsey muestra que propiedad clara de gobernanza genera 44% más madurez.

**Estado en nuestra spec**: Nuestro principio rector es "la gobernanza crece con la organización" y tenemos la dimensión Gobernanza con niveles 1-4. Pero nuestras 8 decisiones fundacionales son estáticas — se toman una vez y no evolucionan. No hay un roadmap de cómo la gobernanza debe crecer de Etapa 1 a Etapa 5.

**Recomendación**: Agregar a cada etapa un **"nivel de gobernanza esperado"** con prácticas mínimas:
- Etapa 1: Política mínima viable (qué datos no usar con IA)
- Etapa 2: Roles de gobernanza definidos (quién decide qué)
- Etapa 3: Métricas de cumplimiento (tracking de uso, auditoría básica)
- Etapa 4-5: Gobernanza federada, monitoreo automatizado

**Impacto en spec**: Enriquecer la constante `STAGES` con `governanceExpectations` por etapa.

**Prioridad**: MEDIA

---

### GAP 6: Cadena de valor como framework de mapeo de procesos

**Fuente**: Video Second Brain Enterprise (ya incorporado parcialmente), Google Cloud (Procesos como pilar)
**Hallazgo**: Google Cloud enfatiza que los procesos deben evaluarse en su contexto de creación de valor, no en aislamiento. Nuestra cadena de valor (market-to-lead -> lead-to-sale -> etc.) ya está en la spec v2 como campo de Quick Wins, pero NO se usa durante las sesiones de diagnóstico.

**Estado en nuestra spec**: `valueChainSegment` existe en Quick Wins pero las preguntas de la sesión operativa (S2) no mapean procesos a la cadena de valor explícitamente.

**Recomendación**: Agregar 1 pregunta a S2 que pida al equipo operativo mapear sus procesos más dolorosos a la cadena de valor. Esto alimenta mejor el análisis cross-sesión y los quick wins.

**Impacto en spec**: 1 pregunta nueva en S2.

**Prioridad**: BAJA (ya tenemos las 2 preguntas nuevas del video, no sobrecargar S2)

---

### GAP 7: Transformación cultural como prerrequisito

**Fuente**: Collective Academy (Pato Bichara), McKinsey Rewired
**Hallazgo**: Bichara dice "las empresas deben transformarse culturalmente antes de usar IA". McKinsey dice "toda transformación de IA es una transformación de gente". El 60% cita brechas de conocimiento como barrera principal.

**Estado en nuestra spec**: Tenemos la dimensión Cultura con niveles 1-4 y detectamos "resistencia" como hallazgo emergente. Pero NO proponemos acciones concretas de transformación cultural. Si la cultura está en rojo, recomendamos un deep dive, pero ¿qué se hace en ese deep dive?

**Recomendación**: Para el deep dive de Cultura (trigger: "cultura en rojo"), agregar una guía de contenido:
1. Identificar beachheads culturales (puntos de resistencia)
2. Mapear incentivos actuales vs. necesarios
3. Diseñar narrativa de "IA como amplificador, no reemplazo"
4. Proponer programa de champions internos
5. Definir quick wins culturales (show & tell, demos públicas del líder)

**Impacto en spec**: Enriquecer la guía de deep dives con contenido específico para cultura.

**Prioridad**: MEDIA

---

### GAP 8: Assessment de readiness antes del engagement

**Fuente**: Accenture-Anthropic (Innovation Hub Assessment), Google Cloud (AIR Program), Microsoft (Readiness Checklist)
**Hallazgo**: Los 3 grandes cloud providers y las consultoras proponen un assessment de readiness ANTES de empezar la implementación. No es el diagnóstico completo — es un filtro rápido para saber si la organización está lista para el proceso.

**Estado en nuestra spec**: No tenemos un paso pre-engagement. El facilitador crea la organización y directamente empieza con las sesiones de diagnóstico. No hay filtro.

**Recomendación**: Agregar un **"Pre-Assessment Rápido"** (15 preguntas, 20 minutos) que el facilitador puede hacer en la primera conversación comercial. Evalúa: ¿hay sponsor ejecutivo?, ¿hay presupuesto asignado?, ¿hay urgencia real?, ¿qué herramientas de IA usan hoy?, ¿cuántos empleados?. Resultado: score de readiness que determina si el cliente es candidato para el programa.

**Impacto en spec**: Nuevo concepto pre-engagement. Podría ser un formulario separado o la primera pantalla al crear una organización.

**Prioridad**: ALTA para el negocio (califica leads), BAJA para el MVP técnico (el facilitador puede hacerlo verbalmente).

---

## 3. LO QUE NUESTRA SPEC HACE BIEN (confirmado por frameworks)

| Aspecto | Confirmado por | Detalle |
|---|---|---|
| **Gobernanza progresiva** | McKinsey Trust, Microsoft L100-L500 | Nuestro principio "la gobernanza crece con la org" es correcto. Los frameworks lo validan. |
| **Diagnóstico basado en evidencia** | Google Cloud AIR, Accenture Assessment | Nuestro sistema de triple input (preguntas + notas + transcripción) es más rico que cualquier assessment estándar. |
| **Spider Chart por dimensiones** | Microsoft Radar Chart, Google Pillar Assessment | Todos usan visualización multidimensional. Nuestro spider chart está alineado. |
| **Red Flags automáticos** | McKinsey (sponsor ausente = predictor #1), Microsoft (8 antipatrones) | Nuestros red flags cubren los patrones más críticos. |
| **Comité de IA con decisiones fundacionales** | Rewired (C-suite contract), Microsoft (Executive Sponsor) | Nuestras 8 decisiones formalizan lo que McKinsey recomienda como "contrato con el C-suite". |
| **Pilotos con baseline y métricas** | Todos | Nadie discute que los pilotos necesitan baseline. Estamos alineados. |
| **3 niveles de implementación (prompting/no-code/custom)** | Video SBE, Microsoft (3 niveles similares) | Ya incorporados en v2. |
| **Detección de Champions** | Microsoft Copilot Playbook | Detectamos champions, pero necesitamos activarlos (GAP 2). |
| **Impacto en roles** | Video SBE, McKinsey (organizational plasticity) | Ya incorporado en v2 como roleImpacts en pilotos. |

---

## 4. LO QUE NO APLICA A NUESTRO CONTEXTO

| Concepto | Framework | Por qué no aplica |
|---|---|---|
| **Compliance API / Audit trails técnicos** | Accenture-Anthropic, PwC-Anthropic | Nuestro público no es empresa regulada (bancos, salud). Es pyme 50-500 empleados. |
| **Nivel 400-500 de Microsoft** | Microsoft Agentic AI | Nuestros clientes están en nivel 100-200. Llevarlos a 300 es el objetivo. Agentic AI es futuro. |
| **MLOps y pipelines de ML** | Google Cloud (Automate, Scale) | Nuestros clientes no entrenan modelos. Usan herramientas existentes (Copilot, ChatGPT). |
| **EU AI Act compliance** | McKinsey Trust | No aplica a pymes LATAM en etapa temprana. |
| **Multi-agent orchestration** | Microsoft L400-500 | Etapas 4-5 (fuera del MVP). |
| **Data mesh / arquitectura cloud** | Google Cloud | Demasiado avanzado para público objetivo. |

---

## 5. RESUMEN DE RECOMENDACIONES PRIORIZADAS

### ALTA PRIORIDAD (incorporar antes de implementar)

| # | Gap | Cambio | Impacto en spec/plan |
|---|---|---|---|
| 1 | Rediseño de workflows | Agregar paso de "Workflow Design" al diseño de pilotos con mapeo detallado antes/después | Modificar entidad Pilot + agregar sección en PilotDetailPage |
| 2 | Champions como red de adopción | Convertir champions del diagnóstico en roles formales del piloto | Nueva sub-entidad ChampionAssignment en Pilot |
| 3 | Métricas de adopción en pilotos | Agregar % adopción, frecuencia de uso, NPS del equipo al tracking semanal | 4 campos nuevos en PilotMetricEntry |

### MEDIA PRIORIDAD (incorporar durante o después del MVP)

| # | Gap | Cambio | Impacto en spec/plan |
|---|---|---|---|
| 4 | Patrones de fracaso documentados | Nueva constante FAILURE_PATTERNS como herramienta educativa para el facilitador | Nueva constante, sin impacto en DB |
| 5 | Gobernanza progresiva por etapa | Agregar governanceExpectations a cada etapa | Enriquecer constante STAGES |
| 6 | Guía de contenido para deep dives | Especificar qué se hace en cada deep dive (especialmente cultura) | Enriquecer guía de deep dives |
| 7 | Transformación cultural explícita | El deep dive de cultura incluye: beachheads, incentivos, narrativa, programa champions | Contenido del facilitador |

### BAJA PRIORIDAD (post-MVP o propietario del facilitador)

| # | Gap | Cambio |
|---|---|---|
| 8 | Pre-assessment de readiness | Formulario rápido pre-engagement (el facilitador puede hacerlo verbalmente por ahora) |
| 9 | Cadena de valor en S2 | Ya tenemos 2 preguntas nuevas, no sobrecargar |

---

## 6. DATOS DUROS PARA EL PITCH COMERCIAL

Los frameworks aportan datos que fortalecen la narrativa comercial de AI Compass:

| Dato | Fuente | Cómo usarlo |
|---|---|---|
| 88% de empresas usa IA, solo 6% captura valor real | McKinsey 2025 | "La mayoría está haciendo IA mal. Nosotros le mostramos cómo hacerlo bien." |
| El rediseño de workflows es el factor #1 de éxito | McKinsey 2025 | "No basta con dar herramientas. Hay que rediseñar cómo trabaja." |
| Solo 21% ha rediseñado workflows | McKinsey 2025 | "El 79% está dejando dinero en la mesa." |
| Propiedad clara de gobernanza = 44% más madurez | McKinsey Trust 2026 | "El comité de IA que proponemos no es burocracia, es el multiplicador de éxito." |
| Champions generan +30% más adopción | Microsoft 2025 | "Los Champions que identificamos en el diagnóstico son su arma secreta." |
| $50K gastados en IA sin resultado | Video SBE | "¿Cuánto ha invertido sin saber si funcionó?" |
| 70% de transformaciones digitales fallan | McKinsey Rewired | "Nuestro proceso existe para que usted esté en el 30% que tiene éxito." |
| Promedio global de madurez RAI: 2.3/4 | McKinsey Trust 2026 | "La mayoría de las empresas ni siquiera tiene gobernanza básica." |
| ROI de IA: ~8 meses payback | Google Cloud 2025 | "Con el piloto correcto, ve resultados en menos de un trimestre." |

---

*Análisis generado el 2026-04-10. Fuentes: McKinsey, Microsoft, Google Cloud, Accenture, PwC, Collective Academy.*
