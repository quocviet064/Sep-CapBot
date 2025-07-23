import { CircleCheckBig, CircleX, Clock3, ClockFading } from "lucide-react";

const data = {
  pending: 1,
  approved: 2,
  counter: 10,
  reject: 5,
};

function TopicAnalysis() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-secondary flex flex-col gap-2 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span>Chờ duyệt</span>
          <Clock3 size={18} color="orange" />
        </div>
        <span className="text-2xl font-bold">{data.pending}</span>
      </div>

      <div className="bg-secondary flex flex-col gap-2 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span>Đã duyệt</span>
          <CircleCheckBig size={18} color="green" />
        </div>
        <span className="text-2xl font-bold">{data.pending}</span>
      </div>

      <div className="bg-secondary flex flex-col gap-2 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span>Đang phản biện</span>
          <ClockFading size={18} color="blue" />
        </div>
        <span className="text-2xl font-bold">{data.pending}</span>
      </div>

      <div className="bg-secondary flex flex-col gap-2 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span>Từ chối</span>
          <CircleX size={18} color="red" />
        </div>
        <span className="text-2xl font-bold">{data.pending}</span>
      </div>
    </div>
  );
}

export default TopicAnalysis;
