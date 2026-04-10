// ══════════════════════════════════════════════
// LOGIN PAGE — Formulario de autenticación
// ══════════════════════════════════════════════

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

function validate(email: string, password: string): string | null {
  if (!email.trim()) return 'El email es requerido';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    setClientError(null);

    const validationError = validate(email, password);
    if (validationError) {
      setClientError(validationError);
      return;
    }

    try {
      await login(email, password);
      void navigate('/dashboard');
    } catch {
      // El error ya queda en el store
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Enter') {
      void handleSubmit(e as unknown as FormEvent);
    }
  }

  const displayError = clientError ?? error;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">AI Compass</h1>
          <p className="text-slate-400 mt-1 text-sm">Ingresa con tu cuenta</p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          onKeyDown={handleKeyDown}
          className="bg-slate-800 rounded-xl p-6 space-y-4 shadow-xl"
          noValidate
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm placeholder-slate-400"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm placeholder-slate-400"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {displayError && (
            <p className="text-red-400 text-sm">{displayError}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
