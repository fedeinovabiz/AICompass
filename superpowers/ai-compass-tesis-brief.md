# AI Compass — Herramienta de Diagnostico de Madurez en IA Organizacional

## Presentacion del Proyecto

---

## 1. Contexto y Problema

Las organizaciones enfrentan un desafio critico: el 88% dice "usar IA", pero solo el 5.5% captura valor real (McKinsey, 2025). La brecha no es tecnologica — es de liderazgo, cultura y modelo operativo.

El problema concreto: **no existe una herramienta estructurada que permita diagnosticar de manera objetiva y basada en evidencia el nivel de madurez de una organizacion para adoptar IA.** Los diagnosticos actuales son manuales, subjetivos, y dependen enteramente de la experiencia del consultor.

### Oportunidad

Construir una plataforma que permita a un facilitador conducir un diagnostico de madurez en IA, procesando entrevistas con stakeholders mediante IA para generar un reporte objetivo, accionable y respaldado por evidencia textual.

---

## 2. Frameworks Academicos de Referencia

El modelo de madurez se construye sobre frameworks publicos validados por la industria:

| Framework | Fuente | Aporte al modelo |
|-----------|--------|------------------|
| Agentic AI Maturity Model (5 niveles) | Microsoft | Niveles de madurez y criterios de avance |
| State of AI / Rewired Framework | McKinsey (200+ transformaciones) | Factores criticos de exito y metricas de impacto |
| AI Adoption Framework (4 pilares x 3 fases x 6 temas) | Google Cloud | Estructura multidimensional del diagnostico |
| AI Trust Maturity Model (500 organizaciones) | McKinsey, 2026 | Gobernanza y confianza como dimensiones |
| Anthropic Economic Index | Anthropic, 2025-2026 | Impacto real de IA en tareas y roles |
| Optimizar-Acelerar-Transformar | Collective Academy (Pato Bichara) | Progresion practica de adopcion |

---

## 3. Modelo de Madurez: 6 Dimensiones

El diagnostico evalua la organizacion en 6 dimensiones:

### 3.1 Estrategia e IA
¿Existe una vision de como la IA encaja en la estrategia de negocio? ¿Hay presupuesto asignado? ¿El liderazgo habla de IA de manera concreta o generica?

### 3.2 Procesos
¿Estan los procesos clave documentados? ¿Se puede explicar paso a paso como se ejecutan las tareas criticas? Si no se le puede explicar a un becario, no se le puede explicar a la IA.

### 3.3 Datos
¿Donde vive la informacion? ¿Esta centralizada o dispersa? ¿Hay gobernanza minima de quien accede a que?

### 3.4 Tecnologia
¿Que herramientas de productividad usa la organizacion? ¿Hay infraestructura cloud? ¿Que opciones de IA estan mas cerca de implementar?

### 3.5 Cultura y Personas
¿Hay mentalidad de crecimiento o fija? ¿La gente ya usa herramientas de IA por cuenta propia? ¿El liderazgo predica con el ejemplo?

### 3.6 Gobernanza
¿Existe alguna politica de uso de IA? ¿Hay criterios sobre que datos pueden alimentar modelos externos? ¿Como se mide el impacto?

### Niveles de Madurez por Dimension

| Nivel | Significado |
|-------|-------------|
| 1 - Inexistente | No hay actividad ni conciencia |
| 2 - Incipiente | Esfuerzos aislados, sin estructura |
| 3 - Funcional | Estructura basica, resultados medibles |
| 4 - Avanzado | Practica madura, integrada en la operacion |

---

## 4. Estructura de Sesiones de Diagnostico

El diagnostico se realiza mediante sesiones estructuradas con diferentes stakeholders de la organizacion:

### Sesiones Core

| Sesion | Audiencia | Dimensiones que cubre | Duracion |
|--------|-----------|----------------------|----------|
| S1: Vision Ejecutiva | Sponsor + C-level | Estrategia, Gobernanza | 60 min |
| S2: Realidad Operativa | 2-3 lideres de area | Procesos, Cultura | 60-75 min |
| S3: Capacidad Tecnica | IT + responsables de datos | Tecnologia, Datos | 60 min |

### Sesiones de Profundizacion

Basandose en los hallazgos de las sesiones core, el sistema identifica areas que requieren sesiones adicionales de profundizacion. Por ejemplo:

- Si la dimension de Datos muestra debilidades criticas, se recomienda una sesion especifica de gobernanza de datos
- Si se detectan contradicciones entre lo que dice el C-level y los lideres de area, se recomienda una sesion de alineacion

### Sesion de Presentacion de Resultados

Una sesion final donde se presentan los hallazgos consolidados al equipo directivo, incluyendo el diagnostico visual (spider chart), analisis por dimension, y recomendaciones de accion.

---

## 5. Alcance Tecnico del Proyecto

### 5.1 Sistema de Input Triple

La plataforma soporta tres fuentes de informacion que se complementan:

**Capa 1 — Preguntas guia (siempre presente)**
El facilitador tiene un cuestionario estructurado por sesion y dimension. Las preguntas son la columna vertebral del diagnostico y guian la conversacion.

**Capa 2 — Notas del facilitador (opcional)**
El facilitador puede tomar notas durante la sesion que complementan las respuestas a las preguntas.

**Capa 3 — Transcripcion completa (opcional)**
Post-sesion, el facilitador puede subir la transcripcion de la reunion (texto plano, .vtt, .srt). La IA procesa la transcripcion completa.

### 5.2 Motor de IA — Procesamiento de Transcripciones

Este es el componente tecnico central del proyecto. La IA recibe los inputs de cada sesion y produce:

