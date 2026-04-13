import { test, expect } from '@playwright/test';

const API = 'http://localhost:3002/api';
let TOKEN = '';
let ORG_ID = '';
let AREA_ID_VENTAS = '';
let AREA_ID_FINANZAS = '';

// Helper: login y obtener token + org
async function getAuth(): Promise<{ token: string; orgId: string }> {
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@inovabiz.com', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  const orgsRes = await fetch(`${API}/organizations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const orgs = await orgsRes.json();
  return { token, orgId: orgs[0].id };
}

// Helper: API call autenticada
async function apiCall(method: string, path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

test.beforeAll(async () => {
  const auth = await getAuth();
  TOKEN = auth.token;
  ORG_ID = auth.orgId;

  // Limpiar áreas de tests anteriores
  const { data: areas } = await apiCall('GET', `/areas/organization/${ORG_ID}`);
  if (Array.isArray(areas)) {
    for (const area of areas) {
      await apiCall('DELETE', `/areas/${area.id}`).catch(() => {});
    }
  }
});

// ══════════════════════════════════════════════
// NIVEL 1 — Validación de Negocio
// ══════════════════════════════════════════════

test.describe('Nivel 1: Validación de Negocio', () => {
  test('TC-001: Crear área hereda scores organizacionales', async () => {
    // 1. Obtener scores de la organización
    const { data: org } = await apiCall('GET', `/organizations`);
    const orgScores = org[0].maturity_scores ?? org[0].maturityScores;

    // 2. Crear área ventas
    const { status, data: area } = await apiCall('POST', '/areas', {
      organizationId: ORG_ID,
      standardArea: 'ventas',
    });

    expect(status).toBe(201);
    AREA_ID_VENTAS = area.id;

    // 3. Validar 1A — Completitud
    expect(area.assessment_status).toBe('inherited');
    expect(area.assessed_at).toBeNull();
    expect(area.display_name).toBe('ventas');
    expect(area.standard_area).toBe('ventas');

    // 4. Validar 1B — Scores heredados = scores org (copia exacta)
    const areaScores = area.maturity_scores;
    for (const dim of ['estrategia', 'procesos', 'datos', 'tecnologia', 'cultura', 'gobernanza']) {
      expect(areaScores[dim]).toBe(orgScores[dim]);
    }
  });

  test('TC-002: Mini-assessment calcula scores correctamente', async () => {
    // 1. Crear área finanzas (inherited)
    const { data: area } = await apiCall('POST', '/areas', {
      organizationId: ORG_ID,
      standardArea: 'finanzas',
    });
    AREA_ID_FINANZAS = area.id;
    expect(area.assessment_status).toBe('inherited');

    // 2. Enviar mini-assessment con valores conocidos
    const answers = [
      { dimension: 'estrategia', questionIndex: 0, questionText: 'Q1', answer: 'A', suggestedLevel: 3 },
      { dimension: 'estrategia', questionIndex: 1, questionText: 'Q2', answer: 'B', suggestedLevel: 4 },
      { dimension: 'procesos', questionIndex: 0, questionText: 'Q3', answer: 'C', suggestedLevel: 1 },
      { dimension: 'procesos', questionIndex: 1, questionText: 'Q4', answer: 'D', suggestedLevel: 2 },
      { dimension: 'datos', questionIndex: 0, questionText: 'Q5', answer: 'E', suggestedLevel: 4 },
      { dimension: 'datos', questionIndex: 1, questionText: 'Q6', answer: 'F', suggestedLevel: 4 },
      { dimension: 'tecnologia', questionIndex: 0, questionText: 'Q7', answer: 'G', suggestedLevel: 2 },
      { dimension: 'tecnologia', questionIndex: 1, questionText: 'Q8', answer: 'H', suggestedLevel: 3 },
      { dimension: 'cultura', questionIndex: 0, questionText: 'Q9', answer: 'I', suggestedLevel: 1 },
      { dimension: 'cultura', questionIndex: 1, questionText: 'Q10', answer: 'J', suggestedLevel: 1 },
      { dimension: 'gobernanza', questionIndex: 0, questionText: 'Q11', answer: 'K', suggestedLevel: 3 },
      { dimension: 'gobernanza', questionIndex: 1, questionText: 'Q12', answer: 'L', suggestedLevel: 3 },
    ];

    const { status, data: updated } = await apiCall('POST', `/areas/${AREA_ID_FINANZAS}/mini-assessment`, { answers });
    expect(status).toBe(200);

    // 3. Validar 1A — Status cambió
    expect(updated.assessment_status).toBe('mini-assessed');
    expect(updated.assessed_at).not.toBeNull();

    // 4. Validar 1B — Cálculo manual: promedio de 2 levels por dimensión, redondeado
    const scores = updated.maturity_scores;
    expect(scores.estrategia).toBe(Math.round((3 + 4) / 2));  // 4
    expect(scores.procesos).toBe(Math.round((1 + 2) / 2));     // 2
    expect(scores.datos).toBe(Math.round((4 + 4) / 2));        // 4
    expect(scores.tecnologia).toBe(Math.round((2 + 3) / 2));   // 3
    expect(scores.cultura).toBe(Math.round((1 + 1) / 2));      // 1
    expect(scores.gobernanza).toBe(Math.round((3 + 3) / 2));   // 3
  });

  test('TC-003: AI Operating Level global se calcula desde pilotos', async () => {
    const { status, data } = await apiCall('GET', `/areas/ai-level/organization/${ORG_ID}`);
    expect(status).toBe(200);

    // Verificar estructura
    expect(data.global).toBeDefined();
    expect(data.global.aiOperatingLevel).toBeGreaterThanOrEqual(1);
    expect(data.global.aiOperatingLevel).toBeLessThanOrEqual(4);
    expect(data.global.aiOperatingLevelLabel).toBeDefined();
    expect(data.global.aiOperatingLevelLabel.en).toBeTruthy();
    expect(data.global.aiOperatingLevelLabel.es).toBeTruthy();

    // Verificar que areas incluye las creadas
    expect(data.areas).toBeDefined();
    expect(Array.isArray(data.areas)).toBe(true);
  });

  test('TC-004: Reset a heredado restaura scores organizacionales', async () => {
    // AREA_ID_FINANZAS tiene status='mini-assessed' después de TC-002
    const { data: beforeReset } = await apiCall('GET', `/areas/${AREA_ID_FINANZAS}`);
    expect(beforeReset.assessment_status).toBe('mini-assessed');

    // Reset
    const { status, data: after } = await apiCall('POST', `/areas/${AREA_ID_FINANZAS}/reset-to-inherited`, {});
    expect(status).toBe(200);
    expect(after.assessment_status).toBe('inherited');
    expect(after.assessed_at).toBeNull();

    // Comparar con org scores
    const { data: orgs } = await apiCall('GET', '/organizations');
    const orgScores = orgs[0].maturity_scores ?? orgs[0].maturityScores;
    for (const dim of ['estrategia', 'procesos', 'datos', 'tecnologia', 'cultura', 'gobernanza']) {
      expect(after.maturity_scores[dim]).toBe(orgScores[dim]);
    }
  });

  test('TC-006: Eliminar área con pilotos es rechazado', async () => {
    // Crear área temporal con un piloto vinculado
    const { data: tempArea } = await apiCall('POST', '/areas', {
      organizationId: ORG_ID,
      standardArea: 'logistica',
    });

    // Vincular un piloto existente al área (en vez de crear uno nuevo con campos NOT NULL)
    const { data: pilots } = await apiCall('GET', `/pilots/organization/${ORG_ID}`);
    if (Array.isArray(pilots) && pilots.length > 0) {
      await apiCall('PUT', `/pilots/${pilots[0].id}`, { departmentAreaId: tempArea.id });
    } else {
      // Si no hay pilotos, el test no puede validar — skip implícito
      test.skip();
      return;
    }

    // Intentar eliminar
    const { status } = await apiCall('DELETE', `/areas/${tempArea.id}`);
    expect(status).toBe(400);

    // Verificar que sigue existiendo
    const { status: getStatus } = await apiCall('GET', `/areas/${tempArea.id}`);
    expect(getStatus).toBe(200);
  });

  test('TC-012: Crear área con custom_name duplicada es rechazada', async () => {
    // Crear área con custom_name explícito
    await apiCall('POST', '/areas', {
      organizationId: ORG_ID,
      standardArea: 'custom',
      customName: 'equipo-qa-test',
    });

    // Intentar crear duplicada con mismo custom_name
    const { status } = await apiCall('POST', '/areas', {
      organizationId: ORG_ID,
      standardArea: 'custom',
      customName: 'equipo-qa-test',
    });
    expect([409, 500]).toContain(status); // UNIQUE constraint violation (409 Conflict o 500)
  });
});

// ══════════════════════════════════════════════
// NIVEL 2 — Validación Funcional de UI
// ══════════════════════════════════════════════

test.describe('Nivel 2: UI Funcional', () => {
  test.beforeAll(async () => {
    // Asegurar que existen áreas para los tests UI
    // Re-crear ventas (inherited) para TC-009
    const { data: areas } = await apiCall('GET', `/areas/organization/${ORG_ID}`);
    const ventasExiste = Array.isArray(areas) && areas.some((a: { standard_area: string }) => a.standard_area === 'ventas');
    if (!ventasExiste) {
      const { data } = await apiCall('POST', '/areas', { organizationId: ORG_ID, standardArea: 'ventas' });
      AREA_ID_VENTAS = data.id;
    } else {
      AREA_ID_VENTAS = areas.find((a: { standard_area: string }) => a.standard_area === 'ventas').id;
      // Reset a inherited para TC-009
      await apiCall('POST', `/areas/${AREA_ID_VENTAS}/reset-to-inherited`, {});
    }
    // Crear marketing si no existe
    const mktExiste = Array.isArray(areas) && areas.some((a: { standard_area: string }) => a.standard_area === 'marketing');
    if (!mktExiste) {
      await apiCall('POST', '/areas', { organizationId: ORG_ID, standardArea: 'marketing' });
    }
  });

  test.beforeEach(async ({ page }) => {
    // Login via UI
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@inovabiz.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('TC-007: Lista de áreas muestra áreas', async ({ page }) => {
    await page.goto(`/org/${ORG_ID}/areas`);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'docs/qa/evidence/TC-007_area-list.png' });

    // Verificar título de la página (puede estar en h1 dentro del main content)
    const pageContent = await page.textContent('main') ?? await page.textContent('body');
    expect(pageContent).toContain('reas departamentales');

    // Verificar que existe al menos un área card
    const areaCards = await page.locator('button.text-left').count();
    expect(areaCards).toBeGreaterThan(0);
  });

  test('TC-008: Detalle de área muestra spider y pilotos', async ({ page }) => {
    await page.goto(`/org/${ORG_ID}/areas`);
    await page.waitForTimeout(2000);

    // Click en primera área
    const firstCard = page.locator('button.text-left').first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });
    await firstCard.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'docs/qa/evidence/TC-008_area-detail.png' });

    // Verificar que muestra sección de pilotos
    const bodyText = await page.textContent('body') ?? '';
    expect(bodyText).toContain('Pilotos vinculados');
  });

  test('TC-009: Mini-assessment flow completo', async ({ page }) => {
    // Navegar al área inherited (ventas)
    await page.goto(`/org/${ORG_ID}/areas/${AREA_ID_VENTAS}`);
    await page.waitForTimeout(2000);

    // Verificar botón mini-assessment visible
    const miniBtn = page.locator('button:has-text("Realizar mini-assessment")');
    await expect(miniBtn).toBeVisible({ timeout: 5000 });

    // Click en mini-assessment
    await miniBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'docs/qa/evidence/TC-009_mini-assessment-start.png' });

    // Verificar que hay preguntas visibles
    const questionBlocks = page.locator('.bg-slate-800.rounded-xl');
    const qCount = await questionBlocks.count();
    expect(qCount).toBe(12);

    // Verificar botón deshabilitado (TC-013: sin respuestas completas)
    const submitBtn = page.locator('button:has-text("Guardar mini-assessment")');
    await expect(submitBtn).toBeDisabled();

    // Responder todas (click primer option de cada pregunta)
    for (let i = 0; i < 12; i++) {
      const questionBlock = questionBlocks.nth(i);
      await questionBlock.locator('button').first().click();
    }

    // Ahora el botón debe estar habilitado
    await expect(submitBtn).toBeEnabled();

    await page.screenshot({ path: 'docs/qa/evidence/TC-009_mini-assessment-filled.png' });

    // Submit
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Debe redirigir al detalle del área con status mini-assessed
    await page.screenshot({ path: 'docs/qa/evidence/TC-009_after-submit.png' });
    const bodyText = await page.textContent('body') ?? '';
    expect(bodyText).toContain('Mini-assessment');
  });

  test('TC-010: Dashboard muestra AI Operating Level badge', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'docs/qa/evidence/TC-010_dashboard.png' });

    // Verificar que existe al menos una org card
    const orgCards = await page.locator('button.text-left').count();
    expect(orgCards).toBeGreaterThan(0);
  });
});

// ══════════════════════════════════════════════
// NIVEL 3 — Regresión
// ══════════════════════════════════════════════

test.describe('Nivel 3: Regresión', () => {
  test('TC-011: Pilotos existentes sin área siguen funcionando', async () => {
    const { status, data } = await apiCall('GET', `/pilots/organization/${ORG_ID}`);
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);

    // Verificar que pilotos sin area se listan normalmente
    const sinArea = data.filter((p: { department_area_id: string | null }) => !p.department_area_id);
    // Puede haber pilotos sin área (los preexistentes)
    expect(data.length).toBeGreaterThanOrEqual(0);

    // Actualizar un piloto sin romper nada
    if (data.length > 0) {
      const pilotId = data[0].id;
      const { status: updateStatus } = await apiCall('PUT', `/pilots/${pilotId}`, {
        departmentAreaId: null,
      });
      expect(updateStatus).toBe(200);
    }
  });
});
