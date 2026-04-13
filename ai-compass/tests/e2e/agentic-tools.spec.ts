import { test, expect } from '@playwright/test';

// Constantes de prueba
const API_BASE = 'http://localhost:3002/api';
const ORG_ID = '4a26fa3d-9fcb-4b4d-8db8-19e3b59cb165'; // ACME Corp
const PILOT_ID = 'c14be127-e504-49c2-8900-ce7ed197d35a'; // Reportes semanales
let TOKEN = '';

// Helper: login y obtener token
async function getToken(): Promise<string> {
  if (TOKEN) return TOKEN;
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@inovabiz.com', password: 'admin123' }),
  });
  const data = await res.json() as { token: string };
  TOKEN = data.token;
  return TOKEN;
}

// Helper: API request con auth
async function apiRequest(method: string, path: string, body?: unknown) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  return res.json();
}

// Helper: login en browser
async function loginInBrowser(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@inovabiz.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

// ══════════════════════════════════════════════
// NIVEL 1A: Validación de datos — Value Engineering en Pilots
// ══════════════════════════════════════════════

test.describe('TC-001: Value Engineering — Campos en piloto via API', () => {
  test('actualizar piloto con value engineering y verificar score calculado', async () => {
    // Limpiar value score previo
    await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      valuePnl: null, valuePnlType: null, valueEffort: null, valueRisk: null, valueTimeToValue: null,
    });
    const before = await apiRequest('GET', `/pilots/${PILOT_ID}`);
    expect(before.value_score ?? before.valueScore ?? null).toBeNull();

    // Ejecutar: actualizar con value engineering
    const updateData = {
      implementationType: 'redesign',
      valuePnl: 50000,
      valuePnlType: 'savings',
      valueEffort: 'M',
      valueRisk: 'low',
      valueTimeToValue: 'under_4w',
    };
    const updated = await apiRequest('PUT', `/pilots/${PILOT_ID}`, updateData);

    // Validar campos guardados
    const valuePnl = updated.value_pnl ?? updated.valuePnl;
    const valueEffort = updated.value_effort ?? updated.valueEffort;
    const valueRisk = updated.value_risk ?? updated.valueRisk;
    const valueTtv = updated.value_time_to_value ?? updated.valueTimeToValue;
    const valueScore = updated.value_score ?? updated.valueScore;
    const implType = updated.implementation_type ?? updated.implementationType;

    expect(Number(valuePnl)).toBe(50000);
    expect(valueEffort).toBe('M');
    expect(valueRisk).toBe('low');
    expect(valueTtv).toBe('under_4w');
    expect(implType).toBe('redesign');

    // Validar 1B: recalcular score manualmente
    // pnlNorm = min(50000/500000, 1) * 100 = 10
    // effortInv(M) = 75, riskInv(low) = 100, ttvInv(under_4w) = 100
    // score = 10*0.40 + 75*0.25 + 100*0.20 + 100*0.15 = 4 + 18.75 + 20 + 15 = 57.75 → 58
    expect(valueScore).toBe(58);
  });

  test('score se preserva con COALESCE cuando calcValueScore retorna null', async () => {
    // Primero poner un score válido
    await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      valuePnl: 50000, valuePnlType: 'savings', valueEffort: 'M', valueRisk: 'low', valueTimeToValue: 'under_4w',
    });
    // Ahora enviar campos incompletos — calcValueScore retorna null, COALESCE preserva el anterior
    const updated = await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      valuePnl: 100000,
      valueEffort: null,
      valueRisk: null,
      valueTimeToValue: null,
    });
    const valueScore = updated.value_score ?? updated.valueScore;
    // COALESCE(null, 58) = 58 — el score anterior se preserva, no se borra
    expect(valueScore).toBe(58);
  });

  test('score alto para piloto con alto P&L y bajo esfuerzo', async () => {
    const updated = await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      valuePnl: 500000,
      valuePnlType: 'revenue',
      valueEffort: 'S',
      valueRisk: 'low',
      valueTimeToValue: 'under_4w',
    });
    const valueScore = updated.value_score ?? updated.valueScore;
    // pnlNorm = 100, effort(S)=100, risk(low)=100, ttv(under_4w)=100
    // score = 100*0.4 + 100*0.25 + 100*0.2 + 100*0.15 = 100
    expect(valueScore).toBe(100);
  });
});

