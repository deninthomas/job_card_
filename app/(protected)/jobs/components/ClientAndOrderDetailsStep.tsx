"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/form/FormField";
import { FormDatePicker } from "@/components/form/FormDatePicker";
import { FormSelect } from "@/components/form/FormSelect";
import { SelectItem } from "@/components/ui/select";
import { workOrderSchema } from "@/lib/validations/workOrder";
import { z } from "zod";

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface ClientAndOrderDetailsStepProps {
  form: UseFormReturn<WorkOrderFormData>;
}

export default function ClientAndOrderDetailsStep({
  form,
}: ClientAndOrderDetailsStepProps) {
  const { register, formState, watch, setValue } = form;
  const { errors } = formState;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Order Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Order Number"
            {...register("order_number")}
            error={errors.order_number}
            placeholder="Enter order number"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Client Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Client Name"
            {...register("client.name")}
            error={errors.client?.name}
            placeholder="Enter client name"
          />
          <FormField
            label="Client Code"
            {...register("client.code")}
            error={errors.client?.code}
            placeholder="Enter client code"
          />
          <FormField
            label="Phone"
            type="tel"
            {...register("client.contact_info.phone")}
            error={errors.client?.contact_info?.phone}
            placeholder="Enter phone number"
          />
          <FormField
            label="Email"
            type="email"
            {...register("client.contact_info.email")}
            error={errors.client?.contact_info?.email}
            placeholder="Enter email address"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Order Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Received By"
            {...register("order_detail.received_by")}
            error={errors.order_detail?.received_by}
            placeholder="Enter user ID"
          />
          <FormDatePicker
            label="Order Date"
            {...register("order_detail.order_date")}
            error={errors.order_detail?.order_date}
          />
          <FormField
            label="Order Time"
            type="time"
            {...register("order_detail.order_time")}
            error={errors.order_detail?.order_time}
          />
          <FormDatePicker
            label="Job Start Date"
            {...register("order_detail.job_start_date")}
            error={errors.order_detail?.job_start_date}
          />
          <FormDatePicker
            label="Date Promised"
            {...register("order_detail.date_promised")}
            error={errors.order_detail?.date_promised}
          />
          <FormDatePicker
            label="Date Delivered"
            {...register("order_detail.date_delivered")}
            error={errors.order_detail?.date_delivered}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Job Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Job Type"
            {...register("job_info.type")}
            error={errors.job_info?.type}
            placeholder="Enter job type"
          />
          <FormSelect
            label="Job Priority"
            value={watch("job_info.priority") || ""}
            onValueChange={(value) => setValue("job_info.priority", value)}
            error={errors.job_info?.priority}
            placeholder="Select priority"
          >
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </FormSelect>
          <div className="col-span-2">
            <FormField
              label="Job Description"
              {...register("job_info.description")}
              error={errors.job_info?.description}
              placeholder="Enter job description"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
