import { SemesterType } from "@/schemas/semesterSchema";
import { fetchAllSemesters } from "@/services/semesterService";
import { useQuery } from "@tanstack/react-query";

export const useSemesters = () => {
  return useQuery<SemesterType[], Error>({
    queryKey: ["semesters"],
    queryFn: fetchAllSemesters,
    staleTime: 1000 * 60 * 5,
  });
};
