import { useState } from "react";

const IconEdit = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconDelete = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconChevron = ({ open }) => (
  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminSidebar({
  user,
  initials,
  years,
  selectedYear,
  selectedSemester,
  onSelectYear,
  onSelectSemester,
  onAddAcademicYear,
  onAddSemester,
  onEditYear,
  onDeleteYear,
  onEditSemester,
  onDeleteSemester,
  onLogout,
}) {
  const [openYear, setOpenYear]         = useState(false);
  const [openSemester, setOpenSemester] = useState(false);

  return (
    <aside className="w-64 min-w-[256px] bg-white border-r border-gray-200 flex flex-col overflow-y-auto">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-200 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-sm font-semibold">L</div>
        <div>
          <span className="text-gray-900 font-semibold text-[15px]">LMD</span>
          <span className="text-gray-400 text-[13px] ml-1">Académie</span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-200">
          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            {user ? (
              <>
                <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
              </>
            ) : (
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <p className="px-5 py-3 text-xs text-gray-400">Navigation</p>

      {/* Années scolaires */}
      <div className="px-3 mb-1">
        <button
          onClick={() => { setOpenYear(!openYear); setOpenSemester(false); }}
          className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            openYear ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Années scolaires
          </span>
          <IconChevron open={openYear} />
        </button>

        {openYear && (
          <div className="mt-1 p-1.5 bg-gray-50 rounded-xl border border-gray-200 space-y-0.5">
            {years.length > 0 ? years.map((year) => (
              <div
                key={year.id}
                className={`flex items-center gap-1 rounded-lg transition ${
                  selectedYear?.id === year.id ? "bg-green-50" : "hover:bg-white"
                }`}
              >
                <button
                  onClick={() => { onSelectYear(year); setOpenYear(false); }}
                  className={`flex-1 text-left px-2.5 py-1.5 text-[13px] ${
                    selectedYear?.id === year.id ? "text-green-700 font-medium" : "text-gray-600"
                  }`}
                >
                  {year.name}
                </button>
                <button
                  onClick={() => onEditYear(year)}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                >
                  <IconEdit />
                </button>
                <button
                  onClick={() => onDeleteYear(year)}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 transition mr-1"
                >
                  <IconDelete />
                </button>
              </div>
            )) : (
              <p className="px-2.5 py-2 text-xs text-gray-400">Aucune année</p>
            )}
            <button
              onClick={() => { onAddAcademicYear(); setOpenYear(false); }}
              className="w-full mt-1 py-1.5 rounded-lg text-xs font-medium text-green-600 hover:bg-green-50 transition flex items-center justify-center gap-1"
            >
              + Nouvelle année
            </button>
          </div>
        )}
      </div>

      {/* Semestres */}
      <div className="px-3 mb-1">
        <button
          onClick={() => { setOpenSemester(!openSemester); setOpenYear(false); }}
          className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            openSemester ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h10M4 18h7" />
            </svg>
            Semestres
            {selectedYear && (
              <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 truncate max-w-[80px]">
                {selectedYear.name}
              </span>
            )}
          </span>
          <IconChevron open={openSemester} />
        </button>

        {openSemester && (
          <div className="mt-1 p-1.5 bg-gray-50 rounded-xl border border-gray-200 space-y-0.5">
            {selectedYear?.semesters?.length > 0 ? selectedYear.semesters.map((sem) => (
              <div
                key={sem.id}
                className={`flex items-center gap-1 rounded-lg transition ${
                  selectedSemester?.id === sem.id ? "bg-green-50" : "hover:bg-white"
                }`}
              >
                <button
                  onClick={() => { onSelectSemester(sem); setOpenSemester(false); }}
                  className={`flex-1 text-left px-2.5 py-1.5 text-[13px] ${
                    selectedSemester?.id === sem.id ? "text-green-700 font-medium" : "text-gray-600"
                  }`}
                >
                  {sem.name}
                </button>
                <button
                  onClick={() => onEditSemester(sem)}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                >
                  <IconEdit />
                </button>
                <button
                  onClick={() => onDeleteSemester(sem)}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 transition mr-1"
                >
                  <IconDelete />
                </button>
              </div>
            )) : (
              <p className="px-2.5 py-2 text-xs text-gray-400">Aucun semestre</p>
            )}
            {selectedYear && (
              <button
                onClick={() => { onAddSemester(); setOpenSemester(false); }}
                className="w-full mt-1 py-1.5 rounded-lg text-xs font-medium text-green-600 hover:bg-green-50 transition flex items-center justify-center gap-1"
              >
                + Nouveau semestre
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 border border-red-200 rounded-xl py-2.5 text-red-500 text-sm font-medium hover:bg-red-50 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