// ══════════════════════════════════════════════
// NIVEL 1A: Validación de datos — CUJ CRUD via API
// ══════════════════════════════════════════════

test.describe('TC-002: CUJ CRUD — Crear, leer, actualizar, eliminar via API', () => {
  let cujId: string;

  test('crear CUJ con steps y verificar métricas', async () => {
    // Obtener engagementId de ACME
    const engs = await apiRequest('GET', `/engagements/organization/${ORG_ID}`) as { id: string }[];
    const engagementId = engs[0]?.id ?? '';
    expect(engagementId).toBeTruthy();

    const cuj = await apiRequest('POST', '/cujs', {
      engagementId,
      name: 'Onboarding de cliente nuevo',
      actor: 'Ejecutivo de cuenta',
      objective: 'Cliente activo en menos de 48h',
      steps: [
        { description: 'Recibir solicitud', actor: 'Cliente', currentTool: 'Email', estimatedTimeMinutes: 5, painPoint: 'Se pierde en spam', agentCandidate: false },
        { description: 'Verificar datos en CRM', actor: 'Ejecutivo', currentTool: 'HubSpot', estimatedTimeMinutes: 15, painPoint: 'Datos desactualizados', agentCandidate: true },
        { description: 'Crear cuenta en sistema', actor: 'Ejecutivo', currentTool: 'SAP', estimatedTimeMinutes: 30, painPoint: 'Proceso manual repetitivo', agentCandidate: true },
        { description: 'Enviar bienvenida', actor: 'Ejecutivo', currentTool: 'Outlook', estimatedTimeMinutes: 10, painPoint: '', agentCandidate: true },
      ],
    });

    cujId = cuj.id;
    expect(cujId).toBeTruthy();
    expect(cuj.name).toBe('Onboarding de cliente nuevo');
    expect(cuj.actor).toBe('Ejecutivo de cuenta');
    expect(cuj.steps).toHaveLength(4);

    // Verificar ordenamiento de steps
    const steps = cuj.steps as { step_order?: number; stepOrder?: number; agent_candidate?: boolean; agentCandidate?: boolean }[];
    expect(steps[0].step_order ?? steps[0].stepOrder).toBe(1);
    expect(steps[3].step_order ?? steps[3].stepOrder).toBe(4);

    // Verificar agent_candidate
    const candidatos = steps.filter((s) => s.agent_candidate ?? s.agentCandidate);
    expect(candidatos).toHaveLength(3); // pasos 2, 3, 4
  });

  test('leer CUJ con steps', async () => {
    const cuj = await apiRequest('GET', `/cujs/${cujId}`);
    expect(cuj.name).toBe('Onboarding de cliente nuevo');
    expect(cuj.steps).toHaveLength(4);
  });

  test('actualizar CUJ — cambiar steps', async () => {
    const updated = await apiRequest('PUT', `/cujs/${cujId}`, {
      name: 'Onboarding de cliente (v2)',
      steps: [
        { description: 'Solicitud automatizada', actor: 'Agente IA', currentTool: 'Portal', estimatedTimeMinutes: 1, painPoint: '', agentCandidate: true },
        { description: 'Verificación automática', actor: 'Agente IA', currentTool: 'API CRM', estimatedTimeMinutes: 2, painPoint: '', agentCandidate: true },
        { description: 'Revisión humana', actor: 'Ejecutivo', currentTool: 'Dashboard', estimatedTimeMinutes: 5, painPoint: '', agentCandidate: false },
      ],
    });

    expect(updated.name).toBe('Onboarding de cliente (v2)');
    expect(updated.steps).toHaveLength(3); // se reemplazaron los 4 originales por 3
  });

  test('eliminar CUJ', async () => {
    const res = await fetch(`${API_BASE}/cujs/${cujId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${await getToken()}` },
    });
    expect(res.status).toBe(204);

    // Verificar que ya no existe
    const res2 = await fetch(`${API_BASE}/cujs/${cujId}`, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });
    expect(res2.status).toBe(404);
  });
});

