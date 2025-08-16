// src/hooks/usePhase.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPhase,
  deletePhase,
  fetchPhaseDetail,
  fetchPhases,
  PhaseCreateDto,
  PhaseDetail,
  PhaseUpdateDto,
  updatePhase,
  type RawPhaseListResponse,
} from "@/services/phaseService";

export const usePhases = (
  SemesterId?: number,
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
) =>
  useQuery<RawPhaseListResponse, Error>({
    queryKey: [
      "phases",
      SemesterId ?? null,
      PageNumber,
      PageSize,
      Keyword,
      TotalRecord,
    ],
    queryFn: () =>
      fetchPhases(SemesterId, PageNumber, PageSize, Keyword, TotalRecord),
    staleTime: 1000 * 60 * 5,
  });

export const usePhaseById = (id: string, enabled = true) =>
  useQuery<PhaseDetail, Error>({
    queryKey: ["phase-detail", id],
    enabled: enabled && !!id,
    queryFn: () => fetchPhaseDetail(id),
    staleTime: 1000 * 60 * 5,
  });

export const useUpdatePhase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PhaseUpdateDto) => updatePhase(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["phases"] });
      qc.invalidateQueries({
        queryKey: ["phase-detail", String(variables.id)],
      });
    },
  });
};
export const useCreatePhase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PhaseCreateDto) => createPhase(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["phases"] });
    },
  });
};

export const useDeletePhase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePhase(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["phases"] });
    },
  });
};
