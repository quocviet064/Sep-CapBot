import SemesterCard from "@/components/globals/molecules/semester-card";
import { useSemesters } from "@/hooks/useSemester";
import LoadingPage from "@/pages/loading-page";

function SemesterPage() {
  const { data: semesterData, isLoading, error } = useSemesters();

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="space-y-2">
      <div className="min-h-[600px] rounded-2xl border px-4 py-4 space-y-4">
      <h2 className="text-xl font-bold">Danh sách học kì</h2>

      <div className="grid grid-cols-3 gap-6">
        {semesterData?.map((semester) => (
          <div key={semester.id} className="col-span-1">
            <SemesterCard id={semester.id} name={semester.name} />
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default SemesterPage;
