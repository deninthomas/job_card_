"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UseFormRegisterReturn, FieldError, useFormContext } from "react-hook-form";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormDatePickerProps extends Omit<React.ComponentProps<"input">, "type"> {
  label: string;
  register?: UseFormRegisterReturn;
  error?: FieldError;
  id?: string;
}

export function FormDatePicker({
  label,
  register,
  error,
  id,
  className,
  ...props
}: FormDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const form = useFormContext();
  const fieldName = register?.name || props.name || "";
  const value = form?.watch(fieldName) || "";

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const fieldId = id || fieldName || label.toLowerCase().replace(/\s+/g, "-");

  // Sync with form value changes
  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    } else {
      setSelectedDate(undefined);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dateString = date.toISOString().split("T")[0];
      // Update react-hook-form
      if (form && fieldName) {
        form.setValue(fieldName, dateString, { shouldValidate: true, shouldDirty: true });
        console.log(`Date saved for ${fieldName}:`, dateString);
      }
      setOpen(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const displayValue = selectedDate ? formatDate(selectedDate) : "";

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => !props.disabled && setOpen(true)}
          disabled={props.disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !displayValue && "text-muted-foreground",
            error && "border-red-500",
            "border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            className
          )}
          aria-invalid={error ? "true" : "false"}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {displayValue || <span>Pick a date</span>}
        </Button>
        {/* Hidden input for form submission */}
        <input
          type="hidden"
          {...(register || {})}
          value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error.message}</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Select Date</DialogTitle>
          </DialogHeader>
          <Calendar
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
