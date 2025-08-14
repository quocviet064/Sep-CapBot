// src/hooks/usePhaseType.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPhaseTypes,
  fetchAllPhaseTypes,
  fetchPhaseTypeDetail,
  updatePhaseType,
  type RawPhaseTypeResponse,
  type PhaseTypeDetail,
  type PhaseTypeUpdateDto,
  deletePhaseType,
  PhaseTypeCreateDto,
  createPhaseType,
} from "@/services/phaseTypeService";
import type { PhaseType } from "@/schemas/phaseTypeSchema";

export const usePhaseTypes = (
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
) =>
  useQuery<RawPhaseTypeResponse, Error>({
    queryKey: ["phase-types", PageNumber, PageSize, Keyword, TotalRecord],
    queryFn: () => fetchPhaseTypes(PageNumber, PageSize, Keyword, TotalRecord),
    staleTime: 1000 * 60 * 5,
  });

export const useAllPhaseTypes = (Keyword: string = "") =>
  useQuery<PhaseType[], Error>({
    queryKey: ["phase-types-all", Keyword],
    queryFn: () => fetchAllPhaseTypes(Keyword),
    staleTime: 1000 * 60 * 5,
  });

export const usePhaseTypeById = (phaseTypeId: string, enabled = true) =>
  useQuery<PhaseTypeDetail, Error>({
    queryKey: ["phase-type-detail", phaseTypeId],
    enabled: enabled && !!phaseTypeId,
    queryFn: () => fetchPhaseTypeDetail(phaseTypeId),
    staleTime: 1000 * 60 * 5,
  });

export const useUpdatePhaseType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PhaseTypeUpdateDto) => updatePhaseType(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["phase-type-detail", String(variables.id)],
      });
      qc.invalidateQueries({ queryKey: ["phase-types"] });
      qc.invalidateQueries({ queryKey: ["phase-types-all"] });
    },
  });
};
export const useDeletePhaseType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deletePhaseType(id),
    onSuccess: (_ok, id) => {
      qc.invalidateQueries({ queryKey: ["phase-types"] });
      qc.invalidateQueries({ queryKey: ["phase-types-all"] });
      qc.invalidateQueries({ queryKey: ["phase-type-detail", String(id)] });
    },
  });
};
export const useCreatePhaseType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PhaseTypeCreateDto) => createPhaseType(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["phase-types"] });
      qc.invalidateQueries({ queryKey: ["phase-types-all"] });
    },
  });
};
