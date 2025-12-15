import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
export default function HelpTooltip({ content }: { content: any }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="
        inline-flex items-center justify-center
        h-4 w-4
        rounded-full
        border border-border
        text-[10px] font-medium
        text-muted-foreground
        cursor-help
        hover:bg-accent hover:text-accent-foreground
        transition-colors
      "
        >
          ?
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
