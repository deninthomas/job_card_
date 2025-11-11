import { z } from "zod";

export const clientSchema = z.object({
    name: z.string().min(1, "Client name is required"),
    code: z.string().min(1, "Client code is required"),
    contact_info: z.object({
        phone: z.string().optional(),
        email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
    }),
});

// ✅ Labour Entry
export const labourEntrySchema = z.object({
    date: z.string().min(1, "Date is required"),
    description: z.string().min(1, "Description is required"),
    hours: z.number().min(0, "Hours must be positive"),
    employee_id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid employee ID"), // Mongo ObjectId
    cost_per_hour: z.number().min(0, "Cost per hour must be positive"),
    total_cost: z.number().min(0, "Total cost must be positive"),
});

// ✅ Material Entry
export const materialEntrySchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    unit_price: z.number().min(0, "Unit price must be positive"),
    amount: z.number().min(0, "Amount must be positive"),
    supplier: z.string().optional(),
    diamentions: z.string().optional(),
});

// ✅ Order Detail
export const orderDetailSchema = z.object({
    received_by: z.string().optional(),
    order_date: z.string().optional(),
    order_time: z.string().optional(),
    job_start_date: z.string().optional(),
    date_promised: z.string().optional(),
    date_delivered: z.string().optional(),
});

// ✅ Job Info
export const jobInfoSchema = z.object({
    priority: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
});

// ✅ Approval
export const approvalSchema = z.object({
    checked_by: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID").optional(),
    approved_date: z.string().optional(),
    delivered_on_time: z.boolean().optional(),
    remarks: z.string().optional(),
    customer_signature: z.string().optional(),
});

// ✅ Total
export const totalSchema = z.object({
    total_labour_hours: z.number().optional(),
    total_labour_cost: z.number().optional(),
    total_material_cost: z.number().optional(),
    grand_total: z.number().optional(),
});


export const documentSchema = z.object({
    id: z.string().uuid(),
    file_name: z.string().min(1, "Filename is required"),
    file_type: z.string(),
    s3_path: z.string().min(1, "S3 path is required"),
});

// ---- Main Schema ----
export const workOrderSchema = z.object({
    order_number: z.string().min(1, "Order number is required"),
    client: clientSchema,
    labour_entry: z.array(labourEntrySchema).optional(),
    material_entry: z.array(materialEntrySchema).optional(),
    order_detail: orderDetailSchema.optional(),
    job_info: jobInfoSchema.optional(),
    approval: approvalSchema.optional(),
    documents: z.array(documentSchema).optional(),
    total: totalSchema.optional(),
});

