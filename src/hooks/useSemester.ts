import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllSemesters,
  getSemesterDetail,
  createSemester,
  updateSemester,
  deleteSemester,
  type SemesterDTO,
  type SemesterDetailDTO,
  type CreateSemesterDTO,
  type UpdateSemesterDTO,
} from "@/services/semesterService";

export function useSemesters() {
  return useQuery<SemesterDTO[], Error>({
    queryKey: ["semesters"],
    queryFn: async () => {
      const res = await getAllSemesters();
      if (!res.data.success)
        throw new Error(res.data.message || "Fetch failed");
      return res.data.data;
    },
  });
}

export function useSemesterById(id: string) {
  return useQuery<SemesterDetailDTO, Error>({
    queryKey: ["semesterDetail", id],
    queryFn: async () => {
      const res = await getSemesterDetail(Number(id));
      if (!res.data.success)
        throw new Error(res.data.message || "Fetch detail failed");
      return res.data.data;
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCreateSemester() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSemesterDTO) => createSemester(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
}

export function useUpdateSemester() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateSemesterDTO) => updateSemester(dto),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["semesters"] });
      if (vars?.id)
        qc.invalidateQueries({ queryKey: ["semesterDetail", String(vars.id)] });
    },
  });
}

export function useDeleteSemester() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSemester(id),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: ["semesters"] });
      qc.removeQueries({ queryKey: ["semesterDetail", String(id)] });
    },
  });
}
