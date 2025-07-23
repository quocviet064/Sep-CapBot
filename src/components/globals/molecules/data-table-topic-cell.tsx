interface DataTableCellTopicProps {
  title: string;
  supervisor: string;
}

function DataTableCellTopic({ title, supervisor }: DataTableCellTopicProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="capitalize">{title}</span>
        <span className="text-muted-foreground text-sm">
          GVHD: {supervisor}
        </span>
      </div>
    </div>
  );
}

export default DataTableCellTopic;
