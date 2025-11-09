"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { workOrderSchema } from "@/lib/validations/workOrder";
import { z } from "zod";

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface ReviewAndSubmitStepProps {
  form: UseFormReturn<WorkOrderFormData>;
}

export default function ReviewAndSubmitStep({ form }: ReviewAndSubmitStepProps) {
  const formData = form.watch();

  const totalLabourHours =
    formData.labour_entry?.reduce((sum, entry) => sum + entry.hours, 0) || 0;
  const totalLabourCost =
    formData.labour_entry?.reduce((sum, entry) => sum + entry.total_cost, 0) ||
    0;
  const totalMaterialCost =
    formData.material_entry?.reduce((sum, entry) => sum + entry.amount, 0) ||
    0;
  const grandTotal = totalLabourCost + totalMaterialCost;

  return (
    <div className="space-y-4 overflow-y-auto max-h-[600px]">
      <h3 className="text-lg font-medium mb-4">Review Work Order</h3>

      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Order Number:</span>{" "}
              {formData.order_number || "-"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Name:</span>{" "}
              {formData.client?.name || "-"}
            </div>
            <div>
              <span className="font-medium">Code:</span>{" "}
              {formData.client?.code || "-"}
            </div>
            <div>
              <span className="font-medium">Phone:</span>{" "}
              {formData.client?.contact_info?.phone || "-"}
            </div>
            <div>
              <span className="font-medium">Email:</span>{" "}
              {formData.client?.contact_info?.email || "-"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      {(formData.order_detail?.order_date ||
        formData.order_detail?.job_start_date ||
        formData.order_detail?.date_promised) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {formData.order_detail?.order_date && (
                <div>
                  <span className="font-medium">Order Date:</span>{" "}
                  {formData.order_detail.order_date}
                </div>
              )}
              {formData.order_detail?.order_time && (
                <div>
                  <span className="font-medium">Order Time:</span>{" "}
                  {formData.order_detail.order_time}
                </div>
              )}
              {formData.order_detail?.job_start_date && (
                <div>
                  <span className="font-medium">Job Start Date:</span>{" "}
                  {formData.order_detail.job_start_date}
                </div>
              )}
              {formData.order_detail?.date_promised && (
                <div>
                  <span className="font-medium">Date Promised:</span>{" "}
                  {formData.order_detail.date_promised}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Information */}
      {(formData.job_info?.type ||
        formData.job_info?.priority ||
        formData.job_info?.description) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {formData.job_info?.type && (
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {formData.job_info.type}
                </div>
              )}
              {formData.job_info?.priority && (
                <div>
                  <span className="font-medium">Priority:</span>{" "}
                  {formData.job_info.priority}
                </div>
              )}
              {formData.job_info?.description && (
                <div className="col-span-2">
                  <span className="font-medium">Description:</span>{" "}
                  {formData.job_info.description}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Labour Entries */}
      {formData.labour_entry && formData.labour_entry.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Labour Entries ({formData.labour_entry.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {formData.labour_entry.map((entry, index) => (
                <div
                  key={index}
                  className="border rounded p-2 bg-gray-50"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Date:</span> {entry.date}
                    </div>
                    <div>
                      <span className="font-medium">Hours:</span> {entry.hours}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Description:</span>{" "}
                      {entry.description}
                    </div>
                    <div>
                      <span className="font-medium">Cost/Hour:</span> ₹
                      {entry.cost_per_hour}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> ₹
                      {entry.total_cost.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Labour Hours:</span>
                  <span>{totalLabourHours.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Labour Cost:</span>
                  <span>₹{totalLabourCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Material Entries */}
      {formData.material_entry && formData.material_entry.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Material Entries ({formData.material_entry.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {formData.material_entry.map((entry, index) => (
                <div
                  key={index}
                  className="border rounded p-2 bg-gray-50"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <span className="font-medium">Description:</span>{" "}
                      {entry.description}
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span>{" "}
                      {entry.quantity} {entry.unit}
                    </div>
                    <div>
                      <span className="font-medium">Unit Price:</span> ₹
                      {entry.unit_price}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span> ₹
                      {entry.amount.toFixed(2)}
                    </div>
                    {entry.supplier && (
                      <div>
                        <span className="font-medium">Supplier:</span>{" "}
                        {entry.supplier}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Material Cost:</span>
                  <span>₹{totalMaterialCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Labour Cost:</span>
            <span className="font-medium">₹{totalLabourCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Material Cost:</span>
            <span className="font-medium">₹{totalMaterialCost.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
            <span>Grand Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
