import { useSemesters } from "@/hooks/useSemester";
import LoadingPage from "@/pages/loading-page";
import { GraduationCap } from "lucide-react";
import SemestersCard from "./semesters-card";
import { motion } from "framer-motion";

function SemestersPage() {
  const { data: semesterData, isLoading, error } = useSemesters();

  if (isLoading) return <LoadingPage />;
  if (error)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-6 py-4 text-red-700 shadow-sm">
          Lỗi: {error.message}
        </div>
      </div>
    );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(37,99,235,0.18),transparent_60%),radial-gradient(40%_30%_at_90%_10%,rgba(14,165,233,0.14),transparent_60%),radial-gradient(30%_25%_at_10%_20%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="absolute inset-0 [background-size:25px_25px] opacity-[0.06] [background:linear-gradient(0deg,transparent_24px,rgba(2,6,23,0.08)_25px),linear-gradient(90deg,transparent_24px,rgba(2,6,23,0.08)_25px)]" />
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            <span className="inline-grid place-items-center rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 p-2 text-white shadow-sm ring-1 ring-white/10">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-500 bg-clip-text text-transparent">
              Chọn học kỳ để tạo đề tài
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            Vui lòng chọn học kỳ phù hợp để bắt đầu quy trình tạo đề tài
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-[0_10px_40px_-20px_rgba(2,6,23,0.25)] backdrop-blur"
      >
        <div className="pointer-events-none absolute -top-14 -right-14 h-56 w-56 rounded-full bg-gradient-to-br from-blue-300/25 to-cyan-300/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-gradient-to-tr from-indigo-300/20 to-sky-300/20 blur-2xl" />

        <div className="mb-6 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Danh sách học kỳ
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Lựa chọn một học kỳ bên dưới để tiếp tục
            </p>
          </div>
        </div>

        {semesterData?.length === 0 ? (
          <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
            <div className="text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-slate-200" />
              <p className="text-base font-medium text-slate-700">
                Không có học kỳ nào được tìm thấy
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Vui lòng kiểm tra lại cấu hình học kỳ
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {semesterData?.map((semester) => (
              <SemestersCard
                key={semester.id}
                id={semester.id}
                name={semester.name}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default SemestersPage;
