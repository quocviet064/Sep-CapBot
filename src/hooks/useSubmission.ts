import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchSubmissions,
  fetchAllSubmissions,
  type RawSubmissionResponse,
  type SubmissionType,
  type SubmissionDTO,
  getSubmissionDetail,
  createSubmission,
  submitSubmission,
  createThenSubmitSubmission,
  type CreateSubmissionRequest,
  resubmitSubmission,
  type ResubmitSubmissionRequest,
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
    placeholderData: keepPreviousData,
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

export const useCreateSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubmissionRequest) => createSubmission(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["submissions-all"] });
    },
  });
};

export const useSubmitSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => submitSubmission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["submissions-all"] });
    },
  });
};

export const useResubmitSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResubmitSubmissionRequest) =>
      resubmitSubmission(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["submissions-all"] });
    },
  });
};

export const useCreateThenSubmitSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubmissionRequest) =>
      createThenSubmitSubmission(payload),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      qc.invalidateQueries({ queryKey: ["submissions-all"] });
      qc.invalidateQueries({
        queryKey: ["submission-detail", created?.id ?? null],
      });
    },
  });
};