// ══════════════════════════════════════════════
// NIVEL 1A: Value Engineering Matrix endpoint
// ══════════════════════════════════════════════

test.describe('TC-003: Value Engineering Matrix — Endpoint API', () => {
  test('retorna pilotos con summary', async () => {
    // Asegurar que el piloto tiene score
    await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      valuePnl: 75000,
      valuePnlType: 'savings',
      valueEffort: 'L',
      valueRisk: 'medium',
      valueTimeToValue: '4_to_12w',
    });

    const matrix = await apiRequest('GET', `/value-engineering/organization/${ORG_ID}`);

    expect(matrix.pilots).toBeDefined();
    expect(Array.isArray(matrix.pilots)).toBe(true);
    expect(matrix.summary).toBeDefined();
    expect(matrix.summary.total).toBeGreaterThan(0);
    expect(matrix.summary.evaluated).toBeGreaterThanOrEqual(1);
    expect(matrix.summary.totalPnl).toBeGreaterThan(0);

    // Verificar que pilotos con score vienen primero (ordenamiento)
    const scores = matrix.pilots.map((p: { value_score: number | null }) => p.value_score);
    const firstScored = scores.findIndex((s: number | null) => s !== null);
    const firstNull = scores.findIndex((s: number | null) => s === null);
    if (firstScored >= 0 && firstNull >= 0) {
      expect(firstScored).toBeLessThan(firstNull);
    }
  });
});

// ══════════════════════════════════════════════
// NIVEL 1B: Red Flags — Evaluación de anti-patrones
// ══════════════════════════════════════════════

test.describe('TC-004: Red Flags — Anti-patrones agénticos via API', () => {
  test('RF13 se dispara cuando piloto es tipo digitalization', async () => {
    // Marcar piloto como digitalization
    await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      implementationType: 'digitalization',
    });

    const flags = await apiRequest('GET', `/red-flags/organization/${ORG_ID}`);
    const rf13 = flags.find(
      (f: { ruleId?: string; rule_id?: string }) => (f.ruleId ?? f.rule_id) === 'RF13',
    );
    expect(rf13).toBeDefined();
    expect(rf13.severity).toBe('block');

    // Limpiar: volver a redesign
    await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      implementationType: 'redesign',
    });
  });

  test('RF15 se dispara cuando piloto activo sin CUJ', async () => {
    // Poner piloto en status active sin CUJ
    await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      status: 'active',
    });

    const flags = await apiRequest('GET', `/red-flags/organization/${ORG_ID}`);
    const rf15 = flags.find(
      (f: { ruleId?: string; rule_id?: string }) => (f.ruleId ?? f.rule_id) === 'RF15',
    );
    expect(rf15).toBeDefined();
    expect(rf15.severity).toBe('warning');

    // Limpiar: volver a designing
    await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      status: 'designing',
    });
  });

  test('RF16 se dispara con bajo P&L y esfuerzo alto', async () => {
    await apiRequest('PUT', `/pilots/${PILOT_ID}`, {
      valuePnl: 3000,
      valuePnlType: 'savings',
      valueEffort: 'L',
      valueRisk: 'medium',
      valueTimeToValue: '4_to_12w',
    });

    const flags = await apiRequest('GET', `/red-flags/organization/${ORG_ID}`);
    const rf16 = flags.find(
      (f: { ruleId?: string; rule_id?: string }) => (f.ruleId ?? f.rule_id) === 'RF16',
    );
    expect(rf16).toBeDefined();
    expect(rf16.severity).toBe('warning');
  });
});

// ══════════════════════════════════════════════
// NIVEL 2: UI — CUJ Mapper Page
// ══════════════════════════════════════════════

