import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { RegisterUserDTO } from "@/services/authService";
import { registerUser } from "@/services/authService";

export function useRegisterUser() {
  return useMutation<void, Error, RegisterUserDTO>({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Tạo tài khoản thành công");
    },
    onError: (err) => {
      toast.error(err.message || "Tạo tài khoản thất bại");
    },
  });
}
