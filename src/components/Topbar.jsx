import { Menu, RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function Topbar({ onToggleSidebar }) {
  const { adminUser, isSyncing, refreshAllData } = useAdmin();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            SEORA Admin Control Center
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Centralized Korean skincare product catalog, orders & customer records
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={refreshAllData}
          disabled={isSyncing}
          className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
          title="Refresh Dashboard Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online</span>
        </span>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 font-bold text-xs flex items-center justify-center border border-primary-200">
            {adminUser?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden lg:inline">
            {adminUser?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
