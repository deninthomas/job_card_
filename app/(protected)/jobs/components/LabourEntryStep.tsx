"use client";

import React, { useState, useEffect } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "@/components/form/FormField";
import { FormDatePicker } from "@/components/form/FormDatePicker";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, X, Plus, Edit2, Trash2, Clock, DollarSign, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { workOrderSchema } from "@/lib/validations/workOrder";
import { z } from "zod";

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface LabourEntryStepProps {
  form: UseFormReturn<WorkOrderFormData>;
}

interface Employee {
  _id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  minimum_wage: number;
}

export default function LabourEntryStep({ form }: LabourEntryStepProps) {
  const [open, setOpen] = useState(false);
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "labour_entry",
  });

  const { watch, setValue, formState } = form;
  const { errors } = formState;

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data.data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAddEntry = () => {
    const newIndex = fields.length;
    append({
      date: "",
      description: "",
      employee_id: "",
      hours: 0,
      cost_per_hour: 0,
      total_cost: 0,
    });
    setEditingIndex(newIndex);
    setSelectedEmployeeId("");
    setOpen(true);
  };

  const handleEditEntry = (index: number) => {
    setEditingIndex(index);
    const entry = watch(`labour_entry.${index}`);
    setSelectedEmployeeId(entry?.employee_id || "");
    setOpen(true);
  };

  const handleSaveEntry = () => {
    if (editingIndex === null) return;
    
    const entry = watch(`labour_entry.${editingIndex}`);
    if (entry && entry.hours && entry.cost_per_hour) {
      const totalCost = entry.hours * entry.cost_per_hour;
      setValue(`labour_entry.${editingIndex}.total_cost`, totalCost);
    }
    setOpen(false);
    setEditingIndex(null);
    setSelectedEmployeeId("");
  };

  const handleCancel = () => {
    if (editingIndex !== null && editingIndex >= fields.length - 1) {
      // If we're editing a newly added entry, remove it
      remove(editingIndex);
    }
    setOpen(false);
    setEditingIndex(null);
    setSelectedEmployeeId("");
  };

  const total = fields.reduce((sum, _, index) => {
    const entry = watch(`labour_entry.${index}`);
    return sum + (entry?.total_cost || 0);
  }, 0);

  const selectedEmployee = employees.find((e) => e._id === selectedEmployeeId);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Labour Entries</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add and manage labour entries for this work order
          </p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          if (!isOpen) handleCancel();
          else setOpen(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddEntry} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Labour Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingIndex !== null && editingIndex < fields.length
                  ? "Edit Labour Entry"
                  : "Add Labour Entry"}
              </DialogTitle>
            </DialogHeader>

            {editingIndex !== null && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <FormDatePicker
                    label="Date"
                    {...form.register(`labour_entry.${editingIndex}.date`)}
                    error={errors.labour_entry?.[editingIndex]?.date}
                  />
                </div>

                <FormField
                  label="Description"
                  {...form.register(
                    `labour_entry.${editingIndex}.description`
                  )}
                  error={errors.labour_entry?.[editingIndex]?.description}
                  placeholder="Enter work description"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee</label>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between h-11",
                      !selectedEmployeeId && "text-muted-foreground"
                    )}
                    onClick={() => setEmployeeOpen(true)}
                    type="button"
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
                  <CommandDialog
                    open={employeeOpen}
                    onOpenChange={setEmployeeOpen}
                  >
                    <CommandInput placeholder="Search employee..." />
                    <CommandList>
                      <CommandEmpty>No employee found.</CommandEmpty>
                      <CommandGroup>
                        {employees.map((employee) => (
                          <CommandItem
                            key={employee._id}
                            onSelect={() => {
                              setSelectedEmployeeId(employee._id);
                              form.setValue(
                                `labour_entry.${editingIndex}.employee_id`,
                                employee._id
                              );
                              // Prefill hours to 1 and cost_per_hour to minimum_wage
                              form.setValue(
                                `labour_entry.${editingIndex}.hours`,
                                1,
                                { shouldValidate: true }
                              );
                              form.setValue(
                                `labour_entry.${editingIndex}.cost_per_hour`,
                                employee.minimum_wage,
                                { shouldValidate: true }
                              );
                              // Auto-calculate total
                              form.setValue(
                                `labour_entry.${editingIndex}.total_cost`,
                                1 * employee.minimum_wage,
                                { shouldValidate: true }
                              );
                              setEmployeeOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                employee._id === selectedEmployeeId
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col flex-1">
                              <span className="font-medium">
                                {employee.first_name} {employee.last_name}
                              </span>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>ID: {employee.employee_id}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ₹{employee.minimum_wage.toFixed(2)}/hr
                                </span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </CommandDialog>
                  {errors.labour_entry?.[editingIndex]?.employee_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {
                        errors.labour_entry[editingIndex]?.employee_id
                          ?.message
                      }
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Hours"
                    type="number"
                    step="0.1"
                    {...form.register(
                      `labour_entry.${editingIndex}.hours`,
                      {
                        valueAsNumber: true,
                        onChange: (e) => {
                          const hours = parseFloat(e.target.value) || 0;
                          const costPerHour =
                            watch(
                              `labour_entry.${editingIndex}.cost_per_hour`
                            ) || 0;
                          form.setValue(
                            `labour_entry.${editingIndex}.total_cost`,
                            hours * costPerHour
                          );
                        },
                      }
                    )}
                    error={errors.labour_entry?.[editingIndex]?.hours}
                    placeholder="0.0"
                  />
                  <FormField
                    label="Cost / Hour"
                    type="number"
                    step="0.01"
                    {...form.register(
                      `labour_entry.${editingIndex}.cost_per_hour`,
                      {
                        valueAsNumber: true,
                        onChange: (e) => {
                          const costPerHour = parseFloat(e.target.value) || 0;
                          const hours =
                            watch(`labour_entry.${editingIndex}.hours`) || 0;
                          form.setValue(
                            `labour_entry.${editingIndex}.total_cost`,
                            hours * costPerHour
                          );
                        },
                      }
                    )}
                    error={
                      errors.labour_entry?.[editingIndex]?.cost_per_hour
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg border">
                  <FormField
                    label="Total Cost"
                    type="number"
                    {...form.register(
                      `labour_entry.${editingIndex}.total_cost`,
                      { valueAsNumber: true }
                    )}
                    readOnly
                    error={
                      errors.labour_entry?.[editingIndex]?.total_cost
                    }
                    className="bg-background"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSaveEntry} type="button">
                {editingIndex !== null && editingIndex < fields.length ? "Update" : "Add"} Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <Card className="border-dashed py-4">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold mb-2">No labour entries</h4>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
              Get started by adding your first labour entry. Click the button above to begin.
            </p>
            <Button onClick={handleAddEntry} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="grid gap-2">
            {fields.map((field, index) => {
              const entry = watch(`labour_entry.${index}`);
              const employee = employees.find(
                (e) => e._id === entry?.employee_id
              );
              return (
                <Card
                  key={field.id}
                  className="transition-all hover:shadow-md border-l-4 border-l-primary py-4"
                >
                    <CardContent className="p-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-base">
                                  {employee
                                    ? `${employee.first_name} ${employee.last_name}`
                                    : entry?.employee_id || "Unknown Employee"}
                                </span>
                              </div>
                              {entry?.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {entry.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                ₹{(entry?.total_cost || 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(entry?.date || "")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{entry?.hours || 0} hours</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5" />
                              <span>₹{entry?.cost_per_hour || 0}/hr</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEntry(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => remove(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                </Card>
              );
            })}
          </div>

          {fields.length > 0 && (
            <Card className="bg-primary/5 border-primary/20 py-4">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Total Labour Cost
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      ₹{total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fields.length} {fields.length === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-4">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
