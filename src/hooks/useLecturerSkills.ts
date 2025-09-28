import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLecturerSkill,
  updateLecturerSkill,
  fetchLecturerSkills,
  fetchMyLecturerSkills,
  getLecturerSkill,
  deleteLecturerSkill,
  type LecturerSkill,
  type CreateLecturerSkillPayload,
  type UpdateLecturerSkillPayload,
  type LecturerSkillListResponse,
} from "@/services/lecturerSkillService";
import { useAuth } from "@/contexts/AuthContext";

// Lấy userId từ token giống MyProfile (nameid | sub | id)
function useCurrentUserId() {
  const { user } = useAuth();
  return useMemo<number | undefined>(() => {
    const u = user as any;
    const raw = u?.nameid ?? u?.sub ?? u?.id ?? u?.userid ?? undefined;
    const n = typeof raw === "string" ? Number(raw) : raw;
    return Number.isFinite(n) ? (n as number) : undefined;
  }, [user]);
}

// Tạo (tự điền lecturerId từ token nếu không truyền)
export const useCreateLecturerSkill = () => {
  const qc = useQueryClient();
  const currentUserId = useCurrentUserId();

  return useMutation<LecturerSkill, Error, CreateLecturerSkillPayload>({
    mutationFn: (payload) => {
      const finalPayload: CreateLecturerSkillPayload = {
        lecturerId: payload.lecturerId ?? currentUserId,
        skillTag: payload.skillTag,
        proficiencyLevel: payload.proficiencyLevel,
      };
      if (!finalPayload.lecturerId) {
        throw new Error("Không xác định được lecturerId từ token.");
      }
      return createLecturerSkill(finalPayload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lecturer-skills"] });
      qc.invalidateQueries({ queryKey: ["my-lecturer-skills"] });
    },
  });
};

export const useUpdateLecturerSkill = () => {
  const qc = useQueryClient();
  return useMutation<LecturerSkill, Error, UpdateLecturerSkillPayload>({
    mutationFn: updateLecturerSkill,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["lecturer-skills"] });
      qc.invalidateQueries({ queryKey: ["my-lecturer-skills"] });
      qc.invalidateQueries({ queryKey: ["lecturer-skill", data.id] });
    },
  });
};

export const useDeleteLecturerSkill = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteLecturerSkill,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lecturer-skills"] });
      qc.invalidateQueries({ queryKey: ["my-lecturer-skills"] });
    },
  });
};

// Danh sách theo lecturerId cụ thể
export const useLecturerSkills = (
  lecturerId: number | undefined,
  pageNumber: number,
  pageSize: number,
  keyword?: string,
) => {
  return useQuery<LecturerSkillListResponse, Error>({
    queryKey: ["lecturer-skills", lecturerId, pageNumber, pageSize, keyword],
    queryFn: () =>
      fetchLecturerSkills(lecturerId as number, pageNumber, pageSize, keyword),
    enabled: !!lecturerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Danh sách của chính mình (/me)
export const useMyLecturerSkills = (
  pageNumber: number,
  pageSize: number,
  keyword?: string,
) => {
  return useQuery<LecturerSkillListResponse, Error>({
    queryKey: ["my-lecturer-skills", pageNumber, pageSize, keyword],
    queryFn: () => fetchMyLecturerSkills(pageNumber, pageSize, keyword),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLecturerSkillDetail = (id?: number) => {
  return useQuery<LecturerSkill, Error>({
    queryKey: ["lecturer-skill", id],
    queryFn: () => getLecturerSkill(id as number),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
