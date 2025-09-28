import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { usePhases } from "@/hooks/usePhase";
import { CalendarDays, ArrowLeft } from "lucide-react";
import LoadingPage from "@/pages/loading-page";
import { motion } from "framer-motion";
import PhaseCard from "./phase-card";

type PhaseItem = {
  id: number;
  name: string;
  phaseTypeName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  submissionDeadline?: string | null;
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function parseDate(dateString?: string | null) {
  if (!dateString) return null;
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? null : d;
}

function PhaseListPage() {
  const { semesterId } = useParams();
  const [searchParams] = useSearchParams();
  const phaseTypeName = searchParams.get("phaseTypeName") || "";
  const semesterName = searchParams.get("semesterName") || "";
  const navigate = useNavigate();

  const { data, isLoading, error } = usePhases(Number(semesterId), 1, 10);

  if (isLoading) return <LoadingPage />;
  if (error)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-6 py-4 text-red-700 shadow-sm">
          Lỗi: {error.message}
        </div>
      </div>
    );

  const now = new Date();
  const filteredPhases: PhaseItem[] =
    data?.listObjects?.filter(
      (p: PhaseItem) => p.phaseTypeName === phaseTypeName,
    ) || [];

  const sortedPhases = [...filteredPhases].sort((a, b) => {
    const aStart = parseDate(a.startDate);
    const aDue = parseDate(a.submissionDeadline);
    const bStart = parseDate(b.startDate);
    const bDue = parseDate(b.submissionDeadline);

    const aNotStarted = !!aStart && aStart > now;
    const aExpired = !!aDue && aDue < now;
    const bNotStarted = !!bStart && bStart > now;
    const bExpired = !!bDue && bDue < now;

    const aRank = aExpired ? 2 : aNotStarted ? 1 : 0;
    const bRank = bExpired ? 2 : bNotStarted ? 1 : 0;

    if (aRank !== bRank) return aRank - bRank;
    return a.id - b.id;
  });

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(15,23,42,0.14),transparent_60%),radial-gradient(40%_30%_at_90%_10%,rgba(99,102,241,0.12),transparent_60%),radial-gradient(30%_25%_at_10%_20%,rgba(14,165,233,0.12),transparent_60%)]" />
        <div className="absolute inset-0 [background-size:25px_25px] opacity-[0.06] [background:linear-gradient(0deg,transparent_24px,rgba(2,6,23,0.08)_25px),linear-gradient(90deg,transparent_24px,rgba(2,6,23,0.08)_25px)]" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <span className="inline-grid place-items-center rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 p-2 text-white shadow-sm ring-1 ring-white/10">
              <CalendarDays className="h-6 w-6" />
            </span>
            <span className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-500 bg-clip-text text-transparent">
              Chọn giai đoạn
            </span>
            {phaseTypeName && (
              <span className="ml-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-2 py-0.5 text-sm font-semibold text-white shadow-sm">
                {phaseTypeName}
              </span>
            )}
            {semesterName && (
              <span className="ml-2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-500 px-2 py-0.5 text-sm font-semibold text-white shadow-sm">
                {semesterName}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500">
            Các giai đoạn thuộc loại {phaseTypeName}
          </p>
        </div>
        <Link
          to={`/supervisors/submission-topic/semesters/phase-types?semesterId=${semesterId}&semesterName=${encodeURIComponent(
            semesterName,
          )}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách loại giai đoạn
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-[0_10px_40px_-20px_rgba(2,6,23,0.25)] backdrop-blur"
      >
        <div className="pointer-events-none absolute -top-14 -right-14 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-300/25 to-sky-300/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-gradient-to-tr from-slate-300/20 to-indigo-300/20 blur-2xl" />

        <div className="mb-6 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Danh sách giai đoạn
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Lựa chọn một giai đoạn bên dưới để tiếp tục
            </p>
          </div>
        </div>

        {sortedPhases.length === 0 ? (
          <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
            <div className="text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-slate-200" />
              <p className="text-base font-medium text-slate-700">
                Không có giai đoạn phù hợp
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Vui lòng kiểm tra lại cấu hình
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {sortedPhases.map((p) => (
              <PhaseCard
                key={p.id}
                id={p.id}
                name={p.name}
                startDate={formatDate(p.startDate)}
                endDate={formatDate(p.endDate)}
                deadline={formatDate(p.submissionDeadline)}
                onClick={() =>
                  navigate(
                    `/supervisors/all-unsubmitted-topics/AllUnSubmittedTopicsPage?semesterId=${semesterId}&semesterName=${encodeURIComponent(
                      semesterName,
                    )}&phaseId=${p.id}&phaseName=${encodeURIComponent(p.name)}`,
                  )
                }
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default PhaseListPage;
