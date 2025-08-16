import SemesterCard from "@/components/globals/molecules/semester-card";
import { useSemesters } from "@/hooks/useSemester";
import LoadingPage from "@/pages/loading-page";
import { GraduationCap } from "lucide-react";

function SemesterPage() {
  const { data: semesterData, isLoading, error } = useSemesters();

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <GraduationCap className="text-primary h-6 w-6" />
            Danh sách học kỳ
          </h2>
          <p className="text-sm text-gray-500">
            Chọn học kỳ để xem danh sách đề tài tương ứng
          </p>
        </div>
      </div>

      <div className="min-h-[600px] rounded-2xl border bg-white p-6 shadow-sm">
        {semesterData?.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Không có học kỳ nào được tìm thấy
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {semesterData?.map((semester) => (
              <SemesterCard
                key={semester.id}
                id={semester.id}
                name={semester.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SemesterPage;
