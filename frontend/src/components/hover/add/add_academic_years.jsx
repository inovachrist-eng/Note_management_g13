import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";

export default function AddAcademicYear({ close, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Veuillez entrer un nom pour l'année académique.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/add_academic_years`,
        { name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Utilise le callback du parent pour rafraîchir sans rechargement
      if (onSuccess) onSuccess();
      close();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Erreur lors de l'ajout."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex items-center justify-center px-4">
      <div className="relative px-6 py-7 flex flex-col gap-5 w-full max-w-md bg-white shadow-2xl rounded-2xl">

        {/* Close */}
        <button
          onClick={close}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition text-lg leading-none"
        >
          ×
        </button>

        {/* Header */}
        <div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Nouvelle année académique</h2>
          <p className="text-sm text-gray-400 mt-1">Donnez un nom à cette année scolaire.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            id="academic-year-name"
            placeholder="Ex : Licence 1, Master 2…"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            autoFocus
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white w-full py-3 rounded-xl transition font-medium text-sm"
          >
            {loading ? "Ajout en cours…" : "Créer l'année"}
          </button>
        </form>

      </div>
    </div>
  );
}