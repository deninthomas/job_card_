import { z } from "zod";
import { labourEntrySchema, materialEntrySchema } from "./workOrder";

// Additional Charge Schema
export const additionalChargeSchema = z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.number().min(0, "Amount must be positive"),
});

// Discount Schema
export const discountSchema = z.object({
    description: z.string().min(1, "Description is required"),
    type: z.enum(["percentage", "fixed"], {
        required_error: "Discount type is required",
    }),
    value: z.number().min(0, "Value must be positive"),
    amount: z.number().min(0, "Amount must be positive"),
});

// Main Estimate Schema
export const estimateSchema = z.object({
    work_order_id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid work order ID"),
    estimate_date: z.string().min(1, "Estimate date is required"),
    valid_until: z.string().min(1, "Valid until date is required"),
    estimated_labour: z.array(labourEntrySchema).optional().default([]),
    estimated_materials: z.array(materialEntrySchema).optional().default([]),
    additional_charges: z.array(additionalChargeSchema).optional().default([]),
    discounts: z.array(discountSchema).optional().default([]),
    tax_percentage: z.number().min(0).max(100).optional().default(0),
    tax_amount: z.number().min(0).optional().default(0),
    subtotal: z.number().min(0, "Subtotal must be positive"),
    grand_total: z.number().min(0, "Grand total must be positive"),
    notes: z.string().optional(),
    terms_and_conditions: z.string().optional(),
    status: z.enum(["draft", "sent", "approved", "rejected", "expired"]).optional().default("draft"),
});

// Estimate Update Schema (similar to create but all fields optional except what's being updated)
export const estimateUpdateSchema = z.object({
    estimate_date: z.string().min(1, "Estimate date is required").optional(),
    valid_until: z.string().min(1, "Valid until date is required").optional(),
    estimated_labour: z.array(labourEntrySchema).optional(),
    estimated_materials: z.array(materialEntrySchema).optional(),
    additional_charges: z.array(additionalChargeSchema).optional(),
    discounts: z.array(discountSchema).optional(),
    tax_percentage: z.number().min(0).max(100).optional(),
    tax_amount: z.number().min(0).optional(),
    subtotal: z.number().min(0, "Subtotal must be positive").optional(),
    grand_total: z.number().min(0, "Grand total must be positive").optional(),
    notes: z.string().optional(),
    terms_and_conditions: z.string().optional(),
});

// Estimate Status Update Schema
export const estimateStatusSchema = z.object({
    status: z.enum(["draft", "sent", "approved", "rejected", "expired"], {
        required_error: "Status is required",
    }),
});