**Extraccion por pregunta:**
- Respuesta sugerida extraida de la transcripcion/notas
- Nivel de madurez sugerido para esa dimension (1-4)
- Citas de respaldo con atribucion (quien lo dijo, en que momento)
- Nivel de confianza de la extraccion (alto/medio/bajo)

**Hallazgos emergentes:**
- Alineacion o desalineacion entre participantes
- Identificacion de personas con alto engagement hacia IA (potenciales champions)
- Deteccion de resistencias o escepticismo
- Temas relevantes que surgieron y no estan cubiertos por las preguntas

**Analisis cross-sesion:**
Cuando se procesan las 3 sesiones core, la IA cruza la informacion para generar un diagnostico consolidado, detectando brechas entre lo que percibe la direccion y lo que viven las areas operativas.

### 5.3 Panel de Validacion Humana

La IA no decide — sugiere. Para cada respuesta extraida, el facilitador puede:

- **Aprobar**: la extraccion es correcta
- **Editar**: la IA capturo la idea pero necesita ajuste
- **Rechazar**: la interpretacion es incorrecta, el facilitador corrige
- **Marcar como no mencionado**: el tema no se toco en la sesion

Este patron de "IA sugiere, humano valida" asegura que el diagnostico final tiene doble respaldo: evidencia textual + validacion experta.

### 5.4 Abstraccion Multi-Modelo

El motor de IA esta disenado para ser agnostico del proveedor. Una interfaz comun permite conectar diferentes modelos (Google Gemini, Anthropic Claude, OpenAI GPT) sin modificar la logica de la aplicacion.

Esto permite:
- Cambiar de proveedor sin reescribir codigo
- Comparar resultados entre modelos
- Usar el modelo mas adecuado segun la tarea

Arquitectura:

```
aiService.ts (fachada publica)
  └── providers/
        ├── geminiProvider.ts
        ├── claudeProvider.ts
        └── openaiProvider.ts
  └── prompts/
        ├── sessionAnalysis.ts
        ├── transcriptExtraction.ts
        └── reportGeneration.ts
```

Los prompts estan separados de los proveedores. Cada provider adapta el prompt al formato de su API y devuelve el resultado en un formato comun.

### 5.5 Visualizacion de Resultados

**Spider Chart de Madurez:**
Grafico radar con las 6 dimensiones mostrando el nivel de la organizacion (1-4), con posibilidad de comparar contra benchmarks de industria.

**Reporte de Diagnostico:**
Documento generado automaticamente que incluye:
- Resumen ejecutivo
- Puntuacion por dimension con justificacion y evidencia
- Brechas criticas detectadas
- Mapa de personas (champions y resistencias identificadas)
- Recomendaciones de accion priorizadas

---

## 6. Arquitectura Tecnica

### Stack Propuesto

| Componente | Tecnologia |
|------------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Routing | React Router |
| Estado | Zustand |
| Graficos | Recharts |
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL |
| Autenticacion | JWT |
| IA | Multi-modelo (Gemini / Claude / OpenAI) |
| Archivos | Multer (carga de transcripciones) |

### Estructura del Proyecto

```
src/
  pages/
    Dashboard.tsx              # Lista de organizaciones
    SessionView.tsx            # Conducir/revisar sesion
    TranscriptReview.tsx       # Panel de validacion de extraccion IA
    DiagnosticReport.tsx       # Visualizacion de resultados
  components/
    SpiderChart.tsx            # Grafico radar de madurez
    QuestionCard.tsx           # Pregunta + respuesta + validacion
    TranscriptUploader.tsx     # Carga de transcripciones
    ConfidenceBadge.tsx        # Indicador de confianza IA
  stores/
    organizationStore.ts
    sessionStore.ts
  services/
    apiClient.ts
    ai/
      aiService.ts             # Fachada multi-modelo
      providers/               # Implementaciones por proveedor
      prompts/                 # Prompts separados por funcion
    transcriptParser.ts        # Parsing de .vtt/.srt/texto
  types/
    index.ts
  constants/
    questions.ts               # Preguntas por sesion y dimension
    dimensions.ts              # 6 dimensiones con niveles de madurez
```

### Principios de Arquitectura

- Separacion clara en archivos pequenos y enfocados (maximo 300 lineas)
- Tipos definidos desde el inicio
- Motor de IA desacoplado como servicio independiente
- Estado predecible con stores separados por dominio

---

## 7. Entregables del Proyecto

| Entregable | Descripcion |
|------------|-------------|
| Modelo de madurez | 6 dimensiones con preguntas estructuradas y niveles 1-4 |
| Modulo de sesiones | Crear y conducir sesiones con preguntas guia |
| Procesador de transcripciones | Parsing de archivos + extraccion con IA |
| Panel de validacion | Interfaz para revisar/aprobar sugerencias de IA |
| Motor multi-modelo | Abstraccion para Gemini/Claude/OpenAI |
| Spider chart | Visualizacion de madurez por dimension |
| Generador de reporte | Diagnostico consolidado con evidencia |

---

## 8. Valor Academico

Este proyecto tiene relevancia en multiples areas:

**Procesamiento de Lenguaje Natural:** Extraccion de informacion estructurada a partir de transcripciones de reuniones no estructuradas. Mapeo automatico de fragmentos conversacionales a un modelo de datos predefinido.

**Interaccion Humano-IA:** Patron de "IA sugiere, humano valida" como mecanismo de confianza y control de calidad. Estudio de niveles de confianza y precision de la extraccion.

**Sistemas de Soporte a la Decision:** La herramienta apoya la toma de decisiones organizacionales a traves de un diagnostico basado en evidencia, no en opinion.

**Arquitectura de Software:** Diseno de sistema multi-modelo con abstraccion de proveedor de IA, un patron cada vez mas relevante en la industria.

---

*Documento preparado por InovaBiz — Abril 2026*
