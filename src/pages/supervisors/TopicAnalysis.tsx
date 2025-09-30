import { CircleCheckBig, CircleX, Clock3, List } from "lucide-react";

export type TopicStats = {
  pending: number;
  approved: number;
  rejecting: number;
  total: number;
};

type Props = {
  data: TopicStats;
  onFilterClick: (filter: "all" | "approved" | "pending" | "rejecting") => void;
};

function TopicAnalysis({ data, onFilterClick }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div
        onClick={() => onFilterClick("all")}
        className="bg-secondary flex cursor-pointer flex-col gap-2 rounded-xl p-4 transition hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span>Tất cả đề tài</span>
          <List size={18} color="gray" />
        </div>
        <span className="text-2xl font-bold">{data.total}</span>
      </div>

      <div
        onClick={() => onFilterClick("pending")}
        className="bg-secondary flex cursor-pointer flex-col gap-2 rounded-xl p-4 transition hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span>Chờ duyệt</span>
          <Clock3 size={18} color="orange" />
        </div>
        <span className="text-2xl font-bold">{data.pending}</span>
      </div>

      <div
        onClick={() => onFilterClick("approved")}
        className="bg-secondary flex cursor-pointer flex-col gap-2 rounded-xl p-4 transition hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span>Đã duyệt</span>
          <CircleCheckBig size={18} color="green" />
        </div>
        <span className="text-2xl font-bold">{data.approved}</span>
      </div>

      <div
        onClick={() => onFilterClick("rejecting")}
        className="bg-secondary flex cursor-pointer flex-col gap-2 rounded-xl p-4 transition hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span>Từ chối</span>
          <CircleX size={18} color="red" />
        </div>
        <span className="text-2xl font-bold">{data.rejecting}</span>
      </div>
    </div>
  );
}

export default TopicAnalysis;