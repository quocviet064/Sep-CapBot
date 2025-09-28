import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, ChevronRight } from "lucide-react";

interface SemesterCardProps {
  id: number;
  name: string;
}

function SemestersCard({ id, name }: SemesterCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() =>
        navigate(
          `/supervisors/submission-topic/semesters/phase-types?semesterId=${id}&semesterName=${encodeURIComponent(
            name,
          )}`,
        )
      }
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      aria-label={`Chọn học kỳ ${name}`}
      className="group relative w-full rounded-2xl ring-0 outline-none"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-2xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, #fb923c, #f59e0b, #f97316, #fdba74, #fb923c)",
          opacity: 0.35,
          filter: "blur(6px)",
        }}
      />
      <div className="relative rounded-2xl p-[1px] shadow-[0_22px_60px_-28px_rgba(2,6,23,0.35)]">
        <div className="relative rounded-2xl border border-orange-100 bg-white">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#ea580c_0%,#f59e0b_50%,#fb923c_100%)]" />
          <div className="flex items-center gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1 text-white">
              <p className="tracking-widest/4 text-[11px] font-semibold text-white/80 uppercase">
                Mã học kỳ
              </p>
              <p className="text-sm font-semibold">{id}</p>
            </div>
            <div className="rounded-md border border-white/25 bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
              Giảng viên
            </div>
          </div>

          <div className="p-4">
            <div className="mb-1.5 text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
              Tên học kỳ
            </div>
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-lg leading-snug font-bold text-slate-900">
                {name}
              </p>
              <span className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-semibold tracking-wide text-orange-700 uppercase">
                Chọn
              </span>
            </div>

            <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-orange-50 ring-1 ring-orange-100">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.4s_infinite_linear] bg-[linear-gradient(90deg,transparent,rgba(251,146,60,0.45),transparent)]" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-orange-100 bg-white p-3">
            <div className="text-[11px] text-slate-600">
              Sẵn sàng tạo đề tài
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition-colors group-hover:from-orange-700 group-hover:to-amber-600">
              Tiếp tục
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-orange-300/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-amber-300/25 blur-2xl" />
        </div>
      </div>
    </motion.button>
  );
}

export default SemestersCard;
