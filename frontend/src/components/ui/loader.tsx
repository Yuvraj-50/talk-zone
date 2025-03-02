import React from "react";
import { cn } from "@/lib/utils";

type LoaderSize = "sm" | "md" | "lg";
type LoaderVariant = "default" | "primary" | "secondary" | "destructive";

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = "md",
  variant = "primary",
  className = "",
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  const variantClasses = {
    default:
      "border-t-transparent border-l-transparent border-r-transparent border-b-muted-foreground",
    primary:
      "border-t-transparent border-l-transparent border-r-transparent border-b-primary",
    secondary:
      "border-t-transparent border-l-transparent border-r-transparent border-b-secondary-foreground",
    destructive:
      "border-t-transparent border-l-transparent border-r-transparent border-b-destructive",
  };

  const spinnerClasses = cn(
    "rounded-full animate-spin",
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  const wrapperClasses = cn(
    "flex flex-col items-center justify-center",
    fullScreen ? "fixed inset-0 z-50" : "relative"
  );

  return (
    <div className={wrapperClasses}>
      <div className={spinnerClasses}></div>
      {text && (
        <p className="mt-3 text-sm font-medium text-foreground">{text}</p>
      )}
    </div>
  );
};

export default Loader;
