"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormTextareaProps extends React.ComponentProps<"textarea"> {
  label: string;
  register?: UseFormRegisterReturn;
  error?: FieldError;
  id?: string;
}

export function FormTextarea({
  label,
  register,
  error,
  id,
  className,
  ...props
}: FormTextareaProps) {
  const fieldId = id || register?.name || props.name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <textarea
        id={fieldId}
        {...register}
        {...props}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500" : "",
          className
        )}
        aria-invalid={error ? "true" : "false"}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}

