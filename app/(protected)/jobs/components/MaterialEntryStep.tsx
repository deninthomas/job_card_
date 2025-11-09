"use client";

import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/FormField";
import { workOrderSchema } from "@/lib/validations/workOrder";
import { z } from "zod";

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface MaterialEntryStepProps {
  form: UseFormReturn<WorkOrderFormData>;
}

export default function MaterialEntryStep({ form }: MaterialEntryStepProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "material_entry",
  });

  const { watch, setValue, register, formState } = form;
  const { errors } = formState;

  const addEntry = () => {
    append({
      description: "",
      quantity: 0,
      unit: "",
      unit_price: 0,
      amount: 0,
      supplier: "",
    });
  };

  const updateAmount = (index: number) => {
    const quantity = watch(`material_entry.${index}.quantity`) || 0;
    const unitPrice = watch(`material_entry.${index}.unit_price`) || 0;
    const amount = quantity * unitPrice;
    setValue(`material_entry.${index}.amount`, amount);
  };

  const total = fields.reduce((sum, _, index) => {
    const entry = watch(`material_entry.${index}`);
    return sum + (entry?.amount || 0);
  }, 0);

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Material Entries</h3>

      {fields.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-gray-500 bg-gray-50">
          No material entries added yet.
        </div>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border rounded-lg p-4 mb-4 space-y-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Material Entry #{index + 1}</h4>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Description"
              {...register(`material_entry.${index}.description`)}
              error={errors.material_entry?.[index]?.description}
              placeholder="Enter description"
            />
            <FormField
              label="Quantity"
              type="number"
              step="0.01"
              {...register(`material_entry.${index}.quantity`, {
                valueAsNumber: true,
                onChange: () => updateAmount(index),
              })}
              error={errors.material_entry?.[index]?.quantity}
              placeholder="Enter quantity"
            />
            <FormField
              label="Unit"
              {...register(`material_entry.${index}.unit`)}
              error={errors.material_entry?.[index]?.unit}
              placeholder="e.g., kg, m, pcs"
            />
            <FormField
              label="Unit Price"
              type="number"
              step="0.01"
              {...register(`material_entry.${index}.unit_price`, {
                valueAsNumber: true,
                onChange: () => updateAmount(index),
              })}
              error={errors.material_entry?.[index]?.unit_price}
              placeholder="Enter unit price"
            />
            <FormField
              label="Amount"
              type="number"
              step="0.01"
              {...register(`material_entry.${index}.amount`, {
                valueAsNumber: true,
              })}
              readOnly
              error={errors.material_entry?.[index]?.amount}
            />
            <FormField
              label="Supplier"
              {...register(`material_entry.${index}.supplier`)}
              error={errors.material_entry?.[index]?.supplier}
              placeholder="Enter supplier (optional)"
            />
          </div>
        </div>
      ))}

      {fields.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Material Cost:</p>
              <p className="text-xl font-semibold">₹{total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Button onClick={addEntry} variant="outline">
          + Add Material Entry
        </Button>
      </div>
    </div>
  );
}
