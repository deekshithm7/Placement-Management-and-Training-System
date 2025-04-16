import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="glass rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center p-6 border-b border-[var(--text-secondary)]/20">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
          <Button variant="secondary" onClick={onClose} className="p-2">
            <X size={20} />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default React.memo(Modal);