import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-mint text-white hover:bg-[#3f9a80] disabled:bg-[#9fd2c0]",
  secondary:
    "bg-brand-dark text-white hover:bg-[#25384a] disabled:bg-[#7c8e98]",
  ghost:
    "bg-transparent text-brand-dark border border-brand-dark/20 hover:bg-brand-dark/5",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
