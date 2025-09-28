import { motion } from "framer-motion";
import { GraduationCap, ChevronRight } from "lucide-react";

interface PhaseTypeCardProps {
  id: number;
  name: string;
  description?: string | null;
  onClick?: () => void;
}

function PhaseTypeCard({ id, name, description, onClick }: PhaseTypeCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      aria-label={`Chọn loại giai đoạn ${name}`}
      className="group relative w-full rounded-2xl ring-0 outline-none"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-2xl"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, #0ea5e9, #6366f1, #0ea5e9, #38bdf8, #0ea5e9)",
          opacity: 0.35,
          filter: "blur(6px)",
        }}
      />
      <div className="relative rounded-2xl p-[1px] shadow-[0_22px_60px_-28px_rgba(2,6,23,0.35)]">
        <div className="relative rounded-2xl border border-slate-200 bg-white">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#0ea5e9_0%,#6366f1_50%,#38bdf8_100%)]" />
          <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1 text-white">
              <p className="tracking-widest/4 text-[11px] font-semibold text-white/75 uppercase">
                Mã loại
              </p>
              <p className="text-sm font-semibold">{id}</p>
            </div>
            <div className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white">
              Đang mở
            </div>
          </div>

          <div className="p-4">
            <div className="mb-1.5 text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
              Tên loại giai đoạn
            </div>
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-lg leading-snug font-bold text-slate-900">
                {name}
              </p>
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-700 uppercase">
                Chọn
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
                Mô tả
              </div>
              <p className="line-clamp-3 text-sm text-slate-600">
                {description || "Không có mô tả"}
              </p>
            </div>

            <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-50 ring-1 ring-slate-200">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.4s_infinite_linear] bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.35),transparent)]" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-white p-3">
            <div className="text-[11px] text-slate-600">Sẵn sàng tiếp tục</div>
            <div className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition-colors group-hover:from-indigo-700 group-hover:to-sky-600">
              Tiếp tục
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-indigo-300/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-sky-300/25 blur-2xl" />
        </div>
      </div>
    </motion.button>
  );
}

export default PhaseTypeCard;
