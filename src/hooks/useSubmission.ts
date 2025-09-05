import { useQuery } from "@tanstack/react-query";
import {
  fetchSubmissions,
  fetchAllSubmissions,
  type RawSubmissionResponse,
  type SubmissionType,
  type SubmissionDTO,
  getSubmissionDetail,
} from "@/services/submissionService";

type UseSubsArgs = {
  TopicVersionId?: number;
  PhaseId?: number;
  SemesterId?: number;
  Status?: string;
  PageNumber?: number;
  PageSize?: number;
  Keyword?: string;
  TotalRecord?: number;
};

export const useSubmissions = (args: UseSubsArgs) =>
  useQuery<RawSubmissionResponse, Error>({
    queryKey: [
      "submissions",
      args.TopicVersionId ?? null,
      args.PhaseId ?? null,
      args.SemesterId ?? null,
      args.Status ?? null,
      args.PageNumber ?? 1,
      args.PageSize ?? 10,
      args.Keyword ?? null,
    ],
    queryFn: () =>
      fetchSubmissions(
        args.TopicVersionId,
        args.PhaseId,
        args.SemesterId,
        args.Status,
        args.PageNumber,
        args.PageSize,
        args.Keyword,
        args.TotalRecord,
      ),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

export const useAllSubmissions = (args: {
  TopicVersionId?: number;
  PhaseId?: number;
  SemesterId?: number;
  Status?: string;
  Keyword?: string;
  PageSize?: number;
  MaxPages?: number;
}) =>
  useQuery<SubmissionType[], Error>({
    queryKey: [
      "submissions-all",
      args.TopicVersionId ?? null,
      args.PhaseId ?? null,
      args.SemesterId ?? null,
      args.Status ?? null,
      args.Keyword ?? null,
      args.PageSize ?? null,
      args.MaxPages ?? null,
    ],
    queryFn: () => fetchAllSubmissions(args),
    staleTime: 1000 * 60 * 5,
  });

export const useSubmissionDetail = (id?: string | number) =>
  useQuery<SubmissionDTO, Error>({
    queryKey: ["submission-detail", id ?? null],
    queryFn: () => getSubmissionDetail(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
