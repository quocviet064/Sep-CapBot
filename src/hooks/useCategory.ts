import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  fetchAllCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategoryById,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/services/categoryService";
import { CategoryDetailType, CategoryType } from "@/schemas/categorySchema";
import { toast } from "sonner";

export const useCategories = () => {
  return useQuery<CategoryType[], Error>({
    queryKey: ["categories"],
    queryFn: fetchAllCategories,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategoryById = (
  categoryId: string,
  options?: UseQueryOptions<CategoryDetailType, Error>,
) => {
  return useQuery<CategoryDetailType, Error>({
    queryKey: ["categoryDetail", categoryId],
    queryFn: () => fetchCategoryById(categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateCategoryPayload>({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("✅ Tạo danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateCategoryPayload>({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success("✅ Cập nhật danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryDetail"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteCategoryById,
    onSuccess: () => {
      toast.success("🗑️ Xóa danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
