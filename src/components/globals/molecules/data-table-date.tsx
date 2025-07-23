import { formatDate } from "@/utils/formatter";

interface DataTableDateProps {
  date: string;
}

function DataTableDate({ date }: DataTableDateProps) {
  return <span>{formatDate(date)}</span>;
}

export default DataTableDate;
