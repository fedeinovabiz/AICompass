import type { User, Organization, Engagement, Session, Committee, Pilot, Deliverable, RedFlag, CrossSessionAnalysis } from './index';

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { token: string; user: User; }

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string>;
}

export interface TranscriptUploadResponse {
  fileUrl: string;
  parsedText: string;
  wordCount: number;
}

export interface AIProcessRequest {
  sessionId: string;
  includeTranscript: boolean;
  includeNotes: boolean;
}

export interface AIProcessResponse {
  questions: Array<{
    questionId: string;
    suggestedAnswer: string;
    suggestedLevel: number;
    confidence: string;
    citations: Array<{ text: string; speakerName: string; speakerRole: string; timestamp?: string }>;
  }>;
  findings: Array<{
    type: string;
    description: string;
    citations: Array<{ text: string; speakerName: string; speakerRole: string }>;
    relatedDimensions: string[];
  }>;
}

export interface CrossAnalysisRequest {
  organizationId: string;
  sessionIds: string[];
}

export type CrossAnalysisResponse = CrossSessionAnalysis;

// Re-export para comodidad
export type { User, Organization, Engagement, Session, Committee, Pilot, Deliverable, RedFlag, CrossSessionAnalysis };
