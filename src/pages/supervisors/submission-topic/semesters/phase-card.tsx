import { motion } from "framer-motion";
import {
  CalendarDays,
  CalendarCheck2,
  CalendarClock,
  ChevronRight,
  AlertCircle,
  Hourglass,
} from "lucide-react";

interface PhaseCardProps {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  deadline?: string | null;
  onClick?: () => void;
}

function parseDateStr(s?: string | null) {
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function PhaseCard({
  id,
  name,
  startDate,
  endDate,
  deadline,
  onClick,
}: PhaseCardProps) {
  const now = new Date();
  const start = parseDateStr(startDate);
  const due = parseDateStr(deadline);
  const notStarted = !!start && start > now;
  const expired = !!due && due < now;
  const inactive = notStarted || expired;

  return (
    <motion.button
      onClick={inactive ? undefined : onClick}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={{ y: inactive ? 0 : -3 }}
      whileTap={{ scale: inactive ? 1 : 0.995 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      aria-label={`Chọn giai đoạn ${name}`}
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
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md border bg-white/90 px-2 py-0.5 text-[11px] font-semibold shadow-sm">
            {expired ? (
              <>
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span className="text-rose-600">Đã quá hạn</span>
              </>
            ) : notStarted ? (
              <>
                <Hourglass className="h-4 w-4 text-slate-600" />
                <span className="text-slate-600">Chưa bắt đầu</span>
              </>
            ) : (
              <span className="text-emerald-600">Đang mở</span>
            )}
          </div>

          <div
            className={`absolute inset-x-0 top-0 h-1.5 ${
              expired
                ? "bg-gradient-to-r from-rose-700 to-rose-400"
                : notStarted
                  ? "bg-gradient-to-r from-slate-600 to-slate-400"
                  : "bg-gradient-to-r from-indigo-600 to-sky-500"
            }`}
          />

          <div
            className={`flex items-center gap-3 border-b border-slate-200 ${
              inactive
                ? "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600"
                : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700"
            } p-3`}
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="flex-1 text-white">
              <p className="text-[11px] font-semibold text-white/75 uppercase">
                Mã giai đoạn
              </p>
              <p className="text-sm font-semibold">{id}</p>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-1.5 text-[11px] font-semibold text-slate-500 uppercase">
              Tên giai đoạn
            </div>
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-lg font-bold text-slate-900">
                {name}
              </p>
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 uppercase">
                Chọn
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="h-4 w-4 text-emerald-600" />
                <span>
                  <strong>Ngày bắt đầu:</strong> {startDate || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-sky-600" />
                <span>
                  <strong>Ngày kết thúc:</strong> {endDate || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock
                  className={`h-4 w-4 ${expired ? "text-rose-700" : "text-rose-600"}`}
                />
                <span>
                  <strong>Hạn nộp:</strong>{" "}
                  <span
                    className={`font-medium ${
                      expired ? "text-rose-700" : "text-rose-600"
                    }`}
                  >
                    {deadline || "—"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-white p-3">
            <div className="text-[11px] text-slate-600">Sẵn sàng tiếp tục</div>
            <div
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition-colors ${
                expired
                  ? "bg-gradient-to-r from-rose-700 to-rose-500"
                  : notStarted
                    ? "bg-gradient-to-r from-slate-600 to-slate-500"
                    : "bg-gradient-to-r from-indigo-600 to-sky-500"
              }`}
            >
              Tiếp tục
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {inactive && (
            <motion.div
              initial={{ opacity: 0.3 }}
              whileHover={{ opacity: 0.5 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex cursor-not-allowed items-center justify-center rounded-2xl bg-slate-200/30 backdrop-blur-[2px]"
            >
              <div className="flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow">
                {notStarted ? (
                  <>
                    <Hourglass className="h-4 w-4 text-slate-600" />
                    <span>Chưa bắt đầu</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>Đã quá hạn</span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-indigo-300/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-sky-300/25 blur-2xl" />
        </div>
      </div>
    </motion.button>
  );
}
