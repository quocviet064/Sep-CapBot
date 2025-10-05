// src/hooks/useUserRoles.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserRoles,
  addRolesToUser,
  deleteRolesFromUser,
  type UserRole,
} from "@/services/userRoleService";

export const useUserRoles = (userId?: number) =>
  useQuery<UserRole[], Error>({
    queryKey: ["user-roles", userId],
    queryFn: () => fetchUserRoles(userId as number),
    enabled: typeof userId === "number" && Number.isFinite(userId),
    staleTime: 5 * 60 * 1000,
  });

export const useAddUserRoles = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { userId: number; roles: string[] }>({
    mutationFn: ({ userId, roles }) => addRolesToUser(userId, roles),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["user-roles", vars.userId] });
    },
  });
};

export const useDeleteUserRoles = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { userId: number; roles: string[] }>({
    mutationFn: ({ userId, roles }) => deleteRolesFromUser(userId, roles),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["user-roles", vars.userId] });
    },
  });
};
