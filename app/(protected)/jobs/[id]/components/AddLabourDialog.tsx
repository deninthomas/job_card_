"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { FormField } from "@/components/form/FormField";
import { FormDatePicker } from "@/components/form/FormDatePicker";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { labourEntrySchema } from "@/lib/validations/workOrder";
import { z } from "zod";
import { User, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type LabourEntryFormData = z.infer<typeof labourEntrySchema>;

interface Employee {
  _id: string;
  first_name: string;
  last_name: string;
  minimum_wage: number;
}

interface AddLabourDialogProps {
  open: boolean;
  onClose: () => void;
  workOrderId: string;
  onSuccess: () => void;
}

export function AddLabourDialog({
  open,
  onClose,
  workOrderId,
  onSuccess,
}: AddLabourDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const form = useForm<LabourEntryFormData>({
    resolver: zodResolver(labourEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      hours: 1,
      employee_id: "",
      cost_per_hour: 0,
      total_cost: 0,
    },
  });

  const { register, watch, setValue, formState: { errors } } = form;

  const hours = watch("hours");
  const costPerHour = watch("cost_per_hour");

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data.data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  // Auto-calculate total cost
  useEffect(() => {
    const total = hours * costPerHour;
    setValue("total_cost", total);
  }, [hours, costPerHour, setValue]);

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setValue("employee_id", employee._id);
    setValue("cost_per_hour", employee.minimum_wage);
    setEmployeeOpen(false);
  };

  const handleSubmit = async (data: LabourEntryFormData) => {
    try {
      setIsSubmitting(true);

      console.log("Submitting labour entry:", data);

      const response = await fetch(`/api/work-order/${workOrderId}/labour`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Labour entry response:", result);

      if (!response.ok) {
        console.error("Labour entry error:", result);
        throw new Error(JSON.stringify(result.error) || "Failed to add labour entry");
      }

      alert("Labour entry added successfully!");
      form.reset();
      setSelectedEmployee(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding labour entry:", error);
      alert(error.message || "Failed to add labour entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Labour Entry</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormDatePicker
                label="Date"
                {...register("date")}
                error={errors.date}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-between",
                    !selectedEmployee && "text-muted-foreground"
                  )}
                  onClick={() => setEmployeeOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      {selectedEmployee
                        ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                        : "Select employee..."}
                    </span>
                  </div>
                </Button>
                {selectedEmployee && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                    <DollarSign className="h-3 w-3" />
                    <span>Minimum Wage: ₹{selectedEmployee.minimum_wage.toFixed(2)}/hr</span>
                  </div>
                )}
                {errors.employee_id && (
                  <p className="text-sm text-red-500">{errors.employee_id.message}</p>
                )}
              </div>
            </div>

            <FormField
              label="Description"
              {...register("description")}
              error={errors.description}
              placeholder="Enter work description"
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Hours"
                type="number"
                step="0.5"
                {...register("hours", { valueAsNumber: true })}
                error={errors.hours}
              />
              <FormField
                label="Cost per Hour (₹)"
                type="number"
                step="0.01"
                {...register("cost_per_hour", { valueAsNumber: true })}
                error={errors.cost_per_hour}
              />
              <FormField
                label="Total Cost (₹)"
                type="number"
                step="0.01"
                {...register("total_cost", { valueAsNumber: true })}
                error={errors.total_cost}
                disabled
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Labour Entry"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>

        <CommandDialog open={employeeOpen} onOpenChange={setEmployeeOpen}>
          <CommandInput placeholder="Search employees..." />
          <CommandList>
            <CommandEmpty>No employees found.</CommandEmpty>
            <CommandGroup>
              {employees.map((employee) => (
                <CommandItem
                  key={employee._id}
                  onSelect={() => handleEmployeeSelect(employee)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {employee.first_name} {employee.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ₹{employee.minimum_wage}/hr
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </DialogContent>
    </Dialog>
  );
}

