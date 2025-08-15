import { GraduationCap } from "lucide-react";

interface SemesterCardProps {
  id: number;
  name: string;
}

function SemesterCard({ id, name }: SemesterCardProps) {
  return (
    <div className="cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 p-3">
        <GraduationCap className="h-5 w-5 text-white" />
        <p className="text-sm font-semibold text-white">Mã học kỳ: {id}</p>
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xs text-gray-500">Tên học kỳ</p>
        <p className="text-lg leading-tight font-bold text-gray-800">{name}</p>
      </div>
    </div>
  );
}

export default SemesterCard;
