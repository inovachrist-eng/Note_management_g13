import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("L'adresse email est requise.");

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/auth/magic-link`, { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Erreur lors de l'envoi. Vérifiez votre email.");
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

          {sent ? (
            /* ── Confirmation envoi ── */
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800">Vérifiez votre boîte mail</p>
                <p className="text-sm text-gray-400 mt-1">
                  Un lien de connexion a été envoyé à <strong className="text-gray-600">{email}</strong>.<br />
                  Il expire dans <strong>15 minutes</strong>.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-xs text-gray-400 hover:text-gray-600 transition underline"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            /* ── Formulaire ── */
            <>
              <h1 className="text-2xl font-semibold text-gray-900">Connexion</h1>
              <p className="mt-1 text-sm text-gray-400">
                Pas encore de compte ?{" "}
                <Link to="/register" className="font-medium text-green-600 hover:text-green-700">S'inscrire</Link>
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
                  <label htmlFor="login-email" className="text-xs font-medium text-gray-500">
                    Adresse email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="jean@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <p className="text-xs text-gray-400">
                  Nous vous enverrons un lien de connexion par email. Aucun mot de passe requis.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi…
                    </>
                  ) : "Envoyer le lien de connexion"}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
