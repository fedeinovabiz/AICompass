// ══════════════════════════════════════════════
// ENUMS Y TIPOS BASE
// ══════════════════════════════════════════════

export type UserRole = 'admin' | 'facilitator' | 'council';

export type Stage = 1 | 2 | 3 | 4 | 5;

export type DimensionKey =
  | 'estrategia'
  | 'procesos'
  | 'datos'
  | 'tecnologia'
  | 'cultura'
  | 'gobernanza';

export type MaturityLevel = 1 | 2 | 3 | 4;

export type SessionType =
  | 'ejecutiva'
  | 'operativa'
  | 'tecnica'
  | 'constitucion'
  | 'deep-dive'
  | 'presentacion';

export type SessionModality = 'presencial' | 'remota';

export type ValidationStatus =
  | 'pending'
  | 'approved'
  | 'edited'
  | 'rejected'
  | 'not-mentioned';

export type ConfidenceLevel = 'alto' | 'medio' | 'bajo';

export type PilotStatus =
  | 'designing'
  | 'active'
  | 'evaluating'
  | 'scale'
  | 'iterate'
  | 'kill';

export type RedFlagSeverity = 'warning' | 'alert' | 'block';

export type EngagementStatus = 'active' | 'paused' | 'completed';

export type DeepDiveTrigger =
  | 'datos-rojo'
  | 'cultura-rojo'
  | 'procesos-rojo'
  | 'brecha-ejecutivo-operativo'
  | 'tecnologia-fragmentada';

export type ValueChainSegment =
  | 'market-to-lead'
  | 'lead-to-sale'
  | 'sale-to-delivery'
  | 'delivery-to-success'
  | 'success-to-market';

export type ImplementationLevel = 'prompting' | 'no-code' | 'custom';

export type AreaAssessmentStatus = 'inherited' | 'mini-assessed' | 'full-assessed';

export type AiOperatingLevel = 1 | 2 | 3 | 4;

export type StandardArea =
  | 'finanzas'
  | 'marketing'
  | 'ventas'
  | 'operaciones'
  | 'rrhh'
  | 'legal'
  | 'it'
  | 'producto'
  | 'atencion-al-cliente'
  | 'logistica'
  | 'custom';

export type DeliverableType =
  | 'findings-map'
  | 'committee-proposal'
  | 'constitution-act'
  | 'full-diagnostic'
  | 'quick-win-sheet'
  | 'final-presentation'
  | 'pilot-design'
  | 'biweekly-report'
  | 'pilot-evaluation';

export type CommitteeRole =
  | 'sponsor'
  | 'operational-leader'
  | 'business-rep'
  | 'it-rep'
  | 'change-management';

// ══════════════════════════════════════════════
// ENTIDADES PRINCIPALES
// ══════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  size: string;
  contactName: string;
  contactEmail: string;
  currentStage: Stage;
  maturityScores: Record<DimensionKey, number | null>;
  aiOperatingLevel: AiOperatingLevel | null;
  stageHistory: StageTransition[];
  stageCriteria: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface StageTransition {
  from: Stage;
  to: Stage;
  timestamp: string;
  facilitatorId: string;
  justification: string;
}

export interface Engagement {
  id: string;
  organizationId: string;
  facilitatorId: string;
  status: EngagementStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  engagementId: string;
  type: SessionType;
  modality: SessionModality;
  title: string;
  scheduledDate?: string;
  completedDate?: string;
  participants: Participant[];
  notes: string;
  transcriptFileUrl?: string;
  transcriptText?: string;
  questions: SessionQuestion[];
  findings: EmergentFinding[];
  aiProcessedAt?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'validated';
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  area: string;
}

export interface SessionQuestion {
  id: string;
  questionId: string;
  dimension: DimensionKey;
  questionText: string;
  manualAnswer?: string;
  suggestedAnswer?: string;
  finalAnswer?: string;
  suggestedLevel?: MaturityLevel;
  confidence?: ConfidenceLevel;
  citations: Citation[];
  validationStatus: ValidationStatus;
  editedAnswer?: string;
}

export interface Citation {
  text: string;
  speakerName: string;
  speakerRole: string;
  timestamp?: string;
}

export interface EmergentFinding {
  id: string;
  type: 'alignment' | 'misalignment' | 'champion' | 'resistance' | 'uncovered-topic';
  description: string;
  citations: Citation[];
  relatedDimensions: DimensionKey[];
}

// ══════════════════════════════════════════════
// COMITÉ
// ══════════════════════════════════════════════

export interface CommitteeMember {
  id: string;
  name: string;
  email: string;
  role: CommitteeRole;
  area: string;
  userId?: string;
}

export interface FoundationalDecision {
  id: string;
  number: number;
  title: string;
  description: string;
  response: string;
  decidedAt?: string;
}

