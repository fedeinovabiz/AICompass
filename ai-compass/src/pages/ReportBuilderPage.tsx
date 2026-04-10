// ══════════════════════════════════════════════
// REPORT BUILDER PAGE — Editor de entregables con preview (F-012)
// ══════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { DeliverableType } from '@/types';

// ── Parser básico de Markdown (sin librerías externas) ──────────────────────

function parseMarkdown(text: string): string {
  const lines = text.split('\n');
  const htmlLines: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw;

    // Headings
    if (/^### /.test(line)) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      const content = applyInline(line.replace(/^### /, ''));
      htmlLines.push(`<h3 class="text-lg font-semibold text-slate-100 mt-4 mb-1">${content}</h3>`);
      continue;
    }
    if (/^## /.test(line)) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      const content = applyInline(line.replace(/^## /, ''));
      htmlLines.push(`<h2 class="text-xl font-bold text-white mt-5 mb-2">${content}</h2>`);
      continue;
    }
    if (/^# /.test(line)) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      const content = applyInline(line.replace(/^# /, ''));
      htmlLines.push(`<h1 class="text-2xl font-extrabold text-white mt-6 mb-3">${content}</h1>`);
      continue;
    }

    // Listas
    if (/^- /.test(line)) {
      if (!inList) { htmlLines.push('<ul class="list-disc list-inside space-y-1 my-2 text-slate-300">'); inList = true; }
      const content = applyInline(line.replace(/^- /, ''));
      htmlLines.push(`<li>${content}</li>`);
      continue;
    }

    // Línea vacía
    if (line.trim() === '') {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push('<br />');
      continue;
    }

    // Párrafo
    if (inList) { htmlLines.push('</ul>'); inList = false; }
    const content = applyInline(line);
    htmlLines.push(`<p class="text-slate-300 leading-relaxed my-1">${content}</p>`);
  }

  if (inList) htmlLines.push('</ul>');
  return htmlLines.join('\n');
}

function applyInline(text: string): string {
  // Bold: **texto**
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
}

// ── Tipos internos ───────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved';

const DELIVERABLE_LABELS: Record<string, string> = {
  'findings-map': 'Mapa de hallazgos',
  'committee-proposal': 'Propuesta de comité',
  'constitution-act': 'Acta de constitución',
  'full-diagnostic': 'Diagnóstico completo',
  'quick-win-sheet': 'Ficha de quick win',
  'final-presentation': 'Presentación final',
  'pilot-design': 'Diseño de piloto',
  'biweekly-report': 'Informe quincenal',
  'pilot-evaluation': 'Evaluación de piloto',
};

// ── Componente principal ─────────────────────────────────────────────────────

export default function ReportBuilderPage() {
  const { orgId } = useParams<{ orgId?: string }>();
  const [queryParams] = useSearchParams();

  const deliverableTypeParam = queryParams.get('type') as DeliverableType | null;
  const deliverableType = deliverableTypeParam ?? 'full-diagnostic';

  const [content, setContent] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isPublished, setIsPublished] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = `report_${orgId ?? 'sin-org'}_${deliverableType}`;
  const publishedKey = `report_published_${orgId ?? 'sin-org'}_${deliverableType}`;

  // Cargar desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setContent(saved);

    const published = localStorage.getItem(publishedKey);
    if (published === 'true') setIsPublished(true);
  }, [storageKey, publishedKey]);

  // Auto-guardado con debounce de 2s
  const handleChange = useCallback((value: string) => {
    setContent(value);
    setSaveStatus('saving');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(storageKey, value);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 2000);
  }, [storageKey]);

  const handlePublishConfirm = useCallback(() => {
    localStorage.setItem(publishedKey, 'true');
    setIsPublished(true);
    setShowConfirmModal(false);
  }, [publishedKey]);

  const titulo = DELIVERABLE_LABELS[deliverableType] ?? deliverableType;
  const previewHtml = parseMarkdown(content);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div>
          <h2 className="text-white font-bold text-lg">{titulo}</h2>
          {orgId && (
            <p className="text-slate-400 text-sm mt-0.5">
              Organización: <span className="text-slate-300">{orgId}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Indicador de guardado */}
          {saveStatus === 'saving' && (
            <span className="text-slate-400 text-sm animate-pulse">Guardando...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-green-400 text-sm">Guardado</span>
          )}
          {isPublished && (
            <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-md font-medium">
              Publicado
            </span>
          )}

          {/* Botón publicar */}
          {!isPublished && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Publicar
            </button>
          )}
        </div>
      </div>

      {/* Cuerpo: editor + preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-700">
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Editor Markdown</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={isPublished}
            placeholder="Escribí tu contenido en Markdown..."
            className={`flex-1 w-full bg-slate-800 text-white text-sm font-mono p-4 resize-none outline-none leading-relaxed
              ${isPublished ? 'opacity-60 cursor-not-allowed' : 'focus:bg-slate-750'}`}
          />
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Vista previa</span>
          </div>
          <div
            className="flex-1 bg-slate-800 text-slate-200 p-6 overflow-auto text-sm"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-slate-500 italic">El contenido aparecerá aquí...</p>' }}
          />
        </div>
      </div>

      {/* Modal de confirmación de publicación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">¿Publicar entregable?</h3>
            <p className="text-slate-300 text-sm mb-6">
              Una vez publicado, el documento quedará en modo solo lectura y no podrá editarse.
              ¿Estás seguro de continuar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublishConfirm}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
