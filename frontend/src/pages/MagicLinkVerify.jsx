import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";

export default function MagicLinkVerify() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("Lien invalide — aucun token trouvé.");
      return;
    }

    axios
      .post(`${BASE_URL}/auth/magic-link/verify`, { token })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        navigate("/admin", { replace: true });
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err?.response?.data?.message ?? "Ce lien est invalide ou a expiré.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">

          {status === "loading" && (
            <>
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-800">Connexion en cours…</p>
              <p className="text-xs text-gray-400 mt-1">Vérification de votre lien magique</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Lien invalide</p>
              <p className="text-xs text-gray-400 mb-6">{errorMsg}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition"
              >
                Retour à la connexion
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
