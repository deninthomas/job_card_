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
import { FormField } from "@/components/form/FormField";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { materialEntrySchema } from "@/lib/validations/workOrder";
import { z } from "zod";

type MaterialEntryFormData = z.infer<typeof materialEntrySchema>;

interface AddMaterialDialogProps {
  open: boolean;
  onClose: () => void;
  workOrderId: string;
  onSuccess: () => void;
}

export function AddMaterialDialog({
  open,
  onClose,
  workOrderId,
  onSuccess,
}: AddMaterialDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MaterialEntryFormData>({
    resolver: zodResolver(materialEntrySchema),
    defaultValues: {
      description: "",
      quantity: 1,
      unit: "",
      unit_price: 0,
      amount: 0,
      supplier: "",
    },
  });

  const { register, watch, setValue, formState: { errors } } = form;

  const quantity = watch("quantity");
  const unitPrice = watch("unit_price");

  // Auto-calculate amount
  useEffect(() => {
    const total = quantity * unitPrice;
    setValue("amount", total);
  }, [quantity, unitPrice, setValue]);

  const handleSubmit = async (data: MaterialEntryFormData) => {
    try {
      setIsSubmitting(true);

      console.log("Submitting material entry:", data);

      const response = await fetch(`/api/work-order/${workOrderId}/material`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Material entry response:", result);

      if (!response.ok) {
        console.error("Material entry error:", result);
        throw new Error(JSON.stringify(result.error) || "Failed to add material entry");
      }

      alert("Material entry added successfully!");
      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding material entry:", error);
      alert(error.message || "Failed to add material entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Material Entry</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              label="Description"
              {...register("description")}
              error={errors.description}
              placeholder="Enter material description"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Quantity"
                type="number"
                step="0.01"
                {...register("quantity", { valueAsNumber: true })}
                error={errors.quantity}
              />
              <FormField
                label="Unit"
                {...register("unit")}
                error={errors.unit}
                placeholder="e.g., kg, pieces, meters"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Unit Price (₹)"
                type="number"
                step="0.01"
                {...register("unit_price", { valueAsNumber: true })}
                error={errors.unit_price}
              />
              <FormField
                label="Total Amount (₹)"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                error={errors.amount}
                disabled
              />
            </div>

            <FormField
              label="Supplier (Optional)"
              {...register("supplier")}
              error={errors.supplier}
              placeholder="Enter supplier name"
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Material Entry"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

