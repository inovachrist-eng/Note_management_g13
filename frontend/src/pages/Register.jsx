import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ full_name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim()) return setError("Le nom complet est requis.");
    if (!form.email.trim())     return setError("L'adresse email est requise.");

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/register`, {
        full_name: form.full_name.trim(),
        email:     form.email.trim(),
      });
      setDone(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
        err?.response?.data?.errors?.email?.[0] ??
        "Erreur lors de l'inscription."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="absolute top-8 left-4">
          <Link to="/" className="font-bold text-3xl  hover:text-green-700">Groupe<span className="text-green-500">13</span></Link>
      </div>
      <div className="w-full max-w-md">

        <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 md:px-8">

          {done ? (
            /* ── Confirmation inscription ── */
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800">Compte créé avec succès</p>
                <p className="text-sm text-gray-400 mt-1">
                  Connectez-vous maintenant en entrant votre email sur la page de connexion.
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition"
              >
                Se connecter
              </button>
            </div>
          ) : (
            /* ── Formulaire ── */
            <>
              <h1 className="text-2xl font-semibold text-gray-900">Créer un compte</h1>
              <p className="mt-1 text-sm text-gray-400">
                Déjà inscrit ?{" "}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-700">Se connecter</Link>
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                  <svg className="size-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-name" className="text-xs font-medium text-gray-500">Nom complet</label>
                  <input
                    id="reg-name" name="full_name" type="text" placeholder="Jean Dupont"
                    value={form.full_name} onChange={handleChange} autoFocus
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reg-email" className="text-xs font-medium text-gray-500">Adresse email</label>
                  <input
                    id="reg-email" name="email" type="email" placeholder="jean@exemple.com"
                    value={form.email} onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <p className="text-xs text-gray-400">
                  Pas de mot de passe — vous vous connecterez toujours via un lien magique envoyé par email.
                </p>

                <button
                  type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Création…
                    </>
                  ) : "Créer mon compte"}
                </button>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
