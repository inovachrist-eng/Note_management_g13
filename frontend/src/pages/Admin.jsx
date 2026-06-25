import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { Navigate } from "react-router-dom";
import AddAcademicYear from "../components/hover/add/add_academic_years";
import AddSemester from "../components/hover/add/add_semester";
import AddModuleAndSubject from "../components/hover/add/Add_module_and_subject";
import AdminSidebar from "../components/admin/AdminSidebar";
import { StatsPanel, computeStats } from "../components/admin/AdminStats";
import { ModuleCard } from "../components/admin/AdminModuleCard";
import { ConfirmDialog, EditNameModal, Modal } from "../components/admin/AdminDialogs";

// ─────────────────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function getFreeGrades(subject) {
  return (subject?.grades ?? []).filter((g) => g?.type === "libre" || Number(g?.session) === 0);
}

// ─────────────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-100 flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
      toast.type === "error"
        ? "bg-red-50 border-red-200 text-red-600"
        : "bg-green-50 border-green-200 text-green-700"
    }`}>
      {toast.type === "error" ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {toast.message}
    </div>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-10 py-16 flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-200">
        {icon}
      </div>
      <p className="text-lg font-semibold text-gray-800 mb-2">{title}</p>
      <p className="text-sm text-gray-400 mb-6">{description}</p>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Admin() {
  const token = getToken();

  const [user, setUser]                         = useState(null);
  const [years, setYears]                       = useState([]);
  const [selectedYear, setSelectedYear]         = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading]                   = useState(true);

  const [openAddAcademic, setOpenAddAcademic]   = useState(false);
  const [openAddSemester, setOpenAddSemester]   = useState(false);
  const [openAddModule, setOpenAddModule]       = useState(false);

  const [gradeInputs, setGradeInputs]           = useState({});
  const [savingModuleId, setSavingModuleId]     = useState(null);
  const [toast, setToast]                       = useState(null);
  const [confirmDialog, setConfirmDialog]       = useState(null);
  const [editDialog, setEditDialog]             = useState(null);

  // ── Chargement ─────────────────────────────────────────────────────────────

  const loadUserFull = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/user-full`, { headers: authHeaders() });
      const userData      = res.data.user;
      const academicYears = userData.academic_years ?? [];

      setUser(userData);
      setYears(academicYears);

      if (academicYears.length > 0) {
        const firstYear = academicYears[0];
        setSelectedYear(firstYear);
        const firstSem = firstYear.semesters?.[0] ?? null;
        setSelectedSemester(firstSem);
        if (firstSem) initGradeInputs(firstSem);
      }
    } catch (err) {
      console.error("Erreur chargement données :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) loadUserFull();
  }, [token, loadUserFull]);

  function initGradeInputs(semester) {
    const inputs = {};
    for (const mod of semester?.modules ?? []) {
      for (const subject of mod?.subjects ?? []) {
        const s1   = subject.grades?.find((g) => Number(g.session) === 1)?.score ?? "";
        const s2   = subject.grades?.find((g) => Number(g.session) === 2)?.score ?? "";
        const free = getFreeGrades(subject).map((g) => String(g.score));
        inputs[subject.id] = {
          s1:   s1 !== "" ? String(s1) : "",
          s2:   s2 !== "" ? String(s2) : "",
          free: Array(10).fill("").map((_, i) => free[i] ?? ""),
        };
      }
    }
    setGradeInputs(inputs);
  }

  function selectSemester(sem) {
    setSelectedSemester(sem);
    initGradeInputs(sem);
  }

  function selectYear(year) {
    setSelectedYear(year);
    const firstSem = year.semesters?.[0] ?? null;
    setSelectedSemester(firstSem);
    if (firstSem) initGradeInputs(firstSem);
  }

  function handleInputChange(subjectId, session, value, freeIndex) {
    setGradeInputs((prev) => {
      const curr = prev[subjectId] ?? { s1: "", s2: "", free: Array(10).fill("") };
      if (session === "free") {
        const newFree = [...(curr.free ?? Array(10).fill(""))];
        newFree[freeIndex] = value;
        return { ...prev, [subjectId]: { ...curr, free: newFree } };
      }
      return { ...prev, [subjectId]: { ...curr, [session]: value } };
    });
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function confirm(message, onConfirm) {
    setConfirmDialog({ message, onConfirm });
  }

  function openEdit(label, value, onSave) {
    setEditDialog({ label, value, onSave });
  }

  // ── Sauvegarde notes ────────────────────────────────────────────────────────

  async function saveModuleGrades(module) {
    setSavingModuleId(module.id);
    try {
      const savePromises = [];
      for (const subject of module.subjects ?? []) {
        const inputs = gradeInputs[subject.id] ?? {};

        // ── S1 / S2 ────────────────────────────────────────────────────────
        for (const sess of [1, 2]) {
          const key      = `s${sess}`;
          const val      = inputs[key] !== "" ? Number(inputs[key]) : null;
          const existing = subject.grades?.find((g) => Number(g.session) === sess);

          if (val !== null) {
            if (existing) {
              savePromises.push(axios.post(`${BASE_URL}/grades/update`, { id: existing.id, score: val }, { headers: authHeaders() }));
            } else {
              savePromises.push(axios.post(`${BASE_URL}/grades/add`, { subject_id: subject.id, session: sess, score: val, type: "examen" }, { headers: authHeaders() }));
            }
          } else if (existing) {
            // Champ vidé → suppression en base
            savePromises.push(axios.post(`${BASE_URL}/grades/delete`, { id: existing.id }, { headers: authHeaders() }));
          }
        }

        // ── Notes libres CC (N1–N10) ────────────────────────────────────────
        // Le backend supprime toutes les CC existantes puis réinsère.
        // On appelle l'endpoint dès qu'il y a des notes CC en base OU dans les inputs,
        // pour que les cases vidées soient bien supprimées.
        const existingFree = (subject.grades ?? []).filter(
          (g) => g?.type === "libre" || Number(g?.session) === 0
        );
        const freeScores = (inputs.free ?? [])
          .filter((v) => v !== "")
          .map(Number);

        if (freeScores.length > 0 || existingFree.length > 0) {
          savePromises.push(axios.post(`${BASE_URL}/grades/free`, { subject_id: subject.id, grades: freeScores }, { headers: authHeaders() }));
        }
      }
      await Promise.all(savePromises);
      showToast(`Notes de "${module.name}" sauvegardées`);
      await loadUserFull();
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Erreur lors de la sauvegarde.", "error");
    } finally {
      setSavingModuleId(null);
    }
  }

  // ── Suppressions ─────────────────────────────────────────────────────────────

  function handleDeleteYear(year) {
    confirm(`Supprimer l'année "${year.name}" et tout son contenu ?`, async () => {
      setConfirmDialog(null);
      try {
        await axios.post(`${BASE_URL}/delete-academic-years`, { id: year.id }, { headers: authHeaders() });
        showToast(`Année "${year.name}" supprimée.`);
        await loadUserFull();
      } catch { showToast("Erreur lors de la suppression.", "error"); }
    });
  }

  function handleDeleteSemester(sem) {
    confirm(`Supprimer le semestre "${sem.name}" et tout son contenu ?`, async () => {
      setConfirmDialog(null);
      try {
        await axios.post(`${BASE_URL}/delete_semester`, { id: sem.id }, { headers: authHeaders() });
        showToast(`Semestre "${sem.name}" supprimé.`);
        await loadUserFull();
      } catch { showToast("Erreur lors de la suppression.", "error"); }
    });
  }

  function handleDeleteModule(module) {
    confirm(`Supprimer le module "${module.name}" et ses matières ?`, async () => {
      setConfirmDialog(null);
      try {
        await axios.post(`${BASE_URL}/modules/delete`, { id: module.id }, { headers: authHeaders() });
        showToast(`Module "${module.name}" supprimé.`);
        await loadUserFull();
      } catch { showToast("Erreur lors de la suppression.", "error"); }
    });
  }

  function handleDeleteSubject(subject) {
    confirm(`Supprimer la matière "${subject.name}" et ses notes ?`, async () => {
      setConfirmDialog(null);
      try {
        await axios.post(`${BASE_URL}/subjects/delete`, { id: subject.id }, { headers: authHeaders() });
        showToast(`Matière "${subject.name}" supprimée.`);
        await loadUserFull();
      } catch { showToast("Erreur lors de la suppression.", "error"); }
    });
  }

  // ── Modifications ─────────────────────────────────────────────────────────────

  function handleEditYear(year) {
    openEdit(year.name, year.name, async (newName) => {
      setEditDialog(null);
      try {
        await axios.post(`${BASE_URL}/mod_academic_years`, { id: year.id, name: newName }, { headers: authHeaders() });
        showToast("Année modifiée");
        await loadUserFull();
      } catch { showToast("Erreur lors de la modification.", "error"); }
    });
  }

  function handleEditSemester(sem) {
    openEdit(sem.name, sem.name, async (newName) => {
      setEditDialog(null);
      try {
        await axios.post(`${BASE_URL}/mod_semester`, { id: sem.id, name: newName }, { headers: authHeaders() });
        showToast("Semestre modifié");
        await loadUserFull();
      } catch { showToast("Erreur lors de la modification.", "error"); }
    });
  }

  function handleEditModule(module) {
    openEdit(module.name, module.name, async (newName) => {
      setEditDialog(null);
      try {
        await axios.post(`${BASE_URL}/modules/update`, { id: module.id, name: newName }, { headers: authHeaders() });
        showToast("Module modifié");
        await loadUserFull();
      } catch { showToast("Erreur lors de la modification.", "error"); }
    });
  }

  function handleEditSubject(subject) {
    openEdit(subject.name, subject.name, async (newName) => {
      setEditDialog(null);
      try {
        await axios.post(`${BASE_URL}/subjects/update`, { id: subject.id, name: newName }, { headers: authHeaders() });
        showToast("Matière modifiée");
        await loadUserFull();
      } catch { showToast("Erreur lors de la modification.", "error"); }
    });
  }

  function logout() {
    axios.post(`${BASE_URL}/logout`, {}, { headers: authHeaders() }).catch(() => {});
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!token) return <Navigate to="/" replace />;

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const moduleCount = selectedSemester?.modules?.length ?? 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-sans">

      <Toast toast={toast} />

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {editDialog && (
        <EditNameModal
          label={editDialog.label}
          initialValue={editDialog.value}
          onSave={editDialog.onSave}
          onCancel={() => setEditDialog(null)}
        />
      )}

      {openAddAcademic && (
        <Modal><AddAcademicYear close={() => setOpenAddAcademic(false)} onSuccess={loadUserFull} /></Modal>
      )}
      {openAddSemester && selectedYear && (
        <Modal><AddSemester close={() => setOpenAddSemester(false)} academicYearId={selectedYear.id} onSuccess={loadUserFull} /></Modal>
      )}
      {openAddModule && selectedSemester && (
        <Modal><AddModuleAndSubject close={() => setOpenAddModule(false)} semesterId={selectedSemester.id} onSuccess={loadUserFull} /></Modal>
      )}

      <AdminSidebar
        user={user}
        initials={initials}
        years={years}
        selectedYear={selectedYear}
        selectedSemester={selectedSemester}
        onSelectYear={selectYear}
        onSelectSemester={selectSemester}
        onAddAcademicYear={() => setOpenAddAcademic(true)}
        onAddSemester={() => setOpenAddSemester(true)}
        onEditYear={handleEditYear}
        onDeleteYear={handleDeleteYear}
        onEditSemester={handleEditSemester}
        onDeleteSemester={handleDeleteSemester}
        onLogout={logout}
      />

      {/* Main */}
      <main className="flex-1 px-8 py-8 overflow-y-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 mb-1">Système LMD · Tableau de bord</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            {selectedSemester ? selectedSemester.name : "Dashboard"}
          </h1>
          {selectedSemester && selectedYear && (
            <p className="text-sm text-gray-400 mt-1">{selectedYear.name} · {selectedSemester.name}</p>
          )}
        </div>

        {/* Légende */}
        {!loading && selectedSemester && (
          <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-200 inline-block" />
              S1 / S2 = Sessions officielles
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-dashed border-gray-300 inline-block" />
              N1–N10 = Notes libres (contrôle continu, TD, TP…)
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <svg className="w-7 h-7 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-400">Chargement des données…</p>
            </div>
          </div>
        )}

        {/* Empty: pas d'année */}
        {!loading && years.length === 0 && (
          <EmptyState
            icon={<svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}
            title="Aucune année académique"
            description="Commencez par créer votre première année scolaire."
            action={
              <button
                onClick={() => setOpenAddAcademic(true)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition"
              >
                + Créer une année académique
              </button>
            }
          />
        )}

        {/* Empty: pas de semestre sélectionné */}
        {!loading && years.length > 0 && !selectedSemester && (
          <EmptyState
            icon={<svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h7" /></svg>}
            title="Aucun semestre sélectionné"
            description={
              selectedYear?.semesters?.length > 0
                ? "Sélectionnez un semestre dans la barre latérale."
                : "Créez votre premier semestre pour commencer."
            }
            action={
              selectedYear ? (
                <button
                  onClick={() => setOpenAddSemester(true)}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition"
                >
                  + Créer un semestre
                </button>
              ) : null
            }
          />
        )}

        {/* Contenu principal */}
        {!loading && selectedSemester && (
          <>
            <StatsPanel semester={selectedSemester} />

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Modules & UE</p>
                <h2 className="text-lg font-medium text-gray-900">
                  {moduleCount} module{moduleCount > 1 ? "s" : ""}
                </h2>
              </div>
              <button
                onClick={() => setOpenAddModule(true)}
                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Ajouter un module
              </button>
            </div>

            {moduleCount === 0 && (
              <EmptyState
                icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                title="Aucun module"
                description="Ajoutez des modules et leurs UE pour saisir des notes."
                action={null}
              />
            )}

            {(selectedSemester.modules ?? []).map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                gradeInputs={gradeInputs}
                onInputChange={handleInputChange}
                onSave={saveModuleGrades}
                saving={savingModuleId === module.id}
                onDeleteModule={handleDeleteModule}
                onEditModule={handleEditModule}
                onDeleteSubject={handleDeleteSubject}
                onEditSubject={handleEditSubject}
              />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
