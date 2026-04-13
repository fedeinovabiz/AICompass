# Casos de Prueba — AI Operating Level + Madurez por Departamento

**Fecha:** 2026-04-13
**Feature:** AI Operating Level, Áreas Departamentales, RF17
**Servidores:** Backend :3002 | Frontend :5173

---

## Nivel 1 — Validación de Negocio

### TC-001: Crear área hereda scores organizacionales correctamente

**Intención:** Al crear un área, sus maturity_scores deben ser copia exacta del baseline organizacional. No inventados, no vacíos.

**Pasos:**
1. Query BD: obtener maturity_scores de la organización
2. POST /api/areas con standardArea="ventas"
3. Query BD: obtener maturity_scores del área creada
4. Comparar campo por campo: cada dimensión del área = misma dimensión de la org

**Validaciones 1A (Completitud):**
- assessment_status = 'inherited'
- assessed_at = NULL
- maturity_scores tiene las 6 dimensiones (estrategia, procesos, datos, tecnologia, cultura, gobernanza)
- display_name = 'ventas'

**Validaciones 1B (Reglas):**
- Cada score del área = mismo score de la org (copia exacta, no promedio, no transformación)

---

### TC-002: Mini-assessment actualiza scores del área correctamente

**Intención:** El mini-assessment de 12 preguntas (2 por dimensión) debe producir scores propios por dimensión, calculados como promedio de las 2 respuestas.

**Pasos:**
1. Tener un área con status='inherited'
2. POST /api/areas/:id/mini-assessment con 12 answers
3. Query BD: verificar nuevo estado

**Input de prueba:**
- estrategia: levels [3, 4] → promedio = 3.5 → redondeado = 4
- procesos: levels [1, 2] → promedio = 1.5 → redondeado = 2
- datos: levels [4, 4] → promedio = 4
- tecnologia: levels [2, 3] → promedio = 2.5 → redondeado = 3
- cultura: levels [1, 1] → promedio = 1
- gobernanza: levels [3, 3] → promedio = 3

**Validaciones 1A:**
- assessment_status cambió a 'mini-assessed'
- assessed_at tiene timestamp (no NULL)
- maturity_scores actualizado con valores nuevos

**Validaciones 1B (cálculo manual):**
- estrategia = round((3+4)/2) = round(3.5) = 4
- procesos = round((1+2)/2) = round(1.5) = 2
- datos = round((4+4)/2) = 4
- tecnologia = round((2+3)/2) = round(2.5) = 3
- cultura = round((1+1)/2) = 1
- gobernanza = round((3+3)/2) = 3

---

### TC-003: AI Operating Level se calcula correctamente según pilotos

**Intención:** El nivel global debe reflejar la capacidad más avanzada demostrada. Con pilotos activos tipo redesign, debe ser al menos L2-L3.

**Pasos:**
1. GET /api/areas/ai-level/organization/:orgId
2. Query BD: contar pilotos activos y sus tipos
3. Validar que el level calculado coincide con el algoritmo

**Validaciones 1B:**
- Si hay pilotos activos con implementationType='redesign' y tool no vacío → nivel >= 3
- Si solo hay pilotos activos sin redesign → nivel = 2
- Si no hay pilotos activos → nivel = 1
- Labels en español e inglés correctos para el nivel retornado

---

### TC-004: Reset a heredado restaura scores organizacionales

**Intención:** Después de un mini-assessment, el facilitador puede volver a scores heredados. Debe restaurar exactamente los scores org.

**Pasos:**
1. Área con status='mini-assessed' (TC-002)
2. POST /api/areas/:id/reset-to-inherited
3. Comparar scores resultantes con org baseline

**Validaciones 1A:**
- assessment_status = 'inherited'
- assessed_at = NULL
- maturity_scores = scores de la organización (no los del mini-assessment)

---

### TC-005: RF17 se dispara con 2+ pilotos activos en área heredada

**Intención:** El red flag RF17 debe alertar cuando un área tiene múltiples pilotos sin diagnóstico propio. Es un warning, no un bloqueo.

**Pasos:**
1. Crear área con status='inherited'
2. Crear 2 pilotos vinculados a esa área con status='active'
3. GET /api/red-flags/organization/:orgId
4. Verificar que RF17 aparece

**Validaciones 1B:**
- RF17 severity = 'warning'
- RF17 stage = 3
- Si el área tiene mini-assessment, RF17 NO debe dispararse

---

### TC-006: Eliminar área con pilotos es rechazado

**Intención:** Proteger integridad referencial — no se puede eliminar un área que tiene pilotos.

**Pasos:**
1. Área con 1+ piloto vinculado
2. DELETE /api/areas/:id
3. Esperar respuesta 400

**Validaciones:**
- HTTP 400
- message contiene "pilotos vinculados"
- Área sigue existiendo en BD

---

## Nivel 2 — Validación Funcional de UI

### TC-007: Página de lista de áreas muestra áreas correctamente

**Pasos:**
1. Navegar a /org/:orgId/areas
2. Verificar que se muestran las áreas creadas
3. Cada card muestra: nombre, status icon, AI level badge, conteo de pilotos

---

### TC-008: Detalle de área muestra spider chart y pilotos

**Pasos:**
1. Click en un área desde la lista
2. Verificar que muestra: nombre, badge de assessment status, AI Operating Level badge
3. Verificar spider chart con 6 dimensiones
4. Verificar sección de pilotos vinculados
5. Si status='inherited', muestra banner amarillo + botón "Realizar mini-assessment"

---

### TC-009: Mini-assessment flow completo en UI

**Pasos:**
1. Desde área inherited, click "Realizar mini-assessment"
2. Verificar 12 preguntas (2 por dimensión)
3. Responder todas las preguntas
4. Click "Guardar mini-assessment"
5. Redirige a detalle del área
6. Status cambió a 'mini-assessed'
7. Banner amarillo desapareció

---

### TC-010: AI Operating Level badge en Dashboard

**Pasos:**
1. Navegar a /dashboard
2. Verificar que las org cards muestran el badge de AI Operating Level
3. Badge muestra nivel correcto (L1-L4) con etiqueta en español

---

## Nivel 3 — Regresión y Edge Cases

### TC-011: Pilotos existentes siguen funcionando sin área

**Pasos:**
1. GET /api/pilots/organization/:orgId
2. Verificar que pilotos con departmentAreaId=null se listan normalmente
3. PUT /api/pilots/:id con departmentAreaId=null → no rompe

---

### TC-012: Crear área duplicada es rechazada

**Pasos:**
1. POST /api/areas con standardArea="ventas" para misma org (ya existe de TC-001)
2. Esperar error de constraint UNIQUE

---

### TC-013: Mini-assessment incompleto no se puede enviar

**Pasos UI:**
1. Navegar a mini-assessment
2. Responder solo 8 de 12 preguntas
3. Botón "Guardar" debe estar deshabilitado