export interface Committee {
  id: string;
  organizationId: string;
  members: CommitteeMember[];
  decisions: FoundationalDecision[];
  meetingCadence: string;
  constitutedAt?: string;
  meetingHistory: CommitteeMeeting[];
}

export interface CommitteeMeeting {
  id: string;
  date: string;
  attendees: string[];
  decisions: string[];
  notes: string;
}

// ══════════════════════════════════════════════
// PILOTOS (ETAPA 3)
// ══════════════════════════════════════════════

export interface WorkflowDesign {
  workflowBefore: string;
  workflowAfter: string;
  humanValidationPoints: string[];
  eliminatedSteps: string[];
  newSteps: string[];
}

export interface ChampionAssignment {
  name: string;
  area: string;
  responsibilities: string[];
  weeklyHours: number;
  communicationChannel: string;
}

export interface RoleImpact {
  roleName: string;
  timeFreedPercent: number;
  newResponsibilities: string;
  proposedIncentive: string;
}

export interface AdoptionMetrics {
  activePercentage: number;
  usageFrequency: 'daily' | 'weekly' | 'sporadic';
  habitualUsers: number;
  noviceUsers: number;
  nps?: number;
}

export interface PilotMetric {
  name: string;
  unit: string;
  baselineValue: number;
}

export interface PilotMetricEntry {
  date: string;
  values: Record<string, number>;
  notes?: string;
  adoptionMetrics?: AdoptionMetrics;
}

export interface Pilot {
  id: string;
  organizationId: string;
  departmentAreaId: string | null;
  title: string;
  processDescription: string;
  processBefore: string;
  processAfter: string;
  tool: string;
  teamSize: number;
  championName: string;
  championEmail: string;
  status: PilotStatus;
  baseline: PilotMetric[];
  metrics: PilotMetricEntry[];
  workflowDesign?: WorkflowDesign;
  champions: ChampionAssignment[];
  roleImpacts: RoleImpact[];
  startDate?: string;
  evaluationDate?: string;
  committeeDecision?: string;
  committeeDecisionDate?: string;
  quickWinIds: string[];
  // Value Engineering
  implementationType: ImplementationType;
  cujId: string | null;
  valuePnl: number | null;
  valuePnlType: ValuePnlType | null;
  valueEffort: ValueEffort | null;
  valueRisk: ValueRisk | null;
  valueTimeToValue: ValueTimeToValue | null;
  valueScore: number | null;
  createdAt: string;
}

// ══════════════════════════════════════════════
// RED FLAGS
// ══════════════════════════════════════════════

export interface RedFlag {
  id: string;
  organizationId: string;
  ruleId: string;
  severity: RedFlagSeverity;
  title: string;
  description: string;
  stage: Stage;
  detectedAt: string;
  resolvedAt?: string;
  resolution?: string;
  overrideJustification?: string;
}

// ══════════════════════════════════════════════
// ENTREGABLES
// ══════════════════════════════════════════════

export interface Deliverable {
  id: string;
  organizationId: string;
  engagementId: string;
  type: DeliverableType;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'published';
  generatedAt: string;
  publishedAt?: string;
  publishedBy?: string;
}

// ══════════════════════════════════════════════
// ANÁLISIS CROSS-SESIÓN
// ══════════════════════════════════════════════

export interface DimensionAnalysis {
  score: MaturityLevel;
  summary: string;
  evidence: Citation[];
  gaps: string[];
}

export interface CommitteeRecommendation {
  suggestedMembers: {
    role: CommitteeRole;
    suggestedPerson?: string;
    justification: string;
  }[];
}

export interface DeepDiveRecommendation {
  trigger: DeepDiveTrigger;
  title: string;
  justification: string;
  suggestedParticipants: string[];
  suggestedQuestions: string[];
}

export interface QuickWinSuggestion {
  title: string;
  processBefore: string;
  processAfter: string;
  suggestedTool: string;
  estimatedImpact: string;
  timeline: string;
  valueChainSegment: ValueChainSegment;
  implementationLevel: ImplementationLevel;
  diminishingReturns: string;
  suggestedArea?: string;
}

export interface CrossSessionAnalysis {
  organizationId: string;
  dimensionScores: Record<DimensionKey, DimensionAnalysis>;
  committeeRecommendation: CommitteeRecommendation;
  deepDiveRecommendations: DeepDiveRecommendation[];
  quickWinSuggestions: QuickWinSuggestion[];
  generatedAt: string;
}

// ══════════════════════════════════════════════
// ESCALAMIENTO (ETAPA 4)
// ══════════════════════════════════════════════

export type ScalingStatus = 'planning' | 'active' | 'completed' | 'paused';

export interface TargetArea {
  name: string;
  teamSize: number;
  targetDate?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'paused';
}

