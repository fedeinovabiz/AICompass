// ══════════════════════════════════════════════
// DASHBOARD PAGE — Listado de organizaciones
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationStore } from '@/stores/organizationStore';
import { useAuthStore } from '@/stores/authStore';
import type { Organization } from '@/types';

const STAGE_LABELS: Record<number, string> = {
  1: 'Etapa 1',
  2: 'Etapa 2',
  3: 'Etapa 3',
  4: 'Etapa 4',
  5: 'Etapa 5',
};

function averageScore(scores: Organization['maturityScores']): string {
  const values = Object.values(scores).filter((v): v is number => v !== null);
  if (values.length === 0) return '—';
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg.toFixed(1);
}

interface NewOrgForm {
  name: string;
  industry: string;
  size: string;
  contactName: string;
  contactEmail: string;
}

const EMPTY_FORM: NewOrgForm = {
  name: '',
  industry: '',
  size: '',
  contactName: '',
  contactEmail: '',
};

function OrgCard({ org, onClick }: { org: Organization; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-slate-800 rounded-xl p-5 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-500"
    >
      <h3 className="text-white font-semibold text-base mb-1 truncate">{org.name}</h3>
      <p className="text-slate-400 text-sm mb-3 truncate">{org.industry}</p>
      <div className="flex items-center justify-between">
        <span className="inline-block px-2 py-0.5 bg-blue-900 text-blue-300 text-xs rounded-full font-medium">
          {STAGE_LABELS[org.currentStage] ?? `Etapa ${org.currentStage}`}
        </span>
        <span className="text-slate-400 text-xs">
          Score: <span className="text-white font-medium">{averageScore(org.maturityScores)}</span>
        </span>
      </div>
    </button>
  );
}

function NewOrgModal({
  onClose,
  onSubmit,
  isLoading,
  error,
}: {
  onClose: () => void;
  onSubmit: (data: NewOrgForm) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<NewOrgForm>(EMPTY_FORM);

  function handleChange(field: keyof NewOrgForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">Nueva Organización</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
          {[
            { field: 'name' as const, label: 'Nombre', placeholder: 'Acme Corp' },
            { field: 'industry' as const, label: 'Industria', placeholder: 'Tecnología' },
            { field: 'size' as const, label: 'Tamaño', placeholder: '50-200 empleados' },
            { field: 'contactName' as const, label: 'Contacto', placeholder: 'Juan Pérez' },
            { field: 'contactEmail' as const, label: 'Email contacto', placeholder: 'juan@acme.com' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
              <input
                type={field === 'contactEmail' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm placeholder-slate-400"
              />
            </div>
          ))}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors font-medium"
            >
              {isLoading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const { organizations, isLoading, error, fetchOrganizations, createOrganization } =
    useOrganizationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const canCreateOrg = user?.role === 'admin' || user?.role === 'facilitator';

  useEffect(() => {
    void fetchOrganizations();
  }, [fetchOrganizations]);

  async function handleCreate(data: NewOrgForm) {
    const org = await createOrganization(data);
    setShowModal(false);
    void navigate(`/org/${org.id}`);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-bold">Organizaciones</h2>
        {canCreateOrg && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Nueva Organización
          </button>
        )}
      </div>

      {isLoading && (
        <p className="text-slate-400 text-sm">Cargando organizaciones...</p>
      )}

      {!isLoading && error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {!isLoading && !error && organizations.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400">No hay organizaciones aún</p>
        </div>
      )}

      {!isLoading && organizations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              onClick={() => void navigate(`/org/${org.id}`)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NewOrgModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}
