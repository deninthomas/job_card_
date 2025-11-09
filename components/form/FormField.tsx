"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
  register?: UseFormRegisterReturn;
  error?: FieldError;
  id?: string;
}

export function FormField({
  label,
  register,
  error,
  id,
  className,
  ...props
}: FormFieldProps) {
  const fieldId = id || register?.name || props.name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        {...register}
        {...props}
        className={error ? "border-red-500" : className}
        aria-invalid={error ? "true" : "false"}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}

