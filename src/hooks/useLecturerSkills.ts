import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLecturerSkill,
  updateLecturerSkill,
  fetchLecturerSkills,
  fetchMyLecturerSkills,
  getLecturerSkill,
  deleteLecturerSkill,
  bulkUpdateLecturerSkills,
  type LecturerSkill,
  type CreateLecturerSkillPayload,
  type UpdateLecturerSkillPayload,
  type LecturerSkillListResponse,
  type BulkUpdateResult,
} from "@/services/lecturerSkillService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function pickNumericIdFromUser(u: unknown): number | undefined {
  if (!u || typeof u !== "object") return undefined;
  const obj = u as Record<string, unknown>;
  const keys = ["nameid", "sub", "id", "userid"] as const;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function useCurrentUserId() {
  const { user } = useAuth();
  return useMemo<number | undefined>(() => pickNumericIdFromUser(user), [user]);
}

export const useCreateLecturerSkill = () => {
  const qc = useQueryClient();
  const currentUserId = useCurrentUserId();

  return useMutation<LecturerSkill, Error, CreateLecturerSkillPayload>({
    mutationFn: (payload) => {
      const lecturerId = payload.lecturerId ?? currentUserId;
      if (!lecturerId)
        throw new Error("Không xác định được lecturerId từ token.");
      const finalPayload: CreateLecturerSkillPayload = {
        lecturerId,
        skillTag: payload.skillTag,
        proficiencyLevel: payload.proficiencyLevel,
      };
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

export const useBulkUpdateLecturerSkills = () => {
  const qc = useQueryClient();
  return useMutation<BulkUpdateResult, Error, UpdateLecturerSkillPayload[]>({
    mutationFn: (items) => bulkUpdateLecturerSkills(items),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["my-lecturer-skills"] });
      qc.invalidateQueries({ queryKey: ["lecturer-skills"] });
      if (res.ok.length) toast.success(`Đã cập nhật ${res.ok.length} kỹ năng`);
      if (res.failed.length) {
        const dup = res.failed.filter((f) => f.status === 409);
        const notFound = res.failed.filter((f) => f.status === 404);
        const others = res.failed.filter(
          (f) => f.status !== 409 && f.status !== 404,
        );
        if (dup.length) {
          toast.warning(
            `Bị trùng (${dup.length}) kỹ năng: ${dup.map((f) => f.item.skillTag).join(", ")}`,
          );
        }
        if (notFound.length) {
          toast.warning(
            `Không tìm thấy (${notFound.length}) kỹ năng: ${notFound
              .map((f) => f.item.skillTag)
              .join(", ")}`,
          );
        }
        if (others.length) {
          toast.error(
            `Lỗi cập nhật (${others.length}) kỹ năng: ${others
              .map((f) => f.item.skillTag)
              .join(", ")}`,
          );
        }
      }
    },
  });
};
