import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, ChevronRight, CalendarDays } from "lucide-react";

interface SemesterCardProps {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

function SemestersCard({
  id,
  name,
  startDate,
  endDate,
  description,
}: SemesterCardProps) {
  const navigate = useNavigate();
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  let statusLabel = "";
  let isDisabled = false;

  if (now < start) {
    statusLabel = "Chưa bắt đầu";
  } else if (now >= start && now <= end) {
    statusLabel = "Đang mở";
  } else {
    statusLabel = "Đã quá hạn";
    isDisabled = true;
  }

  const handleClick = () => {
    if (!isDisabled) {
      navigate(
        `/supervisors/submission-topic/semesters/phase-types?semesterId=${id}&semesterName=${encodeURIComponent(
          name,
        )}`,
      );
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <motion.button
      onClick={handleClick}
      disabled={isDisabled}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={!isDisabled ? { y: -3 } : {}}
      whileTap={!isDisabled ? { scale: 0.995 } : {}}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      aria-label={`Chọn học kỳ ${name}`}
      className={`group relative w-full rounded-2xl ring-0 outline-none ${
        isDisabled ? "cursor-not-allowed opacity-60" : ""
      }`}
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

          <div className="flex items-center justify-between gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base leading-tight font-extrabold">
                  {name}
                </h3>
              </div>
            </div>
            <div className="shrink-0 rounded-md border border-white/25 bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
              {statusLabel}
            </div>
          </div>

          <div className="space-y-3 p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg border border-orange-100/70 bg-orange-50/40 px-3 py-2 text-sm">
                <CalendarDays className="h-4 w-4 text-orange-600" />
                <div className="min-w-0">
                  <div className="text-[11px] font-medium tracking-wider text-slate-500 uppercase">
                    Bắt đầu
                  </div>
                  <div className="truncate font-semibold text-slate-900">
                    {formatDate(start)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-amber-100/70 bg-amber-50/40 px-3 py-2 text-sm">
                <CalendarDays className="h-4 w-4 text-amber-600" />
                <div className="min-w-0">
                  <div className="text-[11px] font-medium tracking-wider text-slate-500 uppercase">
                    Kết thúc
                  </div>
                  <div className="truncate font-semibold text-slate-900">
                    {formatDate(end)}
                  </div>
                </div>
              </div>
            </div>

            {description && (
              <div className="mt-2 grid grid-cols-[auto,1fr] items-start gap-2">
                <span className="inline-flex w-fit items-center justify-self-start rounded-md bg-gradient-to-r from-orange-600 to-amber-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                  Xu hướng
                </span>
                <div className="min-w-0 rounded-xl border border-orange-200 bg-orange-50/90 p-3 text-left shadow-sm ring-1 ring-orange-100">
                  <p className="text-sm leading-relaxed font-semibold break-words whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-orange-100 bg-white p-3">
            <div className="text-[11px] text-slate-600">
              {isDisabled ? "Không thể tạo đề tài" : "Sẵn sàng tạo đề tài"}
            </div>
            {!isDisabled && (
              <div className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition-all group-hover:from-orange-700 group-hover:to-amber-600">
                Tiếp tục
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default SemestersCard;
