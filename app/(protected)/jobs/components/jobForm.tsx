"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workOrderSchema } from "@/lib/validations/workOrder";
import { z } from "zod";
import ClientAndOrderDetailsStep from "./ClientAndOrderDetailsStep";
import LabourEntryStep from "./LabourEntryStep";
import MaterialEntryStep from "./MaterialEntryStep";
import ReviewAndSubmitStep from "./ReviewAndSubmitStep";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "./DocumentUpload";

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
  onSubmit?: (data: WorkOrderFormData) => Promise<void>;
  onSuccess?: () => void;
}

export default function WorkOrderForm({
  onSubmit,
  onSuccess,
}: WorkOrderFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      order_number: "WO-" + Date.now(),
      client: {
        name: "Test Client Inc.",
        code: "TC-001",
        contact_info: {
          phone: "+1234567890",
          email: "test@client.com",
        },
      },
      order_detail: {
        received_by: "John Doe",
        order_date: new Date().toISOString().split("T")[0],
        order_time: "09:00",
        job_start_date: new Date().toISOString().split("T")[0],
        date_promised: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        date_delivered: "",
      },
      job_info: {
        priority: "medium",
        type: "Maintenance",
        description: "Test work order for development purposes",
        status: "pending",
      },
      labour_entry: [],
      material_entry: [],
      documents: [],
    },
    mode: "onChange",
  });

  const { trigger, formState } = form;

  const validateStep = async (stepNumber: number): Promise<boolean> => {
    let fieldsToValidate: (keyof WorkOrderFormData)[] = [];

    switch (stepNumber) {
      case 1:
        fieldsToValidate = [
          "order_number",
          "client",
          "order_detail",
          "job_info",
        ];
        break;
      case 2:
        // Labour entry is optional, so we don't validate it here
        return true;
      case 3:
        // Material entry is optional, so we don't validate it here
        return true;
      case 4:
        // Review step - validate all
        return true;
      case 5:
        return await trigger();
      default:
        return true;
    }

    if (fieldsToValidate.length > 0) {
      return await trigger(fieldsToValidate);
    }
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (data: WorkOrderFormData) => {
    try {
      setIsSubmitting(true);

      console.log("Submitting form data:", data);

      // Calculate totals
      const total_labour_hours =
        data.labour_entry?.reduce((sum, entry) => sum + entry.hours, 0) || 0;

      const total_labour_cost =
        data.labour_entry?.reduce((sum, entry) => sum + entry.total_cost, 0) ||
        0;

      const total_material_cost =
        data.material_entry?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

      const grand_total = total_labour_cost + total_material_cost;

      const submitData = {
        ...data,
        total: {
          total_labour_hours,
          total_labour_cost,
          total_material_cost,
          grand_total,
        },
      };

      console.log("Submit data with totals:", submitData);

      if (onSubmit) {
        await onSubmit(submitData);
      } else {
        const response = await fetch("/api/work-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("API Error:", error);
          throw new Error(
            JSON.stringify(error.error) || "Failed to create work order"
          );
        }

        const result = await response.json();
        console.log("Success:", result);
      }

      alert("Work order created successfully!");
      form.reset();
      setStep(1);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert(error.message || "Failed to create work order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="w-full">
          {/* Step indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4,5].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= stepNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {stepNum}
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {stepNum === 1 && "Client & Order"}
                      {stepNum === 2 && "Labour"}
                      {stepNum === 3 && "Materials"}
                      {stepNum === 4 && "Documents"}
                      {stepNum === 5 && "Review"}
                    </span>
                  </div>
                  {stepNum < 5 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > stepNum ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="min-h-[400px] pb-24">
            {step === 1 && <ClientAndOrderDetailsStep form={form} />}
            {step === 2 && <LabourEntryStep form={form} />}
            {step === 3 && <MaterialEntryStep form={form} />}
            {step === 4 && <DocumentUpload form={form} />}
            {step === 5 && <ReviewAndSubmitStep form={form} />}
          </div>

          <div className="sticky bottom-0 bg-background border-t pt-4 pb-6 mt-8 -mx-6 px-6 flex justify-between gap-4 z-10 shadow-lg">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}
            {step < 5? (
              <Button
                type="button"
                onClick={nextStep}
                className="min-w-[100px]"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[100px]"
                onClick={() => {
                  console.log("Submit button clicked");
                  console.log("Form errors:", formState.errors);
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
