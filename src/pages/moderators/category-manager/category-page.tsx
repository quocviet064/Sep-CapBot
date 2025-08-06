import { useCategories } from "@/hooks/useCategory";
import LoadingPage from "@/pages/loading-page";
import { createColumns } from "./columns";
import { useState } from "react";
import { DataTable } from "@/components/globals/atoms/data-table";
import CategoryDetailDialog from "./category-detail-dialog";
import { Button } from "@/components/globals/atoms/button";
import CategoryCreateDialog from "./CategoryCreateDialog";

const DEFAULT_VISIBILITY = {
  id: false,
};

function ModeratorCategoryPage() {
  const { data: categories, isLoading, error, refetch } = useCategories();

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);

  if (isLoading) return <LoadingPage />;
  if (error) return <p>Error: {error.message}</p>;

  const handleViewDetail = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedCategory(null);
  };

  const columns = createColumns({ onViewDetail: handleViewDetail });

  return (
    <div className="space-y-2">
      <div className="min-h-[600px] space-y-4 rounded-2xl border px-4 py-4">
        {/* Tiêu đề */}
        <h2 className="text-xl font-bold">Danh mục đề tài</h2>

        {/* Nút tạo danh mục - căn trái */}
        <div>
          <Button variant="default" onClick={() => setIsCreateDialogOpen(true)}>
            + Tạo danh mục
          </Button>
        </div>

        {/* Bảng dữ liệu + tìm kiếm */}
        <DataTable
          data={categories ?? []}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={searchTerm}
          setSearch={setSearchTerm}
          placeholder="Tìm kiếm tên danh mục..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={1}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>

      <CategoryDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
        categoryId={selectedCategory}
        onUpdate={refetch}
      />

      <CategoryCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}

export default ModeratorCategoryPage;
