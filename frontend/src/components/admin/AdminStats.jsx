// Calculs et composants de statistiques LMD

function getFreeGrades(subject) {
  return (subject?.grades ?? []).filter((g) => g?.type === "libre" || Number(g?.session) === 0);
}

/**
 * Règles LMD :
 *   Si S2 est renseignée → moyenne finale = S2
 *   Sinon, si S1 est renseignée → moyenne finale = (S1 × 0,6) + (moy. CC × 0,4)
 *     Si aucune note CC → moyenne finale = S1 seule
 *   Sinon → pas de moyenne
 *
 * @param {number|null} s1
 * @param {number|null} s2
 * @param {number[]}    ccNums  tableau de notes CC déjà filtrées (non vides)
 * @returns {number|null}
 */
export function computeSubjectAvg(s1, s2, ccNums) {
  if (s2 !== null) return s2;
  if (s1 === null) return null;
  if (ccNums.length > 0) {
    const ccAvg = ccNums.reduce((a, b) => a + b, 0) / ccNums.length;
    return (s1 * 0.6) + (ccAvg * 0.4);
  }
  return s1;
}

export function getLMDMention(avg) {
  if (avg === null) return null;
  if (avg >= 16) return { label: "A", color: "green", text: "Très bien" };
  if (avg >= 14) return { label: "B", color: "green", text: "Bien" };
  if (avg >= 12) return { label: "C", color: "green", text: "Assez bien" };
  if (avg >= 10) return { label: "D", color: "gray", text: "Passable" };
  if (avg >= 8)  return { label: "E", color: "gray", text: "Insuffisant" };
  return { label: "F", color: "red", text: "Échec" };
}

export function computeStats(semester) {
  let totalSubjects = 0;
  let validatedSubjects = 0;
  let totalCredits = 0;
  let earnedCredits = 0;
  let allAverages = [];

  for (const mod of semester?.modules ?? []) {
    const credits = Number(mod.credits ?? 0);
    totalCredits += credits;

    for (const subject of mod?.subjects ?? []) {
      totalSubjects++;

      const s1Raw = subject.grades?.find((g) => Number(g.session) === 1)?.score;
      const s2Raw = subject.grades?.find((g) => Number(g.session) === 2)?.score;
      const s1 = s1Raw != null ? Number(s1Raw) : null;
      const s2 = s2Raw != null ? Number(s2Raw) : null;
      const ccNums = getFreeGrades(subject).map((g) => Number(g.score)).filter((v) => !isNaN(v));

      const avg = computeSubjectAvg(s1, s2, ccNums);

      if (avg !== null) {
        allAverages.push(avg);
        if (avg >= 10) {
          validatedSubjects++;
          earnedCredits += credits;
        }
      }
    }
  }

  const moyenneGenerale =
    allAverages.length > 0
      ? allAverages.reduce((a, b) => a + b, 0) / allAverages.length
      : null;

  return {
    totalSubjects,
    validatedSubjects,
    nonValidated: totalSubjects - validatedSubjects,
    totalCredits,
    earnedCredits,
    moyenneGenerale,
    bestScore: allAverages.length > 0 ? Math.max(...allAverages) : null,
    progression: totalSubjects > 0 ? (validatedSubjects / totalSubjects) * 100 : 0,
    mention: getLMDMention(moyenneGenerale),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, sub }) {
  const colorClasses = {
    green: "bg-green-50 text-green-600 border-green-100",
    red:   "bg-red-50 text-red-500 border-red-100",
    gray:  "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <div className="flex-1 min-w-40 bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${colorClasses[color] ?? colorClasses.gray}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5 truncate">{label}</p>
        <p className="text-xl font-semibold text-gray-900 leading-tight">{value ?? "—"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 80 ? "bg-green-600" : pct >= 50 ? "bg-gray-400" : "bg-red-400";
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatsPanel({ semester }) {
  const s = computeStats(semester);
  const fmt = (v) => (v !== null ? v.toFixed(2) : "—");

  return (
    <div className="mb-8">
      <p className="text-xs text-gray-400 mb-4">Statistiques LMD — {semester.name}</p>

      <div className="flex flex-wrap gap-3 mb-4">
        <StatCard
          label="Moyenne générale"
          value={s.moyenneGenerale !== null ? `${fmt(s.moyenneGenerale)} / 20` : "—"}
          color={s.moyenneGenerale !== null && s.moyenneGenerale >= 10 ? "green" : "red"}
          sub={s.moyenneGenerale !== null ? (s.moyenneGenerale >= 10 ? "Semestre validé" : "Non validé") : "Aucune note"}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          label="Crédits ECTS obtenus"
          value={`${s.earnedCredits} / ${s.totalCredits}`}
          color="green"
          sub="Crédits validés (≥ 10/20)"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
          }
        />
        <StatCard
          label="UE validées"
          value={`${s.validatedSubjects} / ${s.totalSubjects}`}
          color="green"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="UE non validées"
          value={s.nonValidated}
          color="red"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Meilleure note"
          value={s.bestScore !== null ? `${fmt(s.bestScore)} / 20` : "—"}
          color="green"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
        <StatCard
          label="Progression"
          value={`${Math.round(s.progression)} %`}
          color="gray"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression du semestre</span>
          <span className="text-sm font-semibold text-gray-900">{Math.round(s.progression)} %</span>
        </div>
        <ProgressBar value={s.progression} />
        <p className="text-xs text-gray-400 mt-2">
          {s.validatedSubjects} UE validée{s.validatedSubjects > 1 ? "s" : ""} sur {s.totalSubjects} — {s.earnedCredits} crédits ECTS acquis
        </p>
      </div>
    </div>
  );
}
