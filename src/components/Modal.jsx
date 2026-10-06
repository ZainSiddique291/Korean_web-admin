import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden my-8 animate-fade-in`}>
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
          <h3 className="text-lg font-bold text-slate-900 font-serif">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
