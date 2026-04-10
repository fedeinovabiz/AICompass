import type { AIProvider, SessionAnalysisInput, SessionAnalysisOutput, TranscriptExtractionInput, TranscriptExtractionOutput, CrossSessionInput, CrossSessionOutput } from '../types';
import { buildSessionAnalysisPrompt } from '../prompts/sessionAnalysis';
import { buildTranscriptExtractionPrompt } from '../prompts/transcriptExtraction';
import { buildCrossSessionPrompt } from '../prompts/crossSessionAnalysis';
import { config } from '../../../config';

export class GeminiProvider implements AIProvider {
  name = 'gemini';

  async analyzeSession(input: SessionAnalysisInput): Promise<SessionAnalysisOutput> {
    const prompt = buildSessionAnalysisPrompt(input);
    return this.callGemini(prompt);
  }

  async extractFromTranscript(input: TranscriptExtractionInput): Promise<TranscriptExtractionOutput> {
    const prompt = buildTranscriptExtractionPrompt(input);
    return this.callGemini(prompt);
  }

  async crossSessionAnalysis(input: CrossSessionInput): Promise<CrossSessionOutput> {
    const prompt = buildCrossSessionPrompt(input);
    return this.callGemini(prompt);
  }

  private async callGemini<T>(prompt: string): Promise<T> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: config.aiApiKey });
    const response = await ai.models.generateContent({
      model: config.aiModel,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const text = response.text ?? '';
    return JSON.parse(text) as T;
  }
}
