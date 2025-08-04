import { useCategories } from "@/hooks/useCategory";
import LoadingPage from "@/pages/loading-page";
import { createColumns } from "./columns";
import { useState } from "react";
import { DataTable } from "@/components/globals/atoms/data-table";
import CategoryDetailDialog from "./category-detail-dialog";

const DEFAULT_VISIBILITY = {
  id: false,
};

function CategoryPage() {
  const { data: categories, isLoading, error } = useCategories();

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);

  if (isLoading) return <LoadingPage />;
  if (error) return <p>Error: {error.message}</p>;

  const handleViewDetail = (bookingId: string) => {
    setSelectedCategory(bookingId);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedCategory(null);
  };

  const columns = createColumns({ onViewDetail: handleViewDetail });

  return (
    <div className="space-y-2">
      <div className="min-h-[600px] rounded-2xl border px-4 py-4">
        <h2 className="text-xl font-bold">Danh mục đề tài</h2>
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
      />
    </div>
  );
}

export default CategoryPage;
