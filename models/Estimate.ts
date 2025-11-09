import mongoose, { Document, models, Schema } from "mongoose";

// Reuse interfaces from WorkOrder for consistency
export interface ILabourEntry {
    date: string;
    description: string;
    hours: number;
    employee_id: Schema.Types.ObjectId;
    cost_per_hour: number;
    total_cost: number;
}

export interface IMaterialEntry {
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    amount: number;
    supplier?: string;
}

export interface IAdditionalCharge {
    description: string;
    amount: number;
}

export interface IDiscount {
    description: string;
    type: "percentage" | "fixed";
    value: number;
    amount: number; // Calculated discount amount
}

export interface IEstimate extends Document {
    work_order_id: Schema.Types.ObjectId;
    estimate_number: string; // Auto-generated: EST-YYYY-MM-XXXXX
    estimate_date: string;
    valid_until: string;
    estimated_labour: ILabourEntry[];
    estimated_materials: IMaterialEntry[];
    additional_charges?: IAdditionalCharge[];
    discounts?: IDiscount[];
    tax_percentage?: number;
    tax_amount?: number;
    subtotal: number;
    grand_total: number;
    notes?: string;
    terms_and_conditions?: string;
    status: "draft" | "sent" | "approved" | "rejected" | "expired";
    approved_by?: Schema.Types.ObjectId;
    approved_at?: string;
    created_by: Schema.Types.ObjectId;
    is_deleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const LabourEntrySchema = new Schema<ILabourEntry>({
    date: { type: String, required: true },
    description: { type: String, required: true },
    hours: { type: Number, required: true },
    employee_id: { type: Schema.Types.ObjectId, required: true, ref: "Employee" },
    cost_per_hour: { type: Number, required: true },
    total_cost: { type: Number, required: true }
});

const MaterialEntrySchema = new Schema<IMaterialEntry>({
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    unit_price: { type: Number, required: true },
    amount: { type: Number, required: true },
    supplier: { type: String }
});

const AdditionalChargeSchema = new Schema<IAdditionalCharge>({
    description: { type: String, required: true },
    amount: { type: Number, required: true }
});

const DiscountSchema = new Schema<IDiscount>({
    description: { type: String, required: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    amount: { type: Number, required: true }
});

const EstimateSchema = new Schema<IEstimate>({
    work_order_id: { type: Schema.Types.ObjectId, ref: "WorkOrder", required: true },
    estimate_number: { type: String, required: true, unique: true },
    estimate_date: { type: String, required: true },
    valid_until: { type: String, required: true },
    estimated_labour: [LabourEntrySchema],
    estimated_materials: [MaterialEntrySchema],
    additional_charges: [AdditionalChargeSchema],
    discounts: [DiscountSchema],
    tax_percentage: { type: Number, default: 0 },
    tax_amount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    grand_total: { type: Number, required: true },
    notes: { type: String },
    terms_and_conditions: { type: String },
    status: { 
        type: String, 
        enum: ["draft", "sent", "approved", "rejected", "expired"],
        default: "draft",
        required: true 
    },
    approved_by: { type: Schema.Types.ObjectId, ref: "User" },
    approved_at: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    is_deleted: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for performance
EstimateSchema.index({ work_order_id: 1 });
EstimateSchema.index({ estimate_number: 1 }, { unique: true });
EstimateSchema.index({ status: 1 });
EstimateSchema.index({ estimate_date: -1 });

export default models.Estimate || mongoose.model<IEstimate>("Estimate", EstimateSchema);

