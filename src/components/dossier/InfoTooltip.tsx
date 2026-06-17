"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

/**
 * A small info-icon tooltip. Takes a plain string so server components can use
 * it (props across the server→client boundary must be serializable).
 */
export function InfoTooltip({
  text,
  label = "More information",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        className={`inline-flex items-center text-muted-foreground hover:text-foreground ${className ?? ""}`}
      >
        <Info className="size-3.5" aria-hidden />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{text}</TooltipContent>
    </Tooltip>
  );
}
