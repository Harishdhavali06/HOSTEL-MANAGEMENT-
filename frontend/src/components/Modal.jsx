import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
      />
      
      {/* Modal Container */}
      <div className="glass-card w-full max-w-lg rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all transform scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg text-slate-850 dark:text-slate-100">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-600 dark:text-slate-350">
          {children}
        </div>
        
      </div>
    </div>,
    document.body
  );
};

export default Modal;
