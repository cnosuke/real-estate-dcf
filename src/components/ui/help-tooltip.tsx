import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HelpTooltipProps {
  title?: string
  content: string
  maxWidth?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function HelpTooltip({ 
  title, 
  content, 
  maxWidth = "600px",
  placement = "top",
  className 
}: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle
            className={`h-4 w-4 text-muted-foreground hover:text-foreground cursor-help transition-colors ${className || 'ml-1'}`}
          />
        </TooltipTrigger>
        <TooltipContent 
          side={placement}
          className="bg-white border border-border shadow-lg opacity-100 z-50 p-4"
          style={{ maxWidth }}
        >
          {title && (
            <div className="font-semibold mb-2 text-foreground border-b border-border pb-2">
              {title}
            </div>
          )}
          <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
            {content}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
