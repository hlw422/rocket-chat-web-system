import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider")
  }
  return context
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue = "", value, onValueChange, orientation = "horizontal", children, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue)

    React.useEffect(() => {
      if (value !== undefined) {
        setActiveTab(value)
      }
    }, [value])

    const handleTabChange = React.useCallback((newValue: string) => {
      setActiveTab(newValue)
      onValueChange?.(newValue)
    }, [onValueChange])

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
        <div
          ref={ref}
          data-orientation={orientation}
          className={cn(
            "flex gap-2",
            orientation === "horizontal" ? "flex-col" : "flex-row",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "line"
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        data-variant={variant}
        className={cn(
          "inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground",
          variant === "default" && "bg-muted",
          variant === "line" && "gap-1 bg-transparent",
          className
        )}
        {...props}
      />
    )
  }
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { activeTab, setActiveTab } = useTabs()
    const isActive = activeTab === value

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => setActiveTab(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive && "bg-background text-foreground shadow-sm",
          !isActive && "text-muted-foreground hover:text-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { activeTab } = useTabs()
    const isActive = activeTab === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }