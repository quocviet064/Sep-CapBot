import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserProfileById,
  getUserProfileByUserId,
  getMyUserProfile,
  type CreateUserProfilePayload,
  type UpdateUserProfilePayload,
  type UserProfile,
} from "@/services/userProfileService";
import { toast } from "sonner";

export const useMyProfile = () =>
  useQuery<UserProfile, Error>({
    queryKey: ["my-profile"],
    queryFn: getMyUserProfile,
    staleTime: 1000 * 60 * 5,
  });

export const useUserProfile = (profileId?: number | string) =>
  useQuery<UserProfile, Error>({
    queryKey: ["profile", String(profileId)],
    queryFn: () => getUserProfileById(Number(profileId)),
    enabled:
      profileId !== undefined &&
      profileId !== null &&
      String(profileId).length > 0,
    staleTime: 1000 * 60 * 5,
  });

export const useUserProfileByUserId = (userId?: number | string) =>
  useQuery<UserProfile, Error>({
    queryKey: ["profileByUserId", String(userId)],
    queryFn: () => getUserProfileByUserId(Number(userId)),
    enabled:
      userId !== undefined && userId !== null && String(userId).length > 0,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateUserProfile = () => {
  const qc = useQueryClient();
  return useMutation<UserProfile, Error, CreateUserProfilePayload>({
    mutationFn: createUserProfile,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({
        queryKey: ["profileByUserId", String(data.userId)],
      });
      qc.setQueryData(["profile", String(data.id)], data);
    },
  });
};

export const useUpdateUserProfile = () => {
  const qc = useQueryClient();
  return useMutation<UserProfile, Error, UpdateUserProfilePayload>({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({
        queryKey: ["profileByUserId", String(data.userId)],
      });
      qc.setQueryData(["profile", String(data.id)], data);
    },
    onError: (e) => {
      toast.error(e.message || "Cập nhật hồ sơ thất bại");
    },
  });
};

export const useDeleteUserProfile = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteUserProfile,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.removeQueries({ queryKey: ["profile", String(id)] });
    },
    onError: (e) => {
      toast.error(e.message || "Xóa hồ sơ thất bại");
    },
  });
};
