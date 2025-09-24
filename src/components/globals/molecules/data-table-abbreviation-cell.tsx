import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../atoms/hover-card";

interface DataTableCellAbbreviationProps {
  abbreviation: string | string[];
}

function DataTableCellAbbreviation({
  abbreviation,
}: DataTableCellAbbreviationProps) {
  return (
    <HoverCard>
      <HoverCardTrigger className="block max-w-[320px] cursor-pointer truncate hover:underline">
        {abbreviation}
      </HoverCardTrigger>
      <HoverCardContent className="w-96">{abbreviation}</HoverCardContent>
    </HoverCard>
  );
}

export default DataTableCellAbbreviation;
