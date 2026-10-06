import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  const isError = message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') || message.toLowerCase().includes('denied');

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 animate-slide-up text-sm max-w-md">
      {isError ? (
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      )}
      <span className="flex-1 font-medium text-slate-100">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
