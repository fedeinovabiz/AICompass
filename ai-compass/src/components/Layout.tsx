// ══════════════════════════════════════════════
// LAYOUT — Shell principal con sidebar y header
// ══════════════════════════════════════════════

import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import RedFlagBanner from './RedFlagBanner';

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-slate-700 text-white font-medium'
            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { orgId } = useParams<{ orgId?: string }>();

  const isCouncil = user?.role === 'council';

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <h1 className="text-white font-bold text-lg tracking-tight">AI Compass</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {isCouncil ? (
            <>
              <NavItem to="/council" label="Mi organización" />
              {orgId && (
                <NavItem to={`/org/${orgId}/reports`} label="Reportes" />
              )}
            </>
          ) : (
            <>
              <NavItem to="/dashboard" label="Dashboard" />
              {orgId && (
                <>
                  <NavItem to={`/org/${orgId}`} label="Organización" />
                  <NavItem to={`/org/${orgId}/sessions`} label="Sesiones" />
                  <NavItem to={`/org/${orgId}/diagnostic`} label="Diagnóstico" />
                  <NavItem to={`/org/${orgId}/committee/design`} label="Comité" />
                  <NavItem to={`/org/${orgId}/pilots`} label="Pilotos" />
                  <NavItem to={`/org/${orgId}/scaling`} label="Escalamiento" />
                  <NavItem to={`/org/${orgId}/reports`} label="Reportes" />
                </>
              )}
            </>
          )}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-end px-6 gap-4">
          {user && (
            <span className="text-slate-300 text-sm">{user.name}</span>
          )}
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-auto">
          {orgId && <RedFlagBanner orgId={orgId} />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
