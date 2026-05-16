import * as React from "react"
export const Switch = React.forwardRef<HTMLInputElement, any>(({ className, ...props }, ref) => (
  <input type="checkbox" role="switch" ref={ref} className={className} {...props} />
))
Switch.displayName = "Switch"
