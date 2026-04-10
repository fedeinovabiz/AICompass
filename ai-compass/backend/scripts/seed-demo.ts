import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/ai_compass',
});

async function seed() {
  console.log('Limpiando datos existentes...');
  await pool.query(`
    DELETE FROM pilot_metrics;
    DELETE FROM pilots;
    DELETE FROM red_flags;
    DELETE FROM deliverables;
    DELETE FROM cross_session_analyses;
    DELETE FROM committee_meetings;
    DELETE FROM foundational_decisions;
    DELETE FROM committee_members;
    DELETE FROM committees;
    DELETE FROM emergent_findings;
    DELETE FROM session_questions;
    DELETE FROM session_participants;
    DELETE FROM sessions;
    DELETE FROM engagements;
    DELETE FROM stage_transitions;
    DELETE FROM organizations;
    DELETE FROM users;
  `);

  // ══════════════════════════════════════════════
  // USUARIOS
  // ══════════════════════════════════════════════
  console.log('Creando usuarios...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const facHash = await bcrypt.hash('facilitador123', 10);
  const councilHash = await bcrypt.hash('council123', 10);

  const adminResult = await pool.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['admin@inovabiz.com', adminHash, 'Admin InovaBiz', 'admin']
  );
  const adminId = adminResult.rows[0].id;

  const facResult = await pool.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['federico@inovabiz.com', facHash, 'Federico Marsiglia', 'facilitator']
  );
  const facilitatorId = facResult.rows[0].id;

  // ══════════════════════════════════════════════
  // ORGANIZACIÓN 1: ACME Corp (Etapa 3 — tiene todo)
  // ══════════════════════════════════════════════
  console.log('Creando ACME Corp (completa, Etapa 3)...');
  const orgResult = await pool.query(
    `INSERT INTO organizations (name, industry, size, contact_name, contact_email, current_stage, maturity_scores, stage_criteria)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [
      'ACME Corp',
      'Tecnología',
      '120 empleados',
      'María González',
      'maria@acmecorp.com',
      3,
      JSON.stringify({
        estrategia: 2,
        procesos: 2,
        datos: 3,
        tecnologia: 3,
        cultura: 2,
        gobernanza: 1,
      }),
      JSON.stringify({
        'S1-01': true, 'S1-02': true, 'S1-03': true, 'S1-04': true,
        'S2-01': true, 'S2-02': true, 'S2-03': true, 'S2-04': true,
      }),
    ]
  );
  const org1Id = orgResult.rows[0].id;

  // Council member para ACME
  const councilResult = await pool.query(
    `INSERT INTO users (email, password_hash, name, role, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    ['carlos@acmecorp.com', councilHash, 'Carlos Méndez', 'council', org1Id]
  );
  const councilUserId = councilResult.rows[0].id;

  // Engagement
  const engResult = await pool.query(
    `INSERT INTO engagements (organization_id, facilitator_id, status, start_date) VALUES ($1, $2, $3, $4) RETURNING id`,
    [org1Id, facilitatorId, 'active', '2026-03-01']
  );
  const eng1Id = engResult.rows[0].id;

  // ── SESIÓN 1: Ejecutiva (validated) ──
  console.log('  Creando sesión ejecutiva...');
  const s1Result = await pool.query(
    `INSERT INTO sessions (engagement_id, type, modality, title, scheduled_date, completed_date, notes, ai_processed_at, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8) RETURNING id`,
    [eng1Id, 'ejecutiva', 'remota', 'S1: Visión Ejecutiva', '2026-03-05', '2026-03-05',
     'Reunión con María González (CEO) y Roberto Sánchez (CFO). María tiene visión clara de IA pero sin presupuesto formal. Roberto es escéptico. No hay política de uso de IA.', 'validated']
  );
  const s1Id = s1Result.rows[0].id;

  // Participantes S1
  await pool.query(`INSERT INTO session_participants (session_id, name, role, area) VALUES ($1, $2, $3, $4)`,
    [s1Id, 'María González', 'CEO / Sponsor', 'Dirección General']);
  await pool.query(`INSERT INTO session_participants (session_id, name, role, area) VALUES ($1, $2, $3, $4)`,
    [s1Id, 'Roberto Sánchez', 'CFO', 'Finanzas']);

  // Preguntas S1 con respuestas validadas
  const s1Questions = [
    { qid: 'S1-EST-01', dim: 'estrategia', text: '¿Cómo encaja la IA en la visión estratégica de la organización a 2-3 años?',
      suggested: 'La CEO tiene una visión clara de que la IA debe optimizar procesos internos, pero no hay un plan formal documentado. El CFO es más conservador y prioriza el ROI demostrable.',
      level: 2, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Yo veo la IA como el camino para escalar sin duplicar headcount', speakerName: 'María González', speakerRole: 'CEO', timestamp: '05:23' }])
    },
    { qid: 'S1-EST-02', dim: 'estrategia', text: '¿Hay presupuesto asignado específicamente para iniciativas de IA?',
      suggested: 'No hay presupuesto formal asignado. Se han hecho inversiones ad hoc en licencias de ChatGPT Team ($200/mes). El CFO requiere un business case antes de aprobar más inversión.',
      level: 2, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Hemos gastado en herramientas pero sin un plan, honestamente', speakerName: 'Roberto Sánchez', speakerRole: 'CFO', timestamp: '12:45' }])
    },
    { qid: 'S1-EST-03', dim: 'estrategia', text: '¿El liderazgo senior usa IA activamente en su trabajo diario?',
      suggested: 'La CEO usa ChatGPT para redactar comunicaciones y analizar documentos. El CFO no lo usa. El equipo directivo no tiene un estándar de uso.',
      level: 2, confidence: 'medio', status: 'edited',
      citations: JSON.stringify([{ text: 'Yo lo uso todos los días para mis emails y presentaciones', speakerName: 'María González', speakerRole: 'CEO', timestamp: '18:30' }])
    },
    { qid: 'S1-GOB-01', dim: 'gobernanza', text: '¿Existe alguna política sobre el uso de herramientas de IA en la organización?',
      suggested: 'No existe política formal. Algunos empleados usan IA por cuenta propia sin guía. La CEO reconoce que es un riesgo no tener lineamientos claros.',
      level: 1, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'La verdad no hemos puesto reglas, y sé que la gente está usando ChatGPT con datos de clientes', speakerName: 'María González', speakerRole: 'CEO', timestamp: '25:10' }])
    },
    { qid: 'S1-GOB-02', dim: 'gobernanza', text: '¿Qué información consideran confidencial y que no debería alimentar modelos externos?',
      suggested: 'Datos financieros de clientes, contratos, y propiedad intelectual son considerados confidenciales. No hay clasificación formal de datos.',
      level: 1, confidence: 'medio', status: 'approved',
      citations: JSON.stringify([{ text: 'Obviamente los contratos y los números de los clientes no deberían salir', speakerName: 'Roberto Sánchez', speakerRole: 'CFO', timestamp: '28:00' }])
    },
    { qid: 'S1-GOB-03', dim: 'gobernanza', text: '¿Cómo medirían el éxito de adoptar IA? ¿Qué significaría "funcionó"?',
      suggested: 'El CFO quiere ver reducción de costos operativos medible. La CEO quiere ver reducción de tiempo en tareas repetitivas. No hay métricas definidas.',
      level: 1, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Para mí funcionó si bajamos costos operativos un 15% en 6 meses', speakerName: 'Roberto Sánchez', speakerRole: 'CFO', timestamp: '35:20' }])
    },
  ];

  for (const q of s1Questions) {
    await pool.query(
      `INSERT INTO session_questions (session_id, question_id, dimension, question_text, suggested_answer, final_answer, suggested_level, confidence, citations, validation_status)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9)`,
      [s1Id, q.qid, q.dim, q.text, q.suggested, q.level, q.confidence, q.citations, q.status]
    );
  }

  // Hallazgos S1
  await pool.query(
    `INSERT INTO emergent_findings (session_id, type, description, citations, related_dimensions) VALUES ($1, $2, $3, $4, $5)`,
    [s1Id, 'champion', 'María González (CEO) usa IA activamente y está dispuesta a liderar la transformación. Es una champion natural.',
     JSON.stringify([{ text: 'Yo lo uso todos los días', speakerName: 'María González', speakerRole: 'CEO' }]),
     JSON.stringify(['estrategia', 'cultura'])]
  );
  await pool.query(
    `INSERT INTO emergent_findings (session_id, type, description, citations, related_dimensions) VALUES ($1, $2, $3, $4, $5)`,
    [s1Id, 'resistance', 'Roberto Sánchez (CFO) muestra escepticismo. Requiere ROI demostrable antes de invertir. Podría ser un blocker si no se aborda.',
     JSON.stringify([{ text: 'No voy a aprobar presupuesto sin ver números', speakerName: 'Roberto Sánchez', speakerRole: 'CFO' }]),
     JSON.stringify(['estrategia', 'gobernanza'])]
  );

  // ── SESIÓN 2: Operativa (validated) ──
  console.log('  Creando sesión operativa...');
  const s2Result = await pool.query(
    `INSERT INTO sessions (engagement_id, type, modality, title, scheduled_date, completed_date, notes, ai_processed_at, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8) RETURNING id`,
    [eng1Id, 'operativa', 'remota', 'S2: Realidad Operativa', '2026-03-08', '2026-03-08',
     'Reunión con Laura Torres (Dir. Operaciones) y Diego Ramírez (Líder de Proyectos). Procesos muy manuales. El equipo tiene curiosidad pero miedo.', 'validated']
  );
  const s2Id = s2Result.rows[0].id;

  await pool.query(`INSERT INTO session_participants (session_id, name, role, area) VALUES ($1, $2, $3, $4)`,
    [s2Id, 'Laura Torres', 'Directora de Operaciones', 'Operaciones']);
  await pool.query(`INSERT INTO session_participants (session_id, name, role, area) VALUES ($1, $2, $3, $4)`,
    [s2Id, 'Diego Ramírez', 'Líder de Proyectos', 'Operaciones']);

  const s2Questions = [
    { qid: 'S2-PRO-01', dim: 'procesos', text: '¿Qué tarea les consume más tiempo de manera repetitiva?',
      suggested: 'Generación de propuestas comerciales (8-10 horas cada una) y reportes semanales de avance de proyectos (4-5 horas). Ambos procesos son muy manuales.',
      level: 2, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Las propuestas nos toman entre 8 y 10 horas cada una, y hacemos 3-4 por semana', speakerName: 'Diego Ramírez', speakerRole: 'Líder de Proyectos', timestamp: '08:15' }])
    },
    { qid: 'S2-PRO-02', dim: 'procesos', text: '¿Dónde sienten que están haciendo trabajo que no requiere su criterio profesional?',
      suggested: 'El 60% del tiempo de los project managers se va en compilar datos de distintas fuentes para reportes. La parte de análisis real es solo el 40%.',
      level: 2, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Paso más tiempo copiando datos de un sistema a otro que analizando', speakerName: 'Laura Torres', speakerRole: 'Dir. Operaciones', timestamp: '14:30' }])
    },
    { qid: 'S2-PRO-03', dim: 'procesos', text: '¿Los procesos clave están documentados o viven en la cabeza de las personas?',
      suggested: 'Hay documentación parcial en un SharePoint que nadie actualiza. Los procesos reales viven en la cabeza de 3-4 personas clave. Si Laura se va, mucha información se pierde.',
      level: 2, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Tenemos un SharePoint pero está desactualizado desde hace un año', speakerName: 'Laura Torres', speakerRole: 'Dir. Operaciones', timestamp: '20:00' }])
    },
    { qid: 'S2-PRO-04', dim: 'procesos', text: '¿De los procesos que mencionaron, cuáles se hacen 100% en computadora y cuáles requieren presencia física?',
      suggested: 'Las propuestas y reportes son 100% digitales. El onboarding de clientes requiere visitas presenciales. El soporte técnico es 70% remoto, 30% presencial.',
      level: 3, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Todo lo de propuestas y reportes es en computadora, pero el onboarding del cliente siempre es presencial', speakerName: 'Diego Ramírez', speakerRole: 'Líder de Proyectos', timestamp: '25:40' }])
    },
    { qid: 'S2-PRO-05', dim: 'procesos', text: '¿Si tuvieran que clasificar sus tareas en tres niveles — las que se resuelven con una conversación con ChatGPT, las que necesitan una automatización tipo workflow, y las que necesitan desarrollo técnico custom — dónde cae cada una?',
      suggested: 'Propuestas: nivel 1 (prompting). Reportes: nivel 2 (workflow con datos de múltiples sistemas). Integración con el ERP: nivel 3 (custom).',
      level: 2, confidence: 'medio', status: 'approved',
      citations: JSON.stringify([{ text: 'Para las propuestas solo necesitamos un buen prompt con nuestra plantilla', speakerName: 'Diego Ramírez', speakerRole: 'Líder de Proyectos', timestamp: '30:10' }])
    },
    { qid: 'S2-CUL-01', dim: 'cultura', text: '¿Alguien en su equipo ya usa herramientas de IA por cuenta propia?',
      suggested: 'Diego usa ChatGPT para borradores de propuestas. 2-3 personas más lo usan "a escondidas" para emails. Laura no lo ha probado.',
      level: 2, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Yo lo uso para los borradores, pero no le digo a nadie porque no sé si está permitido', speakerName: 'Diego Ramírez', speakerRole: 'Líder de Proyectos', timestamp: '35:00' }])
    },
    { qid: 'S2-CUL-02', dim: 'cultura', text: '¿Cómo reacciona el equipo cuando se habla de incorporar IA al trabajo?',
      suggested: 'Hay curiosidad mezclada con miedo. 2 personas han expresado preocupación explícita por sus puestos. El equipo joven está más entusiasmado.',
      level: 2, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Ana y Pedro me dijeron que les preocupa que los reemplacen', speakerName: 'Laura Torres', speakerRole: 'Dir. Operaciones', timestamp: '40:20' }])
    },
    { qid: 'S2-CUL-03', dim: 'cultura', text: '¿Qué información necesitan frecuentemente que les cuesta conseguir?',
      suggested: 'Datos de rentabilidad por proyecto (dispersos entre ERP y Excel). Historial de propuestas anteriores similares. Disponibilidad real del equipo.',
      level: 2, confidence: 'medio', status: 'approved',
      citations: JSON.stringify([{ text: 'Para saber cuánto ganamos en un proyecto tengo que juntar datos de 3 sistemas diferentes', speakerName: 'Laura Torres', speakerRole: 'Dir. Operaciones', timestamp: '45:00' }])
    },
  ];

  for (const q of s2Questions) {
    await pool.query(
      `INSERT INTO session_questions (session_id, question_id, dimension, question_text, suggested_answer, final_answer, suggested_level, confidence, citations, validation_status)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9)`,
      [s2Id, q.qid, q.dim, q.text, q.suggested, q.level, q.confidence, q.citations, q.status]
    );
  }

  // Hallazgos S2
  await pool.query(
    `INSERT INTO emergent_findings (session_id, type, description, citations, related_dimensions) VALUES ($1, $2, $3, $4, $5)`,
    [s2Id, 'champion', 'Diego Ramírez ya usa IA por cuenta propia para propuestas. Es un champion natural que puede liderar la adopción en el equipo operativo.',
     JSON.stringify([{ text: 'Yo lo uso para los borradores', speakerName: 'Diego Ramírez', speakerRole: 'Líder de Proyectos' }]),
     JSON.stringify(['cultura', 'procesos'])]
  );
  await pool.query(
    `INSERT INTO emergent_findings (session_id, type, description, citations, related_dimensions) VALUES ($1, $2, $3, $4, $5)`,
    [s2Id, 'misalignment', 'La CEO dice que la IA es prioridad pero el equipo operativo no sabe que está permitido usarla. Brecha de comunicación entre liderazgo y operaciones.',
     JSON.stringify([{ text: 'No sé si está permitido', speakerName: 'Diego Ramírez', speakerRole: 'Líder de Proyectos' }]),
     JSON.stringify(['cultura', 'gobernanza'])]
  );

  // ── SESIÓN 3: Técnica (validated) ──
  console.log('  Creando sesión técnica...');
  const s3Result = await pool.query(
    `INSERT INTO sessions (engagement_id, type, modality, title, scheduled_date, completed_date, notes, ai_processed_at, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8) RETURNING id`,
    [eng1Id, 'tecnica', 'remota', 'S3: Capacidad Técnica', '2026-03-10', '2026-03-10',
     'Reunión con Andrés López (CTO) y Patricia Vega (DBA). Stack moderno pero datos fragmentados.', 'validated']
  );
  const s3Id = s3Result.rows[0].id;

  await pool.query(`INSERT INTO session_participants (session_id, name, role, area) VALUES ($1, $2, $3, $4)`,
    [s3Id, 'Andrés López', 'CTO', 'Tecnología']);
  await pool.query(`INSERT INTO session_participants (session_id, name, role, area) VALUES ($1, $2, $3, $4)`,
    [s3Id, 'Patricia Vega', 'DBA / Responsable de datos', 'Tecnología']);

  const s3Questions = [
    { qid: 'S3-TEC-01', dim: 'tecnologia', text: '¿Qué suite de productividad usa la organización?',
      suggested: 'Microsoft 365 Business Premium. Usan Teams, SharePoint, Outlook y Excel extensivamente. Tienen licencias de Power BI pero pocas personas lo usan.',
      level: 3, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Tenemos M365 Business Premium para todos', speakerName: 'Andrés López', speakerRole: 'CTO', timestamp: '03:00' }])
    },
    { qid: 'S3-TEC-02', dim: 'tecnologia', text: '¿Tienen infraestructura cloud?',
      suggested: 'Azure con suscripción básica. Usan Azure AD para identidad y Azure SQL para el ERP. No hay servicios de IA configurados en cloud.',
      level: 3, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Estamos en Azure pero solo para lo básico, no hemos explorado los servicios de IA', speakerName: 'Andrés López', speakerRole: 'CTO', timestamp: '08:00' }])
    },
    { qid: 'S3-TEC-03', dim: 'tecnologia', text: '¿Hay herramientas de IA ya licenciadas o en evaluación?',
      suggested: 'ChatGPT Team (10 licencias, $200/mes). Están evaluando Copilot for M365 pero el costo ($30/usuario/mes) frena la decisión.',
      level: 3, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Tenemos 10 licencias de ChatGPT Team pero Copilot nos parece caro para 120 personas', speakerName: 'Andrés López', speakerRole: 'CTO', timestamp: '15:00' }])
    },
    { qid: 'S3-DAT-01', dim: 'datos', text: '¿Dónde vive la información crítica del negocio?',
      suggested: 'ERP (SAP Business One) para finanzas y operaciones. CRM (HubSpot) para clientes. SharePoint para documentos. Muchos datos críticos en Excel personal.',
      level: 3, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'SAP tiene lo financiero, HubSpot los clientes, pero mucho vive en Excels que cada quien tiene en su máquina', speakerName: 'Patricia Vega', speakerRole: 'DBA', timestamp: '20:00' }])
    },
    { qid: 'S3-DAT-02', dim: 'datos', text: '¿Existe gobernanza de datos?',
      suggested: 'Hay permisos básicos en SAP y Azure AD. No hay clasificación formal de datos ni política de acceso documentada. Patricia es la única que sabe quién tiene acceso a qué.',
      level: 2, confidence: 'alto', status: 'approved',
      citations: JSON.stringify([{ text: 'Yo manejo los permisos pero no tenemos un documento formal de quién accede a qué', speakerName: 'Patricia Vega', speakerRole: 'DBA', timestamp: '28:00' }])
    },
    { qid: 'S3-DAT-03', dim: 'datos', text: '¿Cómo calificaría la calidad de los datos?',
      suggested: 'En SAP los datos son confiables. En HubSpot hay duplicados. En los Excels personales la calidad varía mucho. No hay proceso de limpieza regular.',
      level: 2, confidence: 'medio', status: 'approved',
      citations: JSON.stringify([{ text: 'SAP está limpio porque yo lo cuido, pero HubSpot es un desastre de duplicados', speakerName: 'Patricia Vega', speakerRole: 'DBA', timestamp: '35:00' }])
    },
  ];

  for (const q of s3Questions) {
    await pool.query(
      `INSERT INTO session_questions (session_id, question_id, dimension, question_text, suggested_answer, final_answer, suggested_level, confidence, citations, validation_status)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9)`,
      [s3Id, q.qid, q.dim, q.text, q.suggested, q.level, q.confidence, q.citations, q.status]
    );
  }

  // ── ANÁLISIS CROSS-SESIÓN ──
  console.log('  Creando análisis cross-sesión...');
  await pool.query(
    `INSERT INTO cross_session_analyses (organization_id, dimension_scores, committee_recommendation, deep_dive_recommendations, quick_win_suggestions)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      org1Id,
      JSON.stringify({
        estrategia: { score: 2, summary: 'Visión de IA presente en el liderazgo pero sin plan formal ni presupuesto asignado. CEO es champion, CFO es escéptico.', gaps: ['Sin presupuesto formal de IA', 'Sin plan estratégico documentado', 'Desalineación CEO-CFO'] },
        procesos: { score: 2, summary: 'Procesos clave sin documentar. Alta dependencia de personas clave. Tareas repetitivas consumen 60% del tiempo.', gaps: ['Documentación desactualizada', 'Procesos viven en cabeza de personas', 'Sin identificación formal de candidatos a automatización'] },
        datos: { score: 3, summary: 'Infraestructura de datos aceptable (SAP + HubSpot + Azure) pero fragmentada. Gobernanza informal.', gaps: ['Datos duplicados en HubSpot', 'Excels personales con datos críticos', 'Sin clasificación formal de datos'] },
        tecnologia: { score: 3, summary: 'Stack moderno (M365 + Azure + SAP). ChatGPT Team activo. Evaluando Copilot. Capacidad de integración disponible.', gaps: ['Servicios de IA en cloud no configurados', 'Power BI subutilizado', 'Copilot no aprobado por costo'] },
        cultura: { score: 2, summary: 'Curiosidad mezclada con miedo. Champions informales (Diego). Uso "a escondidas" por falta de política clara.', gaps: ['Empleados no saben si pueden usar IA', 'Miedo a reemplazo en 2 personas', 'Sin programa de capacitación'] },
        gobernanza: { score: 1, summary: 'Sin política de uso de IA. Sin clasificación de datos confidenciales. Sin medición de éxito definida.', gaps: ['Cero políticas de IA', 'Datos de clientes potencialmente expuestos a LLMs externos', 'Sin framework de medición'] },
      }),
      JSON.stringify({
        suggestedMembers: [
          { role: 'sponsor', suggestedPerson: 'María González', justification: 'CEO con visión clara y uso activo de IA. Champion natural del proceso.' },
          { role: 'operational-leader', suggestedPerson: 'Laura Torres', justification: 'Dir. Operaciones con visibilidad de los procesos más dolorosos. Dedicará 30-50% de su tiempo.' },
          { role: 'business-rep', suggestedPerson: 'Diego Ramírez', justification: 'Ya usa IA activamente. Champion natural que puede evangelizar al equipo.' },
          { role: 'it-rep', suggestedPerson: 'Andrés López', justification: 'CTO con conocimiento del stack tecnológico y capacidad de integración.' },
          { role: 'change-management', suggestedPerson: null, justification: 'No se identificó candidato ideal. Considerar a alguien de RRHH o Comunicaciones.' },
        ],
      }),
      JSON.stringify([
        { trigger: 'cultura-rojo', title: 'Gestión del cambio y narrativa', justification: 'Hay miedo explícito a reemplazo en el equipo operativo. Necesita narrativa de "amplificador, no reemplazo" antes de escalar.', suggestedQuestions: ['¿Qué incentivos concretos recibiría el equipo si la IA libera su tiempo?', '¿Cómo comunicamos oficialmente la posición de la empresa sobre IA?'] },
      ]),
      JSON.stringify([
        { title: 'Automatizar generación de propuestas comerciales', processBefore: 'PM copia plantilla Word, busca datos del cliente en HubSpot y SAP, redacta propuesta manualmente. 8-10 horas por propuesta.', processAfter: 'PM ingresa nombre del cliente, IA extrae datos de HubSpot/SAP, genera borrador de propuesta con plantilla. PM revisa y ajusta. 1-2 horas.', suggestedTool: 'ChatGPT Team con prompt template', estimatedImpact: 'Reducción de 80% en tiempo de creación de propuestas. 24-32 horas/semana liberadas.', timeline: '2 semanas para implementar', valueChainSegment: 'lead-to-sale', implementationLevel: 'prompting', diminishingReturns: 'A partir de 20 propuestas/semana el cuello de botella pasa a revisión humana, no a generación.' },
        { title: 'Automatizar reportes semanales de avance', processBefore: 'PM compila datos de 3 sistemas (SAP, Excel, emails), crea reporte en Word. 4-5 horas cada viernes.', processAfter: 'Workflow extrae datos automáticamente, genera reporte con template. PM solo revisa y comenta. 30 minutos.', suggestedTool: 'Make (Integromat) + ChatGPT API', estimatedImpact: 'Reducción de 90% en tiempo de reportes. 16-20 horas/semana liberadas para todo el equipo.', timeline: '3-4 semanas para configurar', valueChainSegment: 'delivery-to-success', implementationLevel: 'no-code', diminishingReturns: 'Funciona bien hasta 50 proyectos activos. Más allá necesita optimización de queries.' },
        { title: 'Documentar procesos críticos con IA', processBefore: 'Procesos viven en la cabeza de personas clave. Documentación desactualizada en SharePoint.', processAfter: 'IA entrevista a cada dueño de proceso, genera documentación estructurada con flowcharts. Revisión humana de 30 min por proceso.', suggestedTool: 'ChatGPT con prompts de documentación', estimatedImpact: 'Reducción de riesgo operativo. 20+ procesos documentados en 4 semanas.', timeline: '4 semanas', valueChainSegment: 'delivery-to-success', implementationLevel: 'prompting', diminishingReturns: 'Sin retornos decrecientes — cada proceso documentado es valor acumulado.' },
      ]),
    ]
  );

  // ── COMITÉ ──
  console.log('  Creando comité...');
  const comResult = await pool.query(
    `INSERT INTO committees (organization_id, meeting_cadence, constituted_at) VALUES ($1, $2, NOW()) RETURNING id`,
    [org1Id, 'Quincenal']
  );
  const comId = comResult.rows[0].id;

  // Miembros
  await pool.query(`INSERT INTO committee_members (committee_id, name, email, role, area) VALUES ($1, $2, $3, $4, $5)`,
    [comId, 'María González', 'maria@acmecorp.com', 'sponsor', 'Dirección General']);
  await pool.query(`INSERT INTO committee_members (committee_id, name, email, role, area, user_id) VALUES ($1, $2, $3, $4, $5, $6)`,
    [comId, 'Carlos Méndez', 'carlos@acmecorp.com', 'operational-leader', 'Operaciones', councilUserId]);
  await pool.query(`INSERT INTO committee_members (committee_id, name, email, role, area) VALUES ($1, $2, $3, $4, $5)`,
    [comId, 'Diego Ramírez', 'diego@acmecorp.com', 'business-rep', 'Operaciones']);
  await pool.query(`INSERT INTO committee_members (committee_id, name, email, role, area) VALUES ($1, $2, $3, $4, $5)`,
    [comId, 'Andrés López', 'andres@acmecorp.com', 'it-rep', 'Tecnología']);

  // Decisiones fundacionales
  const decisions = [
    { n: 1, title: 'El "por qué"', desc: '¿Para qué queremos IA?', resp: 'Reducir costos operativos un 15% y liberar tiempo del equipo para trabajo de mayor valor. Foco en eficiencia, no en reemplazo de personas.' },
    { n: 2, title: 'Política de transparencia', desc: '¿Seremos abiertos sobre el uso de IA?', resp: 'Sí. Posición oficial: "Usar IA es ser más productivo, no hacer trampa." Se comunicará a todo el equipo.' },
    { n: 3, title: 'Gobernanza de datos mínima viable', desc: '¿Qué datos son confidenciales?', resp: 'Datos financieros de clientes, contratos y propiedad intelectual NO deben alimentar modelos externos. Datos operativos genéricos sí pueden usarse.' },
    { n: 4, title: 'Cadencia del comité', desc: '¿Con qué frecuencia nos reunimos?', resp: 'Quincenal los primeros 3 meses (60 min máximo). Mensual después. Agenda fija: métricas, decisiones pendientes, próximos pasos.' },
    { n: 5, title: 'Criterios de éxito', desc: '¿Qué significa que funcionó?', resp: 'Reducción de 50% en tiempo de propuestas comerciales a 90 días. Encuesta de satisfacción del equipo a 6 meses.' },
    { n: 6, title: 'Presupuesto inicial', desc: '¿Cuánto invertimos?', resp: '$500/mes en herramientas (ChatGPT Team + Make). $2,000 en consultoría InovaBiz. Total primer trimestre: $3,500.' },
    { n: 7, title: 'La lista de "no por ahora"', desc: '¿Qué NO hacemos este ciclo?', resp: 'No Copilot para todos (muy caro). No agentes autónomos. No integración con ERP (complejo). No rollout a toda la empresa.' },
    { n: 8, title: 'Próximos pasos', desc: '¿Quién hace qué?', resp: 'Diego lidera piloto de propuestas. Laura identifica 3 procesos para documentar. Andrés evalúa integración Make-HubSpot. Próxima reunión: 2 semanas.' },
  ];

  for (const d of decisions) {
    await pool.query(
      `INSERT INTO foundational_decisions (committee_id, number, title, description, response, decided_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [comId, d.n, d.title, d.desc, d.resp]
    );
  }

  // Reunión del comité
  await pool.query(
    `INSERT INTO committee_meetings (committee_id, date, attendees, decisions, notes) VALUES ($1, $2, $3, $4, $5)`,
    [comId, '2026-03-20', JSON.stringify(['María González', 'Carlos Méndez', 'Diego Ramírez', 'Andrés López']),
     JSON.stringify(['Aprobar piloto de propuestas', 'Definir presupuesto Q2']),
     'Primera reunión del comité. Se aprobó el piloto de propuestas comerciales con Diego como champion. Presupuesto de $500/mes aprobado por el CFO.']
  );

  // ── PILOTOS ──
  console.log('  Creando pilotos...');

  // Piloto 1: Propuestas (activo, con métricas)
  const pilot1Result = await pool.query(
    `INSERT INTO pilots (organization_id, title, process_description, process_before, process_after, tool, team_size, champion_name, champion_email, status, baseline, workflow_design, champion_assignments, role_impacts, start_date, quick_win_ids)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
    [
      org1Id,
      'Automatización de propuestas comerciales',
      'Generación de propuestas comerciales para clientes B2B usando IA generativa',
      'PM copia plantilla Word, busca datos del cliente en HubSpot y SAP, redacta propuesta manualmente. 8-10 horas por propuesta. 3-4 propuestas por semana.',
      'PM ingresa nombre del cliente en prompt template, IA extrae datos y genera borrador. PM revisa, ajusta y envía. 1-2 horas por propuesta.',
      'ChatGPT Team con prompt template personalizado',
      5,
      'Diego Ramírez',
      'diego@acmecorp.com',
      'active',
      JSON.stringify([
        { name: 'Tiempo por propuesta (horas)', unit: 'horas', baselineValue: 9 },
        { name: 'Propuestas por semana', unit: 'cantidad', baselineValue: 3 },
        { name: 'Tasa de conversión', unit: '%', baselineValue: 25 },
      ]),
      JSON.stringify({
        workflowBefore: '1. Recibir solicitud del comercial\n2. Buscar datos del cliente en HubSpot\n3. Buscar historial en SAP\n4. Copiar plantilla Word\n5. Redactar propuesta manualmente\n6. Revisión interna\n7. Enviar al cliente',
        workflowAfter: '1. Recibir solicitud del comercial\n2. Ingresar nombre del cliente en prompt template\n3. IA genera borrador con datos de HubSpot\n4. PM revisa y ajusta (validación humana)\n5. Revisión interna express\n6. Enviar al cliente',
        humanValidationPoints: ['Paso 4: PM revisa borrador generado', 'Paso 5: Aprobación de precios por gerente'],
        eliminatedSteps: ['Buscar datos manualmente en HubSpot', 'Buscar historial en SAP', 'Copiar y llenar plantilla Word'],
        newSteps: ['Ingresar datos en prompt template', 'Revisar output de IA'],
      }),
      JSON.stringify([
        { name: 'Diego Ramírez', area: 'Operaciones', responsibilities: ['Peer training', 'Soporte primer nivel', 'Documentación de prompts'], weeklyHours: 6, communicationChannel: 'Canal #ia-propuestas en Teams' },
      ]),
      JSON.stringify([
        { roleName: 'Project Manager', timeFreedPercent: 70, newResponsibilities: 'Dedicar tiempo liberado a análisis de rentabilidad y mejora de propuestas estratégicas', proposedIncentive: 'Bono trimestral por propuestas ganadas' },
      ]),
      '2026-03-25',
      JSON.stringify([]),
    ]
  );
  const pilot1Id = pilot1Result.rows[0].id;

  // Métricas semanales del piloto 1
  const metricsData = [
    { date: '2026-03-31', values: { 'Tiempo por propuesta (horas)': 5, 'Propuestas por semana': 4, 'Tasa de conversión': 28 }, adoption: { activePercentage: 60, usageFrequency: 'weekly', habitualUsers: 3, noviceUsers: 2, nps: 7 } },
    { date: '2026-04-07', values: { 'Tiempo por propuesta (horas)': 3, 'Propuestas por semana': 5, 'Tasa de conversión': 30 }, adoption: { activePercentage: 80, usageFrequency: 'daily', habitualUsers: 4, noviceUsers: 1, nps: 8 } },
  ];

  for (const m of metricsData) {
    await pool.query(
      `INSERT INTO pilot_metrics (pilot_id, date, values, adoption_metrics, notes) VALUES ($1, $2, $3, $4, $5)`,
      [pilot1Id, m.date, JSON.stringify(m.values), JSON.stringify(m.adoption),
       m.date === '2026-04-07' ? 'El equipo reporta que la calidad del borrador mejoró mucho con el prompt refinado.' : null]
    );
  }

  // Piloto 2: Reportes (designing, sin baseline)
  await pool.query(
    `INSERT INTO pilots (organization_id, title, process_description, process_before, process_after, tool, team_size, champion_name, champion_email, status, baseline, quick_win_ids)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      org1Id,
      'Automatización de reportes semanales',
      'Generación automática de reportes de avance de proyectos consolidando datos de múltiples fuentes',
      'PM compila datos de SAP, Excel y emails. Crea reporte en Word. 4-5 horas cada viernes.',
      'Workflow Make extrae datos automáticamente, ChatGPT API genera reporte. PM revisa 30 min.',
      'Make (Integromat) + ChatGPT API',
      8,
      'Laura Torres',
      'laura@acmecorp.com',
      'designing',
      JSON.stringify([]),
      JSON.stringify([]),
    ]
  );

  // ── RED FLAGS ──
  console.log('  Creando red flags...');
  await pool.query(
    `INSERT INTO red_flags (organization_id, rule_id, severity, title, description, stage) VALUES ($1, $2, $3, $4, $5, $6)`,
    [org1Id, 'RF-S3-01', 'block', 'Piloto sin baseline', 'El piloto "Automatización de reportes semanales" fue creado sin métricas de baseline. Sin baseline no se puede demostrar impacto.', 3]
  );

  // ══════════════════════════════════════════════
  // ORGANIZACIÓN 2: Beta Labs (Etapa 1 — recién empezando)
  // ══════════════════════════════════════════════
  console.log('Creando Beta Labs (Etapa 1, vacía)...');
  const org2Result = await pool.query(
    `INSERT INTO organizations (name, industry, size, contact_name, contact_email, current_stage) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    ['Beta Labs', 'Farmacéutica', '250 empleados', 'Ana Martínez', 'ana@betalabs.com', 1]
  );
  const org2Id = org2Result.rows[0].id;

  await pool.query(
    `INSERT INTO engagements (organization_id, facilitator_id, status, start_date) VALUES ($1, $2, $3, $4)`,
    [org2Id, facilitatorId, 'active', '2026-04-01']
  );

  // ── Sesión draft sin procesar ──
  const s4Result = await pool.query(
    `INSERT INTO sessions (engagement_id, type, modality, title, scheduled_date, status)
     VALUES ((SELECT id FROM engagements WHERE organization_id = $1 LIMIT 1), $2, $3, $4, $5, $6) RETURNING id`,
    [org2Id, 'ejecutiva', 'remota', 'S1: Visión Ejecutiva', '2026-04-15', 'draft']
  );
  const s4Id = s4Result.rows[0].id;

  // Insertar preguntas vacías para la sesión draft
  const ejecutivaQuestions = [
    { qid: 'S1-EST-01', dim: 'estrategia', text: '¿Cómo encaja la IA en la visión estratégica de la organización a 2-3 años?' },
    { qid: 'S1-EST-02', dim: 'estrategia', text: '¿Hay presupuesto asignado específicamente para iniciativas de IA?' },
    { qid: 'S1-EST-03', dim: 'estrategia', text: '¿El liderazgo senior usa IA activamente en su trabajo diario?' },
    { qid: 'S1-GOB-01', dim: 'gobernanza', text: '¿Existe alguna política sobre el uso de herramientas de IA en la organización?' },
    { qid: 'S1-GOB-02', dim: 'gobernanza', text: '¿Qué información consideran confidencial y que no debería alimentar modelos externos?' },
    { qid: 'S1-GOB-03', dim: 'gobernanza', text: '¿Cómo medirían el éxito de adoptar IA?' },
  ];

  for (const q of ejecutivaQuestions) {
    await pool.query(
      `INSERT INTO session_questions (session_id, question_id, dimension, question_text) VALUES ($1, $2, $3, $4)`,
      [s4Id, q.qid, q.dim, q.text]
    );
  }

  // ══════════════════════════════════════════════
  // RESUMEN
  // ══════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log('SEED COMPLETO');
  console.log('════════════════════════════════════════');
  console.log('\nUsuarios:');
  console.log('  admin@inovabiz.com / admin123 (admin)');
  console.log('  federico@inovabiz.com / facilitador123 (facilitator)');
  console.log('  carlos@acmecorp.com / council123 (council - ACME Corp)');
  console.log('\nOrganizaciones:');
  console.log('  ACME Corp (Etapa 3) — 3 sesiones validated, comité constituido, 2 pilotos, red flags');
  console.log('  Beta Labs (Etapa 1) — 1 sesión draft sin procesar');
  console.log('\nDatos de ACME Corp:');
  console.log('  - 3 sesiones validated con respuestas y hallazgos');
  console.log('  - Análisis cross-sesión con spider chart, quick wins y deep dives');
  console.log('  - Comité con 4 miembros y 8 decisiones fundacionales');
  console.log('  - Piloto "Propuestas" activo con baseline, métricas, champions, workflow design');
  console.log('  - Piloto "Reportes" en diseño (sin baseline — genera red flag)');
  console.log('  - 1 red flag activo (piloto sin baseline)');

  await pool.end();
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
