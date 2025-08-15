import { usePhaseTypes } from "@/hooks/usePhaseType";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import LoadingPage from "@/pages/loading-page";

function PhaseTypesPage() {
  const [searchParams] = useSearchParams();
  const semesterId = searchParams.get("semesterId");
  const semesterName = searchParams.get("semesterName");
  const { data, isLoading, error } = usePhaseTypes(1, 10);
  const navigate = useNavigate();

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  const list = data?.listObjects || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <GraduationCap className="text-primary h-6 w-6" />
            Chọn loại giai đoạn -
            <span className="ml-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-0.5 text-white shadow-sm">
              {semesterName}
            </span>
          </h2>
          <p className="text-sm text-gray-500">
            Các loại giai đoạn đang hoạt động trong hệ thống
          </p>
        </div>
        <Link
          to="/supervisors/submission-topic/semesters/semesters-page"
          className="text-blue-500 hover:underline"
        >
          ← Quay lại danh sách học kỳ
        </Link>
      </div>

      <div className="min-h-[600px] rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-bold text-gray-700">
          Danh sách loại giai đoạn
        </h3>

        {list.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Không có loại giai đoạn nào trong học kỳ này
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((type) => (
              <div
                key={type.id}
                onClick={() =>
                  navigate(
                    `/semesters/${semesterId}/phases?phaseTypeName=${encodeURIComponent(
                      type.name,
                    )}&semesterName=${encodeURIComponent(semesterName || "")}`,
                  )
                }
                className="cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 p-3">
                  <GraduationCap className="h-5 w-5 text-white" />
                  <p className="text-sm font-semibold text-white">
                    {type.name}
                  </p>
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-xs text-gray-500">Mô tả</p>
                  <p className="text-sm text-gray-600">
                    {type.description || "Không có mô tả"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PhaseTypesPage;
