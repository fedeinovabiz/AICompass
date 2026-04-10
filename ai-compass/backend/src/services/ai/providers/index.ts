import type { AIProvider } from '../types';
import { GeminiProvider } from './geminiProvider';
import { config } from '../../../config';

const providers: Record<string, () => AIProvider> = {
  gemini: () => new GeminiProvider(),
  // claude: () => new ClaudeProvider(), // Preparado para futuro
  // openai: () => new OpenAIProvider(), // Preparado para futuro
};

export function getProvider(): AIProvider {
  const factory = providers[config.aiProvider];
  if (!factory) {
    throw new Error(`Proveedor de IA no soportado: ${config.aiProvider}. Disponibles: ${Object.keys(providers).join(', ')}`);
  }
  return factory();
}
