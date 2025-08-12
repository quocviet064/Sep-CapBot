// src/pages/moderators/semester-phase/index.tsx
import SemesterList from "./SemesterList";
import Phases from "./phases";
import Rounds from "./rounds";

export default function SemesterPhasePage() {
  return (
    <div className="space-y-6">
      {/* Header trang */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Quản lý học kỳ &amp; Phase</h1>
        <p className="text-sm text-muted-foreground">
          Tạo / chỉnh sửa học kỳ, thiết lập các phase và vòng (round) tương ứng.
        </p>
      </div>

      {/* Học kỳ */}
      <section className="rounded-2xl border bg-background px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Học kỳ</h2>
          <p className="text-sm text-muted-foreground">
            Danh sách học kỳ, xem chi tiết, chỉnh sửa, xoá. (UI 3 chấm & dialog chi tiết)
          </p>
        </div>
        <SemesterList />
      </section>

      {/* Phases */}
      <section className="rounded-2xl border bg-background px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Phases</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý các phase trong học kỳ (mốc thời gian, quy định).
          </p>
        </div>
        <Phases />
      </section>

      {/* Rounds */}
      <section className="rounded-2xl border bg-background px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Rounds</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý các vòng (review/defense) thuộc phase.
          </p>
        </div>
        <Rounds />
      </section>
    </div>
  );
}
