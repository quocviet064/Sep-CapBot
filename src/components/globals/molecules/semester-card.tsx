interface semesterCardProps {
  id: number;
  name: string;
}

function SemesterCard({ id, name }: semesterCardProps) {
  return (
    <div className="bg-muted space-y-2 rounded-xl px-3 py-4">
      <p className="text-sm font-semibold">Mã kì học: {id}</p>
      <p className="text-sm">Tên kì học: {name}</p>
    </div>
  );
}

export default SemesterCard;
