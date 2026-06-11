import * as React from "react"

import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content?: string
  className?: string
  side?: "top" | "right" | "bottom" | "left"
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, className, side = "top" }) => {
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  }

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover",
    right: "right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-popover",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-popover",
    left: "left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-popover",
  }

  return (
    <div className={cn("relative group", className)}>
      {children}
      {content && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-sm text-popover-foreground bg-popover rounded-lg shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap border border-border",
            positionClasses[side]
          )}
        >
          {content}
          <div className={cn("absolute", arrowClasses[side])} />
        </div>
      )}
    </div>
  )
}

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
  side?: "top" | "right" | "bottom" | "left"
}

const TooltipContent: React.FC<TooltipContentProps> = ({ children, className, side = "top" }) => {
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  }

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover",
    right: "right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-popover",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-popover",
    left: "left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-popover",
  }

  return (
    <div
      className={cn(
        "absolute z-50 px-3 py-1.5 text-sm text-popover-foreground bg-popover rounded-lg shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap border border-border",
        positionClasses[side],
        className
      )}
    >
      {children}
      <div className={cn("absolute", arrowClasses[side])} />
    </div>
  )
}

const TooltipTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ children }) => {
  return <>{children}</>
}

const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

Tooltip.displayName = "Tooltip"
TooltipContent.displayName = "TooltipContent"
TooltipTrigger.displayName = "TooltipTrigger"
TooltipProvider.displayName = "TooltipProvider"

export { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider }