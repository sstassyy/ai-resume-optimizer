import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-black/30 focus:border-brand-mint focus:outline-none focus:ring-2 focus:ring-brand-mint/30 ${className}`}
        {...props}
      />
    );
  }
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-brand-dark placeholder:text-black/30 focus:border-brand-mint focus:outline-none focus:ring-2 focus:ring-brand-mint/30 ${className}`}
      {...props}
    />
  );
});

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-brand-dark">
      {children}
    </label>
  );
}
