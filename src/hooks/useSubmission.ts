// src/hooks/useSubmission.ts
import { useQuery } from "@tanstack/react-query";
import {
  fetchSubmissions,
  fetchAllSubmissions,
  type RawSubmissionResponse,
  type SubmissionType,
} from "@/services/submissionService";

/** Query theo trang (server paging) */
export const useSubmissions = (args: {
  TopicVersionId?: number;
  PhaseId?: number;
  SemesterId?: number;
  Status?: string;
  PageNumber?: number;
  PageSize?: number;
  Keyword?: string;
  TotalRecord?: number;
}) =>
  useQuery<RawSubmissionResponse, Error>({
    queryKey: [
      "submissions",
      args.TopicVersionId,
      args.PhaseId,
      args.SemesterId,
      args.Status,
      args.PageNumber,
      args.PageSize,
      args.Keyword,
      args.TotalRecord,
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
  });

/** Helper tương tự fetchAllMyTopics (gom nhiều trang) */
export const useAllSubmissions = (args: {
  TopicVersionId?: number;
  PhaseId?: number;
  SemesterId?: number;
  Status?: string;
  Keyword?: string;
}) =>
  useQuery<SubmissionType[], Error>({
    queryKey: [
      "submissions-all",
      args.TopicVersionId,
      args.PhaseId,
      args.SemesterId,
      args.Status,
      args.Keyword,
    ],
    queryFn: () => fetchAllSubmissions(args),
    staleTime: 1000 * 60 * 5,
  });
