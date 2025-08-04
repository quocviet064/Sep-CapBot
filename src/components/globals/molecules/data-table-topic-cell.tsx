interface DataTableCellTopicProps {
  title: string;
  supervisor: string;
}

function DataTableCellTopic({ title }: DataTableCellTopicProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="capitalize">{title}</span>
      </div>
    </div>
  );
}

export default DataTableCellTopic;
