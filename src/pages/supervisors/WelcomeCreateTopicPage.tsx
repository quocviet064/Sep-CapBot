import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, PenSquare, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/globals/atoms/button";

const MANUAL_CREATE_PATH = "/supervisors/topics/create-new";
const AI_SUGGEST_PATH = "/supervisors/aisuggest";

function OptionCard({
  icon,
  title,
  desc,
  features,
  cta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  features: string[];
  cta: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="group relative w-full cursor-pointer rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-orange-200/60 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-amber-200/70 blur-3xl" />
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-1 text-slate-600">{desc}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <Button
              className="min-w-40 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow hover:brightness-95 focus-visible:ring-2 focus-visible:ring-orange-600"
              onClick={onClick}
            >
              {cta}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WelcomeCreateTopicPage() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(255,237,213,0.7),rgba(255,255,255,0)),radial-gradient(1000px_500px_at_110%_10%,rgba(254,215,170,0.6),rgba(255,255,255,0))]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.6),rgba(255,255,255,0.9))]" />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 border-slate-200 bg-white/70 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>

        <motion.div
          layout
          className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur"
        >
          <div className="absolute -top-14 right-6 h-28 w-28 rounded-full bg-orange-200/60 blur-3xl" />
          <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-amber-200/60 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Chào mừng bạn đến trang tạo đề tài
                </h1>
                <p className="mt-1 max-w-2xl text-slate-600">
                  Hãy chọn cách bắt đầu phù hợp: tự nhập từng trường hoặc để AI
                  gợi ý nhanh theo nhu cầu của bạn.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <OptionCard
            icon={<PenSquare className="h-6 w-6" />}
            title="Tạo đề tài thủ công"
            desc="Kiểm soát toàn bộ nội dung, nhập đầy đủ thông tin theo biểu mẫu chuẩn."
            features={[
              "Điền từng mục: tiêu đề, bối cảnh, mục tiêu, phương pháp",
              "Tải tài liệu đính kèm và xem trước",
              "Kiểm tra trùng lặp sau khi nhập",
            ]}
            cta="Bắt đầu nhập thủ công"
            onClick={() => navigate(MANUAL_CREATE_PATH)}
          />

          <OptionCard
            icon={<Sparkles className="h-6 w-6" />}
            title="Sử dụng gợi ý từ AI"
            desc="Nhập vài ý tưởng hoặc yêu cầu, AI đề xuất cấu trúc đề tài và nội dung khởi tạo."
            features={[
              "Gợi ý tiêu đề, mô tả, mục tiêu, đề cương",
              "Điều chỉnh nhanh và tinh chỉnh cùng AI",
              "Tự động kiểm tra trùng lặp và mức độ tương đồng",
            ]}
            cta="Khởi tạo bằng AI"
            onClick={() => navigate(AI_SUGGEST_PATH)}
          />
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white/70 p-5 text-sm text-slate-600 shadow-sm">
          <div className="mb-2 font-medium text-slate-900">
            Mẹo để bắt đầu nhanh
          </div>
          <ul className="grid gap-2 md:grid-cols-2">
            <li className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
              Chuẩn bị mô tả ngắn về vấn đề và bối cảnh
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
              Xác định mục tiêu chính và phạm vi đề tài
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
              Thu thập tài liệu tham khảo quan trọng
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
              Ưu tiên từ khóa để AI gợi ý chính xác hơn
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
