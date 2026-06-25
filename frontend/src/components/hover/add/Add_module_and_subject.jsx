import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config";

// Ligne matière vide par défaut
const emptySubject = () => ({ name: "" });

export default function AddModuleAndSubject({ close, semesterId, onSuccess }) {
  const [moduleName, setModuleName] = useState("");
  const [credits, setCredits] = useState("");
  const [subjects, setSubjects] = useState([emptySubject()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Gestion des lignes de matières ────────────────────────────────────────

  function addSubjectRow() {
    setSubjects((prev) => [...prev, emptySubject()]);
  }

  function removeSubjectRow(index) {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSubject(index, value) {
    setSubjects((prev) =>
      prev.map((s, i) => (i === index ? { ...s, name: value } : s))
    );
  }

  // ── Soumission ─────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!moduleName.trim()) {
      setError("Le nom du module est obligatoire.");
      return;
    }
    if (!credits || Number(credits) < 1) {
      setError("Les crédits doivent être au minimum 1.");
      return;
    }
    if (!semesterId) {
      setError("Semestre introuvable.");
      return;
    }

    const validSubjects = subjects.filter((s) => s.name.trim() !== "");
    if (validSubjects.length === 0) {
      setError("Ajoutez au moins une matière.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Créer le module (order_number auto-généré)
      const moduleRes = await axios.post(
        `${BASE_URL}/modules/add`,
        {
          semester_id: semesterId,
          name: moduleName.trim(),
          credits: Number(credits),
        },
        { headers }
      );

      // Récupère l'ID du module créé
      const moduleId =
        moduleRes.data?.data?.id ||
        moduleRes.data?.module?.id ||
        moduleRes.data?.id;

      if (!moduleId) throw new Error("ID du module introuvable dans la réponse.");

      // 2. Créer toutes les matières valides (order_number auto-généré)
      await Promise.all(
        validSubjects.map((subject) =>
          axios.post(
            `${BASE_URL}/subjects/add`,
            { module_id: moduleId, name: subject.name.trim() },
            { headers }
          )
        )
      );

      if (onSuccess) onSuccess();
      close();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de l'ajout."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex items-center justify-center px-4">
      <div className="relative px-6 py-7 flex flex-col gap-6 w-full max-w-lg bg-white shadow-2xl rounded-2xl max-h-[92vh] overflow-y-auto">

        {/* Close */}
        <button
          type="button"
          onClick={close}
          aria-label="Fermer la fenêtre"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition text-lg leading-none"
        >
          ×
        </button>

        {/* Header */}
        <div>
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Nouveau module</h2>
          <p className="text-sm text-gray-400 mt-1">
            Créez un module et ajoutez ses matières. L'ordre est géré automatiquement.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Module ── */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Module
            </p>

            <input
              id="module-name"
              type="text"
              placeholder="Nom du module (ex : Algorithmique)"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
            />

            <input
              id="module-credits"
              type="number"
              placeholder="Nombre de crédits (ex : 3)"
              min={1}
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
            />
          </div>

          <div className="border-t border-gray-100" />

          {/* ── Matières ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Matières
              </p>
              <button
                type="button"
                onClick={addSubjectRow}
                className="text-xs font-semibold text-violet-500 hover:text-violet-700 transition flex items-center gap-1"
              >
                <span className="text-base leading-none">+</span> Ajouter
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    id={`subject-name-${index}`}
                    type="text"
                    placeholder={`Matière ${index + 1}`}
                    value={subject.name}
                    onChange={(e) => updateSubject(index, e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                  />
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubjectRow(index)}
                      className="w-9 h-9 flex-shrink-0 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white w-full py-3 rounded-xl transition font-medium text-sm"
          >
            {loading ? "Création en cours…" : "Créer le module"}
          </button>

        </form>
      </div>
    </div>
  );
}