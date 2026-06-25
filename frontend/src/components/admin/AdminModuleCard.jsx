import { getLMDMention, computeSubjectAvg } from "./AdminStats";

const mentionColors = {
  green: "bg-green-50 text-green-700 border-green-200",
  gray:  "bg-gray-100 text-gray-600 border-gray-200",
  red:   "bg-red-50 text-red-600 border-red-200",
};

// ─────────────────────────────────────────────────────────────────────────────

function SubjectRow({ subject, gradeState, onChange, onDelete, onEdit }) {
  const s1Val = gradeState?.s1 ?? "";
  const s2Val = gradeState?.s2 ?? "";
  const freeGrades = gradeState?.free ?? Array(10).fill("");

  const s1Num  = s1Val !== "" ? Number(s1Val) : null;
  const s2Num  = s2Val !== "" ? Number(s2Val) : null;
  const ccNums = freeGrades.filter((v) => v !== "").map(Number);

  const avg = computeSubjectAvg(s1Num, s2Num, ccNums);

  const hasAvg = avg !== null;
  const validated = hasAvg && avg >= 10;
  const mention = getLMDMention(avg);

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50/40 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">{subject.name}</span>
          <div className="hidden group-hover:flex items-center gap-1 ml-auto">
            <button
              onClick={() => onEdit(subject)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              title="Modifier"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(subject)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              title="Supprimer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </td>

      <td className="px-2 py-3">
        <input
          type="number" min="0" max="20" step="0.25" placeholder="—"
          value={s1Val}
          onChange={(e) => onChange(subject.id, "s1", e.target.value)}
          className="w-16 text-center border border-gray-200 rounded-lg px-1.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 transition bg-white"
        />
      </td>

      <td className="px-2 py-3">
        <input
          type="number" min="0" max="20" step="0.25" placeholder="—"
          value={s2Val}
          onChange={(e) => onChange(subject.id, "s2", e.target.value)}
          className="w-16 text-center border border-gray-200 rounded-lg px-1.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 transition bg-white"
        />
      </td>

      {freeGrades.map((val, idx) => (
        <td key={idx} className="px-1 py-3">
          <input
            type="number" min="0" max="20" step="0.25" placeholder="—"
            value={val}
            onChange={(e) => onChange(subject.id, "free", e.target.value, idx)}
            className="w-14 text-center border border-dashed border-gray-200 rounded-lg px-1 py-1.5 text-xs outline-none focus:ring-2 focus:ring-green-500 transition bg-white hover:bg-gray-50"
          />
        </td>
      ))}

      <td className="px-3 py-3 text-center">
        {hasAvg ? (
          <span className={`font-semibold text-sm ${avg >= 10 ? "text-green-600" : "text-red-500"}`}>
            {avg.toFixed(2)}
          </span>
        ) : (
          <span className="text-gray-300 text-sm">—</span>
        )}
      </td>

      <td className="px-2 py-3 text-center">
        {mention ? (
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${mentionColors[mention.color]}`}>
            {mention.label}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      <td className="px-3 py-3 text-center">
        {hasAvg ? (
          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${
            validated
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-500 border-red-200"
          }`}>
            {validated ? "Validé" : "Non validé"}
          </span>
        ) : (
          <span className="text-xs text-gray-300">Sans note</span>
        )}
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ModuleCard({
  module,
  gradeInputs,
  onInputChange,
  onSave,
  saving,
  onDeleteModule,
  onEditModule,
  onDeleteSubject,
  onEditSubject,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{module.name}</p>
            <p className="text-xs text-gray-400">{module.credits} crédit{module.credits > 1 ? "s" : ""} ECTS</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditModule(module)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 border border-gray-200 transition"
            title="Modifier le module"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteModule(module)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition"
            title="Supprimer le module"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => onSave(module)}
            disabled={saving}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
          >
            {saving ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            {saving ? "Sauvegarde…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {module.subjects?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/40">
                <th className="px-4 py-2.5 text-left text-xs text-gray-400 min-w-[120px]">Matière / UE</th>
                <th className="px-2 py-2.5 text-center text-xs text-gray-400">S1</th>
                <th className="px-2 py-2.5 text-center text-xs text-gray-400">S2</th>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i} className="px-1 py-2.5 text-center text-xs text-gray-400 min-w-[56px]">
                    N{i + 1}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center text-xs text-gray-400">Moy.</th>
                <th className="px-2 py-2.5 text-center text-xs text-gray-400">LMD</th>
                <th className="px-3 py-2.5 text-center text-xs text-gray-400">Statut</th>
              </tr>
            </thead>
            <tbody>
              {module.subjects.map((subject) => (
                <SubjectRow
                  key={subject.id}
                  subject={subject}
                  gradeState={gradeInputs[subject.id]}
                  onChange={onInputChange}
                  onDelete={onDeleteSubject}
                  onEdit={onEditSubject}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-6 text-sm text-gray-400 text-center">
          Aucune matière dans ce module.
        </div>
      )}
    </div>
  );
}
