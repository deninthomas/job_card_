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
import { FormDatePicker } from "@/components/form/FormDatePicker";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IWorkOrder, ILabourEntry, IMaterialEntry, IAdditionalCharge, IDiscount } from "@/types";
import { Plus, Trash2, DollarSign, Percent, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Validation schema
const estimateFormSchema = z.object({
  estimate_date: z.string().min(1, "Estimate date is required"),
  valid_until: z.string().min(1, "Valid until date is required"),
  tax_percentage: z.number().min(0).max(100),
  notes: z.string().optional(),
  terms_and_conditions: z.string().optional(),
});

type EstimateFormData = z.infer<typeof estimateFormSchema>;

interface EstimateDialogProps {
  open: boolean;
  onClose: () => void;
  workOrder: IWorkOrder;
  onSuccess: () => void;
}

export function EstimateDialog({
  open,
  onClose,
  workOrder,
  onSuccess,
}: EstimateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labourEntries, setLabourEntries] = useState<ILabourEntry[]>([]);
  const [materialEntries, setMaterialEntries] = useState<IMaterialEntry[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<IAdditionalCharge[]>([]);
  const [discounts, setDiscounts] = useState<IDiscount[]>([]);
  
  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      estimate_date: new Date().toISOString().split("T")[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      tax_percentage: 18,
      notes: "",
      terms_and_conditions: "Payment terms: 50% advance, 50% on completion.\nEstimate valid for 30 days.",
    },
  });

  const { register, formState: { errors } } = form;
  const taxPercentage = form.watch("tax_percentage");

  // Initialize with work order data
  useEffect(() => {
    if (open && workOrder) {
      setLabourEntries(workOrder.labour_entry || []);
      setMaterialEntries(workOrder.material_entry || []);
    }
  }, [open, workOrder]);

  // Calculate financial totals
  const calculateTotals = () => {
    const labourTotal = labourEntries.reduce((sum, entry) => sum + (entry.total_cost || 0), 0);
    const materialTotal = materialEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const chargesTotal = additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    const subtotal = labourTotal + materialTotal + chargesTotal;
    
    const totalDiscount = discounts.reduce((sum, discount) => {
      if (discount.type === "percentage") {
        return sum + (subtotal * discount.value / 100);
      }
      return sum + discount.value;
    }, 0);

    const amountAfterDiscount = subtotal - totalDiscount;
    const taxAmount = (amountAfterDiscount * (taxPercentage || 0)) / 100;
    const grandTotal = amountAfterDiscount + taxAmount;

    return {
      subtotal,
      totalDiscount,
      amountAfterDiscount,
      taxAmount,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  const addAdditionalCharge = () => {
    setAdditionalCharges([...additionalCharges, { description: "", amount: 0 }]);
  };

  const removeAdditionalCharge = (index: number) => {
    setAdditionalCharges(additionalCharges.filter((_, i) => i !== index));
  };

  const updateAdditionalCharge = (index: number, field: keyof IAdditionalCharge, value: any) => {
    const updated = [...additionalCharges];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalCharges(updated);
  };

  const addDiscount = () => {
    setDiscounts([...discounts, { description: "", type: "percentage", value: 0, amount: 0 }]);
  };

  const removeDiscount = (index: number) => {
    setDiscounts(discounts.filter((_, i) => i !== index));
  };

  const updateDiscount = (index: number, field: keyof IDiscount, value: any) => {
    const updated = [...discounts];
    updated[index] = { ...updated[index], [field]: value };
    setDiscounts(updated);
  };

  const handleSubmit = async (data: EstimateFormData) => {
    try {
      setIsSubmitting(true);

      // Calculate discount amounts
      const processedDiscounts = discounts.map(discount => {
        const amount = discount.type === "percentage"
          ? (totals.subtotal * discount.value) / 100
          : discount.value;
        return { ...discount, amount };
      });

      const estimateData = {
        work_order_id: workOrder._id,
        estimate_date: data.estimate_date,
        valid_until: data.valid_until,
        estimated_labour: labourEntries,
        estimated_materials: materialEntries,
        additional_charges: additionalCharges,
        discounts: processedDiscounts,
        tax_percentage: data.tax_percentage,
        tax_amount: totals.taxAmount,
        subtotal: totals.subtotal,
        grand_total: totals.grandTotal,
        notes: data.notes,
        terms_and_conditions: data.terms_and_conditions,
        status: "draft",
      };

      const response = await fetch(`/api/work-order/${workOrder._id}/estimate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(estimateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create estimate");
      }

      alert("Estimate created successfully!");
      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating estimate:", error);
      alert(error.message || "Failed to create estimate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Estimate for {workOrder.order_number}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-3 gap-4">
              <FormDatePicker
                label="Estimate Date"
                {...register("estimate_date")}
                error={errors.estimate_date}
              />
              <FormDatePicker
                label="Valid Until"
                {...register("valid_until")}
                error={errors.valid_until}
              />
              <FormField
                label="Tax Percentage (%)"
                type="number"
                step="0.01"
                {...register("tax_percentage", { valueAsNumber: true })}
                error={errors.tax_percentage}
              />
            </div>

            {/* Labour Entries */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Estimated Labour</h3>
              {labourEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labourEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.hours}</TableCell>
                        <TableCell>₹{entry.cost_per_hour.toFixed(2)}</TableCell>
                        <TableCell>₹{entry.total_cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No labour entries in work order</p>
              )}
            </div>

            {/* Material Entries */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Estimated Materials</h3>
              {materialEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materialEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.quantity}</TableCell>
                        <TableCell>{entry.unit}</TableCell>
                        <TableCell>₹{entry.unit_price.toFixed(2)}</TableCell>
                        <TableCell>₹{entry.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">No material entries in work order</p>
              )}
            </div>

            {/* Additional Charges */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Additional Charges</h3>
                <Button type="button" size="sm" variant="outline" onClick={addAdditionalCharge}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Charge
                </Button>
              </div>
              {additionalCharges.map((charge, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={charge.description}
                    onChange={(e) => updateAdditionalCharge(index, "description", e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={charge.amount}
                    onChange={(e) => updateAdditionalCharge(index, "amount", parseFloat(e.target.value) || 0)}
                    className="w-32 border rounded px-3 py-2"
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeAdditionalCharge(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Discounts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Discounts</h3>
                <Button type="button" size="sm" variant="outline" onClick={addDiscount}>
                  <Minus className="h-4 w-4 mr-2" />
                  Add Discount
                </Button>
              </div>
              {discounts.map((discount, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={discount.description}
                    onChange={(e) => updateDiscount(index, "description", e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                  />
                  <select
                    value={discount.type}
                    onChange={(e) => updateDiscount(index, "type", e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Value"
                    value={discount.value}
                    onChange={(e) => updateDiscount(index, "value", parseFloat(e.target.value) || 0)}
                    className="w-32 border rounded px-3 py-2"
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeDiscount(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-₹{totals.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax ({taxPercentage}%):</span>
                <span className="font-semibold">₹{totals.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid grid-cols-2 gap-4">
              <FormTextarea
                label="Notes"
                rows={3}
                {...register("notes")}
                error={errors.notes}
              />
              <FormTextarea
                label="Terms and Conditions"
                rows={3}
                {...register("terms_and_conditions")}
                error={errors.terms_and_conditions}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Estimate"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

