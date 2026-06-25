import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";

export default function AddSemester({ close, academicYearId, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Veuillez entrer un nom pour le semestre.");
      return;
    }

    if (!academicYearId) {
      setError("Aucune année académique sélectionnée.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/add_semester`,
        {
          name: name.trim(),
          academic_year_id: academicYearId,
          // order_number est maintenant auto-généré côté backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onSuccess) onSuccess();
      close();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Erreur lors de l'ajout du semestre."
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
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h10M4 18h7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Nouveau semestre</h2>
          <p className="text-sm text-gray-400 mt-1">
            L'ordre sera attribué automatiquement.
          </p>
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
            id="semester-name"
            placeholder="Ex : Semestre 1, S2…"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
            autoFocus
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white w-full py-3 rounded-xl transition font-medium text-sm"
          >
            {loading ? "Ajout en cours…" : "Créer le semestre"}
          </button>
        </form>

      </div>
    </div>
  );
}