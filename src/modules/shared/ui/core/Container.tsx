import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/modules/shared/utils/cn";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div className={cn("container mx-auto", className)} {...props}>
      {children}
    </div>
  );
}
