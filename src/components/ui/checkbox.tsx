import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    indeterminate?: boolean;
  }
>(({ className, indeterminate, ...props }, ref) => {
  const internalRef = React.useRef<React.ElementRef<typeof CheckboxPrimitive.Root>>(null)
  const combinedRef = useCombinedRefs(internalRef, ref)

  React.useEffect(() => {
    if (internalRef.current) {
      const element = internalRef.current as unknown as HTMLInputElement
      if (element) {
        element.indeterminate = !!indeterminate
      }
    }
  }, [indeterminate])

  return (
    <CheckboxPrimitive.Root
      ref={combinedRef}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

function useCombinedRefs<T>(...refs: Array<React.Ref<T> | null | undefined>): React.RefCallback<T> {
  return React.useCallback((element: T) => {
    refs.forEach((ref) => {
      if (!ref) return

      if (typeof ref === 'function') {
        ref(element)
      } else {
        try {
          (ref as React.MutableRefObject<T>).current = element
        } catch (error) {
          console.error(error)
        }
      }
    })
  }, [refs])
}

export { Checkbox }