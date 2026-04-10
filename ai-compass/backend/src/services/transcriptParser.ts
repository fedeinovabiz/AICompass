export interface ParsedTranscript {
  text: string;
  segments: TranscriptSegment[];
  wordCount: number;
}

export interface TranscriptSegment {
  startTime?: string;
  endTime?: string;
  speaker?: string;
  text: string;
}

export function parseTranscript(content: string, format: 'text' | 'vtt' | 'srt'): ParsedTranscript {
  switch (format) {
    case 'vtt': return parseVTT(content);
    case 'srt': return parseSRT(content);
    default: return parsePlainText(content);
  }
}

function parsePlainText(content: string): ParsedTranscript {
  const text = content.trim();
  return { text, segments: [{ text }], wordCount: text.split(/\s+/).length };
}

function parseVTT(content: string): ParsedTranscript {
  const lines = content.split('\n');
  const segments: TranscriptSegment[] = [];
  let i = 0;
  while (i < lines.length && !lines[i].includes('-->')) i++;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const [startTime, endTime] = line.split('-->').map((s) => s.trim());
      const textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i].trim().replace(/<[^>]*>/g, ''));
        i++;
      }
      const text = textLines.join(' ');
      const speakerMatch = text.match(/^([^:]+):\s*(.*)/);
      segments.push({
        startTime, endTime,
        speaker: speakerMatch ? speakerMatch[1] : undefined,
        text: speakerMatch ? speakerMatch[2] : text,
      });
    }
    i++;
  }
  const fullText = segments.map((s) => (s.speaker ? `${s.speaker}: ${s.text}` : s.text)).join('\n');
  return { text: fullText, segments, wordCount: fullText.split(/\s+/).length };
}

function parseSRT(content: string): ParsedTranscript {
  const blocks = content.trim().split(/\n\n+/);
  const segments: TranscriptSegment[] = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;
    const timeLine = lines[1];
    if (!timeLine.includes('-->')) continue;
    const [startTime, endTime] = timeLine.split('-->').map((s) => s.trim());
    const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, '');
    const speakerMatch = text.match(/^([^:]+):\s*(.*)/);
    segments.push({
      startTime, endTime,
      speaker: speakerMatch ? speakerMatch[1] : undefined,
      text: speakerMatch ? speakerMatch[2] : text,
    });
  }
  const fullText = segments.map((s) => (s.speaker ? `${s.speaker}: ${s.text}` : s.text)).join('\n');
  return { text: fullText, segments, wordCount: fullText.split(/\s+/).length };
}

export function detectFormat(filename: string): 'text' | 'vtt' | 'srt' {
  if (filename.endsWith('.vtt')) return 'vtt';
  if (filename.endsWith('.srt')) return 'srt';
  return 'text';
}
