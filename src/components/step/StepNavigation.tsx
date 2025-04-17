import { cn } from "@/lib/utils"

interface Step {
    id: number
    title: string
}

interface StepNavigationProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (step: number) => void
}

export default function StepNavigation({ steps, currentStep, onStepClick }: StepNavigationProps) {
    return (
        <div className="relative">
            <div className="overflow-hidden">
                <div className="px-6 py-4">
                    <nav aria-label="Progress" className="flex justify-between">
                        {steps.map((step) => {
                            const isActive = step.id === currentStep
                            const isCompleted = step.id < currentStep

                            return (
                                <button
                                    key={step.id}
                                    type="button"
                                    onClick={() => {
                                        // Only allow clicking on completed steps or the current step
                                        if (isCompleted || isActive) {
                                            onStepClick?.(step.id)
                                        }
                                    }}
                                    className={cn(
                                        "flex flex-col items-center text-sm font-medium",
                                        isActive ? "cursor-default" : isCompleted ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                                    )}
                                    disabled={!isActive && !isCompleted}
                                >
                                    <span className="flex items-center justify-center">
                                        <span
                                            className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                                                isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : isCompleted
                                                        ? "bg-primary/20 text-primary"
                                                        : "bg-muted text-muted-foreground",
                                            )}
                                        >
                                            {step.id}
                                        </span>
                                    </span>
                                    <span
                                        className={cn(
                                            "mt-2 text-xs",
                                            isActive ? "text-primary font-bold" : isCompleted ? "text-primary/80" : "text-muted-foreground",
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                </button>
                            )
                        })}
                    </nav>

                    {/* Progress bar */}
                    <div className="mt-4 h-1 w-full bg-muted">
                        <div
                            className="h-1 bg-primary transition-all duration-300 rounded-sm"
                            style={{
                                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