test.describe('TC-005: CUJ Mapper — Interfaz de usuario', () => {
  test('la página carga correctamente y muestra formulario', async ({ page }) => {
    await loginInBrowser(page);
    await page.goto(`/org/${ORG_ID}/cujs/new?engagementId=placeholder`);
    await page.waitForSelector('text=Nuevo Critical User Journey', { timeout: 5000 });
    await page.screenshot({ path: 'docs/qa/evidence/TC-005_cuj-mapper-empty.png' });

    // Verificar elementos del formulario
    await expect(page.locator('input[placeholder="Ej: Onboarding de cliente nuevo"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Ej: Ejecutivo de cuenta"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Ej: Cliente activo en menos de 48h"]')).toBeVisible();

    // Verificar métricas iniciales
    await expect(page.locator('text=0 min')).toBeVisible();
    await expect(page.locator('text=0%')).toBeVisible();
  });

  test('agregar pasos y ver métricas actualizarse', async ({ page }) => {
    await loginInBrowser(page);
    await page.goto(`/org/${ORG_ID}/cujs/new?engagementId=placeholder`);
    await page.waitForSelector('text=Nuevo Critical User Journey', { timeout: 5000 });

    // Llenar metadata
    await page.fill('input[placeholder="Ej: Onboarding de cliente nuevo"]', 'Test Journey QA');
    await page.fill('input[placeholder="Ej: Ejecutivo de cuenta"]', 'Tester');
    await page.fill('input[placeholder="Ej: Cliente activo en menos de 48h"]', 'Validar QA');

    // Llenar primer step
    await page.fill('input[placeholder="Descripción del paso"]', 'Paso de prueba');
    await page.fill('input[placeholder="Actor"]', 'QA');
    await page.fill('input[placeholder="Min"]', '30');

    // Marcar como candidato a agente
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // Agregar segundo paso
    await page.click('text=+ Agregar paso');

    // Verificar que hay 2 pasos
    const steps = page.locator('.grid.grid-cols-12.gap-2.items-start');
    await expect(steps).toHaveCount(2);

    // Verificar métricas
    await expect(page.locator('text=30 min')).toBeVisible();
    await expect(page.locator('text=50%')).toBeVisible(); // 1 de 2 es candidato

    await page.screenshot({ path: 'docs/qa/evidence/TC-005_cuj-mapper-filled.png' });
  });
});

// ══════════════════════════════════════════════
// NIVEL 2: UI — Value Engineering Page
// ══════════════════════════════════════════════

test.describe('TC-006: Value Engineering — Interfaz de usuario', () => {
  test('la página carga y muestra la tabla de pilotos', async ({ page }) => {
    await loginInBrowser(page);
    await page.goto(`/org/${ORG_ID}/value-engineering`);
    await page.waitForSelector('text=Matriz de Value Engineering', { timeout: 5000 });
    await page.screenshot({ path: 'docs/qa/evidence/TC-006_ve-matrix.png' });

    // Verificar cards de resumen
    await expect(page.locator('text=Pilotos totales')).toBeVisible();
    await expect(page.locator('text=Evaluados')).toBeVisible();
    await expect(page.locator('text=Impacto P&L total')).toBeVisible();

    // Verificar tabla
    await expect(page.locator('th:has-text("Score")')).toBeVisible();
    await expect(page.locator('th:has-text("Piloto")')).toBeVisible();
    await expect(page.locator('th:has-text("Impacto P&L")')).toBeVisible();
  });

  test('clic en fila navega al detalle del piloto', async ({ page }) => {
    await loginInBrowser(page);
    await page.goto(`/org/${ORG_ID}/value-engineering`);
    await page.waitForSelector('text=Matriz de Value Engineering', { timeout: 5000 });

    // Clic en primera fila de la tabla
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Debería navegar a la página del piloto
    await page.waitForURL(`**/org/${ORG_ID}/pilots/**`, { timeout: 5000 });
  });
});
