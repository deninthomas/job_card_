"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "react-hook-form";

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: FieldError;
  id?: string;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function FormSelect({
  label,
  value,
  onValueChange,
  error,
  id,
  placeholder = "Select...",
  children,
  disabled,
}: FormSelectProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={fieldId}
          className={error ? "border-red-500" : ""}
          aria-invalid={error ? "true" : "false"}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}

