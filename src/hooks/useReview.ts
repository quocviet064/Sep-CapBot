import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ReviewDTO,
  type CreateReviewDTO,
  type UpdateReviewDTO,
  type ReviewListResponse,
  type PagingModel,
  createReview,
  updateReview,
  deleteReview,
  getReviewById,
  getReviews,
  submitReview,
  getReviewsByAssignment,
  getScoreBoard,
  withdrawReview,
  getReviewStatistics,
  type IdLike,
} from "@/services/reviewService";

/** list (paging) */
export const useReviews = (paging: PagingModel) =>
  useQuery<ReviewListResponse, Error>({
    queryKey: ["reviews", paging.pageNumber ?? 1, paging.pageSize ?? 10, paging.keyword ?? null],
    queryFn: () => getReviews(paging),
    staleTime: 5 * 60 * 1000,
  });

/** single review detail */
export const useReviewDetail = (id?: IdLike) =>
  useQuery<ReviewDTO, Error>({
    queryKey: ["review-detail", id ?? null],
    queryFn: () => getReviewById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

/** reviews for an assignment */
export const useReviewsByAssignment = (assignmentId?: IdLike) =>
  useQuery<ReviewDTO[], Error>({
    queryKey: ["reviews-by-assignment", assignmentId ?? null],
    queryFn: () => getReviewsByAssignment(assignmentId!),
    enabled: !!assignmentId,
    staleTime: 60 * 1000,
  });

/** scoreboard for one review */
export const useScoreBoard = (reviewId?: IdLike) =>
  useQuery<
    {
      reviewId: IdLike;
      overallScore?: number | null;
      criteriaScores: {
        criteriaId: number;
        criteriaName: string;
        score: number;
        maxScore: number;
        weight: number;
        comment?: string | null;
      }[];
    },
    Error
  >({
    queryKey: ["review-scoreboard", reviewId ?? null],
    queryFn: () => getScoreBoard(reviewId!),
    enabled: !!reviewId,
    staleTime: 60 * 1000,
  });

/** create review */
export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation<ReviewDTO, Error, CreateReviewDTO>({
    mutationFn: (payload: CreateReviewDTO) => createReview(payload),
    onSuccess: (rv) => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-by-assignment", rv.assignmentId] });
      qc.invalidateQueries({ queryKey: ["review-statistics"] });
    },
  });
};

/** update review (draft) */
export const useUpdateReview = () => {
  const qc = useQueryClient();
  return useMutation<ReviewDTO, Error, UpdateReviewDTO>({
    mutationFn: (payload: UpdateReviewDTO) => updateReview(payload),
    onSuccess: (rv) => {
      qc.invalidateQueries({ queryKey: ["review-detail", rv.id] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-by-assignment", rv.assignmentId] });
      qc.invalidateQueries({ queryKey: ["review-statistics"] });
    },
  });
};

/** delete review */
export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, IdLike>({
    mutationFn: (id: IdLike) => deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["review-statistics"] });
    },
  });
};

/** submit review */
export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation<ReviewDTO, Error, IdLike>({
    mutationFn: (id: IdLike) => submitReview(id),
    onSuccess: (rv) => {
      qc.invalidateQueries({ queryKey: ["review-detail", rv.id] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-by-assignment", rv.assignmentId] });
      qc.invalidateQueries({ queryKey: ["review-statistics"] });
    },
  });
};

/** withdraw review */
export const useWithdrawReview = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, IdLike>({
    mutationFn: (id: IdLike) => withdrawReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-by-assignment"] });
      qc.invalidateQueries({ queryKey: ["review-statistics"] });
    },
  });
};

/** statistics (global list) */
export const useReviewStatistics = () =>
  useQuery<ReviewListResponse, Error>({
    queryKey: ["review-statistics"],
    queryFn: () => getReviewStatistics(),
    staleTime: 60 * 1000,
  });
