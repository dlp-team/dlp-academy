// src/components/modals/DeleteModal.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import BaseModal from '../ui/BaseModal';

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName }: any) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      backdropClassName="absolute inset-0 bg-black/50 backdrop-blur-sm"
      contentWrapperClassName="relative z-10 flex min-h-full items-center justify-center p-4"
      contentClassName="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100"
    >
        
        {/* Cabecera Roja */}
        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">¿Estás seguro?</h3>
          <p className="text-sm text-gray-500 mt-2">
            Vas a eliminar la asignatura <span className="font-bold text-gray-800">"{itemName}"</span>.
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Botones */}
        <div className="p-4 flex gap-3 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
          >
            Sí, Eliminar
          </button>
        </div>
    </BaseModal>
  );
};

export default DeleteModal;