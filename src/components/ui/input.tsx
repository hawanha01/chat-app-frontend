import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  className?: string;
  errorKeys?: string[]; // An optional array of error keys to check against errorBag
  renderErrors?: boolean; // Optional function to decide whether to render errors for a particular key
  label?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, errorKeys, renderErrors, label, type, ...props }, ref) => {
    const [focus, setFocus] = React.useState<boolean>(true);

    const handleFocus = () => {
      setFocus(false);
    };
    const handleBlur = () => {
      setFocus(true);
    };

    return (
      <div className="relative">
        <label
          className={`absolute left-[13px] top-[18px] z-0 text-sm transition-all duration-200 ease-in-out ${
            props.value || !focus
              ? "left-[12px] top-[7px] !text-[8px] leading-3 text-[#A2A2A2] "
              : ""
          }`}
        >
          {label}
        </label>
        <input
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          type={type}
          className={cn(
            `relative z-10 flex h-[57px] w-full rounded-lg rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
