import * as React from "react"
export const Checkbox = React.forwardRef<HTMLInputElement, any>(({ className, ...props }, ref) => (
  <input type="checkbox" ref={ref} className={className} {...props} />
))
Checkbox.displayName = "Checkbox"
