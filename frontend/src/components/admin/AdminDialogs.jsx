import { useState } from "react";

export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full border border-gray-200">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4 mx-auto border border-red-100">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-center text-sm font-semibold text-gray-800 mb-1">Confirmer la suppression</p>
        <p className="text-center text-xs text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditNameModal({ label, initialValue, onSave, onCancel }) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full border border-gray-200">
        <p className="text-sm font-semibold text-gray-800 mb-4">Modifier : {label}</p>
        <input
          autoFocus
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 transition mb-4 bg-white"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(value);
            if (e.key === "Escape") onCancel();
          }}
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(value)}
            className="flex-1 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-sm font-medium transition"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export function Modal({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {children}
    </div>
  );
}
