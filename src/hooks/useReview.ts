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
  type IdLike,
} from "@/services/reviewService";

export const useReviews = (paging: PagingModel) =>
  useQuery<ReviewListResponse, Error>({
    queryKey: ["reviews", paging.pageNumber ?? 1, paging.pageSize ?? 10, paging.keyword ?? null],
    queryFn: () => getReviews(paging),
    staleTime: 5 * 60 * 1000,
  });

export const useReviewDetail = (id?: IdLike) =>
  useQuery<ReviewDTO, Error>({
    queryKey: ["review-detail", id ?? null],
    queryFn: () => getReviewById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

export const useReviewsByAssignment = (assignmentId?: IdLike) =>
  useQuery<ReviewDTO[], Error>({
    queryKey: ["reviews-by-assignment", assignmentId ?? null],
    queryFn: () => getReviewsByAssignment(assignmentId!),
    enabled: !!assignmentId,
    staleTime: 60 * 1000,
  });

export const useScoreBoard = (reviewId?: IdLike) =>
  useQuery({
    queryKey: ["review-scoreboard", reviewId ?? null],
    queryFn: () => getScoreBoard(reviewId!),
    enabled: !!reviewId,
    staleTime: 60 * 1000,
  });

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewDTO) => createReview(payload),
    onSuccess: (rv) => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-by-assignment", rv.assignmentId] });
    },
  });
};

export const useUpdateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateReviewDTO) => updateReview(payload),
    onSuccess: (rv) => {
      qc.invalidateQueries({ queryKey: ["review-detail", rv.id] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-by-assignment", rv.assignmentId] });
    },
  });
};

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: IdLike) => deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: IdLike) => submitReview(id),
    onSuccess: (rv) => {
      qc.invalidateQueries({ queryKey: ["review-detail", rv.id] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews-by-assignment", rv.assignmentId] });
    },
  });
};

export const useWithdrawReview = () =>
  useMutation({
    mutationFn: (id: IdLike) => withdrawReview(id),
  });
