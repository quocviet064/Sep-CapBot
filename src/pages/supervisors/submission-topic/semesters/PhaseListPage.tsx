import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { usePhases } from "@/hooks/usePhase";
import { CalendarDays, CalendarCheck2, CalendarClock } from "lucide-react";
import LoadingPage from "@/pages/loading-page";

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function PhaseListPage() {
  const { semesterId } = useParams();
  const [searchParams] = useSearchParams();
  const phaseTypeName = searchParams.get("phaseTypeName");
  const semesterName = searchParams.get("semesterName");
  const navigate = useNavigate();

  const { data, isLoading, error } = usePhases(Number(semesterId), 1, 10);

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  const filteredPhases =
    data?.listObjects.filter(
      (phase) => phase.phaseTypeName === phaseTypeName,
    ) || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            Chọn giai đoạn - {phaseTypeName}
            {semesterName && (
              <span className="ml-2 rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-sm font-semibold text-orange-700">
                {semesterName}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500">
            Các giai đoạn thuộc loại {phaseTypeName}{" "}
            {semesterName && (
              <>
                trong học kỳ{" "}
                <span className="font-medium text-orange-700">
                  {semesterName}
                </span>
              </>
            )}
          </p>
        </div>
        <Link
          to={`/supervisors/submission-topic/semesters/phase-types?semesterId=${semesterId}&semesterName=${semesterName || ""}`}
          className="text-blue-500 hover:underline"
        >
          ← Quay lại danh sách loại giai đoạn
        </Link>
      </div>

      <div className="min-h-[600px] rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-bold text-gray-700">
          Danh sách giai đoạn
        </h3>

        {filteredPhases.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Không có giai đoạn nào thuộc loại "{phaseTypeName}" trong học kỳ này
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPhases.map((phase) => (
              <div
                key={phase.id}
                onClick={() => navigate("/create-project")}
                className="cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 p-3">
                  <CalendarDays className="h-5 w-5 text-white" />
                  <p className="text-sm font-semibold text-white">
                    {phase.name}
                  </p>
                </div>

                <div className="space-y-3 p-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarCheck2 className="h-4 w-4 text-green-600" />
                    <span>
                      <strong>Ngày bắt đầu:</strong>{" "}
                      {formatDate(phase.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-blue-600" />
                    <span>
                      <strong>Ngày kết thúc:</strong>{" "}
                      {formatDate(phase.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-red-600" />
                    <span>
                      <strong>Hạn nộp:</strong>{" "}
                      <span className="font-medium text-red-500">
                        {formatDate(phase.submissionDeadline)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PhaseListPage;
