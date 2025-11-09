"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface EmployeeFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
  employee?: Employee | null;
  onClose?: () => void;
}

const formSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  minimum_wage: z.number().min(0, "Minimum wage must be positive"),
  status: z.enum(["active", "inactive"]),
});

type FormData = z.infer<typeof formSchema>;

export function EmployeeForm({
  open,
  setOpen,
  onSuccess,
  employee,
  onClose,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      minimum_wage: 0,
      status: "active",
    },
  });

  useEffect(() => {
    if (employee) {
      setValue("employee_id", employee.employee_id);
      setValue("first_name", employee.first_name);
      setValue("last_name", employee.last_name);
      setValue("email", employee.email);
      setValue("phone", employee.phone || "");
      setValue("minimum_wage", employee.minimum_wage);
      setValue("status", employee.status as "active" | "inactive");
    } else {
      reset({
        employee_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        minimum_wage: 0,
        status: "active",
      });
    }
  }, [employee, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const url = employee
        ? `/api/employees/${employee._id}`
        : "/api/employees";
      const method = employee ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save employee");
      }

      reset();
      setOpen(false);
      onClose && onClose();
      onSuccess && onSuccess();
    } catch (err: any) {
      console.error("Error saving employee:", err);
      alert(err.message || "Failed to save employee");
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose && onClose();
    reset();
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
      <Button variant="outline">
        <Plus /> Add Employee
      </Button>
    </DrawerTrigger>
      <DrawerContent className="min-w-lg">
        <div className="mx-auto w-full max-w-lg min-w-lg">
          <DrawerHeader className="shadow">
            <div>
              <DrawerTitle>
                {employee ? "Edit Employee" : "Add Employee"}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" className="absolute top-4 right-4">
                  <X />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription>
              {employee
                ? "Update employee information"
                : "Add a new employee to the system"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  {...register("employee_id")}
                  placeholder="Enter employee ID"
                  disabled={!!employee}
                />
                {errors.employee_id && (
                  <p className="text-sm text-red-500">
                    {errors.employee_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("first_name")}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("last_name")}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">
                    {errors.last_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_wage">Minimum Wage</Label>
                <Input
                  id="minimum_wage"
                  type="number"
                  step="0.01"
                  {...register("minimum_wage", { valueAsNumber: true })}
                  placeholder="Enter minimum wage"
                />
                {errors.minimum_wage && (
                  <p className="text-sm text-red-500">
                    {errors.minimum_wage.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue("status", value as "active" | "inactive")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <DrawerFooter className="flex flex-row justify-end absolute bottom-0 right-0 space-x-2 w-full px-4 pb-4 shadow border-t-2">
                <DrawerClose asChild>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </DrawerClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : employee ? "Update" : "Submit"}
                </Button>
              </DrawerFooter>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

