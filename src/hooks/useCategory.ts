import { CategoryDetailType, CategoryType } from "@/schemas/categorySchema";
import {
  fetchAllCategories,
  fetchCategoryById,
} from "@/services/categoryService";
import { useQuery } from "@tanstack/react-query";

export const useCategories = () => {
  return useQuery<CategoryType[], Error>({
    queryKey: ["categories"],
    queryFn: fetchAllCategories,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategoryById = (topicCategoryId: string) =>
  useQuery<CategoryDetailType, Error>({
    queryKey: ["category", topicCategoryId],
    queryFn: () => fetchCategoryById(topicCategoryId),
    enabled: !!topicCategoryId,
    staleTime: 1000 * 60 * 5,
  });
