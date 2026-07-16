import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-mint text-white hover:bg-[#3f9a80] disabled:bg-[#9fd2c0]",
  secondary:
    "bg-brand-dark text-white hover:bg-[#25384a] disabled:bg-[#7c8e98]",
  ghost:
    "bg-transparent text-brand-dark border border-brand-dark/20 hover:bg-brand-dark/5",
  danger:
    "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  md: "min-h-[44px] px-4 py-2.5 text-sm",
  sm: "min-h-[36px] px-3 py-1.5 text-xs",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
