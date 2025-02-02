import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        outlined: "border bg-transparent ",
        filled: "text-white",
      },
      size: {
        default: "text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
        extraSmall: "px-[15px] py-[10px] text-xs",
        small: "px-[20px] py-[7px] text-sm",
        medium: "px-4 py-2 text-base",
        large: "h-[60px] w-full px-6 text-base",
      },
      buttonColor: {
        black: {
          outlined: "border-black-200 text-[#000] hover:opacity-75",
          filled: "bg-black-200 text-white hover:bg-primary/90",
        },
        red: {
          outlined: "border border-red-600 bg-transparent text-red-600",
          filled: "bg-red-600 text-white",
        },
        grey: {
          outlined: "border border-[#EBEBEB] bg-transparent text-[#7F7F7F]",
          filled: "bg-[#EBEBEB] text-[#7F7F7F]",
        },
        transparent: {
          outlined: "",
          filled: "bg-transparent text-[#7F7F7F]",
        },
      },
    },
    compoundVariants: [
      {
        variant: "outlined",
        buttonColor: "black",
        class: "border-black-200 text-[#000] hover:opacity-50",
      },
      {
        variant: "filled",
        buttonColor: "black",
        class: "bg-black-200 text-white hover:bg-primary/90",
      },
      {
        variant: "outlined",
        buttonColor: "red",
        class: "border-red-600 text-red-600",
      },
      {
        variant: "filled",
        buttonColor: "red",
        class: "bg-red-600 text-white hover:bg-red-100",
      },
      {
        variant: "outlined",
        buttonColor: "grey",
        class: "border-[#EBEBEB] text-[#7F7F7F]",
      },
      {
        variant: "filled",
        buttonColor: "grey",
        class: "bg-[#EBEBEB] text-[#7F7F7F] hover:bg-[#d9d9d9]",
      },
      {
        variant: "filled",
        buttonColor: "transparent",
        class: "bg-transparent text-[#7F7F7F]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "small",
      buttonColor: "black",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loaderSize?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      buttonColor,
      size,
      asChild = false,
      isLoading = false,
      loaderSize,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        disabled={isLoading || props.disabled}
        className={cn(
          buttonVariants({ variant, size, buttonColor, className })
        )}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={`${loaderSize} animate-spin text-muted`} />
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
