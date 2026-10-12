import { useState } from 'react';
import { ShieldCheck, Lock, RefreshCw, Mail } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Toast from '../components/Toast';

export default function LoginPage() {
  const { login, toast, hideToast } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
    } catch {
      // Toast already triggered in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-primary-100 selection:text-primary-800">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-700/50 animate-fade-in">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto mb-4 border border-primary-100 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-primary-700" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            MongoDB Atlas Connected (ecom)
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">
            SEORA Admin Portal
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Centralized Korean skincare product catalog, orders & customer records
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.com"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <a
            href={
              import.meta.env.VITE_CLIENT_URL && !import.meta.env.VITE_CLIENT_URL.includes('localhost')
                ? import.meta.env.VITE_CLIENT_URL
                : typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)
                ? `${window.location.protocol}//${window.location.hostname}:5173`
                : import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline"
          >
            ← Return to Customer Storefront
          </a>
        </div>
      </div>

      <Toast message={toast} onClose={hideToast} />
    </div>
  );
}
