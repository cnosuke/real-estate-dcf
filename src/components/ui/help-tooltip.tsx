import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HelpTooltipProps {
  content: string
  className?: string
}

export function HelpTooltip({ content, className }: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={10}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle
            className={`h-4 w-4 text-muted-foreground cursor-help ${className || 'ml-1'}`}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-white border border-border shadow-lg opacity-100 z-50">
          <p className="max-w-sm text-sm leading-relaxed text-slate-900">
            {content}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