export interface ScalingMetric {
  id: string;
  scalingPlanId: string;
  areaName: string;
  date: string;
  adoptionPercentage: number | null;
  usersActive: number | null;
  impactMetrics: Record<string, unknown>;
  notes: string | null;
  createdAt: string;
}

export interface ScalingPlan {
  id: string;
  pilotId: string;
  organizationId: string;
  targetAreas: TargetArea[];
  totalTargetUsers: number;
  scalingStartDate: string | null;
  scalingStatus: ScalingStatus;
  createdAt: string;
  updatedAt: string;
  // Campos del JOIN con pilots
  pilotName: string;
  pilotTool: string;
  committeeDecision: string | null;
  // Solo en detalle
  metrics?: ScalingMetric[];
}

// ══════════════════════════════════════════════
// TRANSFORMACIÓN (ETAPA 5)
// ══════════════════════════════════════════════

export type AiToolCategory = 'llm' | 'no-code' | 'custom' | 'analytics' | 'other';
export type AiToolStatus = 'active' | 'evaluating' | 'deprecated';

export interface AiTool {
  id: string;
  organizationId: string;
  name: string;
  category: AiToolCategory;
  licenses: number;
  monthlyCost: number;
  teamsUsing: string[];
  status: AiToolStatus;
  addedAt: string;
}

export interface GovernanceEvolution {
  id: string;
  organizationId: string;
  originalDecisionNumber: number;
  evolutionDate: string;
  changeDescription: string;
  decidedBy: string | null;
  createdAt: string;
}

export interface MaturityEvolution {
  first: Record<string, { score: number }> | null;
  current: Record<string, { score: number }> | null;
}

export interface TransformationSummary {
  totalProcessesRedesigned: number;
  hoursFreed: number;
  estimatedRoi: number;
  aiToolsAdopted: number;
  maturityEvolution: MaturityEvolution;
}

// ══════════════════════════════════════════════
// MAPEO DE PROCESOS (ETAPA 4)
// ══════════════════════════════════════════════

export interface ProcessStep {
  order: number;
  description: string;
  actor: string;
  tool: string;
  timeMinutes: number;
  isManual: boolean;
  aiCandidate: boolean;
  aiAction?: string;
}

export interface ProcessMap {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  valueChainSegment: ValueChainSegment;
  currentSteps: ProcessStep[];
  redesignedSteps: ProcessStep[];
  implementationLevel: ImplementationLevel;
  estimatedHoursSavedWeekly: number;
  estimatedImpact: string;
  priorityScore: number;
  status: 'mapped' | 'analyzed' | 'redesigned' | 'approved' | 'implementing';
  createdAt: string;
  updatedAt: string;
}

// ══════════════════════════════════════════════
// PATRONES DE FRACASO
// ══════════════════════════════════════════════

export interface FailurePattern {
  id: string;
  name: string;
  description: string;
  source: string;
  prevention: string;
}

// ══════════════════════════════════════════════
// VALUE ENGINEERING
// ══════════════════════════════════════════════

export type ImplementationType = 'digitalization' | 'redesign';
export type ValueEffort = 'S' | 'M' | 'L' | 'XL';
export type ValueRisk = 'low' | 'medium' | 'high';
export type ValueTimeToValue = 'under_4w' | '4_to_12w' | 'over_12w';
export type ValuePnlType = 'savings' | 'revenue';

export interface ValueAssessment {
  valuePnl: number | null;
  valuePnlType: ValuePnlType | null;
  valueEffort: ValueEffort | null;
  valueRisk: ValueRisk | null;
  valueTimeToValue: ValueTimeToValue | null;
  valueScore: number | null;
}

// ══════════════════════════════════════════════
// CUJ (Critical User Journeys)
// ══════════════════════════════════════════════

export interface CujStep {
  id: string;
  cujId: string;
  stepOrder: number;
  description: string;
  actor: string;
  currentTool: string;
  estimatedTimeMinutes: number;
  painPoint: string;
  agentCandidate: boolean;
}

export interface Cuj {
  id: string;
  engagementId: string;
  name: string;
  actor: string;
  objective: string;
  steps: CujStep[];
  createdAt: string;
  updatedAt: string;
}

// ══════════════════════════════════════════════
// ÁREAS DEPARTAMENTALES
// ══════════════════════════════════════════════

export interface DepartmentArea {
  id: string;
  organizationId: string;
  standardArea: StandardArea;
  customName?: string;
  displayName: string;
  maturityScores: Record<DimensionKey, number | null>;
  assessmentStatus: AreaAssessmentStatus;
  aiOperatingLevel: AiOperatingLevel | null;
  assessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MiniAssessmentAnswer {
  dimension: DimensionKey;
  questionIndex: number;
  questionText: string;
  answer: string;
  suggestedLevel: MaturityLevel;
}
