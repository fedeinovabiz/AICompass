# Feature: Benchmark de Madurez por Industria

## Contexto

Cuando el facilitador presenta el Spider Chart al comité, la pregunta inmediata es: "¿Estamos bien o mal comparados con otras empresas de nuestro sector?" Sin benchmark, el score es abstracto. Con benchmark, el score tiene contexto: "Ustedes están en 2.2 pero empresas similares están en 2.8 — hay oportunidad de mejora."

El benchmark también ayuda al facilitador a calibrar expectativas: si una empresa de manufactura de 200 empleados típicamente tiene Gobernanza en nivel 1, no es un red flag tan alarmante como si una empresa de tecnología de 200 empleados tiene el mismo score.

Fuente inicial: datos hardcodeados de frameworks de referencia. Se enriquece con datos reales a medida que InovaBiz acumula clientes.

## Datos

### Entidad nueva

```
IndustryBenchmark
|- id: uuid (PK)
|- industry: string — "Tecnología", "Farmacéutica", "Manufactura", "Servicios financieros", "Retail", "Otros"
|- size_category: string — "1-50", "51-200", "201-500", "501+"
|- dimension: DimensionKey — "estrategia", "procesos", etc.
|- avg_score: number — promedio de score para esta combinación
|- sample_size: number — cuántas organizaciones contribuyen
|- source: 'framework'|'real' — si viene de datos hardcodeados o de clientes reales
|- updated_at: timestamp
```

### Datos iniciales hardcodeados

Basados en McKinsey State of AI 2025, Microsoft Agentic AI Maturity Model, y McKinsey AI Trust Maturity Model:

| Industria | Tamaño | Estrategia | Procesos | Datos | Tecnología | Cultura | Gobernanza |
|-----------|--------|------------|----------|-------|------------|---------|------------|
| Tecnología | 51-200 | 2.5 | 2.0 | 2.5 | 3.0 | 2.5 | 1.5 |
| Tecnología | 201-500 | 3.0 | 2.5 | 3.0 | 3.5 | 2.5 | 2.0 |
| Farmacéutica | 51-200 | 2.0 | 2.0 | 2.5 | 2.5 | 1.5 | 2.0 |
| Farmacéutica | 201-500 | 2.5 | 2.5 | 3.0 | 3.0 | 2.0 | 2.5 |
| Manufactura | 51-200 | 1.5 | 2.0 | 1.5 | 2.0 | 1.5 | 1.0 |
| Manufactura | 201-500 | 2.0 | 2.5 | 2.0 | 2.5 | 2.0 | 1.5 |
| Servicios financieros | 51-200 | 2.5 | 2.0 | 3.0 | 3.0 | 2.0 | 2.5 |
| Servicios financieros | 201-500 | 3.0 | 2.5 | 3.5 | 3.5 | 2.5 | 3.0 |
| Retail | 51-200 | 2.0 | 1.5 | 2.0 | 2.5 | 2.0 | 1.0 |
| Retail | 201-500 | 2.5 | 2.0 | 2.5 | 3.0 | 2.0 | 1.5 |
| Otros | 51-200 | 2.0 | 1.5 | 2.0 | 2.5 | 1.5 | 1.0 |
| Otros | 201-500 | 2.5 | 2.0 | 2.5 | 3.0 | 2.0 | 1.5 |

Notas:
- Tecnología lidera en Tecnología y Estrategia (confirma Microsoft data)
- Servicios financieros lidera en Gobernanza y Datos (confirma McKinsey TMT data)
- Manufactura tiene los scores más bajos (confirma que procesos físicos limitan adopción)
- Todos tienen Gobernanza como dimensión más débil (confirma McKinsey AI Trust: promedio global 2.3/4)

### Enriquecimiento con datos reales

Cada vez que un diagnóstico se completa (cross_session_analysis generado), el sistema:
1. Identifica la industria y tamaño de la organización
2. Busca el benchmark correspondiente
3. Si `source = 'framework'` y no hay datos reales: crear nuevo registro con `source = 'real'` y sample_size = 1
4. Si ya hay datos reales: recalcular `avg_score = ((avg_score * sample_size) + new_score) / (sample_size + 1)`, incrementar sample_size
5. Los datos del framework se mantienen como fallback cuando no hay datos reales suficientes (sample_size < 3)

### Clasificación de tamaño

Mapeo del campo `size` de Organization al `size_category` del benchmark:
- Contiene "1-50" o número <= 50 → "1-50"
- Contiene "51-200" o número 51-200 → "51-200"
- Contiene "201-500" o número 201-500 → "201-500"
- Mayor → "501+"

## Pantallas

### Cambios en SpiderChart.tsx

El componente SpiderChart ya acepta prop `benchmark?: Partial<Record<DimensionKey, number>>`. Actualmente no se pasa. Ahora:

1. DiagnosticReportPage carga el benchmark de la API
2. Lo pasa al SpiderChart como prop
3. El chart renderiza la segunda línea (azul punteada) con label "Benchmark [industria]"

### Cambios en DiagnosticReportPage

- Agregar llamada a `GET /api/benchmarks?industry={industry}&size={sizeCategory}`
- Pasar resultado como `benchmark` prop al SpiderChart
- Debajo del chart: texto "Comparado con {sample_size} empresas de {industria} de {tamaño}"
- Si no hay benchmark: no mostrar línea (comportamiento actual)

### Cambios en MaturityMapPage

- Misma lógica: cargar benchmark y pasarlo al SpiderChart

### Cambios en CouncilDashboardPage

- Misma lógica: SpiderChart con benchmark

### Backend: Endpoint de benchmark

`GET /api/benchmarks?industry=Tecnología&size=51-200`

Retorna:
```json
{
  "industry": "Tecnología",
  "sizeCategory": "51-200",
  "scores": {
    "estrategia": 2.5,
    "procesos": 2.0,
    "datos": 2.5,
    "tecnologia": 3.0,
    "cultura": 2.5,
    "gobernanza": 1.5
  },
  "sampleSize": 1,
  "source": "framework"
}
```

### Backend: Migración + Seed

1. Crear tabla `industry_benchmarks`
2. Seed con datos hardcodeados de la tabla de arriba
3. Trigger o lógica en el endpoint de cross-analysis que actualice benchmarks con datos reales

## Lógica de Negocio

- **Validaciones**: Industry y size_category deben ser valores conocidos. Si no hay match exacto, usar "Otros" + size_category más cercano.
- **Cálculos**: Running average para datos reales. Mínimo sample_size 3 para considerar datos reales confiables (sino usar framework).
- **Privacidad**: Los benchmarks son anonimizados — solo promedios, nunca datos individuales de clientes.
- **Permisos**: Todos los roles pueden ver el benchmark. Solo el sistema actualiza los datos.

## Criterios de Done

- [ ] Spider Chart muestra línea de benchmark (azul punteada) cuando hay datos disponibles
- [ ] Benchmark hardcodeado funciona para 6 industrias x 4 tamaños x 6 dimensiones
- [ ] Al completar un diagnóstico, el benchmark se actualiza con datos reales
- [ ] Se muestra "Comparado con N empresas de [industria]" debajo del chart
- [ ] Si no hay benchmark para la combinación exacta, se usa "Otros"
- [ ] Los datos son anonimizados (solo promedios)
- [ ] Funciona en DiagnosticReportPage, MaturityMapPage y CouncilDashboardPage
- [ ] El reporte HTML/PDF también incluye la línea de benchmark
