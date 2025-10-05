import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  RegisterUserDTO,
  GetUsersQuery,
  UsersPageDTO,
  UserDTO,
} from "@/services/authService";
import { registerUser, fetchUsers, deleteUser } from "@/services/authService";

export function useRegisterUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, RegisterUserDTO>({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Tạo tài khoản thành công");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      toast.error(err.message || "Tạo tài khoản thất bại");
    },
  });
}

export function useUsers(args: GetUsersQuery) {
  return useQuery<UsersPageDTO<UserDTO>, Error>({
    queryKey: [
      "users",
      args.PageNumber ?? 1,
      args.PageSize ?? 10,
      args.Keyword ?? null,
      args.TotalRecord ?? null,
    ] as const,
    queryFn: () => fetchUsers(args),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, number | string>({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("Đã xoá người dùng");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => {
      toast.error(e.message || "Xoá người dùng thất bại");
    },
  });
}
