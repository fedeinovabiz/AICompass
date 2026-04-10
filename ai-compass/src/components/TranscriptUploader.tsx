// ══════════════════════════════════════════════
// TranscriptUploader — Carga de transcripciones por archivo o texto
// ══════════════════════════════════════════════

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';

type TabType = 'archivo' | 'texto';

interface TranscriptUploaderProps {
  onFileUpload: (file: File) => void;
  onTextSubmit: (text: string) => void;
  currentTranscript?: string;
  isUploading: boolean;
}

const ACCEPTED_EXTENSIONS = ['.vtt', '.srt', '.txt'];
const ACCEPTED_MIME = ['text/vtt', 'text/plain', 'application/x-subrip'];

function isValidFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_MIME.includes(file.type);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function TranscriptUploader({
  onFileUpload,
  onTextSubmit,
  currentTranscript,
  isUploading,
}: TranscriptUploaderProps) {
  const [activeTab, setActiveTab] = useState<TabType>('archivo');
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
    setDragError(null);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!isValidFile(file)) {
      setDragError('Formato no soportado. Usa .vtt, .srt o .txt');
      return;
    }
    setDragError(null);
    onFileUpload(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidFile(file)) {
      setDragError('Formato no soportado. Usa .vtt, .srt o .txt');
      return;
    }
    setDragError(null);
    onFileUpload(file);
  }

  function handleTextSubmit() {
    if (pastedText.trim()) {
      onTextSubmit(pastedText.trim());
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 w-fit">
        {(['archivo', 'texto'] as TabType[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors capitalize ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'archivo' ? 'Subir archivo' : 'Pegar texto'}
          </button>
        ))}
      </div>

      {/* Contenido de la tab activa */}
      {activeTab === 'archivo' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-900/20'
              : 'border-gray-600 hover:border-gray-500 bg-gray-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".vtt,.srt,.txt"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading ? (
            <p className="text-gray-400 text-sm">Subiendo archivo...</p>
          ) : (
            <>
              <p className="text-gray-300 text-sm font-medium">
                Arrastrá aquí el archivo o hacé clic para seleccionar
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Formatos aceptados: .vtt, .srt, .txt
              </p>
            </>
          )}
          {dragError && (
            <p className="text-red-400 text-xs mt-2">{dragError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Pegá aquí el texto de la transcripción..."
            rows={10}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {countWords(pastedText)} palabras
            </span>
            <button
              type="button"
              onClick={handleTextSubmit}
              disabled={!pastedText.trim() || isUploading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
            >
              {isUploading ? 'Guardando...' : 'Guardar texto'}
            </button>
          </div>
        </div>
      )}

      {/* Preview de transcripción existente */}
      {currentTranscript && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Transcripción actual</h4>
            <span className="text-xs text-gray-500">
              {countWords(currentTranscript)} palabras
            </span>
          </div>
          <pre className="text-xs text-gray-400 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
            {currentTranscript.slice(0, 2000)}
            {currentTranscript.length > 2000 && '\n... (texto recortado para previsualización)'}
          </pre>
        </div>
      )}
    </div>
  );
}
