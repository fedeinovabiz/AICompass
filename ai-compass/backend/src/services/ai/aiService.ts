import { getProvider } from './providers';
import type { SessionAnalysisInput, SessionAnalysisOutput, TranscriptExtractionInput, TranscriptExtractionOutput, CrossSessionInput, CrossSessionOutput } from './types';

const RATE_LIMIT_MS = 1200;
let lastCallAt = 0;

async function waitRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastCallAt;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }
  lastCallAt = Date.now();
}

export async function analyzeSession(input: SessionAnalysisInput): Promise<SessionAnalysisOutput> {
  await waitRateLimit();
  const provider = getProvider();
  return provider.analyzeSession(input);
}

export async function extractFromTranscript(input: TranscriptExtractionInput): Promise<TranscriptExtractionOutput> {
  await waitRateLimit();
  const provider = getProvider();
  return provider.extractFromTranscript(input);
}

export async function crossSessionAnalysis(input: CrossSessionInput): Promise<CrossSessionOutput> {
  await waitRateLimit();
  const provider = getProvider();
  return provider.crossSessionAnalysis(input);
}
