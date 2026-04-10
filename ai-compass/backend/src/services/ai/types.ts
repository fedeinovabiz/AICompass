export interface AIProvider {
  name: string;
  analyzeSession(input: SessionAnalysisInput): Promise<SessionAnalysisOutput>;
  extractFromTranscript(input: TranscriptExtractionInput): Promise<TranscriptExtractionOutput>;
  crossSessionAnalysis(input: CrossSessionInput): Promise<CrossSessionOutput>;
}

export interface SessionAnalysisInput {
  sessionType: string;
  questions: Array<{ questionId: string; questionText: string; dimension: string; manualAnswer?: string }>;
  notes: string;
  participants: Array<{ name: string; role: string; area: string }>;
}

export interface TranscriptExtractionInput {
  sessionType: string;
  questions: Array<{ questionId: string; questionText: string; dimension: string }>;
  transcriptText: string;
  notes: string;
  participants: Array<{ name: string; role: string; area: string }>;
}

export interface SessionAnalysisOutput {
  questions: Array<{
    questionId: string;
    suggestedAnswer: string;
    suggestedLevel: number;
    confidence: 'alto' | 'medio' | 'bajo';
    citations: Array<{ text: string; speakerName: string; speakerRole: string; timestamp?: string }>;
  }>;
  findings: Array<{
    type: 'alignment' | 'misalignment' | 'champion' | 'resistance' | 'uncovered-topic';
    description: string;
    citations: Array<{ text: string; speakerName: string; speakerRole: string }>;
    relatedDimensions: string[];
  }>;
}

export type TranscriptExtractionOutput = SessionAnalysisOutput;

export interface CrossSessionInput {
  sessions: Array<{
    type: string;
    questions: Array<{ questionId: string; dimension: string; finalAnswer: string; level: number }>;
    findings: Array<{ type: string; description: string }>;
  }>;
  organizationName: string;
  industry: string;
}

export interface CrossSessionOutput {
  dimensionScores: Record<string, { score: number; summary: string; gaps: string[] }>;
  committeeRecommendation: {
    suggestedMembers: Array<{ role: string; suggestedPerson?: string; justification: string }>;
  };
  deepDiveRecommendations: Array<{
    trigger: string; title: string; justification: string; suggestedQuestions: string[];
  }>;
  quickWinSuggestions: Array<{
    title: string; processBefore: string; processAfter: string; suggestedTool: string;
    estimatedImpact: string; timeline: string;
    valueChainSegment: string; implementationLevel: string; diminishingReturns: string;
  }>;
}
